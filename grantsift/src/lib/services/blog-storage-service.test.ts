import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlogStorageService } from "@/lib/services/blog-storage-service";
import { BlogMediaService } from "@/lib/services/blog-media-service";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    storage: {
      listBuckets: vi.fn().mockResolvedValue({
        data: [{ name: "blog-images" }],
        error: null,
      }),
      createBucket: vi.fn().mockResolvedValue({ error: null }),
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: "posts/12345-test.webp" },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: {
            publicUrl: "https://test.supabase.co/storage/v1/object/public/blog-images/posts/12345-test.webp",
          },
        }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}));

describe("BlogStorageService", () => {
  let service: BlogStorageService;

  beforeEach(() => {
    service = new BlogStorageService();
  });

  it("uploads supported image format (JPEG, PNG, WEBP, GIF)", async () => {
    const buffer = Buffer.from("fake-image-bytes");
    const result = await service.uploadImage(buffer, "test.png", "image/png");

    expect(result.url).toContain("https://test.supabase.co/storage/v1/object/public/blog-images/");
    expect(result.mimeType).toBe("image/png");
    expect(result.sizeBytes).toBe(buffer.byteLength);
  });

  it("rejects unsupported MIME types", async () => {
    const buffer = Buffer.from("pdf-data");
    await expect(
      service.uploadImage(buffer, "test.pdf", "application/pdf")
    ).rejects.toThrow("Unsupported image format");
  });

  it("rejects oversized images (> 10MB)", async () => {
    // 11MB fake buffer
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(
      service.uploadImage(largeBuffer, "huge.jpg", "image/jpeg")
    ).rejects.toThrow("Image is too large");
  });

  it("deletes images by URL or path", async () => {
    await expect(
      service.deleteImageByUrlOrPath(
        "https://test.supabase.co/storage/v1/object/public/blog-images/posts/123-test.webp"
      )
    ).resolves.not.toThrow();
  });
});

describe("BlogMediaService", () => {
  const mediaService = new BlogMediaService();

  it("accepts valid persistent HTTPS URLs", () => {
    const res = mediaService.validate(
      "https://test.supabase.co/storage/v1/object/public/blog-images/posts/hero.webp"
    );
    expect(res.valid).toBe(true);
    expect(res.sanitizedValue).toBe(
      "https://test.supabase.co/storage/v1/object/public/blog-images/posts/hero.webp"
    );
  });

  it("rejects temporary browser blob: URLs", () => {
    const res = mediaService.validate("blob:http://localhost:3000/123-456");
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Temporary browser blob URLs cannot be saved");
  });

  it("accepts empty or null featured image", () => {
    expect(mediaService.validate("").valid).toBe(true);
    expect(mediaService.validate(null).valid).toBe(true);
  });
});
