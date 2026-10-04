export type GrantStatus = "active" | "closing_soon" | "closed" | "archived";
export type DeadlineType = "fixed" | "rolling" | "two_stage" | "unspecified";
export type FunderType =
  | "Government"
  | "Bilateral Agency"
  | "Multilateral Institution"
  | "Private Foundation"
  | "Corporate Foundation"
  | "Venture Philanthropy"
  | "NGO"
  | "Impact Investor"
  | "University"
  | "Other";

export type OrganizationType =
  | "Startup"
  | "SME"
  | "NGO"
  | "Nonprofit"
  | "Social Enterprise"
  | "University"
  | "Research Institution"
  | "Individual"
  | "Consortium"
  | "Any";

export type StartupStage =
  | "Idea"
  | "Prototype"
  | "Pre-Seed"
  | "Seed"
  | "Early Stage"
  | "Growth"
  | "Scale-Up"
  | "Any";

export interface GrantOpportunity {
  id: string;
  grantName: string;
  funderName: string;
  funderType: FunderType;
  grantType: string; // e.g. "Grant", "Catalyst Fund", "Challenge Prize", "Technical Assistance"
  description: string;
  shortSummary: string;
  originalSource: string; // "Opportunity Square", "Instrumentl", "Official Funder Website", etc.
  originalUrl: string;
  applicationUrl: string;
  sourcePublicationDate?: string;
  lastVerifiedDate: string;
  deadline: string; // YYYY-MM-DD or ISO
  deadlineType: DeadlineType;
  status: GrantStatus;
  
  // Funding details
  funding: {
    minimumAward?: number;
    maximumAward?: number;
    typicalAward?: number;
    totalAvailable?: number;
    currency: string;
    fundingType: "non_dilutive_grant" | "convertible_grant" | "subsidy" | "prize" | "co_funding";
  };

  // Eligibility
  eligibility: {
    countries: string[]; // e.g. ["Nigeria", "Kenya", "Ghana", "Global"]
    regions: string[];   // e.g. ["Sub-Saharan Africa", "West Africa", "Global"]
    organizationTypes: OrganizationType[];
    businessStages: StartupStage[];
    revenueRequirements?: string;
    industry: string[];
    sector: string[];
    genderRequirements?: string; // e.g. "Women-led or women-founded"
    ageRequirements?: string;    // e.g. "Youth 18-35"
    otherRequirements?: string[];
  };

  // Focus areas
  focusAreas: string[]; // ["Technology", "Climate", "Agriculture", "Fintech", "Women", "Youth", "SMEs", "AI", etc.]

  // Application process
  application: {
    method: "online_portal" | "email" | "grant_management_system" | "external";
    stages?: string[]; // ["Letter of Inquiry", "Full Proposal", "Pitch"]
    requiredDocuments: string[];
    applicationQuestions?: string[];
    contactInfo?: string;
    website?: string;
    notes?: string;
  };
}

export interface FunderEntity {
  id: string;
  name: string;
  slug: string;
  funderType: FunderType;
  description: string;
  website: string;
  sourceUrl: string;
  headquartersCountry: string;
  focusGeographies: string[];
  focusSectors: string[];
  historicalGivingSummary: string;
  typicalGrantSize: {
    min?: number;
    max?: number;
    currency: string;
  };
  openOpportunitiesCount: number;
  givingPreferences?: string[];
  notFundedExclusions?: string[];
  lastVerifiedDate: string;
}

export interface GrantSearchFilters {
  query?: string;
  category?: string;
  industry?: string;
  sector?: string;
  country?: string;
  region?: string;
  fundingMin?: number;
  fundingMax?: number;
  deadline?: string;
  status?: GrantStatus | "all";
  startupStage?: StartupStage | "all";
  organizationType?: OrganizationType | "all";
  funderType?: FunderType | "all";
  remoteGlobalEligible?: boolean;
}
