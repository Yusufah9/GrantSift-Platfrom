import { describe, it, expect } from "vitest";
import { grantVerificationService } from "./grant-verification-service";

describe("GrantVerificationService", () => {
  it("determines correct source tier based on domain", () => {
    expect(grantVerificationService.determineSourceTier("https://www.usaid.gov/div/apply")).toBe("tier_1_official");
    expect(grantVerificationService.determineSourceTier("https://www.gatesfoundation.org/our-work")).toBe("tier_1_official");
    expect(grantVerificationService.determineSourceTier("https://www.instrumentl.com/grants/climate")).toBe("tier_2_database");
    expect(grantVerificationService.determineSourceTier("https://opportunitysquare.com/opportunities/view")).toBe("tier_2_database");
    expect(grantVerificationService.determineSourceTier("https://techcabal.com/2026/grant-announcement")).toBe("tier_3_secondary");
    expect(grantVerificationService.determineSourceTier("https://linkedin.com/posts/funder-announcement")).toBe("tier_4_social");
  });

  it("verifies and extracts domain cleanly", () => {
    expect(grantVerificationService.extractDomain("https://www.gatesfoundation.org/grants")).toBe("gatesfoundation.org");
    expect(grantVerificationService.extractDomain("http://grants.gov/web/default.html")).toBe("grants.gov");
    expect(grantVerificationService.extractDomain("invalid-url")).toBe("unknown");
  });

  it("validates candidate URLs and rejects hallucinated/malformed URLs", () => {
    const valid = grantVerificationService.verifyGrant({
      originalUrl: "https://www.gatesfoundation.org",
      originalSource: "Bill & Melinda Gates Foundation",
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sourceTier).toBe("tier_1_official");

    const malformed = grantVerificationService.verifyGrant({
      originalUrl: "ftp://invalid-funder.org",
    });
    expect(malformed.isValid).toBe(false);

    const syntheticLoopback = grantVerificationService.verifyGrant({
      originalUrl: "http://localhost:3000/fake-grant",
    });
    expect(syntheticLoopback.isValid).toBe(false);
  });

  it("performs full grant verification and classifies verificationStatus", () => {
    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 90);

    const verifiedResult = grantVerificationService.verifyGrant({
      id: "test-gates",
      grantName: "Gates Grand Challenges 2026",
      funderName: "Bill & Melinda Gates Foundation",
      amountMin: 100000,
      amountMax: 1000000,
      currency: "USD",
      deadline: futureDeadline.toISOString().slice(0, 10),
      sourceTier: "tier_1_official",
      funderUrl: "https://www.gatesfoundation.org",
      applicationUrl: "https://gcgh.grandchallenges.org",
      originalUrl: "https://www.gatesfoundation.org",
      originalSource: "Gates Foundation Official Portal",
    });

    expect(verifiedResult.isValid).toBe(true);
    expect(verifiedResult.verificationStatus).toBe("verified");
    expect(verifiedResult.checks.domainVerified).toBe(true);
    expect(verifiedResult.checks.isDeadlineActive).toBe(true);
    expect(verifiedResult.confidenceScore).toBeGreaterThanOrEqual(0.8);
  });

  it("flags expired grants appropriately", () => {
    const expiredResult = grantVerificationService.verifyGrant({
      id: "test-expired",
      grantName: "Old Innovation Challenge 2023",
      funderName: "Past Trust",
      amountMin: 10000,
      amountMax: 50000,
      currency: "USD",
      deadline: "2023-01-01",
      sourceTier: "tier_2_database",
      originalUrl: "https://instrumentl.com/expired",
      originalSource: "Instrumentl Database",
    });

    expect(expiredResult.verificationStatus).toBe("expired");
    expect(expiredResult.checks.isDeadlineActive).toBe(false);
  });
});
