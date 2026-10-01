import { describe, it, expect } from "vitest";
import { organizationProfileSchema, grantTargetSchema } from "@/lib/validation/project";

describe("organizationProfileSchema", () => {
  const base = {
    orgName: "Acme Robotics",
    orgIndustry: "Robotics",
    orgCountry: "Nigeria",
    orgEmail: "team@acme.example",
  };

  it("accepts the minimum required fields with every optional field left blank", () => {
    // Regression test: a browser submits "" for an empty optional number/date
    // input, not undefined. This used to fail or silently coerce to 0.
    const result = organizationProfileSchema.safeParse({
      ...base,
      orgWebsite: "",
      orgTeamSize: "",
      orgYearFounded: "",
      orgFundingToDate: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orgTeamSize).toBeUndefined();
      expect(result.data.orgYearFounded).toBeUndefined();
      expect(result.data.orgFundingToDate).toBeUndefined();
    }
  });

  it("coerces a provided numeric string correctly", () => {
    const result = organizationProfileSchema.safeParse({ ...base, orgTeamSize: "12" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.orgTeamSize).toBe(12);
  });

  it("rejects a negative team size", () => {
    const result = organizationProfileSchema.safeParse({ ...base, orgTeamSize: "-3" });
    expect(result.success).toBe(false);
  });

  it("rejects a year founded in the future", () => {
    const result = organizationProfileSchema.safeParse({ ...base, orgYearFounded: String(new Date().getFullYear() + 5) });
    expect(result.success).toBe(false);
  });
});

describe("grantTargetSchema", () => {
  const base = { grantFunderUrl: "https://example-foundation.org/grants" };

  it("accepts a blank deadline instead of failing date validation", () => {
    const result = grantTargetSchema.safeParse({ ...base, grantDeadline: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.grantDeadline).toBeUndefined();
  });

  it("accepts a valid ISO deadline", () => {
    const result = grantTargetSchema.safeParse({ ...base, grantDeadline: "2026-12-01" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed deadline", () => {
    const result = grantTargetSchema.safeParse({ ...base, grantDeadline: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-http(s) funder URL", () => {
    const result = grantTargetSchema.safeParse({ grantFunderUrl: "ftp://example.org" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing funder URL", () => {
    const result = grantTargetSchema.safeParse({ grantFunderUrl: "" });
    expect(result.success).toBe(false);
  });
});

