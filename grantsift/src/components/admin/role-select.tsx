"use client";

import { useTransition } from "react";
import { setUserRoleAction } from "@/app/(admin)/admin/users/actions";

export function RoleSelect({ userId, role }: { userId: string; role: "user" | "admin" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as "user" | "admin";
        startTransition(() => {
          setUserRoleAction(userId, next);
        });
      }}
      className="border border-paper-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-stamp disabled:opacity-60"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
