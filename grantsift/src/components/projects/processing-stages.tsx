import type { Database } from "@/lib/supabase/database.types";

type Job = Database["public"]["Tables"]["processing_jobs"]["Row"];

const STAGE_LABELS: Record<string, string> = {
  source: "Funder page",
  video: "YouTube discovery",
  transcript: "Transcripts",
  extraction: "Extraction",
};

const STATUS_STYLES: Record<Job["status"], string> = {
  pending: "text-ink-faint",
  processing: "text-stamp-dark",
  completed: "text-ledger",
  partially_completed: "text-stamp-dark",
  failed: "text-signal-risk",
};

export function ProcessingStages({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return <p className="text-sm text-ink-faint">No analysis has been run yet.</p>;
  }

  // Keep only the most recent job per stage.
  const latestByStage = new Map<string, Job>();
  for (const job of jobs) latestByStage.set(job.stage, job);

  return (
    <ol className="grid grid-cols-2 gap-px bg-paper-line sm:grid-cols-4">
      {Array.from(latestByStage.values()).map((job) => (
        <li key={job.stage} className="bg-paper-raised px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            {STAGE_LABELS[job.stage] ?? job.stage}
          </p>
          <p className={`mt-1 font-serif text-sm ${STATUS_STYLES[job.status]}`}>
            {job.status.replace("_", " ")}
          </p>
        </li>
      ))}
    </ol>
  );
}

