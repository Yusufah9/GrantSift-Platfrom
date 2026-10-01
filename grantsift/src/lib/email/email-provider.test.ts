import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getEmailProvider, isValidSenderAddress, BrevoProvider, NoopProvider } from "@/lib/email/email-provider";

describe("getEmailProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.EMAIL_PROVIDER = "brevo";
    process.env.BREVO_SMTP_KEY = "test_key";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("rejects invalid sender formats for Brevo", () => {
    process.env.EMAIL_FROM = "GrantSift";

    expect(() => getEmailProvider()).toThrow(/EMAIL_FROM.*email@example\.com/i);
  });

  it("accepts valid sender address formats for Brevo", () => {
    process.env.EMAIL_FROM = "GrantSift <hello@grantsift.app>";

    expect(() => getEmailProvider()).not.toThrow();
  });

  it("returns NoopProvider when EMAIL_PROVIDER is not brevo or key is missing", () => {
    delete process.env.EMAIL_PROVIDER;
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(NoopProvider);
  });
});

describe("isValidSenderAddress", () => {
  it("validates standard and named email formats", () => {
    expect(isValidSenderAddress("GrantSift <hello@grantsift.app>")).toBe(true);
    expect(isValidSenderAddress("hello@grantsift.app")).toBe(true);
    expect(isValidSenderAddress("Invalid Format")).toBe(false);
    expect(isValidSenderAddress("")).toBe(false);
  });
});

