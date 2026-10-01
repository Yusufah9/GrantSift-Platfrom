"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import type { ApiResponse } from "@/lib/errors/app-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleButton } from "@/components/auth/google-button";

const initialState: ApiResponse<null> | null = null;

const EMAIL_SUGGESTIONS = ["demo@grantsift.org", "user@grantsift.app"];
const PASSWORD_SUGGESTIONS = ["GrantSift2025!"];

export default function LoginPage() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => loginAction(formData),
    initialState,
  );

  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  function handleFillDemo() {
    setEmailValue("demo@grantsift.org");
    setPasswordValue("GrantSift2025!");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your GrantSift account. You will be onboarded to your dashboard automatically."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-stamp-dark hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton label="Continue with Google" />

      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-paper-line" /> or sign in with email <span className="h-px flex-1 bg-paper-line" />
      </div>

      {/* Quick Suggestion Helper Banner */}
      <div className="rounded border border-paper-line bg-paper/60 p-3 text-xs text-ink-soft">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">Suggested Demo Account:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="rounded bg-stamp-dark/10 px-2 py-1 text-[11px] font-semibold text-stamp-dark hover:bg-stamp-dark/20 active:scale-95 transition-all"
          >
            Auto-fill credentials
          </button>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-ink-faint">
          <span>Email: <strong className="text-ink">demo@grantsift.org</strong></span>
          <span>Password: <strong className="text-ink">GrantSift2025!</strong></span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. demo@grantsift.org"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          suggestions={EMAIL_SUGGESTIONS}
          helperText="Enter your email or select a suggested email above."
        />

        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="e.g. GrantSift2025!"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            suggestions={PASSWORD_SUGGESTIONS}
          />
          <div className="mt-1.5 flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-stamp-dark hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>

        <SubmitButton>Log in & Onboard to Dashboard</SubmitButton>
      </form>
    </AuthShell>
  );
}

