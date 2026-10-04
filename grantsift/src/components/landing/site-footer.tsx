import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Grant Platform",
    links: [
      { label: "Platform Overview", href: "/#product" },
      { label: "Grant Prospecting", href: "/database" },
      { label: "Grant Writing Tools", href: "/#how-it-works" },
      { label: "Award Management", href: "/tracker" },
      { label: "Grant Database", href: "/database" },
      { label: "Grant Marketplace", href: "/marketplace" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Nonprofits", href: "/#solutions" },
      { label: "NGOs", href: "/#solutions" },
      { label: "Startups", href: "/#solutions" },
      { label: "Businesses", href: "/#solutions" },
      { label: "Universities", href: "/#solutions" },
      { label: "Grant Consultants", href: "/grant-writers" },
      { label: "Grant Writers", href: "/marketplace" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Grant Database", href: "/database" },
      { label: "Readiness Scorecard", href: "/scorecard" },
      { label: "Guides & Templates", href: "/#how-it-works" },
      { label: "Pricing & Pro", href: "/pricing" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/signup" },
      { label: "Organization OS", href: "/workspace" },
      { label: "Funder Portal", href: "/funder" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10">
      <div className="ball-field h-56 md:h-72" aria-hidden />
      <div className="-mt-12 rounded-t-[44px] bg-paper px-6 pb-10 pt-14 md:mx-5 md:-mt-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-wrap items-center justify-between gap-6">
            <p className="display max-w-lg text-3xl md:text-5xl">Have a grant deadline coming up?</p>
            <Link
              href="/contact"
              className="inline-flex h-20 min-w-[260px] items-center justify-center rounded-full border-2 border-ink px-10 text-2xl font-medium transition-colors hover:bg-ink hover:text-paper"
            >
              Let&apos;s talk
            </Link>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(5,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/grantsift-logo-mark.png"
                  alt="GrantSift"
                  className="h-7 w-7 object-contain"
                />
                <p className="text-2xl font-bold tracking-tight">GrantSift</p>
              </div>
              <p className="mt-3 max-w-xs text-sm text-ink-soft">
                Centralized Grant Management Operating System. Sourcing, matchmaking, proposal drafting, founder approvals, and post-award management.
              </p>
            </div>
            {COLUMNS.map((c) => (
              <div key={c.heading}>
                <p className="text-sm font-semibold">{c.heading}</p>
                <ul className="mt-4 space-y-2.5 text-xs text-ink-soft">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Iconic Giant Brand Wordmark Banner (Instrumentl Style - Pure Text) */}
          <div className="mt-14 border-t border-ink/10 pt-8 text-center overflow-hidden">
            <Link
              href="/"
              aria-label="GrantSift Home"
              className="group block overflow-hidden py-3 select-none"
            >
              <p className="font-sans font-black tracking-[-0.045em] leading-[0.88] text-[13vw] sm:text-[14vw] md:text-[15vw] lg:text-[11.5rem] text-ink transition-transform duration-300 group-hover:scale-[1.01] m-0 p-0 text-center">
                GrantSift
              </p>
            </Link>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-ink/5 pt-6 text-xs text-ink-faint">
              <p>© {new Date().getFullYear()} GrantSift. All rights reserved.</p>
              <div className="mt-3 flex items-center gap-6 sm:mt-0">
                <Link href="/privacy" className="transition-colors hover:text-ink">Privacy Policy</Link>
                <Link href="/terms" className="transition-colors hover:text-ink">Terms of Service</Link>
                <Link href="/contact" className="transition-colors hover:text-ink">Support</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
