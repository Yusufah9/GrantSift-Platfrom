import { describe, it, expect } from "vitest";
import { computeBackwardDeadlines } from "@/lib/services/sop-service";

describe("computeBackwardDeadlines", () => {
  it("returns all nulls when there is no deadline", () => {
    expect(computeBackwardDeadlines(null, 3)).toEqual([null, null, null]);
  });

  it("returns an empty array for zero tasks", () => {
    expect(computeBackwardDeadlines("2026-12-01", 0)).toEqual([]);
  });

  it("spaces tasks in strictly increasing order before the deadline", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const deadline = future.toISOString().slice(0, 10);

    const dates = computeBackwardDeadlines(deadline, 4);
    expect(dates).toHaveLength(4);
    expect(dates.every((d) => d !== null)).toBe(true);

    const timestamps = dates.map((d) => new Date(d!).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]!);
    }
    // Every computed date should still be on or before the deadline itself.
    const deadlineTs = new Date(deadline).getTime();
    for (const ts of timestamps) expect(ts).toBeLessThanOrEqual(deadlineTs);
  });

  it("falls back to the deadline itself when it has already passed", () => {
    const past = "2020-01-01";
    expect(computeBackwardDeadlines(past, 2)).toEqual([past, past]);
  });
});
