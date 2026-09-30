import Link from "next/link";

const STAGES = ["Funder", "Evidence", "Readiness", "SOP", "Workbook"];

export function Hero() {
  return (
    <section className="border-b border-paper-line">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="animate-fade-up font-mono text-xs uppercase tracking-wide text-ink-faint">
          Grant application intelligence
        </p>
        <h1 className="animate-fade-up mt-6 max-w-3xl font-serif text-4xl leading-tight text-ink [animation-delay:80ms] md:text-6xl">
          Turn grant knowledge into a working application system.
        </h1>
        <p className="animate-fade-up mt-6 max-w-xl text-lg text-ink-soft [animation-delay:160ms]">
          Point GrantSift at a funder. It finds what past recipients say about
          winning that grant, checks your organization against the real
          requirements, and builds the workflow and workbook you need to
          apply.
        </p>
        <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 [animation-delay:240ms]">
          <Link
            href="/signup"
            className="bg-ink px-6 py-3 text-sm font-medium text-paper transition-all duration-200 hover:scale-[1.02] hover:bg-stamp-dark"
          >
            Analyze a funder
          </Link>
          <Link
            href="#how-it-works"
            className="border border-ink-soft px-6 py-3 text-sm font-medium text-ink-soft transition-all duration-200 hover:scale-[1.02] hover:border-ink hover:text-ink"
          >
            See how it works
          </Link>
        </div>

        <div className="animate-fade-up mt-20 border border-paper-line bg-paper-raised [animation-delay:320ms]">
          <div className="flex items-center justify-between border-b border-paper-line px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Case file · processing trail
            </span>
            <span className="font-mono text-xs text-ledger">Completed</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-paper-line sm:grid-cols-5">
            {STAGES.map((stage, i) => (
              <div key={stage} className="bg-paper-raised px-5 py-6">
                <span className="font-mono text-xs text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-serif text-base text-ink">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
