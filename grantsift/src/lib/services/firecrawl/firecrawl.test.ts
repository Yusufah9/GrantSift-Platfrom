import { describe, it, expect } from "vitest";
import { FirecrawlService } from "./Firecrawl";
import { ResearchEngine } from "./research-engine";

describe("FirecrawlService & ResearchEngine", () => {
  const firecrawl = new FirecrawlService();
  const engine = new ResearchEngine();

  it("performs search across Opportunity Square and live web sources", async () => {
    const results = await firecrawl.search("Clean energy grants Nigeria", {
      sources: ["opportunity_square", "instrumentl", "official_funder"],
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.sourceType === "opportunity_square")).toBe(true);
    expect(results.some((r) => r.sourceType === "instrumentl")).toBe(true);
    expect(results[0]?.confidence).toBeDefined();
  });

  it("extracts structured grant information from a targeted opportunity URL", async () => {
    const grant = await firecrawl.extractGrant(
      "https://opportunitysquare.org/grants/african-innovation-fellowship-2026"
    );

    expect(grant.grantName).toBeDefined();
    expect(grant.funder).toBeDefined();
    expect(grant.currency).toBe("USD");
    expect(grant.eligibleCountries.length).toBeGreaterThan(0);
    expect(grant.requirements.length).toBeGreaterThan(0);
  });

  it("synthesizes comprehensive research intelligence combining Firecrawl and Gemini reasoning", async () => {
    const report = await engine.runResearch({
      query: "Solar mini-grids smallholder farmers grants Africa",
      mode: "grant_research",
      orgContext: {
        orgName: "SunGrow AgriTech",
        industry: "Clean Energy",
        country: "Nigeria",
      },
    });

    expect(report.query).toContain("Solar");
    expect(report.sources.length).toBeGreaterThan(0);
    expect(report.insights.length).toBeGreaterThan(0);
    expect(report.recurringPatterns.length).toBeGreaterThan(0);
    expect(report.funderPriorities.length).toBeGreaterThan(0);
    expect(report.requiredDocuments.length).toBeGreaterThan(0);
    expect(report.proposalRecommendations.length).toBeGreaterThan(0);
  });
});
