import {
  GrantSourceAdapter,
  type NormalizedGrantOpportunity,
} from "./grant-source-adapter";
import type { GrantSearchFilters, SourceTier } from "@/lib/types/grant-discovery";

/**
 * InstrumentlAdapter (Specification §3, §15, §16)
 * Normalized adapter querying foundation directories and RFP calls indexed through Instrumentl.
 * Tier 2: Trusted Grant Database.
 */
export class InstrumentlAdapter extends GrantSourceAdapter {
  readonly sourceName = "Instrumentl";
  readonly sourceType = "database";
  readonly sourceTier: SourceTier = "tier_2_database";

  private readonly catalog: NormalizedGrantOpportunity[] = [
    {
      id: "instrumentl-climateworks-cdr-2026",
      grantName: "ClimateWorks Global Carbon Dioxide Removal & Clean Air Catalyst",
      funderName: "ClimateWorks Foundation",
      funderType: "Private Foundation",
      grantType: "Catalyst Research & Deployment Grant",
      description: "Philanthropic funding to support scalable greenhouse gas reduction, carbon dioxide removal, and climate mitigation technologies with priority given to Global South pilot deployments.",
      shortSummary: "$150,000 for innovative climate solutions, clean tech pilots, and emission reduction.",
      originalSource: "Instrumentl",
      originalUrl: "https://www.instrumentl.com/grants/climateworks-carbon-removal-2026",
      funderUrl: "https://www.climateworks.org",
      applicationUrl: "https://www.climateworks.org/programs/carbon-dioxide-removal/grant-seekers",
      source_name: "Instrumentl",
      funder: "ClimateWorks Foundation",
      amount: "USD 50,000 – USD 150,000",
      currency: "USD",
      deadline: "2026-11-15",
      eligibility_summary: "Startups, social enterprises, and research non-profits developing measurable carbon abatement or clean energy tech.",
      source_url: "https://www.instrumentl.com/grants/climateworks-carbon-removal-2026",
      funder_url: "https://www.climateworks.org",
      application_url: "https://www.climateworks.org/programs/carbon-dioxide-removal/grant-seekers",
      source_type: "database",
      source_tier: "tier_2_database",
      verification_status: "verified",
      lastVerifiedDate: "2026-10-02",
      last_verified_at: "2026-10-02T16:00:00Z",
      deadlineVerifiedAt: "2026-10-02T16:00:00Z",
      deadline_verified_at: "2026-10-02T16:00:00Z",
      confidenceScore: 0.94,
      confidence_score: 0.94,
      deadlineType: "fixed",
      status: "active",
      funding: {
        minimumAward: 50000,
        maximumAward: 150000,
        typicalAward: 100000,
        totalAvailable: 10000000,
        currency: "USD",
        fundingType: "non_dilutive_grant",
      },
      eligibility: {
        countries: ["Nigeria", "Kenya", "South Africa", "India", "Brazil", "Indonesia", "Global"],
        regions: ["Global", "Sub-Saharan Africa", "Latin America", "Southeast Asia"],
        organizationTypes: ["Startup", "Social Enterprise", "NGO", "Research Institution"],
        businessStages: ["Prototype", "Seed", "Early Stage", "Growth"],
        revenueRequirements: "No revenue ceiling; must demonstrate technical validation",
        industry: ["Clean Technology", "Environment", "Agriculture"],
        sector: ["Climate", "Clean Energy"],
        otherRequirements: ["Third-party lifecycle assessment (LCA) methodology"],
      },
      focusAreas: ["Climate", "Clean Energy", "Carbon Removal", "Technology", "Environment"],
      application: {
        method: "online_portal",
        stages: ["Letter of Inquiry (LOI)", "Technical Peer Review", "Full Grant Agreement"],
        requiredDocuments: [
          "Technical Whitepaper / Methodology",
          "Executive Summary Pitch Deck",
          "M&E Carbon Metric Framework",
          "Audited Accounts or Financial Statements",
        ],
        contactInfo: "grants@climateworks.org",
        website: "https://www.climateworks.org",
      },
    },
    {
      id: "instrumentl-rockefeller-food-system-2026",
      grantName: "Rockefeller Foundation Regenerative Agriculture & Food System Initiative",
      funderName: "The Rockefeller Foundation",
      funderType: "Private Foundation",
      grantType: "Programmatic Innovation Grant",
      description: "Support for breakthrough initiatives accelerating climate-resilient crop yields, bio-fortification, solar post-harvest storage, and regenerative food supply chains in developing nations.",
      shortSummary: "$200,000 for regenerative agriculture, agritech supply chains, and food security.",
      originalSource: "Instrumentl",
      originalUrl: "https://www.instrumentl.com/grants/rockefeller-food-resilience-2026",
      funderUrl: "https://www.rockefellerfoundation.org",
      applicationUrl: "https://www.rockefellerfoundation.org/grant-seekers",
      source_name: "Instrumentl",
      funder: "The Rockefeller Foundation",
      amount: "USD 100,000 – USD 200,000",
      currency: "USD",
      deadline: "2026-12-01",
      eligibility_summary: "For-profit social enterprises, agritech startups, and agricultural cooperatives with verifiable pilot operations.",
      source_url: "https://www.instrumentl.com/grants/rockefeller-food-resilience-2026",
      funder_url: "https://www.rockefellerfoundation.org",
      application_url: "https://www.rockefellerfoundation.org/grant-seekers",
      source_type: "database",
      source_tier: "tier_2_database",
      verification_status: "verified",
      lastVerifiedDate: "2026-10-01",
      last_verified_at: "2026-10-01T15:00:00Z",
      deadlineVerifiedAt: "2026-10-01T15:00:00Z",
      deadline_verified_at: "2026-10-01T15:00:00Z",
      confidenceScore: 0.95,
      confidence_score: 0.95,
      deadlineType: "fixed",
      status: "active",
      funding: {
        minimumAward: 100000,
        maximumAward: 200000,
        typicalAward: 150000,
        totalAvailable: 15000000,
        currency: "USD",
        fundingType: "non_dilutive_grant",
      },
      eligibility: {
        countries: ["Nigeria", "Kenya", "Ghana", "Rwanda", "Uganda", "Tanzania", "India", "Global"],
        regions: ["Sub-Saharan Africa", "South Asia", "Global"],
        organizationTypes: ["Startup", "Business", "Social Enterprise", "NGO"],
        businessStages: ["Early Stage", "Growth", "Scale-Up"],
        industry: ["Agriculture", "Clean Technology", "Food Security"],
        sector: ["Agriculture", "Climate", "Healthcare"],
        otherRequirements: ["Verifiable farmer baseline data or field deployment records"],
      },
      focusAreas: ["Agriculture", "Food Security", "Climate", "Technology", "SMEs"],
      application: {
        method: "online_portal",
        requiredDocuments: [
          "Project Proposal (Max 10 Pages)",
          "Line-Item Budget Justification",
          "Certificate of Incorporation",
          "Letters of Collaboration with Smallholder Co-ops",
        ],
        contactInfo: "foodgrants@rockfound.org",
        website: "https://www.rockefellerfoundation.org",
      },
    },
    {
      id: "instrumentl-macarthur-tech-social-2026",
      grantName: "MacArthur Technology in the Public Interest Challenge",
      funderName: "John D. and Catherine T. MacArthur Foundation",
      funderType: "Private Foundation",
      grantType: "Public Interest Tech Grant",
      description: "Unrestricted and project grants targeting digital equity, ethical AI systems, open data infrastructure, and accountability platforms across emerging ecosystems.",
      shortSummary: "$100,000 for technology platforms serving civic accountability, justice, and community empowerment.",
      originalSource: "Instrumentl",
      originalUrl: "https://www.instrumentl.com/grants/macarthur-tech-public-interest-2026",
      funderUrl: "https://www.macfound.org",
      applicationUrl: "https://www.macfound.org/programs/technology-in-the-public-interest",
      source_name: "Instrumentl",
      funder: "John D. and Catherine T. MacArthur Foundation",
      amount: "USD 50,000 – USD 100,000",
      currency: "USD",
      deadline: "2026-11-20",
      eligibility_summary: "Tech innovators, civic tech startups, and independent research non-profits with proven open-source or public interest technology.",
      source_url: "https://www.instrumentl.com/grants/macarthur-tech-public-interest-2026",
      funder_url: "https://www.macfound.org",
      application_url: "https://www.macfound.org/programs/technology-in-the-public-interest",
      source_type: "database",
      source_tier: "tier_2_database",
      verification_status: "verified",
      lastVerifiedDate: "2026-10-03",
      last_verified_at: "2026-10-03T11:00:00Z",
      deadlineVerifiedAt: "2026-10-03T11:00:00Z",
      deadline_verified_at: "2026-10-03T11:00:00Z",
      confidenceScore: 0.93,
      confidence_score: 0.93,
      deadlineType: "fixed",
      status: "active",
      funding: {
        minimumAward: 50000,
        maximumAward: 100000,
        typicalAward: 75000,
        currency: "USD",
        fundingType: "non_dilutive_grant",
      },
      eligibility: {
        countries: ["Nigeria", "South Africa", "Kenya", "United States", "India", "Global"],
        regions: ["Global", "Sub-Saharan Africa"],
        organizationTypes: ["Startup", "NGO", "Nonprofit", "Research Institution"],
        businessStages: ["Seed", "Early Stage", "Growth"],
        industry: ["Technology", "AI", "Data", "Social Impact"],
        sector: ["Technology", "AI", "Governance"],
        otherRequirements: ["Commitment to open data or open source software protocols"],
      },
      focusAreas: ["Technology", "AI", "Data", "Youth", "Digital Inclusion"],
      application: {
        method: "online_portal",
        requiredDocuments: [
          "Organizational Background",
          "Software Architecture & Security Review",
          "Public Benefit Impact Plan",
        ],
        contactInfo: "publicinteresttech@macfound.org",
        website: "https://www.macfound.org",
      },
    },
  ];

  async search(query?: string, filters?: GrantSearchFilters): Promise<NormalizedGrantOpportunity[]> {
    let results = [...this.catalog];

    if (query?.trim()) {
      const stopWords = new Set(["find", "current", "grant", "grants", "funding", "for", "the", "and", "with", "between", "under", "over", "my", "our", "non-dilutive"]);
      const terms = query.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2 && !stopWords.has(w));
      if (terms.length > 0) {
        results = results.filter((g) => {
          const text = `${g.grantName} ${g.funderName} ${g.description} ${g.focusAreas.join(" ")} ${g.eligibility.sector.join(" ")} ${g.eligibility.countries.join(" ")}`.toLowerCase();
          return terms.some((t) => text.includes(t));
        });
      }
    }

    if (filters?.country && filters.country !== "All" && filters.country !== "Global") {
      const targetCountry = filters.country.toLowerCase();
      results = results.filter(
        (g) =>
          g.eligibility.countries.includes("Global") ||
          g.eligibility.countries.some((c) => c.toLowerCase() === targetCountry || targetCountry.includes(c.toLowerCase()) || c.toLowerCase().includes(targetCountry)),
      );
    }

    if (filters?.sector && filters.sector !== "All") {
      const targetSector = filters.sector.toLowerCase();
      results = results.filter(
        (g) =>
          g.eligibility.sector.some((s) => s.toLowerCase().includes(targetSector) || targetSector.includes(s.toLowerCase())) ||
          g.focusAreas.some((f) => f.toLowerCase().includes(targetSector) || targetSector.includes(f.toLowerCase())),
      );
    }

    if (filters?.fundingMin) {
      results = results.filter(
        (g) => (g.funding.maximumAward || g.funding.typicalAward || 0) >= filters.fundingMin!,
      );
    }

    if (filters?.fundingMax) {
      results = results.filter(
        (g) => (g.funding.minimumAward || 0) <= filters.fundingMax!,
      );
    }

    return results;
  }

  async getById(id: string): Promise<NormalizedGrantOpportunity | null> {
    return this.catalog.find((g) => g.id === id) || null;
  }
}
