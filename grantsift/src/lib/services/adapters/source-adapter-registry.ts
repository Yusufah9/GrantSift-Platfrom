import { GrantSourceAdapter, type NormalizedGrantOpportunity } from "./grant-source-adapter";
import { OpportunitySquareAdapter } from "./opportunity-square-adapter";
import { InstrumentlAdapter } from "./instrumentl-adapter";
import { OfficialFunderAdapter } from "./official-funder-adapter";
import { GovernmentGrantAdapter } from "./government-grant-adapter";
import { WebSearchAdapter } from "./web-search-adapter";
import { WinnerIntelligenceAdapter } from "./winner-intelligence-adapter";
import type { GrantSearchFilters, PreviousWinnersIntelligence } from "@/lib/types/grant-discovery";

/**
 * SourceAdapterRegistry (Specification §3, §15, §16)
 * Central aggregator managing all normalized grant source adapters.
 * Executes concurrent queries across trusted databases, official funder websites,
 * and live web search, then deduplicates and normalizes results into a coherent database.
 */
export class SourceAdapterRegistry {
  private readonly adapters: GrantSourceAdapter[];
  readonly winnerAdapter: WinnerIntelligenceAdapter;

  constructor(adapters?: GrantSourceAdapter[]) {
    this.adapters = adapters || [
      new OfficialFunderAdapter(),
      new GovernmentGrantAdapter(),
      new OpportunitySquareAdapter(),
      new InstrumentlAdapter(),
      new WebSearchAdapter(),
    ];
    this.winnerAdapter = new WinnerIntelligenceAdapter();
  }

  /**
   * Search across all registered adapters concurrently.
   */
  async searchAll(query?: string, filters?: GrantSearchFilters): Promise<NormalizedGrantOpportunity[]> {
    const promises = this.adapters.map(async (adapter) => {
      try {
        return await adapter.search(query, filters);
      } catch (err) {
        console.error(`Adapter ${adapter.sourceName} search failed:`, err);
        return [];
      }
    });

    const nestedResults = await Promise.all(promises);
    const flattened = nestedResults.flat();

    // Deduplicate by normalized grant title and funder name
    const seenKeys = new Set<string>();
    const deduplicated: NormalizedGrantOpportunity[] = [];

    // Order of precedence: Tier 1 (Official) > Tier 2 (Database) > Tier 3 (Secondary)
    const tierPriority = {
      tier_1_official: 1,
      tier_2_database: 2,
      tier_3_secondary: 3,
      tier_4_social: 4,
    };

    flattened.sort((a, b) => {
      const tierDiff = (tierPriority[a.source_tier] || 5) - (tierPriority[b.source_tier] || 5);
      if (tierDiff !== 0) return tierDiff;
      return (b.confidence_score || 0) - (a.confidence_score || 0);
    });

    for (const grant of flattened) {
      const key = `${grant.funderName.toLowerCase().trim()}::${grant.grantName.toLowerCase().trim()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        deduplicated.push(grant);
      }
    }

    return deduplicated;
  }

  /**
   * Fetch an opportunity by ID from whichever adapter holds it.
   */
  async getById(id: string): Promise<NormalizedGrantOpportunity | null> {
    for (const adapter of this.adapters) {
      const found = await adapter.getById(id);
      if (found) return found;
    }
    return null;
  }

  /**
   * Synchronous lookup for in-memory catalogs.
   */
  getByIdSync(id: string): NormalizedGrantOpportunity | null {
    // Check known catalogs
    for (const adapter of this.adapters) {
      if ((adapter as any).catalog) {
        const found = (adapter as any).catalog.find((g: any) => g.id === id);
        if (found) return found;
      }
      if ((adapter as any).liveWebLeads) {
        const found = (adapter as any).liveWebLeads.find((g: any) => g.id === id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Fetch winner intelligence for a given funder or grant.
   */
  getWinnerIntelligence(funderOrGrantName: string): PreviousWinnersIntelligence {
    return this.winnerAdapter.getWinnerIntelligence(funderOrGrantName);
  }

  /**
   * List active adapter metadata.
   */
  getAdaptersInfo() {
    return this.adapters.map((a) => ({
      name: a.sourceName,
      type: a.sourceType,
      tier: a.sourceTier,
    }));
  }
}

export const sourceAdapterRegistry = new SourceAdapterRegistry();
