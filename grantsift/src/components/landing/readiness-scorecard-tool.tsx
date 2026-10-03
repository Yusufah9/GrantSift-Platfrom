"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  calculateReadinessScore,
  type ScorecardInput,
  type ScorecardResult,
} from "@/lib/services/scorecard-service";
import { buildScorecardWorkbook } from "@/lib/excel/scorecard-export";

interface ReadinessScorecardToolProps {
  isAuthenticated?: boolean;
}

export function ReadinessScorecardTool({ isAuthenticated = false }: ReadinessScorecardToolProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<ScorecardInput>({
    orgName: "",
    orgType: "Startup",
    industry: "Clean Tech & Climate",
    country: "United States",
    city: "",
    stage: "Seed",
    yearFounded: 2022,
    teamSize: 4,
    revenue: 50000,
    fundingRaised: 25000,
    problemStatement: "",
    targetBeneficiaries: "",
    impactMetrics: "",
    hasIncorporation: true,
    hasTaxId: true,
    hasAuditedFinancials: false,
    hasPitchDeck: true,
    hasBusinessPlan: false,
    hasLettersOfSupport: false,
  });

  const [result, setResult] = useState<ScorecardResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadType, setDownloadType] = useState<"excel" | "pdf">("excel");

  const handleInputChange = (field: keyof ScorecardInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orgName.trim()) {
      alert("Please enter your organization or business name.");
      return;
    }
    startTransition(() => {
      const calculated = calculateReadinessScore(formData);
      setResult(calculated);
    });
  };

  const handleExportClick = (type: "excel" | "pdf") => {
    setDownloadType(type);
    if (!isAuthenticated) {
      // Save pending scorecard state to sessionStorage
      try {
        sessionStorage.setItem("grantsift_scorecard_pending", JSON.stringify({ formData, result }));
      } catch {}
      setShowAuthModal(true);
      return;
    }

    // Authenticated user downloads directly
    if (type === "excel" && result) {
      const bytes = buildScorecardWorkbook(formData, result);
      const blob = new Blob([bytes as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.orgName.replace(/\s+/g, "_")}_Grant_Readiness_Scorecard.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Print/PDF trigger
      window.print();
    }
  };

  const proceedToSignUp = () => {
    setShowAuthModal(false);
    router.push(`/signup?redirect=scorecard&action=download&org=${encodeURIComponent(formData.orgName)}`);
  };

  return (
    <section id="readiness-scorecard" className="landing-container py-16">
      <div className="clay-card overflow-hidden border border-paper-line bg-paper-raised/90 p-6 md:p-10">
        <div className="max-w-3xl">
          <span className="stamp-badge border-ink/20 text-ink-faint">Interactive Diagnostic</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Grant Readiness Scorecard
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            Benchmark your business across the 6 core pillars evaluated by institutional grantmakers:
            legal standing, financial readiness, team capacity, impact metrics, and data room completeness.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Form Side */}
          <form onSubmit={handleCalculate} className="space-y-6 lg:col-span-7">
            <div className="rounded-xl border border-paper-line bg-paper/60 p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-ink">1. Organization Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orgName}
                    onChange={(e) => handleInputChange("orgName", e.target.value)}
                    placeholder="e.g. TerraRenew Technologies"
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Entity Type
                  </label>
                  <select
                    value={formData.orgType}
                    onChange={(e) => handleInputChange("orgType", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="Startup">For-Profit Startup</option>
                    <option value="SME">SME / Small Business</option>
                    <option value="NGO">NGO / Non-Profit</option>
                    <option value="Social Enterprise">Social Enterprise</option>
                    <option value="Researcher">Academic / Researcher</option>
                    <option value="Corporate">Corporate / Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Sector / Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="Clean Tech & Climate">Clean Tech & Climate</option>
                    <option value="Agriculture & Food Security">Agriculture & Food Security</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Education & Workforce (EdTech)">Education & Workforce</option>
                    <option value="Financial Inclusion & FinTech">Financial Inclusion</option>
                    <option value="AI & Digital Infrastructure">AI & Digital Infrastructure</option>
                    <option value="Community & Humanitarian Aid">Community & Humanitarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Country / Geography
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="e.g. Kenya, UK, United States"
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-paper-line bg-paper/60 p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-ink">2. Traction & Team</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => handleInputChange("stage", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="Idea / Pre-seed">Idea / Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Early Revenue / Growth">Early Revenue / Growth</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange("teamSize", parseInt(e.target.value) || 1)}
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Annual Rev ($USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange("revenue", parseFloat(e.target.value) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-paper-line bg-paper/60 p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-ink">3. Governance & Data Room Checklist</h3>
              <p className="text-xs text-ink-faint">Select all documents currently available:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasIncorporation}
                    onChange={(e) => handleInputChange("hasIncorporation", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Certificate of Incorporation
                </label>

                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasTaxId}
                    onChange={(e) => handleInputChange("hasTaxId", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Official Tax ID / Compliance
                </label>

                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasAuditedFinancials}
                    onChange={(e) => handleInputChange("hasAuditedFinancials", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Audited Financial Statements
                </label>

                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPitchDeck}
                    onChange={(e) => handleInputChange("hasPitchDeck", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Funder Pitch Deck
                </label>

                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBusinessPlan}
                    onChange={(e) => handleInputChange("hasBusinessPlan", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Structured Business Plan
                </label>

                <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasLettersOfSupport}
                    onChange={(e) => handleInputChange("hasLettersOfSupport", e.target.checked)}
                    className="h-4 w-4 rounded border-paper-line text-ink"
                  />
                  Letters of Support / MoUs
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-ink w-full py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isPending ? "Calculating Readiness…" : "Calculate Grant Readiness Scorecard →"}
            </button>
          </form>

          {/* Results Side */}
          <div className="lg:col-span-5">
            {result ? (
              <div className="sticky top-6 rounded-2xl border border-paper-line bg-paper p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-paper-line pb-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                      Readiness Rating
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-ink">{formData.orgName}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl font-black text-ink">{result.overallScore}</span>
                    <span className="text-sm font-semibold text-ink-faint">/100</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Dimension Scores
                  </div>

                  {[
                    { label: "Master Profile", score: result.categoryScores.orgProfile },
                    { label: "Legal Standing", score: result.categoryScores.legalDocumentation },
                    { label: "Financial Books", score: result.categoryScores.financialReadiness },
                    { label: "Impact & SDGs", score: result.categoryScores.impactDocumentation },
                    { label: "Team & Capacity", score: result.categoryScores.teamInformation },
                    { label: "Data Room Evidence", score: result.categoryScores.dataRoomReadiness },
                  ].map((dim) => (
                    <div key={dim.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-ink">
                        <span>{dim.label}</span>
                        <span>{dim.score}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-line">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dim.score >= 80 ? "bg-ledger" : dim.score >= 60 ? "bg-ink" : "bg-signal-risk"
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {result.gaps.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-1.5">
                    <p className="font-semibold text-amber-900">Priority Grant Gaps:</p>
                    <ul className="list-disc pl-4 space-y-1 text-amber-800">
                      {result.gaps.slice(0, 3).map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Download / Export CTA Buttons */}
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleExportClick("excel")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/20 bg-paper-raised px-4 py-3 text-xs font-semibold text-ink hover:bg-paper transition-all"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Export Excel (.xlsx)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportClick("pdf")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Download PDF
                    </button>
                  </div>

                  {!isAuthenticated && (
                    <p className="text-center text-[11px] text-ink-faint">
                      Sign in or create an account to download your official report &amp; unlock your permanent Grant OS workspace.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-paper-line bg-paper/40 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-paper-raised flex items-center justify-center text-2xl shadow-sm">
                  📊
                </div>
                <h4 className="mt-4 font-serif text-lg font-semibold text-ink">Ready to Assess</h4>
                <p className="mt-1 max-w-xs text-xs text-ink-soft">
                  Fill in your organization details and checklist to generate your institutional grant readiness scorecard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Creation Modal for Unauthenticated Users */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stamp-tint text-stamp-dark text-lg">
                🔒
              </span>
              <div>
                <h3 className="font-serif text-xl font-bold text-ink">Unlock Your Full Report</h3>
                <p className="text-xs text-ink-soft">Save your scorecard &amp; download in {downloadType.toUpperCase()}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-soft leading-relaxed">
              To download your official <strong>Grant Readiness Scorecard</strong> in Excel (.xlsx) or PDF,
              and to save your organization&apos;s master profile, document data room, and grant pipeline,
              please open your free Grant OS account.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={proceedToSignUp}
                className="btn-ink w-full py-3 text-sm font-semibold shadow-md"
              >
                Create Free Account &amp; Download Report →
              </button>
              <button
                type="button"
                onClick={() => router.push(`/login?redirect=scorecard&action=download`)}
                className="w-full rounded-full border border-paper-line py-2.5 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-paper transition-all"
              >
                Already have an account? Log in
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-center text-xs text-ink-faint hover:text-ink pt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
