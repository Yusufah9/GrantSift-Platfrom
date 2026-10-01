"use client";

import { useState } from "react";

const GROUPS = [
  { label: "Applicants", items: [
    { n: "Early stage founders", d: "Learn what a grant really expects beyond the pitch deck and what to prepare first." },
    { n: "Social entrepreneurs", d: "Match your mission to funders who care about it and describe your impact in their terms." },
    { n: "Researchers", d: "Read a research call once, check institutional requirements, and keep every source traceable." },
    { n: "Nonprofits and NGOs", d: "Show governance and monitoring capacity with evidence a donor can verify." },
    { n: "Universities", d: "Give faculty one clear way to check eligibility and prepare across departments." },
  ] },
  { label: "Managers", items: [
    { n: "Grant management offices", d: "Run every team on the same checklist, plan and export across a whole portfolio." },
    { n: "Development agencies", d: "See readiness across many grantees at once and where support is needed." },
    { n: "Seasoned grant writers", d: "Keep each client's requirements and sources in one place and stop rebuilding checklists." },
  ] },
];
const VOICES = [
  { text: "Small organizations often start with a strong idea but lack the capacity to meet donor requirements, so they stall before funding arrives.", src: "fundsforNGOs on African NGOs" },
  { text: "Local conservation groups described proposal and reporting demands as heavy, and many asked for more flexible funding.", src: "Maliasili and Synchronicity Earth research, 2022" },
  { text: "Grassroots groups in Kenya worried that English only proposals and writers' fees would keep them away from donor money.", src: "ICIJ reporting" },
  { text: "Community groups in South Africa grew their funding faster than their capacity to manage it, and a donor change could end a small organization.", src: "The New Humanitarian" },
];

export function SolutionsGrid() {
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const [v, setV] = useState(0);
  const cur = GROUPS[sel[0]]!.items[sel[1]]!;
  return (
    <>
      <section id="solutions" className="mx-auto max-w-6xl overflow-hidden px-6 py-24 md:py-32">
        <h2 className="display max-w-xl text-4xl md:text-6xl">At the intersection of applying and managing</h2>
        <p className="mt-8 max-w-2xl text-lg text-ink-soft md:ml-[10%]">
          Applicants need clarity on what a funder wants. Managers need every application to follow the same standard. GrantSift serves both with one set of sources and one plan.
        </p>
        <div className="relative mt-16">
          <div aria-hidden className="absolute left-1/2 top-1/2 hidden aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/25 md:block" />
          <div aria-hidden className="absolute left-1/2 top-1/2 hidden aspect-square w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/25 md:block" />
          <div className="relative grid gap-10 md:grid-cols-[1fr_1fr] md:py-20">
            {GROUPS.map((g, gi) => (
              <div key={g.label} className={gi ? "md:pl-16" : "md:pr-16 md:text-right"}>
                <p className="text-xl font-bold">{g.label}</p>
                <ul className={`mt-5 flex flex-wrap gap-3 ${gi ? "" : "md:justify-end"}`}>
                  {g.items.map((it, ii) => (
                    <li key={it.n}>
                      <button type="button" aria-pressed={sel[0] === gi && sel[1] === ii} onClick={() => setSel([gi, ii])}
                        className={`rounded-full border px-5 py-2.5 text-base font-medium transition-all ${sel[0] === gi && sel[1] === ii ? "border-ink bg-ink text-paper" : "border-ink bg-paper hover:-translate-y-0.5"}`}>
                        {it.n}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-xl font-medium leading-snug" aria-live="polite">{cur.d}</p>
      </section>

      <section className="bg-paper-raised py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-4xl md:text-6xl">What grant seekers across Africa say</h2>
          <div className="mt-12 flex items-center justify-between text-sm font-semibold">
            <span>{v + 1} / {VOICES.length}</span>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous" onClick={() => setV((v + VOICES.length - 1) % VOICES.length)} className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink">←</button>
              <button type="button" aria-label="Next" onClick={() => setV((v + 1) % VOICES.length)} className="h-11 w-11 rounded-full border border-ink/20 hover:border-ink">→</button>
            </div>
          </div>
          <blockquote className="mt-8 min-h-[11rem]" aria-live="polite">
            <p className="text-2xl font-medium leading-snug md:text-3xl">{VOICES[v]!.text}</p>
            <footer className="mt-6 text-base text-ink-faint">Summarized from {VOICES[v]!.src}</footer>
          </blockquote>
        </div>
      </section>
    </>
  );
}

