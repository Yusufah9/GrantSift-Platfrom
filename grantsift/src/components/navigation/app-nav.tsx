"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { useState } from "react";

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/database", label: "Discover" },
    { href: "/proposals", label: "Proposals & Apply" },
    { href: "/financial-model", label: "Financial Model" },
    { href: "/business-plan", label: "Business Plan" },
    { href: "/sop-workbook", label: "SOP Workbook" },
    { href: "/tracker", label: "Pipeline Tracker" },
    { href: "/workspace", label: "Org OS" },
  ];

  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 max-w-7xl px-3">
      <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/95 py-2.5 pl-5 pr-4 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-[#0B192C]">
            <img src="/images/grantsift-logo-mark.png" alt="GrantSift" className="h-6 w-6 object-contain" />
            <span className="font-extrabold tracking-tight">GrantSift</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-bold">
              OS
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname?.startsWith(link.href)) ||
                (link.href === "/database" && pathname?.startsWith("/discover"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#0B192C] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/admin"
                className="rounded-full border border-teal-300 bg-teal-50 px-2.5 py-1 text-teal-800 font-semibold hover:bg-teal-100"
              >
                Admin
              </Link>
            </div>
          )}

          <span className="hidden md:inline font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
            {email}
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg space-y-1 animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname?.startsWith(link.href)) ||
              (link.href === "/database" && pathname?.startsWith("/discover"));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#0B192C] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
