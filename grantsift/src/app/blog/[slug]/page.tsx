import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const post = await new BlogService(supabase).getPublishedBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} · GrantSift`,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates: post.canonical_url ? { canonical: post.canonical_url } : undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description ?? post.excerpt ?? undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const blog = new BlogService(supabase);
  const post = await blog.getPublishedBySlug(slug);
  if (!post) notFound();

  const tags = await blog.getTagsForPost(post.id);
  const html = renderMarkdown(post.content);

  return (
    <main id="main-content">
      <SiteNav />
      <article className="mx-auto max-w-2xl px-6 py-16">
        {post.published_at && (
          <p className="font-mono text-xs text-ink-faint">
            {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
        <h1 className="mt-2 font-serif text-3xl text-ink">{post.title}</h1>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                #{tag.slug}
              </span>
            ))}
          </div>
        )}
        <div
          className="article-content mt-8 max-w-none text-ink-soft"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
      <SiteFooter />
    </main>
  );
}

