import { describe, it, expect } from "vitest";
import { grantDiscoveryEngine } from "./grant-discovery-engine";

describe("GrantDiscoveryEngine", () => {
  it("parses natural language search queries into structured criteria", () => {
    const parsed1 = grantDiscoveryEngine.parseNaturalLanguageQuery(
      "Find grants between $50k and $250k for Nigerian clean energy startups"
    );

    expect(parsed1.filters.country).toBe("Nigeria");
    expect(parsed1.filters.sector).toBe("Clean Energy");
    expect(parsed1.filters.organizationType).toBe("Startup");
    expect(parsed1.filters.fundingMin).toBe(50000);
    expect(parsed1.filters.fundingMax).toBe(250000);
    expect(parsed1.intent.detectedGeography).toBe("Nigeria");
  });

  it("executes full grant discovery and performs multi-dimensional matching", async () => {
    const session = await grantDiscoveryEngine.discoverGrants({
      naturalLanguageQuery: "Find non-dilutive grants for health innovations in Africa",
      organizationProfile: {
        projectName: "Mobile Diagnostic Unit",
        orgName: "AfriHealth Labs",
        orgType: "Startup",
        country: "Nigeria",
        sector: "Healthcare",
        industry: "Healthcare",
        stage: "Seed",
        fundingRequirement: 150000,
        problemStatement: "Lack of rural diagnostic facilities leads to high mortality.",
        solutionStatement: "Solar-powered mobile PCR screening stations.",
        targetBeneficiaries: "Rural communities in West Africa",
        hasIncorporation: true,
        hasAuditedFinancials: true,
      },
      isPaidUser: true,
    });

    expect(session).toBeDefined();
    expect(session.matches.length).toBeGreaterThan(0);
    expect(session.summary.totalOpportunities).toBeGreaterThan(0);
    expect(session.summary.lastVerifiedAt).toBeDefined();

    // Each match should have 4-dimensional matching details
    const topMatch = session.matches[0]!;
    expect(topMatch.grant.verificationStatus).toBeDefined();
    expect(topMatch.matchScore).toBeGreaterThan(0);
    expect(topMatch.whyYouMatchSummary).toBeDefined();
    expect(topMatch.matchedCharacteristics.length).toBeGreaterThan(0);
    expect(topMatch.eligibilityCompatibility).toBeDefined();
    expect(topMatch.fundingCompatibility).toBeDefined();
    expect(topMatch.geographicCompatibility).toBeDefined();
    expect(topMatch.timingCompatibility).toBeDefined();
  });

  it("tracks continuous monitoring changes across runs", async () => {
    const run1 = await grantDiscoveryEngine.discoverGrants({
      naturalLanguageQuery: "USAID",
    });

    // Run again with tracked changes check
    const run2 = await grantDiscoveryEngine.discoverGrants({
      naturalLanguageQuery: "USAID",
    });

    expect(run2.alerts).toBeDefined();
    expect(Array.isArray(run2.alerts)).toBe(true);
  });
});
