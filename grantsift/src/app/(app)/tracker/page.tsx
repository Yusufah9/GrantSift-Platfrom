"use client";

import { useState } from "react";
import { GrantTrackerService, type TrackedGrantApplication, type ApplicationStage } from "@/lib/services/grant-tracker-service";

export default function GrantTrackerPage() {
  const trackerService = new GrantTrackerService();
  const [applications, setApplications] = useState<TrackedGrantApplication[]>(trackerService.listApplications());
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
      const updated = trackerService.processFounderReview({
        applicationId: selectedApp.id,
        founderName: "Organization Founder",
        decision: reviewDecision,
        comments: reviewComments || "Approved for formal submission.",
        version: "v2",
      });
      setApplications([...trackerService.listApplications()]);
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
      const updated = trackerService.recordSubmission({
        applicationId: selectedApp.id,
        isExternal: true,
        submissionUrl: submissionUrl || "https://funder-portal.example.org",
        confirmationNumber: confirmationNumber || `CONF-${Date.now().toString().slice(-6)}`,
      });
      setApplications([...trackerService.listApplications()]);
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
            <span className="text-xs text-ink-faint">&bull; 16-Stage Grant Lifecycle</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">Grant Tracker</h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Track applications from initial discovery to founder approval, external submission, and post-award disbursement.
          </p>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-4 hover:border-ink/20 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-ink-faint">{app.funderName}</span>
                <h3 className="font-serif text-lg font-bold text-ink">{app.grantTitle}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft mt-1">
                  <span>Target: <strong>${app.targetAmountUsd.toLocaleString()} USD</strong></span>
                  <span>&bull;</span>
                  <span>Deadline: <strong>{app.deadline}</strong></span>
                  <span>&bull;</span>
                  <span>Writer: <strong>{app.assignedWriterName ?? "Unassigned"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    app.stage === "awarded"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : app.stage === "founder_review"
                      ? "bg-purple-50 text-purple-800 border border-purple-200"
                      : app.stage === "approved"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-paper border border-paper-line text-ink"
                  }`}
                >
                  Stage: {app.stage.replace(/_/g, " ")}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="rounded-xl bg-ink px-3.5 py-1.5 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
                >
                  Manage &rarr;
                </button>
              </div>
            </div>

            {/* Stages Bar */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] font-mono no-scrollbar">
              {STAGES.map((s, idx) => {
                const isCurrent = app.stage === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap ${
                      isCurrent
                        ? "bg-ink text-paper font-bold"
                        : "bg-paper border border-paper-line text-ink-faint"
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Missing docs notice if applicable */}
            {app.missingDocuments.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center justify-between">
                <span>
                  ⚠ <strong>Missing Documents:</strong> {app.missingDocuments.join(", ")}
                </span>
                <span className="text-[11px] font-medium text-amber-800">Founder requested</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Application Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-paper-line pb-4">
              <div>
                <span className="text-xs font-mono text-ink-faint">{selectedApp.funderName}</span>
                <h2 className="font-serif text-xl font-bold text-ink">{selectedApp.grantTitle}</h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Assigned Consultant: {selectedApp.assignedWriterName ?? "Self-managed"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-full p-1 text-ink-faint hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="rounded-xl border border-purple-300 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-900 hover:bg-purple-100"
              >
                Founder Review & Sign-off &rarr;
              </button>
              <button
                type="button"
                onClick={() => setSubmissionModalOpen(true)}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Log Submission &rarr;
              </button>
            </div>

            {/* Application Overview */}
            <div className="rounded-xl border border-paper-line bg-paper p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-faint">Target Amount:</span>
                <span className="font-bold text-ink">${selectedApp.targetAmountUsd.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-faint">Submission Deadline:</span>
                <span className="font-medium text-ink font-mono">{selectedApp.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-faint">Current Stage:</span>
                <span className="font-bold text-ink uppercase">{selectedApp.stage.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-faint">Founder Approval Status:</span>
                <span className="font-semibold text-emerald-800 capitalize">{selectedApp.founderApprovalStatus}</span>
              </div>
              {selectedApp.confirmationNumber && (
                <div className="flex justify-between">
                  <span className="text-ink-faint">Confirmation Number:</span>
                  <span className="font-mono text-ink font-semibold">{selectedApp.confirmationNumber}</span>
                </div>
              )}
            </div>

            {/* Post-Award Management (PRD §24, §51, §52) */}
            {selectedApp.award && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-emerald-950 text-sm">Award & Disbursement Management</h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                    Active Award
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-ink-faint text-[11px]">Total Award:</span>
                    <p className="font-bold text-emerald-950">${selectedApp.award.awardAmountUsd.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">Disbursed to Date:</span>
                    <p className="font-bold text-emerald-950">${selectedApp.award.disbursedAmountUsd.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">Actual Expenditure:</span>
                    <p className="font-bold text-ink">${selectedApp.award.actualExpenditureUsd.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">Remaining Balance:</span>
                    <p className="font-bold text-ink">
                      ${(selectedApp.award.awardAmountUsd - selectedApp.award.actualExpenditureUsd).toLocaleString()} USD
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-200/60">
                  <span className="font-semibold text-emerald-950 text-[11px]">Disbursement Milestones:</span>
                  {selectedApp.award.milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-[11px] bg-white/70 p-2 rounded-lg">
                      <span className="text-ink">
                        Tranche {m.trancheNumber}: ${m.amountUsd.toLocaleString()} — {m.milestone}
                      </span>
                      <span className={m.isReleased ? "text-emerald-800 font-bold" : "text-ink-faint"}>
                        {m.isReleased ? `✓ Released (${m.releasedAt})` : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval History / Audit Log (PRD §15) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink">Approval Audit Log</h4>
              {selectedApp.approvalHistory.length === 0 ? (
                <p className="text-xs text-ink-faint italic">No founder decisions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedApp.approvalHistory.map((h) => (
                    <div key={h.id} className="rounded-lg border border-paper-line bg-paper p-3 text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-ink">{h.founderName} ({h.version})</span>
                        <span className="text-ink-faint">{h.timestamp.split("T")[0]}</span>
                      </div>
                      <p className="text-ink-soft">{h.comments}</p>
                      <span className="inline-block rounded-md bg-paper-raised px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
                        {h.decision}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-xl border border-paper-line px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Founder Review Action Modal */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Founder Review & Sign-Off</h3>
            <p className="text-xs text-ink-soft">
              Grant writers cannot submit this application without explicit founder authorization.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as any)}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                >
                  <option value="approved">Approve Application for Submission</option>
                  <option value="changes_requested">Request Changes / Revisions</option>
                  <option value="rejected">Reject / Decline Opportunity</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Feedback / Audit Comments</label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Note any specific revisions or sign-off rationale…"
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-xl border border-paper-line px-4 py-2 font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFounderReviewSubmit}
                  className="rounded-xl bg-ink px-4 py-2 font-semibold text-paper hover:bg-stamp-dark"
                >
                  Save Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Action Modal */}
      {submissionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Record Grant Submission</h3>
            <p className="text-xs text-ink-soft">
              Log platform or external portal submission details for audit and deadline tracking.
            </p>

            {submissionError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-semibold">
                {submissionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">External Funder Submission Portal URL</label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://funder-portal.example.org"
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Confirmation / Tracking Reference #</label>
                <input
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  placeholder="e.g. TEF-2026-NGA-8849"
                  className="w-full rounded-xl border border-paper-line bg-paper px-3 py-2 text-ink outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="rounded-xl border border-paper-line px-4 py-2 font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordSubmission}
                  className="rounded-xl bg-ink px-4 py-2 font-semibold text-paper hover:bg-stamp-dark"
                >
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
