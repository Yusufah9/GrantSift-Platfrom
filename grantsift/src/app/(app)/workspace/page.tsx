"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateReadinessScore, type ScorecardInput } from "@/lib/services/scorecard-service";
import { downloadScorecardExcel } from "@/lib/excel/scorecard-export";

export default function OrganizationWorkspacePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "scorecard" | "documents" | "sops" | "approvals" | "analytics"
  >("overview");

  // Mock Organization Profile state
  const [orgProfile, setOrgProfile] = useState({
    orgName: "SunGrow AgriTech Africa",
    orgType: "Startup",
    country: "Nigeria",
    state: "Lagos",
    industry: "Agriculture",
    sector: "Clean Energy & Agri-Tech",
    stage: "Early Revenue / Growth",
    yearFounded: 2022,
    teamSize: 7,
    revenue: 55000,
    fundingReceived: 25000,
    problemStatement:
      "Smallholder horticulture farmers across northern and western Nigeria lose 35-45% of perishable tomato and pepper harvests due to lack of off-grid cold chain storage and fragmented middleman distribution.",
    solutionStatement:
      "We design, deploy, and lease solar-powered decentralized micro-cold rooms with integrated mobile marketplace pricing alerts, eliminating spoilage and increasing farmer net revenue by 40%.",
    targetBeneficiaries: "Over 4,200 smallholder farming households and women market traders.",
    sdgs: ["SDG 2: Zero Hunger", "SDG 7: Affordable & Clean Energy", "SDG 8: Decent Work & Economic Growth"],
  });

  // Scorecard calculation based on org profile
  const scorecardInput: ScorecardInput = {
    orgName: orgProfile.orgName,
    orgType: orgProfile.orgType as any,
    industry: orgProfile.industry,
    country: orgProfile.country,
    stage: orgProfile.stage as any,
    yearFounded: orgProfile.yearFounded,
    teamSize: orgProfile.teamSize,
    revenue: orgProfile.revenue,
    fundingRaised: orgProfile.fundingReceived,
    problemStatement: orgProfile.problemStatement,
    targetBeneficiaries: orgProfile.targetBeneficiaries,
    impactMetrics: "Reduced harvest spoilage by 62% across 3 state cooperatives.",
    hasIncorporation: true,
    hasTaxId: true,
    hasAuditedFinancials: false, // Gap
    hasPitchDeck: true,
    hasBusinessPlan: true,
    hasLettersOfSupport: true,
  };

  const scorecard = calculateReadinessScore(scorecardInput);

  // Data Room Documents state
  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      name: "CAC_Certificate_of_Incorporation.pdf",
      folder: "01 Corporate",
      category: "Corporate",
      permission: "Owner",
      uploadedAt: "2026-09-12",
      size: "1.2 MB",
    },
    {
      id: "doc-2",
      name: "Federal_Tax_Identification_Number.pdf",
      folder: "01 Corporate",
      category: "Corporate",
      permission: "Owner",
      uploadedAt: "2026-09-12",
      size: "850 KB",
    },
    {
      id: "doc-3",
      name: "Financial_Projections_2025_2027.xlsx",
      folder: "02 Financial",
      category: "Financial",
      permission: "Editor",
      uploadedAt: "2026-09-28",
      size: "2.4 MB",
    },
    {
      id: "doc-4",
      name: "SunGrow_Investor_Pitch_Deck_v4.pdf",
      folder: "03 Business",
      category: "Business",
      permission: "Viewer",
      uploadedAt: "2026-10-01",
      size: "4.8 MB",
    },
    {
      id: "doc-5",
      name: "Farmer_Cooperative_Impact_Audit_2025.pdf",
      folder: "06 Impact",
      category: "Impact",
      permission: "Viewer",
      uploadedAt: "2026-09-20",
      size: "1.8 MB",
    },
  ]);

  const [requestedDocNotice, setRequestedDocNotice] = useState<string | null>(null);

  const handleRequestDocument = (docName: string) => {
    setRequestedDocNotice(`Document request for "${docName}" sent to Founder email & in-app inbox.`);
    setTimeout(() => setRequestedDocNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Organization Source of Truth
            </span>
            <span className="text-xs text-ink-faint">&bull; Permanent Tenant Workspace</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">
            {orgProfile.orgName}
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            {orgProfile.sector} &bull; {orgProfile.country} &bull; {orgProfile.stage}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/database"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
          >
            Find Grants for this Org &rarr;
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-paper-line pb-1 no-scrollbar text-xs">
        {[
          { id: "overview", label: "Overview" },
          { id: "profile", label: "Master Profile" },
          { id: "scorecard", label: `Scorecard (${scorecard.overallScore}%)` },
          { id: "documents", label: `Data Room (${documents.length})` },
          { id: "sops", label: "Grant SOPs" },
          { id: "approvals", label: "Approvals" },
          { id: "analytics", label: "Analytics" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-ink text-paper"
                : "text-ink-soft hover:bg-paper-raised hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm">
              <span className="text-xs font-mono text-ink-faint">Readiness Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-ink">{scorecard.overallScore}%</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Grade {scorecard.grade}
                </span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1">Eligible for institutional grants up to $500k</p>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm">
              <span className="text-xs font-mono text-ink-faint">Pipeline Value</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-ink">$800k</span>
                <span className="text-xs text-ink-soft">USD</span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1">3 opportunities in progress</p>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm">
              <span className="text-xs font-mono text-ink-faint">Data Room Documents</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-ink">{documents.length}</span>
                <span className="text-xs text-emerald-800">Verified</span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1">1 required document missing (Audited Books)</p>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm">
              <span className="text-xs font-mono text-ink-faint">Pending Approvals</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-amber-800">1</span>
                <span className="text-xs text-ink-soft">Action required</span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1">TEF Entrepreneurship submission ready</p>
            </div>
          </div>

          <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Active Funding Pipeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-paper-line bg-paper p-4 text-xs">
                <div>
                  <span className="font-semibold text-ink text-sm">SEFA Catalyst Clean Energy Grant</span>
                  <p className="text-ink-soft mt-0.5">AfDB &bull; $500,000 USD &bull; Deadline Dec 15, 2026</p>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 font-semibold text-amber-900">
                  Writing Stage (60%)
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-paper-line bg-paper p-4 text-xs">
                <div>
                  <span className="font-semibold text-ink text-sm">TEF Entrepreneurship Programme</span>
                  <p className="text-ink-soft mt-0.5">Tony Elumelu Foundation &bull; $50,000 USD &bull; Deadline Nov 30, 2026</p>
                </div>
                <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 font-semibold text-purple-900">
                  Awaiting Founder Sign-off
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-paper-line bg-paper p-4 text-xs">
                <div>
                  <span className="font-semibold text-ink text-sm">USAID Feed the Future Agri-Food Grant</span>
                  <p className="text-ink-soft mt-0.5">USAID &bull; $250,000 USD &bull; Awarded</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-semibold text-emerald-900">
                  Awarded &bull; Tranche 1 Disbursed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER PROFILE */}
      {activeTab === "profile" && (
        <div className="max-w-3xl rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Organization Master Profile</h2>
            <p className="text-xs text-ink-soft mt-1">
              Enter your organization details once. The intelligence layer automatically reuses this context in grant matchmaking, proposal generation, and eligibility checks.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-ink mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgProfile.orgName}
                  onChange={(e) => setOrgProfile({ ...orgProfile, orgName: e.target.value })}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Organization Type</label>
                <input
                  type="text"
                  value={orgProfile.orgType}
                  onChange={(e) => setOrgProfile({ ...orgProfile, orgType: e.target.value })}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-ink mb-1">Country</label>
                <input
                  type="text"
                  value={orgProfile.country}
                  onChange={(e) => setOrgProfile({ ...orgProfile, country: e.target.value })}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Industry / Sector</label>
                <input
                  type="text"
                  value={orgProfile.sector}
                  onChange={(e) => setOrgProfile({ ...orgProfile, sector: e.target.value })}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Problem Being Solved</label>
              <textarea
                rows={3}
                value={orgProfile.problemStatement}
                onChange={(e) => setOrgProfile({ ...orgProfile, problemStatement: e.target.value })}
                className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Proposed Solution & Business Model</label>
              <textarea
                rows={3}
                value={orgProfile.solutionStatement}
                onChange={(e) => setOrgProfile({ ...orgProfile, solutionStatement: e.target.value })}
                className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Target Beneficiaries & Impact Reach</label>
              <input
                type="text"
                value={orgProfile.targetBeneficiaries}
                onChange={(e) => setOrgProfile({ ...orgProfile, targetBeneficiaries: e.target.value })}
                className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCORECARD */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Grant Readiness Scorecard</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Objective readiness audit based on funder compliance rubrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadScorecardExcel(scorecard, orgProfile.orgName)}
              className="rounded-xl border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper-raised hover:text-ink transition-colors flex items-center gap-1.5"
            >
              <span>📊 Export Excel Scorecard</span>
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 text-center space-y-2">
              <span className="text-xs font-mono uppercase text-ink-faint">Overall Readiness</span>
              <div className="font-serif text-5xl font-bold text-ink">{scorecard.overallScore}%</div>
              <p className="text-xs font-semibold text-emerald-800">Grade {scorecard.grade} — Competitive</p>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-paper-line bg-paper-raised p-6 space-y-3">
              <h3 className="text-xs font-bold text-ink">Readiness Breakdown by Dimension</h3>
              <div className="space-y-2.5 text-xs">
                {Object.entries(scorecard.categoryScores).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-ink-soft capitalize">
                      <span>{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-bold text-ink">{val}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-paper border border-paper-line overflow-hidden">
                      <div
                        className="h-full bg-ink rounded-full transition-all"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 space-y-3">
              <h3 className="text-xs font-bold text-emerald-900">Key Strengths</h3>
              <ul className="space-y-1.5 text-xs text-ink-soft">
                {scorecard.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 space-y-3">
              <h3 className="text-xs font-bold text-amber-900">Gaps & Action Items</h3>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {scorecard.gaps.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>⚠</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA ROOM & DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Organization Data Room</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Structured repository with Google Drive-style permissions (Owner, Editor, Commenter, Viewer).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRequestDocument("2024-2025 Audited Financial Accounts")}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
              >
                + Request Missing Document
              </button>
            </div>
          </div>

          {requestedDocNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 font-semibold">
              ✓ {requestedDocNotice}
            </div>
          )}

          <div className="rounded-2xl border border-paper-line bg-paper-raised overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 border-b border-paper-line bg-paper px-4 py-2.5 text-[11px] font-semibold text-ink-faint">
              <span className="col-span-5">Document Name</span>
              <span className="col-span-2">Folder / Category</span>
              <span className="col-span-2">Permission</span>
              <span className="col-span-2">Uploaded</span>
              <span className="col-span-1 text-right">Size</span>
            </div>

            <div className="divide-y divide-paper-line text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-paper/60 transition-colors">
                  <div className="col-span-5 flex items-center gap-2 font-medium text-ink">
                    <span>📄</span>
                    <span className="truncate">{doc.name}</span>
                  </div>
                  <span className="col-span-2 text-ink-soft text-[11px]">{doc.folder}</span>
                  <div className="col-span-2">
                    <span className="rounded-md border border-paper-line bg-paper px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                      {doc.permission}
                    </span>
                  </div>
                  <span className="col-span-2 text-ink-faint text-[11px]">{doc.uploadedAt}</span>
                  <span className="col-span-1 text-right text-ink-faint text-[11px]">{doc.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOPS */}
      {activeTab === "sops" && (
        <div className="space-y-4 max-w-3xl">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Standard Operating Procedures (SOPs)</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Operational workflows governing grant research, proposal drafting, and compliance.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Grant Research & Verification SOP",
                owner: "Grant Writer / Research Lead",
                sla: "48 hours from discovery",
                desc: "Check official funder portals, verify geographic eligibility, confirm deadline, extract required document checklist.",
              },
              {
                title: "Proposal Writing & Evidence SOP",
                owner: "Lead Grant Consultant",
                sla: "7 business days",
                desc: "Draft 5 core narrative sections grounded in Master Profile. Ensure quantitative beneficiary metrics have verified citations.",
              },
              {
                title: "Financial Budget Justification SOP",
                owner: "Finance Officer & Founder",
                sla: "3 business days",
                desc: "Structure budget line items with quantity and unit costs. Reconcile personnel, operational, and M&E allocations within allowable limits.",
              },
              {
                title: "Founder Approval & Submission SOP",
                owner: "Founder / Executive Director",
                sla: "24 hours prior to deadline",
                desc: "Mandatory human-in-the-loop review. Founder inspects proposal, budget, and supporting docs before authorizing submission.",
              },
            ].map((sop, i) => (
              <div key={i} className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-sm font-bold text-ink">{sop.title}</h3>
                  <span className="rounded-full bg-paper border border-paper-line px-2 py-0.5 text-[10px] font-mono text-ink-faint">
                    SLA: {sop.sla}
                  </span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{sop.desc}</p>
                <div className="text-[11px] text-ink-faint pt-1 border-t border-paper-line">
                  Responsible Role: <span className="font-medium text-ink">{sop.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: APPROVALS */}
      {activeTab === "approvals" && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Founder Approval Workflows</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Review and sign off on completed grant application packages prior to submission.
            </p>
          </div>

          <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-900 uppercase">
                  Pending Founder Review
                </span>
                <h3 className="font-serif text-base font-bold text-ink mt-1">
                  TEF Entrepreneurship Programme ($50,000 USD)
                </h3>
                <p className="text-xs text-ink-faint">Prepared by David Mwangi &bull; Application v2</p>
              </div>
            </div>

            <div className="rounded-xl border border-paper-line bg-paper p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <span>✓</span> <span>Master Organization Profile Verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <span>✓</span> <span>Technical & Business Narrative Draft Complete</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <span>✓</span> <span>Budget Line Items Reconciled ($50,000)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <span>✓</span> <span>Pitch Deck & Team CVs Attached</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/tracker"
                className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
              >
                Inspect in Grant Tracker & Review &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Organization Funding Analytics</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Performance metrics across your grant pipeline.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm text-center">
              <span className="text-xs font-mono text-ink-faint">Total Funding Requested</span>
              <p className="font-serif text-3xl font-bold text-ink mt-2">$800,000</p>
              <p className="text-[11px] text-ink-soft mt-1">Across 3 submitted & active bids</p>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm text-center">
              <span className="text-xs font-mono text-ink-faint">Total Funding Won</span>
              <p className="font-serif text-3xl font-bold text-emerald-900 mt-2">$250,000</p>
              <p className="text-[11px] text-emerald-800 mt-1">USAID Feed the Future Grant</p>
            </div>

            <div className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm text-center">
              <span className="text-xs font-mono text-ink-faint">Win Rate</span>
              <p className="font-serif text-3xl font-bold text-ink mt-2">66.7%</p>
              <p className="text-[11px] text-ink-soft mt-1">2 won / ongoing out of 3</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
