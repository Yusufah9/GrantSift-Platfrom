import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export class PostRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listPublished(): Promise<PostRow[]> {
    const { data, error } = await this.supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async getPublishedBySlug(slug: string): Promise<PostRow | null> {
    const { data, error } = await this.supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async listAll(): Promise<PostRow[]> {
    const { data, error } = await this.supabase.from("posts").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<PostRow | null> {
    const { data, error } = await this.supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async slugExists(slug: string, excludingId?: string): Promise<boolean> {
    let query = this.supabase.from("posts").select("id").eq("slug", slug);
    if (excludingId) query = query.neq("id", excludingId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data !== null;
  }

  async create(input: PostInsert): Promise<PostRow> {
    const { data, error } = await this.supabase.from("posts").insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, patch: PostUpdate): Promise<PostRow> {
    const { data, error } = await this.supabase.from("posts").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
  }
}
