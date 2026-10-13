"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWorkspaceOrganizationAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: org, error } = await (supabase as any)
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    // Also fetch saved grants for the user
    const { data: savedGrants } = await (supabase as any)
      .from("saved_grants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return {
      success: true,
      org: org || null,
      savedGrants: savedGrants || [],
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load organization" };
  }
}

export async function saveWorkspaceOrganizationAction(data: {
  orgName: string;
  projectName?: string;
  country: string;
  sector?: string;
  industry?: string;
  orgType?: string;
  fundingRequirement?: number;
  problemStatement?: string;
  solutionStatement?: string;
  targetBeneficiaries?: string;
  hasIncorporation?: boolean;
  hasAuditedFinancials?: boolean;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to save organization." };
    }

    const slug = data.orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if user already has an org
    const { data: existingOrg } = await (supabase as any)
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    const payload = {
      name: data.orgName,
      slug: slug || `org-${Date.now()}`,
      country: data.country,
      sector: data.sector || "Technology",
      industry: data.industry || data.sector || "Technology",
      org_type: data.orgType || "Startup",
      funding_currently_seeking: data.fundingRequirement || 100000,
      problem_statement: data.problemStatement,
      solution_statement: data.solutionStatement,
      target_beneficiaries: data.targetBeneficiaries,
      owner_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let orgResult;
    if (existingOrg) {
      const { data: updated, error } = await (supabase as any)
        .from("organizations")
        .update(payload)
        .eq("id", existingOrg.id)
        .select()
        .single();
      if (error) throw error;
      orgResult = updated;
    } else {
      const { data: inserted, error } = await (supabase as any)
        .from("organizations")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      orgResult = inserted;
    }

    revalidatePath("/workspace");
    revalidatePath("/dashboard");
    revalidatePath("/financial-model");
    revalidatePath("/business-plan");

    return { success: true, org: orgResult };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save organization." };
  }
}
