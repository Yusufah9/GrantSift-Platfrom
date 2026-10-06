"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/proposals", label: "Proposals & Apply" },
    { href: "/financial-model", label: "Financial Model" },
    { href: "/business-plan", label: "Business Plan" },
    { href: "/sop-workbook", label: "SOP Workbook" },
    { href: "/tracker", label: "Pipeline Tracker" },
    { href: "/workspace", label: "Org OS" },
  ];

  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 max-w-7xl px-3">
      <div className="flex items-center justify-between rounded-full border border-ink/10 bg-paper-raised/90 py-2.5 pl-5 pr-4 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            <img src="/images/grantsift-logo-mark.png" alt="GrantSift" className="h-6 w-6 object-contain" />
            GrantSift <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint hidden sm:inline">OS</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <div className="xl:hidden flex items-center gap-1.5">
            <Link href="/financial-model" className="rounded-full px-2 py-1 font-semibold text-ink hover:bg-paper">
              Finance
            </Link>
            <Link href="/business-plan" className="rounded-full px-2 py-1 font-semibold text-ink hover:bg-paper">
              Plan
            </Link>
            <Link href="/sop-workbook" className="rounded-full px-2 py-1 font-semibold text-ink hover:bg-paper">
              SOP
            </Link>
            <Link href="/workspace" className="rounded-full px-2.5 py-1 font-semibold text-ink hover:bg-paper">
              Org OS
            </Link>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <Link
                href="/admin/blog/new"
                className="rounded-full bg-amber-900 px-3 py-1 text-white font-semibold hover:bg-black transition-colors flex items-center gap-1 text-[11px]"
              >
                <span>✍️ Write Blog</span>
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-amber-900 font-semibold hover:bg-amber-100"
              >
                Admin
              </Link>
            </div>
          )}

          <span className="hidden md:inline font-mono text-[11px] text-ink-faint truncate max-w-[140px]">{email}</span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-ink/20 px-3 py-1 font-medium text-ink hover:bg-ink hover:text-paper transition-all"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
