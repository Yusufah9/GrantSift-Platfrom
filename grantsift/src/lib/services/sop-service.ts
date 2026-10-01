import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { GeminiService } from "@/lib/ai/gemini-service";
import { ReadinessRepository } from "@/lib/repositories/readiness-repository";
import { SopRepository } from "@/lib/repositories/sop-repository";
import { AppError } from "@/lib/errors/app-error";

const sopPlanSchema = z.object({
  tasks: z.array(
    z.object({
      gapIndex: z.number().int().min(0),
      task: z.string().trim().min(3).max(200),
      owner: z.string().trim().max(80),
      input: z.string().trim().max(300),
      output: z.string().trim().max(300),
      requiredDocument: z.string().trim().max(200).optional(),
      notes: z.string().trim().max(300).optional(),
    }),
  ),
});

const SYSTEM_PROMPT = `You turn a list of grant-readiness gaps into a practical task list. Every task
must address exactly one gap from the list you're given — do not invent gaps, merge gaps, or add
tasks unrelated to the list. For each gap write: a short task name (an action, e.g. "Draft letters
of support from two partner organizations"), a suggested owner role (e.g. "Founder", "Finance lead",
"Program manager" — a role, not a person's name, unless the profile names someone), what's needed as
input, what the completed output looks like, the specific document this produces if any, and a short
practical note if useful. Keep everything concrete and specific to the gap text given.`;

export class SopService {
  private readonly readiness: ReadinessRepository;
  private readonly repo: SopRepository;
  private readonly gemini = new GeminiService();

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.readiness = new ReadinessRepository(supabase);
    this.repo = new SopRepository(supabase);
  }

  async generate(projectId: string) {
    const { data: project, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error || !project) throw new AppError("VALIDATION_ERROR", "Project not found.");

    const allReadiness = await this.readiness.listForProject(projectId);
    if (allReadiness.length === 0) {
      throw new AppError("VALIDATION_ERROR", "Run the readiness check on this project first.");
    }

    const gaps = allReadiness.filter((item) => !item.is_met);
    if (gaps.length === 0) {
      await this.repo.replaceForProject(projectId, []);
      return [];
    }

    const gapList = gaps.map((g, i) => `${i}. ${g.requirement} — Gap: ${g.gap_description ?? "not met"}`).join("\n");

    const plan = await this.gemini.generateStructured({
      tier: "synthesis",
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Gaps:\n${gapList}`,
      schema: sopPlanSchema,
    });

    const deadlines = computeBackwardDeadlines(project.grant_deadline, plan.tasks.length);

    const rows = plan.tasks.map((t, index) => {
      const gap = gaps[t.gapIndex] ?? gaps[0]!;
      return {
        project_id: projectId,
        task: t.task,
        owner: t.owner,
        input: t.input,
        output: t.output,
        deadline: deadlines[index] ?? null,
        status: "not_started" as const,
        required_document: t.requiredDocument ?? null,
        traced_to_source_id: gap.traced_to_source_id,
        notes: t.notes ?? null,
        sort_order: index,
      };
    });

    const inserted = await this.repo.replaceForProject(projectId, rows);

    // Chain each task after the previous one — a simple, honest dependency
    // order rather than a fabricated dependency graph the sources don't support.
    for (let i = 1; i < inserted.length; i++) {
      await this.repo.setDependency(inserted[i]!.id, inserted[i - 1]!.id);
    }

    return this.repo.listForProject(projectId);
  }
}

/** Spaces tasks evenly between today and the deadline; returns nulls if there's no deadline to work from. */
export function computeBackwardDeadlines(deadline: string | null, count: number): (string | null)[] {
  if (!deadline || count === 0) return new Array(count).fill(null);

  const deadlineDate = new Date(deadline);
  const today = new Date();
  const rawDays = Math.floor((deadlineDate.getTime() - today.getTime()) / 86_400_000);
  if (rawDays <= 0) return new Array(count).fill(deadline);
  const totalDays = Math.max(1, rawDays);

  const step = totalDays / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today.getTime() + step * (i + 1) * 86_400_000);
    return date.toISOString().slice(0, 10);
  });
}

