import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type InsightRow = Database["public"]["Tables"]["insights"]["Row"];
type InsightInsert = Database["public"]["Tables"]["insights"]["Insert"];

export class InsightRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listForProject(projectId: string): Promise<InsightRow[]> {
    const { data, error } = await this.supabase
      .from("insights")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async createMany(inputs: InsightInsert[]): Promise<void> {
    if (inputs.length === 0) return;
    const { error } = await this.supabase.from("insights").insert(inputs);
    if (error) throw error;
  }
}
