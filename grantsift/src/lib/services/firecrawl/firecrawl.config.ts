export interface FirecrawlConfig {
  apiKey?: string;
  baseUrl: string;
  defaultPageLimit: number;
  cacheTtlMinutes: number;
  sources: {
    opportunitySquareDomain: string;
    instrumentlDomain: string;
  };
}

export function getFirecrawlConfig(): FirecrawlConfig {
  return {
    apiKey: process.env.FIRECRAWL_API_KEY,
    baseUrl: process.env.FIRECRAWL_BASE_URL || "https://api.firecrawl.dev",
    defaultPageLimit: 5, // Cost control - max 5 pages per query
    cacheTtlMinutes: 1440, // 24 hours caching
    sources: {
      opportunitySquareDomain: "opportunitysquare.org",
      instrumentlDomain: "instrumentl.com",
    },
  };
}
