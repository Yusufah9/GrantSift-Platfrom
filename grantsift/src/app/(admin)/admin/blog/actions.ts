"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";
import { AdminService } from "@/lib/services/admin-service";
import { BlogStorageService } from "@/lib/services/blog-storage-service";
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
    if (post.slug) revalidatePath(`/blog/${post.slug}`);
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
    const blog = new BlogService(supabase);
    const existing = await blog.getById(postId);

    // If featured image was replaced or removed, optionally clean up old stored image
    if (
      existing?.featured_image &&
      parsed.data.featuredImage &&
      existing.featured_image !== parsed.data.featuredImage &&
      existing.featured_image.includes(BlogStorageService.BUCKET_NAME)
    ) {
      const storage = new BlogStorageService();
      await storage.deleteImageByUrlOrPath(existing.featured_image);
    }

    await blog.update(postId, parsed.data);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    if (parsed.data.slug) revalidatePath(`/blog/${parsed.data.slug}`);
    if (existing?.slug && existing.slug !== parsed.data.slug) {
      revalidatePath(`/blog/${existing.slug}`);
    }
  } catch (cause) {
    return fail(cause);
  }
  return ok(null);
}

export async function setPostStatusAction(
  postId: string,
  status: "draft" | "published" | "archived",
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).assertCurrentUserIsAdmin();
    const blog = new BlogService(supabase);
    const post = await blog.getById(postId);
    await blog.setStatus(postId, status);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  } catch (cause) {
    return fail(cause);
  }
  return ok(null);
}

export async function deletePostAction(postId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  try {
    await new AdminService(supabase).assertCurrentUserIsAdmin();
    const blog = new BlogService(supabase);
    const post = await blog.getById(postId);
    if (post?.featured_image && post.featured_image.includes(BlogStorageService.BUCKET_NAME)) {
      const storage = new BlogStorageService();
      await storage.deleteImageByUrlOrPath(post.featured_image);
    }
    await blog.delete(postId);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  } catch (cause) {
    return fail(cause);
  }
  return ok(null);
}
