"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import { fail, ok, type ApiResponse } from "@/lib/errors/app-error";

export async function setUserRoleAction(userId: string, role: "user" | "admin"): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).setUserRole(userId, role);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath("/admin/users");
  return ok(null);
}

