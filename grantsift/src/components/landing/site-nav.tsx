"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#solutions", label: "Solutions" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/blog", label: "Blog" },
];
const ACTIONS = [
  ...LINKS,
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
        <div className="flex items-center justify-between rounded-full border border-ink/10 bg-paper-raised/80 py-2 pl-5 pr-2 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span aria-hidden className="h-6 w-6 rounded-full" style={{ background: "radial-gradient(circle at 32% 26%, #6b6962, #0a0a0a 65%)" }} />
            GrantSift
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-sm font-medium md:flex">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2 text-ink-faint transition-colors hover:border-ink/40"
              aria-label="Open quick search"
            >
              <span className="text-xs">Ctrl K</span>
            </button>
            <Link href="/login" className="px-3 py-2 text-ink-soft hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-ink px-5 py-2.5 text-paper transition-transform hover:scale-[1.04]">
              Start free
            </Link>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d={open ? "M2 2L14 14M14 2L2 14" : "M2 5H14M2 11H14"} stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="mt-2 rounded-2xl border border-ink/10 bg-paper-raised p-4 md:hidden">
            <ul className="space-y-1 text-base font-medium">
              {[...LINKS, { href: "/login", label: "Log in" }, { href: "/signup", label: "Start free" }].map((l) => (
                <li key={l.label}>
                  <button type="button" onClick={() => go(l.href)} className="block w-full rounded-xl px-3 py-3 text-left hover:bg-paper">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {palette && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[18vh] backdrop-blur-sm" onClick={() => setPalette(false)}>
          <div role="dialog" aria-label="Quick search" className="w-full max-w-lg overflow-hidden rounded-2xl bg-paper-raised shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0].href)}
              placeholder="Where do you want to go?"
              className="w-full border-b border-ink/10 bg-transparent px-5 py-4 text-base outline-none"
            />
            <ul className="max-h-72 overflow-auto p-2">
              {results.map((r) => (
                <li key={r.label}>
                  <button type="button" onClick={() => go(r.href)} className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-paper">
                    {r.label}
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-3 text-sm text-ink-faint">Nothing matches. Try “blog” or “log in”.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

