"use client";

import { useActionState, useEffect, useState } from "react";
import { createProjectAction } from "@/app/(app)/projects/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;

const ORG_TYPES = [
  "Startup",
  "Business",
  "NGO",
  "Nonprofit",
  "Social Enterprise",
  "University",
  "Research Institution",
  "Individual/project",
];

const STAGES = [
  "Idea",
  "Prototype",
  "Pre-Seed",
  "Seed",
  "Early Stage",
  "Growth",
  "Scale-Up",
];

const COMMON_SDGS = [
  "SDG 1: No Poverty",
  "SDG 2: Zero Hunger",
  "SDG 3: Good Health & Well-being",
  "SDG 4: Quality Education",
  "SDG 5: Gender Equality",
  "SDG 6: Clean Water & Sanitation",
  "SDG 7: Affordable & Clean Energy",
  "SDG 8: Decent Work & Economic Growth",
  "SDG 9: Industry, Innovation & Infrastructure",
  "SDG 10: Reduced Inequalities",
  "SDG 11: Sustainable Cities & Communities",
  "SDG 12: Responsible Consumption & Production",
  "SDG 13: Climate Action",
  "SDG 14: Life Below Water",
  "SDG 15: Life on Land",
];

export function ProjectForm() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createProjectAction(formData),
    initialState,
  );

  const [savedPromptSource, setSavedPromptSource] = useState<string | null>(null);
  const [orgTypeValue, setOrgTypeValue] = useState("Startup");
  const [stageValue, setStageValue] = useState("Early Stage");
  const [selectedSdgs, setSelectedSdgs] = useState<string[]>([
    "SDG 7: Affordable & Clean Energy",
    "SDG 13: Climate Action",
  ]);
  const [hasBusinessPlan, setHasBusinessPlan] = useState(false);
  const [hasPitchDeck, setHasPitchDeck] = useState(false);
  const [hasFinancialModel, setHasFinancialModel] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("grantsift_initial_prompt");
      if (saved && saved.trim()) {
        const trimmed = saved.trim();
        setSavedPromptSource(trimmed);
      }
    } catch {}
  }, []);

  function handleClearSavedPrompt() {
    setSavedPromptSource(null);
    try {
      sessionStorage.removeItem("grantsift_initial_prompt");
    } catch {}
  }

  const toggleSdg = (sdg: string) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdg) ? prev.filter((s) => s !== sdg) : [...prev, sdg]
    );
  };

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
      {state && !state.success && <FormError message={state.error.message} />}

      {savedPromptSource && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>
              Pre-filled from your query: <em className="font-semibold">&ldquo;{savedPromptSource}&rdquo;</em>. Grant discovery will run automatically upon profile creation.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearSavedPrompt}
            className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Organization Identity */}
      <fieldset className="space-y-4 rounded-xl border border-paper-line bg-paper-raised/30 p-6">
        <legend className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint px-2">
          1. Organization Identity
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Organization Name" name="orgName" autoComplete="organization" required />
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Organization Type</span>
            <select
              name="orgType"
              value={orgTypeValue}
              onChange={(e) => setOrgTypeValue(e.target.value)}
              className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            >
              {ORG_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Email" name="orgEmail" type="email" required />
          <FormField label="Website (optional)" name="orgWebsite" type="url" required={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Registration Status"
            name="registrationStatus"
            placeholder="e.g. Registered Ltd / 501(c)(3) / In Progress"
            required={false}
          />
          <FormField label="Year Founded (optional)" name="orgYearFounded" type="number" required={false} />
          <FormField label="Team Size (optional)" name="orgTeamSize" type="number" required={false} />
        </div>
      </fieldset>

      {/* 2. Geography, Sector & Beneficiaries */}
      <fieldset className="space-y-4 rounded-xl border border-paper-line bg-paper-raised/30 p-6">
        <legend className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint px-2">
          2. Geography, Sector &amp; Focus
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Headquarters Country" name="orgCountry" autoComplete="country-name" required />
          <FormField
            label="Countries / Regions Served"
            name="countriesServed"
            placeholder="e.g. Nigeria, Ghana, Kenya, Pan-African"
            required={false}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Industry" name="orgIndustry" placeholder="e.g. Clean Technology, Agriculture, Healthcare" required />
          <FormField label="Sector / Thematic Domain" name="sector" placeholder="e.g. Renewable Mini-grids, Agritech, Edtech" required={false} />
        </div>
        <FormField
          label="Geographic Focus"
          name="geographicFocus"
          placeholder="e.g. Sub-Saharan Africa, Peri-urban settlements, Rural smallholders"
          required={false}
        />
      </fieldset>

      {/* 3. Problem, Solution & Project Description */}
      <fieldset className="space-y-4 rounded-xl border border-paper-line bg-paper-raised/30 p-6">
        <legend className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint px-2">
          3. Problem &amp; Solution
        </legend>
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Problem Being Solved</span>
          <textarea
            name="problemStatement"
            rows={3}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            placeholder="Explain the specific challenge, market failure, or societal problem your organization addresses."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Solution &amp; Product Description</span>
          <textarea
            name="solutionStatement"
            rows={3}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            placeholder="Describe your innovative technology, product, or intervention and how it solves the problem."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Target Beneficiaries &amp; Customers</span>
          <textarea
            name="targetBeneficiaries"
            rows={2}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            placeholder="Who benefits directly (e.g. 10,000 smallholder female farmers, rural students, youth entrepreneurs)?"
          />
        </label>
      </fieldset>

      {/* 4. Stage, Traction & Financials */}
      <fieldset className="space-y-4 rounded-xl border border-paper-line bg-paper-raised/30 p-6">
        <legend className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint px-2">
          4. Stage, Traction &amp; Funding Requirements
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Current Stage</span>
            <select
              name="stage"
              value={stageValue}
              onChange={(e) => setStageValue(e.target.value)}
              className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <FormField
            label="Funding Required / Target Grant Size, USD"
            name="fundingRequired"
            type="number"
            placeholder="e.g. 150000"
            required={false}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Annual Revenue, USD (optional)"
            name="revenue"
            type="number"
            placeholder="e.g. 50000"
            required={false}
          />
          <FormField
            label="Funding Received to Date, USD (optional)"
            name="fundingReceived"
            type="number"
            placeholder="e.g. 80000"
            required={false}
          />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Previous Grants &amp; Traction Summary (optional)</span>
          <textarea
            name="previousGrants"
            rows={2}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded text-sm"
            placeholder="List any past grants, awards, accelerator programs, or milestones achieved."
          />
        </label>
      </fieldset>

      {/* 5. Impact, SDGs & Documents */}
      <fieldset className="space-y-4 rounded-xl border border-paper-line bg-paper-raised/30 p-6">
        <legend className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint px-2">
          5. Impact, SDGs &amp; Prepared Documents
        </legend>
        <FormField
          label="Impact Areas"
          name="impactAreas"
          placeholder="e.g. Renewable Energy, Climate Resilience, Job Creation, Gender Inclusion"
          required={false}
        />
        
        <div>
          <span className="text-sm font-medium text-ink-soft block mb-2">Sustainable Development Goals (SDGs)</span>
          <div className="flex flex-wrap gap-2">
            {COMMON_SDGS.map((sdg) => {
              const active = selectedSdgs.includes(sdg);
              return (
                <button
                  key={sdg}
                  type="button"
                  onClick={() => toggleSdg(sdg)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                    active
                      ? "bg-stamp-dark text-paper border-stamp-dark"
                      : "bg-paper text-ink-soft border-paper-line hover:border-ink/40"
                  }`}
                >
                  {sdg}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="sdgs" value={selectedSdgs.join(", ")} />
        </div>

        <div className="pt-2">
          <span className="text-sm font-medium text-ink-soft block mb-2">Readiness Documents Available:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer border border-paper-line bg-paper p-3 rounded hover:border-stamp">
              <input
                type="checkbox"
                name="hasBusinessPlan"
                checked={hasBusinessPlan}
                onChange={(e) => setHasBusinessPlan(e.target.checked)}
                className="rounded text-stamp focus:ring-stamp"
              />
              <span>Business Plan</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer border border-paper-line bg-paper p-3 rounded hover:border-stamp">
              <input
                type="checkbox"
                name="hasPitchDeck"
                checked={hasPitchDeck}
                onChange={(e) => setHasPitchDeck(e.target.checked)}
                className="rounded text-stamp focus:ring-stamp"
              />
              <span>Pitch Deck</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer border border-paper-line bg-paper p-3 rounded hover:border-stamp">
              <input
                type="checkbox"
                name="hasFinancialModel"
                checked={hasFinancialModel}
                onChange={(e) => setHasFinancialModel(e.target.checked)}
                className="rounded text-stamp focus:ring-stamp"
              />
              <span>Financial Model</span>
            </label>
          </div>
        </div>
      </fieldset>

      <div className="flex items-center justify-between pt-4 border-t border-paper-line">
        <p className="text-xs text-ink-faint">
          Once created, GrantSift&apos;s AI Discovery Engine immediately searches real sources for matching grants.
        </p>
        <SubmitButton>Save &amp; Find Grants &rarr;</SubmitButton>
      </div>
    </form>
  );
}

