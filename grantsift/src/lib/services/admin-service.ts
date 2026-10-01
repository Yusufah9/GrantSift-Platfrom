import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors/app-error";

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export class AdminService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Throws unless the currently authenticated user has role='admin'. Every admin action calls this first. */
  async assertCurrentUserIsAdmin(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new AppError("AUTHENTICATION_ERROR", "Please log in.");

    const { data: profile, error } = await this.supabase.from("profiles").select("role").eq("id", user.id).single();
    if (error || profile?.role !== "admin") {
      throw new AppError("AUTHORIZATION_ERROR", "This page is only available to administrators.");
    }
    return user.id;
  }

  async listUsers(): Promise<AdminUserRow[]> {
    await this.assertCurrentUserIsAdmin();

    // Listing every user's email requires the service-role client — Supabase
    // Auth's user list isn't reachable through RLS-scoped PostgREST at all.
    // This only runs after the admin check above.
    const admin = createAdminClient();
    const [{ data: authUsers }, { data: profiles, error: profilesError }] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 200 }),
      admin.from("profiles").select("*"),
    ]);
    if (profilesError) throw profilesError;

    const profileByI = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (authUsers?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      fullName: profileByI.get(u.id)?.full_name ?? null,
      role: profileByI.get(u.id)?.role ?? "user",
      createdAt: u.created_at,
    }));
  }

  async setUserRole(targetUserId: string, role: "user" | "admin"): Promise<void> {
    const currentUserId = await this.assertCurrentUserIsAdmin();
    if (targetUserId === currentUserId && role !== "admin") {
      throw new AppError("VALIDATION_ERROR", "You can't remove your own admin access.");
    }

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ role }).eq("id", targetUserId);
    if (error) throw error;
  }
}

