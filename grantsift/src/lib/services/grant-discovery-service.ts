import type {
  GrantOpportunity,
  FunderEntity,
  GrantSearchFilters,
} from "@/lib/types/grant-discovery";
import { RUMOURSHIELD_50_GRANTS } from "@/lib/data/rumourshield-50-grants";

/**
 * Curated and continuously verified grants from primary sources:
 * - Opportunity Square (opportunitysquare.org)
 * - MSME Africa Online (msmeafricaonline.com)
 * - Official Funder & Bilateral Program Portals
 * 
 * Filtered strictly for RumourShield AI:
 * Fact-checking, rumour verification, scam/fraud detection, civic tech,
 * AI innovation, and media integrity grants valid from now through December 2026.
 */
export const VERIFIED_GRANTS: GrantOpportunity[] = [...RUMOURSHIELD_50_GRANTS];

/**
 * Verified Foundations & Institutional Funders (PRD §6: Separate Grants and Funders)
 */
export const VERIFIED_FUNDERS: FunderEntity[] = [
  {
    id: "funder-meta",
    name: "Meta (in partnership with FMCIDE, 3MTT & NCAIR)",
    slug: "meta-nigeria-ai",
    funderType: "Corporate Foundation",
    description: "Meta's global technology and innovation programs partnering with Nigeria's Federal Ministry of Communications, Innovation and Digital Economy (FMCIDE) and NCAIR to advance AI solutions and civic tools.",
    website: "https://about.meta.com",
    sourceUrl: "https://msmeafricaonline.com/meta-ai-academy-nigeria-pitchathon-2026",
    headquartersCountry: "United States",
    focusGeographies: ["Nigeria", "Global"],
    focusSectors: ["Artificial Intelligence", "Civic Tech", "Developer Ecosystems"],
    historicalGivingSummary: "Provides non-dilutive pitch prizes, compute credits, and global technical mentorship.",
    typicalGrantSize: { min: 5000, max: 50000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Open-source AI and Llama ecosystem", "Civic problem solving in Nigeria", "Youth founders"],
    notFundedExclusions: ["Closed proprietary technologies without local developer benefit"],
    lastVerifiedDate: "2026-10-10",
  },
  {
    id: "funder-safetech-africa",
    name: "SafeTech Africa & YouthConnekt Africa",
    slug: "safetech-africa",
    funderType: "Multilateral Institution",
    description: "Pan-African alliance championing online safety, child and youth digital protection, counter-disinformation tech, and safe digital civic spaces.",
    website: "https://safetechafrica.org",
    sourceUrl: "https://msmeafricaonline.com/safetech-africa-hacklab-2026",
    headquartersCountry: "Rwanda",
    focusGeographies: ["Pan-Africa", "Nigeria", "Kenya", "Ghana", "Rwanda"],
    focusSectors: ["Online Safety", "Artificial Intelligence", "Civic Tech"],
    historicalGivingSummary: "Seed grant prizes and technical visibility at YouthConnekt Africa Summit.",
    typicalGrantSize: { min: 5000, max: 10000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Solutions protecting citizens from online scams and hate speech", "Youth-led teams"],
    notFundedExclusions: ["Non-scalable manual advisory without software"],
    lastVerifiedDate: "2026-10-08",
  },
  {
    id: "funder-mest-africa",
    name: "Meltwater Entrepreneurial School of Technology (MEST)",
    slug: "mest-africa",
    funderType: "Venture Philanthropy",
    description: "Pan-African software entrepreneurship school and incubator supporting African technology startups with seed capital and executive coaching.",
    website: "https://meltwater.org",
    sourceUrl: "https://msmeafricaonline.com/mest-ai-startup-program-2026",
    headquartersCountry: "Ghana",
    focusGeographies: ["Pan-Africa", "Nigeria", "Ghana", "Kenya", "South Africa"],
    focusSectors: ["Artificial Intelligence", "Enterprise Software", "Civic Tech"],
    historicalGivingSummary: "Invested in over 90 African software startups across 15+ years.",
    typicalGrantSize: { min: 50000, max: 100000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Technical software teams", "Scalable multi-market business models"],
    notFundedExclusions: ["Non-technical consulting agencies"],
    lastVerifiedDate: "2026-10-09",
  },
  {
    id: "funder-google-org",
    name: "Google.org",
    slug: "google-org",
    funderType: "Corporate Foundation",
    description: "Philanthropic arm of Google providing grant funding, Google employee volunteers, and technical resources to nonprofits and social innovators.",
    website: "https://www.google.org",
    sourceUrl: "https://impactchallenge.withgoogle.com",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "Sub-Saharan Africa"],
    focusSectors: ["Artificial Intelligence for Good", "Information Integrity", "Civic Tech"],
    historicalGivingSummary: "Provides over $100M annually in grants and 200,000+ hours of employee technical pro bono services.",
    typicalGrantSize: { min: 100000, max: 1000000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Open source AI models and public goods", "Fact-checking and evidence-backed social impact"],
    notFundedExclusions: ["Political lobbying and closed proprietary platforms"],
    lastVerifiedDate: "2026-10-05",
  },
  {
    id: "funder-open-technology-fund",
    name: "Open Technology Fund (OTF)",
    slug: "open-technology-fund",
    funderType: "Government",
    description: "Supports open technology projects that advance internet freedom, combat digital censorship, counter disinformation campaigns, and protect human rights defenders worldwide.",
    website: "https://www.opentech.fund",
    sourceUrl: "https://www.opentech.fund/funds/internet-freedom-fund",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "Sub-Saharan Africa"],
    focusSectors: ["Internet Freedom", "Anti-Censorship", "Civic Tech", "Artificial Intelligence"],
    historicalGivingSummary: "Has supported hundreds of privacy, fact-checking, and secure communications tools.",
    typicalGrantSize: { min: 10000, max: 300000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Open source tools", "Cryptographic verifiable data", "Threat mitigation in restrictive environments"],
    notFundedExclusions: ["Proprietary closed-source codebases"],
    lastVerifiedDate: "2026-10-11",
  },
  {
    id: "funder-ned",
    name: "National Endowment for Democracy (NED)",
    slug: "national-endowment-for-democracy",
    funderType: "Private Foundation",
    description: "Supports non-governmental organizations and civic innovators worldwide working for democratic goals and free information ecosystems.",
    website: "https://www.ned.org",
    sourceUrl: "https://www.ned.org/apply-for-grant",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "West Africa", "Nigeria"],
    focusSectors: ["Democratic Governance", "Independent Media", "Counter-Disinformation"],
    historicalGivingSummary: "Makes more than 2,000 grants annually in 100+ countries.",
    typicalGrantSize: { min: 25000, max: 150000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Non-partisan civic initiatives", "Media literacy and election integrity"],
    notFundedExclusions: ["Partisan political campaigns"],
    lastVerifiedDate: "2026-10-09",
  },
  {
    id: "funder-poynter-ifcn",
    name: "International Fact-Checking Network (IFCN) at Poynter",
    slug: "ifcn-poynter",
    funderType: "Private Foundation",
    description: "Global alliance promoting fact-checking standards, journalistic accountability, and technological tools to verify information before it spreads.",
    website: "https://www.poynter.org/ifcn",
    sourceUrl: "https://opportunitysquare.org/grants-zone/ifcn-global-fact-checking-fund",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "Sub-Saharan Africa"],
    focusSectors: ["Fact Checking", "Artificial Intelligence", "Media Literacy"],
    historicalGivingSummary: "Administers the Global Fact-Checking Fund supported by Google and YouTube.",
    typicalGrantSize: { min: 25000, max: 100000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Adherence to Code of Principles", "Automated claim-checking tools", "Multilingual verification"],
    notFundedExclusions: ["Unverified sources and non-transparent corrections policies"],
    lastVerifiedDate: "2026-10-06",
  },
  {
    id: "funder-tony-elumelu",
    name: "Tony Elumelu Foundation",
    slug: "tony-elumelu-foundation",
    funderType: "Private Foundation",
    description: "Leading philanthropic initiative championing entrepreneurship in Africa, driven by the philosophy of Africapitalism.",
    website: "https://www.tonyelumelufoundation.org",
    sourceUrl: "https://www.tefconnect.com",
    headquartersCountry: "Nigeria",
    focusGeographies: ["Pan-Africa", "All 54 African Countries"],
    focusSectors: ["Technology", "Artificial Intelligence", "Media", "Entrepreneurship"],
    historicalGivingSummary: "Over $100M disbursed to more than 20,000 young African entrepreneurs across 54 countries.",
    typicalGrantSize: { min: 5000, max: 5000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Early-stage job creators", "Tech-enabled platforms", "Youth founders aged 18-35"],
    notFundedExclusions: ["Personal debt refinancing", "Political or religious groups"],
    lastVerifiedDate: "2026-10-08",
  },
  {
    id: "funder-luminate",
    name: "Luminate Group",
    slug: "luminate-group",
    funderType: "Venture Philanthropy",
    description: "Global philanthropic foundation part of The Omidyar Group, supporting organizations working on information integrity, platform accountability, and civic participation.",
    website: "https://www.luminategroup.com",
    sourceUrl: "https://www.luminategroup.com/funding",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "Sub-Saharan Africa"],
    focusSectors: ["Information Integrity", "Civic Tech", "Democracy"],
    historicalGivingSummary: "Invests in civic tech, independent media, and digital rights pioneers across 4 continents.",
    typicalGrantSize: { min: 50000, max: 250000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["Countering computational propaganda", "Algorithmic transparency", "Empowering citizen truth"],
    notFundedExclusions: ["Partisan advocacy groups"],
    lastVerifiedDate: "2026-10-07",
  },
  {
    id: "funder-gates-foundation",
    name: "Bill & Melinda Gates Foundation",
    slug: "gates-foundation",
    funderType: "Private Foundation",
    description: "Global philanthropic foundation committed to fighting poverty, disease, and information inequity across developing nations.",
    website: "https://www.gatesfoundation.org",
    sourceUrl: "https://gcgh.grandchallenges.org",
    headquartersCountry: "United States",
    focusGeographies: ["Global", "Sub-Saharan Africa"],
    focusSectors: ["Artificial Intelligence for Development", "Public Health Truth", "Civic Equity"],
    historicalGivingSummary: "Over $70B committed globally to health, AI innovation, and public interest technology.",
    typicalGrantSize: { min: 100000, max: 1000000, currency: "USD" },
    openOpportunitiesCount: 1,
    givingPreferences: ["AI for low-resource environments", "Global Access intellectual property commitments"],
    notFundedExclusions: ["Direct commercial software without affordable access"],
    lastVerifiedDate: "2026-10-10",
  },
];

export class GrantDiscoveryService {
  private grants: GrantOpportunity[] = [...VERIFIED_GRANTS];
  private funders: FunderEntity[] = [...VERIFIED_FUNDERS];

  /**
   * Returns exact total count of verified opportunities in system.
   * Never displays inflated marketing numbers (PRD §52).
   */
  getDatabaseStats(): { verifiedGrantsCount: number; verifiedFundersCount: number; activeGrantCount: number } {
    const active = this.grants.filter((g) => g.status === "active" || g.status === "closing_soon");
    return {
      verifiedGrantsCount: this.grants.length,
      verifiedFundersCount: this.funders.length,
      activeGrantCount: active.length,
    };
  }

  /**
   * Search and filter Grant Opportunities (PRD §4).
   */
  searchGrants(filters: GrantSearchFilters): GrantOpportunity[] {
    return this.grants.filter((grant) => {
      // 1. Text Query (Grant name, funder, description, focus areas)
      if (filters.query && filters.query.trim() !== "") {
        const q = filters.query.toLowerCase().trim();
        const matchesName = grant.grantName.toLowerCase().includes(q);
        const matchesFunder = grant.funderName.toLowerCase().includes(q);
        const matchesDesc = grant.description.toLowerCase().includes(q);
        const matchesFocus = grant.focusAreas.some((fa) => fa.toLowerCase().includes(q));
        const matchesCountry = grant.eligibility.countries.some((c) => c.toLowerCase().includes(q));
        const matchesSector = grant.eligibility.sector.some((s) => s.toLowerCase().includes(q));

        if (!matchesName && !matchesFunder && !matchesDesc && !matchesFocus && !matchesCountry && !matchesSector) {
          return false;
        }
      }

      // 2. Sector / Category Filter
      if (filters.sector && filters.sector !== "All") {
        const matchesSector = grant.eligibility.sector.some((s) => s.toLowerCase() === filters.sector!.toLowerCase());
        const matchesFocus = grant.focusAreas.some((fa) => fa.toLowerCase() === filters.sector!.toLowerCase());
        if (!matchesSector && !matchesFocus) return false;
      }

      // 3. Country / Region Filter
      if (filters.country && filters.country !== "All") {
        const countryTarget = filters.country.toLowerCase();
        const matchesCountry =
          grant.eligibility.countries.includes("Global") ||
          grant.eligibility.countries.some((c) => c.toLowerCase() === countryTarget) ||
          (countryTarget === "nigeria" && grant.eligibility.regions.includes("Sub-Saharan Africa"));
        if (!matchesCountry) return false;
      }

      // 4. Funding Amount Filter
      if (filters.fundingMin && (grant.funding.maximumAward ?? 0) < filters.fundingMin) {
        return false;
      }
      if (filters.fundingMax && (grant.funding.minimumAward ?? 0) > filters.fundingMax) {
        return false;
      }

      // 5. Grant Status Filter
      if (filters.status && filters.status !== "all") {
        if (grant.status !== filters.status) return false;
      }

      // 6. Organization Type Filter
      if (filters.organizationType && filters.organizationType !== "all") {
        const matchesOrgType =
          grant.eligibility.organizationTypes.includes("Any") ||
          grant.eligibility.organizationTypes.includes(filters.organizationType);
        if (!matchesOrgType) return false;
      }

      // 7. Startup Stage Filter
      if (filters.startupStage && filters.startupStage !== "all") {
        const matchesStage =
          grant.eligibility.businessStages.includes("Any") ||
          grant.eligibility.businessStages.includes(filters.startupStage);
        if (!matchesStage) return false;
      }

      // 8. Funder Type Filter
      if (filters.funderType && filters.funderType !== "all") {
        if (grant.funderType !== filters.funderType) return false;
      }

      return true;
    });
  }

  /**
   * Search and filter Foundations / Funders (PRD §6).
   */
  searchFunders(query?: string, sector?: string, country?: string): FunderEntity[] {
    return this.funders.filter((funder) => {
      if (query && query.trim() !== "") {
        const q = query.toLowerCase().trim();
        const matchesName = funder.name.toLowerCase().includes(q);
        const matchesDesc = funder.description.toLowerCase().includes(q);
        const matchesSector = funder.focusSectors.some((s) => s.toLowerCase().includes(q));
        const matchesGeo = funder.focusGeographies.some((g) => g.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesSector && !matchesGeo) return false;
      }

      if (sector && sector !== "All") {
        const matchesSector = funder.focusSectors.some((s) => s.toLowerCase() === sector.toLowerCase());
        if (!matchesSector) return false;
      }

      if (country && country !== "All") {
        const matchesGeo =
          funder.focusGeographies.includes("Global") ||
          funder.focusGeographies.includes("Pan-Africa") ||
          funder.focusGeographies.some((g) => g.toLowerCase() === country.toLowerCase());
        if (!matchesGeo) return false;
      }

      return true;
    });
  }

  getGrantById(id: string): GrantOpportunity | undefined {
    return this.grants.find((g) => g.id === id);
  }

  getFunderById(id: string): FunderEntity | undefined {
    return this.funders.find((f) => f.id === id || f.slug === id);
  }

  /**
   * Ingestion pipeline deduplication and ingestion (PRD §2).
   * Stable identifier: Funder + Grant Name + Source URL
   */
  ingestOpportunity(opp: GrantOpportunity): { success: boolean; isDuplicate: boolean; grant: GrantOpportunity } {
    const normalizedKey = `${opp.funderName.toLowerCase().trim()}::${opp.grantName.toLowerCase().trim()}::${opp.sourcePublicationDate ?? ""}`;
    const existingIndex = this.grants.findIndex((g) => {
      const gKey = `${g.funderName.toLowerCase().trim()}::${g.grantName.toLowerCase().trim()}::${g.sourcePublicationDate ?? ""}`;
      return gKey === normalizedKey || g.id === opp.id || g.originalUrl === opp.originalUrl;
    });

    if (existingIndex >= 0) {
      // Update existing record rather than duplicating
      this.grants[existingIndex] = {
        ...this.grants[existingIndex]!,
        ...opp,
        lastVerifiedDate: new Date().toISOString().slice(0, 10),
      };
      return { success: true, isDuplicate: true, grant: this.grants[existingIndex]! };
    }

    // Insert new verified record
    this.grants.unshift(opp);
    return { success: true, isDuplicate: false, grant: opp };
  }
}

export const grantDiscoveryService = new GrantDiscoveryService();
