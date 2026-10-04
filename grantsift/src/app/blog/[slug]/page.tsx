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

  const [tags, categories] = await Promise.all([
    blog.getTagsForPost(post.id),
    blog.listCategories(),
  ]);

  const category = categories.find((c) => c.id === post.category_id);
  const html = renderMarkdown(post.content);

  return (
    <main id="main-content">
      <SiteNav />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {category && (
              <span className="rounded-full bg-stamp/10 px-3 py-1 text-xs font-semibold text-stamp-dark border border-stamp/20">
                {category.name}
              </span>
            )}
            {post.published_at && (
              <time
                dateTime={post.published_at}
                className="font-mono text-xs text-ink-faint"
              >
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-ink-soft leading-relaxed font-sans">
              {post.excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="font-mono text-[11px] uppercase tracking-wider text-ink-faint bg-paper-raised px-2 py-0.5 rounded border border-paper-line"
                >
                  #{tag.slug}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image Display (PRD §1, §15) */}
        {post.featured_image && (
          <div className="my-10 overflow-hidden rounded-2xl border border-paper-line shadow-md bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full max-h-[500px] object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Post Markdown Body */}
        <div
          className="article-content mt-8 max-w-none text-ink-soft leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
      <SiteFooter />
    </main>
  );
}
