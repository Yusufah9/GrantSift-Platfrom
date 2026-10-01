import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ExportService } from "@/lib/excel/export-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Please log in." } }, { status: 401 });
  }

  // RLS scopes every one of these queries to the caller's own project —
  // a mismatched id simply returns no rows rather than another user's data.
  const [{ data: project }, { data: sources }, { data: insights }, { data: readinessItems }, { data: sopTasks }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).maybeSingle(),
      supabase.from("sources").select("*").eq("project_id", id),
      supabase.from("insights").select("*").eq("project_id", id),
      supabase.from("readiness_items").select("*").eq("project_id", id),
      supabase.from("sop_tasks").select("*").eq("project_id", id).order("sort_order", { ascending: true }),
    ]);

  if (!project) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Project not found." } }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = new ExportService().buildWorkbook({
      project,
      sources: sources ?? [],
      insights: insights ?? [],
      readinessItems: readinessItems ?? [],
      sopTasks: sopTasks ?? [],
    });
  } catch (cause) {
    console.error("Excel export failed:", cause);
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_ERROR", message: "Couldn't build the workbook. Please try again." } },
      { status: 500 },
    );
  }

  const filename = `${(project.org_name ?? "grantsift").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-grant-workbook.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

