import type { Database } from "@/lib/supabase/database.types";
import { AppError } from "@/lib/errors/app-error";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export interface MediaValidationResult {
  valid: boolean;
  sanitizedValue?: string | null;
  sizeBytes?: number;
  error?: string;
}

/**
 * Service responsible for validating, sanitizing, and guarding blog post media.
 * Ensures images are stored as persistent HTTPS URLs (Supabase Storage or CDN)
 * rather than temporary blob URLs or raw database-bloating base64 data.
 */
export class BlogMediaService {
  public static readonly MAX_SAFE_IMAGE_BYTES = 350 * 1024;

  /**
   * Validates and sanitizes a featured image string (Persistent HTTPS URL or legacy Data URI).
   */
  public validate(imageInput?: string | null): MediaValidationResult {
    if (!imageInput || imageInput.trim() === "") {
      return { valid: true, sanitizedValue: null };
    }

    const trimmed = imageInput.trim();

    // Reject temporary browser blob URLs
    if (trimmed.startsWith("blob:")) {
      return {
        valid: false,
        error: "Temporary browser blob URLs cannot be saved. Please upload the image file directly.",
      };
    }

    // 1. Persistent HTTPS/HTTP URL (Supabase Storage, CDN, or external media)
    if (/^https?:\/\//i.test(trimmed)) {
      if (trimmed.length > 2048) {
        return { valid: false, error: "Image URL exceeds maximum length (2048 characters)." };
      }
      return { valid: true, sanitizedValue: trimmed };
    }

    // 2. Legacy Data URI (Base64) - handled for backwards compatibility
    if (trimmed.startsWith("data:image/")) {
      const commaIndex = trimmed.indexOf(",");
      if (commaIndex === -1) {
        return { valid: false, error: "Invalid image data format." };
      }

      const base64Data = trimmed.slice(commaIndex + 1);
      const estimatedBytes = Math.round((base64Data.length * 3) / 4);

      if (estimatedBytes > BlogMediaService.MAX_SAFE_IMAGE_BYTES) {
        throw new AppError(
          "VALIDATION_ERROR",
          `Image data is too large (${Math.round(estimatedBytes / 1024)} KB). Please upload image to storage instead.`
        );
      }

      return {
        valid: true,
        sanitizedValue: trimmed,
        sizeBytes: estimatedBytes,
      };
    }

    return {
      valid: false,
      error: "Featured image must be a valid HTTPS image URL or uploaded file.",
    };
  }

  /**
   * Guards a Post entity retrieved from the database.
   * If a legacy post contains an uncompressed multi-megabyte base64 string
   * that would crash Next.js RSC payload serialization on SSR, this sanitizes it
   * to ensure the post edit page can still load reliably and allow the admin to update it.
   */
  public sanitizePostForEdit(post: Post): Post {
    if (!post.featured_image) return post;

    // Check if legacy featured image is dangerously oversized (> 500KB)
    if (post.featured_image.startsWith("data:image/") && post.featured_image.length > 700_000) {
      console.warn(
        `[BlogMediaService] Post ${post.id} contains oversized legacy image (${post.featured_image.length} chars). Sanitizing for edit page.`
      );
      return {
        ...post,
        featured_image: null, // Allow admin to re-upload without crashing the page
      };
    }

    return post;
  }
}
