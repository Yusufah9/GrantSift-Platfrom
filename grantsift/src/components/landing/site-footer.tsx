import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  { heading: "Product", links: [
    { label: "Analyze a funder", href: "/signup" }, { label: "Grant readiness", href: "/#product" },
    { label: "Application plan", href: "/#how-it-works" }, { label: "Excel export", href: "/#how-it-works" } ] },
  { heading: "Solutions", links: [
    { label: "Founders", href: "/#solutions" }, { label: "Researchers", href: "/#solutions" },
    { label: "NGOs", href: "/#solutions" }, { label: "Grant offices", href: "/#solutions" } ] },
  { heading: "Resources", links: [
    { label: "Blog", href: "/blog" }, { label: "How it works", href: "/#how-it-works" } ] },
  { heading: "Company", links: [
    { label: "About", href: "/about" }, { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" } ] },
  { heading: "Account", links: [
    { label: "Log in", href: "/login" }, { label: "Create account", href: "/signup" } ] },
];

export function SiteFooter() {
  return (
    <footer className="mt-10">
      <div className="ball-field h-56 md:h-72" aria-hidden />
      <div className="-mt-12 rounded-t-[44px] bg-paper px-6 pb-10 pt-14 md:mx-5 md:-mt-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-wrap items-center justify-between gap-6">
            <p className="display max-w-lg text-3xl md:text-5xl">Have a grant deadline coming up?</p>
            <Link href="/contact" className="inline-flex h-20 min-w-[260px] items-center justify-center rounded-full border-2 border-ink px-10 text-2xl font-medium transition-colors hover:bg-ink hover:text-paper">Let&apos;s talk</Link>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(5,1fr)]">
            <div>
              <p className="text-2xl font-bold tracking-tight">GrantSift</p>
              <p className="mt-3 max-w-xs text-sm text-ink-soft">A clear path through grant sourcing, applications and management, built with Africa in mind.</p>
            </div>
            {COLUMNS.map((c) => (
              <div key={c.heading}>
                <p className="text-sm font-semibold">{c.heading}</p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                  {c.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className="transition-colors hover:text-ink">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-ink/10 pt-6 text-xs text-ink-faint">© {new Date().getFullYear()} GrantSift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

