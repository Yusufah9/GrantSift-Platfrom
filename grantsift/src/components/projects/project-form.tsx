"use client";

import { useActionState, useEffect, useState } from "react";
import { createProjectAction } from "@/app/(app)/projects/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;
const FUNDER_SUGGESTIONS = [
  "https://www.macfound.org",
  "https://www.gatesfoundation.org",
  "https://www.fordfoundation.org",
];

export function ProjectForm() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createProjectAction(formData),
    initialState,
  );

  const [funderUrlValue, setFunderUrlValue] = useState("");
  const [pastedReqsValue, setPastedReqsValue] = useState("");
  const [savedPromptSource, setSavedPromptSource] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("grantsift_initial_prompt");
      if (saved && saved.trim()) {
        const trimmed = saved.trim();
        setSavedPromptSource(trimmed);
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          setFunderUrlValue(trimmed);
        } else {
          setPastedReqsValue(trimmed);
        }
      }
    } catch {}
  }, []);

  function handleClearSavedPrompt() {
    setSavedPromptSource(null);
    try {
      sessionStorage.removeItem("grantsift_initial_prompt");
    } catch {}
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      {state && !state.success && <FormError message={state.error.message} />}

      {savedPromptSource && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>Pre-filled from your landing page grant query: <em className="font-semibold">&ldquo;{savedPromptSource}&rdquo;</em></span>
          </div>
          <button
            type="button"
            onClick={handleClearSavedPrompt}
            className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950"
          >
            Clear
          </button>
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="font-mono text-xs uppercase tracking-wide text-ink-faint">Grant funder</legend>
        <FormField
          label="Funder URL"
          name="grantFunderUrl"
          type="url"
          autoComplete="off"
          value={funderUrlValue}
          onChange={(e) => setFunderUrlValue(e.target.value)}
          suggestions={FUNDER_SUGGESTIONS}
          helperText="Official website or grant call page URL."
        />
        <FormField label="Amount you're seeking (optional)" name="grantAmountSought" type="number" required={false} />
        <FormField label="Application deadline (optional)" name="grantDeadline" type="date" required={false} />
        <label className="block">
          <span className="text-sm text-ink-soft">Or paste the requirements yourself (optional)</span>
          <textarea
            name="pastedRequirements"
            rows={5}
            value={pastedReqsValue}
            onChange={(e) => setPastedReqsValue(e.target.value)}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
            placeholder="Paste eligibility criteria, required documents, or application questions here."
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-mono text-xs uppercase tracking-wide text-ink-faint">Your organization</legend>
        <FormField label="Organization name" name="orgName" autoComplete="organization" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Industry" name="orgIndustry" />
          <FormField label="Country" name="orgCountry" autoComplete="country-name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Website (optional)" name="orgWebsite" type="url" required={false} />
          <FormField label="Contact email" name="orgEmail" type="email" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Team size (optional)" name="orgTeamSize" type="number" required={false} />
          <FormField label="Year founded (optional)" name="orgYearFounded" type="number" required={false} />
        </div>
        <FormField label="Funding raised to date, USD (optional)" name="orgFundingToDate" type="number" required={false} />
      </fieldset>

      <SubmitButton>Create project</SubmitButton>
    </form>
  );
}

