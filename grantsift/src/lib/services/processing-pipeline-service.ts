import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { AppError, type ErrorCode } from "@/lib/errors/app-error";
import { FunderSourceService } from "@/lib/services/funder-source-service";
import { YouTubeDiscoveryService } from "@/lib/youtube/youtube-discovery-service";
import { TranscriptService } from "@/lib/youtube/transcript-service";
import { ExtractionService } from "@/lib/services/extraction-service";
import { SourceRepository } from "@/lib/repositories/source-repository";
import { InsightRepository } from "@/lib/repositories/insight-repository";
import { ProcessingJobRepository } from "@/lib/repositories/processing-job-repository";

type SourceRow = Database["public"]["Tables"]["sources"]["Row"];

// Cost control (PRD §70): cap how many discovered videos are actually
// fetched and sent to Gemini per run, regardless of how many YouTube finds.
const MAX_VIDEOS_PER_RUN = 5;

export function describeError(cause: unknown): { code: ErrorCode; message: string } {
  if (cause instanceof AppError) return { code: cause.code, message: cause.userMessage };
  if (cause instanceof Error) return { code: "PROCESSING_ERROR", message: cause.message };
  return { code: "PROCESSING_ERROR", message: "Unknown error" };
}

export function sourceLabel(source: SourceRow): string {
  switch (source.kind) {
    case "funder_org":
      return `Funder site: ${source.funder_url}`;
    case "youtube_video":
      return `YouTube: "${source.youtube_video_title}" by ${source.youtube_channel_title}`;
    case "user_pasted_text":
      return "Requirements pasted by the user";
    default:
      return "Uploaded document";
  }
}

export class ProcessingPipelineService {
  private readonly sources: SourceRepository;
  private readonly insights: InsightRepository;
  private readonly jobs: ProcessingJobRepository;
  private readonly funderService = new FunderSourceService();
  private readonly youtube = new YouTubeDiscoveryService();
  private readonly transcripts = new TranscriptService();
  private readonly extraction = new ExtractionService();

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.sources = new SourceRepository(supabase);
    this.insights = new InsightRepository(supabase);
    this.jobs = new ProcessingJobRepository(supabase);
  }

  async run(projectId: string): Promise<void> {
    const { data: project, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error || !project) {
      throw new AppError("VALIDATION_ERROR", "Project not found.");
    }

    const funderDisplayName = await this.runFunderStage(project.id, project.grant_funder_url);
    const searchName = funderDisplayName ?? project.grant_funder_name ?? "";
    await this.runVideoDiscoveryStage(project.id, searchName);
    await this.runTranscriptStage(project.id);
    await this.runExtractionStage(project.id);
  }

  /** Fetches the funder's own page and updates the funder_org source with its content. */
  private async runFunderStage(projectId: string, funderUrl: string | null): Promise<string | null> {
    const job = await this.jobs.start(projectId, "source");
    try {
      if (!funderUrl) {
        // Discovery-driven project: no manual funder URL provided
        await this.jobs.finish(job.id, "completed");
        return null;
      }

      const allSources = await this.sources.listForProject(projectId);
      const funderSource = allSources.find((s) => s.kind === "funder_org");
      if (!funderSource) {
        await this.jobs.finish(job.id, "completed");
        return null;
      }

      const profile = await this.funderService.fetchFunderProfile(funderUrl);
      await this.sources.update(funderSource.id, {
        raw_content: profile.rawText,
        funder_name: profile.title,
        status: "completed",
      });

      // Keep the project's display name in sync with what the page actually says.
      await this.supabase.from("projects").update({ grant_funder_name: profile.title }).eq("id", projectId);

      await this.jobs.finish(job.id, "completed");
      return profile.title;
    } catch (cause) {
      await this.jobs.finish(job.id, "failed", describeError(cause));
      return null;
    }
  }

  /** Searches YouTube for grant-winner testimonials and records them as pending sources. */
  private async runVideoDiscoveryStage(projectId: string, funderName: string): Promise<void> {
    const job = await this.jobs.start(projectId, "video");
    try {
      if (!funderName.trim() || funderName === "Auto-Discovered Grants") {
        await this.jobs.finish(job.id, "completed");
        return;
      }

      const found = await this.youtube.findGrantWinnerVideos(funderName, { maxResults: 10 });
      const candidates = found.slice(0, MAX_VIDEOS_PER_RUN);

      const existing = await this.sources.listForProject(projectId);
      const existingVideoIds = new Set(
        existing.filter((s) => s.kind === "youtube_video").map((s) => s.youtube_video_id),
      );
      const fresh = candidates.filter((v) => !existingVideoIds.has(v.videoId));

      const verified: typeof fresh = [];
      for (const video of fresh) {
        if (await this.youtube.verifyVideoIsAccessible(video.videoId)) verified.push(video);
      }

      await this.sources.createMany(
        verified.map((v) => ({
          project_id: projectId,
          kind: "youtube_video" as const,
          trust: "expert_source" as const,
          youtube_video_id: v.videoId,
          youtube_url: v.url,
          youtube_channel_title: v.channelTitle,
          youtube_video_title: v.title,
          status: "pending" as const,
        })),
      );

      await this.jobs.finish(job.id, verified.length > 0 ? "completed" : "partially_completed");
    } catch (cause) {
      await this.jobs.finish(job.id, "failed", describeError(cause));
    }
  }

  /** Retrieves transcripts for every pending YouTube source, gracefully marking unavailable ones. */
  private async runTranscriptStage(projectId: string): Promise<void> {
    const job = await this.jobs.start(projectId, "transcript");
    const pending = (await this.sources.listForProject(projectId)).filter(
      (s) => s.kind === "youtube_video" && s.status === "pending",
    );

    let failures = 0;
    for (const source of pending) {
      try {
        const result = await this.transcripts.fetchTranscript(source.youtube_video_id!);
        if (result.available && result.text) {
          await this.sources.update(source.id, {
            raw_content: result.text,
            transcript_available: true,
            status: "completed",
          });
        } else {
          failures++;
          await this.sources.update(source.id, {
            transcript_available: false,
            status: "partially_completed",
            status_detail: "No captions are available for this video.",
          });
        }
      } catch (cause) {
        failures++;
        await this.sources.update(source.id, {
          status: "failed",
          status_detail: describeError(cause).message,
        });
      }
    }

    const status = pending.length === 0 || failures === 0 ? "completed" : failures < pending.length ? "partially_completed" : "failed";
    await this.jobs.finish(job.id, status);
  }

  /** Runs Gemini extraction over every source that has usable text, storing traceable insights. */
  private async runExtractionStage(projectId: string): Promise<void> {
    const job = await this.jobs.start(projectId, "extraction");
    const readySources = (await this.sources.listForProject(projectId)).filter(
      (s) => s.raw_content && s.status === "completed",
    );

    let failures = 0;
    for (const source of readySources) {
      try {
        const extracted = await this.extraction.extract({
          sourceText: source.raw_content!,
          sourceLabel: sourceLabel(source),
        });
        await this.insights.createMany(
          extracted.map((i) => ({
            project_id: projectId,
            source_id: source.id,
            category: i.category,
            claim: i.claim,
            evidence_excerpt: i.evidenceExcerpt ?? null,
            trust: source.trust,
            confidence: i.confidence,
          })),
        );
      } catch {
        failures++;
      }
    }

    const status =
      readySources.length === 0 || failures === 0
        ? "completed"
        : failures < readySources.length
          ? "partially_completed"
          : "failed";
    await this.jobs.finish(job.id, status);
  }
}

