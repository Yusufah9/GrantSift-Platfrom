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

export const CURATED_GRANTS: GrantOpportunity[] = [
  {
    id: "grant-afdb-clean-energy",
    funderName: "African Development Bank (AfDB)",
    title: "Sustainable Energy Fund for Africa (SEFA) Catalyst Grant",
    slug: "sefa-catalyst-grant",
    description: "Concessional financing and technical assistance to accelerate private sector investments in renewable energy and green innovation across Africa.",
    amountMin: 50000,
    amountMax: 500000,
    currency: "USD",
    deadline: "2026-12-15",
    country: "Africa",
    eligibleCountries: ["Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Uganda", "Tanzania", "Egypt"],
    sector: "Clean Energy",
    applicantType: "Startup",
    eligibilitySummary: "Early-stage and growth enterprises operating mini-grids, solar home systems, or energy efficiency innovations in African nations.",
    minYearsOperating: 1,
    requiredDocuments: ["Certificate of Incorporation", "Financial Model", "Environmental Impact Assessment", "Team CVs"],
    applicationUrl: "https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/sustainable-energy-fund-for-africa",
    sourceUrl: "https://www.afdb.org/sefa",
    isVerified: true,
    status: "open",
  },
  {
    id: "grant-tony-elumelu-2026",
    funderName: "Tony Elumelu Foundation",
    title: "TEF Entrepreneurship Programme Seed Grant",
    slug: "tef-entrepreneurship-programme-2026",
    description: "Seed capital, 12-week intensive business training, and pan-African mentorship for young African entrepreneurs creating sustainable jobs.",
    amountMin: 5000,
    amountMax: 50000,
    currency: "USD",
    deadline: "2026-11-30",
    country: "Africa",
    eligibleCountries: ["Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Uganda", "Cameroon", "Senegal", "Global"],
    sector: "Technology",
    applicantType: "Startup",
    eligibilitySummary: "African startups and businesses under 5 years of operation with high growth and employment potential.",
    minYearsOperating: 0,
    requiredDocuments: ["Valid Government ID", "Business Plan Draft", "Pitch Deck"],
    applicationUrl: "https://www.tefconnect.com",
    sourceUrl: "https://www.tonyelumelufoundation.org",
    isVerified: true,
    status: "open",
  },
  {
    id: "grant-usaid-agri-innovation",
    funderName: "USAID Feed the Future",
    title: "Agricultural Innovation for Food Security Grant",
    slug: "usaid-agri-food-security",
    description: "Financing deployment of climate-smart farming solutions, cold-chain preservation, and smallholder farmer value chain digital tools.",
    amountMin: 100000,
    amountMax: 1000000,
    currency: "USD",
    deadline: "2026-10-28",
    country: "Global",
    eligibleCountries: ["Nigeria", "Kenya", "Uganda", "Ghana", "Rwanda", "Ethiopia", "Malawi", "Global"],
    sector: "Agriculture",
    applicantType: "SME",
    eligibilitySummary: "Legally registered businesses and social enterprises with proven traction improving agricultural yield or market access.",
    minYearsOperating: 2,
    requiredDocuments: ["Certificate of Incorporation", "2-Year Audited Financials", "Beneficiary Verification Report"],
    applicationUrl: "https://www.feedthefuture.gov/funding",
    sourceUrl: "https://www.usaid.gov/agriculture-and-food-security",
    isVerified: true,
    status: "closing_soon",
  },
  {
    id: "grant-google-black-founders",
    funderName: "Google for Startups",
    title: "Black Founders Fund Africa",
    slug: "google-black-founders-fund-africa",
    description: "Equity-free cash award, Google Cloud credits, and dedicated 1:1 mentorship from Google engineers and industry executives.",
    amountMin: 50000,
    amountMax: 150000,
    currency: "USD",
    deadline: "2026-12-01",
    country: "Africa",
    eligibleCountries: ["Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda", "Uganda", "Senegal", "Egypt"],
    sector: "Technology",
    applicantType: "Startup",
    eligibilitySummary: "Early-stage, tech-enabled startups with at least one Black founder, operational MVP, and demonstrable user traction in Africa.",
    minYearsOperating: 1,
    requiredDocuments: ["Pitch Deck", "Demo Link", "Cap Table", "Certificate of Incorporation"],
    applicationUrl: "https://startup.google.com/programs/black-founders-fund/africa/",
    sourceUrl: "https://blog.google/around-the-globe/google-africa/",
    isVerified: true,
    status: "open",
  },
  {
    id: "grant-wellcome-trust-health",
    funderName: "Wellcome Trust",
    title: "Global Health Discovery & Translation Grant",
    slug: "wellcome-trust-health-discovery",
    description: "Major grant support for innovative point-of-care diagnostics, infectious disease surveillance, and maternal health technologies.",
    amountMin: 150000,
    amountMax: 1500000,
    currency: "USD",
    deadline: "2026-11-15",
    country: "Global",
    eligibleCountries: ["Global", "Kenya", "South Africa", "Nigeria", "United Kingdom", "United States"],
    sector: "Healthcare",
    applicantType: "Researcher",
    eligibilitySummary: "Research institutions, clinical researchers, and biotech startups developing open-access healthcare solutions.",
    minYearsOperating: 1,
    requiredDocuments: ["Institutional Letter of Endorsement", "Ethics Clearance", "Research Protocol", "Detailed Budget Justification"],
    applicationUrl: "https://wellcome.org/grant-funding",
    sourceUrl: "https://wellcome.org",
    isVerified: true,
    status: "open",
  },
  {
    id: "grant-ford-foundation-social-justice",
    funderName: "Ford Foundation",
    title: "Equitable Futures Community Impact Fund",
    slug: "ford-foundation-community-impact",
    description: "Multi-year general operating support grants for community-based non-profits advancing civic participation and social equity.",
    amountMin: 75000,
    amountMax: 300000,
    currency: "USD",
    deadline: "2026-12-31",
    country: "Global",
    eligibleCountries: ["Global", "Nigeria", "South Africa", "Kenya", "Brazil", "India"],
    sector: "Social Enterprise",
    applicantType: "NGO",
    eligibilitySummary: "Registered non-governmental organizations and social impact non-profits with proven community accountability.",
    minYearsOperating: 2,
    requiredDocuments: ["501(c)(3) or Local NGO Registration", "Audited Financials", "Governance Board Roster"],
    applicationUrl: "https://www.fordfoundation.org/work/our-grants/",
    sourceUrl: "https://www.fordfoundation.org",
    isVerified: true,
    status: "open",
  },
];

export class GrantMatchingService {
  /**
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
        grant.sector === "Technology"; // tech is broadly applicable

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
          "Subscribe as a Pro user to unlock access to all 40,000+ grants, direct application URLs, AI proposal writing, and full application management.",
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
