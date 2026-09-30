import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { requireEnv } from "@/lib/config";

type ModelTier = "fast" | "synthesis";

const MODEL_BY_TIER: Record<ModelTier, string> = {
  fast: process.env.GEMINI_MODEL_FAST ?? "gemini-1.5-flash",
  synthesis: process.env.GEMINI_MODEL_SYNTHESIS ?? "gemini-1.5-pro",
};

/**
 * Thin, testable wrapper around the Gemini API. Always call
 * `generateStructured` with a Zod schema — the raw text path is only for
 * free-form drafting (e.g. narrative prose) where there's nothing to
 * validate against.
 */
export class GeminiService {
  private client(): GoogleGenerativeAI {
    return new GoogleGenerativeAI(requireEnv("GEMINI_API_KEY"));
  }

  async generateStructured<T>(params: {
    tier: ModelTier;
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodType<T>;
    maxRetries?: number;
  }): Promise<T> {
    const { tier, systemPrompt, userPrompt, schema, maxRetries = 2 } = params;
    const model = this.client().getGenerativeModel({
      model: MODEL_BY_TIER[tier],
      systemInstruction: `${systemPrompt}\n\nRespond with JSON only. No prose, no markdown fences.`,
      generationConfig: { responseMimeType: "application/json" },
    });

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await withTimeout(model.generateContent(userPrompt), 30_000);
        const text = result.response.text();
        const parsedJson = safeJsonParse(text);
        const parsed = schema.safeParse(parsedJson);

        if (!parsed.success) {
          lastError = parsed.error;
          continue; // malformed shape — retry rather than store a bad result
        }
        return parsed.data;
      } catch (cause) {
        lastError = cause;
        if (isRateLimit(cause)) {
          throw new AppError(
            "RATE_LIMIT_ERROR",
            "Grant analysis is temporarily rate limited. Please try again shortly.",
            cause,
          );
        }
        if (isTimeout(cause)) continue; // retry once on timeout
      }
    }

    throw new AppError(
      "GEMINI_ERROR",
      "The AI couldn't produce a usable result for this step. Please try again.",
      lastError,
    );
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Model occasionally wraps JSON in fences despite instructions — strip and retry once.
    const stripped = text.replace(/^```json\s*|\s*```$/g, "");
    try {
      return JSON.parse(stripped);
    } catch {
      return null;
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
}

function isTimeout(cause: unknown): boolean {
  return cause instanceof Error && cause.message === "TIMEOUT";
}

function isRateLimit(cause: unknown): boolean {
  return cause instanceof Error && /429|quota|rate/i.test(cause.message);
}
