import "server-only";
import * as XLSX from "xlsx";
import type { Database } from "@/lib/supabase/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Source = Database["public"]["Tables"]["sources"]["Row"];
type Insight = Database["public"]["Tables"]["insights"]["Row"];
type ReadinessItem = Database["public"]["Tables"]["readiness_items"]["Row"];
type SopTask = Database["public"]["Tables"]["sop_tasks"]["Row"];

export interface ExportData {
  project: Project;
  sources: Source[];
  insights: Insight[];
  readinessItems: ReadinessItem[];
  sopTasks: SopTask[];
}

export class ExportService {
  buildWorkbook(data: ExportData): Buffer {
    const sourceLabelById = new Map(data.sources.map((s) => [s.id, describeSource(s)]));
    const wb = XLSX.utils.book_new();

    addSheet(wb, "Grant Overview", buildOverviewRows(data.project));
    addSheet(wb, "Eligibility", buildInsightRows(data.insights, "eligibility", sourceLabelById));
    addSheet(wb, "Readiness", buildReadinessRows(data.readinessItems, sourceLabelById));
    addSheet(
      wb,
      "Document Checklist",
      buildDocumentChecklistRows(data.insights, data.sopTasks, sourceLabelById),
    );
    addSheet(wb, "Application Workflow", buildInsightRows(data.insights, "process_tip", sourceLabelById));
    addSheet(wb, "SOP", buildSopRows(data.sopTasks, sourceLabelById));
    addSheet(wb, "Action Plan", buildActionPlanRows(data.sopTasks));
    addSheet(wb, "Budget", buildBudgetRows(data.insights, sourceLabelById));
    addSheet(wb, "Sources", buildSourceRows(data.sources));

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }
}

function addSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ " ": "No data yet" }]);
  XLSX.utils.book_append_sheet(wb, sheet, name.slice(0, 31));
}

function describeSource(source: Source): string {
  switch (source.kind) {
    case "funder_org":
      return `Funder site: ${source.funder_url ?? ""}`;
    case "youtube_video":
      return `YouTube: ${source.youtube_video_title ?? ""} (${source.youtube_channel_title ?? ""})`;
    case "user_pasted_text":
      return "User-provided requirements";
    default:
      return "Uploaded document";
  }
}

function buildOverviewRows(project: Project): Record<string, unknown>[] {
  return [
    { Field: "Organization", Value: project.org_name ?? "" },
    { Field: "Industry", Value: project.org_industry ?? "" },
    { Field: "Country", Value: project.org_country ?? "" },
    { Field: "Website", Value: project.org_website ?? "" },
    { Field: "Contact email", Value: project.org_email ?? "" },
    { Field: "Team size", Value: project.org_team_size ?? "" },
    { Field: "Year founded", Value: project.org_year_founded ?? "" },
    { Field: "Funding raised to date (USD)", Value: project.org_funding_to_date ?? "" },
    { Field: "Grant funder", Value: project.grant_funder_name ?? "" },
    { Field: "Funder URL", Value: project.grant_funder_url ?? "" },
    { Field: "Amount sought (USD)", Value: project.grant_amount_sought ?? "" },
    { Field: "Application deadline", Value: project.grant_deadline ?? "" },
    { Field: "Generated", Value: new Date().toISOString().slice(0, 10) },
  ];
}

function buildInsightRows(
  insights: Insight[],
  category: string,
  sourceLabelById: Map<string, string>,
): Record<string, unknown>[] {
  return insights
    .filter((i) => i.category === category)
    .map((i) => ({
      Claim: i.claim,
      Evidence: i.evidence_excerpt ?? "",
      "Source type": labelForTrust(i.trust),
      Source: sourceLabelById.get(i.source_id) ?? "",
      Confidence: i.confidence ?? "",
    }));
}

function buildReadinessRows(items: ReadinessItem[], sourceLabelById: Map<string, string>): Record<string, unknown>[] {
  return items.map((item) => ({
    Requirement: item.requirement,
    Status: item.is_met ? "Met" : "Gap",
    "Gap detail": item.gap_description ?? "",
    Source: item.traced_to_source_id ? sourceLabelById.get(item.traced_to_source_id) ?? "" : "User provided",
  }));
}

function buildDocumentChecklistRows(
  insights: Insight[],
  sopTasks: SopTask[],
  sourceLabelById: Map<string, string>,
): Record<string, unknown>[] {
  const documentInsights = insights.filter((i) => i.category === "document_requirement");
  const taskByDocument = new Map(sopTasks.filter((t) => t.required_document).map((t) => [t.required_document, t]));

  return documentInsights.map((i) => {
    const task = taskByDocument.get(i.claim);
    return {
      Document: i.claim,
      Status: task ? labelForSopStatus(task.status) : "Not started",
      Owner: task?.owner ?? "",
      Deadline: task?.deadline ?? "",
      Source: sourceLabelById.get(i.source_id) ?? "",
    };
  });
}

function buildSopRows(tasks: SopTask[], sourceLabelById: Map<string, string>): Record<string, unknown>[] {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  return tasks.map((task) => ({
    Task: task.task,
    Owner: task.owner ?? "",
    Input: task.input ?? "",
    Output: task.output ?? "",
    Dependency: task.depends_on ? taskById.get(task.depends_on)?.task ?? "" : "",
    Deadline: task.deadline ?? "",
    Status: labelForSopStatus(task.status),
    "Required document": task.required_document ?? "",
    Source: task.traced_to_source_id ? sourceLabelById.get(task.traced_to_source_id) ?? "" : "",
    Notes: task.notes ?? "",
  }));
}

function buildActionPlanRows(tasks: SopTask[]): Record<string, unknown>[] {
  return [...tasks]
    .sort((a, b) => (a.deadline ?? "9999-99-99").localeCompare(b.deadline ?? "9999-99-99"))
    .map((task) => ({
      Deadline: task.deadline ?? "Unscheduled",
      Task: task.task,
      Owner: task.owner ?? "",
      Status: labelForSopStatus(task.status),
    }));
}

function buildBudgetRows(insights: Insight[], sourceLabelById: Map<string, string>): Record<string, unknown>[] {
  const tips = insights.filter((i) => i.category === "budget_tip");
  const guidance = tips.map((i) => ({
    "Line item": "",
    "Estimated cost (USD)": "",
    "Guidance from research": i.claim,
    Source: sourceLabelById.get(i.source_id) ?? "",
  }));
  // Always include a few blank rows so the sheet is usable as a template even with no tips yet.
  const blankRows = Array.from({ length: 5 }, () => ({
    "Line item": "",
    "Estimated cost (USD)": "",
    "Guidance from research": "",
    Source: "",
  }));
  return [...guidance, ...blankRows];
}

function buildSourceRows(sources: Source[]): Record<string, unknown>[] {
  return sources.map((s) => ({
    Kind: s.kind,
    Reference: describeSource(s),
    "Trust level": labelForTrust(s.trust),
    Status: s.status,
  }));
}

function labelForTrust(trust: string): string {
  return trust
    .split("_")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

function labelForSopStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}
