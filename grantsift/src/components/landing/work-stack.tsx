import Link from "next/link";
import { Cube, Ring, Slab, Sphere } from "./clay-scene";

const Frame = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[32px] ${className}`}>{children}</div>
);

function Dashboard() {
  const bars = [78, 62, 44, 30, 18];
  return (
    <Frame className="bg-gradient-to-br from-paper-line to-paper-raised">
      <div className="absolute left-[9%] top-[14%] flex h-[90%] w-[92%] overflow-hidden rounded-3xl bg-paper-raised shadow-xl">
        <div className="w-14 bg-ink" />
        <div className="flex-1 p-5">
          <p className="text-2xl font-semibold tracking-tight">Dashboard</p>
          <div className="mt-4 grid grid-cols-[120px_1fr] gap-4">
            <div className="grid place-items-center rounded-2xl bg-paper p-3">
              <svg viewBox="0 0 36 36" className="h-24 w-24"><circle cx="18" cy="18" r="15" fill="none" stroke="#e3e0d6" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeDasharray="62 100" strokeLinecap="round" transform="rotate(-90 18 18)" /><text x="18" y="20" textAnchor="middle" fontSize="8" fontWeight="700">12</text></svg>
              <p className="text-xs text-ink-soft">Funders</p>
            </div>
            <div className="space-y-2 rounded-2xl bg-paper p-4 text-xs">
              {["West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"].map((l, n) => (
                <div key={l} className="flex items-center gap-2"><span className="w-24 text-ink-soft">{l}</span><span className="h-1.5 rounded-full bg-ink" style={{ width: `${bars[n]}%` }} /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Wordmark() {
  return (
    <Frame className="bg-ink">
      <div className="absolute inset-0 grid place-items-center"><span className="display text-[22vw] !text-paper md:text-[9rem]">Sift</span></div>
      <div className="absolute left-[12%] top-[18%]"><Sphere size={70} tone="milk" /></div>
      <div className="absolute bottom-[14%] right-[14%]"><Ring size={96} tone="milk" /></div>
    </Frame>
  );
}

function Posters() {
  const P = ({ bg, fg, t, tag }: { bg: string; fg: string; t: string; tag: string }) => (
    <div className="flex h-full flex-1 flex-col justify-between rounded-2xl p-4" style={{ background: bg, color: fg }}>
      <span className="text-xs font-semibold opacity-70">{tag}</span>
      <p className="text-xl font-bold leading-tight tracking-tight md:text-2xl">{t}</p>
    </div>
  );
  return (
    <Frame className="bg-[#7a8a78]/0 bg-gradient-to-b from-paper-line to-paper">
      <div className="absolute inset-x-[7%] inset-y-[10%] flex gap-3">
        <P bg="#faf8f3" fg="#0a0a0a" t="Official funder" tag="Source label" />
        <P bg="#0a0a0a" fg="#faf8f3" t="Expert source" tag="Source label" />
        <P bg="#e3e0d6" fg="#0a0a0a" t="AI synthesis" tag="Source label" />
      </div>
    </Frame>
  );
}

function Report() {
  return (
    <Frame className="bg-gradient-to-br from-paper-line via-paper to-paper-line">
      <div className="absolute inset-x-[10%] inset-y-[12%] rounded-3xl border border-white/80 bg-paper-raised/70 p-6 shadow-xl backdrop-blur">
        <p className="display text-3xl md:text-4xl">Know where you stand.</p>
        <div className="mt-5 space-y-2">
          {[["Registration", "Ready"], ["Audited accounts", "Missing"], ["Governance", "Needs evidence"]].map(([a, b]) => (
            <div key={a} className="flex items-center justify-between rounded-full bg-paper px-4 py-2 text-sm"><span>{a}</span><span className="font-semibold">{b}</span></div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function Phone() {
  return (
    <Frame className="bg-ink">
      <div className="absolute left-1/2 top-[8%] h-[110%] w-[44%] -translate-x-1/2 rotate-[-12deg] rounded-[2.2rem] border-[7px] border-[#2a2a28] bg-paper-raised p-4 shadow-2xl">
        <p className="text-xs font-semibold text-ink-faint">Application plan</p>
        <p className="mt-2 text-lg font-bold leading-tight">What do I need to submit?</p>
        {["Collect registration papers", "Draft the budget", "Request two reference letters"].map((t) => (
          <p key={t} className="mt-2 rounded-xl bg-paper px-3 py-2 text-xs font-medium">{t}</p>
        ))}
      </div>
    </Frame>
  );
}

function Stones() {
  return (
    <Frame className="bg-gradient-to-b from-[#8a877f] to-[#efece3]">
      <div className="absolute left-1/2 top-[18%] h-[34%] w-[46%] -translate-x-1/2 rounded-[50%_50%_42%_42%] bg-[radial-gradient(circle_at_40%_30%,#fff,#e8e4d6_70%)] shadow-lg" />
      <div className="absolute left-1/2 top-[48%] h-[30%] w-[46%] -translate-x-1/2 rounded-[10%_10%_50%_50%] bg-[radial-gradient(circle_at_40%_30%,#3a3a38,#0a0a0a_75%)]" />
    </Frame>
  );
}

const WORKS = [
  { t: "Project dashboard", d: "Every funder and every application in one view, with status at a glance.", v: <Dashboard /> },
  { t: "Funder analysis", d: "Paste a funder page and get its eligibility, priorities and deadlines in a clean record.", v: <Wordmark /> },
  { t: "Source labels", d: "Official, expert and AI generated information is always marked, never blended.", v: <Posters /> },
  { t: "Readiness report", d: "A plain list of what is ready, what needs evidence and what is missing.", v: <Report /> },
  { t: "Plan on your phone", d: "Tasks, owners and dates stay usable between meetings and on weak connections.", v: <Phone /> },
  { t: "Excel workbook", d: "Eligibility, documents, budget and timeline in one file your whole team can open.", v: <Stones /> },
];

export function WorkStack() {
  return (
    <section id="product-tour" className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
      <div className="flex items-end justify-between gap-6">
        <h2 className="display max-w-md text-4xl md:text-6xl">For teams with real deadlines</h2>
        <Link href="/signup" className="shrink-0 text-sm font-semibold underline underline-offset-4">Try GrantSift</Link>
      </div>
      <p className="mt-8 max-w-2xl text-lg text-ink-soft md:ml-[10%]">
        We work with founders, researchers, nonprofits and grant offices at every stage, from a first application to a portfolio of dozens. These are the parts of the product they use most.
      </p>
      <div className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-2">
        {WORKS.map((w) => (
          <article key={w.t}>
            {w.v}
            <h3 className="mt-5 text-3xl font-bold tracking-tight">{w.t}</h3>
            <p className="mt-2 max-w-md text-ink-soft">{w.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

