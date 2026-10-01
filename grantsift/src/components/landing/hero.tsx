"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClayStage, Cube, Ring, Slab, Sphere } from "./clay-scene";

const EXAMPLES = [
  "A climate research grant for a Nigerian university lab",
  "Seed funding for a Kenyan health tech startup",
  "A donor guideline I need explained in plain words",
  "Funders for a women led agriculture NGO in Ghana",
];
const CHIPS = ["Find funders", "Check eligibility", "Plan my application"];
const WHO = ["Founders", "Researchers", "NGOs", "Universities", "Grant offices", "Development agencies", "Grant writers"];

export function Hero() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [ph, setPh] = useState("");

  useEffect(() => {
    let i = 0, c = 0, dir = 1;
    const id = setInterval(() => {
      const s = EXAMPLES[i] ?? "";
      c += dir;
      setPh(s.slice(0, c));
      if (c >= s.length + 14) dir = -1;
      if (c <= 0) { dir = 1; i = (i + 1) % EXAMPLES.length; }
    }, 55);
    return () => clearInterval(id);
  }, []);

  const submit = () => {
    if (typeof window !== "undefined" && text.trim()) {
      try {
        sessionStorage.setItem("grantsift_initial_prompt", text.trim());
      } catch {}
    }
    router.push(`/signup${text.trim() ? `?q=${encodeURIComponent(text.trim())}` : ""}`);
  };

  return (
    <section className="px-3 pt-3 md:px-5">
      <ClayStage
        className="mx-auto min-h-[640px] max-w-[1400px] rounded-[44px] md:min-h-[720px]"
        items={[
          { node: <Cube size={150} tone="milk" />, x: "58%", y: "12%", depth: 26, float: true },
          { node: <Sphere size={110} tone="ink" />, x: "12%", y: "14%", depth: 40, float: true },
          { node: <Ring size={150} tone="ink" />, x: "76%", y: "34%", depth: 18 },
          { node: <Slab w={260} h={58} tone="milk" />, x: "30%", y: "42%", depth: 14 },
          { node: <Sphere size={54} tone="milk" />, x: "44%", y: "30%", depth: 52 },
          { node: <Sphere size={34} tone="ink" />, x: "90%", y: "14%", depth: 34 },
        ]}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 0%, #fbfaf6 0%, #ebe8de 60%, #dcd8cb 100%)" }} />
        <div aria-hidden className="absolute -bottom-40 left-[-10%] right-[-10%] h-[70%] rounded-[50%] bg-ink" />
        <div className="relative z-10 flex min-h-[640px] flex-col justify-end gap-8 p-6 pb-10 md:min-h-[720px] md:flex-row md:items-end md:justify-between md:p-14">
          <h1 className="display max-w-[11ch] text-[clamp(3.2rem,9vw,8.2rem)] !text-paper">
            Grants, finally in focus.
          </h1>
          <div className="max-w-sm md:pb-3">
            <p className="text-lg leading-snug text-paper/80">
              One place to find funders, understand their rules, and plan every step of the application.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/signup" className="btn-milk justify-between">Analyze a funder <span aria-hidden>→</span></Link>
              <Link href="#how-it-works" className="btn-milk justify-between">See how it works <span aria-hidden>→</span></Link>
            </div>
          </div>
        </div>
      </ClayStage>

      <div className="mx-auto max-w-4xl px-3 pt-16 text-center">
        <p className="text-lg text-ink-soft">
          Made for the people who keep Africa&apos;s social, scientific and entrepreneurial work funded.
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {WHO.map((w) => (
            <li key={w} className="rounded-full bg-paper-raised px-5 py-2.5 text-sm font-medium">{w}</li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-3xl px-3 pb-24 pt-24 text-center">
        <h2 className="display text-4xl md:text-6xl">What are you applying for?</h2>
        <div className="clay-card mt-10 p-4 text-left">
          <label htmlFor="ask" className="sr-only">Describe the grant you want</label>
          <textarea
            id="ask"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={ph}
            rows={4}
            className="w-full resize-none bg-transparent p-3 text-lg outline-none placeholder:text-ink-faint"
          />
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="px-3 text-sm text-ink-faint">Press Enter to start</span>
            <button type="button" onClick={submit} className="btn-ink">Start</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <button key={c} type="button" onClick={() => setText(c + ": ")} className="rounded-full bg-paper-raised px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper">
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

