import { describe, it, expect } from "vitest";
import { AIService } from "./ai-service";

describe("AIService", () => {
  const aiService = new AIService();

  it("generates a structured grant proposal with key sections", async () => {
    const proposal = await aiService.generateProposal({
      type: "grant_proposal",
      orgName: "AquaHealth Labs",
      industry: "Healthcare",
      country: "Ghana",
      fundingAmount: 200000,
      funderName: "Wellcome Trust Discovery Program",
      problemStatement: "Over 5 million rural residents lack reliable early water contaminant testing.",
    });

    expect(proposal.title).toContain("AquaHealth Labs");
    expect(proposal.title).toContain("Wellcome Trust");
    expect(proposal.content).toContain("Executive Summary");
    expect(proposal.content).toContain("Problem Statement");
    expect(proposal.content).toContain("Proposed Solution");
    expect(proposal.content).toContain("Post-Grant Transition Plan");
  });

  it("reviews a draft proposal against rubric and identifies missing elements", async () => {
    const review = await aiService.reviewProposal(
      "Our organization proposes to expand water purification hubs in western Ghana. We need $200,000 for equipment."
    );

    expect(review.overallScore).toBeGreaterThan(0);
    expect(review.rubricScores.alignment).toBeGreaterThan(0);
    expect(review.strengths.length).toBeGreaterThan(0);
    expect(review.missingElements.length).toBeGreaterThan(0);
    expect(review.recommendedRevisions.length).toBeGreaterThan(0);
  });

  it("performs grant matchmaking and includes Pro upgrade message for free users", async () => {
    const matchResponse = await aiService.matchGrants({
      query: {
        orgName: "SunTech Solar",
        orgType: "Startup",
        country: "Nigeria",
        sector: "Clean Energy",
        fundingRequirement: 150000,
      },
      isProUser: false,
    });

    expect(matchResponse.totalMatches).toBeGreaterThan(0);
    expect(matchResponse.isProUser).toBe(false);
    expect(matchResponse.requiresProUpgrade).toBe(true);
    expect(matchResponse.matches.length).toBeLessThanOrEqual(2);
    expect(matchResponse.proUpgradeMessage).toContain("Subscribe as a Pro user");
  });

  it("in chat assistant, triggers matchmaking and directs free users to subscribe to Pro", async () => {
    const chatReply = await aiService.chatAssistant({
      messages: [{ role: "user", content: "Can you find grants matching my startup?" }],
      orgContext: {
        orgName: "Lagos AgriLogistics",
        industry: "Agriculture",
        country: "Nigeria",
        orgType: "Startup",
      },
      isProUser: false,
    });

    const replyText = chatReply.message || String(chatReply);
    expect(replyText).toContain("Subscribe as a Pro user");
    expect(replyText).toContain("40,000+ grants");
  });
});
