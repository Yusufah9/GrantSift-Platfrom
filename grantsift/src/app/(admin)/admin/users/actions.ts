"use server";

import { fail, type ApiResponse } from "@/lib/errors/app-error";

export async function setUserRoleAction(
  _userId: string,
  _role: "user" | "admin"
): Promise<ApiResponse<null>> {
  return fail(
    new Error(
      "Direct role escalation is disabled for tenant security. Administrator roles must be provisioned through secure infrastructure."
    )
  );
}
