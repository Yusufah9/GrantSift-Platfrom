"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";

type Status = "checking" | "ready" | "invalid" | "submitting" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  // The emailed reset link carries the recovery session in the URL fragment
  // (#access_token=...), which only the browser ever sees, never the
  // server. The Supabase browser client picks it up automatically on
  // creation, so we confirm a session actually landed before showing the form.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
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
      setError("Couldn't reset your password. Request a new reset link.");
      setStatus("ready");
      return;
    }

    setStatus("done");
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  if (status === "checking") {
    return (
      <AuthShell title="Checking your link…">
        <p className="text-ink-soft">One moment.</p>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell title="This link has expired">
        <p className="text-ink-soft">
          Password reset links only work once and expire after a short time. Request a new one from
          the login page.
        </p>
        <a href="/forgot-password" className="inline-block text-sm text-stamp-dark underline">
          Send a new link
        </a>
      </AuthShell>
    );
  }

  if (status === "done") {
    return (
      <AuthShell title="Password updated">
        <p className="text-ink-soft">Taking you to your dashboard…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error ?? undefined} />
        <FormField label="New password" name="password" type="password" autoComplete="new-password" />
        <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Please wait…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
