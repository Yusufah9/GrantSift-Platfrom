"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ApiResponse<null> | null = null;
const EMAIL_SUGGESTIONS = ["demo@grantsift.org"];

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      setSubmittedEmail(String(formData.get("email") || ""));
      return forgotPasswordAction(formData);
    },
    initialState,
  );

  if (state?.success) {
    return (
      <AuthShell title="Check your email">
        <div className="space-y-4 text-sm text-ink-soft">
          <p>
            If an account exists for <strong className="text-ink">{submittedEmail || "that address"}</strong>, we&apos;ve dispatched a secure password reset link via Brevo.
          </p>
          <div className="rounded border border-paper-line bg-paper/60 p-3 text-xs text-ink-faint">
            Please check your inbox (and spam folder) and click the link within 1 hour to choose your new password.
          </div>
          <div className="pt-2">
            <Link href="/login" className="inline-block text-xs font-semibold text-stamp-dark hover:underline">
              &larr; Back to log in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and Brevo will deliver your secure reset link."
      footer={
        <Link href="/login" className="text-xs font-semibold text-stamp-dark hover:underline">
          &larr; Back to log in
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}
        <FormField
          label="Account Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. demo@grantsift.org"
          suggestions={EMAIL_SUGGESTIONS}
          helperText="Enter the email associated with your GrantSift account."
        />
        <SubmitButton>Send Reset Link via Brevo</SubmitButton>
      </form>
    </AuthShell>
  );
}

