import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type SopRow = Database["public"]["Tables"]["sop_tasks"]["Row"];
type SopInsert = Database["public"]["Tables"]["sop_tasks"]["Insert"];
type SopStatus = Database["public"]["Tables"]["sop_tasks"]["Row"]["status"];

export class SopRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listForProject(projectId: string): Promise<SopRow[]> {
    const { data, error } = await this.supabase
      .from("sop_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /** SOP is re-derived each run rather than merged, so it always matches the current gap list. */
  async replaceForProject(projectId: string, tasks: SopInsert[]): Promise<SopRow[]> {
    const { error: deleteError } = await this.supabase.from("sop_tasks").delete().eq("project_id", projectId);
    if (deleteError) throw deleteError;

    if (tasks.length === 0) return [];
    const { data, error: insertError } = await this.supabase.from("sop_tasks").insert(tasks).select();
    if (insertError) throw insertError;
    return data ?? [];
  }

  async setDependency(taskId: string, dependsOn: string | null): Promise<void> {
    const { error } = await this.supabase.from("sop_tasks").update({ depends_on: dependsOn }).eq("id", taskId);
    if (error) throw error;
  }

  async updateStatus(taskId: string, status: SopStatus): Promise<void> {
    const { error } = await this.supabase.from("sop_tasks").update({ status }).eq("id", taskId);
    if (error) throw error;
  }
}

