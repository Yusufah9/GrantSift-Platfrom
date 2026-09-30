"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/(auth)/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleButton } from "@/components/auth/google-button";

const initialState: ApiResponse<{ needsEmailConfirmation: boolean }> | null = null;

export default function SignUpPage() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => signUpAction(formData),
    initialState,
  );

  if (state?.success) {
    return (
      <AuthShell title="Check your email">
        <p className="text-ink-soft">
          {state.data.needsEmailConfirmation
            ? "We've sent a confirmation link to finish creating your account."
            : "Your account is ready."}
        </p>
        <Link href="/login" className="inline-block text-sm text-stamp-dark underline">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with a funder and see where your organization stands."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-stamp-dark underline">
            Log in
          </Link>
        </>
      }
    >
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-paper-line" /> or <span className="h-px flex-1 bg-paper-line" />
      </div>
      <form action={formAction} className="space-y-4">
        {!state?.success && <FormError message={state?.error.message} />}
        <FormField label="Full name" name="fullName" autoComplete="name" />
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <FormField label="Password" name="password" type="password" autoComplete="new-password" />
        <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
        <SubmitButton>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
