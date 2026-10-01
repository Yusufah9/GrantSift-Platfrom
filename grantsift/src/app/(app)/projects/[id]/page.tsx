import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SourceBadge } from "@/components/ui/source-badge";
import { ProcessingStages } from "@/components/projects/processing-stages";
import { RunAnalysisForm } from "@/components/projects/run-analysis-form";
import { InsightsList } from "@/components/projects/insights-list";
import { ReadinessList } from "@/components/projects/readiness-list";
import { SopTable } from "@/components/projects/sop-table";
import { ProjectActionForm } from "@/components/projects/project-action-form";
import { generateReadinessAction, generateSopAction } from "@/app/(app)/projects/[id]/actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();

  const [{ data: sources }, { data: jobs }, { data: insights }, { data: readinessItems }, { data: sopTasks }] =
    await Promise.all([
      supabase.from("sources").select("*").eq("project_id", id).order("created_at", { ascending: true }),
      supabase.from("processing_jobs").select("*").eq("project_id", id).order("created_at", { ascending: true }),
      supabase.from("insights").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("readiness_items").select("*").eq("project_id", id).order("created_at", { ascending: true }),
      supabase.from("sop_tasks").select("*").eq("project_id", id).order("sort_order", { ascending: true }),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Project</p>
        <h1 className="mt-2 font-serif text-2xl text-ink">{project.org_name}</h1>
        <p className="mt-1 text-ink-soft">{project.grant_funder_name}</p>
      </div>

      <section className="border border-paper-line bg-paper-raised p-6">
        <h2 className="font-serif text-lg text-ink">Analysis</h2>
        <div className="mt-4">
          <ProcessingStages jobs={jobs ?? []} />
        </div>
        <div className="mt-6 max-w-sm">
          <RunAnalysisForm projectId={project.id} />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink">Sources</h2>
        <ul className="mt-4 space-y-3">
          {(sources ?? []).map((source) => (
            <li key={source.id} className="flex items-center justify-between border-b border-paper-line pb-3 text-sm">
              <span className="text-ink-soft">
                {source.kind === "funder_org" && (source.funder_name ?? source.funder_url)}
                {source.kind === "youtube_video" &&
                  `${source.youtube_video_title} · ${source.youtube_channel_title}`}
                {source.kind === "user_pasted_text" && "Pasted requirements"}
              </span>
              <div className="flex items-center gap-3">
                {source.status !== "completed" && (
                  <span className="font-mono text-[11px] text-ink-faint">{source.status.replace("_", " ")}</span>
                )}
                <SourceBadge kind={source.trust} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink">Insights</h2>
        <div className="mt-4">
          <InsightsList insights={insights ?? []} />
        </div>
      </section>

      <section className="border border-paper-line bg-paper-raised p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Readiness</h2>
        </div>
        <div className="mt-4">
          <ReadinessList items={readinessItems ?? []} />
        </div>
        <div className="mt-6 max-w-sm">
          <ProjectActionForm
            action={generateReadinessAction.bind(null, project.id)}
            buttonLabel="Check readiness"
            helperText="Compares your organization profile against every eligibility and document requirement extracted so far."
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Application SOP</h2>
        </div>
        <div className="mt-4">
          <SopTable projectId={project.id} tasks={sopTasks ?? []} />
        </div>
        <div className="mt-6 max-w-sm">
          <ProjectActionForm
            action={generateSopAction.bind(null, project.id)}
            buttonLabel="Generate SOP"
            helperText="Builds one task per open readiness gap, in order, with a suggested owner and output."
          />
        </div>
      </section>

      <section className="border border-paper-line bg-paper-raised p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-ink">Export</h2>
            <p className="mt-1 text-sm text-ink-soft">
              One workbook: overview, eligibility, readiness, document checklist, application
              workflow, SOP, action plan, budget, and sources.
            </p>
          </div>
          <a
            href={`/projects/${project.id}/export`}
            className="whitespace-nowrap bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-stamp-dark"
          >
            Download Excel
          </a>
        </div>
      </section>
    </div>
  );
}

