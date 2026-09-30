"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#solutions", label: "Solutions" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-paper-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg tracking-tight text-ink">
          GrantSift
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/login" className="text-ink-soft hover:text-ink">
            Log in
          </Link>
          <Link
            href="/signup"
            className="border border-ink px-4 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center border border-paper-line md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {open ? (
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-paper-line bg-paper px-6 py-4 md:hidden">
          <ul className="space-y-3 text-sm text-ink-soft">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-paper-line pt-3">
              <Link href="/login" className="block" onClick={() => setOpen(false)}>
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="block text-ink" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
