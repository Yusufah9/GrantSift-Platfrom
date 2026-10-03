export interface ScorecardInput {
  orgName: string;
  orgType: "Startup" | "SME" | "NGO" | "Social Enterprise" | "Researcher" | "Corporate";
  industry: string;
  country: string;
  city?: string;
  stage: "Idea / Pre-seed" | "Seed" | "Early Revenue / Growth" | "Scale";
  yearFounded: number;
  teamSize: number;
  revenue: number;
  fundingRaised: number;
  problemStatement?: string;
  targetBeneficiaries?: string;
  impactMetrics?: string;
  hasIncorporation: boolean;
  hasTaxId: boolean;
  hasAuditedFinancials: boolean;
  hasPitchDeck: boolean;
  hasBusinessPlan: boolean;
  hasLettersOfSupport: boolean;
}

export interface ScorecardResult {
  overallScore: number;
  grade: "A" | "B" | "C" | "D";
  categoryScores: {
    orgProfile: number;
    legalDocumentation: number;
    financialReadiness: number;
    impactDocumentation: number;
    teamInformation: number;
    dataRoomReadiness: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  eligibleFundingTypes: string[];
}

export function calculateReadinessScore(input: ScorecardInput): ScorecardResult {
  let profile = 40;
  if (input.orgName.trim().length > 2) profile += 20;
  if (input.industry) profile += 15;
  if (input.country) profile += 15;
  if (input.stage) profile += 10;
  profile = Math.min(100, profile);

  let legal = 20;
  if (input.hasIncorporation) legal += 35;
  if (input.hasTaxId) legal += 25;
  if (input.hasAuditedFinancials) legal += 20;
  legal = Math.min(100, legal);

  let financial = 30;
  if (input.revenue > 0) financial += 30;
  if (input.fundingRaised > 0) financial += 25;
  if (input.hasAuditedFinancials) financial += 15;
  financial = Math.min(100, financial);

  let impact = 35;
  if (input.problemStatement && input.problemStatement.length > 20) impact += 25;
  if (input.targetBeneficiaries && input.targetBeneficiaries.length > 10) impact += 20;
  if (input.impactMetrics && input.impactMetrics.length > 10) impact += 20;
  impact = Math.min(100, impact);

  let team = 40;
  if (input.teamSize >= 2) team += 25;
  if (input.teamSize >= 5) team += 15;
  if (input.yearFounded > 2000) team += 20;
  team = Math.min(100, team);

  let dataRoom = 25;
  if (input.hasPitchDeck) dataRoom += 25;
  if (input.hasBusinessPlan) dataRoom += 25;
  if (input.hasLettersOfSupport) dataRoom += 25;
  dataRoom = Math.min(100, dataRoom);

  const overall = Math.round(
    profile * 0.2 +
      legal * 0.2 +
      financial * 0.2 +
      impact * 0.15 +
      team * 0.15 +
      dataRoom * 0.1,
  );

  let grade: "A" | "B" | "C" | "D" = "C";
  if (overall >= 85) grade = "A";
  else if (overall >= 70) grade = "B";
  else if (overall >= 50) grade = "C";
  else grade = "D";

  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];

  if (input.hasIncorporation && input.hasTaxId) {
    strengths.push("Established legal entity with official tax registration.");
  } else {
    gaps.push("Incomplete legal or tax registration documents for formal grant eligibility.");
    recommendations.push("Complete formal corporate registration and secure tax clearance certificates.");
  }

  if (input.hasAuditedFinancials) {
    strengths.push("Verified financial reporting and accounting credibility.");
  } else {
    gaps.push("Lack of audited financial statements or formal budget books.");
    recommendations.push("Prepare at least 1-2 years of management accounts or audited financial statements.");
  }

  if (input.hasPitchDeck && input.hasBusinessPlan) {
    strengths.push("Comprehensive business planning and commercialization roadmap.");
  } else {
    gaps.push("Missing a structured 3-year business plan or funder pitch deck.");
    recommendations.push("Upload an executive pitch deck and structured project milestone roadmap to your Data Room.");
  }

  if (input.targetBeneficiaries || input.impactMetrics) {
    strengths.push("Articulated social/economic beneficiary impact framework.");
  } else {
    gaps.push("Impact methodology lacks quantitative baseline indicators and SDG alignment.");
    recommendations.push("Define 3-5 quantifiable impact KPIs (e.g. lives reached, emissions reduced, jobs created).");
  }

  if (input.teamSize >= 3) {
    strengths.push("Operational core team capable of grant milestone execution.");
  } else {
    gaps.push("Single-founder or small team capacity risks for multi-year program execution.");
    recommendations.push("Document key team CVs, advisory board credentials, and technical leads.");
  }

  const eligibleFundingTypes: string[] = [];
  if (overall >= 75) {
    eligibleFundingTypes.push("Major International Development Grants ($100k - $1M+)");
    eligibleFundingTypes.push("Government Innovation & R&D Grants");
  }
  if (overall >= 60) {
    eligibleFundingTypes.push("Philanthropic Foundation Grants ($25k - $250k)");
    eligibleFundingTypes.push("Corporate Social Responsibility (CSR) Funds");
  }
  eligibleFundingTypes.push("Early-Stage Seed Grants & Startup Challenges ($5k - $50k)");

  return {
    overallScore: overall,
    grade,
    categoryScores: {
      orgProfile: profile,
      legalDocumentation: legal,
      financialReadiness: financial,
      impactDocumentation: impact,
      teamInformation: team,
      dataRoomReadiness: dataRoom,
    },
    strengths,
    gaps,
    recommendations,
    eligibleFundingTypes,
  };
}
