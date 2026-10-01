"use client";

import { useTransition } from "react";
import { updateSopTaskStatusAction } from "@/app/(app)/projects/[id]/actions";
import type { Database } from "@/lib/supabase/database.types";

type SopStatus = Database["public"]["Tables"]["sop_tasks"]["Row"]["status"];

const OPTIONS: { value: SopStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export function SopStatusSelect({
  projectId,
  taskId,
  status,
}: {
  projectId: string;
  taskId: string;
  status: SopStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as SopStatus;
        startTransition(() => {
          updateSopTaskStatusAction(projectId, taskId, next);
        });
      }}
      className="border border-paper-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-stamp disabled:opacity-60"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

