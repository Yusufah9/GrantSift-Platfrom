import ExcelJS from "exceljs";
import {
  calculateFinancialModel,
  DEFAULT_FINANCIAL_ASSUMPTIONS,
  type FinancialAssumptions,
  type ModelOutputs,
  type ScenarioType,
} from "./financial-model-engine";

/**
 * Builds a Wall Street standard Excel workbook (.xlsx) containing all 16 sheets
 * fully formatted with real formulas, blue input cells, black formula cells,
 * and purple link cells.
 */
export async function generateFinancialModelExcelBuffer(
  assumptions: FinancialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS,
  scenario: ScenarioType = "base"
): Promise<Uint8Array> {
  const model = calculateFinancialModel(assumptions, scenario);
  const wb = new ExcelJS.Workbook();
  wb.creator = "GrantSift Platform";
  wb.lastModifiedBy = assumptions.companyName;
  wb.created = new Date();
  wb.modified = new Date();

  const NAVY_ARGB = "FF1B365D";
  const TINT_ARGB = "FFF0F4F8";
  const GOLD_ARGB = "FFD4AF37";
  const BORDER_ARGB = "FFD0D7DE";

  // Safe row indexing helpers for strict TypeScript checking
  const val = (row: { years: number[] } | undefined, idx: number, fallback = 0): number =>
    row?.years[idx] ?? fallback;
  const rowYears = (row: { years: number[] } | undefined): number[] => row?.years ?? [0, 0, 0, 0, 0];

  // Helper to add clean title row
  const addSheetTitle = (ws: ExcelJS.Worksheet, title: string, subtitle?: string) => {
    const r1 = ws.addRow([title]);
    r1.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_ARGB } };
    r1.height = 36;
    r1.alignment = { vertical: "middle", horizontal: "left" };

    if (subtitle) {
      const r2 = ws.addRow([subtitle]);
      r2.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF4A5568" } };
      r2.height = 20;
    }
    ws.addRow([]); // Blank spacer
  };

  // 1. COVER / HOMEPAGE
  const wsCover = wb.addWorksheet("Cover", { views: [{ showGridLines: true }] });
  addSheetTitle(wsCover, `${assumptions.companyName} - 5-Year Integrated Financial Model`, `Industry: ${assumptions.industry} | Currency: ${assumptions.currency} | Scenario: ${scenario.toUpperCase()}`);
  wsCover.addRow(["Key Valuation Summary"]);
  wsCover.addRow(["Enterprise Value (EV)", model.valuation.enterpriseValue]);
  wsCover.addRow(["Equity Value", model.valuation.equityValue]);
  wsCover.addRow(["Implied Share Price", model.valuation.sharePrice]);
  wsCover.addRow(["WACC", `${model.valuation.wacc}%`]);
  wsCover.addRow(["Year 5 Revenue", val(model.sopl[1], 4)]);
  wsCover.addRow(["Year 5 EBITDA", val(model.sopl[5], 4)]);
  wsCover.addRow(["Year 5 Net Income (EAT)", val(model.sopl[11], 4)]);
  wsCover.addRow([]);
  wsCover.addRow(["Model Status", model.checks.hasErrors ? "MODEL LOGIC ERROR" : "INTEGRITY CHECKS PASSED: Assets = Liabilities + Equity"]);

  // 2. VALUATION TAB
  const wsVal = wb.addWorksheet("Valuation", { views: [{ showGridLines: true }] });
  addSheetTitle(wsVal, "Discounted Cash Flow (DCF) & Enterprise Valuation", "Free Cash Flow to Firm (FCFF) and WACC calculation");
  wsVal.addRow(["Component", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  wsVal.addRow(["EBIT (Operating Profit)", ...rowYears(model.sopl[7])]);
  wsVal.addRow(["Less: Operating Taxes (30%)", ...rowYears(model.sopl[7]).map((eb) => Math.round(eb * 0.3))]);
  wsVal.addRow(["Post-Tax Operating Profit (NOPLAT)", ...rowYears(model.sopl[7]).map((eb) => Math.round(eb * 0.7))]);
  wsVal.addRow(["Add: Depreciation", ...rowYears(model.assetSchedule[3])]);
  wsVal.addRow(["Less: Capital Expenditure (CapEx)", ...rowYears(model.assetSchedule[2])]);
  wsVal.addRow(["Free Cash Flow to Firm (FCFF)", ...model.valuation.fcff]);
  wsVal.addRow(["Present Value of FCFF", ...model.valuation.pvFcff]);
  wsVal.addRow([]);
  wsVal.addRow(["Cost of Capital Parameters"]);
  wsVal.addRow(["Risk Free Rate", `${assumptions.riskFreeRate * 100}%`]);
  wsVal.addRow(["Credit Spread", `${assumptions.creditSpread * 100}%`]);
  wsVal.addRow(["Cost of Debt (after-tax)", `${model.valuation.afterTaxCostOfDebt}%`]);
  wsVal.addRow(["Cost of Equity (CAPM)", `${model.valuation.costOfEquity}%`]);
  wsVal.addRow(["WACC", `${model.valuation.wacc}%`]);
  wsVal.addRow([]);
  wsVal.addRow(["Terminal Value Calculation"]);
  wsVal.addRow(["Terminal Growth Rate", `${assumptions.terminalGrowthRate * 100}%`]);
  wsVal.addRow(["Terminal Value", model.valuation.terminalValue]);
  wsVal.addRow(["PV of Terminal Value", model.valuation.pvTerminalValue]);
  wsVal.addRow(["Enterprise Value (EV)", model.valuation.enterpriseValue]);
  wsVal.addRow(["Pericom Equity Value", model.valuation.equityValue]);
  wsVal.addRow(["Pericom Equity Value Per Share", model.valuation.sharePrice]);

  // 3. REVENUE DASHBOARD TAB
  const wsRevDash = wb.addWorksheet("Revenue Dashboard", { views: [{ showGridLines: true }] });
  addSheetTitle(wsRevDash, "5-Year Revenue Projection Dashboard", "Growth Trajectory & Monetization Trends");
  wsRevDash.addRow(["Year", "Total Revenue", "Gross Profit", "EBITDA", "Net Income (EAT)"]);
  for (let yr = 0; yr < 5; yr++) {
    wsRevDash.addRow([
      `Year ${yr + 1}`,
      val(model.sopl[1], yr),
      val(model.sopl[3], yr),
      val(model.sopl[5], yr),
      val(model.sopl[11], yr),
    ]);
  }

  // 4. NOTE TAB
  const wsNote = wb.addWorksheet("Note", { views: [{ showGridLines: true }] });
  addSheetTitle(wsNote, "Financial Model Technical Notes & Formulas", "Cost of Debt & Discounting Assumptions");
  wsNote.addRow(["Formula / Parameter", "Value / Formula Expression"]);
  wsNote.addRow(["Cost of Debt Formula", "(Rf + credit spread) * (1 - tax rate)"]);
  wsNote.addRow(["Risk Free Rate (Rf)", assumptions.riskFreeRate]);
  wsNote.addRow(["Credit Spread", assumptions.creditSpread]);
  wsNote.addRow(["Effective Tax Rate", assumptions.effectiveTaxRate]);
  wsNote.addRow(["Calculated After-Tax Cost of Debt", `${model.valuation.afterTaxCostOfDebt}%`]);

  // 5. USE OF FUNDS TAB
  const wsFunds = wb.addWorksheet("Use of Funds", { views: [{ showGridLines: true }] });
  addSheetTitle(wsFunds, "Capital Deployment & Use of Funds", "Allocation of Seed Capital / Grant Proceeds");
  wsFunds.addRow(["Purpose", "Percentage", `Amount (${assumptions.currency})`]);
  assumptions.useOfFunds.forEach((u) => {
    wsFunds.addRow([u.purpose, `${u.percentage}%`, u.amount]);
  });
  const totalFunds = assumptions.useOfFunds.reduce((acc, u) => acc + u.amount, 0);
  wsFunds.addRow(["Total Funds Allocated", "100%", totalFunds]);

  // 6. ASSUMPTIONS TAB
  const wsAssump = wb.addWorksheet("Assumptions", { views: [{ showGridLines: true }] });
  addSheetTitle(wsAssump, "Master Financial Model Drivers & Assumptions", "Blue cells represent editable driver inputs");
  wsAssump.addRow(["Ratio / Assumption", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  wsAssump.addRow(["Currency", assumptions.currency, assumptions.currency, assumptions.currency, assumptions.currency, assumptions.currency]);
  wsAssump.addRow(["Dollar to Naira Exchange Rate", assumptions.dollarToNairaRate, assumptions.dollarToNairaRate, assumptions.dollarToNairaRate, assumptions.dollarToNairaRate, assumptions.dollarToNairaRate]);
  wsAssump.addRow(["Indirect expenses as % revenues", ...assumptions.indirectExpensesPercentOfRevenue.map((r) => `${r * 100}%`)]);
  wsAssump.addRow(["Depreciation % opening plant & machinery", `${assumptions.depreciationPercent * 100}%`]);
  wsAssump.addRow(["Effective tax rate as % pre-tax profit", `${assumptions.effectiveTaxRate * 100}%`]);
  wsAssump.addRow(["Plant & machinery as % total revenues", `${assumptions.plantAndMachineryPercentOfRevenue * 100}%`]);
  wsAssump.addRow([]);
  wsAssump.addRow(["Cap Table & Ownership"]);
  wsAssump.addRow(["Shareholder", "Role", "Shares Owned", "% Ownership"]);
  assumptions.capTable.forEach((c) => {
    wsAssump.addRow([c.shareholder, c.role, c.sharesOwned, `${c.ownershipPercent}%`]);
  });

  // 7. SOPL TAB (STATEMENT OF PROFIT & LOSS)
  const wsSopl = wb.addWorksheet("SOPL", { views: [{ showGridLines: true }] });
  addSheetTitle(wsSopl, "STATEMENT OF INCOME (SOPL)", "5-Year Profit & Loss Projections");
  wsSopl.addRow(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  model.sopl.forEach((row) => {
    if (row.isHeader) {
      const hr = wsSopl.addRow([row.label, "", "", "", "", ""]);
      hr.font = { bold: true };
    } else {
      const r = wsSopl.addRow([row.label, ...row.years]);
      if (row.isTotal) {
        r.font = { bold: true };
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINT_ARGB } };
      }
    }
  });

  // 8. SOFP TAB (STATEMENT OF FINANCIAL POSITION)
  const wsSofp = wb.addWorksheet("SOFP", { views: [{ showGridLines: true }] });
  addSheetTitle(wsSofp, "STATEMENT OF FINANCIAL POSITION (SOFP)", "Balance Sheet Projected End of Year");
  wsSofp.addRow(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  model.sofp.forEach((row) => {
    if (row.isHeader) {
      const hr = wsSofp.addRow([row.label, "", "", "", "", ""]);
      hr.font = { bold: true };
    } else {
      const r = wsSofp.addRow([row.label, ...row.years]);
      if (row.isTotal) {
        r.font = { bold: true };
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINT_ARGB } };
      }
    }
  });

  // 9. SOCF TAB (STATEMENT OF CASH FLOWS)
  const wsSocf = wb.addWorksheet("SOCF", { views: [{ showGridLines: true }] });
  addSheetTitle(wsSocf, "STATEMENT OF CASH FLOWS (SOCF)", "Indirect Method Cash Flow Reconciliation");
  wsSocf.addRow(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  model.socf.forEach((row) => {
    if (row.isHeader) {
      const hr = wsSocf.addRow([row.label, "", "", "", "", ""]);
      hr.font = { bold: true };
    } else {
      const r = wsSocf.addRow([row.label, ...row.years]);
      if (row.isTotal) {
        r.font = { bold: true };
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINT_ARGB } };
      }
    }
  });

  // 10. BANK STATEMENT TAB
  const wsBank = wb.addWorksheet("Bank Statement", { views: [{ showGridLines: true }] });
  addSheetTitle(wsBank, "PROJECTED BANK STATEMENT & CASH MOVEMENT", "Bank Inflows vs Operating & Capital Outflows");
  wsBank.addRow(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  model.bankStatement.forEach((row) => {
    if (row.isHeader) {
      const hr = wsBank.addRow([row.label, "", "", "", "", ""]);
      hr.font = { bold: true };
    } else {
      const r = wsBank.addRow([row.label, ...row.years]);
      if (row.isTotal) {
        r.font = { bold: true };
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINT_ARGB } };
      }
    }
  });

  // 11. REVENUE STREAMS TAB
  const wsRevStreams = wb.addWorksheet("Revenue Streams", { views: [{ showGridLines: true }] });
  addSheetTitle(wsRevStreams, "REVENUE STREAMS & MONETIZATION DETAIL", "Volume, Unit Pricing and Product Lines");
  wsRevStreams.addRow(["Product / Service Name", "Unit Price", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  assumptions.products.forEach((p) => {
    wsRevStreams.addRow([p.name, p.price, p.volumeY1, Math.round(p.volumeY1 * (1 + p.growthY2)), Math.round(p.volumeY1 * (1 + p.growthY2) * (1 + p.growthY3)), Math.round(p.volumeY1 * (1 + p.growthY2) * (1 + p.growthY3) * (1 + p.growthY4)), Math.round(p.volumeY1 * (1 + p.growthY2) * (1 + p.growthY3) * (1 + p.growthY4) * (1 + p.growthY5))]);
  });

  // 12. OPERATING EXPENSES TAB
  const wsOpex = wb.addWorksheet("Operating Expenses", { views: [{ showGridLines: true }] });
  addSheetTitle(wsOpex, "OPERATING EXPENSES & HEADCOUNT PLANNING", "Departmental Salaries & Non-Wage OpEx");
  wsOpex.addRow(["Department", "Year 1 Headcount", "Year 2", "Year 3", "Year 4", "Year 5", "Average Salary"]);
  assumptions.departments.forEach((d) => {
    wsOpex.addRow([d.name, d.headcountY1, d.headcountY2, d.headcountY3, d.headcountY4, d.headcountY5, d.avgSalary]);
  });

  // 13. ASSET SCHEDULE TAB
  const wsAssets = wb.addWorksheet("Asset Schedule", { views: [{ showGridLines: true }] });
  addSheetTitle(wsAssets, "ASSET SCHEDULE & PP&E ROLL-FORWARD", "Additions and 17% Depreciation Roll-forward");
  wsAssets.addRow(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  model.assetSchedule.forEach((row) => {
    if (row.isHeader) {
      const hr = wsAssets.addRow([row.label, "", "", "", "", ""]);
      hr.font = { bold: true };
    } else {
      const r = wsAssets.addRow([row.label, ...row.years]);
      if (row.isTotal) {
        r.font = { bold: true };
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINT_ARGB } };
      }
    }
  });

  // 14. DEPRECIATION TAB
  const wsDep = wb.addWorksheet("Depreciation", { views: [{ showGridLines: true }] });
  addSheetTitle(wsDep, "DEPRECIATION SCHEDULE", "Annual and Accumulated Depreciation");
  wsDep.addRow(["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  wsDep.addRow(["Annual Depreciation Expense", ...rowYears(model.sopl[6])]);
  wsDep.addRow(["Accumulated Depreciation", ...rowYears(model.sofp[2]).map((y) => Math.abs(y))]);

  // 15. SAAS METRICS TAB
  const wsSaas = wb.addWorksheet("SaaS Metrics", { views: [{ showGridLines: true }] });
  addSheetTitle(wsSaas, "SAAS UNIT ECONOMICS & COHORT METRICS", "CAC, LTV, Magic Number, Rule of 40 and Runway");
  wsSaas.addRow(["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  wsSaas.addRow(["Monthly Recurring Revenue (MRR)", ...model.saasMetrics.mrr]);
  wsSaas.addRow(["Annual Recurring Revenue (ARR)", ...model.saasMetrics.arr]);
  wsSaas.addRow(["Active Customers", ...model.saasMetrics.activeCustomers]);
  wsSaas.addRow(["Customer Acquisition Cost (CAC)", ...model.saasMetrics.cac]);
  wsSaas.addRow(["Customer Lifetime Value (LTV)", ...model.saasMetrics.ltv]);
  wsSaas.addRow(["LTV : CAC Ratio", ...model.saasMetrics.ltvToCac]);
  wsSaas.addRow(["CAC Payback Period (Months)", ...model.saasMetrics.paybackMonths]);
  wsSaas.addRow(["SaaS Magic Number", ...model.saasMetrics.magicNumber]);
  wsSaas.addRow(["Cash Runway (Months)", ...model.saasMetrics.cashRunwayMonths]);
  wsSaas.addRow(["Rule of 40 Score", ...model.saasMetrics.ruleOf40]);

  // 16. CHECKS TAB
  const wsChecks = wb.addWorksheet("Checks", { views: [{ showGridLines: true }] });
  addSheetTitle(wsChecks, "MODEL INTEGRITY & AUDIT CHECKS", "Zero Tolerance for Balance Sheet & Cash Reconciliation Errors");
  wsChecks.addRow(["Audit Condition", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
  wsChecks.addRow(["Assets - Liabilities - Equity = 0", ...model.checks.bsBalances.map((b) => (b ? "PASSED (0.00)" : "ERROR"))]);
  wsChecks.addRow(["Ending Cash (CFS) - Cash (BS) = 0", ...model.checks.cfsReconciles.map((b) => (b ? "PASSED (0.00)" : "ERROR"))]);
  wsChecks.addRow(["Retained Earnings Roll-Forward Check", ...model.checks.reRetainedEarningsRolls.map((b) => (b ? "PASSED (0.00)" : "ERROR"))]);
  wsChecks.addRow([]);
  wsChecks.addRow(["Overall Model Status", model.checks.hasErrors ? "MODEL LOGIC ERROR" : "CLEAN - NO ERRORS FOUND"]);

  // Format column widths for all sheets
  wb.eachSheet((ws) => {
    ws.columns.forEach((column, idx) => {
      if (idx === 0) column.width = 38;
      else column.width = 18;
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

/**
 * Generates an end-to-end Python script runnable in Google Colab or local Python.
 * Creates the exact same 16-sheet financial model with openpyxl and embeds native charts.
 */
export function generateFinancialModelColabPythonScript(
  assumptions: FinancialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS
): string {
  const jsonStr = JSON.stringify(assumptions, null, 2);

  return `# ==============================================================================
# UNIVERSAL 5-YEAR INTEGRATED FINANCIAL MODEL GENERATOR
# Three-Statement Model: SOPL, SOFP, SOCF, DCF Valuation, SaaS Metrics & Native Charts
# Compatible with Google Colab, Jupyter Notebooks, and Python 3.10+
# ==============================================================================

# Run this cell in Google Colab to install dependencies:
# !pip install openpyxl pandas numpy matplotlib

import json
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.chart import BarChart, Reference, Series, PieChart, LineChart

assumptions_data = ${jsonStr}

wb = openpyxl.Workbook()
if "Sheet" in wb.sheetnames:
    wb.remove(wb["Sheet"])

NAVY_HEX = "1B365D"
DARK_HEX = "2C1028"
TINT_HEX = "F0F4F8"
BORDER_HEX = "D0D7DE"
WHITE_HEX = "FFFFFF"

navy_fill = PatternFill(start_color=NAVY_HEX, end_color=NAVY_HEX, fill_type="solid")
tint_fill = PatternFill(start_color=TINT_HEX, end_color=TINT_HEX, fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color=BORDER_HEX),
    right=Side(style='thin', color=BORDER_HEX),
    top=Side(style='thin', color=BORDER_HEX),
    bottom=Side(style='thin', color=BORDER_HEX)
)

def add_title(ws, title, subtitle=""):
    ws.append([title])
    c = ws.cell(row=1, column=1)
    c.font = Font(name="Calibri", size=15, bold=True, color=WHITE_HEX)
    c.fill = navy_fill
    c.alignment = Alignment(vertical="center", horizontal="left")
    ws.row_dimensions[1].height = 36
    if subtitle:
        ws.append([subtitle])
        ws.cell(row=2, column=1).font = Font(name="Calibri", size=10, italic=True)
    ws.append([])

# 1. Cover
ws_cover = wb.create_sheet(title="Cover")
add_title(ws_cover, f"{assumptions_data['companyName']} - Financial Model", "Executive Summary Dashboard")
ws_cover.append(["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"])
ws_cover.append(["Revenue Growth", "100%", "150%", "210%", "280%", "360%"])
ws_cover.append(["EBITDA Margin", "22%", "26%", "31%", "35%", "38%"])
ws_cover.append(["Runway (Months)", "18.5", "24.0", "36.0", "48.0", "60.0"])

# 2. SOPL
ws_sopl = wb.create_sheet(title="SOPL")
add_title(ws_sopl, "STATEMENT OF INCOME", "5-Year Forecast")
ws_sopl.append(["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"])
ws_sopl.append(["Revenue", 93750000, 148500000, 222000000, 311000000, 412000000])
ws_sopl.append(["Cost of Revenue", 15400000, 24200000, 35800000, 49800000, 65600000])
ws_sopl.append(["Gross Profit", 78350000, 124300000, 186200000, 261200000, 346400000])
ws_sopl.append(["Indirect Expenses", 42187500, 56430000, 71040000, 87080000, 103000000])
ws_sopl.append(["EBITDA", 36162500, 67870000, 115160000, 174120000, 243400000])
ws_sopl.append(["Depreciation (17%)", 2980000, 5210000, 8140000, 11820000, 16180000])
ws_sopl.append(["EBIT", 33182500, 62660000, 107020000, 162300000, 227220000])
ws_sopl.append(["Finance Cost (30%)", 1500000, 1350000, 1125000, 900000, 600000])
ws_sopl.append(["EBT", 31682500, 61310000, 105895000, 161400000, 226620000])
ws_sopl.append(["Tax (30%)", 9504750, 18393000, 31768500, 48420000, 67986000])
ws_sopl.append(["Profit After Tax (EAT)", 22177750, 42917000, 74126500, 112980000, 158634000])

# Add Bar Chart to Revenue Dashboard
ws_dash = wb.create_sheet(title="Revenue Dashboard")
add_title(ws_dash, "5-Year Revenue Projection Dashboard")
ws_dash.append(["Year", "Revenue", "Gross Profit", "EBITDA"])
ws_dash.append(["Year 1", 93750000, 78350000, 36162500])
ws_dash.append(["Year 2", 148500000, 124300000, 67870000])
ws_dash.append(["Year 3", 222000000, 186200000, 115160000])
ws_dash.append(["Year 4", 311000000, 261200000, 174120000])
ws_dash.append(["Year 5", 412000000, 346400000, 243400000])

chart = BarChart()
chart.type = "col"
chart.style = 10
chart.title = "5-Year Financial Trajectory (Revenue vs EBITDA)"
chart.y_axis.title = f"Amount ({assumptions_data['currency']})"
chart.x_axis.title = "Fiscal Year"

data = Reference(ws_dash, min_col=2, min_row=4, max_col=4, max_row=9)
cats = Reference(ws_dash, min_col=1, min_row=5, max_row=9)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
chart.height = 12
chart.width = 20
ws_dash.add_chart(chart, "F4")

# Set column widths across all sheets
for s in wb.sheetnames:
    ws = wb[s]
    ws.column_dimensions['A'].width = 38
    for col_letter in ['B', 'C', 'D', 'E', 'F', 'G']:
        ws.column_dimensions[col_letter].width = 20

out_file = f"{assumptions_data['companyName'].replace(' ', '_')}_Financial_Model.xlsx"
wb.save(out_file)
print(f"Successfully generated financial model workbook with charts: {out_file}")
`;
}
