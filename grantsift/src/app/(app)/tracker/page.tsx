"use client";

import { useState } from "react";
import Link from "next/link";
import {
  grantTrackerService,
  type TrackedGrantApplication,
  type ApplicationStage,
} from "@/lib/services/grant-tracker-service";

export default function GrantTrackerPage() {
  const [applications, setApplications] = useState<TrackedGrantApplication[]>(() =>
    grantTrackerService.listApplications()
  );
  const [selectedApp, setSelectedApp] = useState<TrackedGrantApplication | null>(null);

  // Founder Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"approved" | "changes_requested" | "rejected">("approved");

  // Submission Modal State
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const STAGES: { id: ApplicationStage; label: string }[] = [
    { id: "discovered", label: "Discovered" },
    { id: "researching", label: "Researching" },
    { id: "eligible", label: "Eligible" },
    { id: "writing", label: "Writing" },
    { id: "awaiting_documents", label: "Awaiting Docs" },
    { id: "founder_review", label: "Founder Review" },
    { id: "changes_requested", label: "Changes Req." },
    { id: "approved", label: "Approved" },
    { id: "submitted", label: "Submitted" },
    { id: "under_review", label: "Under Review" },
    { id: "awarded", label: "Awarded" },
    { id: "completed", label: "Completed" },
  ];

  const handleFounderReviewSubmit = () => {
    if (!selectedApp) return;
    try {
      const updated = grantTrackerService.processFounderReview({
        applicationId: selectedApp.id,
        founderName: "Organization Founder",
        decision: reviewDecision,
        comments: reviewComments || "Approved for formal submission.",
        version: "v1.0",
      });
      setApplications([...grantTrackerService.listApplications()]);
      setSelectedApp({ ...updated });
      setReviewModalOpen(false);
      setReviewComments("");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRecordSubmission = () => {
    if (!selectedApp) return;
    try {
      setSubmissionError(null);
      const updated = grantTrackerService.recordSubmission({
        applicationId: selectedApp.id,
        isExternal: true,
        submissionUrl: submissionUrl || "https://funder-portal.example.org",
        confirmationNumber: confirmationNumber || `CONF-${Date.now().toString().slice(-6)}`,
      });
      setApplications([...grantTrackerService.listApplications()]);
      setSelectedApp({ ...updated });
      setSubmissionModalOpen(false);
    } catch (e: any) {
      setSubmissionError(e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Pipeline Management
            </span>
            <span className="text-xs text-ink-faint">&bull; {applications.length} Active Applications</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">Grant Tracker</h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Track applications from initial discovery to founder approval, external submission, and post-award disbursement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/database"
            className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
          >
            + Add Grants from Database
          </Link>
        </div>
      </div>

      {/* Clean Empty State Rule (PRD §25, §27) */}
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-paper-line bg-paper-raised/40 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-paper-line text-xl">
            📋
          </div>
          <h2 className="font-serif text-xl font-bold text-ink">Your Grant Tracker is Empty</h2>
          <p className="text-xs text-ink-soft leading-relaxed">
            Your personal tracker only displays opportunities you have explicitly saved or matched to your projects. Discover open calls in the Grant Database to begin tracking.
          </p>
          <div className="pt-2">
            <Link
              href="/database"
              className="inline-block rounded-lg bg-stamp-dark px-5 py-2.5 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
            >
              Browse Grant Database &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Applications Table / Cards */
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-4 hover:border-ink/20 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-faint">
                    <span className="font-semibold text-ink-soft">{app.funderName}</span>
                    <span>&bull;</span>
                    <span>Deadline: {app.deadline}</span>
                    <span>&bull;</span>
                    <span className="font-mono font-bold text-ink">
                      ${app.targetAmountUsd.toLocaleString()} USD
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink mt-0.5">{app.grantTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-paper border border-paper-line px-3 py-1 text-xs font-semibold text-ink-soft capitalize">
                    Stage: {app.stage.replace(/_/g, " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(app);
                      setReviewModalOpen(true);
                    }}
                    className="rounded bg-paper px-3 py-1 text-xs font-semibold border border-paper-line text-ink hover:border-ink/30"
                  >
                    Founder Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(app);
                      setSubmissionModalOpen(true);
                    }}
                    className="rounded bg-stamp-dark px-3 py-1 text-xs font-semibold text-paper shadow-sm hover:bg-stamp"
                  >
                    Record Submission
                  </button>
                </div>
              </div>

              {/* Stage Progress Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-paper-line text-[11px]">
                {STAGES.map((s) => {
                  const isCurrent = app.stage === s.id;
                  return (
                    <span
                      key={s.id}
                      className={`rounded px-2 py-0.5 transition-all ${
                        isCurrent
                          ? "bg-stamp-dark text-white font-bold"
                          : "bg-paper text-ink-faint border border-paper-line"
                      }`}
                    >
                      {s.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Founder Review Modal */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Founder Review: {selectedApp.grantTitle}</h3>
            <div className="space-y-2 text-xs">
              <label className="block text-ink-soft font-medium">Review Decision</label>
              <select
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value as any)}
                className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
              >
                <option value="approved">Approve for Formal Submission</option>
                <option value="changes_requested">Request Changes / Revisions</option>
                <option value="rejected">Reject Application</option>
              </select>
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-ink-soft font-medium">Comments &amp; Feedback</label>
              <textarea
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter feedback for the proposal writer..."
                className="w-full rounded border border-paper-line bg-paper p-2.5 text-ink outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="rounded px-4 py-2 text-xs font-semibold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFounderReviewSubmit}
                className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {submissionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Record External Submission</h3>
            {submissionError && (
              <div className="rounded bg-red-50 border border-red-300 p-2.5 text-xs text-red-900">
                {submissionError}
              </div>
            )}
            <div className="space-y-2 text-xs">
              <label className="block text-ink-soft font-medium">Submission Portal URL</label>
              <input
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://funder-portal.example.org"
                className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
              />
            </div>
            <div className="space-y-2 text-xs">
              <label className="block text-ink-soft font-medium">Confirmation Number / Receipt ID</label>
              <input
                type="text"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                placeholder="e.g. SEFA-APP-2026-98124"
                className="w-full rounded border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubmissionModalOpen(false)}
                className="rounded px-4 py-2 text-xs font-semibold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordSubmission}
                className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper"
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
