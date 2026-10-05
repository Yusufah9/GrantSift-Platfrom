import type {
  GrantOpportunity,
  GrantSearchFilters,
  SourceTier,
  VerificationStatus,
} from "@/lib/types/grant-discovery";

/**
 * Normalized grant opportunity contract across all source adapters (Specification §16).
 * Guarantees every grant has verifiable URLs and standardized fields.
 */
export interface NormalizedGrantOpportunity extends Omit<GrantOpportunity, "sourceTier" | "verificationStatus"> {
  // Support both camelCase and snake_case source signatures
  sourceTier?: SourceTier;
  verificationStatus?: VerificationStatus;

  // Required normalized source fields
  source_name: string;
  funder: string;
  amount: string;
  currency: string;
  deadline: string;
  eligibility_summary: string;
  source_url: string;
  funder_url?: string;
  application_url: string;
  source_type: string;
  source_tier: SourceTier;
  verification_status: VerificationStatus;
  last_verified_at: string;
  deadline_verified_at?: string;
  confidence_score: number;
}

export abstract class GrantSourceAdapter {
  abstract readonly sourceName: string;
  abstract readonly sourceType: string;
  abstract readonly sourceTier: SourceTier;

  /**
   * Search for funding opportunities according to query keywords and filters.
   */
  abstract search(
    query?: string,
    filters?: GrantSearchFilters,
  ): Promise<NormalizedGrantOpportunity[]>;

  /**
   * Retrieve a specific grant opportunity by adapter ID.
   */
  abstract getById(id: string): Promise<NormalizedGrantOpportunity | null>;

  /**
   * Helper to format award amount cleanly.
   */
  protected formatAwardAmount(min?: number, max?: number, currency = "USD"): string {
    if (!max && !min) return "Amount unspecified / Varies";
    if (min && max && min !== max) {
      return `${currency} ${min.toLocaleString()} – ${currency} ${max.toLocaleString()}`;
    }
    return `${currency} ${(max || min)!.toLocaleString()}`;
  }
}
