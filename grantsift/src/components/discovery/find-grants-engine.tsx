"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  grantDiscoveryEngine,
  type ContinuousDiscoverySession,
} from "@/lib/services/grant-discovery-engine";
import type { GrantOpportunity } from "@/lib/types/grant-discovery";
import type { ProjectAnalysisProfile } from "@/lib/services/ai-matching-service";
import { GrantCardVerified } from "./grant-card-verified";
import { GrantIntelligenceModal } from "./grant-intelligence-modal";

interface FindGrantsEngineProps {
  organizationProfile?: ProjectAnalysisProfile;
  isPaidUser?: boolean;
}

const SAMPLE_PROMPTS = [
  "Find current non-dilutive funding for my startup.",
  "Find grants available to Nigerian NGOs working on education.",
  "Find grants between $50,000 and $500,000 for African climate startups.",
  "Find women-led agriculture and food security grants.",
];

export function FindGrantsEngine({
  organizationProfile,
  isPaidUser = false,
}: FindGrantsEngineProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<ContinuousDiscoverySession | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedGrantForIntel, setSelectedGrantForIntel] = useState<GrantOpportunity | null>(null);
  const [trackerSavedIds, setTrackerSavedIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const executeDiscovery = useCallback(
    (naturalQuery: string) => {
      startTransition(async () => {
        try {
          const result = await grantDiscoveryEngine.discoverGrants({
            naturalLanguageQuery: naturalQuery,
            organizationProfile,
            isPaidUser,
          });
          setSession(result);
        } catch (err) {
          console.error("Discovery engine query error:", err);
        }
      });
    },
    [organizationProfile, isPaidUser]
  );

  // Initial discovery run on mount
  useEffect(() => {
    executeDiscovery("");
  }, [executeDiscovery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeDiscovery(query);
  };

  const handlePromptClick = (promptText: string) => {
    setQuery(promptText);
    executeDiscovery(promptText);
  };

  const handleSaveToTracker = (grant: GrantOpportunity) => {
    if (!trackerSavedIds.includes(grant.id)) {
      setTrackerSavedIds((prev) => [...prev, grant.id]);
      setSuccessToast(`"${grant.grantName}" added to your application tracker.`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleSelectForProposal = (grant: GrantOpportunity, proposalType: string) => {
    setSelectedGrantForIntel(null);
    try {
      sessionStorage.setItem("grantsift_target_grant", JSON.stringify(grant));
      sessionStorage.setItem("grantsift_target_proposal_type", proposalType);
    } catch {}
    router.push(`/workspace?tab=proposals&grantId=${grant.id}&type=${proposalType}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center justify-between shadow-sm animate-fade-in">
          <span>✓ {successToast}</span>
          <button
            type="button"
            onClick={() => router.push("/tracker")}
            className="underline hover:text-emerald-800"
          >
            Open Tracker &rarr;
          </button>
        </div>
      )}

      {/* Main Search Panel (Specification §2) */}
      <div className="rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
                Permanent Discovery Engine
              </span>
              <span className="text-xs text-ink-faint">
                &bull; Real-time Verification &bull; Multi-Adapter Sourcing
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink mt-1">
              Find Grants Matching Your Organization
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Ask in natural language or search by sector, amount, and country.
            </p>
          </div>

          {/* Continuous Re-matching Trigger Button (Specification §9) */}
          <button
            type="button"
            onClick={() => executeDiscovery(query)}
            disabled={isPending}
            className="rounded-lg bg-paper border border-paper-line hover:border-stamp px-4 py-2 text-xs font-semibold text-ink hover:text-stamp-dark transition-all flex items-center gap-2 shadow-2xs disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{isPending ? "Searching Real Sources..." : "Find New Grants"}</span>
          </button>
        </div>

        {/* Natural Language Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Find grants between $50,000 and $500,000 for African climate startups..."
                className="w-full rounded-xl border border-paper-line bg-paper px-4 py-3 pl-10 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-stamp shadow-inner"
              />
              <span className="absolute left-3.5 top-3.5 text-ink-faint text-sm">🔍</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-stamp-dark px-6 py-3 text-sm font-semibold text-paper hover:bg-stamp transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? "Searching..." : "Search for Grants"}
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts (Specification §2) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-ink-faint uppercase">Try Asking:</span>
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="rounded-full bg-paper px-3 py-1 text-xs text-ink-soft border border-paper-line hover:border-stamp hover:text-stamp-dark transition-all"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Continuous Monitoring & Discovery Summary Strip (Specification §9) */}
      {session && (
        <div className="rounded-xl border border-paper-line bg-paper/60 p-4 text-xs flex flex-wrap items-center justify-between gap-3 text-ink-soft">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-ink-faint font-mono uppercase text-[10px]">Total Opportunities:</span>{" "}
              <strong className="text-ink font-mono">{session.summary.totalOpportunities} Verified</strong>
            </div>
            <div>
              <span className="text-ink-faint font-mono uppercase text-[10px]">New Discoveries:</span>{" "}
              <span className="text-emerald-700 font-bold font-mono">+{session.summary.newOpportunitiesCount} Today</span>
            </div>
            <div>
              <span className="text-ink-faint font-mono uppercase text-[10px]">Recent Changes:</span>{" "}
              <span className="text-amber-800 font-bold font-mono">{session.summary.changedOpportunitiesCount} Detected</span>
            </div>
            <div>
              <span className="text-ink-faint font-mono uppercase text-[10px]">Last Searched:</span>{" "}
              <span className="font-mono text-ink">Just now</span>
            </div>
          </div>

          {session.parsedQueryIntent && Object.keys(session.parsedQueryIntent).length > 0 && (
            <div className="flex items-center gap-1.5 text-stamp-dark font-mono text-[11px] bg-stamp-tint/40 px-2 py-0.5 rounded">
              <span>🎯 Intent:</span>
              <span>
                {[
                  session.parsedQueryIntent.detectedGeography,
                  session.parsedQueryIntent.detectedSector,
                  session.parsedQueryIntent.detectedOrgType,
                  session.parsedQueryIntent.detectedAmountRange
                    ? `$${session.parsedQueryIntent.detectedAmountRange.min?.toLocaleString()}–$${session.parsedQueryIntent.detectedAmountRange.max?.toLocaleString()}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Discovered Grants Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-ink">
            Discovered Funding Opportunities ({session?.matches.length || 0})
          </h3>
          <span className="text-xs text-ink-faint">
            Sorted by multi-dimensional match score &amp; verification confidence
          </span>
        </div>

        {isPending ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-stamp-dark border-t-transparent" />
            <p className="text-xs text-ink-soft">
              Querying OpportunitySquare, Instrumentl, Official Funders, and Web discovery layers...
            </p>
          </div>
        ) : session && session.matches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {session.matches.map((match) => (
              <GrantCardVerified
                key={match.grant.id}
                match={match}
                onOpenIntelligence={(g) => setSelectedGrantForIntel(g)}
                onSaveToTracker={handleSaveToTracker}
                isSaved={trackerSavedIds.includes(match.grant.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-paper-line p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-ink">No grants matched your current filter criteria.</p>
            <p className="text-xs text-ink-soft">Try broadening your search query or selecting a sample prompt.</p>
          </div>
        )}
      </div>

      {/* Grant Intelligence Modal */}
      <GrantIntelligenceModal
        grant={selectedGrantForIntel}
        orgContext={organizationProfile as any}
        isOpen={Boolean(selectedGrantForIntel)}
        onClose={() => setSelectedGrantForIntel(null)}
        onSelectForProposal={handleSelectForProposal}
      />
    </div>
  );
}
