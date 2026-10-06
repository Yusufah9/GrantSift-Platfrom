"use client";

import { useState } from "react";
import { BD_PROJECT_DEVT_SOP, SOP_COLORS, SopSheet, SopBlock } from "@/lib/sop-workbook/bd-sop-data";
import { generateSopColabPythonScript } from "@/lib/sop-workbook/workbook-export";

export function SopWorkbookViewer() {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  const activeSheet: SopSheet = BD_PROJECT_DEVT_SOP.sheets[activeSheetIndex] || BD_PROJECT_DEVT_SOP.sheets[0]!;

  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      const response = await fetch("/api/export/sop-excel");
      if (!response.ok) throw new Error("Failed to export Excel");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BD_Project_Devt_Unit_SOP.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Unable to generate Excel file right now. Please try again.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const pythonScript = generateSopColabPythonScript(BD_PROJECT_DEVT_SOP);

  const handleCopyPython = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2500);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([pythonScript], { type: "text/x-python" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bd_project_devt_sop_colab.py";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div
        className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${SOP_COLORS.primary} 0%, #6E0B60 60%, ${SOP_COLORS.dark} 100%)`,
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Standard Operating Procedure (SOP) Workbook
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {BD_PROJECT_DEVT_SOP.unit}
          </h1>
          <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">
            {BD_PROJECT_DEVT_SOP.organization} &bull; Operational standard modeled after the corporate
            institutional Excel framework with color hierarchy #980F84. Covers opportunity discovery,
            donor consortiums, rigorous drafting, multi-tier approvals (Dr. Seun &amp; Mr. Damilola),
            and continuity planning.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#980F84] shadow-md hover:bg-pink-50 transition-all active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExportingExcel ? "Generating Workbook..." : "Download Excel Workbook (.xlsx)"}
            </button>

            <button
              onClick={() => setShowPythonModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4 text-pink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Export Google Colab Script (.py)
            </button>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-pink-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* 9-Section Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {BD_PROJECT_DEVT_SOP.sheets.map((sheet, idx) => {
          const isActive = idx === activeSheetIndex;
          return (
            <button
              key={sheet.id}
              onClick={() => setActiveSheetIndex(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? "bg-[#980F84] text-white border-[#980F84] shadow-sm"
                  : "bg-white text-ink-soft border-ink/10 hover:border-ink/20 hover:text-ink"
              }`}
            >
              {sheet.tab}
            </button>
          );
        })}
      </div>

      {/* Main Sheet Content Area */}
      <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-ink/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#980F84] font-bold">
              Tab {activeSheet.number} of {BD_PROJECT_DEVT_SOP.sheets.length}
            </span>
            <h2 className="text-2xl font-bold text-ink mt-1">{activeSheet.title}</h2>
          </div>
          <span className="text-xs text-ink-faint hidden sm:inline font-mono">
            Workbook Owner: {BD_PROJECT_DEVT_SOP.owner}
          </span>
        </div>

        {/* Dynamic Blocks Rendering */}
        <div className="space-y-6">
          {activeSheet.blocks.map((block: SopBlock, bIdx) => (
            <div key={bIdx} className="space-y-3">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#980F84]" />
                {block.title}
              </h3>

              {/* Text Block */}
              {block.kind === "text" && (
                <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/40 text-xs text-ink leading-relaxed font-medium">
                  {block.body}
                </div>
              )}

              {/* List Block */}
              {block.kind === "list" && (
                <div className="p-4 rounded-xl border border-ink/10 bg-paper space-y-1.5">
                  <ul className="space-y-1.5 text-xs text-ink list-disc list-inside">
                    {block.items.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fields Block (Key-Value) */}
              {block.kind === "fields" && (
                <div className="overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-ink/10 bg-white">
                      {block.rows.map(([label, val], rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-pink-50/30" : "bg-white"}>
                          <td className="p-3 font-bold text-ink w-1/3 whitespace-nowrap">{label}</td>
                          <td className="p-3 text-ink-soft font-medium">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Block */}
              {block.kind === "table" && (
                <div className="overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#980F84] text-white">
                      <tr>
                        {block.columns.map((col, cIdx) => (
                          <th key={cIdx} className="p-3 font-semibold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10 bg-white">
                      {block.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-pink-50/30" : "bg-white hover:bg-pink-50/20"}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-ink leading-relaxed align-top">
                              {cIdx === 0 ? <strong className="text-ink">{cell}</strong> : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Google Colab Python Script Modal */}
      {showPythonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-ink">Google Colab Python Generator</h3>
                <p className="text-xs text-ink-soft">
                  Uses pandas and openpyxl with cell styles and #980F84 color scheme.
                </p>
              </div>
              <button
                onClick={() => setShowPythonModal(false)}
                className="text-ink-soft hover:text-ink text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <pre className="flex-1 overflow-auto bg-ink text-pink-100 p-4 rounded-xl text-xs font-mono leading-relaxed max-h-[50vh]">
              {pythonScript}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-ink-soft">
                Paste directly into Google Colab notebook cell to generate Excel.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPython}
                  className="rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold text-ink hover:bg-paper"
                >
                  {copiedPython ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={handleDownloadPython}
                  className="rounded-xl bg-[#980F84] px-4 py-2 text-xs font-bold text-white hover:bg-[#7E0C6D]"
                >
                  Download .py Script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
