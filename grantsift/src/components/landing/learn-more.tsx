import Link from "next/link";
import { ClayStage, Cube, Ring, Slab, Sphere } from "./clay-scene";

const Card = ({ href, tag, title, cta, className = "", art }: { href: string; tag: string; title: string; cta: string; className?: string; art?: React.ReactNode }) => (
  <Link href={href} className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-paper-raised p-6 transition-transform hover:-translate-y-1 ${className}`}>
    {art}
    <span className="relative text-sm font-medium text-ink-faint">{tag}</span>
    <span className="relative mt-16 block">
      <span className="block text-2xl font-semibold leading-tight tracking-tight">{title}</span>
      <span className="mt-4 block text-sm font-semibold underline underline-offset-4">{cta}</span>
    </span>
  </Link>
);

export function LearnMore() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
      <h2 className="display mx-auto max-w-2xl text-center text-4xl md:text-6xl">Learn more about grant funding in Africa</h2>
      <div className="mt-12 grid gap-3 md:grid-cols-3">
        <Card href="/blog" tag="Blog" title="Guides on finding, reading and winning grants" cta="Read the blog" className="min-h-[340px] bg-ink text-paper md:row-span-2"
          art={<ClayStage className="absolute inset-0" items={[{ node: <Cube size={110} tone="milk" />, x: "52%", y: "10%", depth: 20 }, { node: <Sphere size={50} tone="milk" />, x: "14%", y: "30%", depth: 36 }]} />} />
        <Card href="/about" tag="About" title="Why we built GrantSift for this region" cta="Read our story" className="min-h-[200px]"
          art={<div className="absolute -right-6 -top-6"><Ring size={120} tone="ink" /></div>} />
        <Card href="/signup" tag="Get started" title="Analyze your first funder for free" cta="Start free" className="min-h-[200px]"
          art={<div className="absolute -right-4 top-4"><Slab w={150} h={44} tone="milk" rot={-12} /></div>} />
        <Card href="/contact" tag="Talk to us" title="Running a grant office or accelerator? Let's plan it together" cta="Contact us" className="min-h-[200px] md:col-span-2" />
      </div>
    </section>
  );
}

