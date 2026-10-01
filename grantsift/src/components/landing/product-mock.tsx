"use client";

import { useState } from "react";

const STATES = ["Ready", "Needs evidence", "Missing"] as const;
const ROWS = [
  { req: "Certificate of registration", src: "Official funder", s: 0 },
  { req: "Audited accounts, last two years", src: "Official funder", s: 2 },
  { req: "Board or governance structure", src: "User provided", s: 1 },
  { req: "Evidence of community reach", src: "Expert source", s: 1 },
  { req: "Budget aligned to funder priorities", src: "AI synthesis", s: 2 },
  { req: "Project lead CV", src: "User provided", s: 0 },
];

export function ProductMock() {
  const [rows, setRows] = useState(ROWS);
  const ready = rows.filter((r) => r.s === 0).length;
  const cycle = (i: number) => setRows((rs) => rs.map((r, n) => (n === i ? { ...r, s: (r.s + 1) % 3 } : r)));
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
      <h2 className="display mx-auto max-w-3xl text-center text-4xl md:text-6xl">See the gaps before the funder does.</h2>
      <p className="mx-auto mt-5 max-w-xl text-center text-lg text-ink-soft">Try it. Click any status to see how a readiness check changes as you add evidence.</p>
      <div className="mt-12 grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="clay-card p-6">
          <p className="text-sm font-semibold text-ink-faint">Readiness rule</p>
          <p className="mt-4 text-lg leading-snug">
            A requirement is <b>Ready</b> when your profile or a labelled source supports it. If only a source supports it, it is <b>Needs evidence</b>. Otherwise it is <b>Missing</b>.
          </p>
          <p className="mt-8 text-sm text-ink-faint">Current result</p>
          <p className="display text-6xl" aria-live="polite">{ready} of {rows.length}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(ready / rows.length) * 100}%` }} /></div>
        </div>
        <div className="overflow-hidden rounded-[28px] bg-paper-raised">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-ink/10 px-6 py-4 text-sm font-semibold text-ink-faint md:grid-cols-[1fr_160px_150px]"><span>Requirement</span><span className="hidden md:block">Source</span><span>Status</span></div>
          {rows.map((r, i) => (
            <div key={r.req} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-ink/5 px-6 py-4 text-sm last:border-0 md:grid-cols-[1fr_160px_150px]">
              <span className="font-medium">{r.req}</span>
              <span className="hidden text-ink-soft md:block">{r.src}</span>
              <button type="button" onClick={() => cycle(i)} aria-label={`${r.req}: ${STATES[r.s]}. Click to change`}
                className={`rounded-full px-4 py-2 text-left text-xs font-semibold transition-colors ${r.s === 0 ? "bg-ink text-paper" : r.s === 1 ? "bg-paper-line text-ink" : "border border-ink/30 text-ink-soft"}`}>
                {STATES[r.s]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

