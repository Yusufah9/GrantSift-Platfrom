"use server";

import { GeminiService } from "@/lib/ai/gemini-service";
import { sanitizeProposalContent } from "@/lib/ai/ai-text-sanitizer";

export interface GenerateSectionParams {
  sectionNumber: number;
  sectionTitle: string;
  category: string;
  objective: string;
  requiredComponents: string[];
  companyName: string;
  sector: string;
  geography: string;
  currentContent?: string;
  userPrompt?: string;
}

export async function generateBusinessPlanSectionAction(params: GenerateSectionParams) {
  try {
    const gemini = new GeminiService();
    const systemPrompt = `You are an elite institutional investment banker and venture capital strategy partner drafting an institutional 33-section business plan.
CRITICAL EDITORIAL RULES:
1. Natural human corporate voice. Strictly NO AI hype, NO buzzwords (e.g., avoid 'in today's fast-paced world', 'tapestry', 'testament', 'beacon', 'unleash', 'harness', 'delve', 'spearhead', 'holistic', 'game-changing', 'cutting-edge').
2. ZERO em-dashes and ZERO en-dashes. Use semicolons, colons, or clean periods instead.
3. Quantified metrics, actionable operational rigor, realistic commercial defensibility.
4. Strictly align with the company profile provided.`;

    const prompt = `DRAFT SECTION ${params.sectionNumber}: ${params.sectionTitle} (${params.category})

Company Name: ${params.companyName}
Industry / Sector: ${params.sector}
Geographic Scope: ${params.geography}

Section Objective:
${params.objective}

Required Components to address:
${params.requiredComponents.map((c) => `- ${c}`).join("\n")}

${params.userPrompt ? `Specific focus/instruction: ${params.userPrompt}\n` : ""}
${params.currentContent && params.currentContent.trim().length > 0 ? `Current notes/context:\n${params.currentContent}\n` : ""}

Generate a comprehensive, investor-grade draft for this specific section. Formatted with clean professional headers and structured paragraphs or bulleted operational frameworks.`;

    const rawDraft = await gemini.generateText(prompt, "synthesis", systemPrompt);
    const sanitized = sanitizeProposalContent(rawDraft);

    return {
      success: true,
      content: sanitized,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to generate business plan section via Gemini AI.",
    };
  }
}
