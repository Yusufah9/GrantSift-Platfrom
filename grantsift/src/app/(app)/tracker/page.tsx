"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  updateApplicationStageAction,
  removeGrantFromTrackerAction,
} from "./actions";

export interface DBTrackedGrant {
  id: string;
  grantId?: string;
  title: string;
  funderName: string;
  amount: number;
  currency: string;
  deadline: string;
  stage: string;
  notes: string;
  createdAt: string;
  isExternalSubmission?: boolean;
  submissionUrl?: string;
  confirmationNumber?: string;
}

const PIPELINE_STAGES = [
  { id: "all", label: "All Stages", color: "bg-slate-100 text-slate-800" },
  { id: "discovered", label: "Saved / Discovered", color: "bg-cyan-50 border-cyan-200 text-cyan-800" },
  { id: "research", label: "Assessing Eligibility", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { id: "drafting", label: "Preparing Application", color: "bg-teal-50 border-teal-200 text-teal-800" },
  { id: "internal_review", label: "Ready to Submit", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { id: "submitted", label: "Submitted", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { id: "awarded", label: "Awarded", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { id: "rejected", label: "Unsuccessful", color: "bg-rose-50 border-rose-200 text-rose-800" },
];

export default function GrantTrackerPage() {
  const [grants, setGrants] = useState<DBTrackedGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStageFilter, setSelectedStageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"deadline" | "amount" | "newest">("deadline");

  // Modals
  const [selectedGrant, setSelectedGrant] = useState<DBTrackedGrant | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "changes_requested" | "rejected">("approved");
  const [reviewComments, setReviewComments] = useState("");

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");

  // Load from Supabase
  const loadGrants = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Query user's organizations
      const { data: orgs } = await (supabase as any)
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id);

      const orgIds = (orgs || []).map((o: any) => o.id);

      // Query grant_applications
      let appQuery = (supabase as any).from("grant_applications").select("*");
      if (orgIds.length > 0) {
        appQuery = appQuery.in("organization_id", orgIds);
      }
      const { data: dbApps } = await appQuery;

      // Query saved_grants
      let savedQuery = (supabase as any).from("saved_grants").select("*");
      if (orgIds.length > 0) {
        savedQuery = savedQuery.in("organization_id", orgIds);
      }
      const { data: dbSaved } = await savedQuery;

      // Merge and deduplicate
      const mapped: DBTrackedGrant[] = [];
      const seenTitles = new Set<string>();

      (dbApps || []).forEach((app: any) => {
        seenTitles.add(app.title.toLowerCase().trim());
        mapped.push({
          id: app.id,
          grantId: app.grant_id || undefined,
          title: app.title,
          funderName: app.funder_name,
          amount: Number(app.amount_requested) || 0,
          currency: app.currency || "USD",
          deadline: app.deadline || "Open Call",
          stage: app.stage || "discovered",
          notes: app.notes || "",
          createdAt: app.created_at,
          isExternalSubmission: Boolean(app.external_submission_url),
          submissionUrl: app.external_submission_url,
          confirmationNumber: app.external_confirmation_number,
        });
      });

      (dbSaved || []).forEach((saved: any) => {
        if (!seenTitles.has(saved.grant_title.toLowerCase().trim())) {
          seenTitles.add(saved.grant_title.toLowerCase().trim());
          mapped.push({
            id: saved.id,
            grantId: saved.grant_id,
            title: saved.grant_title,
            funderName: saved.funder_name,
            amount: Number(saved.amount_max) || 100000,
            currency: saved.currency || "USD",
            deadline: saved.deadline || "Open Call",
            stage: "discovered",
            notes: saved.notes || "Saved from Grant Discovery",
            createdAt: saved.created_at,
          });
        }
      });

      setGrants(mapped);
    } catch (err) {
      console.error("Error loading tracker grants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrants();
  }, []);

  const handleStageChange = async (grantId: string, newStage: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === grantId ? { ...g, stage: newStage } : g))
    );
    await updateApplicationStageAction({ applicationId: grantId, stage: newStage });
  };

  const handleRemove = async (grant: DBTrackedGrant) => {
    if (!confirm(`Are you sure you want to remove "${grant.title}" from your tracker?`)) return;
    setGrants((prev) => prev.filter((g) => g.id !== grant.id));
    if (grant.grantId) {
      await removeGrantFromTrackerAction(grant.grantId);
    }
  };

  const handleFounderReview = async () => {
    if (!selectedGrant) return;
    const newStage = reviewDecision === "approved" ? "internal_review" : reviewDecision === "rejected" ? "rejected" : "drafting";
    await handleStageChange(selectedGrant.id, newStage);
    setReviewModalOpen(false);
    setReviewComments("");
  };

  const handleRecordSubmission = async () => {
    if (!selectedGrant) return;
    setGrants((prev) =>
      prev.map((g) =>
        g.id === selectedGrant.id
          ? {
              ...g,
              stage: "submitted",
              isExternalSubmission: true,
              submissionUrl: submissionUrl || "https://funder-portal.org",
              confirmationNumber: confirmationNumber || `REC-${Date.now().toString().slice(-6)}`,
            }
          : g
      )
    );
    await updateApplicationStageAction({
      applicationId: selectedGrant.id,
      stage: "submitted",
      notes: `Submitted externally. URL: ${submissionUrl}. Ref: ${confirmationNumber}`,
    });
    setSubmissionModalOpen(false);
  };

  // Filtered & Sorted
  const filteredGrants = useMemo(() => {
    let result = [...grants];

    if (selectedStageFilter !== "all") {
      result = result.filter((g) => g.stage.toLowerCase() === selectedStageFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) => g.title.toLowerCase().includes(q) || g.funderName.toLowerCase().includes(q)
      );
    }

    if (sortBy === "deadline") {
      result.sort((a, b) => {
        if (!a.deadline || a.deadline === "Open Call") return 1;
        if (!b.deadline || b.deadline === "Open Call") return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sortBy === "amount") {
      result.sort((a, b) => b.amount - a.amount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [grants, selectedStageFilter, searchQuery, sortBy]);

  // Statistics
  const totalFunding = useMemo(() => grants.reduce((sum, g) => sum + g.amount, 0), [grants]);
  const activeCount = useMemo(() => grants.filter((g) => g.stage !== "rejected").length, [grants]);
  const awardedCount = useMemo(() => grants.filter((g) => g.stage === "awarded").length, [grants]);
  const submittedCount = useMemo(() => grants.filter((g) => g.stage === "submitted").length, [grants]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-mono font-bold uppercase text-teal-800">
              Pipeline Management
            </span>
            <span className="text-xs text-slate-500">&bull; {activeCount} Active Opportunities</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-900 mt-1.5">
            Grant Pipeline Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track grant applications from initial discovery to eligibility assessment, proposal preparation, founder review, external submission, and award management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            + Discover More Grants
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tracked Pipeline</p>
          <p className="mt-2 text-2xl font-bold text-brand-900">
            ${totalFunding.toLocaleString()} <span className="text-xs font-medium text-slate-400">USD</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{grants.length} total grant records</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">In Preparation</p>
          <p className="mt-2 text-2xl font-bold text-teal-700">
            {grants.filter((g) => ["discovered", "research", "drafting"].includes(g.stage)).length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Drafting proposals & gathering docs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Applications</p>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{submittedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting funder review decision</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Awarded Grants</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{awardedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Approved funding for disbursement</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracked grants by title or funder..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="deadline">Approaching Deadline</option>
              <option value="amount">Highest Funding Amount</option>
              <option value="newest">Recently Saved</option>
            </select>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {PIPELINE_STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStageFilter(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                selectedStageFilter === s.id
                  ? "bg-brand-900 text-white border-brand-900 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grants List / Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Loading your grant pipeline...
        </div>
      ) : filteredGrants.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-2xl">
            📋
          </div>
          <h2 className="font-serif text-xl font-bold text-brand-900">
            {grants.length === 0 ? "Your Grant Tracker is Empty" : "No grants match your filter"}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {grants.length === 0
              ? "Your tracker displays opportunities you have saved from the Discover catalog. Browse open calls to add your first grant application."
              : "Try clearing your stage filter or search term to see other tracked opportunities."}
          </p>
          <div className="pt-2">
            <Link
              href="/discover"
              className="inline-block rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              Browse Discover Catalog &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGrants.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{app.funderName}</span>
                    <span>&bull;</span>
                    <span className="font-mono font-bold text-brand-900">
                      ${app.amount.toLocaleString()} {app.currency}
                    </span>
                    <span>&bull;</span>
                    <span
                      className={`font-semibold ${
                        app.deadline !== "Open Call" && new Date(app.deadline).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30
                          ? "text-amber-700"
                          : "text-slate-600"
                      }`}
                    >
                      Deadline: {app.deadline}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-900">{app.title}</h3>
                  {app.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1">{app.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Stage Dropdown */}
                  <select
                    value={app.stage}
                    onChange={(e) => handleStageChange(app.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                  >
                    <option value="discovered">Discovered</option>
                    <option value="research">Assessing Eligibility</option>
                    <option value="drafting">Preparing Application</option>
                    <option value="internal_review">Ready to Submit</option>
                    <option value="submitted">Submitted</option>
                    <option value="awarded">Awarded</option>
                    <option value="rejected">Unsuccessful</option>
                  </select>

                  <Link
                    href={`/proposals?grantId=${app.id}&type=concept_note`}
                    className="rounded-xl bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-all"
                  >
                    ✍️ Draft Proposal
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGrant(app);
                      setSubmissionModalOpen(true);
                    }}
                    className="rounded-xl bg-brand-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
                  >
                    Record Submission
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(app)}
                    title="Remove from tracker"
                    className="rounded-xl border border-slate-200 p-1.5 text-xs text-slate-400 hover:text-red-600 hover:border-red-200 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Progress Stage Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                {PIPELINE_STAGES.filter((s) => s.id !== "all").map((s) => {
                  const isCurrent = app.stage.toLowerCase() === s.id.toLowerCase();
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStageChange(app.id, s.id)}
                      className={`rounded-lg px-2.5 py-1 transition-all ${
                        isCurrent
                          ? "bg-brand-900 text-white font-bold shadow-sm"
                          : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Submission Modal */}
      {submissionModalOpen && selectedGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-900">Record External Submission</h3>
            <p className="text-xs text-slate-500">
              Record receipt verification for <strong>{selectedGrant.title}</strong> to update your pipeline stage to Submitted.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Submission Portal URL</label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://funder-portal.example.org"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Confirmation / Receipt ID</label>
                <input
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  placeholder="e.g. GRANT-APP-2026-98124"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-teal-600"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubmissionModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordSubmission}
                className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Confirm Submission &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
