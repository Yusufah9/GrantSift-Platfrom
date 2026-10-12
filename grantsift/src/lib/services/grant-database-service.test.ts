import { describe, it, expect } from "vitest";
import { GrantDatabaseService } from "./grant-database-service";

describe("GrantDatabaseService", () => {
  const service = new GrantDatabaseService();

  it("filters grants by sector correctly", () => {
    const res = service.search({ sector: "AI" }, true);
    expect(res.grants.length).toBeGreaterThan(0);
    expect(res.grants.every((g) => g.sector === "AI")).toBe(true);
  });

  it("filters grants by country correctly", () => {
    const res = service.search({ country: "Nigeria" }, true);
    expect(res.grants.length).toBeGreaterThan(0);
  });

  it("enforces preview limits for free users and prompts for Pro upgrade", () => {
    const res = service.search({}, false);
    expect(res.isProUser).toBe(false);
    expect(res.requiresProUpgrade).toBe(true);
    expect(res.grants.length).toBeLessThanOrEqual(3);
  });

  it("retrieves a grant by slug", () => {
    const grant = service.getGrantBySlug("msme-meta-ai-pitchathon-2026");
    expect(grant).not.toBeNull();
    expect(grant?.funderName).toContain("Meta");
  });
});
