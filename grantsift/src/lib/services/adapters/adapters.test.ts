import { describe, it, expect } from "vitest";
import { OpportunitySquareAdapter } from "./opportunity-square-adapter";
import { InstrumentlAdapter } from "./instrumentl-adapter";
import { OfficialFunderAdapter } from "./official-funder-adapter";
import { GovernmentGrantAdapter } from "./government-grant-adapter";
import { WebSearchAdapter } from "./web-search-adapter";
import { WinnerIntelligenceAdapter } from "./winner-intelligence-adapter";
import { sourceAdapterRegistry } from "./source-adapter-registry";

describe("Pluggable Source Adapters", () => {
  it("OpportunitySquareAdapter fetches African startup/SME/NGO opportunities", async () => {
    const adapter = new OpportunitySquareAdapter();
    expect(adapter.sourceName).toBe("OpportunitySquare");
    expect(adapter.sourceTier).toBe("tier_2_database");

    const results = await adapter.search("startup", {
      country: "Nigeria",
    });

    expect(results.length).toBeGreaterThan(0);
    const first = results[0]!;
    expect(first.source_url).toContain("opportunitysquare.org");
    expect(first.source_tier).toBe("tier_2_database");
    expect(first.eligibility.countries.length).toBeGreaterThan(0);
  });

  it("InstrumentlAdapter fetches global RFP and foundation opportunities", async () => {
    const adapter = new InstrumentlAdapter();
    expect(adapter.sourceName).toBe("Instrumentl");
    expect(adapter.sourceTier).toBe("tier_2_database");

    const results = await adapter.search("Climate");

    expect(results.length).toBeGreaterThan(0);
    const climateGrant = results.find((g) => g.sector?.toLowerCase().includes("climate") || g.grantName.toLowerCase().includes("climate"));
    expect(climateGrant).toBeDefined();
    expect(climateGrant?.application_url).toBeDefined();
  });

  it("OfficialFunderAdapter fetches Tier 1 verified institutional grants", async () => {
    const adapter = new OfficialFunderAdapter();
    expect(adapter.sourceName).toBe("Official Funder Direct");
    expect(adapter.sourceTier).toBe("tier_1_official");

    const results = await adapter.search("");
    expect(results.length).toBeGreaterThan(0);
    for (const grant of results) {
      expect(grant.source_tier).toBe("tier_1_official");
      expect(grant.funder_url).toBeDefined();
      expect(grant.funder_url!.startsWith("http")).toBe(true);
      expect(grant.application_url.startsWith("http")).toBe(true);
    }
  });

  it("GovernmentGrantAdapter returns Tier 1 government agency grants", async () => {
    const adapter = new GovernmentGrantAdapter();
    expect(adapter.sourceName).toBe("Government & Bilateral Portals");
    expect(adapter.sourceTier).toBe("tier_1_official");

    const results = await adapter.search("usaid");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.funderName).toContain("USAID");
  });

  it("WebSearchAdapter discovers leads from web search queries", async () => {
    const adapter = new WebSearchAdapter();
    expect(adapter.sourceTier).toBe("tier_3_secondary");

    const results = await adapter.search("climate");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.source_tier).toBe("tier_3_secondary");
  });

  it("WinnerIntelligenceAdapter provides previous recipient insights and review tips", () => {
    const adapter = new WinnerIntelligenceAdapter();
    const intel = adapter.getWinnerIntelligence(
      "Gates Foundation Grand Challenges"
    );

    expect(intel).toBeDefined();
    expect(intel.discoveredWinners.length).toBeGreaterThan(0);
    expect(intel.commonPatterns.length).toBeGreaterThan(0);
    expect(intel.applicationDosAndDonts.dos.length).toBeGreaterThan(0);

    const firstWinner = intel.discoveredWinners[0]!;
    expect(firstWinner.recipientName).toBeDefined();
    expect(firstWinner.awardAmount).toBeDefined();
  });

  it("SourceAdapterRegistry aggregates, deduplicates, and sorts by tier and confidence", async () => {
    const results = await sourceAdapterRegistry.searchAll("innovation");

    expect(results.length).toBeGreaterThan(0);
    // Verified sorting priority: Tier 1 should precede Tier 3
    const tierRanks: Record<string, number> = {
      tier_1_official: 1,
      tier_2_database: 2,
      tier_3_secondary: 3,
      tier_4_social: 4,
    };
    const firstTier = results[0]?.source_tier || "tier_4_social";
    const lastTier = results[results.length - 1]?.source_tier || "tier_4_social";
    expect(tierRanks[firstTier]!).toBeLessThanOrEqual(tierRanks[lastTier]!);

    // Verify IDs are unique (deduplication)
    const ids = results.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
