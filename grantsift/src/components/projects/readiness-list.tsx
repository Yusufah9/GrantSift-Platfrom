import type { Database } from "@/lib/supabase/database.types";

type ReadinessItem = Database["public"]["Tables"]["readiness_items"]["Row"];

export function ReadinessList({ items }: { items: ReadinessItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-faint">No readiness check has been run yet.</p>;
  }

  const gaps = items.filter((i) => !i.is_met);
  const met = items.filter((i) => i.is_met);

  return (
    <div className="space-y-8">
      <div className="flex gap-6 font-mono text-xs uppercase tracking-wide text-ink-faint">
        <span className="text-ledger">{met.length} met</span>
        <span className="text-signal-risk">{gaps.length} gaps</span>
      </div>

      {gaps.length > 0 && (
        <ul className="space-y-3">
          {gaps.map((item) => (
            <li key={item.id} className="border-l-2 border-signal-risk bg-signal-risktint/40 p-4">
              <p className="text-sm text-ink">{item.requirement}</p>
              {item.gap_description && <p className="mt-1 text-xs text-signal-risk">{item.gap_description}</p>}
            </li>
          ))}
        </ul>
      )}

      {met.length > 0 && (
        <ul className="space-y-2">
          {met.map((item) => (
            <li key={item.id} className="border-l-2 border-ledger pl-4 text-sm text-ink-soft">
              {item.requirement}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

