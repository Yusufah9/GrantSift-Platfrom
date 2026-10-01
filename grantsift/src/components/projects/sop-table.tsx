import type { Database } from "@/lib/supabase/database.types";
import { SopStatusSelect } from "@/components/projects/sop-status-select";

type SopTask = Database["public"]["Tables"]["sop_tasks"]["Row"];

export function SopTable({ projectId, tasks }: { projectId: string; tasks: SopTask[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        No SOP yet. Run the readiness check, then generate the SOP from any remaining gaps.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-paper-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-paper-line bg-paper-raised font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-4 py-2 font-normal">Task</th>
            <th className="px-4 py-2 font-normal">Owner</th>
            <th className="px-4 py-2 font-normal">Output</th>
            <th className="px-4 py-2 font-normal">Deadline</th>
            <th className="px-4 py-2 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-paper-line last:border-0">
              <td className="px-4 py-3 align-top">
                <p className="text-ink">{task.task}</p>
                {task.required_document && (
                  <p className="mt-1 font-mono text-[11px] text-stamp-dark">→ {task.required_document}</p>
                )}
                {task.notes && <p className="mt-1 text-xs text-ink-faint">{task.notes}</p>}
              </td>
              <td className="px-4 py-3 align-top text-ink-soft">{task.owner}</td>
              <td className="px-4 py-3 align-top text-ink-soft">{task.output}</td>
              <td className="px-4 py-3 align-top font-mono text-xs text-ink-soft">{task.deadline ?? "—"}</td>
              <td className="px-4 py-3 align-top">
                <SopStatusSelect projectId={projectId} taskId={task.id} status={task.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

