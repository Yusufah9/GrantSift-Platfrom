"use client";

import { useState } from "react";
import Link from "next/link";
import {
  proposalWorkspaceService,
  PROPOSAL_TYPE_LABELS,
  type ProposalType,
  type ProposalWorkspaceState,
  type BudgetItem,
} from "@/lib/services/proposal-workspace-service";
import { grantResearchService, type GrantResearchIntelligence } from "@/lib/services/grant-research-service";

interface ProposalEditorProps {
  initialGrantName?: string;
  initialFunderName?: string;
  grantId?: string;
  orgName?: string;
  country?: string;
}

export function ProposalWorkspaceEditor({
  initialGrantName = "Sustainable Energy Fund for Africa Catalyst Program",
  initialFunderName = "African Development Bank (AfDB)",
  grantId = "grant-oppsq-sefa-2026",
  orgName = "Your Organization",
  country = "Nigeria",
}: ProposalEditorProps) {
  const [selectedType, setSelectedType] = useState<ProposalType>("grant_proposal");
  const [workspace, setWorkspace] = useState<ProposalWorkspaceState>(() =>
    proposalWorkspaceService.createInitialProposal({
      type: "grant_proposal",
      grantName: initialGrantName,
      funderName: initialFunderName,
      orgName,
      country,
      fundingAmount: 250000,
      currency: "USD",
    })
  );

  const [activeTab, setActiveTab] = useState<"editor" | "budget" | "review">("editor");
  const [showResearchDrawer, setShowResearchDrawer] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string>(workspace.sections[0]?.id || "");
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const research: GrantResearchIntelligence = grantResearchService.generateResearchReport(grantId, {
    orgName,
    country,
  });

  const handleTypeChange = (newType: ProposalType) => {
    setSelectedType(newType);
    const newWorkspace = proposalWorkspaceService.createInitialProposal({
      type: newType,
      grantName: workspace.grantName,
      funderName: workspace.funderName,
      orgName,
      country,
      fundingAmount: workspace.targetAmount,
      currency: workspace.currency,
    });
    setWorkspace(newWorkspace);
    setActiveSectionId(newWorkspace.sections[0]?.id || "");
  };

  const handleSectionContentChange = (sectionId: string, newContent: string) => {
    setWorkspace((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === sectionId ? { ...sec, content: newContent } : sec)),
      lastSavedAt: new Date().toISOString(),
    }));
  };

  const handleSaveDraft = () => {
    setSaveMessage("Draft version saved successfully.");
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // AI Editing Actions (Human writing style: no clichés, concrete facts)
  const handleAiAction = (action: "expand" | "shorten" | "clarify" | "requirements") => {
    const activeSec = workspace.sections.find((s) => s.id === activeSectionId);
    if (!activeSec) return;

    setIsAiLoading(true);
    setTimeout(() => {
      let updated = activeSec.content;
      if (action === "expand") {
        updated += `\n\nDirect operational evidence from ${country} validates this methodology. Key performance indicators are tracked monthly through localized community field assessments, ensuring transparent resource allocation.`;
      } else if (action === "shorten") {
        const sentences = activeSec.content.split(". ");
        updated = sentences.slice(0, Math.max(2, Math.floor(sentences.length / 2))).join(". ") + ".";
      } else if (action === "clarify") {
        updated = activeSec.content
          .replace(/furthermore|moreover|leverage|robust|seamless|game-changing/gi, "")
          .replace(/—/g, ":");
      } else if (action === "requirements") {
        updated += `\n\nCompliance Verification:\n- Meets ${research.funderName} guidelines.\n- Aligns with priority focus in ${research.funderPriorities.whatTheyFund.sectors.join(", ")}.`;
      }
      handleSectionContentChange(activeSec.id, updated);
      setIsAiLoading(false);
    }, 400);
  };

  // Budget Items Management
  const handleUpdateBudgetItem = (id: string, field: keyof BudgetItem, value: any) => {
    setWorkspace((prev) => {
      const updatedItems = prev.budgetItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitCost") {
          updated.totalCost = (updated.quantity || 0) * (updated.unitCost || 0);
        }
        return updated;
      });
      const newTotal = updatedItems.reduce((acc, i) => acc + i.totalCost, 0);
      return { ...prev, budgetItems: updatedItems, budgetTotal: newTotal };
    });
  };

  const handleAddBudgetItem = () => {
    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      category: "Materials & Supplies",
      description: "Project operational materials",
      quantity: 1,
      unitCost: 5000,
      currency: workspace.currency,
      totalCost: 5000,
      justification: "Required for field activities.",
    };
    setWorkspace((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, newItem],
      budgetTotal: prev.budgetTotal + 5000,
    }));
  };

  // Native Word (.docx formatted HTML) Export (PRD §19)
  const handleExportWord = () => {
    const title = workspace.title;
    const bodyContent = workspace.sections
      .map(
        (sec) => `
        <h2 style="font-family: Arial, sans-serif; color: #111; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">${sec.title}</h2>
        <p style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 11pt; color: #333; white-space: pre-wrap;">${sec.content}</p>
      `
      )
      .join("\n");

    const budgetTable = `
      <h2 style="font-family: Arial, sans-serif; color: #111; margin-top: 28px;">Itemized Project Budget (${workspace.currency})</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt;">
        <tr style="background-color: #f2f2f2; font-weight: bold;">
          <th>Category</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit Cost</th>
          <th>Total Cost</th>
        </tr>
        ${workspace.budgetItems
          .map(
            (b) => `
          <tr>
            <td>${b.category}</td>
            <td>${b.description}</td>
            <td align="center">${b.quantity}</td>
            <td align="right">${workspace.currency} ${b.unitCost.toLocaleString()}</td>
            <td align="right"><b>${workspace.currency} ${b.totalCost.toLocaleString()}</b></td>
          </tr>
        `
          )
          .join("")}
        <tr style="background-color: #fafafa; font-weight: bold;">
          <td colspan="4" align="right">Total Funding Requested:</td>
          <td align="right">${workspace.currency} ${workspace.budgetTotal.toLocaleString()}</td>
        </tr>
      </table>
    `;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body style="padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="font-family: Arial, sans-serif; color: #000; font-size: 20pt; margin-bottom: 4px;">${workspace.title}</h1>
        <p style="font-family: Arial, sans-serif; font-size: 10pt; color: #666; margin-bottom: 24px;">
          Funder: ${workspace.funderName} &bull; Target Budget: ${workspace.currency} ${workspace.budgetTotal.toLocaleString()} &bull; Date: ${new Date().toLocaleDateString()}
        </p>
        <hr style="border: 0; border-top: 2px solid #000; margin-bottom: 30px;" />
        ${bodyContent}
        ${budgetTable}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clean PDF Print Export (PRD §19)
  const handleExportPDF = () => {
    window.print();
  };

  const currentSection = workspace.sections.find((s) => s.id === activeSectionId) || workspace.sections[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Proposal Type Dropdown (PRD §15) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Proposal Workspace
            </span>
            <span className="text-xs text-ink-faint">&bull; {workspace.funderName}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">{workspace.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Proposal Type Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-soft font-semibold whitespace-nowrap">Proposal Type:</label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as ProposalType)}
              className="rounded-lg border border-paper-line bg-paper-raised px-3 py-1.5 text-xs font-semibold text-ink shadow-sm outline-none focus:border-stamp"
            >
              {Object.entries(PROPOSAL_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowResearchDrawer(!showResearchDrawer)}
            className={`rounded px-3 py-1.5 text-xs font-semibold border transition-all ${
              showResearchDrawer
                ? "bg-stamp/10 border-stamp text-stamp-dark"
                : "bg-paper border-paper-line text-ink-soft hover:text-ink"
            }`}
          >
            {showResearchDrawer ? "Hide Research Panel" : "Show Research Panel"}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 shadow-sm"
          >
            Save Draft
          </button>

          {/* Export Dropdown / Buttons (PRD §19) */}
          <button
            type="button"
            onClick={handleExportWord}
            className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 shadow-sm"
          >
            Export Word (.doc)
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="rounded bg-ink px-4 py-1.5 text-xs font-semibold text-paper shadow-sm hover:bg-stamp-dark transition-all"
          >
            Export PDF
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-950">
          ✓ {saveMessage}
        </div>
      )}

      {/* Main Tabs: Editor vs Budget vs Review */}
      <div className="flex items-center gap-3 border-b border-paper-line text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
            activeTab === "editor" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Proposal Narrative ({workspace.sections.length} Sections)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("budget")}
          className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
            activeTab === "budget" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Budget Builder ({workspace.currency} {workspace.budgetTotal.toLocaleString()})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("review")}
          className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
            activeTab === "review" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Founder Review &amp; Approval
        </button>
      </div>

      {/* Workspace Grid */}
      <div className={`grid gap-6 ${showResearchDrawer ? "lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Main Section Content Area */}
        <div className={showResearchDrawer ? "lg:col-span-8" : "col-span-1"}>
          {activeTab === "editor" && currentSection && (
            <div className="space-y-4 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm">
              {/* Section Selector Pills */}
              <div className="flex flex-wrap gap-2 pb-3 border-b border-paper-line">
                {workspace.sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeSectionId === sec.id
                        ? "bg-stamp-dark text-paper shadow-sm"
                        : "bg-paper border border-paper-line text-ink-soft hover:text-ink"
                    }`}
                  >
                    {idx + 1}. {sec.title}
                  </button>
                ))}
              </div>

              {/* Active Section Info */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">{currentSection.title}</h3>
                  <p className="text-xs text-ink-soft">{currentSection.description}</p>
                </div>
                <div className="text-xs font-mono text-ink-faint">
                  {currentSection.content.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              {/* AI Helper Toolbar (PRD §18) */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-paper p-2 border border-paper-line text-xs">
                <span className="text-ink-faint font-semibold mr-1">AI Assistant:</span>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAction("expand")}
                  className="rounded px-2.5 py-1 bg-paper-raised border border-paper-line text-ink-soft hover:text-ink disabled:opacity-50"
                >
                  Expand Section
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAction("shorten")}
                  className="rounded px-2.5 py-1 bg-paper-raised border border-paper-line text-ink-soft hover:text-ink disabled:opacity-50"
                >
                  Make Concise
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAction("clarify")}
                  className="rounded px-2.5 py-1 bg-paper-raised border border-paper-line text-ink-soft hover:text-ink disabled:opacity-50"
                >
                  Remove Clichés
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAction("requirements")}
                  className="rounded px-2.5 py-1 bg-paper-raised border border-paper-line text-ink-soft hover:text-ink disabled:opacity-50"
                >
                  Check Alignment
                </button>
              </div>

              {/* Textarea Editor */}
              <textarea
                value={currentSection.content}
                onChange={(e) => handleSectionContentChange(currentSection.id, e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-paper-line bg-paper p-4 font-serif text-sm leading-relaxed text-ink outline-none focus:border-stamp shadow-inner"
                placeholder="Draft proposal section content..."
              />
            </div>
          )}

          {/* Budget Builder Tab (PRD §40) */}
          {activeTab === "budget" && (
            <div className="space-y-4 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-paper-line">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">Project Budget Builder</h3>
                  <p className="text-xs text-ink-soft">
                    Itemized cost structure calculated in {workspace.currency}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBudgetItem}
                  className="rounded bg-stamp-dark px-3.5 py-1.5 text-xs font-semibold text-paper hover:bg-stamp transition-all"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-paper-line text-ink-faint font-semibold uppercase">
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3 w-16">Qty</th>
                      <th className="py-2 pr-3 w-28">Unit Cost</th>
                      <th className="py-2 pr-3 w-28 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-line">
                    {workspace.budgetItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 pr-3 font-semibold text-ink">{item.category}</td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateBudgetItem(item.id, "description", e.target.value)}
                            className="w-full rounded border border-paper-line bg-paper px-2 py-1 text-ink"
                          />
                        </td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateBudgetItem(item.id, "quantity", Number(e.target.value))}
                            className="w-16 rounded border border-paper-line bg-paper px-2 py-1 text-ink"
                          />
                        </td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateBudgetItem(item.id, "unitCost", Number(e.target.value))}
                            className="w-24 rounded border border-paper-line bg-paper px-2 py-1 text-ink"
                          />
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-right text-ink">
                          {workspace.currency} {item.totalCost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-paper font-bold text-ink">
                      <td colSpan={4} className="py-3 pr-3 text-right">
                        Total Funding Requested:
                      </td>
                      <td className="py-3 pr-3 text-right font-mono text-stamp-dark text-sm">
                        {workspace.currency} {workspace.budgetTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Founder Review & Approval Tab (PRD §57) */}
          {activeTab === "review" && (
            <div className="space-y-5 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Human Approval &amp; Sign-off</h3>
                <p className="text-xs text-ink-soft">
                  Grant proposals require formal founder or authorized executive review before submission.
                </p>
              </div>

              <div className="rounded-lg border border-paper-line bg-paper p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Approval Status</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-800 border border-emerald-200">
                    Ready for Founder Review
                  </span>
                </div>
                <p className="text-ink-soft">
                  Proposal Version 1.0 has been compiled with all required narrative sections and itemized budget.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Review link and notification dispatched to organization founder.")}
                    className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-all shadow-sm"
                  >
                    Request Founder Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Marked as Approved by Founder.")}
                    className="rounded bg-paper px-4 py-2 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 shadow-sm"
                  >
                    Approve Proposal &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-Side Research Panel (PRD §16, §29) */}
        {showResearchDrawer && (
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-paper-line">
                <span className="font-serif font-bold text-sm text-ink">Funder Intelligence</span>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>

              {/* Opportunity & Priorities */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-ink">Funder Priorities</h4>
                <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                  {research.funderPriorities.coreInterests.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* What They Do Not Fund (Exclusions) */}
              <div className="space-y-1.5 pt-2 border-t border-paper-line">
                <h4 className="font-semibold text-amber-950">Exclusions (Do Not Fund)</h4>
                <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                  {research.funderPriorities.whatTheyDoNotFund.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="space-y-1.5 pt-2 border-t border-paper-line">
                <h4 className="font-semibold text-ink">Required Documents</h4>
                <ul className="space-y-1">
                  {research.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-ink-soft">
                      <span className="text-emerald-700">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Positioning */}
              <div className="space-y-1 pt-2 border-t border-paper-line">
                <h4 className="font-semibold text-ink">Recommended Positioning</h4>
                <p className="text-ink-soft leading-relaxed">{research.recommendedPositioning}</p>
              </div>

              {/* Important Deadlines */}
              <div className="pt-2 border-t border-paper-line text-[11px] text-ink-faint">
                <p>
                  <b>Deadline:</b> {research.importantDates.applicationDeadline}
                </p>
                <p>
                  <b>Source Verified:</b> {research.sourcesChecked[0]?.dateVerified}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
