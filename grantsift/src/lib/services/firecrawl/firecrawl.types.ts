export type ResearchMode =
  | "quick_search"
  | "grant_research"
  | "funder_research"
  | "recipient_research"
  | "proposal_research"
  | "competitor_research"
  | "deep_research";

export type SourceType =
  | "official_funder"
  | "opportunity_square"
  | "instrumentl"
  | "government_portal"
  | "linkedin"
  | "youtube"
  | "social_media"
  | "news_article"
  | "research_paper";

export type SourceConfidence = "Official" | "Verified" | "Public Source" | "Social Evidence" | "Unverified";

export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
  sourceType: SourceType;
  confidence: SourceConfidence;
  publishedDate?: string;
  lastChecked?: string;
  extractedFacts?: Record<string, any>;
}

export interface ExtractedGrantDetails {
  grantName: string;
  funder: string;
  description: string;
  amountMin?: number;
  amountMax?: number;
  currency: string;
  deadline?: string;
  eligibility: string[];
  eligibleCountries: string[];
  sectors: string[];
  organizationTypes: string[];
  requirements: string[];
  applicationUrl?: string;
  sourceUrl: string;
  sourceType: SourceType;
  confidence: SourceConfidence;
  lastVerified: string;
}

export interface ResearchInsight {
  id: string;
  category: "eligibility" | "funder_priorities" | "recipient_pattern" | "budget_rule" | "narrative_evidence";
  title: string;
  content: string;
  sourceUrl: string;
  sourceType: SourceType;
  sourceTitle: string;
  confidence: SourceConfidence;
  useInProposalSection?: "Executive Summary" | "Problem Statement" | "Solution & Methodology" | "Budget Justification" | "Impact & M&E";
}

export interface RecurringPattern {
  pattern: string;
  evidenceCount: number;
  citationSources: string[];
  recommendation: string;
}

export interface ResearchSynthesisReport {
  query: string;
  mode: ResearchMode;
  overview: string;
  funderPriorities: string[];
  eligibilityChecklist: string[];
  requiredDocuments: string[];
  recurringPatterns: RecurringPattern[];
  insights: ResearchInsight[];
  sources: FirecrawlSearchResult[];
  proposalRecommendations: string[];
  potentialRisks: string[];
  missingInformation: string[];
  lastChecked: string;
}
