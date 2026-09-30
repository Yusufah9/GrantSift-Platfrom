import type { Database } from "@/lib/supabase/database.types";
import { SourceBadge } from "@/components/ui/source-badge";

type Insight = Database["public"]["Tables"]["insights"]["Row"];

const CATEGORY_LABELS: Record<string, string> = {
  eligibility: "Eligibility",
  document_requirement: "Required documents",
  budget_tip: "Budget",
  narrative_tip: "Narrative",
  process_tip: "Process",
  red_flag: "Red flags",
};

export function InsightsList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return <p className="text-sm text-ink-faint">No insights yet. Run analysis to extract some.</p>;
  }

  const grouped = new Map<string, Insight[]>();
  for (const insight of insights) {
    const list = grouped.get(insight.category) ?? [];
    list.push(insight);
    grouped.set(insight.category, list);
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <ul className="mt-3 space-y-3">
            {items.map((insight) => (
              <li key={insight.id} className="border border-paper-line bg-paper-raised p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-ink">{insight.claim}</p>
                  <SourceBadge kind={insight.trust} />
                </div>
                {insight.evidence_excerpt && (
                  <p className="mt-2 text-xs italic text-ink-faint">&ldquo;{insight.evidence_excerpt}&rdquo;</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
