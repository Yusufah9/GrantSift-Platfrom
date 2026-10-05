"use client";

import { useState } from "react";
import { ProposalStudioService, type BudgetItem, type ApplicationQuestionItem, type ReadinessEvaluation } from "@/lib/services/proposal-studio-service";

const PROPOSAL_TYPES = [
  { id: "concept_note", label: "Concept Note (2-3 Pages)" },
  { id: "technical_proposal", label: "Technical Proposal" },
  { id: "grant_proposal", label: "Full Grant Application Proposal" },
  { id: "letter_of_inquiry", label: "Letter of Inquiry (LOI)" },
  { id: "business_proposal", label: "Commercial / Business Proposal" },
  { id: "financial_proposal", label: "Financial Proposal & Budget" },
  { id: "impact_proposal", label: "Impact & M&E Proposal" },
  { id: "theory_of_change", label: "Theory of Change & Results Framework" },
  { id: "sustainability_plan", label: "Post-Grant Sustainability Plan" },
  { id: "executive_summary", label: "Executive Summary" },
];

export function ProposalStudio({
  orgName = "Rumour Shield",
  country = "Nigeria",
  initialType = "concept_note",
}: {
  orgName?: string;
  country?: string;
  initialType?: string;
}) {
  const [activeTab, setActiveTab] = useState<"narrative" | "questions" | "budget" | "readiness" | "visuals">("narrative");
  const [proposalType, setProposalType] = useState(initialType);
  const [funderName, setFunderName] = useState("African Development Bank (AfDB)");
  const [funderCeiling, setFunderCeiling] = useState(250000);
  const [currency, setCurrency] = useState("USD");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Autosaved just now");

  // Narrative text
  const [title, setTitle] = useState(`Concept Note: ${orgName} for ${funderName}`);
  const [narrativeContent, setNarrativeContent] = useState(`## Concept Note: ${orgName}
**Applicant Organization:** ${orgName}  
**Jurisdiction:** ${country}  
**Target Program:** ${funderName}  
**Award Request:** $150,000 USD  

### 1. Executive Summary
${orgName} deploys an advanced multilingual artificial intelligence verification system across ${country} to counter civic misinformation, preserve democratic trust, and protect frontline communities. With a requested award of $150,000 USD, this 24-month project will expand local language analysis into Yoruba, Hausa, Igbo, and Nigerian Pidgin, validating direct impact with over 150,000 citizens.

### 2. Contextual Problem Analysis
Misinformation across mobile communication channels in ${country} poses direct threats to public health stability, financial integrity, and election peace. Over 70% of citizens report encountering synthetic audio and distorted video claims without access to verified fact-checking tools in their native dialects.

### 3. Phased Implementation Roadmap
- **Phase 1 (Months 1–6):** Dataset localization and fine-tuning for regional dialect nuance.
- **Phase 2 (Months 7–18):** Direct deployment with 20 community media partners and civic NGOs.
- **Phase 3 (Months 19–24):** Independent impact audit and transition to earned revenue through B2B API verification licenses.

### 4. Measurable Beneficiary Impact
- **Direct Beneficiaries:** 25,000 verified frontline community leaders and mobile fact-checkers trained.
- **Indirect Beneficiaries:** 1,200,000 citizens receiving validated claim warnings.
- **Gender Disaggregation:** 54% female civic volunteer ratio maintained across regional hubs.

### 5. Sustainability Plan
By Month 24, enterprise API subscription fees from media houses and financial institutions will cover 100% of server infrastructure and ongoing team operations.`);

  // Application Questions Form Builder
  const [questions, setQuestions] = useState<ApplicationQuestionItem[]>([
    {
      id: "q1",
      question: "Describe the specific community challenge and why current solutions are inadequate.",
      wordLimit: 250,
      isRequired: true,
      response: "Frontline African communities lack real-time verification tools in their native dialects. Existing fact-checking efforts remain centralized and English-only, allowing viral misinformation on WhatsApp to incite panic before refutations can be published.",
      status: "ready",
    },
    {
      id: "q2",
      question: "How will your project measure verifiable social and economic impact?",
      wordLimit: 300,
      isRequired: true,
      response: "We track verified claims resolved within 15 minutes, engagement metrics across 20 localized partner hubs, and pre-and-post intervention media literacy tests across 2,500 survey respondents.",
      status: "ready",
    },
    {
      id: "q3",
      question: "Explain your post-grant financial sustainability and commercial viability.",
      wordLimit: 200,
      isRequired: true,
      response: "Post-grant sustainability is anchored in B2B claim verification APIs for regional fintechs and newsrooms, transitioning our cost structure away from philanthropic dependency by Month 24.",
      status: "ready",
    },
  ]);

  // Budget Items
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: "b1", category: "personnel", description: "Lead AI Engineer & NLP Specialist (24 mos)", unitCost: 2000, quantity: 24, totalCost: 48000, currency: "USD" },
    { id: "b2", category: "personnel", description: "Community Verification Coordinator (24 mos)", unitCost: 1200, quantity: 24, totalCost: 28800, currency: "USD" },
    { id: "b3", category: "equipment", description: "Edge Inference Servers & Local Testing Hardware", unitCost: 3500, quantity: 4, totalCost: 14000, currency: "USD" },
    { id: "b4", category: "software", description: "Cloud Infrastructure, High-Memory GPU Compute & Storage", unitCost: 1000, quantity: 24, totalCost: 24000, currency: "USD" },
    { id: "b5", category: "operations", description: "Field Verification Pilot & Community Workshops in 4 States", unitCost: 4000, quantity: 4, totalCost: 16000, currency: "USD" },
    { id: "b6", category: "overhead", description: "Administrative, Auditing & Legal Compliance Overhead (10%)", unitCost: 13000, quantity: 1, totalCost: 13000, currency: "USD" },
  ]);

  const budgetTotal = budgetItems.reduce((acc, curr) => acc + curr.totalCost, 0);
  const readiness: ReadinessEvaluation = ProposalStudioService.evaluateReadiness(narrativeContent, budgetTotal, funderCeiling, questions);

  const wordCount = narrativeContent.trim().split(/\s+/).filter(Boolean).length;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_proposal",
          payload: {
            type: proposalType,
            orgName,
            country,
            industry: "Artificial Intelligence & Civic Tech",
            funderName,
            fundingAmount: budgetTotal,
            problemStatement: questions[0]?.response,
            solutionStatement: "Deploying high-impact multilingual AI claim verification directly to African mobile users.",
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.content) {
        setNarrativeContent(data.data.content);
        setTitle(data.data.title || title);
        setLastSaved(`Generated & saved at ${new Date().toLocaleTimeString()}`);
      }
    } catch {
      // Keep existing content
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddBudgetItem = () => {
    const newItem: BudgetItem = {
      id: "b-" + Date.now(),
      category: "operations",
      description: "New Operational Line Item",
      unitCost: 1000,
      quantity: 1,
      totalCost: 1000,
      currency,
    };
    setBudgetItems([...budgetItems, newItem]);
  };

  const handleRemoveBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stamp-tint text-stamp-dark text-xs font-bold">
              ✍️
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink">Proposal Studio</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              v1.0 Ready
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            16+ Funder-aligned proposal formats &bull; Multi-currency budget builder &bull; Application readiness scoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-faint font-mono">{lastSaved}</span>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-stamp-dark transition-all disabled:opacity-50 shadow-sm"
          >
            {isGenerating ? "Synthesizing Draft..." : "✨ AI Proposal Assistant"}
          </button>
        </div>
      </div>

      {/* Control Bar: Format & Funder Selection */}
      <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-paper-line bg-paper p-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">Proposal Format</label>
          <select
            value={proposalType}
            onChange={(e) => setProposalType(e.target.value)}
            className="w-full rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs font-semibold text-ink outline-none"
          >
            {PROPOSAL_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">Target Funder Program</label>
          <input
            type="text"
            value={funderName}
            onChange={(e) => setFunderName(e.target.value)}
            className="w-full rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs font-semibold text-ink outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-faint uppercase mb-1">Currency & Ceiling</label>
          <div className="flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-xl border border-paper-line bg-paper-raised px-2.5 py-2 text-xs font-semibold text-ink outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
            <input
              type="number"
              value={funderCeiling}
              onChange={(e) => setFunderCeiling(Number(e.target.value))}
              className="w-full rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs font-semibold text-ink outline-none"
              placeholder="Max award"
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-paper-line pb-2 text-xs font-semibold text-ink-soft overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("narrative")}
          className={`rounded-xl px-4 py-2 transition-colors ${
            activeTab === "narrative" ? "bg-ink text-paper" : "hover:bg-paper hover:text-ink"
          }`}
        >
          📄 Proposal Narrative ({wordCount} words)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`rounded-xl px-4 py-2 transition-colors ${
            activeTab === "questions" ? "bg-ink text-paper" : "hover:bg-paper hover:text-ink"
          }`}
        >
          📋 Application Form Builder ({questions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("budget")}
          className={`rounded-xl px-4 py-2 transition-colors ${
            activeTab === "budget" ? "bg-ink text-paper" : "hover:bg-paper hover:text-ink"
          }`}
        >
          💰 Multi-Currency Budget (${budgetTotal.toLocaleString()})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("readiness")}
          className={`rounded-xl px-4 py-2 transition-colors ${
            activeTab === "readiness" ? "bg-ink text-paper" : "hover:bg-paper hover:text-ink"
          }`}
        >
          🎯 Readiness Score ({readiness.overallScore}%)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("visuals")}
          className={`rounded-xl px-4 py-2 transition-colors ${
            activeTab === "visuals" ? "bg-ink text-paper" : "hover:bg-paper hover:text-ink"
          }`}
        >
          📊 Project Diagrams
        </button>
      </div>

      {/* TAB 1: NARRATIVE EDITOR */}
      {activeTab === "narrative" && (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-paper-line bg-paper px-4 py-2.5 font-serif text-lg font-bold text-ink outline-none"
          />

          <textarea
            rows={18}
            value={narrativeContent}
            onChange={(e) => {
              setNarrativeContent(e.target.value);
              setLastSaved(`Edited at ${new Date().toLocaleTimeString()}`);
            }}
            className="w-full rounded-2xl border border-paper-line bg-paper p-5 font-mono text-xs leading-relaxed text-ink outline-none focus:border-ink shadow-inner"
          />

          <div className="flex items-center justify-between text-xs text-ink-faint">
            <span>{wordCount} total words &bull; ~7 minute read</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(narrativeContent);
                  alert("Copied proposal draft to clipboard!");
                }}
                className="rounded-lg border border-paper-line bg-paper-raised px-3 py-1 font-semibold text-ink hover:bg-paper"
              >
                📋 Copy Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATION FORM BUILDER */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-ink">Funder Portal Application Questions</h3>
            <button
              type="button"
              onClick={() => {
                const newQ: ApplicationQuestionItem = {
                  id: "q-" + Date.now(),
                  question: "New Application Question",
                  wordLimit: 250,
                  isRequired: true,
                  response: "",
                  status: "unanswered",
                };
                setQuestions([...questions, newQ]);
              }}
              className="rounded-lg bg-ink px-3 py-1 text-xs font-bold text-paper"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const count = q.response.trim().split(/\s+/).filter(Boolean).length;
              return (
                <div key={q.id} className="rounded-2xl border border-paper-line bg-paper p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-ink">Question {idx + 1} {q.isRequired && <span className="text-rose-600">*</span>}</span>
                    <span className="text-ink-faint text-[11px]">
                      {count} / {q.wordLimit || 250} words
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx]!.question = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full font-semibold text-xs text-ink bg-transparent border-b border-paper-line pb-1 outline-none"
                  />
                  <textarea
                    rows={4}
                    value={q.response}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx]!.response = e.target.value;
                      setQuestions(updated);
                    }}
                    placeholder="Enter tailored answer..."
                    className="w-full rounded-xl border border-paper-line bg-paper-raised p-3 text-xs leading-relaxed text-ink outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-CURRENCY BUDGET BUILDER */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-ink">Project Line-Item Budget</h3>
              <p className="text-xs text-ink-faint">
                Total Allocated: <strong>${budgetTotal.toLocaleString()} USD</strong> (Ceiling: ${funderCeiling.toLocaleString()})
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddBudgetItem}
              className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-paper hover:bg-stamp-dark"
            >
              + Add Cost Line
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-paper-line bg-paper shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-paper-line bg-paper-raised text-[11px] font-bold text-ink-faint uppercase">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Unit Cost ($)</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Total ($)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-line text-ink">
                {budgetItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-paper-raised/40">
                    <td className="p-3">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          updated[idx]!.category = e.target.value as any;
                          setBudgetItems(updated);
                        }}
                        className="rounded-lg border border-paper-line bg-transparent p-1 text-xs outline-none"
                      >
                        <option value="personnel">Personnel</option>
                        <option value="equipment">Equipment</option>
                        <option value="software">Software / Cloud</option>
                        <option value="travel">Travel</option>
                        <option value="operations">Operations</option>
                        <option value="overhead">Overhead (10%)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          updated[idx]!.description = e.target.value;
                          setBudgetItems(updated);
                        }}
                        className="w-full rounded border border-paper-line bg-transparent px-2 py-1 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          const val = Number(e.target.value) || 0;
                          updated[idx]!.unitCost = val;
                          updated[idx]!.totalCost = val * updated[idx]!.quantity;
                          setBudgetItems(updated);
                        }}
                        className="w-24 rounded border border-paper-line bg-transparent px-2 py-1 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...budgetItems];
                          const val = Number(e.target.value) || 1;
                          updated[idx]!.quantity = val;
                          updated[idx]!.totalCost = updated[idx]!.unitCost * val;
                          setBudgetItems(updated);
                        }}
                        className="w-16 rounded border border-paper-line bg-transparent px-2 py-1 outline-none"
                      />
                    </td>
                    <td className="p-3 font-semibold text-ink">
                      ${item.totalCost.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveBudgetItem(item.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget Narrative Generator Preview */}
          <div className="rounded-2xl border border-paper-line bg-paper p-5 space-y-2">
            <h4 className="font-serif text-xs font-bold text-ink uppercase tracking-wider">
              Automated Budget Narrative Justification
            </h4>
            <pre className="font-mono text-xs whitespace-pre-wrap text-ink-soft leading-relaxed">
              {ProposalStudioService.generateBudgetNarrative(budgetItems, currency)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: READINESS SCORE & QUALITY CONTROL */}
      {activeTab === "readiness" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-paper-line bg-paper p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-ink-faint uppercase tracking-wider">Application Quality Control</span>
              <h2 className="font-serif text-2xl font-bold text-ink mt-0.5">Readiness Scorecard</h2>
              <p className="text-xs text-ink-soft mt-1">
                Audited against institutional scoring rubrics, allowable cost ceilings, and beneficiary metrics.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-stamp-dark">{readiness.overallScore}%</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                High Competitive Fit
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {readiness.checks.map((chk, i) => (
              <div key={i} className="rounded-xl border border-paper-line bg-paper p-4 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink">{chk.title}</span>
                  <span className={chk.passed ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                    {chk.score}%
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft">{chk.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECT VISUALS & DIAGRAMS */}
      {activeTab === "visuals" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-paper-line bg-paper p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-ink">Project Architecture &amp; Theory of Change</h3>
            <div className="rounded-xl border border-paper-line bg-paper-raised p-4 font-mono text-xs leading-relaxed text-ink space-y-4">
              <div className="border-l-4 border-amber-500 pl-3">
                <p className="font-bold text-amber-950">1. Inputs &amp; Resources</p>
                <p className="text-ink-soft">AI Language Models + Local Fact-Checking Network + AfDB Grant ($150,000)</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-bold text-blue-950">2. Activities &amp; Deployment</p>
                <p className="text-ink-soft">Fine-tuning NLP for Hausa, Yoruba, Igbo, Pidgin &bull; Integration into WhatsApp Bots &bull; Journalist Training</p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-3">
                <p className="font-bold text-emerald-950">3. Outputs &amp; Verification</p>
                <p className="text-ink-soft">150,000+ Active Users &bull; 25,000 Claims Processed &bull; 20 Community Media Partnerships</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <p className="font-bold text-purple-950">4. Long-Term Impact</p>
                <p className="text-ink-soft">Mitigated Electoral &amp; Health Panic &bull; Restored Digital Trust &bull; Sustainable Local Enterprise Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
