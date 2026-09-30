"use client";

import { useTransition } from "react";
import { setPostStatusAction } from "@/app/(admin)/admin/blog/actions";
import type { Database } from "@/lib/supabase/database.types";

type PostStatus = Database["public"]["Tables"]["posts"]["Row"]["status"];

export function PostStatusSelect({ postId, status }: { postId: string; status: PostStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as PostStatus;
        startTransition(() => {
          setPostStatusAction(postId, next);
        });
      }}
      className="border border-paper-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-stamp disabled:opacity-60"
    >
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="archived">Archived</option>
    </select>
  );
}
