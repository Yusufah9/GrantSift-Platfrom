"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { grantDiscoveryService } from "@/lib/services/grant-discovery-service";
import type { GrantOpportunity, FunderEntity, GrantSearchFilters } from "@/lib/types/grant-discovery";
import { GrantOpportunityCard } from "@/components/grants/grant-opportunity-card";
import { FunderEntityCard } from "@/components/grants/funder-entity-card";
import { saveGrantToTrackerAction, removeGrantFromTrackerAction } from "@/app/(app)/tracker/actions";

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

  useEffect(() => {
    async function loadSavedGrants() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await (supabase as any)
          .from("saved_grants")
          .select("grant_id")
          .eq("user_id", user.id);

        if (data && Array.isArray(data)) {
          setSavedGrantIds(data.map((row: any) => String(row.grant_id)));
        }
      } catch (err) {
        console.warn("Could not load saved grants:", err);
      }
    }
    loadSavedGrants();
  }, []);

  const searchFilters: GrantSearchFilters = {
    query,
    sector: selectedSector,
    country: selectedCountry,
    organizationType: selectedType,
    startupStage: selectedStage,
  };

  const filteredGrants = grantDiscoveryService.searchGrants(searchFilters);
  const filteredFunders = grantDiscoveryService.searchFunders(query, selectedSector, selectedCountry);

  const handleSaveGrant = async (grant: GrantOpportunity) => {
    const isAlreadySaved = savedGrantIds.includes(grant.id);

    if (isAlreadySaved) {
      setSavedGrantIds((prev) => prev.filter((id) => id !== grant.id));
      setSaveSuccessMessage(`"${grant.grantName}" removed from your Tracker.`);
      await removeGrantFromTrackerAction(grant.id);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } else {
      setSavedGrantIds((prev) => [...prev, grant.id]);
      setSaveSuccessMessage(`"${grant.grantName}" saved to your personal Grant Tracker.`);
      await saveGrantToTrackerAction({
        grantId: grant.id,
        grantName: grant.grantName,
        funderName: grant.funderName,
        amountMax: grant.funding.maximumAward,
        currency: grant.funding.currency,
        deadline: grant.deadline,
        notes: `Focus areas: ${grant.focusAreas.join(", ")}`,
      });
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  const sectors = ["All", "AI", "Civic Tech", "Technology", "Online Safety", "Media", "Healthcare", "Agriculture", "Climate"];
  const countries = ["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Uganda", "Rwanda", "Global"];
  const orgTypes = ["all", "Startup", "SME", "NGO", "Nonprofit", "Social Enterprise", "Individual"];
  const stages = ["all", "Idea", "Prototype", "Pre-Seed", "Seed", "Early Stage", "Growth", "Scale-Up"];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-teal-800">
              Verified Grant Catalog
            </span>
            <span className="text-xs text-slate-500">
              &bull; {stats.verifiedGrantsCount} Qualified Opportunities &bull; Multi-Tenant Database
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-900 mt-1.5">
            Grant &amp; Funder Database
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Explore verified non-dilutive grant calls, foundation deadlines, and institutional funds across technology, civil society, impact, and enterprise growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace?tab=research"
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-800 hover:border-slate-400 transition-all shadow-sm"
          >
            Live Web Research &rarr;
          </Link>
          <Link
            href="/tracker"
            className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            My Grant Tracker ({savedGrantIds.length})
          </Link>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
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
          Institutional Funders ({filteredFunders.length})
        </button>
      </div>

      {/* Search & Quick Filters */}
      <div className="rounded-xl border border-paper-line bg-paper-raised p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by keyword: "AI", "fact check", "misinformation", "scams", "Nigeria", "MSME Africa", "Opportunity Square"...'
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

        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-ink-faint font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => { setQuery(""); setSelectedSector("All"); setSelectedCountry("All"); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              query === "" && selectedSector === "All" && selectedCountry === "All"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            All 50 Grants ({stats.verifiedGrantsCount})
          </button>
          <button
            type="button"
            onClick={() => { setQuery("MSME Africa"); setSelectedSector("All"); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              query === "MSME Africa"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            MSME Africa Online
          </button>
          <button
            type="button"
            onClick={() => { setQuery("Opportunity Square"); setSelectedSector("All"); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              query === "Opportunity Square"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            Opportunity Square
          </button>
          <button
            type="button"
            onClick={() => { setSelectedSector("AI"); setQuery(""); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              selectedSector === "AI"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            AI &amp; Fact Checking
          </button>
          <button
            type="button"
            onClick={() => { setSelectedSector("Civic Tech"); setQuery(""); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              selectedSector === "Civic Tech"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            Civic Tech &amp; Democracy
          </button>
          <button
            type="button"
            onClick={() => { setSelectedCountry("Nigeria"); setQuery(""); }}
            className={`rounded-full px-2.5 py-1 font-medium transition-all border ${
              selectedCountry === "Nigeria"
                ? "bg-stamp-dark text-paper border-stamp-dark"
                : "bg-paper text-ink-soft border-paper-line hover:border-ink/30"
            }`}
          >
            Nigeria Focus
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-paper-line">
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
                <label className="block text-ink-faint mb-1 font-medium">Startup Stage</label>
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

      {/* Results View */}
      {activeTab === "grants" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing <strong>{filteredGrants.length}</strong> matching grant opportunities
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Verified Calls &bull; Multi-Tenant Database
            </span>
          </div>

          {filteredGrants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <span className="text-3xl">🔍</span>
              <h3 className="font-serif text-lg font-bold text-slate-900">No grants match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or selecting &quot;All&quot; sectors to view all available verified grants.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedSector("All");
                  setSelectedCountry("All");
                }}
                className="rounded bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all inline-block mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGrants.map((grant) => (
                <GrantOpportunityCard
                  key={grant.id}
                  grant={grant}
                  isSaved={savedGrantIds.includes(grant.id)}
                  onSave={handleSaveGrant}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              Showing <strong>{filteredFunders.length}</strong> institutional foundations
            </span>
          </div>

          {filteredFunders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-line bg-paper-raised p-12 text-center space-y-3">
              <span className="text-3xl">🏛️</span>
              <h3 className="font-serif text-lg font-bold text-ink">No funders found</h3>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedSector("All");
                  setSelectedCountry("All");
                }}
                className="rounded bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all inline-block mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFunders.map((funder) => (
                <FunderEntityCard key={funder.id} funder={funder} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
