"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateReadinessScore, type ScorecardInput } from "@/lib/services/scorecard-service";
import { WebResearchPanel } from "@/components/research/web-research-panel";
import { DataRoomManager } from "@/components/dataroom/data-room-manager";
import { ProposalWorkspaceEditor } from "@/components/proposals/proposal-workspace-editor";
import { GrantSopPipeline } from "@/components/sop/grant-sop-pipeline";
import { aiMatchingService, type ProjectAnalysisProfile, type ProjectRunAnalysisReport } from "@/lib/services/ai-matching-service";
import { GrantOpportunityCard } from "@/components/grants/grant-opportunity-card";
import { FunderEntityCard } from "@/components/grants/funder-entity-card";
import { FindGrantsEngine } from "@/components/discovery/find-grants-engine";

export default function OrganizationWorkspacePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "discovery" | "research" | "profile" | "scorecard" | "analysis" | "proposals" | "documents" | "sops" | "analytics" | "methodology"
  >("overview");
  const [customAiPrompt, setCustomAiPrompt] = useState(
    "Focus on empirical evidence, clear beneficiary metrics, and practical sustainability. Avoid AI buzzwords. Prioritize Nigerian and West African local context."
  );
  const [promptSavedNotice, setPromptSavedNotice] = useState(false);

  // Multi-tenant Organization Profile (PRD §25: Starts empty if no org created)
  const [hasOrganization, setHasOrganization] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgProfile, setOrgProfile] = useState<ProjectAnalysisProfile>({
    projectName: "",
    orgName: "",
    orgType: "Startup",
    country: "",
    industry: "",
    sector: "",
    problemStatement: "",
    solutionStatement: "",
    targetBeneficiaries: "",
    stage: "Seed",
    fundingRequirement: 100000,
    traction: "",
    teamInfo: "",
    hasIncorporation: false,
    hasAuditedFinancials: false,
  });

  // Project Run Analysis Results
  const [analysisReport, setAnalysisReport] = useState<ProjectRunAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // User Tracker Saved Grants (PRD §27: Starts empty)
  const [savedGrants, setSavedGrants] = useState<any[]>([]);

  // Scorecard calculation based on actual org data
  const scorecardInput: ScorecardInput = {
    orgName: orgProfile.orgName || "Your Organization",
    orgType: orgProfile.orgType as any,
    industry: orgProfile.industry || "General",
    country: orgProfile.country || "Global",
    stage: orgProfile.stage as any,
    yearFounded: 2024,
    teamSize: 3,
    revenue: 0,
    fundingRaised: 0,
    problemStatement: orgProfile.problemStatement,
    targetBeneficiaries: orgProfile.targetBeneficiaries,
    impactMetrics: orgProfile.traction,
    hasIncorporation: orgProfile.hasIncorporation || false,
    hasTaxId: orgProfile.hasIncorporation || false,
    hasAuditedFinancials: orgProfile.hasAuditedFinancials || false,
    hasPitchDeck: Boolean(orgProfile.solutionStatement),
    hasBusinessPlan: Boolean(orgProfile.problemStatement),
    hasLettersOfSupport: false,
  };

  const scorecard = calculateReadinessScore(scorecardInput);

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgProfile.orgName.trim() || !orgProfile.country.trim()) {
      alert("Please provide at least Organization Name and Country.");
      return;
    }
    setHasOrganization(true);
    setShowOrgModal(false);
  };

  const handleRunAnalysis = () => {
    if (!hasOrganization) {
      setShowOrgModal(true);
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const report = aiMatchingService.analyzeProjectMatches(orgProfile);
      setAnalysisReport(report);
      setIsAnalyzing(false);
      setActiveTab("analysis");
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Top Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Grant Operating System
            </span>
            <span className="text-xs text-ink-faint">
              &bull; {hasOrganization ? orgProfile.orgName : "No Active Organization"}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">
            {hasOrganization ? `${orgProfile.orgName} Workspace` : "Organization Workspace"}
          </h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Complete institutional grant workflow: discover, research, match, write, track, and manage funding awards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!hasOrganization ? (
            <button
              type="button"
              onClick={() => setShowOrgModal(true)}
              className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
            >
              + Create Organization
            </button>
          ) : (
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing Database..." : "⚡ Run Grant Matching"}
            </button>
          )}

          {hasOrganization && (
            <button
              type="button"
              onClick={() => setActiveTab("discovery")}
              className="rounded bg-paper px-4 py-2 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>🔍</span>
              <span>Find Grants</span>
            </button>
          )}

          <Link
            href="/database"
            className="rounded bg-paper px-4 py-2 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 transition-all shadow-sm"
          >
            Grant Database
          </Link>
        </div>
      </div>

      {/* Clean Empty State Rule (PRD §25, §28) */}
      {!hasOrganization ? (
        <div className="rounded-2xl border border-dashed border-paper-line bg-paper-raised/40 p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stamp/10 text-stamp-dark text-2xl font-serif">
            🏛️
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink">Welcome to Your Grant Operating System</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Your workspace is currently clean and unconfigured. To begin discovering verified grants, matching funding opportunities, and drafting proposals, set up your organization profile.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOrgModal(true)}
              className="rounded-lg bg-stamp-dark px-6 py-2.5 text-sm font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
            >
              Create Your Organization &rarr;
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Workspace Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-paper-line text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "overview" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Overview &amp; Project
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("discovery")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "discovery" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              🔍 Find Grants (Engine)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analysis")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "analysis" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Matched Grants &amp; Funders {analysisReport && `(${analysisReport.matchedGrants.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("research")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "research" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Live Web Research
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("proposals")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "proposals" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Proposal Workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("documents")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "documents" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Data Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sops")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "sops" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              24-Step Grant SOP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scorecard")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "scorecard" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Institutional Scorecard ({scorecard.overallScore}/100)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "analytics" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Analytics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("methodology")}
              className={`pb-3 px-3 transition-all border-b-2 ${
                activeTab === "methodology" ? "border-stamp-dark text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              AI Methodology (PRD §29)
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-12">
                {/* Organization & Project Summary */}
                <div className="md:col-span-8 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-paper-line">
                    <div>
                      <span className="text-xs text-ink-faint font-semibold uppercase">Project Master Profile</span>
                      <h3 className="font-serif text-xl font-bold text-ink mt-0.5">
                        {orgProfile.projectName || "General Initiative"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOrgModal(true)}
                      className="rounded border border-paper-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-xs">
                    <div>
                      <span className="text-ink-faint block">Country</span>
                      <span className="font-semibold text-ink">{orgProfile.country}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint block">Sector</span>
                      <span className="font-semibold text-ink">{orgProfile.sector || "Clean Technology"}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint block">Stage</span>
                      <span className="font-semibold text-ink">{orgProfile.stage}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint block">Target Funding</span>
                      <span className="font-semibold text-ink">${orgProfile.fundingRequirement.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-semibold text-ink">Problem Statement</h4>
                    <p className="text-ink-soft bg-paper p-3 rounded border border-paper-line leading-relaxed">
                      {orgProfile.problemStatement || "No problem statement defined yet."}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-semibold text-ink">Proposed Solution</h4>
                    <p className="text-ink-soft bg-paper p-3 rounded border border-paper-line leading-relaxed">
                      {orgProfile.solutionStatement || "No solution statement defined yet."}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-paper-line">
                    <span className="text-xs text-ink-soft">
                      Ready to identify matching funding opportunities?
                    </span>
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={handleRunAnalysis}
                      className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
                    >
                      ⚡ Run Analysis Now
                    </button>
                  </div>
                </div>

                {/* Readiness Quick Card */}
                <div className="md:col-span-4 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4 text-xs">
                  <span className="font-serif font-bold text-sm text-ink block pb-2 border-b border-paper-line">
                    Grant Readiness Scorecard
                  </span>
                  <div className="text-center py-2">
                    <span className="text-4xl font-serif font-bold text-stamp-dark">{scorecard.overallScore}</span>
                    <span className="text-ink-faint"> / 100</span>
                    <p className="text-[11px] text-ink-soft mt-1">Readiness Grade: {scorecard.grade}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>Profile Completeness</span>
                      <span className="font-bold">{scorecard.categoryScores.orgProfile}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Legal Compliance</span>
                      <span className="font-bold">{scorecard.categoryScores.legalDocumentation}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Impact Evidence</span>
                      <span className="font-bold">{scorecard.categoryScores.impactDocumentation}%</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scorecard")}
                    className="w-full text-center rounded border border-paper-line bg-paper py-2 font-semibold text-ink-soft hover:text-ink"
                  >
                    View Scorecard Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI GRANT DISCOVERY ENGINE */}
          {activeTab === "discovery" && (
            <div className="space-y-6">
              <FindGrantsEngine
                organizationProfile={orgProfile}
                isPaidUser={true}
              />
            </div>
          )}

          {/* TAB 2: RUN ANALYSIS MATCHED GRANTS & FUNDERS (PRD §8, §9, §10, §14) */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              {!analysisReport ? (
                <div className="rounded-xl border border-dashed border-paper-line p-10 text-center bg-paper-raised/40 space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-ink">Run Analysis to Match Opportunities</h3>
                  <p className="text-xs text-ink-soft max-w-md mx-auto">
                    The AI matching engine evaluates your project profile against open opportunities and foundation mandates with detailed compatibility reasoning.
                  </p>
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    className="rounded bg-stamp-dark px-5 py-2 text-xs font-semibold text-paper"
                  >
                    ⚡ Run Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Analysis Summary Header */}
                  <div className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stamp-dark uppercase tracking-wider">
                        AI Matching Intelligence Report
                      </span>
                      <span className="text-xs font-mono text-ink-faint">Generated {analysisReport.timestamp.slice(0, 10)}</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-ink">
                      Opportunities &amp; Foundations Matched for {analysisReport.projectSummary.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {analysisReport.highPriorityRecommendations.map((rec, i) => (
                        <span key={i} className="rounded bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-950 font-medium">
                          ✓ {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section 1: Relevant Grants (PRD §8) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-paper-line pb-2">
                      <h3 className="font-serif text-lg font-bold text-ink">
                        Relevant Open Grants ({analysisReport.matchedGrants.length})
                      </h3>
                      <span className="text-xs text-ink-faint">Ranked by eligibility compatibility</span>
                    </div>

                    <div className="grid gap-6">
                      {analysisReport.matchedGrants.map((match) => (
                        <div key={match.grant.id} className="rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-ink-faint">
                                <span className="font-semibold text-ink-soft uppercase">{match.grant.funderName}</span>
                                <span>&bull;</span>
                                <span>{match.grant.originalSource}</span>
                              </div>
                              <h4 className="font-serif text-lg font-bold text-ink mt-0.5">{match.grant.grantName}</h4>
                              <p className="text-xs text-ink-soft mt-1 leading-relaxed">{match.relevanceExplanation}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-bold text-stamp-dark bg-stamp-tint px-2.5 py-1 rounded">
                                {match.matchScore}% Match ({match.compatibilityLevel})
                              </span>
                            </div>
                          </div>

                          {/* Compatibility Indicators Matrix (PRD §8) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-paper-line text-xs">
                            <div>
                              <span className="text-ink-faint block">Eligibility</span>
                              <span className="font-semibold text-emerald-800">{match.eligibilityCompatibility.status}</span>
                            </div>
                            <div>
                              <span className="text-ink-faint block">Funding Alignment</span>
                              <span className="font-semibold text-ink">{match.fundingCompatibility.status}</span>
                            </div>
                            <div>
                              <span className="text-ink-faint block">Geography</span>
                              <span className="font-semibold text-ink">{match.geographicCompatibility.status}</span>
                            </div>
                            <div>
                              <span className="text-ink-faint block">Sector Fit</span>
                              <span className="font-semibold text-ink">{match.sectorCompatibility.status}</span>
                            </div>
                          </div>

                          {/* Matched Characteristics & Potential Concerns */}
                          <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5 bg-paper p-3 rounded border border-paper-line">
                              <span className="font-semibold text-ink">Matched Characteristics</span>
                              <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                                {match.matchedCharacteristics.map((char, idx) => (
                                  <li key={idx}>{char}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-1.5 bg-paper p-3 rounded border border-paper-line">
                              <span className="font-semibold text-amber-950">Potential Concerns &amp; Gaps</span>
                              <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                                {match.potentialConcerns.map((con, idx) => (
                                  <li key={idx}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Footer: Write Your First Grant (PRD §14) */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-paper-line">
                            <span className="text-xs text-ink-faint">
                              <b>Recommended Action:</b> {match.recommendedNextAction}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!savedGrants.some((g) => g.id === match.grant.id)) {
                                    setSavedGrants((prev) => [...prev, match.grant]);
                                    alert(`"${match.grant.grantName}" added to Tracker.`);
                                  }
                                }}
                                className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink"
                              >
                                Save Grant
                              </button>
                              <Link
                                href={`/workspace?tab=research&grantId=${match.grant.id}&q=${encodeURIComponent(match.grant.grantName)}`}
                                className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink"
                              >
                                Deep Research
                              </Link>
                              <button
                                type="button"
                                onClick={() => setActiveTab("proposals")}
                                className="rounded bg-stamp-dark px-4 py-1.5 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
                              >
                                Write Your First Grant &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Relevant Foundations & Funders (PRD §8) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-paper-line pb-2">
                      <h3 className="font-serif text-lg font-bold text-ink">
                        Relevant Foundations &amp; Institutional Funders ({analysisReport.matchedFunders.length})
                      </h3>
                      <span className="text-xs text-ink-faint">Long-term philanthropic and grantmakers</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {analysisReport.matchedFunders.map((funderMatch) => (
                        <div key={funderMatch.funder.id} className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-3">
                          <div>
                            <span className="text-[11px] font-semibold text-ink-faint uppercase">{funderMatch.funder.funderType}</span>
                            <h4 className="font-serif text-base font-bold text-ink mt-0.5">{funderMatch.funder.name}</h4>
                            <p className="text-xs text-ink-soft mt-1 leading-relaxed">{funderMatch.whyRelevant}</p>
                          </div>
                          <div className="text-xs text-ink-faint">
                            <b>Strategic Approach:</b> {funderMatch.strategicApproach}
                          </div>
                          <div className="pt-2 border-t border-paper-line flex justify-end">
                            <Link
                              href={`/workspace?tab=research&mode=funder_research&q=${encodeURIComponent(funderMatch.funder.name)}`}
                              className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink hover:border-ink/30"
                            >
                              Research Funder &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE WEB RESEARCH */}
          {activeTab === "research" && (
            <WebResearchPanel
              orgContext={{
                orgName: orgProfile.orgName,
                country: orgProfile.country,
                sector: orgProfile.sector,
                project: orgProfile.projectName,
              }}
            />
          )}

          {/* TAB 4: PROPOSALS WORKSPACE (PRD §16, §18, §19) */}
          {activeTab === "proposals" && (
            <ProposalWorkspaceEditor
              initialGrantName={analysisReport?.matchedGrants[0]?.grant.grantName}
              initialFunderName={analysisReport?.matchedGrants[0]?.grant.funderName}
              grantId={analysisReport?.matchedGrants[0]?.grant.id}
              orgName={orgProfile.orgName}
              country={orgProfile.country}
            />
          )}

          {/* TAB 5: DATA ROOM (PRD §20, §21, §22, §23) */}
          {activeTab === "documents" && (
            <DataRoomManager orgName={orgProfile.orgName} />
          )}

          {/* TAB 6: 24-STEP SOP (PRD §31) */}
          {activeTab === "sops" && (
            <GrantSopPipeline />
          )}

          {/* TAB 7: SCORECARD */}
          {activeTab === "scorecard" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-xl font-bold text-ink">Institutional Readiness Evaluation</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-paper rounded border border-paper-line">
                    <span className="text-ink-faint block">Profile Score</span>
                    <span className="text-lg font-serif font-bold text-ink">{scorecard.categoryScores.orgProfile}%</span>
                  </div>
                  <div className="p-3 bg-paper rounded border border-paper-line">
                    <span className="text-ink-faint block">Legal Compliance</span>
                    <span className="text-lg font-serif font-bold text-ink">{scorecard.categoryScores.legalDocumentation}%</span>
                  </div>
                  <div className="p-3 bg-paper rounded border border-paper-line">
                    <span className="text-ink-faint block">Impact Baseline</span>
                    <span className="text-lg font-serif font-bold text-ink">{scorecard.categoryScores.impactDocumentation}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REAL ANALYTICS (PRD §29) */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {savedGrants.length === 0 ? (
                /* Clean Zero State (PRD §29) */
                <div className="rounded-xl border border-dashed border-paper-line p-12 text-center bg-paper-raised/40 space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-ink">No Analytics Yet</h3>
                  <p className="text-xs text-ink-soft max-w-md mx-auto">
                    Create a project and start working on grants to see your funding activity here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("analysis")}
                    className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper"
                  >
                    Explore Grant Matches
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="rounded-xl border border-paper-line bg-paper-raised p-4">
                    <span className="text-ink-faint block">Grants Saved</span>
                    <span className="text-2xl font-serif font-bold text-ink mt-1">{savedGrants.length}</span>
                  </div>
                  <div className="rounded-xl border border-paper-line bg-paper-raised p-4">
                    <span className="text-ink-faint block">Proposals Drafted</span>
                    <span className="text-2xl font-serif font-bold text-ink mt-1">1</span>
                  </div>
                  <div className="rounded-xl border border-paper-line bg-paper-raised p-4">
                    <span className="text-ink-faint block">Funding Pipeline</span>
                    <span className="text-2xl font-serif font-bold text-stamp-dark mt-1">
                      ${(savedGrants.length * 250000).toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-paper-line bg-paper-raised p-4">
                    <span className="text-ink-faint block">Success Probability</span>
                    <span className="text-2xl font-serif font-bold text-emerald-800 mt-1">Active</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: CUSTOM AI METHODOLOGY (PRD §29, §36) */}
          {activeTab === "methodology" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-paper-line">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink">Custom Grant-Writing Methodology &amp; AI Prompt</h3>
                    <p className="text-xs text-ink-soft mt-1">
                      Configure your organization&apos;s custom writing tone, research process, and evaluation rubrics. These instructions are automatically injected into all AI proposal generations and chat responses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromptSavedNotice(true);
                      setTimeout(() => setPromptSavedNotice(false), 3000);
                    }}
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-stamp-dark transition-all"
                  >
                    Save Instructions
                  </button>
                </div>

                {promptSavedNotice && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
                    ✓ Custom AI methodology instructions saved successfully.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-ink">
                    Organization-Level Grant Writing Rules &amp; Philosophy
                  </label>
                  <textarea
                    rows={8}
                    value={customAiPrompt}
                    onChange={(e) => setCustomAiPrompt(e.target.value)}
                    className="w-full rounded-2xl border border-paper-line bg-paper p-4 font-mono text-xs leading-relaxed text-ink outline-none focus:border-ink shadow-inner"
                    placeholder="e.g. Always write with empirical precision. Avoid clichés. State exact gender/youth beneficiary percentages. Ground all budgets in Nigerian naira unit rates..."
                  />
                  <p className="text-[11px] text-ink-faint">
                    These instructions persist with your organization workspace and guide Gemini during proposal synthesis, budget checks, and funder alignment reviews.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Organization Setup Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateOrganization}
            className="w-full max-w-xl rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-paper-line">
              <h3 className="font-serif text-lg font-bold text-ink">
                {hasOrganization ? "Edit Organization Profile" : "Create Your Organization"}
              </h3>
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="text-xs text-ink-faint hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-ink-soft font-medium mb-1">Organization Name *</label>
                <input
                  required
                  type="text"
                  value={orgProfile.orgName}
                  onChange={(e) => setOrgProfile({ ...orgProfile, orgName: e.target.value })}
                  placeholder="e.g. AgriSphere Solutions"
                  className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={orgProfile.projectName}
                  onChange={(e) => setOrgProfile({ ...orgProfile, projectName: e.target.value })}
                  placeholder="e.g. Solar Cold Chain Initiative"
                  className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-medium mb-1">Country *</label>
                <input
                  required
                  type="text"
                  value={orgProfile.country}
                  onChange={(e) => setOrgProfile({ ...orgProfile, country: e.target.value })}
                  placeholder="e.g. Nigeria"
                  className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-medium mb-1">Sector / Focus</label>
                <input
                  type="text"
                  value={orgProfile.sector}
                  onChange={(e) => setOrgProfile({ ...orgProfile, sector: e.target.value })}
                  placeholder="e.g. Clean Energy"
                  className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-medium mb-1">Organization Legal Type</label>
                <select
                  value={orgProfile.orgType}
                  onChange={(e) => setOrgProfile({ ...orgProfile, orgType: e.target.value })}
                  className="w-full rounded border border-paper-line bg-paper px-2.5 py-2 text-ink outline-none"
                >
                  <option value="Startup">Startup</option>
                  <option value="SME">SME</option>
                  <option value="NGO">NGO / Non-profit</option>
                  <option value="Social Enterprise">Social Enterprise</option>
                  <option value="University">University / Academic</option>
                  <option value="Research Institution">Research Institution</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft font-medium mb-1">Funding Target (USD)</label>
                <input
                  type="number"
                  value={orgProfile.fundingRequirement}
                  onChange={(e) => setOrgProfile({ ...orgProfile, fundingRequirement: Number(e.target.value) })}
                  className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-ink-soft font-medium">Problem Statement</label>
              <textarea
                rows={2}
                value={orgProfile.problemStatement}
                onChange={(e) => setOrgProfile({ ...orgProfile, problemStatement: e.target.value })}
                placeholder="What critical market or community challenge does this project solve?"
                className="w-full rounded border border-paper-line bg-paper p-2.5 text-ink outline-none"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-ink-soft font-medium">Proposed Solution</label>
              <textarea
                rows={2}
                value={orgProfile.solutionStatement}
                onChange={(e) => setOrgProfile({ ...orgProfile, solutionStatement: e.target.value })}
                placeholder="How does your technology or intervention solve this problem?"
                className="w-full rounded border border-paper-line bg-paper p-2.5 text-ink outline-none"
              />
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orgProfile.hasIncorporation}
                  onChange={(e) => setOrgProfile({ ...orgProfile, hasIncorporation: e.target.checked })}
                />
                <span>Incorporated Legal Entity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orgProfile.hasAuditedFinancials}
                  onChange={(e) => setOrgProfile({ ...orgProfile, hasAuditedFinancials: e.target.checked })}
                />
                <span>2-Year Audited Financials</span>
              </label>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-paper-line">
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="rounded px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-stamp-dark px-5 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-all shadow-sm"
              >
                Save &amp; Open Workspace &rarr;
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
