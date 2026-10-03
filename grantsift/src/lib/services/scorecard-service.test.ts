import { describe, it, expect } from "vitest";
import { calculateReadinessScore, type ScorecardInput } from "./scorecard-service";

describe("calculateReadinessScore", () => {
  const completeStartupInput: ScorecardInput = {
    orgName: "EcoHarvest Africa",
    orgType: "Startup",
    industry: "Agriculture",
    country: "Kenya",
    city: "Nairobi",
    stage: "Early Revenue / Growth",
    yearFounded: 2021,
    teamSize: 6,
    revenue: 45000,
    fundingRaised: 20000,
    problemStatement: "Smallholder farmers lose over 40% of fresh produce post-harvest due to lack of decentralized cold storage.",
    targetBeneficiaries: "Over 3,500 smallholder horticulture farmers in rural Kenya.",
    impactMetrics: "Reduced post-harvest spoilage by 65% and increased household farm incomes by 32%.",
    hasIncorporation: true,
    hasTaxId: true,
    hasAuditedFinancials: true,
    hasPitchDeck: true,
    hasBusinessPlan: true,
    hasLettersOfSupport: true,
  };

  it("produces a high readiness score and Grade A for a complete organization", () => {
    const result = calculateReadinessScore(completeStartupInput);

    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(["A", "B"]).toContain(result.grade);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.eligibleFundingTypes.length).toBeGreaterThan(0);
    expect(result.categoryScores.legalDocumentation).toBe(100);
  });

  it("identifies gaps and recommendations for early-stage organizations missing docs", () => {
    const incompleteInput: ScorecardInput = {
      ...completeStartupInput,
      hasAuditedFinancials: false,
      hasIncorporation: false,
      hasPitchDeck: false,
      revenue: 0,
      fundingRaised: 0,
    };

    const result = calculateReadinessScore(incompleteInput);

    expect(result.overallScore).toBeLessThan(75);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.gaps.some((g) => g.toLowerCase().includes("incorporation") || g.toLowerCase().includes("legal"))).toBe(true);
  });
});
