"use client";

import { useState } from "react";
import Link from "next/link";
import { grantDiscoveryService } from "@/lib/services/grant-discovery-service";
import type { GrantOpportunity, FunderEntity, GrantSearchFilters } from "@/lib/types/grant-discovery";
import { GrantOpportunityCard } from "@/components/grants/grant-opportunity-card";
import { FunderEntityCard } from "@/components/grants/funder-entity-card";

export default function GrantDatabasePage() {
  const [activeTab, setActiveTab] = useState<"grants" | "funders">("grants");
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedType, setSelectedType] = useState<any>("all");
  const [selectedStage, setSelectedStage] = useState<any>("all");
  const [savedGrantIds, setSavedGrantIds] = useState<string[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const stats = grantDiscoveryService.getDatabaseStats();

  const searchFilters: GrantSearchFilters = {
    query,
    sector: selectedSector,
    country: selectedCountry,
    organizationType: selectedType,
    startupStage: selectedStage,
  };

  const filteredGrants = grantDiscoveryService.searchGrants(searchFilters);
  const filteredFunders = grantDiscoveryService.searchFunders(query, selectedSector, selectedCountry);

  const handleSaveGrant = (grant: GrantOpportunity) => {
    if (!savedGrantIds.includes(grant.id)) {
      setSavedGrantIds((prev) => [...prev, grant.id]);
      setSaveSuccessMessage(`"${grant.grantName}" added to your personal Grant Tracker.`);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  const sectors = ["All", "Clean Energy", "Agriculture", "Technology", "AI", "Healthcare", "Women", "Youth", "SMEs"];
  const countries = ["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Uganda", "Rwanda", "Global"];
  const orgTypes = ["all", "Startup", "SME", "NGO", "Nonprofit", "Social Enterprise", "University"];
  const stages = ["all", "Idea", "Prototype", "Pre-Seed", "Seed", "Early Stage", "Growth", "Scale-Up"];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Discovery Engine
            </span>
            <span className="text-xs text-ink-faint">
              &bull; {stats.verifiedGrantsCount} Verified Opportunities &bull; {stats.verifiedFundersCount} Institutional Foundations
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1.5">
            Grant &amp; Funder Database
          </h1>
          <p className="text-sm text-ink-soft mt-1 max-w-3xl">
            Live discovery system collecting publicly verified funding calls from Opportunity Square, Instrumentl, and official funder portals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace?tab=research"
            className="rounded bg-paper px-4 py-2 text-xs font-semibold border border-paper-line text-ink hover:border-ink/40 transition-all shadow-sm"
          >
            Live Web Research &rarr;
          </Link>
          <Link
            href="/tracker"
            className="rounded bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all shadow-sm"
          >
            My Grant Tracker
          </Link>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <span>✓ {saveSuccessMessage}</span>
          <Link href="/tracker" className="underline hover:text-emerald-800">
            View in Tracker &rarr;
          </Link>
        </div>
      )}

      {/* Tabs: Grants vs Foundations */}
      <div className="flex items-center gap-2 border-b border-paper-line">
        <button
          type="button"
          onClick={() => setActiveTab("grants")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "grants"
              ? "border-stamp-dark text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Grant Opportunities ({filteredGrants.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("funders")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "funders"
              ? "border-stamp-dark text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Foundations &amp; Funders ({filteredFunders.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by keyword: "AI grants", "climate grants", "grants for African startups", "women entrepreneur grants"...'
              className="w-full rounded-lg border border-paper-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-stamp outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-2.5 text-xs text-ink-faint hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-ink-faint mb-1 font-medium">Sector / Focus Area</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full rounded border border-paper-line bg-paper px-2.5 py-1.5 text-ink outline-none"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ink-faint mb-1 font-medium">Country / Region</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded border border-paper-line bg-paper px-2.5 py-1.5 text-ink outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {activeTab === "grants" && (
            <>
              <div>
                <label className="block text-ink-faint mb-1 font-medium">Organization Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded border border-paper-line bg-paper px-2.5 py-1.5 text-ink outline-none capitalize"
                >
                  {orgTypes.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "All Types" : t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-faint mb-1 font-medium">Business / Startup Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full rounded border border-paper-line bg-paper px-2.5 py-1.5 text-ink outline-none capitalize"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>
                      {st === "all" ? "All Stages" : st}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "grants" ? (
        filteredGrants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-paper-line p-12 text-center bg-paper-raised/40">
            <p className="text-base font-semibold text-ink">No matching grants found</p>
            <p className="text-xs text-ink-soft mt-1">Try adjusting your keyword query or expanding your sector and country filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedSector("All");
                setSelectedCountry("All");
                setSelectedType("all");
                setSelectedStage("all");
              }}
              className="mt-4 rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGrants.map((grant) => (
              <GrantOpportunityCard
                key={grant.id}
                grant={grant}
                onSave={handleSaveGrant}
                isSaved={savedGrantIds.includes(grant.id)}
              />
            ))}
          </div>
        )
      ) : filteredFunders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-paper-line p-12 text-center bg-paper-raised/40">
          <p className="text-base font-semibold text-ink">No matching foundations found</p>
          <p className="text-xs text-ink-soft mt-1">Try searching by funder name or broadening your focus sector.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredFunders.map((funder) => (
            <FunderEntityCard key={funder.id} funder={funder} />
          ))}
        </div>
      )}
    </div>
  );
}
