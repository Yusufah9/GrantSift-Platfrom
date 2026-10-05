import "server-only";
import dns from "node:dns";
import nodemailer, { type Transporter } from "nodemailer";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignored in non-supported runtimes
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/** Validate sender email formats like "Name <user@domain.com>" or "user@domain.com" */
export function isValidSenderAddress(from: string): boolean {
  if (!from || typeof from !== "string") return false;
  const trimmed = from.trim();
  const match = trimmed.match(/^(?:(?<name>[^<]+)\s+<(?<email>[^>]+)>|(?<rawEmail>[^<>\s]+))$/);
  const email = match?.groups?.email || match?.groups?.rawEmail;
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Sends transactional emails via Brevo SMTP relay with connection pooling and fast IPv4 routing. */
export class BrevoProvider implements EmailProvider {
  private transporter: Transporter;
  private fromAddress: string;

  constructor() {
    const key = process.env.BREVO_SMTP_KEY;
    if (!key) {
      throw new Error("BREVO_SMTP_KEY is not configured.");
    }

    const from = process.env.EMAIL_FROM ?? "GrantSift <bc10e8001@smtp-brevo.com>";
    if (!isValidSenderAddress(from)) {
      throw new Error(
        `EMAIL_FROM "${from}" is invalid. Expected format "Name <email@example.com>" or "email@example.com".`,
      );
    }
    this.fromAddress = from;

    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_SERVER ?? "smtp-relay.brevo.com",
      port: Number(process.env.BREVO_SMTP_PORT ?? 587),
      secure: false, // 587 uses STARTTLS
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: {
        user: process.env.BREVO_SMTP_USER ?? "bc10e8001@smtp-brevo.com",
        pass: key,
      },
      connectionTimeout: 8_000,
      greetingTimeout: 5_000,
      socketTimeout: 10_000,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      console.info(`[email:brevo] Sent "${message.subject}" to ${message.to} (id: ${info.messageId})`);
    } catch (error) {
      console.error(`[email:brevo] Failed to send email to ${message.to}:`, error);
      throw error;
    }
  }
}

/** No-op provider used when no email provider is configured, so local dev doesn't crash. */
export class NoopProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email:noop] Would send "${message.subject}" to ${message.to}`);
  }
}

let cachedProvider: EmailProvider | null = null;

export function resetEmailProviderCache(): void {
  cachedProvider = null;
}

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  const provider = process.env.EMAIL_PROVIDER;
  if (provider === "brevo" && process.env.BREVO_SMTP_KEY) {
    cachedProvider = new BrevoProvider();
    return cachedProvider;
  }
  cachedProvider = new NoopProvider();
  return cachedProvider;
}



