import { RUMOURSHIELD_50_GRANTS } from "@/lib/data/rumourshield-50-grants";

export interface GrantOpportunity {
  id: string;
  funderName: string;
  title: string;
  slug: string;
  description: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  deadline: string; // YYYY-MM-DD
  country: string; // specific country or "Global" or "Africa"
  eligibleCountries: string[];
  sector: string;
  industry?: string;
  applicantType: "Startup" | "SME" | "NGO" | "Social Enterprise" | "Researcher" | "Any";
  eligibilitySummary: string;
  minYearsOperating?: number;
  requiredDocuments: string[];
  applicationUrl: string;
  sourceUrl: string;
  isVerified: boolean;
  status: "open" | "closing_soon" | "upcoming" | "closed";
}

export interface MatchQuery {
  orgName: string;
  orgType: "Startup" | "SME" | "NGO" | "Social Enterprise" | "Researcher" | "Corporate";
  country: string;
  sector: string;
  fundingRequirement?: number;
  yearsOperating?: number;
  stage?: string;
  hasAuditedFinancials?: boolean;
  hasIncorporation?: boolean;
}

export interface MatchResultItem {
  grant: GrantOpportunity;
  matchScore: number; // 0 to 100
  isEligible: boolean;
  matchedReasons: string[];
  potentialGaps: string[];
}

export interface MatchmakingResponse {
  totalMatches: number;
  matches: MatchResultItem[];
  isProUser: boolean;
  requiresProUpgrade: boolean;
  proUpgradeMessage?: string;
}

/**
 * Curated opportunities matching RumourShield AI:
 * Fact checking, rumour verification, scam/fraud detection, civic tech,
 * AI innovation, and media integrity grants valid from now through December 2026.
 */
export const CURATED_GRANTS: GrantOpportunity[] = RUMOURSHIELD_50_GRANTS.map((g) => ({
  id: g.id,
  funderName: g.funderName,
  title: g.grantName,
  slug: g.id.replace(/^grant-/, ""),
  description: g.description,
  amountMin: g.funding.minimumAward || g.amountMin || 5000,
  amountMax: g.funding.maximumAward || g.amountMax || 50000,
  currency: g.funding.currency || g.currency || "USD",
  deadline: g.deadline,
  country: g.eligibility.countries.includes("Nigeria") ? "Nigeria" : (g.eligibility.countries[0] || "Global"),
  eligibleCountries: g.eligibility.countries,
  sector: g.sector || "AI",
  industry: g.eligibility.industry?.[0] || "Artificial Intelligence",
  applicantType: (g.eligibility.organizationTypes.find((t) => ["Startup", "SME", "NGO", "Social Enterprise"].includes(t)) as any) || "Startup",
  eligibilitySummary: g.shortSummary || g.description,
  minYearsOperating: 0,
  requiredDocuments: g.application.requiredDocuments || ["Pitch Deck", "Certificate of Incorporation"],
  applicationUrl: g.applicationUrl,
  sourceUrl: g.originalUrl || g.funderUrl || g.applicationUrl,
  isVerified: true,
  status: g.status === "closing_soon" ? "closing_soon" : "open",
}));

export class GrantMatchingService {
  /**
   * Matches an organization query against verified opportunities.
   * Evaluates organization attributes against all opportunities in the database.
   * Gating rule: Free users receive top 2 matches and a prompt to subscribe as a Pro user.
   * Pro users receive all matches.
   */
  match(query: MatchQuery, isProUser: boolean = false): MatchmakingResponse {
    const scoredMatches: MatchResultItem[] = [];

    for (const grant of CURATED_GRANTS) {
      let score = 30; // base potential
      const matchedReasons: string[] = [];
      const potentialGaps: string[] = [];

      // 1. Geography check
      const countryMatches =
        grant.country === "Global" ||
        grant.country === query.country ||
        grant.eligibleCountries.includes("Global") ||
        grant.eligibleCountries.some((c) => c.toLowerCase() === query.country.toLowerCase()) ||
        (grant.country === "Africa" && ["Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Uganda", "Egypt", "Tanzania"].includes(query.country));

      if (countryMatches) {
        score += 25;
        matchedReasons.push(`✓ Organization operating country (${query.country}) is eligible for funding.`);
      } else {
        potentialGaps.push(`⚠ Geographic restriction: Grant prioritizes ${grant.eligibleCountries.slice(0, 3).join(", ")}.`);
      }

      // 2. Sector check
      const sectorMatches =
        grant.sector.toLowerCase().includes(query.sector.toLowerCase()) ||
        query.sector.toLowerCase().includes(grant.sector.toLowerCase()) ||
        grant.sector === "Technology" ||
        grant.sector === "AI";

      if (sectorMatches) {
        score += 25;
        matchedReasons.push(`✓ Sector alignment: Target industry matches funder focal area (${grant.sector}).`);
      } else {
        score += 5;
        potentialGaps.push(`⚠ Sector variance: Funder primary focus is ${grant.sector}.`);
      }

      // 3. Organization Type check
      const typeMatches =
        grant.applicantType === "Any" ||
        grant.applicantType === query.orgType ||
        (grant.applicantType === "Startup" && query.orgType === "SME") ||
        (grant.applicantType === "Social Enterprise" && query.orgType === "NGO");

      if (typeMatches) {
        score += 20;
        matchedReasons.push(`✓ Organization legal structure (${query.orgType}) satisfies eligibility criteria.`);
      } else {
        potentialGaps.push(`⚠ Funder typically prioritizes ${grant.applicantType} applicants.`);
      }

      // 4. Funding Amount Check
      if (query.fundingRequirement) {
        if (query.fundingRequirement >= grant.amountMin && query.fundingRequirement <= grant.amountMax) {
          matchedReasons.push(
            `✓ Funding requirement ($${query.fundingRequirement.toLocaleString()}) falls squarely within published award band ($${grant.amountMin.toLocaleString()} – $${grant.amountMax.toLocaleString()}).`
          );
        } else if (query.fundingRequirement > grant.amountMax) {
          potentialGaps.push(
            `⚠ Funding requirement exceeds maximum grant tranche ($${grant.amountMax.toLocaleString()} ${grant.currency}).`
          );
        }
      }

      // 5. Operating Experience check
      if (grant.minYearsOperating && (query.yearsOperating ?? 1) < grant.minYearsOperating) {
        potentialGaps.push(`⚠ Minimum operating age requirement: funder specifies ${grant.minYearsOperating}+ years.`);
      }

      // 6. Incorporation & Financials check
      if (query.hasIncorporation === false) {
        potentialGaps.push("⚠ Incorporation document required before grant contract execution.");
      }
      if (grant.requiredDocuments.includes("2-Year Audited Financials") && query.hasAuditedFinancials === false) {
        potentialGaps.push("⚠ Audited accounts requested by funder.");
      }

      const finalScore = Math.min(100, Math.max(20, score));
      const isEligible = countryMatches && (sectorMatches || typeMatches);

      scoredMatches.push({
        grant,
        matchScore: finalScore,
        isEligible,
        matchedReasons,
        potentialGaps,
      });
    }

    // Sort by highest match score first
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    const totalMatches = scoredMatches.length;

    // GATING LOGIC: Free users get top 2 preview matches
    if (!isProUser) {
      return {
        totalMatches,
        matches: scoredMatches.slice(0, 2),
        isProUser: false,
        requiresProUpgrade: true,
        proUpgradeMessage:
          "Subscribe as a Pro user to unlock access to all 50 verified grants, direct application URLs, AI proposal writing, and full application management.",
      };
    }

    return {
      totalMatches,
      matches: scoredMatches,
      isProUser: true,
      requiresProUpgrade: false,
    };
  }
}
