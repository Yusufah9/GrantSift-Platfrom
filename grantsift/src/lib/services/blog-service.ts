import type { SupabaseClient } from "@supabase/supabase-js";
import slugify from "slugify";
import type { Database } from "@/lib/supabase/database.types";
import { PostRepository } from "@/lib/repositories/post-repository";
import { TaxonomyRepository } from "@/lib/repositories/taxonomy-repository";
import type { PostInput } from "@/lib/validation/blog";
import { AppError } from "@/lib/errors/app-error";

export class BlogService {
  private readonly posts: PostRepository;
  private readonly taxonomy: TaxonomyRepository;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.posts = new PostRepository(supabase);
    this.taxonomy = new TaxonomyRepository(supabase);
  }

  listPublished() {
    return this.posts.listPublished();
  }

  getPublishedBySlug(slug: string) {
    return this.posts.getPublishedBySlug(slug);
  }

  listAllForAdmin() {
    return this.posts.listAll();
  }

  getById(id: string) {
    return this.posts.getById(id);
  }

  listCategories() {
    return this.taxonomy.listCategories();
  }

  listTags() {
    return this.taxonomy.listTags();
  }

  getTagsForPost(postId: string) {
    return this.taxonomy.getTagsForPost(postId);
  }

  async create(userId: string, input: PostInput) {
    if (await this.posts.slugExists(input.slug)) {
      throw new AppError("VALIDATION_ERROR", "That slug is already in use. Choose another.");
    }

    const authorId = await this.ensureAuthor(userId);
    const categoryId = input.categoryName ? await this.resolveCategory(input.categoryName) : null;

    const post = await this.posts.create({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      content: input.content,
      featured_image: input.featuredImage || null,
      author_id: authorId,
      category_id: categoryId,
      status: input.status,
      meta_description: input.metaDescription || null,
      canonical_url: input.canonicalUrl || null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    });

    await this.applyTags(post.id, input.tagsCsv);
    return post;
  }

  async update(id: string, input: PostInput) {
    if (await this.posts.slugExists(input.slug, id)) {
      throw new AppError("VALIDATION_ERROR", "That slug is already in use. Choose another.");
    }

    const existing = await this.posts.getById(id);
    if (!existing) throw new AppError("VALIDATION_ERROR", "Post not found.");

    const categoryId = input.categoryName ? await this.resolveCategory(input.categoryName) : null;
    const becomingPublished = input.status === "published" && existing.status !== "published";

    const post = await this.posts.update(id, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || null,
      content: input.content,
      featured_image: input.featuredImage || null,
      category_id: categoryId,
      status: input.status,
      meta_description: input.metaDescription || null,
      canonical_url: input.canonicalUrl || null,
      published_at: becomingPublished ? new Date().toISOString() : existing.published_at,
      updated_at: new Date().toISOString(),
    });

    await this.applyTags(post.id, input.tagsCsv);
    return post;
  }

  async setStatus(id: string, status: "draft" | "published" | "archived") {
    const existing = await this.posts.getById(id);
    if (!existing) throw new AppError("VALIDATION_ERROR", "Post not found.");

    const becomingPublished = status === "published" && existing.status !== "published";
    return this.posts.update(id, {
      status,
      published_at: becomingPublished ? new Date().toISOString() : existing.published_at,
      updated_at: new Date().toISOString(),
    });
  }

  delete(id: string) {
    return this.posts.delete(id);
  }

  private async ensureAuthor(userId: string): Promise<string> {
    const { data: existing, error: findError } = await this.supabase
      .from("authors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (findError) throw findError;
    if (existing) return existing.id;

    const { data: profile } = await this.supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
    const { data, error } = await this.supabase
      .from("authors")
      .insert({ user_id: userId, display_name: profile?.full_name ?? "GrantSift team" })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  private async resolveCategory(name: string): Promise<string> {
    const slug = slugify(name, { lower: true, strict: true });
    return this.taxonomy.ensureCategory(name, slug);
  }

  private async applyTags(postId: string, tagsCsv?: string): Promise<void> {
    const names = (tagsCsv ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (names.length === 0) {
      await this.taxonomy.setPostTags(postId, []);
      return;
    }
    const tagIds = await this.taxonomy.ensureTags(
      names.map((name) => ({ name, slug: slugify(name, { lower: true, strict: true }) })),
    );
    await this.taxonomy.setPostTags(postId, tagIds);
  }
}

export function slugFromTitle(title: string): string {
  return slugify(title, { lower: true, strict: true });
}

