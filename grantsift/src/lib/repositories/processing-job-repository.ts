import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type JobRow = Database["public"]["Tables"]["processing_jobs"]["Row"];

export class ProcessingJobRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async start(projectId: string, stage: string): Promise<JobRow> {
    const { data, error } = await this.supabase
      .from("processing_jobs")
      .insert({ project_id: projectId, stage, status: "processing", started_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async finish(
    jobId: string,
    status: "completed" | "failed" | "partially_completed",
    errorInfo?: { code: string; message: string },
  ): Promise<void> {
    const { error } = await this.supabase
      .from("processing_jobs")
      .update({
        status,
        finished_at: new Date().toISOString(),
        error_code: errorInfo?.code ?? null,
        error_message: errorInfo?.message ?? null,
      })
      .eq("id", jobId);
    if (error) throw error;
  }

  async listForProject(projectId: string): Promise<JobRow[]> {
    const { data, error } = await this.supabase
      .from("processing_jobs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
}
