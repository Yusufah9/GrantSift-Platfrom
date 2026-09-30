import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/** Sends via Resend. Add a sibling class here for Postmark/SendGrid if needed. */
class ResendProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "GrantSift <hello@grantsift.app>",
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Email provider returned ${response.status}`);
    }
  }
}

/** No-op provider used when no email provider is configured, so local dev doesn't crash. */
class NoopProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email:noop] Would send "${message.subject}" to ${message.to}`);
  }
}

export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER;
  if (provider === "resend" && process.env.RESEND_API_KEY) {
    return new ResendProvider();
  }
  return new NoopProvider();
}
