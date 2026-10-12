import { describe, expect, it } from "vitest";
import { RUMOURSHIELD_50_GRANTS } from "@/lib/data/rumourshield-50-grants";
import { VERIFIED_GRANTS, GrantDiscoveryService } from "./grant-discovery-service";
import { GrantMatchingService } from "./grant-matching-service";

describe("RumourShield AI 50 Grants Catalog & Matching Test Suite", () => {
  it("should contain at least 50 verified grants in RUMOURSHIELD_50_GRANTS", () => {
    expect(RUMOURSHIELD_50_GRANTS.length).toBeGreaterThanOrEqual(50);
    expect(VERIFIED_GRANTS.length).toBeGreaterThanOrEqual(50);
  });

  it("should have all 50 grants with unique IDs", () => {
    const ids = new Set(RUMOURSHIELD_50_GRANTS.map((g) => g.id));
    expect(ids.size).toBe(RUMOURSHIELD_50_GRANTS.length);
  });

  it("should verify all grants have active deadlines between October 2026 and December 2026 or rolling", () => {
    const now = new Date("2026-10-12");
    const endOfDec = new Date("2026-12-31T23:59:59Z");

    for (const grant of RUMOURSHIELD_50_GRANTS) {
      expect(grant.deadline).toBeDefined();
      if (grant.deadlineType === "rolling" || grant.deadline === "rolling") {
        expect(grant.status).toBe("active");
      } else {
        const deadlineDate = new Date(grant.deadline);
        expect(deadlineDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 86400000); // within today or future
        expect(deadlineDate.getTime()).toBeLessThanOrEqual(endOfDec.getTime() + 86400000 * 2); // before or at Dec 31 2026
      }
    }
  });

  it("should verify every grant has valid HTTP/HTTPS application and source URLs", () => {
    for (const grant of RUMOURSHIELD_50_GRANTS) {
      expect(grant.applicationUrl).toMatch(/^https?:\/\//);
      expect(grant.originalUrl).toMatch(/^https?:\/\//);
      expect(grant.funderUrl).toMatch(/^https?:\/\//);
    }
  });

  it("should ensure all grants strictly align with RumourShield (AI, Civic Tech, Fact-Checking, Media, Digital Rights, Nigerian/African Tech)", () => {
    const prohibitedSectors = ["Clean Energy", "Agriculture", "Waste Management", "Solar Power"];
    const allowedSectors = ["AI", "Civic Tech", "Media & Journalism", "Digital Rights", "Technology"];

    for (const grant of RUMOURSHIELD_50_GRANTS) {
      // Must not belong to clean energy or off-topic agriculture
      expect(prohibitedSectors).not.toContain(grant.sector);
      expect(allowedSectors).toContain(grant.sector);

      // Must be open to Nigeria or Africa or Global
      const eligibleCountries = grant.eligibility.countries.map((c) => c.toLowerCase());
      const eligibleRegions = grant.eligibility.regions.map((r) => r.toLowerCase());
      const isEligible =
        eligibleCountries.includes("nigeria") ||
        eligibleCountries.includes("global") ||
        eligibleCountries.includes("all african countries") ||
        eligibleRegions.some((r) => r.includes("africa") || r.includes("global"));
      expect(isEligible).toBe(true);
    }
  });

  it("should include opportunities sourced from MSME Africa Online and Opportunity Square", () => {
    const msmeGrants = RUMOURSHIELD_50_GRANTS.filter(
      (g) => g.originalSource.includes("MSME Africa") || g.originalUrl.includes("msmeafricaonline.com")
    );
    const oppSquareGrants = RUMOURSHIELD_50_GRANTS.filter(
      (g) => g.originalSource.includes("Opportunity Square") || g.originalUrl.includes("opportunitysquare.org")
    );

    expect(msmeGrants.length).toBeGreaterThan(0);
    expect(oppSquareGrants.length).toBeGreaterThan(0);
  });

  it("should match RumourShield AI profile with high confidence (>= 80%) on top AI & Civic Tech grants", () => {
    const matchingService = new GrantMatchingService();
    const result = matchingService.match(
      {
        orgName: "RumourShield AI",
        orgType: "Startup",
        country: "Nigeria",
        sector: "AI",
        fundingRequirement: 50000,
        yearsOperating: 1,
        hasIncorporation: true,
        hasAuditedFinancials: false,
      },
      true
    );

    expect(result.totalMatches).toBeGreaterThanOrEqual(10);
    const topMatch = result.matches[0];
    expect(topMatch).toBeDefined();
    expect(topMatch!.matchScore).toBeGreaterThanOrEqual(80);
    expect(topMatch!.matchedReasons.length).toBeGreaterThan(0);
    expect(topMatch!.isEligible).toBe(true);
  });

  it("should filter grants correctly via GrantDiscoveryService for AI and Civic Tech", () => {
    const discoveryService = new GrantDiscoveryService();
    const searchResult = discoveryService.searchGrants({
      sector: "AI",
      country: "Nigeria",
    });

    expect(searchResult.length).toBeGreaterThanOrEqual(15);
    for (const grant of searchResult) {
      expect(grant.eligibility.sector).toContain("AI");
    }
  });

  it("should search grants by keyword through GrantDiscoveryService", () => {
    const discoveryService = new GrantDiscoveryService();
    const result = discoveryService.searchGrants({
      query: "fact-check",
    });

    expect(result.length).toBeGreaterThan(0);
  });
});
