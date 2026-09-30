"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { organizationProfileSchema, grantTargetSchema } from "@/lib/validation/project";
import { ProjectService } from "@/lib/services/project-service";
import { AppError, fail, type ApiResponse } from "@/lib/errors/app-error";

export async function createProjectAction(formData: FormData): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail(new AppError("AUTHENTICATION_ERROR", "Please log in to create a project."));
  }

  const raw = Object.fromEntries(formData);
  const org = organizationProfileSchema.safeParse(raw);
  if (!org.success) {
    return fail(new AppError("VALIDATION_ERROR", org.error.issues[0]?.message ?? "Check the organization fields."));
  }

  const grant = grantTargetSchema.safeParse(raw);
  if (!grant.success) {
    return fail(new AppError("VALIDATION_ERROR", grant.error.issues[0]?.message ?? "Check the grant funder fields."));
  }

  let project;
  try {
    project = await new ProjectService(supabase).createProject(user.id, org.data, grant.data);
  } catch (cause) {
    return fail(cause);
  }

  redirect(`/projects/${project.id}`);
}
