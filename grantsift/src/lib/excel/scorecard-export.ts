import * as XLSX from "xlsx";
import type { ScorecardInput, ScorecardResult } from "@/lib/services/scorecard-service";

export function buildScorecardWorkbook(input: ScorecardInput, result: ScorecardResult): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryRows = [
    { Section: "Organization Name", Value: input.orgName },
    { Section: "Organization Type", Value: input.orgType },
    { Section: "Industry / Sector", Value: input.industry },
    { Section: "Country / Geography", Value: input.country },
    { Section: "Stage", Value: input.stage },
    { Section: "Year Founded", Value: input.yearFounded },
    { Section: "Team Size", Value: input.teamSize },
    { Section: "Annual Revenue ($USD)", Value: input.revenue },
    { Section: "Funding Raised To Date ($USD)", Value: input.fundingRaised },
    { Section: "OVERALL GRANT READINESS SCORE", Value: `${result.overallScore} / 100 (Grade: ${result.grade})` },
    { Section: "Report Generated At", Value: new Date().toISOString().slice(0, 10) },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Readiness Overview");

  // Category Breakdown Sheet
  const categoryRows = [
    { Category: "Organization Master Profile", Weight: "20%", Score: `${result.categoryScores.orgProfile}%`, Status: result.categoryScores.orgProfile >= 75 ? "High Readiness" : "Needs Work" },
    { Category: "Legal & Regulatory Documentation", Weight: "20%", Score: `${result.categoryScores.legalDocumentation}%`, Status: result.categoryScores.legalDocumentation >= 75 ? "High Readiness" : "Needs Work" },
    { Category: "Financial Readiness & Books", Weight: "20%", Score: `${result.categoryScores.financialReadiness}%`, Status: result.categoryScores.financialReadiness >= 75 ? "High Readiness" : "Needs Work" },
    { Category: "Impact Framework & SDGs", Weight: "15%", Score: `${result.categoryScores.impactDocumentation}%`, Status: result.categoryScores.impactDocumentation >= 75 ? "High Readiness" : "Needs Work" },
    { Category: "Team & Implementation Capacity", Weight: "15%", Score: `${result.categoryScores.teamInformation}%`, Status: result.categoryScores.teamInformation >= 75 ? "High Readiness" : "Needs Work" },
    { Category: "Data Room & Evidence Vault", Weight: "10%", Score: `${result.categoryScores.dataRoomReadiness}%`, Status: result.categoryScores.dataRoomReadiness >= 75 ? "High Readiness" : "Needs Work" },
  ];
  const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
  XLSX.utils.book_append_sheet(wb, categorySheet, "Score Breakdown");

  // Gaps & Actionable Recommendations Sheet
  const actionRows: Record<string, string>[] = [];
  result.gaps.forEach((gap, i) => {
    actionRows.push({
      Type: "Identified Gap",
      Detail: gap,
      ActionPlan: result.recommendations[i] ?? "Resolve with required documentation in Data Room",
    });
  });
  result.strengths.forEach((strength) => {
    actionRows.push({
      Type: "Core Strength",
      Detail: strength,
      ActionPlan: "Leverage as primary proof point in grant narratives",
    });
  });
  const actionSheet = XLSX.utils.json_to_sheet(actionRows);
  XLSX.utils.book_append_sheet(wb, actionSheet, "Gaps & Recommendations");

  // Eligible Funding Programs
  const eligibleRows = result.eligibleFundingTypes.map((type) => ({ "Eligible Funding Opportunity Tier": type }));
  const eligibleSheet = XLSX.utils.json_to_sheet(eligibleRows);
  XLSX.utils.book_append_sheet(wb, eligibleSheet, "Eligible Tiers");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}

export function downloadScorecardExcel(result: ScorecardResult, orgName: string) {
  const mockInput: ScorecardInput = {
    orgName,
    orgType: "Startup",
    industry: "Multi-sector",
    country: "Global",
    stage: "Seed",
    yearFounded: 2022,
    teamSize: 5,
    revenue: 0,
    fundingRaised: 0,
    hasIncorporation: true,
    hasTaxId: true,
    hasAuditedFinancials: false,
    hasPitchDeck: true,
    hasBusinessPlan: true,
    hasLettersOfSupport: true,
  };
  const bytes = buildScorecardWorkbook(mockInput, result);
  const blob = new Blob([bytes as any], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${orgName.replace(/\s+/g, "_")}_Grant_Readiness_Scorecard.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
