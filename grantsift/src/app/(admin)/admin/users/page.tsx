import { createClient } from "@/lib/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import { RoleSelect } from "@/components/admin/role-select";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const users = await new AdminService(supabase).listUsers();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Users</h1>
      <div className="mt-8 overflow-x-auto border border-paper-line">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-paper-line bg-paper-raised font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-4 py-2 font-normal">Email</th>
              <th className="px-4 py-2 font-normal">Joined</th>
              <th className="px-4 py-2 font-normal">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-paper-line last:border-0">
                <td className="px-4 py-3 text-ink">{user.fullName ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{user.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect userId={user.id} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

