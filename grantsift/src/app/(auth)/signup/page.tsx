"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpAction, resendConfirmationAction, type SignUpResult } from "@/app/(auth)/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleButton } from "@/components/auth/google-button";

const initialState: ApiResponse<SignUpResult> | null = null;

const EMAIL_SUGGESTIONS = ["director@nonprofit.org", "founder@impact.org"];
const PASSWORD_SUGGESTIONS = ["GrantSift2025!"];

export default function SignUpPage() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => signUpAction(formData),
    initialState,
  );

  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [targetPrompt, setTargetPrompt] = useState<string | null>(null);

  useState(() => {
    // initialize safely on mount
  });

  // Client-side read of target query without causing SSR hydration mismatches
  useState(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q) {
          setTargetPrompt(q);
          sessionStorage.setItem("grantsift_initial_prompt", q);
        } else {
          const stored = sessionStorage.getItem("grantsift_initial_prompt");
          if (stored) setTargetPrompt(stored);
        }
      } catch {}
    }
  });

  async function handleResend(email: string) {
    setResendStatus("sending");
    try {
      await resendConfirmationAction(email);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  }

  function handleUseSuggestedPassword(suggestion: string) {
    setPasswordValue(suggestion);
    setConfirmPasswordValue(suggestion);
  }

  if (state?.success) {
    const email = state.data.email;
    const previewLink = state.data.previewConfirmationLink;

    return (
      <AuthShell
        title="Check your email"
        subtitle={`We've sent a verification link to ${email} via Brevo.`}
      >
        <div className="space-y-4 text-sm text-ink-soft">
          <div className="rounded-md border border-paper-line bg-paper/60 p-4">
            <p className="font-medium text-ink">Next step to onboard:</p>
            <p className="mt-1 text-xs text-ink-faint">
              Open the email from <strong>GrantSift via Brevo</strong> and click <em>&ldquo;Confirm Email &amp; Onboard&rdquo;</em> to activate your account and access your dashboard.
            </p>
          </div>

          {previewLink && (
            <div className="rounded-md border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
              <span className="font-semibold">Local dev quick-verify link:</span>
              <div className="mt-1">
                <a
                  href={previewLink}
                  className="font-mono text-stamp-dark underline break-all hover:text-ink"
                >
                  Click here to confirm &amp; onboard immediately
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleResend(email)}
              disabled={resendStatus === "sending" || resendStatus === "sent"}
              className="w-full rounded border border-paper-line bg-paper-raised px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all disabled:opacity-50"
            >
              {resendStatus === "sending"
                ? "Sending link via Brevo…"
                : resendStatus === "sent"
                ? "Confirmation link resent! Check inbox"
                : "Didn't receive it? Resend confirmation email"}
            </button>

            <Link
              href="/login"
              className="block text-center text-xs font-medium text-stamp-dark hover:underline pt-2"
            >
              Back to log in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up to explore grant funders, analyze readiness criteria, and manage applications."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-stamp-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {targetPrompt && (
        <div className="rounded-md border border-paper-line bg-paper/70 p-3 text-xs text-ink-soft flex items-start gap-2.5">
          <span className="text-base leading-none">🎯</span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-ink">Saved grant goal:</span>
            <p className="mt-0.5 text-[11px] text-ink-soft truncate italic">&ldquo;{targetPrompt}&rdquo;</p>
          </div>
        </div>
      )}

      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-paper-line" /> or sign up with email <span className="h-px flex-1 bg-paper-line" />
      </div>

      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}

        <FormField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Dr. Jane Doe"
        />

        <FormField
          label="Work or Personal Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. founder@nonprofit.org"
          suggestions={EMAIL_SUGGESTIONS}
          helperText="We will send a secure confirmation link via Brevo to this address."
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="e.g. GrantSift2025!"
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          suggestions={PASSWORD_SUGGESTIONS}
          helperText="At least 8 characters with letters & numbers."
        />

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPasswordValue}
          onChange={(e) => setConfirmPasswordValue(e.target.value)}
        />

        <SubmitButton>Create Account & Receive Confirmation Link</SubmitButton>
      </form>
    </AuthShell>
  );
}

