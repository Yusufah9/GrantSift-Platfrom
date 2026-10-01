import Link from "next/link";
import { ClayStage, Cube, Ring, Sphere } from "./clay-scene";

export function CtaBand() {
  return (
    <section className="px-3 md:px-5">
      <ClayStage
        className="mx-auto max-w-[1400px] rounded-[44px] bg-ink"
        items={[
          { node: <Sphere size={96} tone="milk" />, x: "7%", y: "16%", depth: 40, float: true },
          { node: <Cube size={110} tone="milk" />, x: "82%", y: "52%", depth: 24 },
          { node: <Ring size={110} tone="milk" />, x: "70%", y: "8%", depth: 18 },
        ]}
      >
        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
          <h2 className="display text-5xl !text-paper md:text-7xl">Turn your next deadline into a plan.</h2>
          <p className="mt-6 text-lg text-paper/70">Start free. Name a funder and see what it really asks for.</p>
          <Link href="/signup" className="btn-milk mt-8">Analyze a funder</Link>
        </div>
      </ClayStage>
    </section>
  );
}

