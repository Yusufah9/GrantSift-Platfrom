import "server-only";
import { getEmailProvider } from "@/lib/email/email-provider";

export class EmailService {
  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    const provider = getEmailProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    await provider.send({
      to,
      subject: "Welcome to GrantSift",
      text: `Hi ${fullName},\n\nYour GrantSift account is ready. Add a grant funder to see what your organization needs to apply: ${appUrl}/projects/new\n\nThe GrantSift team`,
      html: `<p>Hi ${escapeHtml(fullName)},</p><p>Your GrantSift account is ready. Add a grant funder to see what your organization needs to apply.</p><p><a href="${appUrl}/projects/new">Start a project</a></p><p>The GrantSift team</p>`,
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
}
