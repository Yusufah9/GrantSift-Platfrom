import { SourceBadge } from "@/components/ui/source-badge";

const Tile = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`clay-card flex flex-col justify-between p-6 ${className}`}>{children}</div>
);

export function TrustBento() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <p className="mx-auto max-w-xl text-center text-lg text-ink-soft">
        Made for grant teams of every size. Shaped by the people who write, review and report on applications. Built with care.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile className="col-span-2 min-h-[150px]">
          <p className="text-lg font-medium leading-snug">Nothing is marked ready unless you or a source said something that backs it up.</p>
          <p className="mt-4 text-sm text-ink-faint">How readiness works</p>
        </Tile>
        <Tile>
          <p className="display text-5xl">6</p>
          <p className="text-sm text-ink-soft">source labels on every claim</p>
        </Tile>
        <Tile>
          <p className="display text-5xl">5</p>
          <p className="text-sm text-ink-soft">stages from funder to workbook</p>
        </Tile>
        <Tile className="col-span-2 min-h-[150px]">
          <p className="text-sm font-semibold text-ink-faint">Every claim carries a label</p>
          <div className="mt-4 flex flex-wrap gap-2"><SourceBadge kind="official_funder" /><SourceBadge kind="expert_source" /><SourceBadge kind="ai_synthesis" /></div>
        </Tile>
        <Tile className="bg-ink text-paper">
          <p className="display text-4xl !text-paper">.xlsx</p>
          <p className="text-sm text-paper/70">a workbook your team can open today</p>
        </Tile>
        <Tile>
          <p className="display text-4xl">Plain</p>
          <p className="text-sm text-ink-soft">tasks, owners and dates instead of dense guidelines</p>
        </Tile>
      </div>
    </section>
  );
}

