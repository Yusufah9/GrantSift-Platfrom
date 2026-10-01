"use client";

import { useState } from "react";
import Link from "next/link";
import { Sphere } from "./clay-scene";

const STAGES = [
  { n: "Funder", d: "The official page and requirements are read and stored." },
  { n: "Evidence", d: "Public interviews with past winners are found and summarized." },
  { n: "Readiness", d: "Your profile is compared with every requirement." },
  { n: "SOP", d: "Gaps and tips become tasks with owners and dates." },
  { n: "Workbook", d: "Everything exports to a single Excel file." },
];

export function InfraPanel() {
  const [i, setI] = useState(0);
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
      <div className="grid gap-8 md:grid-cols-2 md:items-end">
        <h2 className="display text-4xl md:text-6xl">One trail from first search to final workbook.</h2>
        <div>
          <p className="max-w-md text-lg text-ink-soft">Every funder you analyze moves through the same five stages, so your team always knows what is done and what is next.</p>
          <Link href="/signup" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Start free</Link>
        </div>
      </div>
      <div className="relative mt-12 overflow-hidden rounded-[36px] p-6 md:p-12" style={{ background: "linear-gradient(180deg,#f6f4ee 0%,#f6f4ee 45%,#d9d5c8 45%,#cfcabc 100%)" }}>
        <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-[34%] hidden h-24 w-full md:block">
          <path d="M0 60 C 150 0, 250 120, 400 60 S 650 0, 800 60 S 950 90, 1000 60" fill="none" stroke="#bdb8a8" strokeWidth="26" strokeLinecap="round" />
          <path d="M0 52 C 150 -8, 250 112, 400 52 S 650 -8, 800 52 S 950 82, 1000 52" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <ol className="relative grid gap-3 md:grid-cols-5">
          {STAGES.map((s, n) => (
            <li key={s.n} className="md:pt-8">
              <button type="button" onClick={() => setI(n)} aria-pressed={n === i} className="group flex w-full flex-row items-center gap-4 md:flex-col md:gap-5">
                <span className={`transition-transform duration-300 ${n === i ? "scale-110" : "group-hover:scale-105"}`}>
                  <Sphere size={n === i ? 88 : 72} tone={n <= i ? "ink" : "milk"} />
                </span>
                <span className={`text-lg font-semibold ${n === i ? "text-ink" : "text-ink-soft"}`}>{s.n}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="relative mt-10 max-w-md text-xl font-medium leading-snug md:mt-16" aria-live="polite">{STAGES[i]!.d}</p>
      </div>
    </section>
  );
}

