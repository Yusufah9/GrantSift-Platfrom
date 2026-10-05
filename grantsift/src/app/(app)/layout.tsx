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
  let country = "Nigeria";
  let sector = "Technology";

  if (user) {
    const isFounder = user.email?.toLowerCase() === "umaryaruyusuf971@gmail.com";
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = isFounder || profile?.role === "admin";
    orgName = user.user_metadata?.organization_name || user.user_metadata?.full_name || "My Organization";

    const { data: org } = await (supabase as any)
      .from("organizations")
      .select("name, country, sector, industry")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (org) {
      orgName = org.name || orgName;
      country = org.country || country;
      sector = org.sector || org.industry || sector;
    }
  }

  return (
    <div className="min-h-screen bg-paper relative">
      <AppNav email={user?.email ?? ""} isAdmin={isAdmin} />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <AIAssistantWidget orgName={orgName} country={country} sector={sector} />
    </div>
  );
}
