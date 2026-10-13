export function RoleBadge({ role }: { role: "user" | "admin" }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isAdmin
          ? "bg-purple-50 text-purple-700 border border-purple-200"
          : "bg-slate-100 text-slate-700 border border-slate-200"
      }`}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

export function RoleSelect({ role }: { userId?: string; role: "user" | "admin" }) {
  return <RoleBadge role={role} />;
}
