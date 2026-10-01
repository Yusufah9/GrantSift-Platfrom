import { cn } from "@/lib/cn";

const STYLES = {
  official_funder: "text-ledger border-ledger bg-ledger/5",
  government: "text-ledger border-ledger bg-ledger/5",
  institution: "text-ink-soft border-ink-soft bg-ink-soft/5",
  expert_source: "text-stamp-dark border-stamp bg-stamp/5",
  ai_synthesis: "text-ink-faint border-ink-faint bg-ink-faint/5",
  user_provided: "text-ink-soft border-ink-soft bg-ink-soft/5",
} as const;

const LABELS: Record<keyof typeof STYLES, string> = {
  official_funder: "Official funder",
  government: "Government",
  institution: "Institution",
  expert_source: "Expert source",
  ai_synthesis: "AI synthesis",
  user_provided: "User provided",
};

export function SourceBadge({ kind }: { kind: keyof typeof STYLES }) {
  return (
    <span className={cn("stamp-badge", STYLES[kind])}>
      {LABELS[kind]}
    </span>
  );
}

