import { AppError } from "@/lib/errors/app-error";

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/,
];

/**
 * Validates a funder URL is safe to fetch server-side: http(s) only, no
 * loopback/private-network hosts. This is the single choke point for
 * outbound fetches triggered by user input — GrantSift never becomes a
 * general-purpose URL proxy.
 */
export function assertFetchableUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("VALIDATION_ERROR", "Enter a valid funder URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new AppError("VALIDATION_ERROR", "Only http(s) URLs are supported.");
  }

  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) {
    throw new AppError("VALIDATION_ERROR", "This URL cannot be used as a source.");
  }

  return parsed;
}

export interface FunderProfile {
  sourceUrl: string;
  title: string;
  rawText: string;
}

export class FunderSourceService {
  /** Fetches and lightly extracts text from a funder's official page. */
  async fetchFunderProfile(rawUrl: string): Promise<FunderProfile> {
    const url = assertFetchableUrl(rawUrl);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "GrantSiftBot/1.0 (+https://grantsift.app)" },
      });
    } catch (cause) {
      throw new AppError(
        "NETWORK_ERROR",
        "Couldn't reach that funder URL. Check the link and try again.",
        cause,
      );
    }

    if (!response.ok) {
      throw new AppError(
        "PROCESSING_ERROR",
        `The funder site returned an error (${response.status}). Try a different page on their site.`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text")) {
      throw new AppError("VALIDATION_ERROR", "That URL doesn't point to a readable page.");
    }

    const html = await response.text();
    const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? url.hostname;
    const rawText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50_000);

    return { sourceUrl: url.toString(), title, rawText };
  }
}
