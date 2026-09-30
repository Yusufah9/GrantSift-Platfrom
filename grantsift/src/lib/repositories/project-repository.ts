import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

export class ProjectRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listForUser(userId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<ProjectRow | null> {
    const { data, error } = await this.supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: ProjectInsert): Promise<ProjectRow> {
    const { data, error } = await this.supabase.from("projects").insert(input).select().single();
    if (error) throw error;
    return data;
  }
}
