import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"];
type SourceUpdate = Database["public"]["Tables"]["sources"]["Update"];

export class SourceRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listForProject(projectId: string): Promise<SourceRow[]> {
    const { data, error } = await this.supabase
      .from("sources")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<SourceRow | null> {
    const { data, error } = await this.supabase.from("sources").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: SourceInsert): Promise<SourceRow> {
    const { data, error } = await this.supabase.from("sources").insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async createMany(inputs: SourceInsert[]): Promise<SourceRow[]> {
    if (inputs.length === 0) return [];
    const { data, error } = await this.supabase.from("sources").insert(inputs).select();
    if (error) throw error;
    return data ?? [];
  }

  async update(id: string, patch: SourceUpdate): Promise<void> {
    const { error } = await this.supabase.from("sources").update(patch).eq("id", id);
    if (error) throw error;
  }
}

