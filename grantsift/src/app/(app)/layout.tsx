import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/navigation/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  return (
    <div className="min-h-screen bg-paper">
      <AppNav email={user?.email ?? ""} isAdmin={isAdmin} />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
