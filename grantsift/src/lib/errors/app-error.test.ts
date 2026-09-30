import { describe, it, expect, vi } from "vitest";
import { AppError, ok, fail } from "@/lib/errors/app-error";

describe("ok / fail envelope", () => {
  it("wraps data in a success envelope", () => {
    expect(ok({ id: "1" })).toEqual({ success: true, data: { id: "1" } });
  });

  it("turns an AppError into a typed failure without leaking internals", () => {
    const result = fail(new AppError("VALIDATION_ERROR", "Enter a valid email address."));
    expect(result).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Enter a valid email address." },
    });
  });

  it("never leaks a raw error message or stack trace for unknown errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = fail(new Error("password=hunter2 connection string leaked"));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PROCESSING_ERROR");
      expect(result.error.message).not.toContain("hunter2");
      expect(result.error.message).not.toContain("connection string");
    }
    spy.mockRestore();
  });
});
