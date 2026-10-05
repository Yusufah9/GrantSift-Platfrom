"use client";

import { useState } from "react";
import type { GrantOpportunity, SourceTier, VerificationStatus } from "@/lib/types/grant-discovery";
import type { DetailedGrantMatch } from "@/lib/services/ai-matching-service";

interface GrantCardVerifiedProps {
  match: DetailedGrantMatch;
  onOpenIntelligence?: (grant: GrantOpportunity) => void;
  onSaveToTracker?: (grant: GrantOpportunity) => void;
  isSaved?: boolean;
}

export function GrantCardVerified({
  match,
  onOpenIntelligence,
  onSaveToTracker,
  isSaved = false,
}: GrantCardVerifiedProps) {
  const { grant, matchScore, whyYouMatchSummary, potentialIssuesToFix, relevanceExplanation } = match;
  const [showWeaknessDetails, setShowWeaknessDetails] = useState(false);

  // Status & Tier Badges
  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return {
          label: "✓ Verified Grant",
          className: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
      case "unverified_lead":
        return {
          label: "⚠ Unverified Lead",
          className: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "expired":
        return {
          label: "⌛ Expired Grant",
          className: "bg-stone-100 text-stone-700 border-stone-300",
        };
      case "closed":
        return {
          label: "✕ Closed Grant",
          className: "bg-rose-100 text-rose-900 border-rose-300",
        };
    }
  };

  const getSourceTierBadge = (tier: SourceTier) => {
    switch (tier) {
      case "tier_1_official":
        return { label: "Tier 1: Official Funder Portal", className: "bg-purple-50 text-purple-900 border-purple-200" };
      case "tier_2_database":
        return { label: "Tier 2: Trusted Database", className: "bg-blue-50 text-blue-900 border-blue-200" };
      case "tier_3_secondary":
        return { label: "Tier 3: Secondary Announcement", className: "bg-amber-50 text-amber-900 border-amber-200" };
      case "tier_4_social":
        return { label: "Tier 4: Social / Recipient Case", className: "bg-zinc-50 text-zinc-900 border-zinc-200" };
    }
  };

  const verBadge = getVerificationBadge(grant.verificationStatus || "verified");
  const tierBadge = getSourceTierBadge(grant.sourceTier || "tier_2_database");

  const formattedAmount = grant.funding.maximumAward
    ? `${grant.funding.currency} ${grant.funding.maximumAward.toLocaleString()}`
    : grant.funding.typicalAward
    ? `${grant.funding.currency} ${grant.funding.typicalAward.toLocaleString()}`
    : "Varies";

  return (
    <div className="rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold border ${verBadge.className}`}
              title="Verified authentic opportunity with confirmable online source."
            >
              {verBadge.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono border ${tierBadge.className}`}
            >
              {tierBadge.label}
            </span>
          </div>

          {/* Match Score Badge */}
          <div
            className={`rounded-full px-2.5 py-1 text-xs font-mono font-bold border shadow-xs ${
              matchScore >= 85
                ? "bg-emerald-500 text-white border-emerald-600"
                : matchScore >= 70
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-stone-500 text-white border-stone-600"
            }`}
          >
            {matchScore}% Match
          </div>
        </div>

        {/* Title & Funder */}
        <div>
          <span className="text-xs font-medium text-ink-faint uppercase tracking-wider block">
            {grant.funderName}
          </span>
          <h3 className="font-serif text-lg font-bold text-ink hover:text-stamp-dark transition-colors line-clamp-2 mt-0.5">
            {grant.grantName}
          </h3>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-paper/60 p-3 text-xs border border-paper-line/60">
          <div>
            <span className="text-ink-faint block text-[10px] uppercase font-mono">Award Size</span>
            <span className="font-semibold text-ink">{formattedAmount}</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px] uppercase font-mono">Deadline</span>
            <span className="font-semibold text-ink">
              {grant.deadlineType === "rolling" ? "Rolling Window" : grant.deadline}
            </span>
          </div>
        </div>

        {/* Why You Match Snippet (Specification §7) */}
        <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-2.5 text-xs text-emerald-950 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
            <span>✨</span>
            <span>Why You Match: <em className="font-mono text-[11px] not-italic text-emerald-800 font-bold">{whyYouMatchSummary}</em></span>
          </div>
          <p className="text-[11px] text-emerald-900/90 leading-relaxed line-clamp-2">
            {relevanceExplanation}
          </p>
        </div>

        {/* Potential Issues to Fix (Specification §8) */}
        {potentialIssuesToFix && potentialIssuesToFix.length > 0 && (
          <div className="rounded-lg bg-amber-50/60 border border-amber-200/80 p-2.5 text-xs text-amber-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1 text-[11px] text-amber-900">
                <span>⚠️</span>
                <span>To Fix Before Applying ({potentialIssuesToFix.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowWeaknessDetails(!showWeaknessDetails)}
                className="text-[10px] underline font-semibold text-amber-800 hover:text-amber-950"
              >
                {showWeaknessDetails ? "Hide" : "View"}
              </button>
            </div>
            {showWeaknessDetails ? (
              <ul className="list-disc pl-4 text-[11px] space-y-1 text-amber-900 pt-1">
                {potentialIssuesToFix.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-amber-900/90 line-clamp-1 italic">
                {potentialIssuesToFix[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Footer & Source Chain (Specification §5, §6) */}
      <div className="space-y-3 pt-3 border-t border-paper-line/70">
        {/* Source Chain Links */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft">
          <span className="text-[10px] text-ink-faint font-mono uppercase">Source Chain:</span>
          {grant.originalUrl && (
            <a
              href={grant.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stamp-dark hover:underline flex items-center gap-0.5"
              title="Discovery Source: OpportunitySquare / Instrumentl / Portal"
            >
              <span>{grant.originalSource || "Discovery Source"}</span>
              <span>↗</span>
            </a>
          )}
          {grant.funderUrl && (
            <a
              href={grant.funderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stamp-dark hover:underline flex items-center gap-0.5"
              title="Official Funder Website"
            >
              <span>Funder Home</span>
              <span>↗</span>
            </a>
          )}
          {grant.applicationUrl && (
            <a
              href={grant.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
              title="Direct Application Portal"
            >
              <span>Apply Link</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenIntelligence?.(grant)}
            className="flex-1 rounded-lg bg-stamp-dark px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-colors text-center shadow-xs"
          >
            Grant Intelligence &amp; Checklist &rarr;
          </button>

          {onSaveToTracker && (
            <button
              type="button"
              onClick={() => onSaveToTracker(grant)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold border transition-all ${
                isSaved
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-paper border-paper-line text-ink-soft hover:text-ink hover:border-ink/40"
              }`}
            >
              {isSaved ? "✓ In Tracker" : "+ Track"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
