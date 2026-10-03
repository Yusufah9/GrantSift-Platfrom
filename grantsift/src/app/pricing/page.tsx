import Link from "next/link";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center space-y-3">
          <span className="rounded-full bg-stamp-tint px-3 py-1 text-xs font-mono font-bold uppercase text-stamp-dark">
            Transparent Pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
            One Operating System for All Your Grants
          </h1>
          <p className="text-sm text-ink-soft max-w-xl mx-auto">
            Choose the plan that fits your organization stage. Upgrade to Pro anytime to unlock full grant database access, unlimited AI matchmaking, and automated proposal builders.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {/* FREE PLAN */}
          <div className="flex flex-col justify-between rounded-3xl border border-paper-line bg-paper-raised p-8 shadow-sm">
            <div className="space-y-4">
              <span className="font-mono text-xs text-ink-faint uppercase">Free Tier</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-ink">$0</span>
                <span className="text-xs text-ink-soft">/ month</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Essential readiness tools for early founders and new non-profits assessing funding eligibility.
              </p>

              <div className="pt-4 border-t border-paper-line space-y-2.5 text-xs text-ink-soft">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Grant Readiness Scorecard audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Top 2 preview grant matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Basic Funder video & guideline sifter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Community knowledge forum access</span>
                </div>
                <div className="flex items-center gap-2 text-ink-faint">
                  <span>✕</span>
                  <span className="line-through">Access to all 40,000+ grants</span>
                </div>
                <div className="flex items-center gap-2 text-ink-faint">
                  <span>✕</span>
                  <span className="line-through">AI Proposal & Budget Generator</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/signup"
                className="block w-full rounded-2xl border border-paper-line bg-paper py-3 text-center text-xs font-semibold text-ink hover:bg-paper-raised transition-colors"
              >
                Get Started Free &rarr;
              </Link>
            </div>
          </div>

          {/* PRO PLAN (RECOMMENDED) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-ink bg-paper-raised p-8 shadow-xl">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-paper">
              Most Popular
            </div>

            <div className="space-y-4">
              <span className="font-mono text-xs text-stamp-dark font-bold uppercase">GrantSift Pro</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-5xl font-bold text-ink">$49</span>
                <span className="text-xs text-ink-soft">/ month</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Complete access to the 40,000+ grant database, automated proposal writing, and founder approval workflows.
              </p>

              <div className="pt-4 border-t border-paper-line space-y-2.5 text-xs text-ink">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Full access to 40,000+ verified grants</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Unlimited AI Grant Matchmaking with gap analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>AI Proposal Generator (Technical & Financial)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>16-Stage Grant Tracker & external submission log</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Founder Review & human-in-the-loop sign-off</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Data Room with Google Drive-style permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Post-award milestone & disbursement tracker</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/signup?plan=pro"
                className="block w-full rounded-2xl bg-ink py-3 text-center text-xs font-semibold text-paper hover:bg-stamp-dark transition-all shadow-md"
              >
                Subscribe to Pro ($49/mo) &rarr;
              </Link>
            </div>
          </div>

          {/* ENTERPRISE / FUNDER PLAN */}
          <div className="flex flex-col justify-between rounded-3xl border border-paper-line bg-paper-raised p-8 shadow-sm">
            <div className="space-y-4">
              <span className="font-mono text-xs text-ink-faint uppercase">Funder & Enterprise</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-ink">$199</span>
                <span className="text-xs text-ink-soft">/ month</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                For foundations, grant consulting agencies, and institutional grantmakers managing multiple cohorts.
              </p>

              <div className="pt-4 border-t border-paper-line space-y-2.5 text-xs text-ink-soft">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Everything in Pro for up to 10 team seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Multi-client agency management workspaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Grant Program Builder & Applicant CRM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>AI Applicant Screening & Rubric Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Tranche disbursement & impact metrics dashboard</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/contact"
                className="block w-full rounded-2xl border border-paper-line bg-paper py-3 text-center text-xs font-semibold text-ink hover:bg-paper-raised transition-colors"
              >
                Contact Funder Sales &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
