"use client";

import { useState } from "react";
import Link from "next/link";
import { GrantDatabaseService } from "@/lib/services/grant-database-service";
import { GrantMatchingService, type GrantOpportunity } from "@/lib/services/grant-matching-service";

export default function GrantDatabasePage() {
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isProSimulated, setIsProSimulated] = useState(false);
  const [matchedGrant, setMatchedGrant] = useState<GrantOpportunity | null>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);

  const databaseService = new GrantDatabaseService();
  const matchingService = new GrantMatchingService();

  const searchResults = databaseService.search(
    {
      query,
      sector: selectedSector,
      country: selectedCountry,
      applicantType: selectedType,
    },
    isProSimulated
  );

  const handleMatchCheck = (grant: GrantOpportunity) => {
    setMatchedGrant(grant);
    const mockQuery = {
      orgName: "My Organization",
      orgType: (grant.applicantType === "Any" ? "Startup" : grant.applicantType) as any,
      country: grant.eligibleCountries[0] ?? "Nigeria",
      sector: grant.sector,
      fundingRequirement: grant.amountMin + (grant.amountMax - grant.amountMin) / 2,
    };
    const res = matchingService.match(mockQuery, isProSimulated);
    const specificMatch = res.matches.find((m) => m.grant.id === grant.id) ?? res.matches[0];
    setMatchDetails(specificMatch);
  };

  const sectors = ["All", "Clean Energy", "Agriculture", "Technology", "Healthcare", "Social Enterprise"];
  const countries = ["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Uganda", "Global"];
  const applicantTypes = ["All", "Startup", "SME", "NGO", "Social Enterprise", "Researcher"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Funding Discovery
            </span>
            <span className="text-xs text-ink-faint">&bull; 40,000+ Active Grants &bull; 450,000+ Funders</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">Grant Database</h1>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">
            Explore verified non-dilutive grants, innovation challenges, and institutional funding opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsProSimulated(!isProSimulated)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all border ${
              isProSimulated
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "bg-paper-raised border-paper-line text-ink-soft hover:text-ink"
            }`}
          >
            {isProSimulated ? "👑 Pro View (Unlocked)" : "Free View (Locked to Preview)"}
          </button>
          <Link
            href="/pricing"
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all shadow-sm"
          >
            Upgrade to Pro &rarr;
          </Link>
        </div>
      </div>

      {/* Pro Callout Banner if Free */}
      {!isProSimulated && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-sm text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <p className="font-semibold text-sm">You are previewing a limited sample of grants</p>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed max-w-2xl">
              Subscribe as a Pro user to unlock access to all 40,000+ grants in our verified database, full eligibility filters, direct application links, and automated proposal writers.
            </p>
          </div>
          <Link
            href="/pricing"
            className="rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors whitespace-nowrap shadow-sm text-center"
          >
            Subscribe to Pro ($49/mo)
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-paper-line bg-paper-raised p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by grant title, funder, or keywords (e.g. clean energy, agriculture, AI)…"
              className="w-full rounded-xl border border-paper-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-ink-faint">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="rounded-lg border border-paper-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-ink-faint">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-lg border border-paper-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-ink-faint">Applicant Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-paper-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none"
            >
              {applicantTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-ink-faint px-1">
        <span>
          Showing {searchResults.displayedCount} of {searchResults.totalCount} active funding opportunities
        </span>
        <span>Updated daily &bull; Verified sources</span>
      </div>

      {/* Grant Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.grants.map((grant) => (
          <div
            key={grant.id}
            className="flex flex-col justify-between rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-sm transition-all hover:border-ink/30 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-ink-faint truncate max-w-[200px]">
                  {grant.funderName}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    grant.status === "closing_soon"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {grant.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-ink leading-snug">{grant.title}</h3>
                <p className="text-xs text-ink-soft mt-1.5 line-clamp-3 leading-relaxed">
                  {grant.description}
                </p>
              </div>

              <div className="rounded-xl border border-paper-line/60 bg-paper p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-faint">Award Pool:</span>
                  <span className="font-semibold text-ink">
                    ${grant.amountMin.toLocaleString()} – ${grant.amountMax.toLocaleString()} {grant.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-faint">Deadline:</span>
                  <span className="font-medium text-ink font-mono">{grant.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-faint">Geography:</span>
                  <span className="text-ink">{grant.country}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md border border-paper-line bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                  {grant.sector}
                </span>
                <span className="rounded-md border border-paper-line bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                  {grant.applicantType}
                </span>
                {grant.isVerified && (
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    ✓ Verified Funder
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-paper-line flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleMatchCheck(grant)}
                className="rounded-lg border border-paper-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-paper hover:text-ink transition-colors"
              >
                ✨ Match Analysis
              </button>

              {isProSimulated ? (
                <a
                  href={grant.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-ink px-3.5 py-1.5 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
                >
                  Apply &rarr;
                </a>
              ) : (
                <Link
                  href="/pricing"
                  className="rounded-lg bg-amber-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition-all flex items-center gap-1"
                >
                  <span>🔒 Pro Unlock</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Match Modal */}
      {matchedGrant && matchDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono text-stamp-dark uppercase">
                  Matchmaking Rationale
                </span>
                <h3 className="font-serif text-lg font-bold text-ink mt-1">{matchedGrant.title}</h3>
                <p className="text-xs text-ink-faint">{matchedGrant.funderName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMatchedGrant(null)}
                className="rounded-full p-1 text-ink-faint hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-paper-line bg-paper p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper font-serif font-bold text-lg">
                {matchDetails.matchScore}%
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">AI Compatibility Score</p>
                <p className="text-[11px] text-ink-soft">
                  Derived from sector focus, operating country, legal structure, and funding band.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink">Why this opportunity matched:</p>
              <ul className="space-y-1.5 text-xs text-ink-soft">
                {matchDetails.matchedReasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {matchDetails.potentialGaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-paper-line">
                <p className="text-xs font-semibold text-ink">Potential compliance gaps to verify:</p>
                <ul className="space-y-1 text-xs text-amber-800">
                  {matchDetails.potentialGaps.map((g: string, idx: number) => (
                    <li key={idx}>&bull; {g}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-paper-line flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMatchedGrant(null)}
                className="rounded-xl border border-paper-line px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Close
              </button>
              <Link
                href="/tracker"
                className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark"
              >
                Add to Grant Tracker &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
