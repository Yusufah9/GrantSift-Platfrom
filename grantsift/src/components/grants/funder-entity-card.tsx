"use client";

import Link from "next/link";
import type { FunderEntity } from "@/lib/types/grant-discovery";

interface FunderCardProps {
  funder: FunderEntity;
  onMatch?: (funder: FunderEntity) => void;
}

export function FunderEntityCard({ funder, onMatch }: FunderCardProps) {
  const formatTypicalSize = () => {
    const { min, max, currency } = funder.typicalGrantSize;
    if (min && max) {
      if (min === max) return `${currency} ${min.toLocaleString()}`;
      return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
    }
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return "Various award sizes";
  };

  return (
    <div className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm hover:border-ink/20 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span className="font-semibold text-ink-soft uppercase tracking-wide">{funder.funderType}</span>
              <span>&bull;</span>
              <span>HQ: {funder.headquartersCountry}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-ink mt-0.5">{funder.name}</h3>
          </div>
          <span className="rounded-full bg-stamp/10 px-2.5 py-0.5 text-xs font-semibold text-stamp-dark shrink-0">
            {funder.openOpportunitiesCount} {funder.openOpportunitiesCount === 1 ? "Open Call" : "Open Calls"}
          </span>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">{funder.description}</p>

        <div className="grid grid-cols-2 gap-3 py-2 border-y border-paper-line text-xs">
          <div>
            <span className="text-ink-faint block">Typical Grant Range</span>
            <span className="font-semibold text-ink">{formatTypicalSize()}</span>
          </div>
          <div>
            <span className="text-ink-faint block">Target Geographies</span>
            <span className="font-semibold text-ink truncate block">
              {funder.focusGeographies.join(", ")}
            </span>
          </div>
        </div>

        {/* Giving Preferences & Sectors */}
        <div className="space-y-1.5 text-xs">
          <div>
            <span className="text-ink-faint font-medium">Focus Sectors: </span>
            <span className="text-ink-soft">{funder.focusSectors.join(", ")}</span>
          </div>
          {funder.historicalGivingSummary && (
            <p className="text-xs text-ink-faint italic line-clamp-1">
              &ldquo;{funder.historicalGivingSummary}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between gap-2 border-t border-paper-line/60">
        <div className="flex items-center gap-2">
          {onMatch && (
            <button
              type="button"
              onClick={() => onMatch(funder)}
              className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink hover:border-ink/30 transition-all"
            >
              Match to Project
            </button>
          )}
          <a
            href={funder.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-paper px-3 py-1.5 text-xs font-semibold border border-paper-line text-ink-soft hover:text-ink hover:border-ink/30 transition-all"
          >
            Website &nearr;
          </a>
        </div>

        <Link
          href={`/workspace?tab=research&mode=funder_research&q=${encodeURIComponent(funder.name)}`}
          className="rounded bg-stamp-dark px-3.5 py-1.5 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
        >
          Research Funder &rarr;
        </Link>
      </div>
    </div>
  );
}
