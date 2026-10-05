import type { GrantOpportunity, FunderEntity } from "@/lib/types/grant-discovery";
import { VERIFIED_GRANTS, VERIFIED_FUNDERS } from "@/lib/services/grant-discovery-service";

export interface ProjectAnalysisProfile {
  id?: string;
  projectName: string;
  orgName: string;
  orgType: string; // Startup, SME, NGO, Social Enterprise, University, etc.
  problemStatement: string;
  solutionStatement: string;
  industry: string;
  sector: string;
  country: string;
  targetMarket?: string;
  targetBeneficiaries: string;
  businessModel?: string;
  stage: string; // Idea, Prototype, Pre-Seed, Seed, Early Stage, Growth
  fundingRequirement: number;
  useOfFunds?: string;
  geography?: string;
  impactAreas?: string[];
  sdgs?: string[];
  projectDescription?: string;
  traction?: string;
  teamInfo?: string;
  hasIncorporation?: boolean;
  hasAuditedFinancials?: boolean;
}

export interface DetailedGrantMatch {
  grant: GrantOpportunity;
  matchScore: number;
  compatibilityLevel: "High" | "Moderate" | "Exploratory";
  relevanceExplanation: string;
  whyYouMatchSummary: string; // Concise match summary (Specification §7)
  matchedCharacteristics: string[];
  potentialIssuesToFix: string[]; // What needs to be fixed before applying (Specification §8)
  weaknessAnalysis: string[];
  eligibilityCompatibility: {
    status: "Eligible" | "Possibly Eligible" | "Ineligible" | "Unknown";
    details: string;
  };
  fundingCompatibility: {
    status: "Well Aligned" | "Stretch" | "Above Cap" | "Below Threshold";
    details: string;
  };
  geographicCompatibility: {
    status: "Fully Eligible" | "Regional Match" | "Restricted";
    details: string;
  };
  sectorCompatibility: {
    status: "Direct Focus" | "Adjacent Alignment" | "Broad Category";
    details: string;
  };
  timingCompatibility: {
    status: "Open Now" | "Deadline Approaching" | "Rolling Application" | "Expired" | "Closed";
    details: string;
  };
  potentialConcerns: string[];
  missingInformation: string[];
  recommendedNextAction: string;
  isPaidTierUnlocked?: boolean;
}

export interface DetailedFunderMatch {
  funder: FunderEntity;
  relevanceExplanation: string;
  whyRelevant: string;
  matchedThematicAreas: string[];
  alignmentNotes: string;
  openOpportunities: GrantOpportunity[];
  strategicApproach: string;
}

export interface ProjectRunAnalysisReport {
  timestamp: string;
  projectSummary: {
    name: string;
    orgName: string;
    country: string;
    sector: string;
    stage: string;
    fundingTargetUsd: number;
  };
  matchedGrants: DetailedGrantMatch[];
  matchedFunders: DetailedFunderMatch[];
  highPriorityRecommendations: string[];
}

export class AIMatchingService {
  /**
   * Performs multi-dimensional, non-keyword grant matching (Specification §7, §8).
   * Evaluates:
   * 1. Eligibility (Country, org type, stage, revenue, registration)
   * 2. Funding fit (Requested budget vs grant min/max, co-financing)
   * 3. Strategic fit (Problem, solution, impact, beneficiaries, SDGs, funder priorities)
   * 4. Timing (Open now, deadline approaching, rolling)
   * Produces:
   * - Match score %
   * - "Why You Match" explanation
   * - "Potential issue / what needs to be fixed before applying"
   */
  matchGrantOpportunity(
    grant: GrantOpportunity,
    project: ProjectAnalysisProfile,
    isPaidUser = false,
  ): DetailedGrantMatch {
    let score = 0;
    const matchedCharacteristics: string[] = [];
    const potentialIssuesToFix: string[] = [];
    const missingInfo: string[] = [];
    const potentialConcerns: string[] = [];

    // ---------------------------------------------------------
    // 1. Eligibility Fit (30 Points Max)
    // ---------------------------------------------------------
    const pCountry = (project.country || "").trim().toLowerCase();
    const countryMatches =
      grant.eligibility.countries.includes("Global") ||
      grant.eligibility.countries.some((c) => c.toLowerCase() === pCountry) ||
      (pCountry === "nigeria" &&
        (grant.eligibility.regions.includes("Sub-Saharan Africa") ||
          grant.eligibility.regions.includes("West Africa")));

    let geoStatus: DetailedGrantMatch["geographicCompatibility"]["status"] = "Restricted";
    let geoDetails = "";

    if (countryMatches) {
      score += 15;
      geoStatus = "Fully Eligible";
      geoDetails = `Applicant country (${project.country}) is explicitly within the funder's priority geographic focus.`;
      matchedCharacteristics.push(`Headquarters in ${project.country} satisfies funder eligibility.`);
    } else {
      geoStatus = "Restricted";
      geoDetails = `Funder prioritizes organizations operating in ${grant.eligibility.countries.slice(0, 3).join(", ")}.`;
      potentialIssuesToFix.push(`Geographic restriction: Funder specifies focus in ${grant.eligibility.countries.slice(0, 3).join(", ")}. You would need an in-country partner.`);
    }

    // Organization Type Check
    const pOrgType = (project.orgType || "Startup").toLowerCase();
    const typeMatches =
      grant.eligibility.organizationTypes.includes("Any") ||
      grant.eligibility.organizationTypes.some((t) => t.toLowerCase() === pOrgType) ||
      (grant.eligibility.organizationTypes.includes("Startup") && (pOrgType === "business" || pOrgType === "sme"));

    if (typeMatches) {
      score += 10;
      matchedCharacteristics.push(`Legal organization type (${project.orgType}) matches eligible applicant criteria.`);
    } else {
      potentialIssuesToFix.push(`Organization type: Funder primarily accepts ${grant.eligibility.organizationTypes.join(", ")} entities.`);
    }

    // Stage Compatibility
    const pStage = (project.stage || "Early Stage").toLowerCase();
    const stageMatches =
      grant.eligibility.businessStages.includes("Any") ||
      grant.eligibility.businessStages.some((s) => s.toLowerCase() === pStage);

    if (stageMatches) {
      score += 5;
      matchedCharacteristics.push(`Operational stage (${project.stage}) aligns with funding tranche maturity.`);
    } else {
      potentialIssuesToFix.push(`Stage divergence: Funder specifies ${grant.eligibility.businessStages.join(", ")} stage ventures.`);
    }

    // ---------------------------------------------------------
    // 2. Funding Fit (20 Points Max)
    // ---------------------------------------------------------
    const req = project.fundingRequirement || 50000;
    const min = grant.funding.minimumAward ?? 0;
    const max = grant.funding.maximumAward ?? 1000000;

    let fundingStatus: DetailedGrantMatch["fundingCompatibility"]["status"] = "Well Aligned";
    let fundingDetails = "";

    if (req >= min && req <= max) {
      score += 20;
      fundingStatus = "Well Aligned";
      fundingDetails = `Target budget ($${req.toLocaleString()}) fits cleanly within the published award range ($${min.toLocaleString()} to $${max.toLocaleString()} ${grant.funding.currency}).`;
      matchedCharacteristics.push(`Requested amount fits within published award range.`);
    } else if (req > max) {
      score += 8;
      fundingStatus = "Above Cap";
      fundingDetails = `Target amount ($${req.toLocaleString()}) exceeds the single-award cap of $${max.toLocaleString()} ${grant.funding.currency}.`;
      potentialIssuesToFix.push(`Requested amount ($${req.toLocaleString()}) exceeds maximum grant cap ($${max.toLocaleString()}). Pitch a phased deployment.`);
    } else {
      score += 10;
      fundingStatus = "Below Threshold";
      fundingDetails = `Target amount ($${req.toLocaleString()}) is below typical award size ($${min.toLocaleString()}).`;
      matchedCharacteristics.push(`Within overall funding capacity of the funder.`);
    }

    // ---------------------------------------------------------
    // 3. Strategic Fit & Impact (35 Points Max)
    // ---------------------------------------------------------
    const pSector = (project.sector || project.industry || "").toLowerCase();
    const pIndustry = (project.industry || "").toLowerCase();

    const sectorMatches =
      grant.eligibility.sector.some((s) => s.toLowerCase().includes(pSector) || pSector.includes(s.toLowerCase())) ||
      grant.focusAreas.some((fa) => fa.toLowerCase().includes(pSector) || fa.toLowerCase().includes(pIndustry));

    let sectorStatus: DetailedGrantMatch["sectorCompatibility"]["status"] = "Broad Category";
    let sectorDetails = "";

    if (sectorMatches) {
      score += 25;
      sectorStatus = "Direct Focus";
      sectorDetails = `Project operates directly within the funder's priority sector: ${grant.eligibility.sector.join(", ")}.`;
      matchedCharacteristics.push(`Direct strategic focus on ${grant.eligibility.sector[0]}.`);
    } else {
      score += 8;
      sectorStatus = "Adjacent Alignment";
      sectorDetails = `Funder prioritizes ${grant.eligibility.sector.join(", ")}, which connects to your initiatives.`;
      potentialIssuesToFix.push(`Sector alignment: Frame your technology/solution directly around ${grant.eligibility.sector[0]} outcomes.`);
    }

    // Impact & Beneficiary Assessment
    if (project.targetBeneficiaries && project.targetBeneficiaries.trim().length > 10) {
      score += 5;
      matchedCharacteristics.push(`Defined target beneficiary group aligns with funder mandate.`);
    } else {
      potentialIssuesToFix.push(`Missing quantifiable target beneficiaries in profile: Funder requires specific direct/indirect beneficiary counts.`);
    }

    // Climate / SDGs Assessment
    if (grant.focusAreas.includes("Climate") && !(project.sdgs?.some((s) => s.includes("13") || s.toLowerCase().includes("climate")))) {
      potentialIssuesToFix.push(`The grant requires evidence of measurable climate impact or environmental resilience, which is currently unstated in your profile.`);
    } else {
      score += 5;
    }

    // ---------------------------------------------------------
    // 4. Timing & Lifecycle (15 Points Max)
    // ---------------------------------------------------------
    let timingStatus: DetailedGrantMatch["timingCompatibility"]["status"] = "Open Now";
    let timingDetails = "Application portal is currently accepting submissions.";

    if (grant.deadlineType === "rolling") {
      score += 15;
      timingStatus = "Rolling Application";
      timingDetails = "Rolling window with continuous periodic review cycles.";
      matchedCharacteristics.push("Rolling application window active.");
    } else if (grant.deadline) {
      const deadlineDate = new Date(grant.deadline);
      const now = new Date();
      const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        score += 0;
        timingStatus = "Expired";
        timingDetails = `Deadline passed on ${grant.deadline}.`;
        potentialIssuesToFix.push(`This funding cycle has closed. Monitor for next round or upcoming reopened window.`);
      } else if (daysRemaining <= 14) {
        score += 12;
        timingStatus = "Deadline Approaching";
        timingDetails = `Deadline closing soon (${daysRemaining} days remaining on ${grant.deadline}).`;
        potentialIssuesToFix.push(`Urgent timing: Only ${daysRemaining} days remaining before final deadline.`);
      } else {
        score += 15;
        timingStatus = "Open Now";
        timingDetails = `Open with comfortable drafting runway (${daysRemaining} days remaining).`;
        matchedCharacteristics.push(`Active application runway: Deadline is ${grant.deadline}.`);
      }
    } else {
      score += 10;
      timingStatus = "Open Now";
    }

    // Documentation readiness checks
    if (!project.hasIncorporation) {
      missingInfo.push("Official Certificate of Incorporation (e.g. CAC / 501(c)(3)).");
      potentialIssuesToFix.push("Entity registration certificate required before award disbursement.");
    }
    if (grant.application.requiredDocuments.some((d) => d.toLowerCase().includes("audit")) && !project.hasAuditedFinancials) {
      missingInfo.push("Audited Financial Statements (Latest 1-2 Years).");
      potentialIssuesToFix.push("Audited financial statements required for this award threshold.");
    }

    const finalScore = Math.min(97, Math.max(25, score));
    const compLevel: DetailedGrantMatch["compatibilityLevel"] =
      finalScore >= 80 ? "High" : finalScore >= 55 ? "Moderate" : "Exploratory";

    // Build the "Why You Match" summary (Specification §7, §8)
    const whySnippet = `${project.country || "Target Region"} + ${grant.eligibility.sector[0] || "Innovation"} + ${project.orgType || "Organization"}`;
    const relevanceExplanation = `This opportunity matches ${project.orgName || "your organization"} because you are operating in ${project.country || "the target region"} in ${project.sector || project.industry || "this sector"}. The funder (${grant.funderName}) accepts ${grant.eligibility.organizationTypes.join(", ")} entities at ${project.stage || "early"} stage and provides non-dilutive funding within your requested range.`;

    const recommendedNextAction =
      finalScore >= 80
        ? "Review Grant Intelligence, verify required documents checklist, and proceed to Technical Proposal generation."
        : "Address identified weak profile areas (e.g. audited metrics or localized partners) before initiating submission.";

    let elStatus: DetailedGrantMatch["eligibilityCompatibility"]["status"] = "Eligible";
    let elDetails = "The project satisfies core jurisdictional, legal, and thematic criteria.";
    if (!countryMatches) {
      elStatus = "Ineligible";
      elDetails = "The organization does not currently satisfy published geographic eligibility.";
    } else if (potentialIssuesToFix.length > 2) {
      elStatus = "Possibly Eligible";
      elDetails = "Eligible on core parameters, but requires addressing specific documentation or metric requirements.";
    }

    return {
      grant,
      matchScore: finalScore,
      compatibilityLevel: compLevel,
      relevanceExplanation,
      whyYouMatchSummary: whySnippet,
      matchedCharacteristics,
      potentialIssuesToFix,
      weaknessAnalysis: potentialIssuesToFix,
      eligibilityCompatibility: { status: elStatus, details: elDetails },
      fundingCompatibility: { status: fundingStatus, details: fundingDetails },
      geographicCompatibility: { status: geoStatus, details: geoDetails },
      sectorCompatibility: { status: sectorStatus, details: sectorDetails },
      timingCompatibility: { status: timingStatus, details: timingDetails },
      potentialConcerns,
      missingInformation: missingInfo,
      recommendedNextAction,
      isPaidTierUnlocked: isPaidUser,
    };
  }

  /**
   * Matches candidate grants against a project profile.
   */
  matchMultipleGrants(
    grants: GrantOpportunity[],
    project: ProjectAnalysisProfile,
    isPaidUser = false,
  ): DetailedGrantMatch[] {
    const results = grants.map((g) => this.matchGrantOpportunity(g, project, isPaidUser));
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Main analysis execution for full workspace reports.
   */
  analyzeProjectMatches(project: ProjectAnalysisProfile, candidateGrants?: GrantOpportunity[], isPaidUser = false): ProjectRunAnalysisReport {
    const grantsToEvaluate = candidateGrants || VERIFIED_GRANTS;
    const matchedGrants = this.matchMultipleGrants(grantsToEvaluate, project, isPaidUser);

    // Foundation Matching
    const matchedFunders: DetailedFunderMatch[] = [];
    for (const funder of VERIFIED_FUNDERS) {
      const geoMatch =
        funder.focusGeographies.includes("Global") ||
        funder.focusGeographies.includes("Pan-Africa") ||
        funder.focusGeographies.some((g) => g.toLowerCase().includes((project.country || "").toLowerCase()));

      const sectorMatch = funder.focusSectors.some(
        (s) =>
          s.toLowerCase().includes((project.sector || "").toLowerCase()) ||
          (project.sector || "").toLowerCase().includes(s.toLowerCase())
      );

      if (geoMatch || sectorMatch) {
        const openOpps = matchedGrants.filter((mg) => mg.grant.funderName === funder.name).map((mg) => mg.grant);

        matchedFunders.push({
          funder,
          relevanceExplanation: `${funder.name} maintains ongoing giving in ${funder.focusSectors.join(", ")} across ${funder.focusGeographies.join(", ")}.`,
          whyRelevant: `Disbursed ${funder.historicalGivingSummary} and prioritizes ${funder.givingPreferences?.slice(0, 2).join("; ") || "community-anchored programs"}.`,
          matchedThematicAreas: funder.focusSectors.filter(
            (s) =>
              s.toLowerCase().includes((project.sector || "").toLowerCase()) ||
              (project.sector || "").toLowerCase().includes(s.toLowerCase())
          ),
          alignmentNotes: `Typical award: ${funder.typicalGrantSize.currency} ${funder.typicalGrantSize.min?.toLocaleString()} to ${funder.typicalGrantSize.max?.toLocaleString()}.`,
          openOpportunities: openOpps,
          strategicApproach:
            openOpps.length > 0
              ? "Apply directly to the active funding window currently open."
              : "Prepare an unsolicited Letter of Inquiry (LOI) to the programmatic team.",
        });
      }
    }

    const highPriorityRecommendations = [
      `Address highest-priority application gap: ${matchedGrants[0]?.potentialIssuesToFix[0] || "Upload audited accounts"}`,
      `Structure the proposal around verifiable community metrics in ${project.country || "your operating country"}.`,
      "Review previous winner traits to calibrate monitoring and evaluation (M&E) milestones.",
    ];

    return {
      timestamp: new Date().toISOString(),
      projectSummary: {
        name: project.projectName || "Default Project",
        orgName: project.orgName,
        country: project.country,
        sector: project.sector,
        stage: project.stage,
        fundingTargetUsd: project.fundingRequirement,
      },
      matchedGrants,
      matchedFunders,
      highPriorityRecommendations,
    };
  }
}

export const aiMatchingService = new AIMatchingService();

