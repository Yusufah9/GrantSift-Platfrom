import { describe, it, expect } from "vitest";
import { cleanPlainText, parseCleanTextBlocks } from "@/lib/ai/ai-text-sanitizer";
import { AIService } from "@/lib/ai/ai-service";
import { AIMatchingService } from "@/lib/services/ai-matching-service";
import { ProposalStudioService } from "@/lib/services/proposal-studio-service";
import { VERIFIED_GRANTS } from "@/lib/services/grant-discovery-service";

describe("GrantSift AI Intelligence & Writing Engine Upgrade", () => {
  const aiService = new AIService();
  const matchingService = new AIMatchingService();

  describe("Sanitization & Clean Typography Layer", () => {
    it("strips raw asterisks, hashes, code fences, and artificial separators", () => {
      const raw = `### Executive Summary\n\n**Applicant Organization:** AquaHealth Labs\n---\n* Direct Beneficiaries: 1,500 households.\n\`code snippet\``;
      const cleaned = cleanPlainText(raw);

      expect(cleaned).not.toContain("###");
      expect(cleaned).not.toContain("**");
      expect(cleaned).not.toContain("---");
      expect(cleaned).not.toContain("`");
      expect(cleaned).toContain("Executive Summary");
      expect(cleaned).toContain("Applicant Organization: AquaHealth Labs");
      expect(cleaned).toContain("• Direct Beneficiaries: 1,500 households.");
    });

    it("replaces em dashes and decorative dashes with natural punctuation", () => {
      const raw = "The market is growing — but trust is missing — causing delays.";
      const cleaned = cleanPlainText(raw);

      expect(cleaned).not.toContain("—");
      expect(cleaned).not.toContain("--");
      expect(cleaned).toContain("The market is growing; but trust is missing; causing delays.");
    });

    it("neutralizes prohibited AI buzzwords (fragmented, frontlines, leverage, etc.)", () => {
      const raw = "Current intervention frameworks remain fragmented in frontline communities. We uniquely positioned to leverage our innovative solution to unlock scale and drive impact.";
      const cleaned = cleanPlainText(raw);

      expect(cleaned).not.toContain("fragmented");
      expect(cleaned).not.toContain("frontline");
      expect(cleaned).not.toContain("frontlines");
      expect(cleaned).not.toContain("leverage");
      expect(cleaned).not.toContain("unlock");
      expect(cleaned).not.toContain("innovative solution");
      expect(cleaned).not.toContain("drive impact");
      expect(cleaned).toContain("informal and uncoordinated");
      expect(cleaned).toContain("local communities");
    });

    it("parses clean text into structured blocks without exposed Markdown", () => {
      const text = `Overview\nThis project provides water purification in Ghana.\n\nKey Activities:\n• Water testing\n• System installation\n\n1. Procurement\n2. Field deployment`;
      const blocks = parseCleanTextBlocks(text);

      expect(blocks.length).toBeGreaterThan(0);
      const bullets = blocks.find((b) => b.type === "bullet_list");
      expect(bullets).toBeDefined();
      expect(bullets?.items).toContain("Water testing");
      expect(bullets?.items).toContain("System installation");

      const numbered = blocks.find((b) => b.type === "numbered_list");
      expect(numbered).toBeDefined();
      expect(numbered?.items).toContain("Procurement");
    });
  });

  describe("AI OS Assistant Chat Intelligence", () => {
    it("greeting response contains zero raw asterisks, hashes, or dashes", async () => {
      const res = await aiService.chatAssistant({
        messages: [{ role: "user", content: "Hello" }],
        orgContext: {
          orgName: "Shugaland",
          country: "Nigeria",
          sector: "Real Estate Technology",
        },
        isProUser: true,
      });

      expect(res.message).not.toContain("**");
      expect(res.message).not.toContain("###");
      expect(res.message).not.toContain("—");
      expect(res.message).toContain("Shugaland");
      expect(res.message).toContain("Nigeria");
      expect(res.actions.length).toBeGreaterThan(0);
    });

    it("funder intelligence response contains zero raw asterisks, hashes, or dashes", async () => {
      const res = await aiService.chatAssistant({
        messages: [{ role: "user", content: "Research funder African Development Bank" }],
        orgContext: {
          orgName: "Shugaland",
          country: "Nigeria",
          sector: "PropTech",
        },
        isProUser: true,
      });

      expect(res.message).not.toContain("**");
      expect(res.message).not.toContain("###");
      expect(res.message).not.toContain("—");
      expect(res.message).toContain("African Development Bank");
    });

    it("theory of change explanation is natural and free of buzzwords", async () => {
      const res = await aiService.chatAssistant({
        messages: [{ role: "user", content: "What is a theory of change?" }],
        orgContext: {
          orgName: "Shugaland",
          country: "Nigeria",
        },
        isProUser: true,
      });

      expect(res.message).not.toContain("**");
      expect(res.message).not.toContain("###");
      expect(res.message).toContain("Theory of Change");
      expect(res.message).toContain("Inputs");
      expect(res.message).toContain("Outputs");
      expect(res.message).toContain("Outcomes");
    });
  });

  describe("Opportunity-Specific Proposal Writing & Fallback", () => {
    it("generates proposal free of asterisks, hashes, dashes, and banned words", async () => {
      const proposal = await aiService.generateProposal({
        type: "grant_proposal",
        orgName: "Shugaland",
        industry: "PropTech",
        country: "Nigeria",
        fundingAmount: 250000,
        funderName: "Emergent Ventures",
        problemStatement: "Property seekers face lack of verified agents and secure transactions.",
        solutionStatement: "Building verified agent infrastructure with transaction escrow protection.",
      });

      expect(proposal.title).toContain("Shugaland");
      expect(proposal.title).toContain("Emergent Ventures");
      expect(proposal.content).not.toContain("**");
      expect(proposal.content).not.toContain("###");
      expect(proposal.content).not.toContain("##");
      expect(proposal.content).not.toContain("---");
      expect(proposal.content).not.toContain("—");
      expect(proposal.content).not.toContain("fragmented");
      expect(proposal.content).not.toContain("frontline");
      expect(proposal.content).toContain("Executive Summary");
      expect(proposal.content).toContain("Problem Statement");
    });
  });

  describe("11-Stage Automated Quality Review Pipeline", () => {
    it("runs 11 distinct review stages and detects raw markdown or buzzwords", async () => {
      const cleanProposal = `Executive Summary
Shugaland provides verified transaction infrastructure for Nigerian property investments.
With $250,000 USD, we will support 1,500 direct participants and expand verified operations across Lagos and Abuja.

Methodology
Phase 1 covers agent verification. Phase 2 implements escrow integration.
Phase 3 establishes self-sustaining transaction revenue by Month 24.`;

      const review = await aiService.reviewProposal(cleanProposal);

      expect(review.reviewPipeline).toBeDefined();
      expect(review.reviewPipeline.evidenceReview.stage).toBe("Evidence Review");
      expect(review.reviewPipeline.factualReview.stage).toBe("Factual Review");
      expect(review.reviewPipeline.eligibilityReview.stage).toBe("Eligibility Review");
      expect(review.reviewPipeline.funderAlignmentReview.stage).toBe("Funder Alignment Review");
      expect(review.reviewPipeline.financialReview.stage).toBe("Financial Review");
      expect(review.reviewPipeline.technicalReview.stage).toBe("Technical Review");
      expect(review.reviewPipeline.consistencyReview.stage).toBe("Consistency Review");
      expect(review.reviewPipeline.duplicationReview.stage).toBe("Duplication Review");
      expect(review.reviewPipeline.writingReview.stage).toBe("Writing Review");
      expect(review.reviewPipeline.formattingReview.stage).toBe("Formatting Review");
      expect(review.reviewPipeline.humanApprovalStatus.isApprovedForSubmission).toBe(false);

      expect(review.reviewPipeline.formattingReview.passed).toBe(true);
      expect(review.reviewPipeline.writingReview.passed).toBe(true);
    });

    it("flags formatting review when text contains raw asterisks and dashes", async () => {
      const dirtyProposal = `### Executive Summary\n**Shugaland** solves real estate — with robust AI tools.`;
      const review = await aiService.reviewProposal(dirtyProposal);

      expect(review.reviewPipeline.formattingReview.passed).toBe(false);
      expect(review.reviewPipeline.writingReview.passed).toBe(false);
    });
  });

  describe("Explainable Grant Matching & 10-Dimension Screening", () => {
    it("provides explainable breakdown across all 10 criteria and 10 screening dimensions", () => {
      const testGrant = VERIFIED_GRANTS[0]!;
      const match = matchingService.matchGrantOpportunity(
        testGrant,
        {
          projectName: "Shugaland Escrow Infrastructure",
          orgName: "Shugaland",
          orgType: "Startup",
          problemStatement: "Property seekers lack verified agents and secure transactions.",
          solutionStatement: "Building verified agent infrastructure with transaction escrow.",
          industry: "PropTech",
          sector: "Technology",
          country: "Nigeria",
          targetBeneficiaries: "Local property buyers and diaspora investors",
          stage: "Seed",
          fundingRequirement: 150000,
          hasIncorporation: true,
          hasAuditedFinancials: false,
          traction: "271 registered users and 4 completed transactions.",
        },
        true
      );

      // Explainable match criteria
      expect(match.explainableMatch).toBeDefined();
      expect(match.explainableMatch.country).toMatch(/Strong match|Moderate match|Weak match/);
      expect(match.explainableMatch.sector).toBeDefined();
      expect(match.explainableMatch.whyThisOpportunityFits).toBeDefined();
      expect(match.explainableMatch.whatMakesApplicantCompetitive).toBeDefined();
      expect(match.explainableMatch.whatCouldCauseRejection).toBeDefined();
      expect(match.explainableMatch.whatShouldBeImprovedBeforeApplying).toBeDefined();

      // AI Screening across 10 dimensions
      expect(match.screeningEvaluation).toHaveLength(10);
      const dimensions = match.screeningEvaluation.map((s) => s.dimension);
      expect(dimensions).toContain("Identity readiness");
      expect(dimensions).toContain("Eligibility");
      expect(dimensions).toContain("Problem and solution clarity");
      expect(dimensions).toContain("Financial readiness");
      expect(dimensions).toContain("Impact readiness");
      expect(dimensions).toContain("Proposal readiness");
      expect(dimensions).toContain("Data room completeness");
      expect(dimensions).toContain("Team readiness");
      expect(dimensions).toContain("Past funding");
      expect(dimensions).toContain("Application readiness");

      for (const evalItem of match.screeningEvaluation) {
        expect(evalItem.finding).toBeDefined();
        expect(evalItem.reason).toBeDefined();
        expect(evalItem.evidence).toBeDefined();
        expect(evalItem.confidence).toBeGreaterThan(0);
        expect(evalItem.recommendedAction).toBeDefined();
        expect(evalItem.humanReviewStatus).toBeDefined();
      }
    });
  });

  describe("Proposal Studio Clean Budget Narrative", () => {
    it("generates budget narrative without raw markdown hashes, asterisks, or dashes", () => {
      const narrative = ProposalStudioService.generateBudgetNarrative(
        [
          {
            id: "b1",
            category: "personnel",
            description: "Lead Technical Architect",
            unitCost: 2500,
            quantity: 12,
            totalCost: 30000,
            currency: "USD",
          },
          {
            id: "b2",
            category: "operations",
            description: "Field Verification Pilot in Lagos and Abuja",
            unitCost: 5000,
            quantity: 2,
            totalCost: 10000,
            currency: "USD",
          },
        ],
        "USD"
      );

      expect(narrative).not.toContain("###");
      expect(narrative).not.toContain("####");
      expect(narrative).not.toContain("**");
      expect(narrative).not.toContain("—");
      expect(narrative).toContain("Financial Proposal and Budget Justification (USD)");
      expect(narrative).toContain("Total Requested Budget: USD 40,000");
      expect(narrative).toContain("Lead Technical Architect");
    });
  });
});
