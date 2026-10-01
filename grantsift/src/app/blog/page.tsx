import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { PostCard } from "@/components/blog/post-card";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";

export const metadata = {
  title: "Blog · GrantSift",
  description: "Practical notes on grant readiness, funder research, and application preparation.",
};

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const posts = await new BlogService(supabase).listPublished();

  return (
    <main id="main-content">
      <SiteNav />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-serif text-3xl text-ink">Blog</h1>
        <p className="mt-3 text-ink-soft">Notes on grant readiness, funder research, and application preparation.</p>

        {posts.length === 0 ? (
          <p className="mt-12 text-ink-faint">No posts published yet.</p>
        ) : (
          <div className="mt-10 space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

