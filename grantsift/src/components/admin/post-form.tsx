"use client";

import { useActionState, useState, useTransition } from "react";
import slugify from "slugify";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormError } from "@/components/auth/form-error";
import type { Database } from "@/lib/supabase/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

const initialState: ApiResponse<null> | null = null;

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function PostForm({
  action,
  post,
  initialCategory,
  initialTags,
}: {
  action: (formData: FormData) => Promise<ApiResponse<null>>;
  post?: Post;
  initialCategory?: string;
  initialTags?: string;
}) {
  const [state, formAction, isSaving] = useActionState(
    async (_prev: typeof initialState, fd: FormData) => action(fd),
    initialState
  );

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    post?.status ?? "draft"
  );

  // Persistent image URL from storage
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(post?.featured_image ?? null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(
    post?.featured_image ? { name: "Existing Featured Image", size: "Saved" } : null
  );

  // Upload lifecycle state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

  /**
   * Uploads an image separately to POST /api/blog/images (Decoupled Flow, PRD §5)
   */
  const uploadImageFile = async (file: File) => {
    setUploadError(null);

    // Immediate size validation
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(
        `Image is too large (${formatBytes(file.size)}). Please upload an image below 10 MB.`
      );
      return;
    }

    // Immediate MIME type validation
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      setUploadError(
        `Unsupported image format (${file.type || "unknown"}). Supported formats: JPG, PNG, WEBP, GIF.`
      );
      return;
    }

    setIsUploading(true);
    setLastUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Enforce 15-second network timeout to guarantee no indefinite hanging
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 15000);

      const response = await fetch("/api/blog/images", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(
          resJson?.error?.message ||
            `Upload failed with HTTP ${response.status}. Please check your connection and retry.`
        );
      }

      const { url, sizeBytes, filename } = resJson.data;

      // Set persistent URL
      setFeaturedImageUrl(url);
      setImagePreview(url);
      setUploadedFileInfo({
        name: filename || file.name,
        size: formatBytes(sizeBytes || file.size),
      });
      setUploadError(null);
    } catch (err: any) {
      console.error("[PostForm] Image upload failed:", err);
      if (err.name === "AbortError") {
        setUploadError("Image upload timed out after 15 seconds. Please try a smaller image or retry.");
      } else {
        setUploadError(
          err?.message || "Image upload failed. Please verify the image file and try again."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
    e.target.value = "";
  };

  const handleRetryUpload = () => {
    if (lastUploadedFile) {
      uploadImageFile(lastUploadedFile);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFeaturedImageUrl("");
    setUploadedFileInfo(null);
    setUploadError(null);
    setLastUploadedFile(null);
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state && !state.success && (
        <FormError
          message={
            state.error?.message ||
            "Post could not be saved because the server encountered an error. Your uploaded image has been retained so you can retry."
          }
        />
      )}

      {state?.success && (
        <div className="rounded-lg border border-ledger/30 bg-ledger/10 px-4 py-3 text-sm font-medium text-ledger">
          ✓ {status === "published" ? "Post published successfully." : "Post saved successfully."}
        </div>
      )}

      {/* Title */}
      <label className="block">
        <span className="text-sm font-medium text-ink-soft">Title</span>
        <input
          name="title"
          defaultValue={post?.title}
          required
          placeholder="e.g. Navigating Clean Energy Grants in 2026"
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value, { lower: true, strict: true }));
          }}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
        />
      </label>

      {/* Slug */}
      <label className="block">
        <span className="text-sm font-medium text-ink-soft">Slug</span>
        <input
          name="slug"
          value={slug}
          required
          placeholder="navigating-clean-energy-grants-2026"
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 font-mono text-sm text-ink outline-none focus:border-stamp rounded-md transition-colors"
        />
      </label>

      {/* Excerpt */}
      <label className="block">
        <span className="text-sm font-medium text-ink-soft">Excerpt (optional)</span>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          placeholder="Brief summary of the post displayed on blog index and social cards..."
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
        />
      </label>

      {/* Content */}
      <label className="block">
        <span className="text-sm font-medium text-ink-soft">Content (Markdown)</span>
        <textarea
          name="content"
          defaultValue={post?.content ?? ""}
          required
          rows={14}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 font-mono text-sm text-ink outline-none focus:border-stamp rounded-md transition-colors"
          placeholder={"## Section Heading\n\nDetailed guidance, analysis, and recommendations:\n\n- Key requirement 1\n- Key requirement 2"}
        />
      </label>

      {/* Featured Image Upload with Dedicated Storage Pipeline */}
      <div className="space-y-3 rounded-lg border border-paper-line bg-paper-raised/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Featured Image</span>
          {uploadedFileInfo && !isUploading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ledger/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-ledger border border-ledger/20">
              ✓ Image uploaded ({uploadedFileInfo.size})
            </span>
          )}
        </div>

        {/* Hidden persistent storage reference passed to post schema */}
        <input type="hidden" name="featuredImage" value={featuredImageUrl} />

        {/* Upload Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm transition-all hover:bg-stamp active:scale-[0.99] ${
              isUploading || isSaving ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {isUploading ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin text-paper"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Uploading image…</span>
              </>
            ) : (
              <>
                <span>📷</span>
                <span>{imagePreview ? "Replace Image from Computer" : "Upload Featured Image"}</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isUploading || isSaving}
              onChange={handleImageFileChange}
              className="hidden"
            />
          </label>

          {imagePreview && !isUploading && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleRemoveImage}
              className="rounded px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 hover:underline transition-colors"
            >
              Remove Image
            </button>
          )}

          {uploadError && (
            <button
              type="button"
              onClick={handleRetryUpload}
              className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              ↻ Retry Upload
            </button>
          )}
        </div>

        {/* Uploading Status Message */}
        {isUploading && (
          <p className="flex items-center gap-2 text-xs text-ink-soft animate-pulse">
            <span className="inline-block h-2 w-2 rounded-full bg-stamp animate-ping" />
            Uploading image directly to storage… Please wait.
          </p>
        )}

        {/* Error Feedback */}
        {uploadError && (
          <div className="rounded-md border border-signal-risk/30 bg-signal-risktint/40 p-2.5 text-xs text-signal-risk font-medium">
            ⚠️ {uploadError}
          </div>
        )}

        {/* Persistent Stored Image Preview */}
        {imagePreview && (
          <div className="mt-3 overflow-hidden rounded-lg border border-paper-line shadow-sm bg-paper max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Featured image preview"
              className="w-full h-48 object-cover"
              onError={() => {
                setImagePreview(null);
                setUploadError("Failed to render preview. The image URL may be invalid or expired.");
              }}
            />
            {featuredImageUrl && (
              <div className="px-3 py-1.5 bg-paper-raised/80 border-t border-paper-line text-[11px] font-mono text-ink-faint truncate">
                {featuredImageUrl}
              </div>
            )}
          </div>
        )}

        {/* External Image URL Alternative */}
        <div className="pt-2 border-t border-paper-line/60">
          <label className="block">
            <span className="text-xs text-ink-faint">Or enter persistent external image URL (optional)</span>
            <input
              type="url"
              placeholder="https://..."
              value={featuredImageUrl.startsWith("data:") ? "" : featuredImageUrl}
              disabled={isUploading || isSaving}
              onChange={(e) => {
                const val = e.target.value.trim();
                setFeaturedImageUrl(val);
                setImagePreview(val || null);
                setUploadedFileInfo(val ? { name: "External Image URL", size: "URL" } : null);
              }}
              className="mt-1 w-full border border-paper-line bg-paper px-2.5 py-1.5 text-xs font-mono text-ink outline-none focus:border-stamp rounded transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Category & Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Category (optional)</span>
          <input
            name="categoryName"
            defaultValue={initialCategory ?? ""}
            placeholder="e.g. Funding Strategy"
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Tags (comma-separated, optional)</span>
          <input
            name="tagsCsv"
            defaultValue={initialTags ?? ""}
            placeholder="climate, energy, tech"
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
          />
        </label>
      </div>

      {/* Meta Description & Canonical URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Meta description (optional)</span>
          <input
            name="metaDescription"
            defaultValue={post?.meta_description ?? ""}
            placeholder="SEO summary for search results"
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-soft">Canonical URL (optional)</span>
          <input
            name="canonicalUrl"
            type="url"
            defaultValue={post?.canonical_url ?? ""}
            placeholder="https://example.com/original-article"
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp rounded-md transition-colors"
          />
        </label>
      </div>

      {/* Post Status Selector */}
      <div className="rounded-lg border border-paper-line bg-paper-raised/40 p-4 space-y-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Publishing Status</span>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={isSaving || isUploading}
            className="mt-1.5 w-full border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus:border-stamp capitalize rounded-md font-medium"
          >
            <option value="draft">Draft (Private, not visible on public blog)</option>
            <option value="published">Published (Visible immediately on public blog)</option>
            <option value="archived">Archived (Unlisted)</option>
          </select>
        </label>
        <p className="text-xs text-ink-faint">
          {status === "published"
            ? "When published, this post and its featured image will appear live on the public blog."
            : "Drafts remain private to administrators and can be previewed or published at any time."}
        </p>
      </div>

      {/* Submit Button with Dynamic Clear Status (PRD §7, §20) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="group relative w-full overflow-hidden rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-md"
          style={{
            background: isSaving
              ? "#4B5049"
              : status === "published"
              ? "linear-gradient(135deg, #1f4028 0%, #152c1c 100%)"
              : "linear-gradient(135deg, #191C19 0%, #2c1810 100%)",
          }}
        >
          <span className="relative flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{status === "published" ? "Publishing post…" : "Saving post…"}</span>
              </>
            ) : isUploading ? (
              <span>Waiting for image upload to complete…</span>
            ) : status === "published" ? (
              <span>🚀 Publish Post</span>
            ) : (
              <span>💾 Save Draft</span>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
