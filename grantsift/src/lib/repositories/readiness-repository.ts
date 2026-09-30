import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ReadinessRow = Database["public"]["Tables"]["readiness_items"]["Row"];
type ReadinessInsert = Database["public"]["Tables"]["readiness_items"]["Insert"];

export class ReadinessRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listForProject(projectId: string): Promise<ReadinessRow[]> {
    const { data, error } = await this.supabase
      .from("readiness_items")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /** Readiness is re-derived each run rather than merged, so stale gaps never linger. */
  async replaceForProject(projectId: string, items: ReadinessInsert[]): Promise<void> {
    const { error: deleteError } = await this.supabase.from("readiness_items").delete().eq("project_id", projectId);
    if (deleteError) throw deleteError;

    if (items.length === 0) return;
    const { error: insertError } = await this.supabase.from("readiness_items").insert(items);
    if (insertError) throw insertError;
  }
}
