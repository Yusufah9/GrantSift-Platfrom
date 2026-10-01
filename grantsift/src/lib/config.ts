import { z } from "zod";

/**
 * Central environment contract. Import `getServerConfig()` from any
 * server-only module instead of reading `process.env` directly, so a
 * missing variable fails with a clear message instead of a runtime
 * `undefined is not a function` deep inside a service.
 */
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1).optional(),
  YOUTUBE_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type ServerConfig = z.infer<typeof serverSchema>;

let cached: ServerConfig | null = null;

export function getServerConfig(): ServerConfig {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => i.path.join("."))
      .join(", ");
    throw new Error(
      `GrantSift is misconfigured. Missing or invalid environment variables: ${missing}. ` +
        `Add them to .env.local (see .env.example) or your Vercel project settings.`,
    );
  }
  cached = parsed.data;
  return cached;
}

/** Confirms Google OAuth credentials are configured server-side (configured inside Supabase Auth). */
export function assertGoogleOAuthConfigured(): void {
  requireEnv("GOOGLE_OAUTH_CLIENT_ID");
  requireEnv("GOOGLE_OAUTH_CLIENT_SECRET");
}

/** Throws a clear, non-leaking error for a single required service key. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not configured. Add it to your local environment or Vercel project settings.`,
    );
  }
  return value;
}

