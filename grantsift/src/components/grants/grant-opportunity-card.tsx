"use client";

import Link from "next/link";
import type { GrantOpportunity } from "@/lib/types/grant-discovery";

interface GrantCardProps {
  grant: GrantOpportunity;
  matchScore?: number;
  matchExplanation?: string;
  onSave?: (grant: GrantOpportunity) => void;
  onMatch?: (grant: GrantOpportunity) => void;
  isSaved?: boolean;
}

export function GrantOpportunityCard({
  grant,
  matchScore,
  matchExplanation,
  onSave,
  onMatch,
  isSaved = false,
}: GrantCardProps) {
  const formatAmount = () => {
    const curr = grant.funding.currency;
    const min = grant.funding.minimumAward;
    const max = grant.funding.maximumAward;
    if (min && max) {
      if (min === max) return `${curr} ${min.toLocaleString()}`;
      return `${curr} ${min.toLocaleString()} – ${max.toLocaleString()}`;
    }
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    return "Award amount unspecified";
  };

  const statusBadge = () => {
    switch (grant.status) {
      case "active":
        return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">Open</span>;
      case "closing_soon":
        return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">Closing Soon</span>;
      case "closed":
        return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 border border-zinc-200">Closed</span>;
      default:
        return <span className="rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">{grant.status}</span>;
    }
  };

  return (
    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm hover:border-ink/20 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wide">
                {grant.funderName}
              </span>
              <span className="text-xs text-ink-faint">&bull;</span>
              <span className="text-xs text-ink-faint">{grant.funderType}</span>
              <span className="text-xs text-ink-faint">&bull;</span>
              <span className="text-xs text-ink-faint">Source: {grant.originalSource}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-ink leading-snug">
              {grant.grantName}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {statusBadge()}
            {matchScore !== undefined && (
              <span className="text-xs font-mono font-bold text-stamp-dark bg-stamp-tint px-2 py-0.5 rounded">
                {matchScore}% Match
              </span>
            )}
          </div>
        </div>

        {/* Short Summary */}
        <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
          {grant.shortSummary || grant.description}
        </p>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-paper-line text-xs">
          <div>
            <span className="text-ink-faint block">Funding</span>
            <span className="font-semibold text-ink">{formatAmount()}</span>
          </div>
          <div>
            <span className="text-ink-faint block">Deadline</span>
            <span className="font-semibold text-ink font-mono">{grant.deadline || "Rolling"}</span>
          </div>
          <div>
            <span className="text-ink-faint block">Location</span>
            <span className="font-semibold text-ink truncate block">
              {grant.eligibility.countries.slice(0, 2).join(", ")}
              {grant.eligibility.countries.length > 2 && ` +${grant.eligibility.countries.length - 2}`}
            </span>
          </div>
          <div>
            <span className="text-ink-faint block">Eligible Stage</span>
            <span className="font-semibold text-ink truncate block">
              {grant.eligibility.businessStages.slice(0, 2).join(", ")}
            </span>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {grant.focusAreas.slice(0, 4).map((area) => (
            <span
              key={area}
              className="rounded bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft border border-paper-line"
            >
              {area}
            </span>
          ))}
          {grant.focusAreas.length > 4 && (
            <span className="text-[11px] text-ink-faint self-center">
              +{grant.focusAreas.length - 4} more
            </span>
          )}
        </div>

        {/* Match Explanation if available */}
        {matchExplanation && (
          <div className="rounded bg-emerald-50/80 border border-emerald-200 p-2.5 text-xs text-emerald-950">
            <p className="font-semibold mb-0.5">Match Alignment:</p>
            <p className="text-emerald-900 leading-relaxed">{matchExplanation}</p>
          </div>
        )}
      </div>

      {/* Action Buttons Row (PRD §5) */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-paper-line/60">
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(grant)}
              className={`rounded px-3 py-1.5 text-xs font-semibold border transition-all ${
                isSaved
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-paper border-paper-line text-ink-soft hover:text-ink hover:border-ink/30"
              }`}
            >
              {isSaved ? "✓ Saved" : "Save"}
            </button>
          )}

          {onMatch && (
            <button
              type="button"
              onClick={() => onMatch(grant)}
              className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink hover:border-ink/30 transition-all"
            >
              Match to Project
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/workspace?tab=research&grantId=${grant.id}&q=${encodeURIComponent(grant.grantName)}`}
            className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink hover:border-ink/30 transition-all"
          >
            Research
          </Link>

          <Link
            href={`/workspace?tab=proposals&grantId=${grant.id}&title=${encodeURIComponent(grant.grantName)}&funder=${encodeURIComponent(grant.funderName)}`}
            className="rounded bg-stamp-dark px-3.5 py-1.5 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
          >
            Start Proposal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
