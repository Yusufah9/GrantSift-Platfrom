"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction } from "@/app/(admin)/admin/blog/actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this post? This can't be undone.")) return;
        startTransition(async () => {
          await deletePostAction(postId);
          router.refresh();
        });
      }}
      className="text-xs text-signal-risk underline disabled:opacity-60"
    >
      Delete
    </button>
  );
}
