"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { SopStatusSelect } from "@/components/projects/sop-status-select";

type SopTask = Database["public"]["Tables"]["sop_tasks"]["Row"];

export function SopTable({ projectId, tasks }: { projectId: string; tasks: SopTask[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "docs">("all");

  if (tasks.length === 0) {
    return (
      <div className="rounded border border-dashed border-paper-line p-8 text-center bg-paper-raised/40">
        <p className="font-serif text-base font-semibold text-ink">No Standard Operating Procedure Generated Yet</p>
        <p className="mt-1 text-xs text-ink-soft max-w-md mx-auto">
          Click &ldquo;Generate SOP&rdquo; below to formulate an opportunity-specific 6-phase operational workflow covering evidence gathering, proposal drafting, financial reconciliation, and submission.
        </p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const docsCount = tasks.filter((t) => Boolean(t.required_document)).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return t.status !== "done";
    if (filter === "completed") return t.status === "done";
    if (filter === "docs") return Boolean(t.required_document);
    return true;
  });


  return (
    <div className="space-y-4">
      {/* Metric summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded border border-paper-line bg-paper-raised p-3">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">Total Pipeline</span>
          <span className="font-serif text-lg font-bold text-ink">{tasks.length} Tasks</span>
        </div>
        <div className="rounded border border-paper-line bg-paper-raised p-3">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">In Progress</span>
          <span className="font-serif text-lg font-bold text-stamp-dark">{inProgressCount} Active</span>
        </div>
        <div className="rounded border border-paper-line bg-paper-raised p-3">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">Completed</span>
          <span className="font-serif text-lg font-bold text-emerald-700">{completedCount} ({progressPct}%)</span>
        </div>
        <div className="rounded border border-paper-line bg-paper-raised p-3">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">Required Docs</span>
          <span className="font-serif text-lg font-bold text-amber-700">{docsCount} Attachments</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-paper-line rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-paper-line pb-2">
        <span className="text-xs text-ink-faint mr-1 font-mono uppercase tracking-wide">Filter:</span>
        {(
          [
            ["all", `All (${tasks.length})`],
            ["active", `Active (${tasks.length - completedCount})`],
            ["completed", `Done (${completedCount})`],
            ["docs", `Docs (${docsCount})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-stamp-dark text-paper"
                : "text-ink-soft hover:bg-paper-line/50 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto border border-paper-line rounded">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-paper-line bg-paper-raised font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-2.5 font-normal">Operational Task &amp; Phase</th>
              <th className="px-4 py-2.5 font-normal">Responsible Lead</th>
              <th className="px-4 py-2.5 font-normal">Deliverable Output</th>
              <th className="px-4 py-2.5 font-normal">Target Deadline</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line bg-paper">
            {filteredTasks.map((task) => {
              const phaseMatch = task.task.match(/^\[(.*?)\]\s*(.*)$/);
              const phaseLabel = phaseMatch ? phaseMatch[1] : null;
              const cleanTaskTitle = phaseMatch ? phaseMatch[2] : task.task;

              return (
                <tr key={task.id} className="hover:bg-paper-raised/40 transition-colors">
                  <td className="px-4 py-3.5 align-top max-w-md">
                    {phaseLabel && (
                      <span className="inline-block mb-1.5 rounded bg-stamp-light/10 border border-stamp-dark/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-stamp-dark tracking-wide uppercase">
                        {phaseLabel}
                      </span>
                    )}
                    <p className="font-medium text-ink leading-snug">{cleanTaskTitle}</p>
                    {task.input && (
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-semibold text-ink-faint">Input:</span> {task.input}
                      </p>
                    )}
                    {task.required_document && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-800">
                          📄 {task.required_document}
                        </span>
                      </div>
                    )}
                    {task.notes && (
                      <p className="mt-1.5 text-xs text-ink-faint italic leading-relaxed border-l-2 border-paper-line pl-2">
                        {task.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span className="inline-block rounded bg-paper-raised px-2 py-1 font-mono text-xs text-ink font-medium border border-paper-line">
                      {task.owner || "Team Lead"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top text-xs text-ink-soft leading-relaxed max-w-xs">
                    {task.output || "Verified milestone"}
                  </td>
                  <td className="px-4 py-3.5 align-top font-mono text-xs text-ink-soft whitespace-nowrap">
                    {task.deadline ? (
                      <span className="text-ink">{task.deadline}</span>
                    ) : (
                      <span className="text-ink-faint">As scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <SopStatusSelect projectId={projectId} taskId={task.id} status={task.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


