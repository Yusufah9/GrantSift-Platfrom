export type GrantStatus = "active" | "closing_soon" | "closed" | "archived" | "expired";
export type DeadlineType = "fixed" | "rolling" | "two_stage" | "unspecified";

/**
 * 4-Tier Source-Confidence Hierarchy (Specification §15)
 * Tier 1 — Official: Direct funder/government/organization portal
 * Tier 2 — Trusted Grant Database: OpportunitySquare, Instrumentl, established databases
 * Tier 3 — Reputable Secondary Source: News publications, university announcements, accelerators
 * Tier 4 — Social Source: LinkedIn, YouTube, X, Facebook, Instagram
 */
export type SourceTier =
  | "tier_1_official"
  | "tier_2_database"
  | "tier_3_secondary"
  | "tier_4_social";

/**
 * Strict Verification Status (Specification §4)
 * Verified Grant: Real opportunity found on a source that can be accessed and confirmed
 * Unverified Lead: Appears potentially relevant but cannot currently be confirmed
 * Expired Grant: Previously valid opportunity whose deadline has passed
 * Closed Grant: The funder has explicitly closed the opportunity
 */
export type VerificationStatus =
  | "verified"
  | "unverified_lead"
  | "expired"
  | "closed";

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
  | "Business"
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

  // Source & Verification Chain (Specification §4, §5, §6, §15)
  // Database / Source -> Grant -> Funder -> Original Application
  originalSource: string; // "Opportunity Square", "Instrumentl", "Official Funder Website", etc.
  originalUrl: string; // Discovery URL (e.g., https://opportunitysquare.org/grant/123)
  funderUrl?: string; // Official Funder URL (e.g., https://abcfoundation.org/)
  applicationUrl: string; // Direct Application portal URL (e.g., https://abcfoundation.org/apply/123)
  
  sourceTier?: SourceTier;
  verificationStatus?: VerificationStatus;
  lastVerifiedDate: string;
  lastVerifiedAt?: string;
  deadlineVerifiedAt?: string;
  confidenceScore?: number; // 0.0 to 1.0

  sourcePublicationDate?: string;
  openingDate?: string;
  deadline: string; // YYYY-MM-DD or ISO
  deadlineType: DeadlineType;
  status: GrantStatus;
  
  // Flat convenience fields for adapters & fast matching
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  sector?: string;

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
    countriesServed?: string[];
    regions: string[];   // e.g. ["Sub-Saharan Africa", "West Africa", "Global"]
    organizationTypes: OrganizationType[];
    businessStages: StartupStage[];
    revenueRequirements?: string;
    industry: string[];
    sector: string[];
    genderRequirements?: string; // e.g. "Women-led or women-founded"
    ageRequirements?: string;    // e.g. "Youth 18-35"
    registrationRequirements?: string[];
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
  verificationStatus?: VerificationStatus | "all";
  sourceTier?: SourceTier | "all";
  startupStage?: StartupStage | "all";
  organizationType?: OrganizationType | "all";
  funderType?: FunderType | "all";
  remoteGlobalEligible?: boolean;
}

/**
 * Previous Winners & Recipient Intelligence (Specification §11)
 */
export interface PreviousWinnerProfile {
  recipientName: string;
  country: string;
  awardYear: number;
  awardAmount: string;
  projectFocus: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceChannel: "youtube" | "linkedin" | "funder_announcement" | "case_study" | "press_release";
  keySuccessFactors: string[];
  quoteSnippet?: string;
}

export interface WinnerPatternInsight {
  commonTrait: string;
  evidenceSummary: string;
  practicalRecommendation: string;
  observedInPercentage: number;
}

export interface PreviousWinnersIntelligence {
  funderOrGrantName: string;
  discoveredWinners: PreviousWinnerProfile[];
  commonPatterns: WinnerPatternInsight[];
  applicationDosAndDonts: {
    dos: string[];
    donts: string[];
  };
  interviewsAndWebinars: {
    title: string;
    platform: "YouTube" | "LinkedIn" | "Podcast" | "Webinar";
    url: string;
    summary: string;
  }[];
}

/**
 * Continuous Re-matching & Monitoring Types (Specification §9)
 */
export interface DiscoveryRunSummary {
  lastSearchedAt: string;
  lastUpdatedAt: string;
  lastVerifiedAt: string;
  totalOpportunities: number;
  newOpportunitiesCount: number;
  changedOpportunitiesCount: number;
  expiredOpportunitiesCount: number;
}

export interface GrantChangeNotification {
  id: string;
  grantId: string;
  grantName: string;
  funderName: string;
  changeType: "newly_published" | "opened" | "deadline_extended" | "reopened" | "deadline_approaching";
  details: string;
  detectedAt: string;
}
