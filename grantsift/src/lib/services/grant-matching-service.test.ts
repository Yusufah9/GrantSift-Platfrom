import { describe, it, expect } from "vitest";
import { GrantMatchingService, CURATED_GRANTS, type MatchQuery } from "./grant-matching-service";

describe("GrantMatchingService", () => {
  const service = new GrantMatchingService();

  const mockStartupQuery: MatchQuery = {
    orgName: "SunGrow AgriTech",
    orgType: "Startup",
    country: "Nigeria",
    sector: "Clean Energy",
    fundingRequirement: 120000,
    yearsOperating: 2,
    hasIncorporation: true,
    hasAuditedFinancials: true,
  };

  it("matches an African clean energy startup with appropriate grants", () => {
    const result = service.match(mockStartupQuery, true);

    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.matches.length).toBe(CURATED_GRANTS.length);
    expect(result.isProUser).toBe(true);
    expect(result.requiresProUpgrade).toBe(false);

    // Top match should be African Development Bank or Tony Elumelu
    const topMatch = result.matches[0];
    expect(topMatch).toBeDefined();
    expect(topMatch!.matchScore).toBeGreaterThanOrEqual(70);
    expect(topMatch!.matchedReasons.length).toBeGreaterThan(0);
    expect(topMatch!.isEligible).toBe(true);
  });

  it("enforces Pro subscription gating for free users", () => {
    const result = service.match(mockStartupQuery, false);

    expect(result.isProUser).toBe(false);
    expect(result.requiresProUpgrade).toBe(true);
    expect(result.matches.length).toBe(2); // Only preview 2
    expect(result.totalMatches).toBe(CURATED_GRANTS.length);
    expect(result.proUpgradeMessage).toContain("Subscribe as a Pro user");
  });

  it("provides transparent match reasons and flags potential gaps", () => {
    const queryWithGaps: MatchQuery = {
      orgName: "New Non-Profit Clinic",
      orgType: "NGO",
      country: "Global",
      sector: "Healthcare",
      fundingRequirement: 2000000, // Beyond typical grant limits
      yearsOperating: 0, // No operating history
      hasIncorporation: false,
    };

    const result = service.match(queryWithGaps, true);
    const healthGrant = result.matches.find((m) => m.grant.sector === "Healthcare");

    expect(healthGrant).toBeDefined();
    expect(healthGrant!.potentialGaps.some((g) => g.includes("Incorporation") || g.includes("Funding requirement") || g.includes("operating"))).toBe(true);
  });
});
