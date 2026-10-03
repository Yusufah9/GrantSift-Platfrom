"use client";

import { useState } from "react";
import type {
  ResearchSynthesisReport,
  ResearchInsight,
  FirecrawlSearchResult,
  RecurringPattern,
  SourceConfidence,
  SourceType,
} from "@/lib/services/firecrawl/firecrawl.types";

interface WebResearchPanelProps {
  orgContext?: {
    orgName: string;
    sector: string;
    country: string;
    project?: string;
  };
}

export interface SavedInsightItem {
  id: string;
  title: string;
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: string;
  confidence: string;
  savedAt: string;
  sectionTarget: string;
}

export function WebResearchPanel({
  orgContext = {
    orgName: "SunGrow AgriTech Africa",
    sector: "Clean Energy & Agri-Tech",
    country: "Nigeria",
    project: "Decentralized Solar Cold Storage",
  },
}: WebResearchPanelProps) {
  const [query, setQuery] = useState(`Climate & Agri-Tech grants for ${orgContext.country} startups`);
  const [mode, setMode] = useState<
    "quick_search" | "grant_research" | "funder_research" | "recipient_research" | "proposal_research" | "competitor_research" | "deep_research"
  >("grant_research");

  const [selectedSources, setSelectedSources] = useState<string[]>([
    "web",
    "grant-websites",
    "funder-websites",
    "opportunity-square",
    "instrumentl",
    "linkedin",
  ]);

  const [regionFilter, setRegionFilter] = useState("Africa");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ResearchSynthesisReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedInsights, setSavedInsights] = useState<SavedInsightItem[]>([
    {
      id: "insight-default-1",
      title: "Cooperative Offtake Contracts are mandatory for AfDB/SEFA grants",
      claim: "Successful past applicants had pre-signed letters of intent with registered farmer cooperatives.",
      sourceTitle: "AfDB SEFA Applicant Debrief & Past Awardee Showcase",
      sourceUrl: "https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/sustainable-energy-fund-africa",
      sourceType: "official_funder",
      confidence: "Official",
      savedAt: "2026-10-02T14:30:00Z",
      sectionTarget: "Problem & Validation",
    },
  ]);

  const [activeSubTab, setActiveSubTab] = useState<"search" | "synthesis" | "sources" | "library">("search");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ALL_SOURCES = [
    { id: "web", label: "Global Web", category: "Search" },
    { id: "grant-websites", label: "Grant Websites", category: "Official" },
    { id: "funder-websites", label: "Funder Websites", category: "Official" },
    { id: "opportunity-square", label: "Opportunity Square", category: "Partner", badge: "Live Connector" },
    { id: "instrumentl", label: "Instrumentl", category: "Database", badge: "Public Index" },
    { id: "youtube", label: "YouTube (Interviews)", category: "Media" },
    { id: "linkedin", label: "LinkedIn (Recipients)", category: "Professional" },
    { id: "x", label: "X (Announcements)", category: "Social" },
    { id: "facebook", label: "Facebook", category: "Social" },
    { id: "instagram", label: "Instagram", category: "Social" },
  ];

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const handleRunResearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          mode,
          sources: selectedSources,
          orgContext: {
            ...orgContext,
            region: regionFilter,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Web research service is temporarily unavailable. Please retry.");
      }

      setReport(data.data);
      setActiveSubTab("synthesis");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete web research.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomInsight = (title: string, claimText: string, srcUrl: string, srcTitle: string, conf: string) => {
    const newInsight: SavedInsightItem = {
      id: `saved-${Date.now()}`,
      title,
      claim: claimText,
      sourceTitle: srcTitle,
      sourceUrl: srcUrl,
      sourceType: "verified",
      confidence: conf,
      savedAt: new Date().toISOString(),
      sectionTarget: "Methodology & Impact",
    };

    setSavedInsights((prev) => [newInsight, ...prev]);
    setToastMessage(`Saved insight from "${title}" to Research Library!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confidenceBadge = (confidence: string) => {
    const confLower = confidence.toLowerCase();
    if (confLower.includes("official")) {
      return <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">Official Funder</span>;
    }
    if (confLower.includes("verified")) {
      return <span className="rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 text-[10px] font-bold">Verified Source</span>;
    }
    if (confLower.includes("social")) {
      return <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-[10px] font-bold">Social Evidence</span>;
    }
    if (confLower.includes("public")) {
      return <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">Public Index</span>;
    }
    return <span className="rounded-full bg-gray-100 text-gray-700 border border-gray-300 px-2 py-0.5 text-[10px]">Unverified</span>;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-ink text-paper px-4 py-3 shadow-xl border border-paper-line text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
                Live Web Research &bull; Firecrawl + Gemini
              </span>
              <span className="text-xs text-ink-faint">Real-Time Web Intelligence Layer</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink mt-2">
              Autonomous Web Research Engine
            </h2>
            <p className="text-xs text-ink-soft mt-1">
              Firecrawl searches and extracts live web information from Opportunity Square, Instrumentl, and official funder portals. Gemini synthesizes evidence, patterns, and citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab("library")}
              className="rounded-full border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-paper-raised transition-all flex items-center gap-1.5"
            >
              <span>📚</span> Research Library ({savedInsights.length})
            </button>
          </div>
        </div>

        {/* Context Breadcrumb */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-soft border-t border-paper-line pt-3">
          <span className="font-mono text-ink-faint">Active Tenant Context:</span>
          <span className="font-semibold text-ink">{orgContext.orgName}</span>
          <span>&bull;</span>
          <span>{orgContext.sector}</span>
          <span>&bull;</span>
          <span>{orgContext.country}</span>
          {orgContext.project && (
            <>
              <span>&bull;</span>
              <span className="text-stamp-dark">Project: {orgContext.project}</span>
            </>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-line pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab("search")}
          className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors ${
            activeSubTab === "search" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
          }`}
        >
          🔍 Web Research Query
        </button>
        {report && (
          <>
            <button
              type="button"
              onClick={() => setActiveSubTab("synthesis")}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors ${
                activeSubTab === "synthesis" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
              }`}
            >
              ✨ AI Intelligence Report ({report.sources.length} sources)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("sources")}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors ${
                activeSubTab === "sources" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
              }`}
            >
              🌐 Discovered Sources &amp; Cards
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setActiveSubTab("library")}
          className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors ${
            activeSubTab === "library" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
          }`}
        >
          📁 Saved Insights ({savedInsights.length})
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
          <p className="font-bold">Web Research Notice</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* SUBTAB 1: SEARCH CONTROLS */}
      {activeSubTab === "search" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-5">
            <div>
              <label htmlFor="search-input" className="block text-xs font-mono font-semibold uppercase text-ink-faint">
                What do you want to research?
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Climate resilience & agriculture grants for African entrepreneurs..."
                  className="flex-1 rounded-xl border border-paper-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <button
                  type="button"
                  onClick={handleRunResearch}
                  disabled={isLoading}
                  className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                      <span>Crawling Web...</span>
                    </>
                  ) : (
                    <>
                      <span>Research</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Suggestions based on current Org */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink-faint font-mono">Suggested variants:</span>
              {[
                `Climate grants ${orgContext.country} startup`,
                `SEFA AfDB grant requirements 2026`,
                `site:opportunitysquare.org agriculture grants ${orgContext.country}`,
                `site:instrumentl.com clean energy Africa`,
                `TEF Tony Elumelu recipient stories LinkedIn`,
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuery(sug)}
                  className="rounded-full border border-paper-line bg-paper px-2.5 py-1 text-[11px] text-ink-soft hover:bg-paper-line hover:text-ink transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* RESEARCH MODES */}
            <div className="border-t border-paper-line pt-4">
              <label className="block text-xs font-mono font-semibold uppercase text-ink-faint mb-2">
                Research Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { id: "quick_search", label: "Quick Search", desc: "Fast multi-source sweep" },
                  { id: "grant_research", label: "Grant Research", desc: "Targeted grant calls" },
                  { id: "funder_research", label: "Funder Research", desc: "Foundation DNA & priorities" },
                  { id: "recipient_research", label: "Recipient Research", desc: "Past awardee profiles" },
                  { id: "proposal_research", label: "Proposal Intel", desc: "Winning problem statements" },
                  { id: "competitor_research", label: "Competitor / Peer", desc: "Peer funding benchmarks" },
                  { id: "deep_research", label: "Deep Research", desc: "Multi-page deep extraction" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      mode === m.id
                        ? "border-ink bg-ink text-paper"
                        : "border-paper-line bg-paper text-ink hover:border-ink-soft"
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className={`text-[10px] mt-1 ${mode === m.id ? "text-paper/80" : "text-ink-faint"}`}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SOURCES CHECKLIST */}
            <div className="border-t border-paper-line pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-semibold uppercase text-ink-faint">
                  Designated Web Sources &amp; Connectors
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedSources(ALL_SOURCES.map((s) => s.id))}
                    className="text-stamp-dark hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSources(["opportunity-square", "instrumentl", "funder-websites"])}
                    className="text-stamp-dark hover:underline font-semibold"
                  >
                    Grant Portals Only
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {ALL_SOURCES.map((src) => {
                  const isChecked = selectedSources.includes(src.id);
                  return (
                    <label
                      key={src.id}
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer text-xs transition-all ${
                        isChecked
                          ? "border-ink bg-paper shadow-xs"
                          : "border-paper-line bg-paper/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSource(src.id)}
                        className="mt-0.5 rounded border-paper-line text-ink focus:ring-ink"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink flex items-center justify-between">
                          <span className="truncate">{src.label}</span>
                          {src.badge && (
                            <span className="rounded bg-stamp-tint px-1 py-0.2 text-[9px] font-mono text-stamp-dark">
                              {src.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-ink-faint font-mono">{src.category}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* REGION FILTER */}
            <div className="border-t border-paper-line pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-ink-faint">Funder Geography Filter:</span>
                {["Africa", "United States", "Europe", "Global", "Middle East"].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setRegionFilter(reg)}
                    className={`rounded-full px-3 py-1 font-semibold transition-all ${
                      regionFilter === reg
                        ? "bg-ink text-paper"
                        : "bg-paper border border-paper-line text-ink-soft hover:text-ink"
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              <div className="text-right text-[11px] text-ink-faint font-mono">
                Source Priority: Funder Website &gt; Portal &gt; OpportunitySquare &gt; Instrumentl &gt; Social
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SYNTHESIS REPORT */}
      {activeSubTab === "synthesis" && report && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-paper-line pb-3">
              <div>
                <span className="font-mono text-xs text-ink-faint uppercase">
                  Synthesized Intelligence &bull; Query: &quot;{report.query}&quot;
                </span>
                <h3 className="font-serif text-xl font-bold text-ink mt-1">Research Executive Summary</h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-ink-soft">
                  {report.sources.length} sources retrieved &bull; {report.recurringPatterns.length} patterns identified
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink font-sans">
              {report.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Requirements */}
            <div className="rounded-2xl border border-paper-line bg-paper p-5 shadow-sm space-y-3">
              <h4 className="font-serif text-sm font-bold text-ink flex items-center gap-2">
                <span>📋</span> Common Funder Eligibility &amp; Requirements
              </h4>
              <ul className="space-y-2 text-xs text-ink-soft">
                {report.eligibilityChecklist.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Funder Priorities */}
            <div className="rounded-2xl border border-paper-line bg-paper p-5 shadow-sm space-y-3">
              <h4 className="font-serif text-sm font-bold text-ink flex items-center gap-2">
                <span>🎯</span> Funder Stated Priorities
              </h4>
              <ul className="space-y-2 text-xs text-ink-soft">
                {report.funderPriorities.map((fp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-stamp-dark font-bold">&bull;</span>
                    <span>{fp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RECURRING PATTERNS */}
          <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-stamp-dark uppercase font-semibold">
                  Proprietary Pattern Intelligence
                </span>
                <h4 className="font-serif text-lg font-bold text-ink">
                  Recurring Patterns Identified Across Sources
                </h4>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                Evidence-Backed Insights
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {report.recurringPatterns.map((pat, idx) => (
                <div key={idx} className="rounded-xl border border-paper-line bg-paper p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">{pat.pattern}</span>
                    <span className="font-mono text-[10px] text-ink-faint">
                      Evidence Count: {pat.evidenceCount}
                    </span>
                  </div>
                  <p className="text-ink-soft leading-relaxed">{pat.recommendation}</p>
                  <div className="border-t border-paper-line pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-ink-faint">Sources: {pat.citationSources.join(", ")}</span>
                    <button
                      type="button"
                      onClick={() =>
                        saveCustomInsight(
                          pat.pattern,
                          pat.recommendation,
                          report.sources[0]?.url || "#",
                          report.sources[0]?.title || "Research Engine",
                          "Verified"
                        )
                      }
                      className="text-stamp-dark font-semibold hover:underline"
                    >
                      + Save Insight
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposal Recommendations & Missing Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-paper-line bg-emerald-50/60 p-5 shadow-sm space-y-3">
              <h4 className="font-serif text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>💡</span> Proposal Strategy Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-emerald-900">
                {report.proposalRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-paper-line bg-amber-50/60 p-5 shadow-sm space-y-3">
              <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>⚠️</span> Potential Gaps / Missing Information
              </h4>
              <ul className="space-y-2 text-xs text-amber-900">
                {report.missingInformation.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold">!</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DISCOVERED SOURCES & CARDS */}
      {activeSubTab === "sources" && report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink">
              Discovered Web Sources ({report.sources.length})
            </h3>
            <span className="text-xs font-mono text-ink-faint">
              Categorized by Source Type &amp; Reliability Tier
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {report.sources.map((src, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-paper-line bg-paper p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {confidenceBadge(src.confidence)}
                    <span className="text-[10px] font-mono text-ink-faint">
                      {src.lastChecked ? `Checked: ${src.lastChecked}` : "Live Web"}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-ink leading-snug">
                    {src.title}
                  </h4>

                  <p className="text-xs text-ink-soft leading-relaxed mt-2.5">
                    {src.description}
                  </p>
                </div>

                <div className="border-t border-paper-line pt-3 flex items-center justify-between text-xs">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink hover:text-stamp-dark underline flex items-center gap-1"
                  >
                    <span>Open Live Source</span>
                    <span>↗</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        saveCustomInsight(
                          src.title,
                          src.description,
                          src.url,
                          src.title,
                          src.confidence
                        )
                      }
                      className="rounded-lg bg-paper-raised border border-paper-line px-3 py-1 font-semibold text-ink hover:bg-ink hover:text-paper transition-all"
                    >
                      Save Insight
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: RESEARCH LIBRARY */}
      {activeSubTab === "library" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-paper-line pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Project Research Library
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Organized citations, evidence, and quotes ready to insert into your Grant Proposal Editor.
              </p>
            </div>
            <span className="font-mono text-xs text-ink-faint">
              {savedInsights.length} Saved Findings
            </span>
          </div>

          {savedInsights.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-line p-8 text-center">
              <p className="text-xs text-ink-soft">No insights saved yet.</p>
              <button
                type="button"
                onClick={() => setActiveSubTab("search")}
                className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper"
              >
                Start Web Research &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedInsights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-paper-line bg-paper p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {confidenceBadge(item.confidence)}
                      <span className="font-bold text-ink text-sm">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-faint">
                      Target Section: {item.sectionTarget}
                    </span>
                  </div>

                  <p className="text-ink leading-relaxed bg-paper-raised p-3 rounded-lg border-l-2 border-ink italic">
                    &ldquo;{item.claim}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-ink-faint pt-1">
                    <div className="flex items-center gap-1.5">
                      <span>Source:</span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stamp-dark underline truncate max-w-xs font-semibold"
                      >
                        {item.sourceTitle}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage(`Copied citation for proposal!`);
                          navigator?.clipboard?.writeText(
                            `[Evidence]: "${item.claim}" — Source: ${item.sourceTitle} (${item.sourceUrl})`
                          );
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="font-semibold text-ink hover:underline"
                      >
                        Copy Citation
                      </button>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedInsights((prev) => prev.filter((x) => x.id !== item.id));
                        }}
                        className="text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
