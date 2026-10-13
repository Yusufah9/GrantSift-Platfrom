"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ApiResponse } from "@/lib/errors/app-error";

export interface SaveGrantPayload {
  grantId: string;
  grantName: string;
  funderName: string;
  amountMax?: number;
  currency?: string;
  deadline?: string;
  notes?: string;
}

function parseDateOrNull(d?: string): string | null {
  if (!d) return null;
  // If format is like "2026-12-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0]!;
}

/**
 * Gets or creates the primary organization for the authenticated user.
 */
async function getOrCreateUserOrg(supabase: any, user: any) {
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOrg) return existingOrg;

  // Create default organization if none exists yet
  const orgName =
    user.user_metadata?.organization_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "My Organization";
  const slug = `org-${user.id.slice(0, 8)}-${Date.now()}`;

  const { data: createdOrg, error } = await supabase
    .from("organizations")
    .insert({
      name: orgName,
      slug,
      owner_id: user.id,
      country: "Nigeria",
      sector: "Technology",
      org_type: "Startup",
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("Error creating default organization:", error);
    throw error;
  }

  return createdOrg;
}

export async function saveGrantToTrackerAction(payload: SaveGrantPayload): Promise<ApiResponse<{ saved: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return fail(new Error("Please log in to save grants."));
    }

    const org = await getOrCreateUserOrg(supabase, user);
    const parsedDeadline = parseDateOrNull(payload.deadline);

    // 1. Check if already in saved_grants
    const { data: existingSaved } = await (supabase as any)
      .from("saved_grants")
      .select("id")
      .eq("organization_id", org.id)
      .eq("grant_id", payload.grantId)
      .maybeSingle();

    if (!existingSaved) {
      const { error: saveErr } = await (supabase as any).from("saved_grants").insert({
        organization_id: org.id,
        user_id: user.id,
        grant_id: payload.grantId,
        grant_title: payload.grantName,
        funder_name: payload.funderName,
        amount_max: payload.amountMax || null,
        currency: payload.currency || "USD",
        deadline: parsedDeadline,
        notes: payload.notes || "Saved from Grant Discovery Catalog",
      });

      if (saveErr) {
        console.warn("saved_grants insert error:", saveErr.message);
      }
    }

    // 2. Also ensure a tracking record exists in grant_applications
    const { data: existingApp } = await (supabase as any)
      .from("grant_applications")
      .select("id")
      .eq("organization_id", org.id)
      .eq("title", payload.grantName)
      .maybeSingle();

    if (!existingApp) {
      await (supabase as any).from("grant_applications").insert({
        organization_id: org.id,
        title: payload.grantName,
        funder_name: payload.funderName,
        amount_requested: payload.amountMax || 100000,
        currency: payload.currency || "USD",
        deadline: parsedDeadline,
        stage: "discovered",
        notes: `Opportunity ID: ${payload.grantId}. Saved from Grant Discovery Engine.`,
      });
    }

    // 3. Log activity
    try {
      await (supabase as any).from("activity_logs").insert({
        organization_id: org.id,
        user_id: user.id,
        action: "grant_saved",
        entity_type: "grant",
        entity_id: payload.grantId,
        details: { grantTitle: payload.grantName, funderName: payload.funderName },
      });
    } catch {
      // Activity logging is non-blocking
    }

    revalidatePath("/database");
    revalidatePath("/discover");
    revalidatePath("/tracker");
    revalidatePath("/dashboard");

    return ok({ saved: true });
  } catch (err: any) {
    console.error("saveGrantToTrackerAction error:", err);
    return fail(err);
  }
}

export async function removeGrantFromTrackerAction(grantId: string): Promise<ApiResponse<{ removed: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return fail(new Error("Please log in."));

    const org = await getOrCreateUserOrg(supabase, user);

    await (supabase as any)
      .from("saved_grants")
      .delete()
      .eq("organization_id", org.id)
      .eq("grant_id", grantId);

    revalidatePath("/database");
    revalidatePath("/discover");
    revalidatePath("/tracker");
    revalidatePath("/dashboard");

    return ok({ removed: true });
  } catch (err: any) {
    return fail(err);
  }
}

export async function updateApplicationStageAction(params: {
  applicationId: string;
  stage: string;
  notes?: string;
}): Promise<ApiResponse<{ updated: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return fail(new Error("Please log in."));

    const { error } = await (supabase as any)
      .from("grant_applications")
      .update({
        stage: params.stage,
        notes: params.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.applicationId);

    if (error) throw error;

    revalidatePath("/tracker");
    revalidatePath("/dashboard");

    return ok({ updated: true });
  } catch (err: any) {
    return fail(err);
  }
}
