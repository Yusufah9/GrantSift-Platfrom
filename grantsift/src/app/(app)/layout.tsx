import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/navigation/app-nav";
import { AIAssistantWidget } from "@/components/ui/ai-assistant-widget";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let orgName = "My Organization";
  if (user) {
    const isFounder = user.email?.toLowerCase() === "umaryaruyusuf971@gmail.com";
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = isFounder || profile?.role === "admin";
    orgName = user.user_metadata?.organization_name || user.user_metadata?.full_name || "My Organization";
  }

  return (
    <div className="min-h-screen bg-paper relative">
      <AppNav email={user?.email ?? ""} isAdmin={isAdmin} />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <AIAssistantWidget orgName={orgName} />
    </div>
  );
}
