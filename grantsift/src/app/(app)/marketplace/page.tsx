"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketplaceService, type GrantWriterProfile, type ClientProjectPost } from "@/lib/services/marketplace-service";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"writers" | "post_project" | "projects">("writers");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedWriter, setSelectedWriter] = useState<GrantWriterProfile | null>(null);
  const [hireSuccess, setHireSuccess] = useState(false);

  // New Project Form State
  const [title, setTitle] = useState("");
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("Clean Energy");
  const [country, setCountry] = useState("Nigeria");
  const [budgetUsd, setBudgetUsd] = useState(3000);
  const [deadline, setDeadline] = useState("2026-11-30");
  const [description, setDescription] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  const marketplaceService = new MarketplaceService();
  const writers = marketplaceService.listWriters({ sector: selectedSector });
  const projects = marketplaceService.listProjects();

  const handlePostProject = (e: React.FormEvent) => {
    e.preventDefault();
    marketplaceService.createProject({
      clientId: "client-current",
      clientOrgName: orgName || "My Organization",
      title,
      description,
      sector,
      country,
      budgetUsd: Number(budgetUsd),
      deadline,
    });
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setActiveTab("projects");
    }, 1500);
  };

  const sectors = ["All", "Clean Energy", "Agriculture", "Technology", "Healthcare", "Social Enterprise"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Professional Services
            </span>
            <span className="text-xs text-ink-faint">&bull; Hire Verified Grant Writers</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">Grant Marketplace</h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Connect with top-rated grant writers, proposal strategists, and compliance consultants to scale your non-dilutive funding pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/database"
            className="rounded-full border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper-raised hover:text-ink transition-colors"
          >
            Looking for Grants? Browse Grant Database &rarr;
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-line pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("writers")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "writers"
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-paper-raised hover:text-ink"
          }`}
        >
          Find Grant Writers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("post_project")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "post_project"
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-paper-raised hover:text-ink"
          }`}
        >
          + Post a Grant Project
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "projects"
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-paper-raised hover:text-ink"
          }`}
        >
          Active Job Postings ({projects.length})
        </button>
      </div>

      {/* TAB 1: BROWSE WRITERS */}
      {activeTab === "writers" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint">Filter by Sector:</span>
            <div className="flex flex-wrap gap-1.5">
              {sectors.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSector(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedSector === s
                      ? "bg-ink text-paper"
                      : "border border-paper-line bg-paper-raised text-ink-soft hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {writers.map((writer) => (
              <div
                key={writer.id}
                className="flex flex-col justify-between rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm hover:border-ink/30 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-ink">{writer.name}</h3>
                      <p className="text-xs text-stamp-dark font-medium mt-0.5">{writer.title}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
                      ★ {writer.rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    {writer.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-paper-line/60 bg-paper p-3 text-xs">
                    <div>
                      <span className="text-ink-faint text-[11px]">Funds Won:</span>
                      <p className="font-bold text-ink">${(writer.totalFundsRaisedUsd / 1000000).toFixed(1)}M USD</p>
                    </div>
                    <div>
                      <span className="text-ink-faint text-[11px]">Grants Won:</span>
                      <p className="font-bold text-ink">{writer.grantsWonCount} submissions</p>
                    </div>
                    <div>
                      <span className="text-ink-faint text-[11px]">Rate:</span>
                      <p className="font-bold text-ink">${writer.hourlyRateUsd} / hr</p>
                    </div>
                    <div>
                      <span className="text-ink-faint text-[11px]">Status:</span>
                      <p className="font-bold text-emerald-800">{writer.availability}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-ink-faint">Specializations:</span>
                    <div className="flex flex-wrap gap-1">
                      {writer.sectors.map((sec) => (
                        <span key={sec} className="rounded-md border border-paper-line bg-paper px-2 py-0.5 text-[10px] text-ink-soft">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-paper-line flex items-center justify-between">
                  <span className="text-xs text-ink-faint">{writer.countriesServed.slice(0, 3).join(", ")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWriter(writer);
                      setHireSuccess(false);
                    }}
                    className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
                  >
                    Hire Consultant &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: POST PROJECT */}
      {activeTab === "post_project" && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-ink">Post a Grant Proposal Requirement</h2>
          <p className="text-xs text-ink-soft mt-1">
            Describe your funding opportunity and receive competitive proposals from certified grant writers.
          </p>

          {postSuccess && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 font-semibold">
              ✓ Project requirement posted successfully! Redirecting to job board…
            </div>
          )}

          <form onSubmit={handlePostProject} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need grant writer for $500k AfDB Clean Energy proposal"
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. SolarBridge Africa"
                  className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Operating Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
                >
                  <option value="Clean Energy">Clean Energy</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Social Enterprise">Social Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Project Budget (USD)</label>
                <input
                  type="number"
                  required
                  value={budgetUsd}
                  onChange={(e) => setBudgetUsd(Number(e.target.value))}
                  className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Submission Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Project Description & Deliverables</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the target funder, current state of your data room, and deliverables expected (e.g. 5-section proposal, 24-month M&E plan, budget justification)…"
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ink py-2.5 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
            >
              Publish Project to Marketplace &rarr;
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ACTIVE PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-ink-faint">{p.clientOrgName} &bull; {p.country}</span>
                    <h3 className="font-serif text-base font-bold text-ink mt-0.5">{p.title}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    Budget: ${p.budgetUsd.toLocaleString()} USD
                  </span>
                </div>

                <p className="text-xs text-ink-soft leading-relaxed">{p.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-paper-line text-xs text-ink-faint">
                  <span>Target Deadline: {p.deadline}</span>
                  <span className="font-semibold text-ink">{p.proposalsCount} proposals received</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hire Modal */}
      {selectedWriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-ink-faint">Engagement Workspace</span>
                <h3 className="font-serif text-lg font-bold text-ink mt-1">Hire {selectedWriter.name}</h3>
                <p className="text-xs text-stamp-dark font-medium">{selectedWriter.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWriter(null)}
                className="rounded-full p-1 text-ink-faint hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            {hireSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-2">
                <p className="font-bold">✓ Engagement invitation sent!</p>
                <p>
                  {selectedWriter.name} has been notified and granted access to your organization&apos;s Grant SOP and Data Room workspace according to your role permissions.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-ink-soft">
                  Grant writers operate inside your secure Grant OS workspace. You control document permissions, proposal revisions, and retain full human-in-the-loop sign-off before submission.
                </p>
                <div className="rounded-xl border border-paper-line bg-paper p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Standard Rate:</span>
                    <span className="font-bold text-ink">${selectedWriter.hourlyRateUsd} / hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Average Turnaround:</span>
                    <span className="font-bold text-ink">10 – 14 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Founder Approval:</span>
                    <span className="font-bold text-emerald-800">Mandatory sign-off required</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHireSuccess(true)}
                  className="w-full rounded-xl bg-ink py-2.5 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
                >
                  Confirm & Invite to Organization Workspace &rarr;
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedWriter(null)}
                className="rounded-xl border border-paper-line px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
