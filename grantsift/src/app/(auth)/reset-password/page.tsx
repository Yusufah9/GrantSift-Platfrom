"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";

type Status = "checking" | "ready" | "invalid" | "submitting" | "done";

const PASSWORD_SUGGESTIONS = ["GrantSift2025!"];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus("ready");
      } else {
        // Double check getUser in case session cookie exists
        supabase.auth.getUser().then(({ data: userData }) => {
          setStatus(userData.user ? "ready" : "invalid");
        });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    setStatus("submitting");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });

    if (updateError) {
      setError("Couldn't reset your password. The link may have expired. Please request a new one.");
      setStatus("ready");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  }

  if (status === "checking") {
    return (
      <AuthShell title="Verifying your reset link…">
        <div className="flex items-center gap-3 text-sm text-ink-soft py-4">
          <svg className="h-4 w-4 animate-spin text-ink" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Checking authentication status…
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell title="Reset link expired or invalid">
        <p className="text-sm text-ink-soft">
          Password reset links are valid for one-time use and expire after a short time. Please request a new reset link.
        </p>
        <div className="pt-4">
          <Link
            href="/forgot-password"
            className="inline-flex items-center rounded bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp-dark transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (status === "done") {
    return (
      <AuthShell title="Password successfully updated">
        <div className="space-y-3 text-sm text-ink-soft">
          <p className="text-emerald-700 font-medium">
            ✓ Your new password has been saved.
          </p>
          <p className="text-xs text-ink-faint">
            Taking you to your dashboard now…
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter and confirm your new password below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error ?? undefined} />

        <FormField
          label="New password"
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
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          value={confirmPasswordValue}
          onChange={(e) => setConfirmPasswordValue(e.target.value)}
        />

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-all hover:bg-stamp-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
        >
          {status === "submitting" ? "Saving new password…" : "Update Password & Continue"}
        </button>
      </form>
    </AuthShell>
  );
}

