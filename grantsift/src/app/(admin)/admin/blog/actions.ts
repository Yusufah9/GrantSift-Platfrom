"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";
import { AdminService } from "@/lib/services/admin-service";
import { postSchema } from "@/lib/validation/blog";
import { AppError, fail, ok, type ApiResponse } from "@/lib/errors/app-error";

export async function createPostAction(formData: FormData): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    const userId = await new AdminService(supabase).assertCurrentUserIsAdmin();
    const parsed = postSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form."));
    }
    const post = await new BlogService(supabase).create(userId, parsed.data);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect(`/admin/blog/${post.id}/edit`);
  } catch (cause) {
    return fail(cause);
  }
}

export async function updatePostAction(postId: string, formData: FormData): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).assertCurrentUserIsAdmin();
    const parsed = postSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the form."));
    }
    await new BlogService(supabase).update(postId, parsed.data);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return ok(null);
}

export async function setPostStatusAction(
  postId: string,
  status: "draft" | "published" | "archived",
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).assertCurrentUserIsAdmin();
    await new BlogService(supabase).setStatus(postId, status);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return ok(null);
}

export async function deletePostAction(postId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).assertCurrentUserIsAdmin();
    await new BlogService(supabase).delete(postId);
  } catch (cause) {
    return fail(cause);
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return ok(null);
}
