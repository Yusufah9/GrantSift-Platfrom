import "server-only";
import { type SupabaseClient } from "@supabase/supabase-js";

export interface FunderProfile {
  id: string;
  name: string;
  slug: string;
  funderType: string;
  headquartersCountry: string;
  website: string;
  contactEmail?: string;
  geographicFocus: string[];
  sectors: string[];
  typicalGrantMin: number;
  typicalGrantMax: number;
  currency: string;
  historicalGivingSummary: string;
  typicalRecipients: string;
  unsolicitedApplicationsOpen: boolean;
  applicationMethod: string;
  previousGrantees: Array<{
    name: string;
    country: string;
    amount: string;
    year: number;
    project: string;
  }>;
  openOpportunitiesCount: number;
  verificationStatus: "verified" | "partially_verified" | "unverified";
  aiInsights?: string;
}

export const STRATEGIC_FUNDERS: FunderProfile[] = [
  {
    id: "funder-afdb",
    name: "African Development Bank (AfDB)",
    slug: "african-development-bank",
    funderType: "Multilateral Development Bank",
    headquartersCountry: "Côte d'Ivoire",
    website: "https://www.afdb.org",
    contactEmail: "sefa@afdb.org",
    geographicFocus: ["Pan-Africa", "Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Egypt"],
    sectors: ["Clean Energy", "Infrastructure", "Agriculture", "Climate Action", "Financial Inclusion"],
    typicalGrantMin: 50000,
    typicalGrantMax: 1000000,
    currency: "USD",
    historicalGivingSummary: "Over $2.4B deployed across green infrastructure, energy access, and SME support mechanisms since 2012.",
    typicalRecipients: "Registered African commercial startups, clean energy developers, agricultural cooperatives, and research institutes.",
    unsolicitedApplicationsOpen: true,
    applicationMethod: "Annual Competitive Calls & Periodic Windows",
    openOpportunitiesCount: 4,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "SolarGrid Africa Ltd", country: "Nigeria", amount: "$150,000", year: 2024, project: "Decentralized cold-storage mini-grids" },
      { name: "BioPower East Africa", country: "Kenya", amount: "$300,000", year: 2023, project: "Agricultural biomass gasification" },
      { name: "EnviroClean Ghana", country: "Ghana", amount: "$120,000", year: 2024, project: "Municipal wastewater recovery" },
    ],
  },
  {
    id: "funder-tef",
    name: "Tony Elumelu Foundation",
    slug: "tony-elumelu-foundation",
    funderType: "Pan-African Private Philanthropy",
    headquartersCountry: "Nigeria",
    website: "https://www.tonyelumelufoundation.org",
    contactEmail: "enquiries@tonyelumelufoundation.org",
    geographicFocus: ["Nigeria", "All 54 African Countries"],
    sectors: ["Technology", "Agriculture", "Healthcare", "Education", "Manufacturing", "Creative Economy"],
    typicalGrantMin: 5000,
    typicalGrantMax: 50000,
    currency: "USD",
    historicalGivingSummary: "Empowered over 18,000 African entrepreneurs across 54 African countries with seed funding and business incubation.",
    typicalRecipients: "Early-stage founders under 5 years of operation operating scalable commercial ventures.",
    unsolicitedApplicationsOpen: true,
    applicationMethod: "Annual TEFConnect Application Portal (Opens Jan 1)",
    openOpportunitiesCount: 2,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "FarmAgro Tech", country: "Nigeria", amount: "$5,000", year: 2024, project: "Cassava yield optimization platform" },
      { name: "HealthDirect", country: "Ghana", amount: "$5,000", year: 2023, project: "Rural SMS medication verification" },
      { name: "EcoBricks Rwanda", country: "Rwanda", amount: "$5,000", year: 2024, project: "Recycled plastic construction blocks" },
    ],
  },
  {
    id: "funder-gates",
    name: "Bill & Melinda Gates Foundation",
    slug: "bill-and-melinda-gates-foundation",
    funderType: "Global Philanthropic Foundation",
    headquartersCountry: "United States",
    website: "https://www.gatesfoundation.org",
    geographicFocus: ["Nigeria", "Sub-Saharan Africa", "South Asia", "Global"],
    sectors: ["Healthcare", "Agriculture", "Financial Inclusion", "Artificial Intelligence", "Information Integrity"],
    typicalGrantMin: 100000,
    typicalGrantMax: 2000000,
    currency: "USD",
    historicalGivingSummary: "Extensive multi-million dollar annual grant portfolio addressing neglected diseases, maternal mortality, and smallholder farmer resilience.",
    typicalRecipients: "Research institutions, civic tech non-profits, healthcare initiatives, and innovative consortia.",
    unsolicitedApplicationsOpen: false,
    applicationMethod: "Grand Challenges Request for Proposals (RFPs) & Direct Invitations",
    openOpportunitiesCount: 5,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "AfriHealth Diagnostic Labs", country: "Nigeria", amount: "$250,000", year: 2024, project: "AI-based maternal triage ultrasound" },
      { name: "CropResilience Network", country: "Kenya", amount: "$450,000", year: 2023, project: "Drought resistant seed genomics" },
    ],
  },
  {
    id: "funder-macarthur",
    name: "MacArthur Foundation",
    slug: "macarthur-foundation",
    funderType: "Private Foundation",
    headquartersCountry: "United States (Nigeria Office in Abuja)",
    website: "https://www.macfound.org",
    contactEmail: "info-ng@macfound.org",
    geographicFocus: ["Nigeria", "West Africa", "Global"],
    sectors: ["Information Integrity", "Civic Technology", "Anti-Corruption", "Media Literacy", "Criminal Justice"],
    typicalGrantMin: 100000,
    typicalGrantMax: 750000,
    currency: "USD",
    historicalGivingSummary: "Over 25 years of institutional grantmaking in Nigeria advancing civic participation, investigative journalism, and democratic accountability.",
    typicalRecipients: "NGOs, media organizations, civic technology initiatives, and public interest litigation bodies.",
    unsolicitedApplicationsOpen: false,
    applicationMethod: "Strategic Grantmaking & Letters of Inquiry",
    openOpportunitiesCount: 2,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "Civic Integrity Network", country: "Nigeria", amount: "$350,000", year: 2024, project: "Sub-national budget tracking portal" },
      { name: "Center for Investigative Journalism", country: "Nigeria", amount: "$200,000", year: 2023, project: "Public sector procurement monitoring" },
    ],
  },
  {
    id: "funder-ford",
    name: "Ford Foundation",
    slug: "ford-foundation",
    funderType: "Private Philanthropy",
    headquartersCountry: "United States (West Africa Office in Lagos)",
    website: "https://www.fordfoundation.org",
    geographicFocus: ["West Africa", "Nigeria", "Ghana", "Senegal"],
    sectors: ["Civic Space", "Digital Rights", "Gender Justice", "Youth Empowerment", "Economic Fairness"],
    typicalGrantMin: 75000,
    typicalGrantMax: 500000,
    currency: "USD",
    historicalGivingSummary: "Pioneering institutional supporter of social justice, grassroots movement building, and equitable public technology in West Africa.",
    typicalRecipients: "Civil society organizations, human rights coalitions, and civic tech social enterprises.",
    unsolicitedApplicationsOpen: true,
    applicationMethod: "Letter of Inquiry (LOI) through Online Portal",
    openOpportunitiesCount: 3,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "Digital Rights Alliance", country: "Nigeria", amount: "$180,000", year: 2024, project: "AI ethics and online speech advocacy" },
      { name: "Women Farmers Action Group", country: "Ghana", amount: "$150,000", year: 2023, project: "Land tenure legal aid" },
    ],
  },
  {
    id: "funder-mastercard",
    name: "Mastercard Foundation",
    slug: "mastercard-foundation",
    funderType: "Philanthropic Foundation",
    headquartersCountry: "Canada (Offices in Kigali, Nairobi, Accra, Lagos)",
    website: "https://mastercardfdn.org",
    geographicFocus: ["Pan-Africa", "Nigeria", "Rwanda", "Kenya", "Ghana", "Ethiopia", "Uganda", "Senegal"],
    sectors: ["Youth Employment", "Fintech", "Education", "AgriTech", "Digital Skills"],
    typicalGrantMin: 250000,
    typicalGrantMax: 5000000,
    currency: "USD",
    historicalGivingSummary: "Young Africa Works strategy targeting 30 million young Africans in dignified work by 2030.",
    typicalRecipients: "Training accelerators, youth-focused social enterprises, and financial inclusion innovators.",
    unsolicitedApplicationsOpen: false,
    applicationMethod: "Strategic Partnerships & Challenge Calls",
    openOpportunitiesCount: 3,
    verificationStatus: "verified",
    previousGrantees: [
      { name: "CodeAfrica Skills Academy", country: "Nigeria", amount: "$1,200,000", year: 2023, project: "Software training for peri-urban youth" },
      { name: "EastAfrica MicroAgri", country: "Kenya", amount: "$850,000", year: 2024, project: "Digital micro-leasing for young farmers" },
    ],
  },
];

export class FunderService {
  constructor(private readonly supabase?: SupabaseClient) {}

  /**
   * List or search strategic funders
   */
  async searchFunders(query?: string, filters?: { country?: string; sector?: string }): Promise<FunderProfile[]> {
    let results = STRATEGIC_FUNDERS;

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.funderType.toLowerCase().includes(q) ||
          f.sectors.some((s) => s.toLowerCase().includes(q)) ||
          f.geographicFocus.some((g) => g.toLowerCase().includes(q)) ||
          f.historicalGivingSummary.toLowerCase().includes(q)
      );
    }

    if (filters?.country && filters.country !== "All" && filters.country !== "Global") {
      const c = filters.country.toLowerCase();
      results = results.filter(
        (f) =>
          f.geographicFocus.some((g) => g.toLowerCase().includes(c) || g.toLowerCase() === "pan-africa" || g.toLowerCase() === "all 54 african countries")
      );
    }

    if (filters?.sector && filters.sector !== "All") {
      const s = filters.sector.toLowerCase();
      results = results.filter((f) => f.sectors.some((sec) => sec.toLowerCase().includes(s)));
    }

    return results;
  }

  /**
   * Get full intelligence profile for a specific funder
   */
  async getFunderBySlug(slug: string): Promise<FunderProfile | null> {
    const found = STRATEGIC_FUNDERS.find((f) => f.slug === slug || f.id === slug);
    return found || null;
  }

  /**
   * Save a funder to the organization's saved list
   */
  async saveFunder(orgId: string, userId: string, funder: FunderProfile, notes?: string): Promise<boolean> {
    if (!this.supabase) return true;
    const { error } = await this.supabase.from("saved_funders").upsert(
      {
        organization_id: orgId,
        user_id: userId,
        funder_id: funder.id,
        funder_name: funder.name,
        website: funder.website,
        notes: notes || `Saved for prospective funding & relationship building.`,
        created_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,funder_id" }
    );
    return !error;
  }

  /**
   * List saved funders for an organization
   */
  async getSavedFunders(orgId: string): Promise<any[]> {
    if (!this.supabase) return [];
    const { data } = await this.supabase
      .from("saved_funders")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    return data || [];
  }
}
