import "server-only";
import dns from "node:dns";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors/app-error";

// Ensure IPv4 is prioritized in Node DNS resolution to prevent undici timeouts
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where not supported
}

export interface UploadedImageResult {
  url: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  filename: string;
}

export class BlogStorageService {
  public static readonly BUCKET_NAME = "blog-images";
  public static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max
  public static readonly ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  private static bucketEnsured = false;

  /**
   * Ensures the blog-images bucket exists and is public in Supabase.
   */
  public async ensureBucket(): Promise<void> {
    if (BlogStorageService.bucketEnsured) return;

    const supabase = createAdminClient();
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        console.warn("[BlogStorageService] Error listing buckets:", listError.message);
        return;
      }

      const existing = buckets?.find((b) => b.name === BlogStorageService.BUCKET_NAME);
      if (!existing) {
        const { error: createError } = await supabase.storage.createBucket(
          BlogStorageService.BUCKET_NAME,
          {
            public: true,
            fileSizeLimit: BlogStorageService.MAX_FILE_SIZE_BYTES,
            allowedMimeTypes: Array.from(BlogStorageService.ALLOWED_MIME_TYPES),
          }
        );
        if (createError && !createError.message.includes("already exists")) {
          console.warn("[BlogStorageService] Could not create bucket:", createError.message);
        }
      }
      BlogStorageService.bucketEnsured = true;
    } catch (err: any) {
      console.warn("[BlogStorageService] Bucket verification warning:", err?.message);
    }
  }

  /**
   * Uploads an image file to Supabase Storage and returns its persistent public URL.
   */
  public async uploadImage(
    fileBuffer: Buffer | Uint8Array,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadedImageResult> {
    if (!BlogStorageService.ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Unsupported image format (${mimeType}). Supported formats: JPG, PNG, WEBP, GIF.`
      );
    }

    if (fileBuffer.byteLength > BlogStorageService.MAX_FILE_SIZE_BYTES) {
      const sizeMb = (fileBuffer.byteLength / (1024 * 1024)).toFixed(1);
      throw new AppError(
        "VALIDATION_ERROR",
        `Image is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`
      );
    }

    await this.ensureBucket();

    // Generate clean extension
    let ext = "webp";
    if (mimeType === "image/jpeg") ext = "jpg";
    else if (mimeType === "image/png") ext = "png";
    else if (mimeType === "image/gif") ext = "gif";

    // Clean filename for storage path
    const sanitizedBase = originalFilename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40)
      .toLowerCase();

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storagePath = `posts/${timestamp}-${sanitizedBase || "featured"}-${randomSuffix}.${ext}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(BlogStorageService.BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: "31536000", // 1 year cache header
      });

    if (error) {
      console.error("[BlogStorageService] Upload failed:", error);
      throw new AppError(
        "PROCESSING_ERROR",
        `Failed to upload image to storage: ${error.message || "Storage error"}. Please try again.`
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BlogStorageService.BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new AppError(
        "PROCESSING_ERROR",
        "Failed to resolve public image URL from storage."
      );
    }

    return {
      url: publicUrl,
      path: data.path,
      sizeBytes: fileBuffer.byteLength,
      mimeType,
      filename: originalFilename,
    };
  }

  /**
   * Deletes an image from storage if it belongs to our bucket.
   */
  public async deleteImageByUrlOrPath(urlOrPath: string): Promise<void> {
    if (!urlOrPath) return;

    let path = urlOrPath;
    if (urlOrPath.startsWith("http")) {
      const bucketMarker = `/${BlogStorageService.BUCKET_NAME}/`;
      const idx = urlOrPath.indexOf(bucketMarker);
      if (idx === -1) return; // Not our bucket
      const parsedPath = urlOrPath.slice(idx + bucketMarker.length).split("?")[0];
      if (!parsedPath) return;
      path = parsedPath;
    }

    try {
      const supabase = createAdminClient();
      await supabase.storage.from(BlogStorageService.BUCKET_NAME).remove([path]);
    } catch (err) {
      console.warn("[BlogStorageService] Delete image failed:", err);
    }
  }
}
