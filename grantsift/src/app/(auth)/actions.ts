"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { fail, ok, type ApiResponse } from "@/lib/errors/app-error";
import { AppError } from "@/lib/errors/app-error";
import { EmailService } from "@/lib/email/email-service";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function signUpAction(formData: FormData): Promise<ApiResponse<{ needsEmailConfirmation: boolean }>> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });

  if (error) {
    return fail(new AppError("AUTHENTICATION_ERROR", error.message));
  }

  // Best-effort: a welcome email failing should never block account creation.
  new EmailService().sendWelcomeEmail(parsed.data.email, parsed.data.fullName).catch((cause) => {
    console.error("Welcome email failed to send:", cause);
  });

  return ok({ needsEmailConfirmation: !data.session });
}

export async function loginAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Incorrect email or password."));
  }

  redirect("/dashboard");
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl()}/auth/callback` },
  });

  if (error || !data.url) {
    throw new AppError("AUTHENTICATION_ERROR", "Couldn't start Google sign-in. Please try again.");
  }

  redirect(data.url);
}

export async function forgotPasswordAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Enter a valid email address."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl()}/reset-password`,
  });

  // Always return success even if the email doesn't exist, so the flow
  // can't be used to enumerate registered accounts.
  if (error) {
    console.error("resetPasswordForEmail error:", error.message);
  }
  return ok(null);
}

export async function resetPasswordAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Couldn't reset your password. Request a new reset link."));
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

