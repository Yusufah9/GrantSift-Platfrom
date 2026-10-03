"use client";

import { useState } from "react";
import Link from "next/link";

interface FunderProgram {
  id: string;
  name: string;
  poolAmountUsd: number;
  applicantsCount: number;
  deadline: string;
  status: "open" | "review" | "awarded";
}

interface ApplicantItem {
  id: string;
  orgName: string;
  programName: string;
  requestedAmountUsd: number;
  country: string;
  screeningScore: number;
  status: "Screening" | "Shortlisted" | "Approved" | "Awarded" | "Rejected";
}

export default function FunderPortalPage() {
  const [activeTab, setActiveTab] = useState<"programs" | "applicants" | "disbursements">("programs");

  const [programs, setPrograms] = useState<FunderProgram[]>([
    {
      id: "prog-1",
      name: "2026 West African Climate Innovation Acceleration Fund",
      poolAmountUsd: 1500000,
      applicantsCount: 24,
      deadline: "2026-11-15",
      status: "open",
    },
    {
      id: "prog-2",
      name: "Pan-African Smallholder AgriTech Fellowship",
      poolAmountUsd: 750000,
      applicantsCount: 48,
      deadline: "2026-10-30",
      status: "review",
    },
  ]);

  const [applicants, setApplicants] = useState<ApplicantItem[]>([
    {
      id: "app-1",
      orgName: "SunGrow AgriTech Africa",
      programName: "2026 West African Climate Innovation",
      requestedAmountUsd: 150000,
      country: "Nigeria",
      screeningScore: 89,
      status: "Shortlisted",
    },
    {
      id: "app-2",
      orgName: "HydroFlow Irrigation",
      programName: "Pan-African Smallholder AgriTech Fellowship",
      requestedAmountUsd: 50000,
      country: "Kenya",
      screeningScore: 92,
      status: "Approved",
    },
    {
      id: "app-3",
      orgName: "GreenGrid Mini-Systems",
      programName: "2026 West African Climate Innovation",
      requestedAmountUsd: 200000,
      country: "Ghana",
      screeningScore: 74,
      status: "Screening",
    },
  ]);

  const [disbursements, setDisbursements] = useState([
    {
      id: "disb-1",
      recipient: "HydroFlow Irrigation",
      amountUsd: 25000,
      tranche: 1,
      milestone: "Baseline deployment and sensor calibration",
      status: "Released",
      date: "2026-09-15",
    },
    {
      id: "disb-2",
      recipient: "SunGrow AgriTech Africa",
      amountUsd: 60000,
      tranche: 1,
      milestone: "Equipment procurement for 5 solar cold hubs",
      status: "Pending Approval",
      date: "2026-10-10",
    },
  ]);

  const handleUpdateStatus = (applicantId: string, newStatus: ApplicantItem["status"]) => {
    setApplicants(
      applicants.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Grant Supply Side
            </span>
            <span className="text-xs text-ink-faint">&bull; Funder & Grantmaker Operations</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">Funder Portal</h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Design grant programs, AI-screen applicants, manage awards, and track milestone disbursements and impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/database"
            className="rounded-full border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper-raised"
          >
            Switch to Applicant View &rarr;
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-line pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("programs")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "programs" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
          }`}
        >
          Grant Programs ({programs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("applicants")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "applicants" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
          }`}
        >
          Applicant CRM ({applicants.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("disbursements")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "disbursements" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-raised"
          }`}
        >
          Disbursement Tracker ({disbursements.length})
        </button>
      </div>

      {/* TAB 1: PROGRAMS */}
      {activeTab === "programs" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-lg font-bold text-ink">{prog.name}</h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 uppercase">
                    {prog.status}
                  </span>
                </div>

                <div className="rounded-xl border border-paper-line bg-paper p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Total Pool:</span>
                    <span className="font-bold text-ink">${(prog.poolAmountUsd / 1000000).toFixed(2)}M USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Applications Received:</span>
                    <span className="font-bold text-ink">{prog.applicantsCount} organizations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Application Deadline:</span>
                    <span className="font-mono text-ink">{prog.deadline}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("applicants")}
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark"
                  >
                    Review Applicants &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: APPLICANT CRM */}
      {activeTab === "applicants" && (
        <div className="rounded-2xl border border-paper-line bg-paper-raised overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 border-b border-paper-line bg-paper px-4 py-2.5 text-[11px] font-semibold text-ink-faint">
            <span className="col-span-4">Applicant Organization</span>
            <span className="col-span-3">Target Program</span>
            <span className="col-span-2">Requested</span>
            <span className="col-span-1 text-center">Score</span>
            <span className="col-span-2 text-right">Actions / Status</span>
          </div>

          <div className="divide-y divide-paper-line text-xs">
            {applicants.map((a) => (
              <div key={a.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-paper/60 transition-colors">
                <div className="col-span-4">
                  <p className="font-bold text-ink">{a.orgName}</p>
                  <span className="text-[11px] text-ink-faint">{a.country}</span>
                </div>
                <span className="col-span-3 text-ink-soft text-[11px] truncate pr-2">{a.programName}</span>
                <span className="col-span-2 font-medium text-ink">${a.requestedAmountUsd.toLocaleString()} USD</span>
                <div className="col-span-1 text-center">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    {a.screeningScore}%
                  </span>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                  <select
                    value={a.status}
                    onChange={(e) => handleUpdateStatus(a.id, e.target.value as any)}
                    className="rounded-lg border border-paper-line bg-paper px-2 py-1 text-xs text-ink outline-none"
                  >
                    <option value="Screening">Screening</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Approved">Approved</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISBURSEMENTS */}
      {activeTab === "disbursements" && (
        <div className="rounded-2xl border border-paper-line bg-paper-raised overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 border-b border-paper-line bg-paper px-4 py-2.5 text-[11px] font-semibold text-ink-faint">
            <span className="col-span-4">Award Recipient</span>
            <span className="col-span-4">Milestone Deliverable</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2 text-right">Payment Status</span>
          </div>

          <div className="divide-y divide-paper-line text-xs">
            {disbursements.map((d) => (
              <div key={d.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-paper/60 transition-colors">
                <div className="col-span-4 font-bold text-ink">
                  {d.recipient}
                  <p className="text-[10px] text-ink-faint font-normal">Tranche {d.tranche} &bull; {d.date}</p>
                </div>
                <span className="col-span-4 text-ink-soft text-xs">{d.milestone}</span>
                <span className="col-span-2 font-bold text-ink">${d.amountUsd.toLocaleString()} USD</span>
                <div className="col-span-2 text-right">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      d.status === "Released"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
