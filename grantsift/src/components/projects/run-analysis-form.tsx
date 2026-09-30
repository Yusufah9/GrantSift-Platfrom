"use client";

import { useActionState } from "react";
import { runAnalysisAction } from "@/app/(app)/projects/[id]/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;

export function RunAnalysisForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState) => runAnalysisAction(projectId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state && !state.success && <FormError message={state.error.message} />}
      <SubmitButton>Run analysis</SubmitButton>
      <p className="text-xs text-ink-faint">
        Fetches the funder&apos;s page, searches YouTube for grant-winner testimonials (up to 5
        videos per run), and extracts insights. This can take a minute.
      </p>
    </form>
  );
}
