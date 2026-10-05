"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { fail, ok, type ApiResponse } from "@/lib/errors/app-error";
import { AppError } from "@/lib/errors/app-error";
import { EmailService } from "@/lib/email/email-service";

async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://grant-sift-platfrom.vercel.app";
}

export interface SignUpResult {
  needsEmailConfirmation: boolean;
  email: string;
  previewConfirmationLink?: string;
}

export async function signUpAction(formData: FormData): Promise<ApiResponse<SignUpResult>> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const { fullName, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  // Generate confirmation link and create user via Supabase admin
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { full_name: fullName },
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already been registered") || (error as { code?: string }).code === "email_exists") {
      return fail(new AppError("AUTHENTICATION_ERROR", "An account with this email address already exists. Please log in instead."));
    }
    return fail(new AppError("AUTHENTICATION_ERROR", error.message));
  }

  const tokenHash = data?.properties?.hashed_token;
  const directConfirmationLink = tokenHash
    ? `${origin}/auth/callback?token_hash=${tokenHash}&type=signup&next=/dashboard`
    : data?.properties?.action_link;

  if (!directConfirmationLink) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Could not generate account verification link."));
  }

  // Ensure initial profile record exists
  if (data.user?.id) {
    await admin.from("profiles").upsert(
      { id: data.user.id, full_name: fullName, role: "user" },
      { onConflict: "id" }
    );
  }

  // Send the confirmation email via Brevo
  const emailService = new EmailService();
  try {
    await Promise.race([
      emailService.sendConfirmationEmail(email, fullName, directConfirmationLink),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Confirmation email timeout")), 5000)),
    ]);
  } catch (emailError) {
    console.error("Brevo failed to send confirmation email:", emailError);
  }

  const isLocalDev = origin.includes("localhost") || process.env.NODE_ENV === "development";

  return ok({
    needsEmailConfirmation: true,
    email,
    previewConfirmationLink: isLocalDev ? directConfirmationLink : undefined,
  });
}

export async function resendConfirmationAction(email: string): Promise<ApiResponse<null>> {
  if (!email || !email.includes("@")) {
    return fail(new AppError("VALIDATION_ERROR", "Please provide a valid email address."));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: normalizedEmail,
    password: "TemporaryPassword123!",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error generating resend link:", error);
    // Return ok to prevent account enumeration
    return ok(null);
  }

  const tokenHash = data?.properties?.hashed_token;
  const directLink = tokenHash
    ? `${origin}/auth/callback?token_hash=${tokenHash}&type=signup&next=/dashboard`
    : data?.properties?.action_link;

  if (directLink) {
    const emailService = new EmailService();
    try {
      await Promise.race([
        emailService.sendConfirmationEmail(
          normalizedEmail,
          data.user?.user_metadata?.full_name || "there",
          directLink
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email resend timeout")), 5000)),
      ]);
    } catch (err) {
      console.error("Failed to resend confirmation email via Brevo:", err);
    }
  }

  return ok(null);
}


export async function loginAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const { email, password } = parsed.data;
  const admin = createAdminClient();

  // If using demo suggestion credentials and user does not exist yet, auto-provision and onboard
  if (email.toLowerCase() === "demo@grantsift.org" && password === "GrantSift2025!") {
    const { data: userList } = await admin.auth.admin.listUsers();
    const demoUser = userList?.users?.find((u) => u.email === "demo@grantsift.org");
    if (!demoUser) {
      const created = await admin.auth.admin.createUser({
        email: "demo@grantsift.org",
        password: "GrantSift2025!",
        email_confirm: true,
        user_metadata: { full_name: "GrantSift Demo User" },
      });
      if (created.data?.user?.id) {
        await admin.from("profiles").upsert(
          { id: created.data.user.id, full_name: "GrantSift Demo User", role: "user" },
          { onConflict: "id" }
        );
      }
    }
  }

  // Developer / Founder Admin provisioning & authentication
  const isFounderAdmin = email.toLowerCase() === "umaryaruyusuf971@gmail.com";
  if (isFounderAdmin && password === "FOUNDERsafe@2026") {
    const { data: userList } = await admin.auth.admin.listUsers();
    const adminUser = userList?.users?.find((u) => u.email?.toLowerCase() === "umaryaruyusuf971@gmail.com");
    if (!adminUser) {
      const created = await admin.auth.admin.createUser({
        email: "umaryaruyusuf971@gmail.com",
        password: "FOUNDERsafe@2026",
        email_confirm: true,
        user_metadata: {
          full_name: "Umar Yaru Yusuf (Founder & Admin)",
          is_pro: true,
          plan: "pro",
          role: "admin",
        },
      });
      if (created.data?.user?.id) {
        await admin.from("profiles").upsert(
          { id: created.data.user.id, full_name: "Umar Yaru Yusuf (Founder & Admin)", role: "admin" },
          { onConflict: "id" }
        );
      }
    } else {
      // Ensure password and metadata are updated
      await admin.auth.admin.updateUserById(adminUser.id, {
        password: "FOUNDERsafe@2026",
        email_confirm: true,
        user_metadata: {
          full_name: "Umar Yaru Yusuf (Founder & Admin)",
          is_pro: true,
          plan: "pro",
          role: "admin",
        },
      });
      await admin.from("profiles").upsert(
        { id: adminUser.id, full_name: "Umar Yaru Yusuf (Founder & Admin)", role: "admin" },
        { onConflict: "id" }
      );
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return fail(
        new AppError(
          "AUTHENTICATION_ERROR",
          "Your email has not been confirmed yet. Please check your inbox for the confirmation link."
        )
      );
    }
    return fail(new AppError("AUTHENTICATION_ERROR", "Incorrect email or password."));
  }

  // Ensure user profile is onboarded in profiles table without stripping admin role
  if (data.user?.id) {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const assignedRole = isFounderAdmin ? "admin" : (existingProfile?.role ?? "user");

    const fullName =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      email.split("@")[0] ||
      (isFounderAdmin ? "Umar Yaru Yusuf" : "GrantSift Member");

    await admin.from("profiles").upsert(
      { id: data.user.id, full_name: fullName, role: assignedRole },
      { onConflict: "id" }
    );
  }

  if (isFounderAdmin) {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function signInWithGoogleAction(): Promise<void> {
  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    throw new AppError("AUTHENTICATION_ERROR", error?.message ?? "Couldn't start Google sign-in. Please try again.");
  }

  redirect(data.url);
}

export async function forgotPasswordAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Enter a valid email address."));
  }

  const email = parsed.data.email.trim().toLowerCase();
  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  // Generate recovery link via Supabase Admin
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    },
  });

  if (error) {
    console.error("forgotPasswordAction generateLink error:", error.message);
    // Return ok to prevent account enumeration
    return ok(null);
  }

  const tokenHash = data?.properties?.hashed_token;
  const resetLink = tokenHash
    ? `${origin}/auth/callback?token_hash=${tokenHash}&type=recovery&next=/reset-password`
    : data?.properties?.action_link;

  if (resetLink) {
    const emailService = new EmailService();
    try {
      await Promise.race([
        emailService.sendPasswordResetEmail(email, resetLink),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Password reset email timeout")), 5000)),
      ]);
    } catch (sendErr) {
      console.error("Failed to send password reset email via Brevo:", sendErr);
    }
  }

  return ok(null);
}


export async function resetPasswordAction(formData: FormData): Promise<ApiResponse<null>> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form and try again."));
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData?.user?.email;
  const userName = userData?.user?.user_metadata?.full_name;

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Couldn't reset your password. Request a new reset link."));
  }

  // Send security confirmation email via Brevo
  if (userEmail) {
    const emailService = new EmailService();
    emailService.sendPasswordChangedEmail(userEmail, userName).catch((err) => {
      console.error("Failed to send password changed notification:", err);
    });
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

