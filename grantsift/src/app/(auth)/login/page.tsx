"use client";

import { useActionState } from "react";
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

  return (
    <AuthShell
      title="Log in"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-stamp-dark underline">
            Create one
          </Link>
        </>
      }
    >
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-paper-line" /> or <span className="h-px flex-1 bg-paper-line" />
      </div>
      <form action={formAction} className="space-y-4">
        {state && !state.success && <FormError message={state.error.message} />}
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <div>
          <FormField label="Password" name="password" type="password" autoComplete="current-password" />
          <Link href="/forgot-password" className="mt-1.5 inline-block text-xs text-ink-faint underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}
