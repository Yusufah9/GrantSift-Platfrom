import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { GeminiService } from "@/lib/ai/gemini-service";
import { ReadinessRepository } from "@/lib/repositories/readiness-repository";
import { SopRepository } from "@/lib/repositories/sop-repository";
import { AppError } from "@/lib/errors/app-error";

import { cleanPlainText } from "@/lib/ai/ai-text-sanitizer";

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

const SYSTEM_PROMPT = `You are GrantSift's Senior Grant Operations Specialist.
Generate an opportunity-specific Standard Operating Procedure (SOP) workflow.
For each readiness gap and grant requirement:
1. Formulate a concrete, action-oriented task (e.g. "Assemble audited financial statements for prior two fiscal years").
2. Assign a practical owner role (such as "Lead Proposal Writer", "Finance Director", "Technical Architect", or "Executive Director").
3. Define exact input required, completed deliverable output, required document attachment, and practical operational notes.
4. Strictly follow the sequence: Research, Evidence Gathering, Proposal Drafting, Financial Reconciliation, Technical Review, Founder Sign-Off, Submission, and Post-Submission Tracking.
5. DO NOT use asterisks (**), hashes (###), or em dashes (—). Keep language clean, professional, and direct.`;

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
        task: cleanPlainText(t.task),
        owner: cleanPlainText(t.owner),
        input: cleanPlainText(t.input),
        output: cleanPlainText(t.output),
        deadline: deadlines[index] ?? null,
        status: "not_started" as const,
        required_document: t.requiredDocument ? cleanPlainText(t.requiredDocument) : null,
        traced_to_source_id: gap.traced_to_source_id,
        notes: t.notes ? cleanPlainText(t.notes) : null,
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

