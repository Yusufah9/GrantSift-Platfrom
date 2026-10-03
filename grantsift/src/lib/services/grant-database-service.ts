import { CURATED_GRANTS, type GrantOpportunity } from "./grant-matching-service";

export interface GrantFilterParams {
  query?: string;
  country?: string;
  sector?: string;
  applicantType?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface GrantDatabaseResult {
  totalCount: number;
  displayedCount: number;
  grants: GrantOpportunity[];
  isProUser: boolean;
  requiresProUpgrade: boolean;
}

export class GrantDatabaseService {
  /**
   * Searches and filters the global grants repository.
   * Gating: Free users view top 4 grants, with the rest blurred / locked behind Pro subscription.
   * Pro users view all results.
   */
  search(params: GrantFilterParams, isProUser: boolean = false): GrantDatabaseResult {
    let results = [...CURATED_GRANTS];

    if (params.query?.trim()) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.funderName.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.sector.toLowerCase().includes(q)
      );
    }

    if (params.country && params.country !== "All") {
      results = results.filter(
        (g) =>
          g.country === "Global" ||
          g.country === params.country ||
          g.eligibleCountries.includes("Global") ||
          g.eligibleCountries.includes(params.country!)
      );
    }

    if (params.sector && params.sector !== "All") {
      results = results.filter((g) => g.sector.toLowerCase() === params.sector!.toLowerCase());
    }

    if (params.applicantType && params.applicantType !== "All") {
      results = results.filter(
        (g) => g.applicantType === "Any" || g.applicantType === params.applicantType
      );
    }

    if (params.status && params.status !== "All") {
      results = results.filter((g) => g.status === params.status);
    }

    if (params.minAmount) {
      results = results.filter((g) => g.amountMax >= params.minAmount!);
    }

    if (params.maxAmount) {
      results = results.filter((g) => g.amountMin <= params.maxAmount!);
    }

    const totalCount = results.length;

    // Gating for free users
    if (!isProUser) {
      return {
        totalCount,
        displayedCount: Math.min(results.length, 3),
        grants: results.slice(0, 3),
        isProUser: false,
        requiresProUpgrade: totalCount > 3,
      };
    }

    return {
      totalCount,
      displayedCount: results.length,
      grants: results,
      isProUser: true,
      requiresProUpgrade: false,
    };
  }

  getGrantBySlug(slug: string): GrantOpportunity | null {
    return CURATED_GRANTS.find((g) => g.slug === slug) ?? null;
  }
}
