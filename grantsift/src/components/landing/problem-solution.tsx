"use client";

import { useState } from "react";
import Link from "next/link";
import { ClayStage, Ring, Slab, Sphere } from "./clay-scene";

const PAINS = [
  {
    key: "Scattered",
    pain: "Opportunities live in newsletters, funder portals, group chats and other people's inboxes. By the time you hear about one, the deadline is close.",
    fix: "GrantSift starts from the funder you name and gathers what is public about it into one place.",
  },
  {
    key: "Fragmented",
    pain: "Every donor words eligibility, priorities and reporting differently. Teams rebuild the same checklist from scratch for each call.",
    fix: "Requirements are read once and turned into a single checklist you can reuse and share.",
  },
  {
    key: "Opaque",
    pain: "Rejections rarely explain why. Small organizations are left guessing what a winning application looks like.",
    fix: "GrantSift pulls concrete tips from people who have won, and labels every source so you can judge it.",
  },
  {
    key: "Complex",
    pain: "Long guidelines, formal English, budget templates and reporting rules. Strong work gets lost in the paperwork.",
    fix: "Dense guidance becomes plain tasks with owners and dates, ready to hand to your team.",
  },
  {
    key: "Out of reach",
    pain: "Professional grant writers cost money many grassroots groups do not have, so funding drifts toward the best networked.",
    fix: "A repeatable workflow puts the same rigor in the hands of a first time founder and a seasoned writer.",
  },
];

export function ProblemSolution() {
  const [i, setI] = useState(0);
  const p = PAINS[i]!;
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-end">
        <h2 className="display text-5xl md:text-7xl">We know how hard grant funding is to secure in Africa.</h2>
        <p className="max-w-md text-lg text-ink-soft">
          Founders, researchers, NGOs and grant offices tell the same story. The money exists. Finding it, reading it
          and proving you qualify is what wears people down.
        </p>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-[320px_1fr]">
        <div role="tablist" aria-label="Grant funding pain points" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {PAINS.map((x, n) => (
            <button
              key={x.key}
              role="tab"
              aria-selected={n === i}
              onClick={() => setI(n)}
              className={`shrink-0 rounded-full px-6 py-4 text-left text-lg font-semibold transition-colors ${n === i ? "bg-ink text-paper" : "bg-paper-raised text-ink hover:bg-paper-line"}`}
            >
              {x.key}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="grid overflow-hidden rounded-[32px] bg-paper-raised md:grid-cols-2">
          <div className="flex flex-col justify-between gap-10 p-8 md:p-10">
            <div>
              <p className="text-sm font-semibold text-ink-faint">What it feels like</p>
              <p className="mt-3 text-2xl font-medium leading-snug">{p.pain}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-faint">What GrantSift does</p>
              <p className="mt-3 text-lg leading-snug text-ink-soft">{p.fix}</p>
              <Link href="/signup" className="btn-ink mt-6">Try it on a funder</Link>
            </div>
          </div>
          <ClayStage
            className="min-h-[320px] bg-ink"
            items={[
              { node: <Sphere size={90} tone="milk" />, x: `${10 + i * 6}%`, y: "14%", depth: 34, float: true },
              { node: <Ring size={120} tone="milk" />, x: "52%", y: "46%", depth: 20 },
              { node: <Slab w={170} h={46} tone="milk" />, x: "14%", y: "68%", depth: 12 },
              { node: <Sphere size={38} tone="milk" />, x: "78%", y: "12%", depth: 46 },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

