import { describe, it, expect } from "vitest";
import { signUpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";

describe("signUpSchema", () => {
  it("accepts a valid signup", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "correcthorse1",
      confirmPassword: "correcthorse1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "correcthorse1",
      confirmPassword: "somethingelse1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });

  it("rejects a password with no digit", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "nodigitshere",
      confirmPassword: "nodigitshere",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "not-an-email",
      password: "correcthorse1",
      confirmPassword: "correcthorse1",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    const result = loginSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema / resetPasswordSchema", () => {
  it("validates email format for forgot-password", () => {
    expect(forgotPasswordSchema.safeParse({ email: "ada@example.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  it("requires matching passwords for reset", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "correcthorse1", confirmPassword: "correcthorse1" }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "correcthorse1", confirmPassword: "different1" }).success,
    ).toBe(false);
  });
});
