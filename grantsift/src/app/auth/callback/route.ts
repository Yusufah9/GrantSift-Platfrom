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
  const admin = createAdminClient();

  // Handle token_hash verification (email confirmation or recovery from Brevo link)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.user_metadata?.full_name);

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Send welcome email for confirmed users if not already sent
      if (data.user.email) {
        await maybeSendWelcomeEmail(admin, data.user);
      }

      const redirectNext = next === "/dashboard" ? "/dashboard?onboarded=true" : next;
      return NextResponse.redirect(`${origin}${redirectNext}`);
    } else if (error) {
      console.error("[callback] verifyOtp error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Handle OAuth or PKCE code exchange (Google OAuth or email redirect)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureProfile(
        data.user.id,
        data.user.user_metadata?.full_name || data.user.user_metadata?.name
      );

      // Send welcome email for newly onboarded OAuth users if not already sent
      if (data.user.email) {
        await maybeSendWelcomeEmail(admin, data.user);
      }

      const redirectNext = next === "/dashboard" ? "/dashboard?onboarded=true" : next;
      return NextResponse.redirect(`${origin}${redirectNext}`);
    } else if (error) {
      console.error("[callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
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
 * Sends a welcome email if not already delivered to this user account.
 */
async function maybeSendWelcomeEmail(
  admin: ReturnType<typeof createAdminClient>,
  user: { id: string; email?: string; user_metadata?: Record<string, any> }
): Promise<void> {
  if (!user.email) return;

  // Don't duplicate welcome email if already marked sent
  if (user.user_metadata?.welcome_email_sent) return;

  const emailService = new EmailService();
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split("@")[0] ||
    "there";

  try {
    await Promise.race([
      emailService.sendWelcomeEmail(user.email, fullName),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Welcome email timeout")), 5000)),
    ]);

    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        welcome_email_sent: true,
      },
    });
  } catch (err) {
    console.error("[callback] Failed to send welcome email:", err);
  }
}

/**
 * Ensures a profile row exists for the given user.
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


