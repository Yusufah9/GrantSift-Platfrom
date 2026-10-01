import "server-only";
import { z } from "zod";
import { GeminiService } from "@/lib/ai/gemini-service";

export const INSIGHT_CATEGORIES = [
  "eligibility",
  "document_requirement",
  "budget_tip",
  "narrative_tip",
  "process_tip",
  "red_flag",
] as const;

const extractionResultSchema = z.object({
  insights: z
    .array(
      z.object({
        category: z.enum(INSIGHT_CATEGORIES),
        claim: z.string().trim().min(3).max(400),
        evidenceExcerpt: z.string().trim().max(600).optional(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(15),
});

export type ExtractedInsight = z.infer<typeof extractionResultSchema>["insights"][number];

const SYSTEM_PROMPT = `You extract concrete, funder-specific grant application guidance from a single
source document. Only report claims the text actually supports — never infer, generalize, or add
outside knowledge. If the text has nothing useful, return an empty insights array. Categories:
- eligibility: who can apply, geographic/legal/stage restrictions
- document_requirement: a specific document or attachment the funder asks for
- budget_tip: anything about award size, allowed budget items, or cost restrictions
- narrative_tip: how to frame the problem, story, or case for support
- process_tip: application steps, deadlines, timelines, submission mechanics
- red_flag: a common mistake or disqualifying error mentioned in the text
Set confidence based on how explicit the source is (a directly stated rule = high confidence; a
loosely implied pattern = lower confidence). Never invent a claim to fill out the list.`;

export class ExtractionService {
  private readonly gemini = new GeminiService();

  async extract(params: { sourceText: string; sourceLabel: string }): Promise<ExtractedInsight[]> {
    const trimmed = params.sourceText.trim();
    if (trimmed.length < 40) return []; // not enough content to extract anything real

    const result = await this.gemini.generateStructured({
      tier: "fast",
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Source: ${params.sourceLabel}\n\n"""\n${trimmed.slice(0, 12_000)}\n"""`,
      schema: extractionResultSchema,
    });

    return result.insights;
  }
}

