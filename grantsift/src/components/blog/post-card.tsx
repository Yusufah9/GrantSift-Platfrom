import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-paper-line bg-paper-raised transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row">
        {post.featured_image && (
          <div className="relative h-48 sm:h-auto sm:w-64 sm:flex-shrink-0 overflow-hidden bg-paper border-b sm:border-b-0 sm:border-r border-paper-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {post.published_at && (
              <p className="font-mono text-xs text-ink-faint">
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <h2 className="mt-2 font-serif text-xl font-bold text-ink group-hover:text-stamp-dark transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 text-sm text-ink-soft line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-stamp-dark">
            <span>Read full post</span>
            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
