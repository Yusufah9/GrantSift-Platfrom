import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import { BlogStorageService } from "@/lib/services/blog-storage-service";
import { AppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication & Admin Permissions
    const supabase = await createClient();
    const adminService = new AdminService(supabase);
    try {
      await adminService.assertCurrentUserIsAdmin();
    } catch (authErr: any) {
      const status = authErr?.code === "AUTHENTICATION_ERROR" ? 401 : 403;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: authErr?.code || "UNAUTHORIZED",
            message: authErr?.message || "Admin authorization required to upload blog images.",
          },
        },
        { status }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No image file provided. Please select a valid image file.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Fast Validation on Content Type & Size
    const mimeType = file.type || "application/octet-stream";
    if (!BlogStorageService.ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Unsupported image format (${mimeType}). Supported formats: JPG, PNG, WEBP, GIF.`,
          },
        },
        { status: 400 }
      );
    }

    if (file.size > BlogStorageService.MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Image is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
          },
        },
        { status: 400 }
      );
    }

    // 4. Read File Buffer and Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageService = new BlogStorageService();
    const result = await storageService.uploadImage(buffer, file.name || "image", mimeType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[BlogImageUploadAPI] Error handling image upload:", error);

    const message =
      error instanceof AppError
        ? error.message
        : error?.message || "Failed to upload image. Please try again.";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error?.code || "INTERNAL_ERROR",
          message,
        },
      },
      { status: error?.code === "VALIDATION_ERROR" ? 400 : 500 }
    );
  }
}
