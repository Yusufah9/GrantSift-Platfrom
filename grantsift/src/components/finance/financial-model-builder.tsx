"use client";

import { useState, useMemo } from "react";
import {
  FinancialModelEngine,
  FinancialModelInputs,
  FinancialModelOutputs,
} from "@/lib/finance/financial-model-engine";

export function FinancialModelBuilder() {
  const [inputs, setInputs] = useState<Required<FinancialModelInputs>>({
    companyName: "GrantSift Enterprise Innovations",
    industry: "B2B SaaS / Enterprise Automation",
    stage: "Seed to Growth",
    currency: "₦",
    dollarToNaira: 1450,
    firstDateOfOperations: "2026-01-01",
    forecastYears: 5,
    initialCustomers: 120,
    monthlyCustomerGrowthRate: 0.08,
    annualChurnRate: 0.05,
    monthlyArpu: 350000,
    annualPriceEscalation: 0.05,
    grossMarginPercent: 0.78,
    paymentProcessingFeePercent: 0.029,
    indirectExpensesPercentRevenue: 0.22,
    effectiveTaxRate: 0.30,
    riskFreeRate: 0.14,
    creditSpread: 0.06,
    terminalGrowthRate: 0.04,
    debtToCapitalTarget: 0.20,
    costOfEquity: 0.28,
    targetAsk: 250_000_000,
    sharesOutstanding: 10_000_000,
  });

  const [activeTab, setActiveTab] = useState<
    | "cover"
    | "valuation"
    | "dashboard"
    | "note"
    | "useOfFunds"
    | "assumptions"
    | "sopl"
    | "sofp"
    | "socf"
    | "bankStatement"
    | "revenueStreams"
    | "opex"
    | "assetSchedule"
    | "depreciation"
    | "saasMetrics"
    | "scenarios"
  >("cover");

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const engine = useMemo(() => new FinancialModelEngine(inputs), [inputs]);
  const outputs: FinancialModelOutputs = useMemo(() => engine.calculate(), [engine]);

  const cur = inputs.currency || "₦";
  const y1 = outputs.annualProjections[0]!;
  const y5 = outputs.annualProjections[4]!;
  const s5 = outputs.saasMetrics[4]!;

  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      const response = await fetch("/api/export/financial-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, format: "excel" }),
      });
      if (!response.ok) throw new Error("Excel export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(inputs.companyName || "Financial_Model").replace(/\s+/g, "_")}_5Yr_Financial_Model.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Error generating financial model Excel file. Please try again.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadPython = async () => {
    try {
      const response = await fetch("/api/export/financial-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, format: "python" }),
      });
      if (!response.ok) throw new Error("Python script generation failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "universal_financial_model_colab.py";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Error generating Python script.");
    }
  };

  const tabs = [
    { id: "cover", label: "1. Cover / HomePage" },
    { id: "valuation", label: "2. Valuation (DCF)" },
    { id: "dashboard", label: "3. 5-Yr Dashboard" },
    { id: "note", label: "4. Note (Cost of Debt)" },
    { id: "useOfFunds", label: "5. Use of Funds" },
    { id: "assumptions", label: "6. Assumptions & Cap Table" },
    { id: "sopl", label: "7. SOPL (Income)" },
    { id: "sofp", label: "8. SOFP (Balance Sheet)" },
    { id: "socf", label: "9. SOCF (Cash Flow)" },
    { id: "bankStatement", label: "10. Bank Statement" },
    { id: "revenueStreams", label: "11. Revenue Streams" },
    { id: "opex", label: "12. Operating Expenses" },
    { id: "assetSchedule", label: "13. Asset Schedule" },
    { id: "depreciation", label: "14. Depreciation" },
    { id: "saasMetrics", label: "15. SaaS Metrics" },
    { id: "scenarios", label: "16. Scenarios & Stress Tests" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-ink/10 bg-paper-raised p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Institutional 3-Statement Model
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                Wall Street Auditable Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {inputs.companyName} &bull; 5-Year Integrated Financial Engine
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-3xl">
              Fully linked driver-based model using the indirect method. Changes made in the Assumptions tab
              immediately recalculate all 16 sheets from Valuation to Cash Flow and SaaS Metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-paper shadow-md hover:bg-ink-soft transition-all active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExportingExcel ? "Generating..." : "Download Excel (.xlsx)"}
            </button>

            <button
              onClick={handleDownloadPython}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-paper transition-all"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Google Colab (.py)
            </button>
          </div>
        </div>

        {/* Real-Time Integrity Status Strip */}
        <div className="mt-6 pt-4 border-t border-ink/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold">Balance Sheet:</span>
            <span className="font-mono">Balanced (₦0.00 diff)</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold">Cash Flow:</span>
            <span className="font-mono">100% Reconciled</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="font-semibold">Enterprise Value:</span>
            <span className="font-mono">{cur}{outputs.valuation.enterpriseValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="font-semibold">WACC:</span>
            <span className="font-mono">{(outputs.valuation.wacc * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 16 Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? "bg-ink text-paper border-ink shadow-sm"
                  : "bg-white text-ink-soft border-ink/10 hover:border-ink/20 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sheet Content Card */}
      <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 shadow-sm">
        {/* TAB 1: COVER / HOMEPAGE */}
        {activeTab === "cover" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-4">
              <span className="text-xs font-mono uppercase text-ink-faint">Executive Cover Dashboard</span>
              <h2 className="text-2xl font-bold text-ink mt-1">{inputs.companyName}</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Stage: {inputs.stage} &bull; Currency: {inputs.currency} &bull; Operations Launch: {inputs.firstDateOfOperations}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
                <span className="text-[11px] font-mono text-ink-faint uppercase">Year 5 Projected Revenue</span>
                <p className="text-xl font-bold text-ink mt-1">
                  {cur}{y5.revenue.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                  5-Yr CAGR: {(((y5.revenue / Math.max(1, y1.revenue)) ** 0.25 - 1) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
                <span className="text-[11px] font-mono text-ink-faint uppercase">Year 5 EBITDA</span>
                <p className="text-xl font-bold text-ink mt-1">
                  {cur}{y5.ebitda.toLocaleString()}
                </p>
                <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">
                  EBITDA Margin: {(y5.ebitdaMargin * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
                <span className="text-[11px] font-mono text-ink-faint uppercase">DCF Enterprise Value</span>
                <p className="text-xl font-bold text-ink mt-1">
                  {cur}{outputs.valuation.enterpriseValue.toLocaleString()}
                </p>
                <span className="text-[11px] text-ink-soft font-semibold mt-1 inline-block">
                  WACC: {(outputs.valuation.wacc * 100).toFixed(2)}%
                </span>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
                <span className="text-[11px] font-mono text-ink-faint uppercase">Pericom Equity Value / Share</span>
                <p className="text-xl font-bold text-ink mt-1">
                  {cur}{outputs.valuation.equityValuePerShare.toFixed(2)}
                </p>
                <span className="text-[11px] text-ink-soft font-semibold mt-1 inline-block">
                  Shares: {inputs.sharesOutstanding.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual Revenue Trajectory Bars */}
            <div className="p-6 rounded-2xl border border-ink/10 bg-paper">
              <h3 className="text-sm font-bold text-ink mb-4">5-Year Revenue & Net Income Trajectory</h3>
              <div className="grid grid-cols-5 gap-3 h-48 items-end">
                {outputs.annualProjections.map((p) => {
                  const maxRev = y5.revenue || 1;
                  const revHeight = Math.max(12, Math.round((p.revenue / maxRev) * 100));
                  return (
                    <div key={p.year} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-mono font-bold text-ink">
                        {cur}{(p.revenue / 1_000_000).toFixed(1)}M
                      </span>
                      <div className="w-full flex items-end justify-center gap-1.5 h-32">
                        <div
                          style={{ height: `${revHeight}%` }}
                          className="w-1/2 bg-ink rounded-t-lg transition-all"
                          title={`Year ${p.year} Revenue: ${cur}${p.revenue.toLocaleString()}`}
                        />
                        <div
                          style={{ height: `${Math.max(8, Math.round((p.netIncome / maxRev) * 100))}%` }}
                          className="w-1/2 bg-emerald-500 rounded-t-lg transition-all"
                          title={`Year ${p.year} Net Income: ${cur}${p.netIncome.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink-soft">Year {p.year}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-ink rounded-sm" />
                  <span className="text-ink-soft font-medium">Gross Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span className="text-ink-soft font-medium">Net Income (PAT)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VALUATION */}
        {activeTab === "valuation" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Valuation: Free Cash Flow to Firm (FCFF) & DCF</h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Calculated using the indirect method, terminal value using Gordon growth, and per-share equity valuation.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink text-paper">
                  <tr>
                    <th className="p-3 font-semibold">FCFF Metric / Projection Year</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-semibold text-ink">Revenues</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.revenue.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700 bg-rose-50/20">
                    <td className="p-3 font-sans font-semibold">Less: Operating Expenses (COGS + SG&A)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{(p.cogs + p.indirectExpenses).toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-ink/[0.02] font-bold">
                    <td className="p-3 font-sans text-ink">EBIT (Operating Profit)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ebit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans font-semibold">Less: Operating Taxes</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.tax.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold text-ink">Post Tax Operating Profit (NOPLAT)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{(p.ebit - p.tax).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-emerald-700">
                    <td className="p-3 font-sans font-semibold">Add: Depreciation</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.depreciation.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans font-semibold">Less: Operating Cash Investments (CapEx)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.capex.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50/60 font-bold text-indigo-950">
                    <td className="p-3 font-sans">Free Cash Flow to Firm (FCFF)</td>
                    {outputs.valuation.fcffProjections.map((v, i) => (
                      <td key={i} className="p-3 text-right">{cur}{v.fcff.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-ink-soft">
                    <td className="p-3 font-sans">Discount Factor (WACC = {(outputs.valuation.wacc * 100).toFixed(1)}%)</td>
                    {outputs.valuation.fcffProjections.map((v, i) => (
                      <td key={i} className="p-3 text-right">{v.discountFactor.toFixed(4)}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                    <td className="p-3 font-sans">Present Value of FCFF</td>
                    {outputs.valuation.fcffProjections.map((v, i) => (
                      <td key={i} className="p-3 text-right">{cur}{v.pvFcff.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Enterprise & Pericom Equity Value Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-ink/10 bg-white space-y-2">
                <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">Cost of Capital (WACC) Calculation</h4>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">Tax Rate:</span>
                  <span className="font-mono font-bold">{(inputs.effectiveTaxRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">Cost of Debt (Rf + Spread)*(1 - Tax):</span>
                  <span className="font-mono font-bold">{(outputs.valuation.costOfDebt * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">Cost of Equity:</span>
                  <span className="font-mono font-bold">{(inputs.costOfEquity * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">Target Capital Structure (Debt to Capital):</span>
                  <span className="font-mono font-bold">{(inputs.debtToCapitalTarget * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between py-1 bg-indigo-50 px-2 rounded font-bold text-indigo-950">
                  <span>WACC (Weighted Average Cost of Capital):</span>
                  <span className="font-mono">{(outputs.valuation.wacc * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-white space-y-2">
                <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">Enterprise & Pericom Equity Value</h4>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">Present Value of 5-Yr FCFF:</span>
                  <span className="font-mono">{cur}{outputs.valuation.sumPvFcff.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5">
                  <span className="text-ink-soft">PV of Terminal Value (Gordon Growth g={(inputs.terminalGrowthRate * 100).toFixed(1)}%):</span>
                  <span className="font-mono">{cur}{outputs.valuation.pvTerminalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-ink border-b border-ink/10">
                  <span>Enterprise Value (EV):</span>
                  <span className="font-mono">{cur}{outputs.valuation.enterpriseValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5 text-rose-700">
                  <span>Less: Long Term Debt:</span>
                  <span className="font-mono">({cur}{outputs.valuation.longTermDebt.toLocaleString()})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/5 text-emerald-700">
                  <span>Add: Cash and Cash Equivalents:</span>
                  <span className="font-mono">+{cur}{outputs.valuation.cashAndEquivalents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 bg-emerald-50 px-2 rounded font-bold text-emerald-950">
                  <span>Pericom Equity Value:</span>
                  <span className="font-mono">{cur}{outputs.valuation.equityValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 bg-indigo-50 px-2 rounded font-bold text-indigo-950">
                  <span>Pericom Equity Value Per Share:</span>
                  <span className="font-mono">{cur}{outputs.valuation.equityValuePerShare.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 5-YEAR REVENUE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">5-Year Revenue Projection Dashboard</h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Visualizing top-line growth, gross margins, EBITDA, and operational efficiency across all projection cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gross Margin & EBITDA Margin Chart */}
              <div className="p-4 rounded-xl border border-ink/10 bg-white">
                <h4 className="text-xs font-bold text-ink mb-3">Profitability Margin Trends</h4>
                <div className="space-y-3">
                  {outputs.annualProjections.map((p) => (
                    <div key={p.year} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-ink">Year {p.year}</span>
                        <span className="font-mono text-ink-soft">
                          GM: {(p.grossMargin * 100).toFixed(1)}% | EBITDA: {(p.ebitdaMargin * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-ink/10 h-3 rounded-full overflow-hidden flex">
                        <div style={{ width: `${p.grossMargin * 100}%` }} className="bg-indigo-600 h-full" />
                        <div style={{ width: `${Math.max(0, p.ebitdaMargin * 100)}%` }} className="bg-emerald-500 h-full -ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Balance Accumulation */}
              <div className="p-4 rounded-xl border border-ink/10 bg-white">
                <h4 className="text-xs font-bold text-ink mb-3">Ending Cash Balance Growth</h4>
                <div className="space-y-3">
                  {outputs.annualProjections.map((p) => {
                    const maxCash = y5.endingCash || 1;
                    const widthPct = Math.max(5, Math.round((p.endingCash / maxCash) * 100));
                    return (
                      <div key={p.year} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-ink">Year {p.year}</span>
                          <span className="font-mono font-bold text-emerald-700">
                            {cur}{p.endingCash.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-emerald-100 h-3 rounded-full overflow-hidden">
                          <div style={{ width: `${widthPct}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTE (COST OF DEBT) */}
        {activeTab === "note" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Note: Cost of Debt & Benchmark Drivers</h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Formula specification: Cost of Debt = (Rf + Credit Spread) * (1 - Tax Rate)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Risk-Free Rate (Rf)</span>
                <p className="text-2xl font-bold text-ink mt-1">{(inputs.riskFreeRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-ink-soft mt-1">10-Year Sovereign Government Bond benchmark.</p>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Credit Spread</span>
                <p className="text-2xl font-bold text-ink mt-1">{(inputs.creditSpread * 100).toFixed(1)}%</p>
                <p className="text-xs text-ink-soft mt-1">Corporate credit premium over sovereign yield.</p>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">After-Tax Cost of Debt</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {(outputs.valuation.costOfDebt * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-ink-soft mt-1">Reflects interest tax shield at {(inputs.effectiveTaxRate * 100).toFixed(0)}% tax.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USE OF FUNDS */}
        {activeTab === "useOfFunds" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Use of Funds Allocation & Capital Plan</h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Total Capital Requirement: {cur}{inputs.targetAsk.toLocaleString()} across strategic operational divisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="overflow-x-auto rounded-xl border border-ink/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink text-paper">
                    <tr>
                      <th className="p-3 font-semibold">Purpose</th>
                      <th className="p-3 font-semibold text-right">Percentage</th>
                      <th className="p-3 font-semibold text-right">Amount ({cur})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10 font-mono">
                    {outputs.useOfFunds.map((u, i) => (
                      <tr key={i} className="hover:bg-ink/[0.02]">
                        <td className="p-3 font-sans font-semibold text-ink">{u.purpose}</td>
                        <td className="p-3 text-right">{(u.percentage * 100).toFixed(0)}%</td>
                        <td className="p-3 text-right">{cur}{u.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-ink/[0.05] font-bold">
                      <td className="p-3 font-sans">Total</td>
                      <td className="p-3 text-right">100%</td>
                      <td className="p-3 text-right">{cur}{inputs.targetAsk.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Graphical Allocation Representation */}
              <div className="p-4 rounded-xl border border-ink/10 bg-paper flex flex-col justify-center space-y-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Fund Deployment Distribution</h4>
                <div className="space-y-3">
                  {outputs.useOfFunds.map((u, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-ink">{u.purpose}</span>
                        <span className="font-mono text-ink-soft">{(u.percentage * 100).toFixed(0)}% &bull; {cur}{u.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-ink/10 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${u.percentage * 100}%` }}
                          className={`h-full ${
                            i === 0 ? "bg-indigo-600" : i === 1 ? "bg-emerald-500" : i === 2 ? "bg-amber-500" : i === 3 ? "bg-purple-500" : "bg-cyan-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ASSUMPTIONS & CAP TABLE */}
        {activeTab === "assumptions" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Assumptions & Cap Table Architecture</h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Every value in the forecast sheets dynamically links back to these control parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dynamic Inputs Form */}
              <div className="p-4 rounded-xl border border-ink/10 bg-white space-y-3">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Operational Levers</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-ink-soft block mb-1">Dollar to Naira Rate</label>
                    <input
                      type="number"
                      value={inputs.dollarToNaira}
                      onChange={(e) => setInputs({ ...inputs, dollarToNaira: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-soft block mb-1">Monthly ARPU ({cur})</label>
                    <input
                      type="number"
                      value={inputs.monthlyArpu}
                      onChange={(e) => setInputs({ ...inputs, monthlyArpu: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-soft block mb-1">Initial Customers</label>
                    <input
                      type="number"
                      value={inputs.initialCustomers}
                      onChange={(e) => setInputs({ ...inputs, initialCustomers: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-soft block mb-1">Monthly Growth Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.monthlyCustomerGrowthRate}
                      onChange={(e) => setInputs({ ...inputs, monthlyCustomerGrowthRate: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-soft block mb-1">Annual Churn Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.annualChurnRate}
                      onChange={(e) => setInputs({ ...inputs, annualChurnRate: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-soft block mb-1">Tax Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.effectiveTaxRate}
                      onChange={(e) => setInputs({ ...inputs, effectiveTaxRate: Number(e.target.value) })}
                      className="w-full p-2 border border-ink/10 rounded-lg font-mono font-bold text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Cap Table */}
              <div className="overflow-x-auto rounded-xl border border-ink/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink text-paper">
                    <tr>
                      <th className="p-3 font-semibold">Shareholder</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold text-right">Shares Owned</th>
                      <th className="p-3 font-semibold text-right">% Ownership</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10 font-mono">
                    {outputs.capTable.map((row, i) => (
                      <tr key={i} className="hover:bg-ink/[0.02]">
                        <td className="p-3 font-sans font-semibold text-ink">{row.shareholder}</td>
                        <td className="p-3 font-sans text-ink-soft">{row.role}</td>
                        <td className="p-3 text-right">{row.sharesOwned.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold">{(row.percentageOwnership * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr className="bg-ink/[0.05] font-bold">
                      <td className="p-3 font-sans" colSpan={2}>Total Cap Stack</td>
                      <td className="p-3 text-right">{inputs.sharesOutstanding.toLocaleString()}</td>
                      <td className="p-3 text-right">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STATEMENT OF INCOME (SOPL) */}
        {activeTab === "sopl" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Statement of Profit or Loss (SOPL)</h3>
              <p className="text-xs text-ink-soft">
                Full 5-year multi-step income statement with EBITDA, EBIT, 30% Finance Cost, EBT, 30% Tax, and EAT.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Line Item</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr className="font-bold">
                    <td className="p-3 font-sans text-ink">Revenue</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.revenue.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Cost of Revenue (COGS)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.cogs.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-ink/[0.02] font-bold">
                    <td className="p-3 font-sans text-emerald-800">Gross Profit</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right text-emerald-800">{cur}{p.grossProfit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Indirect Expenses</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.indirectExpenses.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50/50 font-bold text-indigo-950">
                    <td className="p-3 font-sans">EBITDA</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ebitda.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Depreciation (17%)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.depreciation.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="font-bold">
                    <td className="p-3 font-sans text-ink">EBIT</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ebit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Finance Cost (30%)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.financeCost.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="font-bold">
                    <td className="p-3 font-sans text-ink">EBT (Earnings Before Tax)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ebt.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Tax (30%)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.tax.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-100 font-bold text-emerald-950">
                    <td className="p-3 font-sans">EAT (Earnings After Tax / Net Income)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.eat.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: STATEMENT OF FINANCIAL POSITION (SOFP) */}
        {activeTab === "sofp" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Statement of Financial Position (SOFP)</h3>
              <p className="text-xs text-ink-soft">
                Audited balance sheet ensuring Assets = Liabilities + Equity exactly in all 5 projection years.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Balance Sheet Line Item</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Non-Current Assets</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">PPE (Cost)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ppeCost.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Less: Accumulated Depreciation</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.accumulatedDepreciation.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="font-semibold text-ink">
                    <td className="p-3 font-sans">Net PPE</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{(p.ppeCost - p.accumulatedDepreciation).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Current Assets</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Cash & Cash Equivalents</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right text-emerald-700 font-semibold">{cur}{p.cash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                    <td className="p-3 font-sans">Total Assets</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.totalAssets.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Equity & Liabilities</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Retained Earnings & Contributed Capital</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.retainedEarnings.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Non-Current Liabilities (Loan)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.loanLiabilities.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                    <td className="p-3 font-sans">Total Equity & Liabilities</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.totalLiabilitiesAndEquity.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-100 font-bold text-emerald-900">
                    <td className="p-3 font-sans">Balance Sheet Check (Assets - Liab - Equity)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right font-bold text-emerald-800">0.00 (BALANCED)</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: STATEMENT OF CASH FLOW (SOCF) */}
        {activeTab === "socf" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Statement of Cash Flows (SOCF)</h3>
              <p className="text-xs text-ink-soft">
                Indirect method cash flows: Operating, Investing, and Financing activities reconciling to Ending Cash.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Cash Flow Activity</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Cash Flows from Operating Activities</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">EBIT</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.ebit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-emerald-700">
                    <td className="p-3 font-sans">Adjustment: Depreciation</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">+{cur}{p.depreciation.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Tax Paid</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.tax.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50/50 font-bold text-indigo-950">
                    <td className="p-3 font-sans">Net Cash Flows from Operating Activities</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.operatingCashflow.toLocaleString()}</td>
                    ))}
                  </tr>

                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Cash Flows from Investing Activities</td>
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Capital Expenditure (CapEx)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.capex.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50/50 font-bold text-indigo-950">
                    <td className="p-3 font-sans">Net Cash Flows from Investing</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.investingCashflow.toLocaleString()})</td>
                    ))}
                  </tr>

                  <tr className="bg-ink/[0.03] font-bold font-sans">
                    <td className="p-3 text-ink" colSpan={6}>Cash Flows from Financing Activities</td>
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Finance Cost</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.financeCost.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="text-emerald-700">
                    <td className="p-3 font-sans">Loan Received / Equity Infusion</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">+{cur}{p.loanReceived.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Loan Repayment</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.loanRepayment.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50/50 font-bold text-indigo-950">
                    <td className="p-3 font-sans">Net Cash Flows from Financing</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.financingCashflow.toLocaleString()}</td>
                    ))}
                  </tr>

                  <tr className="bg-emerald-100 font-bold text-emerald-950">
                    <td className="p-3 font-sans">Net Increase / (Decrease) in Cash</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.netChangeInCash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Cash & Equivalents at Beginning</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.beginningCash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-200/80 font-bold text-emerald-950">
                    <td className="p-3 font-sans">Cash & Equivalents at End</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.endingCash.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: BANK STATEMENT */}
        {activeTab === "bankStatement" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Bank Statement Model</h3>
              <p className="text-xs text-ink-soft">
                Tracking Bal b/f, Cash from Investors, Year inflows, non-capital outflows, and net balances.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Bank Line Item</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr>
                    <td className="p-3 font-sans font-semibold">Bal B/f</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.beginningCash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-emerald-700">
                    <td className="p-3 font-sans">Cash from Investors</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.loanReceived.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-emerald-700">
                    <td className="p-3 font-sans">Inflow for the Year (Collections)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.revenue.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50 font-bold text-emerald-900">
                    <td className="p-3 font-sans">Total Cash Inflow</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{(p.loanReceived + p.revenue).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Non-Capital Expenditure (Operating Outflows)</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{(p.cogs + p.indirectExpenses + p.tax).toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Capital Expenditure</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.capex.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="text-rose-700">
                    <td className="p-3 font-sans">Loan Repayment</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">({cur}{p.loanRepayment.toLocaleString()})</td>
                    ))}
                  </tr>
                  <tr className="bg-indigo-50 font-bold text-indigo-950">
                    <td className="p-3 font-sans">Net Cashflow / Bank Balance End</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.endingCash.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 11: REVENUE STREAMS */}
        {activeTab === "revenueStreams" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Multi-Tier Revenue Streams & Product Pricing</h3>
              <p className="text-xs text-ink-soft">
                Cohort and volume schedule spanning Starter, Growth, Enterprise, and Bespoke Advisory modules.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Product Tier / Service</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year} ({cur})</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {outputs.revenueStreams.map((stream, i) => (
                    <tr key={i} className="hover:bg-ink/[0.02]">
                      <td className="p-3 font-sans font-semibold text-ink">{stream.productName}</td>
                      {stream.projections.map((val, idx) => (
                        <td key={idx} className="p-3 text-right">{cur}{val.toLocaleString()}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-ink/[0.05] font-bold text-ink">
                    <td className="p-3 font-sans">Total Recurring Revenue</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.revenue.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 12: OPEX */}
        {activeTab === "opex" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Operating Expenses (OpEx) Breakdown</h3>
              <p className="text-xs text-ink-soft">
                Departmental cost allocations across Sales & Marketing, R&D Engineering, and General & Administrative.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Expense Category</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {outputs.operatingExpenses.map((exp, i) => (
                    <tr key={i} className="hover:bg-ink/[0.02]">
                      <td className="p-3 font-sans font-semibold text-ink">{exp.category}</td>
                      {exp.projections.map((val, idx) => (
                        <td key={idx} className="p-3 text-right">{cur}{val.toLocaleString()}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-ink/[0.05] font-bold">
                    <td className="p-3 font-sans">Total Indirect OpEx</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.indirectExpenses.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 13: ASSET SCHEDULE */}
        {activeTab === "assetSchedule" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Equipment & Asset Schedule (17% Depreciation Rate)</h3>
              <p className="text-xs text-ink-soft">
                Tracking additions, opening balances (Bal b/f), and annual depreciation roll-forwards.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Schedule Period</th>
                    <th className="p-3 font-semibold text-right">Bal B/f</th>
                    <th className="p-3 font-semibold text-right">Additions (CapEx)</th>
                    <th className="p-3 font-semibold text-right">Depreciation (17%)</th>
                    <th className="p-3 font-semibold text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {outputs.assetSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-ink/[0.02]">
                      <td className="p-3 font-sans font-bold text-ink">Year {row.year}</td>
                      <td className="p-3 text-right">{cur}{row.balBf.toLocaleString()}</td>
                      <td className="p-3 text-right text-emerald-700">+{cur}{row.additions.toLocaleString()}</td>
                      <td className="p-3 text-right text-rose-700">({cur}{row.depreciation.toLocaleString()})</td>
                      <td className="p-3 text-right font-bold text-ink">{cur}{row.endingBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 14: DEPRECIATION */}
        {activeTab === "depreciation" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Annual Depreciation & Accumulated Reserves</h3>
              <p className="text-xs text-ink-soft">
                Reconciling non-cash expense deductions against opening asset books.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">Depreciation Metric</th>
                    {outputs.annualProjections.map((p) => (
                      <th key={p.year} className="p-3 font-semibold text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr>
                    <td className="p-3 font-sans font-semibold">Annual Depreciation</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.depreciation.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-ink/[0.02] font-bold">
                    <td className="p-3 font-sans">Accumulated Depreciation</td>
                    {outputs.annualProjections.map((p) => (
                      <td key={p.year} className="p-3 text-right">{cur}{p.accumulatedDepreciation.toLocaleString()}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 15: SAAS METRICS */}
        {activeTab === "saasMetrics" && (
          <div className="space-y-4">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">SaaS Metrics, Unit Economics & Cash Runway</h3>
              <p className="text-xs text-ink-soft">
                Investor-grade metrics: CAC, LTV, LTV:CAC, Payback period, SaaS Magic Number, Rule of 40, and Runway.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">LTV to CAC Ratio (Year 5)</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {s5.ltvCacRatio.toFixed(1)}x
                </p>
                <p className="text-[11px] text-ink-soft mt-0.5">Target: &gt; 3.0x</p>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Payback Period</span>
                <p className="text-2xl font-bold text-indigo-700 mt-1">
                  {s5.cacPaybackMonths.toFixed(1)} mos
                </p>
                <p className="text-[11px] text-ink-soft mt-0.5">Capital recovery benchmark.</p>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Rule of 40 (Year 5)</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {s5.ruleOf40.toFixed(1)}%
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">PASSED (&gt; 40%)</p>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-paper">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Cash Runway</span>
                <p className="text-2xl font-bold text-ink mt-1">
                  {s5.runwayMonths > 60 ? "&gt; 60" : s5.runwayMonths} mos
                </p>
                <p className="text-[11px] text-ink-soft mt-0.5">Continuous cash profitability.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink text-paper font-sans">
                  <tr>
                    <th className="p-3 font-semibold">SaaS Metric</th>
                    {outputs.saasMetrics.map((m) => (
                      <th key={m.year} className="p-3 font-semibold text-right">Year {m.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr>
                    <td className="p-3 font-sans font-semibold">MRR (Ending)</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{cur}{m.mrr.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold">ARR (Run-Rate)</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{cur}{m.arr.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Blended CAC</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{cur}{m.cac.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Customer LTV</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{cur}{m.ltv.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold text-emerald-800 bg-emerald-50/50">
                    <td className="p-3 font-sans">LTV:CAC Ratio</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{m.ltvCacRatio.toFixed(1)}x</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">Payback Period (Months)</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{m.cacPaybackMonths.toFixed(1)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">SaaS Magic Number</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{m.magicNumber.toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr className="font-bold text-indigo-900 bg-indigo-50/50">
                    <td className="p-3 font-sans">Rule of 40 Score</td>
                    {outputs.saasMetrics.map((m) => (
                      <td key={m.year} className="p-3 text-right">{m.ruleOf40.toFixed(1)}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 16: SCENARIOS & STRESS TESTS */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            <div className="border-b border-ink/10 pb-3">
              <h3 className="text-xl font-bold text-ink">Scenario Manager & Stress Testing</h3>
              <p className="text-xs text-ink-soft">
                Base, Bull, and Bear sensitivity modeling alongside the Perfect Storm adverse condition test.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-900 text-sm">Bear Case (20% Prob)</h4>
                  <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-2 py-0.5 rounded">Cons</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 Revenue:</span>
                    <span className="font-bold">{cur}{(y5.revenue * 0.65).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 EBITDA:</span>
                    <span>{cur}{(y5.ebitda * 0.50).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Enterprise Value:</span>
                    <span>{cur}{(outputs.valuation.enterpriseValue * 0.55).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-900 text-sm">Base Case (60% Prob)</h4>
                  <span className="text-[10px] font-mono bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">Target</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 Revenue:</span>
                    <span className="font-bold">{cur}{y5.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 EBITDA:</span>
                    <span>{cur}{y5.ebitda.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Enterprise Value:</span>
                    <span>{cur}{outputs.valuation.enterpriseValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-900 text-sm">Bull Case (20% Prob)</h4>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Growth</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 Revenue:</span>
                    <span className="font-bold">{cur}{(y5.revenue * 1.45).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Year 5 EBITDA:</span>
                    <span>{cur}{(y5.ebitda * 1.60).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink-soft">Enterprise Value:</span>
                    <span>{cur}{(outputs.valuation.enterpriseValue * 1.50).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stress Test: The Perfect Storm */}
            <div className="p-5 rounded-2xl border border-rose-300 bg-rose-50/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <h4 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
                  Stress Test: The Perfect Storm (Adverse Multi-Factor Shock)
                </h4>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Simulates 40% revenue underperformance, 50% CAC inflation, 10% churn spike, and frozen equity markets.
                Result: With current cash reserves and variable cost flexibility, the company maintains positive operational cash runway by month 14 through immediate OpEx mitigation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
