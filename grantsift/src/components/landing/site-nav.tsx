"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LINKS = [
  { href: "/database", label: "Grant Database" },
  { href: "/marketplace", label: "Grant Marketplace" },
  { href: "/#readiness-scorecard", label: "Scorecard" },
  { href: "/pricing", label: "Pricing & Pro" },
  { href: "/#solutions", label: "Solutions" },
  { href: "/blog", label: "Blog" },
];

const ACTIONS = [
  ...LINKS,
  { href: "/database", label: "Search 40,000+ Grants" },
  { href: "/marketplace", label: "Hire a Certified Grant Writer" },
  { href: "/scorecard", label: "Calculate Grant Readiness Score" },
  { href: "/pricing", label: "View Grant OS Pricing" },
  { href: "/signup", label: "Analyze a funder" },
  { href: "/login", label: "Log in" },
  { href: "/about", label: "About GrantSift" },
  { href: "/contact", label: "Contact us" },
];

export function SiteNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => ACTIONS.filter((a) => a.label.toLowerCase().includes(q.toLowerCase())), [q]);
  const go = (href: string) => {
    setPalette(false);
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-3 z-50 landing-container">
        <div className="flex items-center justify-between rounded-full border border-ink/10 bg-paper-raised/80 py-2 pl-5 pr-2 backdrop-blur-xl shadow-sm">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/images/grantsift-logo-mark.png" alt="GrantSift" className="h-6 w-6 object-contain" />
            GrantSift <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint hidden sm:inline">OS</span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-semibold lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-xs font-medium md:flex">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-ink-faint transition-colors hover:border-ink/40"
              aria-label="Open quick search"
            >
              <span>Ctrl K</span>
            </button>
            <Link href="/login" className="px-3 py-1.5 text-ink-soft hover:text-ink font-semibold">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-paper transition-transform hover:scale-[1.03] font-semibold shadow-sm">
              Start Free
            </Link>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d={open ? "M2 2L14 14M14 2L2 14" : "M2 5H14M2 11H14"} stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="mt-2 rounded-2xl border border-ink/10 bg-paper-raised p-4 lg:hidden">
            <ul className="space-y-1 text-sm font-medium">
              {[...LINKS, { href: "/login", label: "Log in" }, { href: "/signup", label: "Start free" }].map((l) => (
                <li key={l.label}>
                  <button type="button" onClick={() => go(l.href)} className="block w-full rounded-xl px-3 py-2.5 text-left hover:bg-paper">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {palette && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick search palette"
          onClick={() => setPalette(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-24 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-paper-line bg-paper-raised p-4 shadow-2xl"
          >
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Grant Database, Marketplace, Scorecard, or Actions…"
              className="w-full rounded-xl border border-paper-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
            <div className="mt-3 max-h-60 overflow-y-auto space-y-1 text-xs">
              {results.length === 0 ? (
                <p className="p-3 text-ink-faint">No matching links or actions.</p>
              ) : (
                results.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => go(r.href)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-paper"
                  >
                    <span className="font-medium text-ink">{r.label}</span>
                    <span className="text-ink-faint text-[10px] font-mono">{r.href}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
