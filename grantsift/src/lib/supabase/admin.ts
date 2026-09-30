import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/config";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Bypasses Row Level Security. Only for operations RLS genuinely cannot
 * express (e.g. an admin viewing across all users, or a server-side job
 * writing processing results before ownership context is available).
 * Never import this file from anything under `components/` or from any
 * `"use client"` module — the `server-only` import above will throw the
 * build if that happens.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
