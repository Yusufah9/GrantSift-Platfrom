import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmailService } from "@/lib/email/email-service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error") || searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`);
  }

  const supabase = await createClient();

  // Handle token_hash verification (email confirmation or recovery from Brevo link)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.user) {
      const isNew = await ensureProfile(data.user.id, data.user.user_metadata?.full_name);

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Send welcome email for newly confirmed users
      if (isNew && data.user.email) {
        const emailService = new EmailService();
        emailService.sendWelcomeEmail(
          data.user.email,
          data.user.user_metadata?.full_name || data.user.email.split("@")[0] || "there"
        ).catch((err) => console.error("[callback] Failed to send welcome email:", err));
      }

      const redirectNext = next === "/dashboard" ? "/dashboard?onboarded=true" : next;
      return NextResponse.redirect(`${origin}${redirectNext}`);
    }
  }

  // Handle OAuth or PKCE code exchange (Google OAuth or email redirect)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const isNew = await ensureProfile(
        data.user.id,
        data.user.user_metadata?.full_name || data.user.user_metadata?.name
      );

      // Send welcome email for newly onboarded users (Google OAuth new signups)
      if (isNew && data.user.email) {
        const emailService = new EmailService();
        emailService.sendWelcomeEmail(
          data.user.email,
          data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email.split("@")[0] ||
            "there"
        ).catch((err) => console.error("[callback] Failed to send welcome email:", err));
      }

      const redirectNext = next === "/dashboard" ? "/dashboard?onboarded=true" : next;
      return NextResponse.redirect(`${origin}${redirectNext}`);
    }
  }

  // Fallback check if user is already authenticated in session
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await ensureProfile(user.id, user.user_metadata?.full_name || user.user_metadata?.name);
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

/**
 * Ensures a profile row exists for the given user.
 * Returns `true` if a new profile was created (= first time this user onboarded).
 */
async function ensureProfile(userId: string, fullName?: string | null): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!data) {
      await admin.from("profiles").insert({
        id: userId,
        full_name: fullName || "GrantSift Member",
        role: "user",
      });
      return true; // newly created
    }
    return false; // already existed
  } catch (err) {
    console.error("Failed to ensure user profile:", err);
    return false;
  }
}
