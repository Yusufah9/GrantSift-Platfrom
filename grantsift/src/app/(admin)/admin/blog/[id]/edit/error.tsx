"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function EditPostErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EditPostError]", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-paper-line bg-paper-raised p-8 text-center max-w-lg mx-auto my-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-risktint text-signal-risk mb-4">
        ⚠️
      </div>
      <h2 className="font-serif text-xl font-bold text-ink">Could not load blog post editor</h2>
      <p className="mt-2 text-sm text-ink-soft">
        {error.message && !error.message.includes("digest")
          ? error.message
          : "An error occurred while loading this post. This can happen if the post contains an oversized legacy image or invalid formatting."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          Error Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-paper transition-transform hover:scale-[1.02]"
        >
          Try Again
        </button>
        <Link
          href="/admin/blog"
          className="rounded-full border border-paper-line px-5 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          Return to Blog Admin
        </Link>
      </div>
    </div>
  );
}
