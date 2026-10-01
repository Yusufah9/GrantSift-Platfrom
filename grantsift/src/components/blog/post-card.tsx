import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border border-paper-line bg-paper-raised p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-sm">
      {post.published_at && (
        <p className="font-mono text-xs text-ink-faint">
          {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}
      <h2 className="mt-2 font-serif text-xl text-ink">{post.title}</h2>
      {post.excerpt && <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>}
    </Link>
  );
}

