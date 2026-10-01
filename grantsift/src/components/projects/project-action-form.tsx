"use client";

import { useActionState } from "react";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;

export function ProjectActionForm({
  action,
  buttonLabel,
  helperText,
}: {
  action: () => Promise<ApiResponse<null>>;
  buttonLabel: string;
  helperText?: string;
}) {
  const [state, formAction] = useActionState(async (_prev: typeof initialState) => action(), initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state && !state.success && <FormError message={state.error.message} />}
      <SubmitButton>{buttonLabel}</SubmitButton>
      {helperText && <p className="text-xs text-ink-faint">{helperText}</p>}
    </form>
  );
}

