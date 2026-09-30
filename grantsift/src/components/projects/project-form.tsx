"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/(app)/projects/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;

export function ProjectForm() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createProjectAction(formData),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      {state && !state.success && <FormError message={state.error.message} />}

      <fieldset className="space-y-4">
        <legend className="font-mono text-xs uppercase tracking-wide text-ink-faint">Grant funder</legend>
        <FormField label="Funder URL" name="grantFunderUrl" type="url" autoComplete="off" />
        <FormField label="Amount you're seeking (optional)" name="grantAmountSought" type="number" required={false} />
        <FormField label="Application deadline (optional)" name="grantDeadline" type="date" required={false} />
        <label className="block">
          <span className="text-sm text-ink-soft">Or paste the requirements yourself (optional)</span>
          <textarea
            name="pastedRequirements"
            rows={5}
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
