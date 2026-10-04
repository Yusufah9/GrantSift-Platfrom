"use client";

import { useActionState, useState } from "react";
import slugify from "slugify";
import type { ApiResponse } from "@/lib/errors/app-error";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import type { Database } from "@/lib/supabase/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

const initialState: ApiResponse<null> | null = null;

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
  const [state, formAction] = useActionState(async (_prev: typeof initialState, fd: FormData) => action(fd), initialState);
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [featuredImageVal, setFeaturedImageVal] = useState(post?.featured_image ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(post?.featured_image ?? null);

  // Direct local file upload handler (PRD §33)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read local image as preview & asset reference
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setFeaturedImageVal(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state && !state.success && <FormError message={state.error.message} />}
      {state?.success && <p className="text-sm text-ledger">Saved.</p>}

      <label className="block">
        <span className="text-sm text-ink-soft">Title</span>
        <input
          name="title"
          defaultValue={post?.title}
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value, { lower: true, strict: true }));
          }}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">Slug</span>
        <input
          name="slug"
          value={slug}
          required
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 font-mono text-sm text-ink outline-none focus:border-stamp"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">Excerpt (optional)</span>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">Content (Markdown)</span>
        <textarea
          name="content"
          defaultValue={post?.content ?? ""}
          required
          rows={16}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 font-mono text-sm text-ink outline-none focus:border-stamp"
          placeholder={"## A heading\n\nA paragraph, a [link](https://example.com), a list:\n\n- one\n- two"}
        />
      </label>

      {/* Featured Image Direct Upload (PRD §33, §34) */}
      <div className="space-y-2">
        <span className="text-sm text-ink-soft block font-medium">Featured Image</span>
        <input type="hidden" name="featuredImage" value={featuredImageVal} />

        <div className="flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all">
            <span>📷</span>
            <span>Upload Image from Computer</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setFeaturedImageVal("");
              }}
              className="text-xs text-red-700 hover:underline"
            >
              Remove Image
            </button>
          )}
        </div>

        {imagePreview && (
          <div className="mt-2 relative w-48 h-32 rounded-lg border border-paper-line overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Featured image preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-ink-soft">Category (optional)</span>
          <input
            name="categoryName"
            defaultValue={initialCategory ?? ""}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
          />
        </label>

        <label className="block">
          <span className="text-sm text-ink-soft">Tags (comma-separated, optional)</span>
          <input
            name="tagsCsv"
            defaultValue={initialTags ?? ""}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-ink-soft">Meta description (optional)</span>
          <input
            name="metaDescription"
            defaultValue={post?.meta_description ?? ""}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
          />
        </label>

        <label className="block">
          <span className="text-sm text-ink-soft">Canonical URL (optional)</span>
          <input
            name="canonicalUrl"
            type="url"
            defaultValue={post?.canonical_url ?? ""}
            className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-ink-soft">Status</span>
        <select
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp capitalize"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <SubmitButton>Save post</SubmitButton>
    </form>
  );
}
