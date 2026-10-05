"use client";

import { useEffect, useState } from "react";
import type { GrantOpportunity } from "@/lib/types/grant-discovery";
import {
  grantResearchService,
  type GrantResearchIntelligence,
} from "@/lib/services/grant-research-service";

interface GrantIntelligenceModalProps {
  grant: GrantOpportunity | null;
  orgContext?: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
  onSelectForProposal?: (grant: GrantOpportunity, proposalType: string) => void;
}

export function GrantIntelligenceModal({
  grant,
  orgContext,
  isOpen,
  onClose,
  onSelectForProposal,
}: GrantIntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "match" | "checklist" | "winners" | "proposals">("overview");
  const [intelligence, setIntelligence] = useState<GrantResearchIntelligence | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (grant && isOpen) {
      setLoading(true);
      try {
        const res = grantResearchService.generateResearchReport(grant.id, orgContext);
        setIntelligence(res);
      } catch (err) {
        console.error("Failed to load grant intelligence:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [grant, isOpen, orgContext]);

  if (!isOpen || !grant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-paper-line bg-paper shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-paper-line bg-paper-raised/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stamp-tint text-stamp-dark text-base font-serif">
              ✦
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-stamp-dark">
                  Grant Intelligence Dossier
                </span>
                <span className="text-[10px] text-ink-faint font-mono">
                  &bull; Verified ID: {grant.id}
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-ink truncate max-w-xl">
                {grant.grantName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-soft hover:bg-paper-line hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-paper-line bg-paper-raised/30 px-6 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 transition-all border-b-2 ${
              activeTab === "overview"
                ? "border-stamp-dark text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            1. Grant Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("match")}
            className={`pb-3 px-3 transition-all border-b-2 ${
              activeTab === "match"
                ? "border-stamp-dark text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            2. Why You Match &amp; Gaps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={`pb-3 px-3 transition-all border-b-2 ${
              activeTab === "checklist"
                ? "border-stamp-dark text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            3. What You Need (Checklist)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("winners")}
            className={`pb-3 px-3 transition-all border-b-2 ${
              activeTab === "winners"
                ? "border-stamp-dark text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            4. Previous Winners &amp; Patterns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("proposals")}
            className={`pb-3 px-3 transition-all border-b-2 ${
              activeTab === "proposals"
                ? "border-stamp-dark text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            5. Proposal Intelligence
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-stamp-dark border-t-transparent" />
              <p className="text-xs text-ink-soft">Synthesizing deep funder research and previous winners patterns...</p>
            </div>
          ) : intelligence ? (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-paper-line bg-paper-raised/40 p-4">
                      <span className="text-[10px] uppercase font-mono text-ink-faint block">Funder</span>
                      <p className="text-sm font-bold text-ink mt-0.5">{grant.funderName}</p>
                      <span className="text-xs text-ink-soft">{grant.funderType}</span>
                    </div>
                    <div className="rounded-xl border border-paper-line bg-paper-raised/40 p-4">
                      <span className="text-[10px] uppercase font-mono text-ink-faint block">Maximum Award</span>
                      <p className="text-sm font-bold text-ink mt-0.5">
                        {grant.funding.maximumAward
                          ? `${grant.funding.currency} ${grant.funding.maximumAward.toLocaleString()}`
                          : "Subject to Proposal"}
                      </p>
                      <span className="text-xs text-emerald-800 font-semibold">Non-dilutive Grant</span>
                    </div>
                    <div className="rounded-xl border border-paper-line bg-paper-raised/40 p-4">
                      <span className="text-[10px] uppercase font-mono text-ink-faint block">Application Deadline</span>
                      <p className="text-sm font-bold text-ink mt-0.5">{grant.deadline}</p>
                      <span className="text-xs text-ink-soft">
                        {grant.deadlineType === "rolling" ? "Rolling review cycles" : "Fixed deadline"}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Scope */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase font-semibold text-ink-faint">Opportunity Scope</h4>
                    <p className="text-sm text-ink leading-relaxed bg-paper-raised/20 p-4 rounded-xl border border-paper-line">
                      {grant.description}
                    </p>
                  </div>

                  {/* Source Chain Verification (Specification §5, §6) */}
                  <div className="rounded-xl border border-paper-line bg-paper-raised/40 p-5 space-y-3">
                    <h4 className="text-xs font-mono uppercase font-semibold text-ink-faint">
                      Verified Online Source Chain
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded bg-paper border border-paper-line">
                        <span className="text-ink-soft font-mono">Discovery Source:</span>
                        <a
                          href={grant.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-stamp-dark hover:underline flex items-center gap-1"
                        >
                          <span>{grant.originalUrl}</span>
                          <span>↗</span>
                        </a>
                      </div>
                      {grant.funderUrl && (
                        <div className="flex items-center justify-between p-2.5 rounded bg-paper border border-paper-line">
                          <span className="text-ink-soft font-mono">Official Funder Home:</span>
                          <a
                            href={grant.funderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-stamp-dark hover:underline flex items-center gap-1"
                          >
                            <span>{grant.funderUrl}</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-2.5 rounded bg-paper border border-paper-line">
                        <span className="text-ink-soft font-mono">Direct Application Portal:</span>
                        <a
                          href={grant.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>{grant.applicationUrl}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHY YOU MATCH & GAPS */}
              {activeTab === "match" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-base">
                      <span>✨</span>
                      <span>Why You Qualify</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {intelligence.whyYouMatch}
                    </p>
                    <ul className="list-disc pl-5 text-xs text-emerald-900 space-y-1 pt-1">
                      {intelligence.eligibilityAnalysis.rationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses and Fixes (Specification §8) */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-base">
                      <span>⚠️</span>
                      <span>What Needs to be Fixed Before Submitting</span>
                    </div>
                    <p className="text-xs text-amber-900">
                      Our intelligence engine identified the following weaknesses or evidence gaps that should be addressed in your proposal:
                    </p>
                    <ul className="space-y-2 text-xs">
                      {intelligence.whatNeedsToBeFixed.map((fix, i) => (
                        <li key={i} className="flex items-start gap-2 bg-paper/80 p-2.5 rounded border border-amber-200/60 text-amber-950">
                          <span className="font-bold text-amber-700">{i + 1}.</span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Funder Core Priorities */}
                  <div className="rounded-xl border border-paper-line bg-paper-raised/30 p-5 space-y-3">
                    <h4 className="text-xs font-mono uppercase font-semibold text-ink-faint">
                      What {grant.funderName} Cares About Most
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-emerald-800">Prioritized Elements:</span>
                        <ul className="list-disc pl-4 text-ink-soft space-y-1">
                          {intelligence.funderPriorities.coreInterests.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-rose-800">What They Will Not Fund:</span>
                        <ul className="list-disc pl-4 text-ink-soft space-y-1">
                          {intelligence.funderPriorities.whatTheyDoNotFund.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CHECKLIST (Specification §10) */}
              {activeTab === "checklist" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">What You Need: Application Document Checklist</h3>
                    <p className="text-xs text-ink-soft">
                      Ensure every mandatory document is assembled and audited prior to submission to avoid immediate administrative disqualification.
                    </p>
                  </div>

                  <div className="divide-y divide-paper-line border border-paper-line rounded-xl bg-paper overflow-hidden text-xs">
                    {intelligence.whatYouNeedChecklist.map((item, i) => (
                      <div key={i} className="p-4 flex items-start justify-between gap-4 hover:bg-paper-raised/40 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{item.name}</span>
                            {item.isMandatory ? (
                              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                                Mandatory
                              </span>
                            ) : (
                              <span className="rounded-full bg-paper-line px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
                                Recommended
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-ink-faint uppercase">
                              &bull; {item.category}
                            </span>
                          </div>
                          <p className="text-ink-soft text-[11px]">{item.description}</p>
                        </div>
                        <span className="text-[11px] font-mono text-ink-faint whitespace-nowrap bg-paper-raised px-2 py-1 rounded border border-paper-line">
                          {item.typicalFormat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PREVIOUS WINNERS & PATTERNS (Specification §11) */}
              {activeTab === "winners" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">
                      Previous Winners &amp; Applicant Intelligence
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Empirical patterns synthesized from past awarded grantees, reviewer rubrics, and founder interviews.
                    </p>
                  </div>

                  {/* Common Patterns Matrix */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase font-semibold text-ink-faint">
                      What Previous Winners Had in Common
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {intelligence.previousWinnersIntelligence.commonPatterns.map((pat, i) => (
                        <div key={i} className="rounded-xl border border-paper-line bg-paper-raised/40 p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">{pat.commonTrait}</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold px-2 py-0.5">
                              {pat.observedInPercentage}% of Winners
                            </span>
                          </div>
                          <p className="text-ink-soft text-[11px] leading-relaxed">{pat.evidenceSummary}</p>
                          <div className="rounded bg-paper p-2 text-[11px] border border-paper-line text-emerald-950">
                            <strong>Recommendation:</strong> {pat.practicalRecommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Past Grantees Spotlight */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase font-semibold text-ink-faint">
                      Discovered Past Grantees &amp; Case Studies
                    </h4>
                    <div className="space-y-3 text-xs">
                      {intelligence.previousWinnersIntelligence.discoveredWinners.map((winner, i) => (
                        <div key={i} className="rounded-xl border border-paper-line bg-paper p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-ink">{winner.recipientName}</span>
                              <span className="text-ink-faint text-xs ml-2">
                                ({winner.country} &bull; {winner.awardYear} &bull; Award: {winner.awardAmount})
                              </span>
                            </div>
                            <span className="rounded px-2 py-0.5 text-[10px] font-mono bg-paper-raised border border-paper-line text-ink-faint uppercase">
                              {winner.sourceChannel}
                            </span>
                          </div>
                          <p className="text-ink-soft text-[11px]">{winner.projectFocus}</p>
                          {winner.quoteSnippet && (
                            <blockquote className="border-l-2 border-stamp pl-3 italic text-[11px] text-ink-soft">
                              &ldquo;{winner.quoteSnippet}&rdquo;
                            </blockquote>
                          )}
                          <div className="pt-1">
                            <span className="font-semibold text-[11px] text-ink block mb-1">Key Success Factors:</span>
                            <ul className="list-disc pl-4 text-[11px] text-ink-soft space-y-0.5">
                              {winner.keySuccessFactors.map((f, fi) => (
                                <li key={fi}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PROPOSAL INTELLIGENCE (Specification §12) */}
              {activeTab === "proposals" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">
                      Research-Driven Proposal Blueprints
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Feed Grant Intelligence directly into 4 specialized proposal blueprints tailored to {grant.funderName}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Technical Proposal */}
                    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-stamp-dark">
                            Technical Proposal
                          </span>
                          <span className="text-[10px] font-mono bg-paper px-2 py-0.5 rounded border border-paper-line text-ink-faint">
                            Spec §12
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-ink">Engineering &amp; Work Packages</h4>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          Incorporates grant technical requirements, funder engineering priorities, and previous winner milestone structures.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectForProposal?.(grant, "technical_proposal")}
                        className="w-full rounded-lg bg-stamp-dark px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-colors"
                      >
                        Draft Technical Proposal &rarr;
                      </button>
                    </div>

                    {/* 2. Business Proposal */}
                    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-stamp-dark">
                            Business Proposal
                          </span>
                          <span className="text-[10px] font-mono bg-paper px-2 py-0.5 rounded border border-paper-line text-ink-faint">
                            Spec §12
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-ink">Market &amp; Revenue Engine</h4>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          Demonstrates post-grant commercial self-sufficiency, customer traction, and verified community demand.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectForProposal?.(grant, "business_proposal")}
                        className="w-full rounded-lg bg-stamp-dark px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-colors"
                      >
                        Draft Business Proposal &rarr;
                      </button>
                    </div>

                    {/* 3. Financial Proposal */}
                    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-stamp-dark">
                            Financial Proposal
                          </span>
                          <span className="text-[10px] font-mono bg-paper px-2 py-0.5 rounded border border-paper-line text-ink-faint">
                            Spec §12
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-ink">Milestones &amp; Allowable Budget</h4>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          Allocates funding across allowable cost categories into 4 quarterly tranches adhering to overhead ceilings.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectForProposal?.(grant, "financial_proposal")}
                        className="w-full rounded-lg bg-stamp-dark px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-colors"
                      >
                        Draft Financial Proposal &rarr;
                      </button>
                    </div>

                    {/* 4. Impact Proposal */}
                    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-stamp-dark">
                            Impact Proposal
                          </span>
                          <span className="text-[10px] font-mono bg-paper px-2 py-0.5 rounded border border-paper-line text-ink-faint">
                            Spec §12
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-ink">Beneficiaries, SDGs &amp; M&amp;E</h4>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          Synthesizes Theory of Change, disaggregated gender/youth beneficiary targets, and UN SDG mappings.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectForProposal?.(grant, "impact_proposal")}
                        className="w-full rounded-lg bg-stamp-dark px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-colors"
                      >
                        Draft Impact Proposal &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between border-t border-paper-line bg-paper-raised/40 px-6 py-4">
          <span className="text-xs text-ink-faint">
            Verified with GrantSift Source Adapter Layer &bull; Zero Hallucinated Links
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("proposals");
              }}
              className="rounded-lg bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp shadow-sm transition-all"
            >
              Build Proposals With This Intelligence &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
