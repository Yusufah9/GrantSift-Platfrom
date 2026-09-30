import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { ExportService, type ExportData } from "@/lib/excel/export-service";
import type { Database } from "@/lib/supabase/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Source = Database["public"]["Tables"]["sources"]["Row"];
type Insight = Database["public"]["Tables"]["insights"]["Row"];
type ReadinessItem = Database["public"]["Tables"]["readiness_items"]["Row"];
type SopTask = Database["public"]["Tables"]["sop_tasks"]["Row"];

function fixture(): ExportData {
  const project: Partial<Project> = {
    org_name: "Acme Robotics",
    org_industry: "Robotics",
    org_country: "Nigeria",
    grant_funder_name: "Example Foundation",
    grant_funder_url: "https://example-foundation.org",
    grant_amount_sought: 50000,
    grant_deadline: "2026-12-01",
  };

  const sources: Partial<Source>[] = [
    { id: "src-1", kind: "funder_org", trust: "official_funder", funder_url: "https://example-foundation.org", status: "completed" },
    {
      id: "src-2",
      kind: "youtube_video",
      trust: "expert_source",
      youtube_video_title: "How we won the grant",
      youtube_channel_title: "Acme Robotics",
      status: "completed",
    },
  ];

  const insights: Partial<Insight>[] = [
    { id: "in-1", source_id: "src-1", category: "eligibility", claim: "Applicant must be a registered nonprofit", trust: "official_funder", confidence: 0.9 },
    { id: "in-2", source_id: "src-1", category: "document_requirement", claim: "Signed letter of support", trust: "official_funder", confidence: 0.8 },
    { id: "in-3", source_id: "src-2", category: "budget_tip", claim: "Keep indirect costs under 15%", trust: "expert_source", confidence: 0.6 },
    { id: "in-4", source_id: "src-2", category: "process_tip", claim: "Submit at least a week before the deadline", trust: "expert_source", confidence: 0.7 },
  ];

  const readinessItems: Partial<ReadinessItem>[] = [
    { id: "r-1", requirement: "Applicant must be a registered nonprofit", is_met: false, gap_description: "No nonprofit registration on file", traced_to_source_id: "src-1" },
    { id: "r-2", requirement: "Signed letter of support", is_met: true, traced_to_source_id: "src-1" },
  ];

  const sopTasks: Partial<SopTask>[] = [
    {
      id: "t-1",
      task: "Register as a nonprofit",
      owner: "Founder",
      input: "Incorporation documents",
      output: "Nonprofit registration certificate",
      required_document: "Registration certificate",
      status: "not_started",
      deadline: "2026-11-01",
      traced_to_source_id: "src-1",
      sort_order: 0,
      depends_on: null,
    },
  ];

  return {
    project: project as Project,
    sources: sources as Source[],
    insights: insights as Insight[],
    readinessItems: readinessItems as ReadinessItem[],
    sopTasks: sopTasks as SopTask[],
  };
}

function readSheet(buffer: Buffer, name: string) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[name];
  expect(sheet).toBeDefined();
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!);
}

describe("ExportService.buildWorkbook", () => {
  it("includes every required sheet", () => {
    const buffer = new ExportService().buildWorkbook(fixture());
    const wb = XLSX.read(buffer, { type: "buffer" });
    expect(wb.SheetNames).toEqual([
      "Grant Overview",
      "Eligibility",
      "Readiness",
      "Document Checklist",
      "Application Workflow",
      "SOP",
      "Action Plan",
      "Budget",
      "Sources",
    ]);
  });

  it("puts the real org and funder data on the overview sheet, nothing fabricated", () => {
    const buffer = new ExportService().buildWorkbook(fixture());
    const rows = readSheet(buffer, "Grant Overview");
    const org = rows.find((r) => r.Field === "Organization");
    const funder = rows.find((r) => r.Field === "Grant funder");
    expect(org?.Value).toBe("Acme Robotics");
    expect(funder?.Value).toBe("Example Foundation");
  });

  it("only lists eligibility insights on the Eligibility sheet, traced to a source", () => {
    const buffer = new ExportService().buildWorkbook(fixture());
    const rows = readSheet(buffer, "Eligibility");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.Claim).toBe("Applicant must be a registered nonprofit");
    expect(rows[0]?.Source).toContain("example-foundation.org");
  });

  it("marks readiness gaps and met items distinctly", () => {
    const buffer = new ExportService().buildWorkbook(fixture());
    const rows = readSheet(buffer, "Readiness");
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Status: "Gap", "Gap detail": "No nonprofit registration on file" }),
        expect.objectContaining({ Status: "Met" }),
      ]),
    );
  });

  it("reflects live SOP task status on the Document Checklist sheet instead of a fixed guess", () => {
    const buffer = new ExportService().buildWorkbook(fixture());
    const rows = readSheet(buffer, "Document Checklist");
    const row = rows.find((r) => r.Document === "Signed letter of support");
    // in-2's document requirement doesn't match t-1's required_document text,
    // so it should read "Not started" rather than borrow t-1's status.
    expect(row?.Status).toBe("Not started");
  });

  it("always includes blank template rows on the Budget sheet even with no budget tips", () => {
    const emptyFixture = { ...fixture(), insights: [] };
    const buffer = new ExportService().buildWorkbook(emptyFixture);
    const rows = readSheet(buffer, "Budget");
    expect(rows.length).toBeGreaterThan(0);
    // No fabricated numbers — every estimated cost cell starts blank.
    for (const row of rows) expect(row["Estimated cost (USD)"] ?? "").toBe("");
  });

  it("never crashes on a project with no analysis run yet", () => {
    const empty: ExportData = {
      project: { org_name: "New Org" } as Project,
      sources: [],
      insights: [],
      readinessItems: [],
      sopTasks: [],
    };
    expect(() => new ExportService().buildWorkbook(empty)).not.toThrow();
  });
});
