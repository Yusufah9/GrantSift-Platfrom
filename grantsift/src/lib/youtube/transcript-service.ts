import { AppError } from "@/lib/errors/app-error";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string; // "asr" = auto-generated
}

const ALLOWED_CAPTION_HOSTS = ["www.youtube.com", "youtube.com", "video.google.com"];

export interface TranscriptResult {
  available: boolean;
  text: string | null;
  languageCode: string | null;
}

/**
 * Retrieves the transcript YouTube already serves publicly for a video, by
 * reading the caption track list embedded in the video's own watch page.
 * This only ever touches youtube.com and the caption host YouTube's own
 * page names — it does not accept or forward any externally supplied URL,
 * so it cannot be used as a general fetch proxy.
 */
export class TranscriptService {
  async fetchTranscript(videoId: string): Promise<TranscriptResult> {
    let html: string;
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
        signal: AbortSignal.timeout(15_000),
        headers: { "Accept-Language": "en-US,en;q=0.9" },
      });
      if (!response.ok) return { available: false, text: null, languageCode: null };
      html = await response.text();
    } catch (cause) {
      throw new AppError("NETWORK_ERROR", "Couldn't reach YouTube to read this video's captions.", cause);
    }

    const track = this.extractPreferredTrack(html);
    if (!track) return { available: false, text: null, languageCode: null };

    let trackUrl: URL;
    try {
      trackUrl = new URL(track.baseUrl);
    } catch {
      return { available: false, text: null, languageCode: null };
    }
    if (!ALLOWED_CAPTION_HOSTS.includes(trackUrl.hostname)) {
      // Unexpected host in YouTube's own response — refuse rather than fetch it.
      return { available: false, text: null, languageCode: null };
    }

    try {
      const captionResponse = await fetch(trackUrl.toString(), { signal: AbortSignal.timeout(15_000) });
      if (!captionResponse.ok) return { available: false, text: null, languageCode: track.languageCode };
      const xml = await captionResponse.text();
      const text = this.extractPlainText(xml);
      return { available: text.length > 0, text: text || null, languageCode: track.languageCode };
    } catch {
      return { available: false, text: null, languageCode: track.languageCode };
    }
  }

  private extractPreferredTrack(html: string): CaptionTrack | null {
    const match = /"captionTracks":(\[[^\]]*\])/.exec(html);
    if (!match || !match[1]) return null;

    let tracks: CaptionTrack[];
    try {
      // The array is valid JSON as embedded, aside from escaped forward slashes.
      tracks = JSON.parse(match[1].replace(/\\u0026/g, "&"));
    } catch {
      return null;
    }
    if (!tracks.length) return null;

    return (
      tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ??
      tracks.find((t) => t.languageCode?.startsWith("en")) ??
      tracks[0] ??
      null
    );
  }

  private extractPlainText(xml: string): string {
    return xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
}
