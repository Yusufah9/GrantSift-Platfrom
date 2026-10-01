import "server-only";
import { getEmailProvider } from "@/lib/email/email-provider";

export class EmailService {
  /**
   * Confirmation link sent when a user signs up with email.
   */
  async sendConfirmationEmail(to: string, fullName: string, confirmationLink: string): Promise<void> {
    const provider = getEmailProvider();
    const safeName = escapeHtml(fullName || "there");
    const safeLink = escapeHtml(confirmationLink);

    await provider.send({
      to,
      subject: "Confirm your GrantSift account ✉️",
      text: `Hi ${fullName || "there"},\n\nWelcome to GrantSift! Please confirm your email address by opening this link:\n\n${confirmationLink}\n\nOnce verified, you will be onboarded to your dashboard immediately.\n\nIf you did not request this, you can safely ignore this email.\n\n— The GrantSift Team`,
      html: renderEmailTemplate({
        title: "Confirm Your Email",
        previewText: "One click away from your GrantSift dashboard — verify your email now.",
        accentColor: "#B4661E",
        bodyHtml: `
          <p style="margin: 0 0 8px; font-size: 15px; line-height: 24px; color: #4B5049;">Hi <strong style="color: #191C19;">${safeName}</strong>,</p>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #4B5049;">
            Thank you for creating your <strong style="color: #191C19;">GrantSift</strong> account. You're one step away from accessing your grant discovery dashboard.
          </p>

          <!-- Highlight box -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%); border-radius: 8px; padding: 28px 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(239,238,231,0.5);">Action required</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #EFEEE7; font-family: Georgia, serif;">Verify Your Email Address</p>
            <a href="${safeLink}" style="display: inline-block; background: #B4661E; color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-weight: 700; font-size: 14px; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(180,102,30,0.5);">
              ✓ Confirm Email &amp; Access Dashboard
            </a>
          </div>

          <p style="margin: 20px 0 8px; font-size: 13px; color: #7A7F76;">Or copy this URL into your browser:</p>
          <p style="margin: 0 0 20px; font-size: 11px; word-break: break-all; color: #B4661E; font-family: monospace; background: #F7F6F1; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #B4661E;">
            <a href="${safeLink}" style="color: #8F4F17; text-decoration: none;">${safeLink}</a>
          </p>

          <!-- What happens next -->
          <div style="border: 1px solid #D9D6C9; border-radius: 6px; padding: 16px 20px; margin: 20px 0 0; background: #FAFAF8;">
            <p style="margin: 0 0 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7A7F76;">What happens next</p>
            ${["Your account is instantly activated", "You're redirected to your dashboard", "Start discovering grant funders immediately"].map((step, i) => `
            <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: ${i < 2 ? "8px" : "0"};">
              <span style="flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: #B4661E; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; line-height: 20px; text-align: center;">${i + 1}</span>
              <p style="margin: 0; font-size: 13px; color: #4B5049; line-height: 20px;">${step}</p>
            </div>`).join("")}
          </div>

          <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
            Didn't sign up for GrantSift? No action needed — this link will expire automatically.
          </p>
        `,
      }),
    });
  }

  /**
   * Welcome email sent after successful account confirmation / Google OAuth signup.
   */
  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    const provider = getEmailProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://grant-sift-platfrom.vercel.app";
    const safeName = escapeHtml(fullName || "there");
    const safeAppUrl = escapeHtml(appUrl);
    const firstName = (fullName || "there").split(" ")[0] ?? "there";

    await provider.send({
      to,
      subject: `Welcome to GrantSift, ${firstName}! 🎉 Your account is ready`,
      text: `Hi ${fullName || "there"},\n\nWelcome to GrantSift! Your account is active and ready. Start discovering grant funders and analyzing readiness criteria.\n\nDashboard: ${appUrl}/dashboard\n\n— The GrantSift Team`,
      html: renderEmailTemplate({
        title: `Welcome to GrantSift, ${firstName}!`,
        previewText: "Your account is live. Discover funders, analyze grants, and build your application today.",
        accentColor: "#B4661E",
        bodyHtml: `
          <!-- Hero welcome banner -->
          <div style="background: linear-gradient(135deg, #191C19 0%, #2c1810 50%, #1a1208 100%); border-radius: 8px; padding: 32px 24px 28px; margin-bottom: 24px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 1;">
              <div style="width: 56px; height: 56px; background: rgba(180,102,30,0.2); border: 2px solid rgba(180,102,30,0.4); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎉</span>
              </div>
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #B4661E;">Account Verified</p>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #EFEEE7; font-family: Georgia, serif; letter-spacing: -0.01em;">You're in, ${escapeHtml(firstName)}!</h2>
              <p style="margin: 0; font-size: 14px; color: rgba(239,238,231,0.65); line-height: 1.5;">Your GrantSift workspace is live and fully active.</p>
            </div>
          </div>

          <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #4B5049;">
            Hi <strong style="color: #191C19;">${safeName}</strong>, welcome to <strong style="color: #191C19;">GrantSift</strong> — your AI-powered grant discovery and readiness engine. Here's what you can do right now:
          </p>

          <!-- Feature cards -->
          ${[
            { icon: "🔍", title: "Discover Funders", desc: "Add a funder URL and let GrantSift extract eligibility criteria automatically." },
            { icon: "📋", title: "Check Readiness", desc: "AI cross-checks your organization profile against grant requirements instantly." },
            { icon: "📝", title: "Generate SOPs", desc: "Get a practical task list for every gap — with owners, inputs, and outputs." },
          ].map(f => `
          <div style="display: flex; gap: 14px; padding: 14px 16px; background: #F7F6F1; border: 1px solid #E8E6DE; border-radius: 6px; margin-bottom: 10px;">
            <div style="flex-shrink: 0; width: 36px; height: 36px; background: rgba(180,102,30,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">${f.icon}</div>
            <div>
              <p style="margin: 0 0 3px; font-size: 13px; font-weight: 700; color: #191C19;">${f.title}</p>
              <p style="margin: 0; font-size: 12px; color: #7A7F76; line-height: 1.5;">${f.desc}</p>
            </div>
          </div>`).join("")}

          <!-- CTA -->
          <div style="margin: 28px 0 0; text-align: center;">
            <a href="${safeAppUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #B4661E, #8F4F17); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(180,102,30,0.4); letter-spacing: 0.01em;">
              Go to My Dashboard →
            </a>
            <p style="margin: 14px 0 0; font-size: 12px; color: #7A7F76;">
              Or visit <a href="${safeAppUrl}/dashboard" style="color: #B4661E; text-decoration: none;">${safeAppUrl}/dashboard</a>
            </p>
          </div>
        `,
      }),
    });
  }

  /**
   * Password reset link sent when a user requests forgot password.
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const provider = getEmailProvider();
    const safeLink = escapeHtml(resetLink);

    await provider.send({
      to,
      subject: "Reset your GrantSift password 🔐",
      text: `Hello,\n\nWe received a request to reset your GrantSift account password. Click the link below to set a new password:\n\n${resetLink}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.\n\n— The GrantSift Team`,
      html: renderEmailTemplate({
        title: "Password Reset Request",
        previewText: "We got your reset request — click to choose a new GrantSift password.",
        accentColor: "#2E5C4B",
        bodyHtml: `
          <!-- Warning banner -->
          <div style="background: linear-gradient(135deg, #1F4438 0%, #2E5C4B 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🔐</div>
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(221,233,226,0.6);">Security Action</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #EFEEE7; font-family: Georgia, serif;">Password Reset</p>
          </div>

          <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #4B5049;">
            Hello, we received a request to reset the password for your GrantSift account. Click the button below to choose a new password:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${safeLink}" style="display: inline-block; background: linear-gradient(135deg, #2E5C4B, #1F4438); color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(46,92,75,0.5);">
              🔑 Reset My Password
            </a>
          </div>

          <p style="margin: 0 0 8px; font-size: 13px; color: #7A7F76;">Or copy this URL into your browser:</p>
          <p style="margin: 0 0 24px; font-size: 11px; word-break: break-all; color: #2E5C4B; font-family: monospace; background: #F7F6F1; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #2E5C4B;">
            <a href="${safeLink}" style="color: #1F4438; text-decoration: none;">${safeLink}</a>
          </p>

          <!-- Security notes -->
          <div style="border: 1px solid #D9D6C9; border-radius: 6px; padding: 16px; background: #FAFAF8;">
            ${[
              { icon: "⏱", text: "<strong>Expires in 1 hour</strong> — request a new link if it expires." },
              { icon: "🛡", text: "<strong>One-time use only</strong> — the link becomes invalid after use." },
              { icon: "⚠️", text: "If you didn't request this, your password is <strong>safe and unchanged</strong>." },
            ].map(n => `
            <div style="display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start;">
              <span style="font-size: 14px; flex-shrink: 0;">${n.icon}</span>
              <p style="margin: 0; font-size: 13px; color: #4B5049; line-height: 1.5;">${n.text}</p>
            </div>`).join("")}
          </div>
        `,
      }),
    });
  }

  /**
   * Notification sent when password was successfully changed.
   */
  async sendPasswordChangedEmail(to: string, fullName?: string): Promise<void> {
    const provider = getEmailProvider();
    const safeName = escapeHtml(fullName || "there");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://grant-sift-platfrom.vercel.app";
    const safeAppUrl = escapeHtml(appUrl);

    await provider.send({
      to,
      subject: "Your GrantSift password was changed ✅",
      text: `Hi ${fullName || "there"},\n\nYour GrantSift account password has been successfully updated. If you made this change, no further action is required.\n\nIf you did not perform this change, please contact support immediately.\n\nDashboard: ${appUrl}/dashboard\n\n— The GrantSift Team`,
      html: renderEmailTemplate({
        title: "Password Updated Successfully",
        previewText: "Your GrantSift account password has been changed successfully.",
        accentColor: "#2E5C4B",
        bodyHtml: `
          <!-- Success banner -->
          <div style="background: linear-gradient(135deg, #1F4438 0%, #2E5C4B 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">✅</div>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #EFEEE7; font-family: Georgia, serif;">Password Updated</p>
          </div>

          <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #4B5049;">
            Hi <strong style="color: #191C19;">${safeName}</strong>, your GrantSift account password was successfully updated on <strong>${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>.
          </p>

          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">✓ You can now log in with your new password.</p>
          </div>

          <div style="text-align: center; margin: 20px 0 24px;">
            <a href="${safeAppUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #2E5C4B, #1F4438); color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(46,92,75,0.4);">
              Go to Login
            </a>
          </div>

          <div style="border: 1px solid #FCA5A5; background: #FFF1F2; border-radius: 6px; padding: 14px 16px;">
            <p style="margin: 0; font-size: 13px; color: #991B1B; line-height: 1.5;">
              ⚠️ <strong>Didn't make this change?</strong> Your account may be compromised. <a href="mailto:support@grantsift.org" style="color: #991B1B; font-weight: 600;">Contact support immediately</a>.
            </p>
          </div>
        `,
      }),
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
}

function renderEmailTemplate({
  title,
  previewText,
  bodyHtml,
  accentColor = "#B4661E",
}: {
  title: string;
  previewText: string;
  bodyHtml: string;
  accentColor?: string;
}): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #EFEEE7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    a { text-decoration: none; }
    @media (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EFEEE7;">
  <!-- Preheader / Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <!-- Email wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #EFEEE7; padding: 40px 16px 56px;">
    <tr>
      <td align="center">
        <table class="email-container" role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 10px; overflow: hidden; border: 1px solid #D9D6C9; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header / Logo bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%); padding: 20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #EFEEE7; letter-spacing: -0.02em;">
                      Grant<span style="color: ${accentColor};">Sift</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(239,238,231,0.4); border: 1px solid rgba(239,238,231,0.15); border-radius: 4px; padding: 3px 8px;">
                      Secured · Brevo
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent top stripe -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, ${accentColor} 0%, ${accentColor}88 100%);"></td>
          </tr>

          <!-- Body content -->
          <tr>
            <td class="mobile-padding" style="padding: 36px 40px 32px;">
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em; line-height: 1.3; font-family: Georgia, serif;">
                ${escapeHtml(title)}
              </h1>
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #F7F6F1; border-top: 1px solid #E8E6DE; padding: 20px 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px; font-size: 12px; color: #7A7F76; line-height: 1.6;">
                      You received this email because you have a <strong>GrantSift</strong> account.<br>
                      This email was sent securely via <strong>Brevo</strong> transactional email service.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                      © ${year} GrantSift · Grant Discovery &amp; Readiness Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
