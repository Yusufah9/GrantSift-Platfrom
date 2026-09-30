import { AppError } from "@/lib/errors/app-error";
import { requireEnv } from "@/lib/config";

export interface DiscoveredVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos";

// Query fragments that surface genuine grant-recipient testimonials rather
// than the funder's own marketing content.
const WINNER_SIGNAL_TERMS = [
  "grant recipient",
  "we won the grant",
  "grant winner",
  "our experience applying",
  "how we got funded",
];

/**
 * Finds YouTube videos of founders/companies discussing having won a grant
 * from a specific funder. This service only ever calls the fixed, official
 * YouTube Data API host — it never fetches an arbitrary user-supplied URL,
 * so it cannot be used as an open proxy (SSRF protection).
 */
export class YouTubeDiscoveryService {
  private apiKey(): string {
    return requireEnv("YOUTUBE_API_KEY");
  }

  async findGrantWinnerVideos(
    funderName: string,
    options: { maxResults?: number } = {},
  ): Promise<DiscoveredVideo[]> {
    const maxResults = Math.min(options.maxResults ?? 10, 25);
    const query = `${funderName} ${WINNER_SIGNAL_TERMS[0]}`;

    const url = new URL(YOUTUBE_SEARCH_ENDPOINT);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("key", this.apiKey());

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10_000),
      });
    } catch (cause) {
      throw new AppError(
        "NETWORK_ERROR",
        "Couldn't reach YouTube right now. Please try again in a moment.",
        cause,
      );
    }

    if (response.status === 403 || response.status === 429) {
      throw new AppError(
        "RATE_LIMIT_ERROR",
        "YouTube search quota has been reached for now. Please try again later.",
      );
    }
    if (!response.ok) {
      throw new AppError("YOUTUBE_ERROR", "YouTube search failed for this funder.");
    }

    const json = (await response.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: { title?: string; channelTitle?: string; publishedAt?: string };
      }>;
    };

    return (json.items ?? [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id!.videoId!,
        title: item.snippet?.title ?? "Untitled video",
        channelTitle: item.snippet?.channelTitle ?? "Unknown channel",
        publishedAt: item.snippet?.publishedAt ?? "",
        url: `https://www.youtube.com/watch?v=${item.id!.videoId}`,
      }));
  }

  /** Confirms a video still exists and is public before it becomes a source. */
  async verifyVideoIsAccessible(videoId: string): Promise<boolean> {
    const url = new URL(YOUTUBE_VIDEOS_ENDPOINT);
    url.searchParams.set("part", "status");
    url.searchParams.set("id", videoId);
    url.searchParams.set("key", this.apiKey());

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return false;
    const json = (await response.json()) as { items?: Array<{ status?: { privacyStatus?: string } }> };
    return json.items?.[0]?.status?.privacyStatus === "public";
  }
}
