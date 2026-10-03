"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ShowcaseSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  category: string;
  metricLabel: string;
  metricValue: string;
  content: React.ReactNode;
}

export function InteractiveOSShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const SLIDES: ShowcaseSlide[] = [
    {
      id: "matchmaking",
      badge: "AI Matchmaking & Intelligence",
      category: "Discovery Engine",
      title: "Real-time Funder Compatibility Radar",
      subtitle: "Matches your startup or NGO against 40,000+ grants with transparent eligibility rationale.",
      metricLabel: "Compatibility Score",
      metricValue: "94%",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-paper-line pb-3">
            <div>
              <span className="font-mono text-[10px] text-ink-faint uppercase">Funder: African Development Bank (AfDB)</span>
              <h4 className="font-serif text-base font-bold text-ink">SEFA Catalyst Clean Energy Grant</h4>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              $500,000 USD
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-paper-line bg-paper p-3">
              <span className="text-ink-faint text-[10px] font-mono">Geography:</span>
              <p className="font-semibold text-ink mt-0.5">Nigeria, Kenya, Ghana + Africa</p>
            </div>
            <div className="rounded-xl border border-paper-line bg-paper p-3">
              <span className="text-ink-faint text-[10px] font-mono">Applicant Type:</span>
              <p className="font-semibold text-ink mt-0.5">Seed &amp; Growth Startups / SMEs</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 space-y-1.5 text-xs text-emerald-950">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <span>✨</span> Why this matched your master profile:
            </p>
            <p className="text-[11px] leading-relaxed">
              ✓ Operating jurisdiction matches funder priority &bull; ✓ Clean Energy sector alignment &bull; ✓ Requested $150k is within the $50k–$500k award bracket.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "firecrawl",
      badge: "Firecrawl Web Intelligence",
      category: "Live Web Engine",
      title: "OpportunitySquare & Instrumentl Live Synthesis",
      subtitle: "Scrapes and synthesizes live funder RFPs, 990-PF tax histories, and previous recipient stories.",
      metricLabel: "Live Web Sources Cited",
      metricValue: "18+",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-paper-line pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                OpportunitySquare.org
              </span>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-900">
                Instrumentl.com
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-800 font-bold">✓ Live Verified</span>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl border border-paper-line bg-paper p-3 text-xs space-y-1">
              <div className="flex justify-between font-bold text-ink">
                <span>Recurring Recipient Pattern:</span>
                <span className="text-amber-800 font-mono text-[10px]">12 sources cited</span>
              </div>
              <p className="text-ink-soft text-[11px] leading-relaxed">
                Funders repeatedly reward applicants with localized community off-taker letters of intent and a verified 24-month earned revenue model.
              </p>
            </div>

            <div className="rounded-xl border border-paper-line bg-paper p-3 text-xs space-y-1">
              <div className="flex justify-between font-bold text-ink">
                <span>Allowable Budget Allocation:</span>
                <span className="text-emerald-800 font-mono text-[10px]">Scoring Rule</span>
              </div>
              <p className="text-ink-soft text-[11px] leading-relaxed">
                Direct technology &amp; equipment cap: 45% &bull; Field operations: 30% &bull; M&amp;E: 8% &bull; Indirect admin overhead capped at 12%.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tracker",
      badge: "16-Stage Grant Tracker",
      category: "Workflow & Governance",
      title: "Founder Sign-off & Submission Log",
      subtitle: "Mandatory human-in-the-loop governance. Grant writers cannot submit without founder sign-off.",
      metricLabel: "Active Pipeline Stage",
      metricValue: "Approved",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-paper-line pb-3">
            <div>
              <span className="font-mono text-[10px] text-ink-faint uppercase">Application #TEF-2026-NGA</span>
              <h4 className="font-serif text-base font-bold text-ink">Tony Elumelu Foundation Seed Grant</h4>
            </div>
            <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-900">
              Founder Approved
            </span>
          </div>

          <div className="rounded-xl border border-paper-line bg-paper p-3 text-xs space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-faint">Approved By:</span>
              <span className="font-bold text-ink">Chief Executive Officer</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-faint">Audit Note:</span>
              <span className="text-ink-soft italic">&ldquo;Budget and milestone M&amp;E verified. Approved for submission.&rdquo;</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ink-faint">External Confirmation #:</span>
              <span className="font-mono font-bold text-emerald-800">TEF-CONF-77492</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-ink-faint">
            <span className="rounded bg-paper border border-paper-line px-2 py-0.5 text-ink">1. Draft</span>
            <span>&rarr;</span>
            <span className="rounded bg-paper border border-paper-line px-2 py-0.5 text-ink">2. Review</span>
            <span>&rarr;</span>
            <span className="rounded bg-ink px-2 py-0.5 text-paper font-bold">3. Founder Sign-off</span>
            <span>&rarr;</span>
            <span className="rounded bg-paper border border-paper-line px-2 py-0.5 text-ink">4. Submitted</span>
          </div>
        </div>
      ),
    },
    {
      id: "award",
      badge: "Post-Award Management",
      category: "Disbursement & Impact",
      title: "Tranche Release & M&E Monitoring",
      subtitle: "Track multi-year grant agreements, milestone disbursements, and SDG metrics in one dashboard.",
      metricLabel: "Total Disbursed",
      metricValue: "$100,000",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-paper-line pb-3">
            <div>
              <span className="font-mono text-[10px] text-ink-faint uppercase">Award Agreement #AID-620-G</span>
              <h4 className="font-serif text-base font-bold text-ink">USAID Feed the Future Innovation Award</h4>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              Total: $250,000 USD
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 border border-emerald-200 p-2.5">
              <span className="font-semibold text-emerald-950">Tranche 1 ($100k): Mobilization &amp; Hub Setup</span>
              <span className="text-emerald-800 font-bold">✓ Released</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-paper border border-paper-line p-2.5">
              <span className="text-ink">Tranche 2 ($100k): 15 Operational Cold Storage Hubs</span>
              <span className="text-ink-faint">Pending Verification</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-paper border border-paper-line p-2.5">
              <span className="text-ink">Tranche 3 ($50k): Final Impact Audit &amp; Handover</span>
              <span className="text-ink-faint">Due Month 24</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, SLIDES.length]);

  const current = SLIDES[activeSlide]!;

  return (
    <section className="landing-container py-20 md:py-28">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="rounded-full bg-stamp-tint px-3 py-1 text-xs font-mono font-bold uppercase text-stamp-dark">
          Grant OS In Motion
        </span>
        <h2 className="display text-3xl sm:text-5xl md:text-6xl text-ink">
          The Full Grant Lifecycle, Live on Screen
        </h2>
        <p className="text-sm md:text-base text-ink-soft max-w-xl mx-auto">
          From live Firecrawl web discovery and AI matchmaking to founder governance sign-off and post-award disbursement tracking.
        </p>
      </div>

      {/* Interactive Tabs / Controller */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => {
              setActiveSlide(idx);
              setIsAutoPlaying(false);
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              activeSlide === idx
                ? "bg-ink text-paper shadow-md scale-105"
                : "border border-paper-line bg-paper-raised text-ink-soft hover:text-ink hover:bg-paper"
            }`}
          >
            {slide.badge}
          </button>
        ))}
      </div>

      {/* 3D Flowing Card Container */}
      <div
        className="mt-10 max-w-4xl mx-auto"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div
          className="relative rounded-3xl border-2 border-ink/15 bg-paper-raised p-6 md:p-10 shadow-2xl transition-all duration-700 backdrop-blur-xl"
          style={{
            transform: "perspective(1200px) rotateX(1.5deg) scale(1)",
            boxShadow: "0 25px 50px -12px rgba(10, 10, 10, 0.15), 0 0 0 1px rgba(10, 10, 10, 0.05)",
          }}
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-paper-line pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-3 font-mono text-[11px] text-ink-faint">
                grantsift.app/workspace/{current.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-faint">
                {current.metricLabel}: <strong className="text-ink font-bold">{current.metricValue}</strong>
              </span>
              <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-stamp-dark">
                {current.category}
              </span>
            </div>
          </div>

          {/* Slide Description */}
          <div className="mb-6 space-y-1">
            <h3 className="font-serif text-2xl font-bold text-ink">{current.title}</h3>
            <p className="text-xs sm:text-sm text-ink-soft">{current.subtitle}</p>
          </div>

          {/* Dynamic Content Body */}
          <div className="rounded-2xl border border-paper-line bg-paper/60 p-5 shadow-inner">
            {current.content}
          </div>

          {/* Footer Controls & CTA */}
          <div className="mt-8 pt-4 border-t border-paper-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span>Slideshow:</span>
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveSlide(i);
                      setIsAutoPlaying(false);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === i ? "w-6 bg-ink" : "w-2 bg-paper-line"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/database"
                className="rounded-xl border border-paper-line bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-paper-raised"
              >
                Browse Grant Database &rarr;
              </Link>
              <Link
                href="/signup?plan=pro"
                className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all shadow-sm"
              >
                Start Operating System Free &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
