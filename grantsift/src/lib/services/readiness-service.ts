import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { GeminiService } from "@/lib/ai/gemini-service";
import { InsightRepository } from "@/lib/repositories/insight-repository";
import { ReadinessRepository } from "@/lib/repositories/readiness-repository";
import { AppError } from "@/lib/errors/app-error";

const REQUIREMENT_CATEGORIES = ["eligibility", "document_requirement"] as const;

const assessmentSchema = z.object({
  assessments: z.array(
    z.object({
      index: z.number().int().min(0),
      status: z.enum(["met", "not_met", "unclear"]),
      gapDescription: z.string().trim().max(300).optional(),
    }),
  ),
});

const SYSTEM_PROMPT = `You check whether an organization's profile satisfies a list of grant
requirements. The requirements are given to you verbatim — you must not add, remove, reword, or
combine them. For each requirement, decide:
- "met" if the organization's profile clearly satisfies it
- "not_met" if the profile clearly fails it or is missing the information needed to satisfy it
- "unclear" if the requirement is too vague to check mechanically, or the profile doesn't say enough
When status is not "met", write a short, specific gapDescription (under 30 words) naming exactly
what is missing or insufficient. Never mark something "met" on an assumption — if in doubt, use
"unclear" and explain what's missing.`;

export class ReadinessService {
  private readonly insights: InsightRepository;
  private readonly repo: ReadinessRepository;
  private readonly gemini = new GeminiService();

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.insights = new InsightRepository(supabase);
    this.repo = new ReadinessRepository(supabase);
  }

  async assess(projectId: string) {
    const { data: project, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error || !project) throw new AppError("VALIDATION_ERROR", "Project not found.");

    const allInsights = await this.insights.listForProject(projectId);
    const candidates = dedupeRequirements(
      allInsights.filter((i) => REQUIREMENT_CATEGORIES.includes(i.category as (typeof REQUIREMENT_CATEGORIES)[number])),
    );

    if (candidates.length === 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        "No requirements have been extracted yet. Run analysis on this project's sources first.",
      );
    }

    const orgProfileText = describeOrgProfile(project);
    const requirementsList = candidates.map((c, i) => `${i}. ${c.claim}`).join("\n");

    const result = await this.gemini.generateStructured({
      tier: "synthesis",
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Organization profile:\n${orgProfileText}\n\nRequirements:\n${requirementsList}`,
      schema: assessmentSchema,
    });

    const byIndex = new Map(result.assessments.map((a) => [a.index, a]));

    const items = candidates.map((candidate, index) => {
      const assessment = byIndex.get(index);
      const isMet = assessment?.status === "met";
      return {
        project_id: projectId,
        requirement: candidate.claim,
        is_met: isMet,
        gap_description: isMet ? null : assessment?.gapDescription ?? "Not enough information to confirm this is met.",
        traced_to_source_id: candidate.source_id,
        traced_to_user_input: false,
      };
    });

    await this.repo.replaceForProject(projectId, items);
    return this.repo.listForProject(projectId);
  }
}

export function dedupeRequirements<T extends { claim: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = item.claim.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function describeOrgProfile(project: Database["public"]["Tables"]["projects"]["Row"]): string {
  const lines: string[] = [];
  if (project.org_name) lines.push(`Name: ${project.org_name}`);
  if (project.org_industry) lines.push(`Industry: ${project.org_industry}`);
  if (project.org_country) lines.push(`Country: ${project.org_country}`);
  if (project.org_website) lines.push(`Website: ${project.org_website}`);
  if (project.org_team_size != null) lines.push(`Team size: ${project.org_team_size}`);
  if (project.org_year_founded != null) lines.push(`Year founded: ${project.org_year_founded}`);
  if (project.org_funding_to_date != null) lines.push(`Funding raised to date: $${project.org_funding_to_date}`);
  if (project.org_traction) lines.push(`Traction: ${project.org_traction}`);
  return lines.length > 0 ? lines.join("\n") : "No organization profile details were provided.";
}

