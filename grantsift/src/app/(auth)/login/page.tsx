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

export default function LoginPage() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => loginAction(formData),
    initialState,
  );

  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your GrantSift account to access your dashboard and workspace."
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

      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. name@organization.com"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
        />

        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
          />
          <div className="mt-1.5 flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-stamp-dark hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>

        <SubmitButton>Sign In</SubmitButton>
      </form>
    </AuthShell>
  );
}
