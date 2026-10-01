import { describe, it, expect } from "vitest";
import { sourceLabel, describeError } from "@/lib/services/processing-pipeline-service";
import { AppError } from "@/lib/errors/app-error";
import type { Database } from "@/lib/supabase/database.types";

type Source = Database["public"]["Tables"]["sources"]["Row"];

describe("sourceLabel", () => {
  it("labels a funder_org source by its URL", () => {
    const source = { kind: "funder_org", funder_url: "https://example.org/grants" } as Source;
    expect(sourceLabel(source)).toBe("Funder site: https://example.org/grants");
  });

  it("labels a youtube_video source with title and channel", () => {
    const source = {
      kind: "youtube_video",
      youtube_video_title: "How we won the grant",
      youtube_channel_title: "Acme Robotics",
    } as Source;
    expect(sourceLabel(source)).toBe('YouTube: "How we won the grant" by Acme Robotics');
  });

  it("labels pasted requirements distinctly", () => {
    const source = { kind: "user_pasted_text" } as Source;
    expect(sourceLabel(source)).toBe("Requirements pasted by the user");
  });
});

describe("describeError", () => {
  it("passes through an AppError's code and message", () => {
    const result = describeError(new AppError("RATE_LIMIT_ERROR", "Slow down."));
    expect(result).toEqual({ code: "RATE_LIMIT_ERROR", message: "Slow down." });
  });

  it("wraps a plain Error as PROCESSING_ERROR", () => {
    const result = describeError(new Error("boom"));
    expect(result).toEqual({ code: "PROCESSING_ERROR", message: "boom" });
  });

  it("handles a non-Error thrown value", () => {
    const result = describeError("just a string");
    expect(result).toEqual({ code: "PROCESSING_ERROR", message: "Unknown error" });
  });
});

