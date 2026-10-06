"use client";

import { useState, useEffect } from "react";
import {
  BD_PROJECT_DEVT_SOP,
  SOP_COLORS,
  SopSheet,
  SopBlock,
  SopWorkbook,
  SopTextBlock,
  SopListBlock,
  SopTableBlock,
  SopFieldsBlock,
} from "@/lib/sop-workbook/bd-sop-data";
import { generateSopColabPythonScript } from "@/lib/sop-workbook/workbook-export";

const SOP_STORAGE_KEY = "grantsift_custom_sop_workbook";

export function SopWorkbookViewer() {
  const [workbook, setWorkbook] = useState<SopWorkbook>(BD_PROJECT_DEVT_SOP);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SOP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
          setWorkbook(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved SOP from storage:", e);
    }
  }, []);

  const activeSheet: SopSheet =
    workbook.sheets[activeSheetIndex] || workbook.sheets[0] || BD_PROJECT_DEVT_SOP.sheets[0]!;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSop = () => {
    try {
      localStorage.setItem(SOP_STORAGE_KEY, JSON.stringify(workbook));
      setIsEditing(false);
      showToast("SOP changes saved successfully to your workspace.");
    } catch (e) {
      console.error("Failed to save SOP:", e);
      alert("Error saving SOP changes to browser storage.");
    }
  };

  const handleResetSop = () => {
    if (confirm("Reset SOP to default institutional standard? Any custom edits will be discarded.")) {
      try {
        localStorage.removeItem(SOP_STORAGE_KEY);
      } catch {}
      setWorkbook(JSON.parse(JSON.stringify(BD_PROJECT_DEVT_SOP)));
      setIsEditing(false);
      showToast("SOP restored to default institutional standard.");
    }
  };

  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      const response = await fetch("/api/export/sop-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbook, format: "excel" }),
      });
      if (!response.ok) throw new Error("Failed to export Excel");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(workbook.unit || "SOP_Workbook").replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Excel workbook downloaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to generate Excel file right now. Please try again.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const pythonScript = generateSopColabPythonScript(workbook);

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
    a.download = `${(workbook.unit || "sop_workbook").toLowerCase().replace(/\s+/g, "_")}_colab.py`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Updaters for Editing Mode
  const updateWorkbookMeta = (field: keyof Omit<SopWorkbook, "sheets">, value: string) => {
    setWorkbook((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSheetTitle = (sheetIdx: number, newTitle: string) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      if (copy.sheets[sheetIdx]) {
        copy.sheets[sheetIdx]!.title = newTitle;
      }
      return copy;
    });
  };

  const updateBlockTitle = (sheetIdx: number, blockIdx: number, newTitle: string) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      if (copy.sheets[sheetIdx]?.blocks[blockIdx]) {
        copy.sheets[sheetIdx]!.blocks[blockIdx]!.title = newTitle;
      }
      return copy;
    });
  };

  const updateTextBlock = (sheetIdx: number, blockIdx: number, newBody: string) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "text") {
        (b as SopTextBlock).body = newBody;
      }
      return copy;
    });
  };

  const updateListItem = (sheetIdx: number, blockIdx: number, itemIdx: number, newVal: string) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "list") {
        (b as SopListBlock).items[itemIdx] = newVal;
      }
      return copy;
    });
  };

  const addListItem = (sheetIdx: number, blockIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "list") {
        (b as SopListBlock).items.push("New item description");
      }
      return copy;
    });
  };

  const deleteListItem = (sheetIdx: number, blockIdx: number, itemIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "list") {
        (b as SopListBlock).items.splice(itemIdx, 1);
      }
      return copy;
    });
  };

  const updateFieldRow = (
    sheetIdx: number,
    blockIdx: number,
    rowIdx: number,
    fieldPos: 0 | 1,
    newVal: string
  ) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "fields") {
        const row = (b as SopFieldsBlock).rows[rowIdx];
        if (row) row[fieldPos] = newVal;
      }
      return copy;
    });
  };

  const addFieldRow = (sheetIdx: number, blockIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "fields") {
        (b as SopFieldsBlock).rows.push(["New Label", "New Value"]);
      }
      return copy;
    });
  };

  const deleteFieldRow = (sheetIdx: number, blockIdx: number, rowIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "fields") {
        (b as SopFieldsBlock).rows.splice(rowIdx, 1);
      }
      return copy;
    });
  };

  const updateTableCell = (
    sheetIdx: number,
    blockIdx: number,
    rowIdx: number,
    colIdx: number,
    newVal: string
  ) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "table") {
        const row = (b as SopTableBlock).rows[rowIdx];
        if (row) row[colIdx] = newVal;
      }
      return copy;
    });
  };

  const updateTableColName = (sheetIdx: number, blockIdx: number, colIdx: number, newVal: string) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "table") {
        (b as SopTableBlock).columns[colIdx] = newVal;
      }
      return copy;
    });
  };

  const addTableRow = (sheetIdx: number, blockIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "table") {
        const cols = (b as SopTableBlock).columns.length;
        (b as SopTableBlock).rows.push(Array(cols).fill("New entry"));
      }
      return copy;
    });
  };

  const deleteTableRow = (sheetIdx: number, blockIdx: number, rowIdx: number) => {
    setWorkbook((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as SopWorkbook;
      const b = copy.sheets[sheetIdx]?.blocks[blockIdx];
      if (b && b.kind === "table") {
        (b as SopTableBlock).rows.splice(rowIdx, 1);
      }
      return copy;
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center justify-between shadow-sm animate-fade-in">
          <span>✓ {toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-800 hover:text-emerald-950 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${SOP_COLORS.primary} 0%, #6E0B60 60%, ${SOP_COLORS.dark} 100%)`,
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Standard Operating Procedure (SOP) Workbook &bull; Role-Based Governance
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveSop}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetSop}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-all"
                  >
                    ↺ Reset Default
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all active:scale-95"
                >
                  ✏️ Edit SOP in Platform
                </button>
              )}
            </div>
          </div>

          {/* Unit / Title Row */}
          {isEditing ? (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-pink-200 uppercase block mb-1">
                    Unit / Department Title
                  </label>
                  <input
                    type="text"
                    value={workbook.unit}
                    onChange={(e) => updateWorkbookMeta("unit", e.target.value)}
                    className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-pink-200 uppercase block mb-1">
                    Organization / Entity Name
                  </label>
                  <input
                    type="text"
                    value={workbook.organization}
                    onChange={(e) => updateWorkbookMeta("organization", e.target.value)}
                    className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-pink-200 uppercase block mb-1">
                    SOP Owner (Role / Position)
                  </label>
                  <input
                    type="text"
                    value={workbook.owner}
                    onChange={(e) => updateWorkbookMeta("owner", e.target.value)}
                    className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] font-mono text-pink-200 uppercase block mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={workbook.version}
                      onChange={(e) => updateWorkbookMeta("version", e.target.value)}
                      className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-mono text-pink-200 uppercase block mb-1">
                      Last Reviewed
                    </label>
                    <input
                      type="text"
                      value={workbook.lastReviewed}
                      onChange={(e) => updateWorkbookMeta("lastReviewed", e.target.value)}
                      className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {workbook.unit}
              </h1>
              <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">
                {workbook.organization} &bull; Operational framework modeled after institutional corporate
                Excel standards with color hierarchy #980F84. Covers opportunity discovery, donor consortiums,
                rigorous drafting, multi-tier approvals (Lead Grant Writer, BD Supervisor, Executive Director),
                and continuity planning.
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#980F84] shadow-md hover:bg-pink-50 transition-all active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {isExportingExcel ? "Generating Workbook..." : "Download Excel Workbook (.xlsx)"}
            </button>

            <button
              onClick={() => setShowPythonModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4 text-pink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Export Google Colab Script (.py)
            </button>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-pink-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* 9-Section Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {workbook.sheets.map((sheet, idx) => {
          const isActive = idx === activeSheetIndex;
          return (
            <button
              key={sheet.id || idx}
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
        <div className="border-b border-ink/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#980F84] font-bold">
              Tab {activeSheet.number} of {workbook.sheets.length}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={activeSheet.title}
                onChange={(e) => updateSheetTitle(activeSheetIndex, e.target.value)}
                className="w-full text-2xl font-bold text-ink mt-1 border-b border-[#980F84] focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-ink mt-1">{activeSheet.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint font-mono">
              Role Owner: <strong>{workbook.owner}</strong>
            </span>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#980F84] hover:underline"
              >
                Edit Section
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Blocks Rendering */}
        <div className="space-y-6">
          {activeSheet.blocks.map((block: SopBlock, bIdx) => (
            <div key={bIdx} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#980F84]" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => updateBlockTitle(activeSheetIndex, bIdx, e.target.value)}
                      className="border-b border-ink/20 font-bold text-sm text-ink px-1 focus:outline-none"
                    />
                  ) : (
                    block.title
                  )}
                </h3>
              </div>

              {/* Text Block */}
              {block.kind === "text" && (
                <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-4 text-xs text-ink leading-relaxed font-medium">
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={block.body}
                      onChange={(e) => updateTextBlock(activeSheetIndex, bIdx, e.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#980F84]"
                    />
                  ) : (
                    block.body
                  )}
                </div>
              )}

              {/* List Block */}
              {block.kind === "list" && (
                <div className="rounded-xl border border-ink/10 bg-paper p-4 space-y-2">
                  <ul className="space-y-2 text-xs text-ink">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#980F84] font-bold mt-0.5">•</span>
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                updateListItem(activeSheetIndex, bIdx, i, e.target.value)
                              }
                              className="flex-1 rounded border border-ink/20 px-2.5 py-1 text-xs text-ink bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => deleteListItem(activeSheetIndex, bIdx, i)}
                              className="text-rose-600 hover:text-rose-800 text-xs px-1 font-bold"
                              title="Delete Item"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="leading-relaxed flex-1">{item}</span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {isEditing && (
                    <div className="pt-2 border-t border-ink/10">
                      <button
                        type="button"
                        onClick={() => addListItem(activeSheetIndex, bIdx)}
                        className="text-xs font-bold text-[#980F84] hover:underline"
                      >
                        + Add List Item
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Fields Block (Key-Value) */}
              {block.kind === "fields" && (
                <div className="overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-ink/10 bg-white">
                      {block.rows.map(([label, val], rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-pink-50/30" : "bg-white"}>
                          <td className="p-3 font-bold text-ink w-1/3 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={label}
                                onChange={(e) =>
                                  updateFieldRow(activeSheetIndex, bIdx, rIdx, 0, e.target.value)
                                }
                                className="w-full rounded border border-ink/20 px-2 py-1 text-xs font-bold bg-white"
                              />
                            ) : (
                              label
                            )}
                          </td>
                          <td className="p-3 text-ink-soft font-medium">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) =>
                                    updateFieldRow(activeSheetIndex, bIdx, rIdx, 1, e.target.value)
                                  }
                                  className="flex-1 rounded border border-ink/20 px-2 py-1 text-xs bg-white text-ink"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteFieldRow(activeSheetIndex, bIdx, rIdx)}
                                  className="text-rose-600 hover:text-rose-800 text-xs px-1 font-bold"
                                  title="Delete Field"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              val
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isEditing && (
                    <div className="p-3 bg-paper border-t border-ink/10">
                      <button
                        type="button"
                        onClick={() => addFieldRow(activeSheetIndex, bIdx)}
                        className="text-xs font-bold text-[#980F84] hover:underline"
                      >
                        + Add Field Row
                      </button>
                    </div>
                  )}
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
                            {isEditing ? (
                              <input
                                type="text"
                                value={col}
                                onChange={(e) =>
                                  updateTableColName(activeSheetIndex, bIdx, cIdx, e.target.value)
                                }
                                className="rounded bg-white/20 border border-white/30 px-2 py-0.5 text-white font-semibold text-xs"
                              />
                            ) : (
                              col
                            )}
                          </th>
                        ))}
                        {isEditing && <th className="p-3 w-10 text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10 bg-white">
                      {block.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 1 ? "bg-pink-50/30" : "bg-white hover:bg-pink-50/20"}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-ink leading-relaxed align-top">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell(
                                      activeSheetIndex,
                                      bIdx,
                                      rIdx,
                                      cIdx,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded border border-ink/20 px-2 py-1 text-xs text-ink bg-white"
                                />
                              ) : cIdx === 0 ? (
                                <strong className="text-ink">{cell}</strong>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                          {isEditing && (
                            <td className="p-3 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => deleteTableRow(activeSheetIndex, bIdx, rIdx)}
                                className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                                title="Delete Row"
                              >
                                ✕
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isEditing && (
                    <div className="p-3 bg-paper border-t border-ink/10">
                      <button
                        type="button"
                        onClick={() => addTableRow(activeSheetIndex, bIdx)}
                        className="text-xs font-bold text-[#980F84] hover:underline"
                      >
                        + Add Table Row
                      </button>
                    </div>
                  )}
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
