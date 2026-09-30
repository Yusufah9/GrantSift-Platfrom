"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => forgotPasswordAction(formData),
    initialState,
  );

  if (state?.success) {
    return (
      <AuthShell title="Check your email">
        <p className="text-ink-soft">
          If an account exists for that address, we&apos;ve sent a link to reset the password.
        </p>
        <Link href="/login" className="inline-block text-sm text-stamp-dark underline">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="text-stamp-dark underline">
          Back to log in
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <SubmitButton>Send reset link</SubmitButton>
      </form>
    </AuthShell>
  );
}
