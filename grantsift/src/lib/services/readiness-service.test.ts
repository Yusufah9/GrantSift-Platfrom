import { describe, it, expect } from "vitest";
import { dedupeRequirements, describeOrgProfile } from "@/lib/services/readiness-service";
import type { Database } from "@/lib/supabase/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

describe("dedupeRequirements", () => {
  it("removes case-insensitive duplicate claims, keeping the first occurrence", () => {
    const items = [
      { claim: "Applicant must be a registered nonprofit", source_id: "a" },
      { claim: "applicant must be a registered nonprofit", source_id: "b" },
      { claim: "Must operate in West Africa", source_id: "c" },
    ];
    const result = dedupeRequirements(items);
    expect(result).toHaveLength(2);
    expect(result[0]?.source_id).toBe("a");
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeRequirements([])).toEqual([]);
  });
});

describe("describeOrgProfile", () => {
  const baseProject: Partial<Project> = {
    org_name: "Acme Robotics",
    org_industry: "Robotics",
    org_country: "Nigeria",
    org_website: null,
    org_team_size: null,
    org_year_founded: null,
    org_funding_to_date: null,
    org_traction: null,
  };

  it("includes only the fields that are actually set", () => {
    const description = describeOrgProfile(baseProject as Project);
    expect(description).toContain("Acme Robotics");
    expect(description).toContain("Nigeria");
    expect(description).not.toContain("Team size");
  });

  it("falls back to a plain statement when nothing is provided", () => {
    const empty: Partial<Project> = { org_name: null, org_industry: null, org_country: null };
    expect(describeOrgProfile(empty as Project)).toBe("No organization profile details were provided.");
  });
});

