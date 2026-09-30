"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ProcessingPipelineService } from "@/lib/services/processing-pipeline-service";
import { ReadinessService } from "@/lib/services/readiness-service";
import { SopService } from "@/lib/services/sop-service";
import { fail, ok, type ApiResponse } from "@/lib/errors/app-error";
import { AppError } from "@/lib/errors/app-error";
import type { Database } from "@/lib/supabase/database.types";

type SopStatus = Database["public"]["Tables"]["sop_tasks"]["Row"]["status"];

export async function runAnalysisAction(projectId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Please log in to run analysis."));
  }

  try {
    // Every query inside ProcessingPipelineService goes through this same
    // user-scoped client, so Row Level Security — not this check — is what
    // actually prevents running analysis on someone else's project.
    await new ProcessingPipelineService(supabase).run(projectId);
  } catch (cause) {
    return fail(cause);
  }

  revalidatePath(`/projects/${projectId}`);
  return ok(null);
}

async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AppError("AUTHENTICATION_ERROR", "Please log in.");
  return user;
}

export async function generateReadinessAction(projectId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    // RLS on readiness_items and its parent project scopes this to the caller's own data.
    await new ReadinessService(supabase).assess(projectId);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath(`/projects/${projectId}`);
  return ok(null);
}

export async function generateSopAction(projectId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    await new SopService(supabase).generate(projectId);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath(`/projects/${projectId}`);
  return ok(null);
}

export async function updateSopTaskStatusAction(
  projectId: string,
  taskId: string,
  status: SopStatus,
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const { error } = await supabase.from("sop_tasks").update({ status }).eq("id", taskId);
    if (error) throw new AppError("DATABASE_ERROR", "Couldn't update that task. Please try again.", error);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath(`/projects/${projectId}`);
  return ok(null);
}
