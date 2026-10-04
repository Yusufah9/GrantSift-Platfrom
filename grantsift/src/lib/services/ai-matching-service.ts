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
  matchedCharacteristics: string[];
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
  potentialConcerns: string[];
  missingInformation: string[];
  recommendedNextAction: string;
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
   * Performs real, project-driven grant and foundation matching with rich reasoning (PRD §8).
   * Strict adherence to human writing style: no buzzwords, no dash syntax.
   */
  analyzeProjectMatches(project: ProjectAnalysisProfile): ProjectRunAnalysisReport {
    const matchedGrants: DetailedGrantMatch[] = [];

    for (const grant of VERIFIED_GRANTS) {
      let score = 20;
      const matchedCharacteristics: string[] = [];
      const potentialConcerns: string[] = [];
      const missingInfo: string[] = [];

      // 1. Geographic compatibility check
      const countryMatches =
        grant.eligibility.countries.includes("Global") ||
        grant.eligibility.countries.some((c) => c.toLowerCase() === project.country.toLowerCase()) ||
        (project.country.toLowerCase() === "nigeria" &&
          (grant.eligibility.regions.includes("Sub-Saharan Africa") || grant.eligibility.regions.includes("West Africa")));

      let geoStatus: DetailedGrantMatch["geographicCompatibility"]["status"] = "Restricted";
      let geoDetails = "";

      if (countryMatches) {
        score += 25;
        geoStatus = "Fully Eligible";
        geoDetails = `Applicant country (${project.country}) is explicitly listed in the funder's priority target jurisdictions.`;
        matchedCharacteristics.push(`Target operating geography (${project.country}) meets funder guidelines.`);
      } else {
        geoStatus = "Restricted";
        geoDetails = `Funder currently specifies focus in ${grant.eligibility.countries.slice(0, 3).join(", ")}.`;
        potentialConcerns.push(`Geographic restriction: Funder prioritizes ${grant.eligibility.countries.slice(0, 3).join(", ")}.`);
      }

      // 2. Sector and Focus Areas check
      const pSector = project.sector.toLowerCase();
      const pIndustry = project.industry.toLowerCase();
      const sectorMatches =
        grant.eligibility.sector.some((s) => s.toLowerCase().includes(pSector) || pSector.includes(s.toLowerCase())) ||
        grant.focusAreas.some((fa) => fa.toLowerCase().includes(pSector) || fa.toLowerCase().includes(pIndustry));

      let sectorStatus: DetailedGrantMatch["sectorCompatibility"]["status"] = "Broad Category";
      let sectorDetails = "";

      if (sectorMatches) {
        score += 25;
        sectorStatus = "Direct Focus";
        sectorDetails = `The project focus area matches the grant mandate in ${grant.eligibility.sector.join(", ")}.`;
        matchedCharacteristics.push(`Primary sector alignment with ${grant.eligibility.sector[0]} mandate.`);
      } else {
        score += 5;
        sectorStatus = "Adjacent Alignment";
        sectorDetails = `Funder focuses on ${grant.eligibility.sector.join(", ")}, which relates to your activities.`;
        potentialConcerns.push(`Sector variance: Proposal must articulate clear linkages to ${grant.eligibility.sector[0]}.`);
      }

      // 3. Organization Type check
      const typeMatches =
        grant.eligibility.organizationTypes.includes("Any") ||
        grant.eligibility.organizationTypes.some((t) => t.toLowerCase() === project.orgType.toLowerCase()) ||
        (grant.eligibility.organizationTypes.includes("Startup") && project.orgType === "SME");

      if (typeMatches) {
        score += 15;
        matchedCharacteristics.push(`Legal organization type (${project.orgType}) is acceptable to the funder.`);
      } else {
        potentialConcerns.push(`Funder typically targets ${grant.eligibility.organizationTypes.join(", ")} applicants.`);
      }

      // 4. Funding Compatibility check
      let fundingStatus: DetailedGrantMatch["fundingCompatibility"]["status"] = "Well Aligned";
      let fundingDetails = "";
      const req = project.fundingRequirement;
      const min = grant.funding.minimumAward ?? 0;
      const max = grant.funding.maximumAward ?? 1000000;

      if (req >= min && req <= max) {
        score += 15;
        fundingStatus = "Well Aligned";
        fundingDetails = `Requested budget ($${req.toLocaleString()}) sits comfortably within the grant range ($${min.toLocaleString()} to $${max.toLocaleString()} ${grant.funding.currency}).`;
        matchedCharacteristics.push(`Budget requirement fits within the published award tranche.`);
      } else if (req > max) {
        fundingStatus = "Above Cap";
        fundingDetails = `Requested amount ($${req.toLocaleString()}) exceeds published maximum grant of $${max.toLocaleString()} ${grant.funding.currency}.`;
        potentialConcerns.push(`Budget exceeds the single-award cap. Consider pitching a phased pilot.`);
      } else {
        fundingStatus = "Below Threshold";
        fundingDetails = `Requested amount is lower than typical grant tranche.`;
      }

      // Missing information detection
      if (!project.hasIncorporation) {
        missingInfo.push("Official Certificate of Incorporation document required by funder.");
      }
      if (grant.application.requiredDocuments.includes("Audited Financial Statements (Latest 2 Years)") && !project.hasAuditedFinancials) {
        missingInfo.push("Two fiscal years of audited balance sheet and profit/loss statements.");
      }
      if (!project.traction || project.traction.length < 20) {
        missingInfo.push("Documented baseline metrics: number of verified beneficiaries or customers.");
      }

      // Eligibility Synthesis
      let elStatus: DetailedGrantMatch["eligibilityCompatibility"]["status"] = "Eligible";
      let elDetails = "The project satisfies core jurisdictional, legal, and sector criteria.";

      if (!countryMatches) {
        elStatus = "Ineligible";
        elDetails = "The organization country does not align with published geographical guidelines.";
      } else if (potentialConcerns.length > 1) {
        elStatus = "Possibly Eligible";
        elDetails = "Eligible on core parameters, but requires addressing specific documentation or stage requirements.";
      }

      const finalScore = Math.min(98, Math.max(25, score));
      const compLevel: DetailedGrantMatch["compatibilityLevel"] =
        finalScore >= 80 ? "High" : finalScore >= 55 ? "Moderate" : "Exploratory";

      // Formulate detailed, human-style explanation without buzzwords
      const relevanceExplanation = `This opportunity offers non-dilutive capital for initiatives in ${grant.eligibility.sector.join(
        ", "
      )}. Your project addresses ${project.problemStatement.slice(0, 90)}..., which aligns with their mandate to support practical solutions in ${project.country}.`;

      const recommendedNextAction =
        elStatus === "Eligible"
          ? "Begin drafting the concept note and prepare required Data Room documents."
          : elStatus === "Possibly Eligible"
          ? "Confirm whether partnerships with local registered entities can fulfill compliance criteria."
          : "Monitor upcoming funding cycles or explore regional consortium submissions.";

      matchedGrants.push({
        grant,
        matchScore: finalScore,
        compatibilityLevel: compLevel,
        relevanceExplanation,
        matchedCharacteristics,
        eligibilityCompatibility: { status: elStatus, details: elDetails },
        fundingCompatibility: { status: fundingStatus, details: fundingDetails },
        geographicCompatibility: { status: geoStatus, details: geoDetails },
        sectorCompatibility: { status: sectorStatus, details: sectorDetails },
        potentialConcerns,
        missingInformation: missingInfo,
        recommendedNextAction,
      });
    }

    // Sort by match score descending
    matchedGrants.sort((a, b) => b.matchScore - a.matchScore);

    // Foundation Matching (Foundations relevant even when open grant is closed)
    const matchedFunders: DetailedFunderMatch[] = [];

    for (const funder of VERIFIED_FUNDERS) {
      const geoMatch =
        funder.focusGeographies.includes("Global") ||
        funder.focusGeographies.includes("Pan-Africa") ||
        funder.focusGeographies.some((g) => g.toLowerCase().includes(project.country.toLowerCase()));

      const sectorMatch = funder.focusSectors.some(
        (s) =>
          s.toLowerCase().includes(project.sector.toLowerCase()) ||
          project.sector.toLowerCase().includes(s.toLowerCase())
      );

      if (geoMatch || sectorMatch) {
        const openOpps = matchedGrants.filter((mg) => mg.grant.funderName === funder.name).map((mg) => mg.grant);

        matchedFunders.push({
          funder,
          relevanceExplanation: `${funder.name} maintains ongoing philanthropic giving in ${funder.focusSectors.join(
            ", "
          )} across ${funder.focusGeographies.join(", ")}.`,
          whyRelevant: `They have disbursed ${funder.historicalGivingSummary} and prioritize ${funder.givingPreferences?.slice(0, 2).join("; ") || "community-anchored programs"}.`,
          matchedThematicAreas: funder.focusSectors.filter(
            (s) =>
              s.toLowerCase().includes(project.sector.toLowerCase()) ||
              project.sector.toLowerCase().includes(s.toLowerCase())
          ),
          alignmentNotes: `Historical giving focuses on ${funder.typicalGrantSize.currency} ${funder.typicalGrantSize.min?.toLocaleString()} to ${funder.typicalGrantSize.max?.toLocaleString()} allocations.`,
          openOpportunities: openOpps,
          strategicApproach:
            openOpps.length > 0
              ? "Apply directly to the active funding window currently open."
              : "Prepare an unsolicited Letter of Inquiry (LOI) or initiate relationship building with program officers.",
        });
      }
    }

    const highPriorityRecommendations = [
      `Complete missing Data Room uploads: ${matchedGrants[0]?.missingInformation[0] || "Financial projections"}`,
      `Structure the proposal around verifiable community metrics in ${project.country}.`,
      "Schedule founder review 72 hours prior to the earliest deadline.",
    ];

    return {
      timestamp: new Date().toISOString(),
      projectSummary: {
        name: project.projectName,
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
