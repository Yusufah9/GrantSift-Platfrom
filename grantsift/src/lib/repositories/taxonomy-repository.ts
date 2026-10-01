import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export class TaxonomyRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listCategories() {
    const { data, error } = await this.supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  }

  async listTags() {
    const { data, error } = await this.supabase.from("tags").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  }

  /** Finds a category by name, creating it if it doesn't exist yet. */
  async ensureCategory(name: string, slug: string): Promise<string> {
    const { data: existing, error: findError } = await this.supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (findError) throw findError;
    if (existing) return existing.id;

    const { data, error } = await this.supabase.from("categories").insert({ name, slug }).select("id").single();
    if (error) throw error;
    return data.id;
  }

  async ensureTags(tags: { name: string; slug: string }[]): Promise<string[]> {
    const ids: string[] = [];
    for (const tag of tags) {
      const { data: existing, error: findError } = await this.supabase
        .from("tags")
        .select("id")
        .eq("slug", tag.slug)
        .maybeSingle();
      if (findError) throw findError;
      if (existing) {
        ids.push(existing.id);
        continue;
      }
      const { data, error } = await this.supabase.from("tags").insert(tag).select("id").single();
      if (error) throw error;
      ids.push(data.id);
    }
    return ids;
  }

  async setPostTags(postId: string, tagIds: string[]): Promise<void> {
    const { error: deleteError } = await this.supabase.from("post_tags").delete().eq("post_id", postId);
    if (deleteError) throw deleteError;
    if (tagIds.length === 0) return;
    const { error } = await this.supabase
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
    if (error) throw error;
  }

  async getTagsForPost(postId: string): Promise<{ id: string; name: string; slug: string }[]> {
    const { data: links, error: linkError } = await this.supabase
      .from("post_tags")
      .select("tag_id")
      .eq("post_id", postId);
    if (linkError) throw linkError;

    const tagIds = (links ?? []).map((l) => l.tag_id);
    if (tagIds.length === 0) return [];

    const { data: tags, error } = await this.supabase.from("tags").select("*").in("id", tagIds);
    if (error) throw error;
    return tags ?? [];
  }
}

