import Link from "next/link";
import { ClayStage, Cube, Ring, Slab, Sphere } from "./clay-scene";

const ROWS = [
  {
    tag: "Source", a: "Start with the funder.", b: " GrantSift reads it for you.",
    body: "Paste the funder's official page, or paste the requirements yourself. GrantSift extracts eligibility, priorities and deadlines into a single record you can check.",
    fact: "Official pages are labelled as official, so you always know what the funder actually said.",
    items: [{ node: <Ring size={180} tone="ink" />, x: "26%", y: "20%", depth: 22 }, { node: <Slab w={150} h={30} tone="ink" rot={-38} />, x: "52%", y: "58%", depth: 14 }, { node: <Sphere size={56} tone="milk" />, x: "62%", y: "22%", depth: 44, float: true }],
  },
  {
    tag: "Evidence", a: "Learn from people who won,", b: " in their own words.",
    body: "GrantSift searches public interviews where founders and organizations explain how they secured a grant, then pulls out concrete tips and keeps the link back to each one.",
    fact: "Tips from experts are separated from official requirements, never mixed in.",
    items: [{ node: <Cube size={140} tone="milk" />, x: "32%", y: "24%", depth: 22 }, { node: <Sphere size={46} tone="ink" />, x: "72%", y: "14%", depth: 40 }],
  },
  {
    tag: "Readiness", a: "Check your organization", b: " against the real requirements.",
    body: "Tell GrantSift about your team, registration, track record and finances once. Each requirement is compared with your profile and marked Ready, Needs evidence or Missing.",
    fact: "The check stays honest. A gap is shown as a gap.",
    items: [{ node: <Slab w={230} h={54} tone="ink" />, x: "20%", y: "58%", depth: 14 }, { node: <Slab w={190} h={54} tone="milk" />, x: "32%", y: "38%", depth: 22 }, { node: <Sphere size={66} tone="ink" />, x: "66%", y: "16%", depth: 38, float: true }],
  },
  {
    tag: "Plan", a: "Turn guidance into tasks", b: " with owners and dates.",
    body: "Get a step by step application plan and a workbook that covers eligibility, documents, budget and timeline. Export it and share it with your team the same day.",
    fact: "One file, built from your own sources and your own answers.",
    items: [{ node: <Sphere size={120} tone="milk" />, x: "24%", y: "26%", depth: 26 }, { node: <Ring size={110} tone="ink" />, x: "54%", y: "48%", depth: 16 }, { node: <Sphere size={36} tone="ink" />, x: "78%", y: "18%", depth: 48 }],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl space-y-24 px-6 py-24 md:space-y-32 md:py-32">
      {ROWS.map((r, i) => (
        <div key={r.tag} className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-paper-raised px-4 py-1.5 text-sm font-medium"><span aria-hidden className="h-2 w-2 rounded-full bg-ink" />{r.tag}</span>
            <h2 className="display mt-6 text-4xl md:text-6xl">{r.a}<span className="text-ink-faint">{r.b}</span></h2>
            <p className="mt-6 max-w-md text-lg text-ink-soft">{r.body}</p>
            <p className="mt-6 max-w-sm border-l-2 border-ink pl-4 text-sm text-ink-soft">{r.fact}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-semibold">
              <Link href="/signup" className="btn-ink">Start free</Link>
              <Link href="/about" className="underline underline-offset-4">How GrantSift works</Link>
            </div>
          </div>
          <ClayStage className="aspect-[4/4.2] rounded-[36px]" items={r.items}>
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg,#f6f4ee 0%,#f6f4ee 40%,#e0dccf 40%,#d3cfc1 100%)" }} />
          </ClayStage>
        </div>
      ))}
    </section>
  );
}

