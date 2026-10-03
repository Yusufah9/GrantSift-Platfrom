import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ReadinessScorecardTool } from "@/components/landing/readiness-scorecard-tool";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Grant Readiness Scorecard | GrantSift",
  description:
    "Assess your organization's funding readiness across legal standing, financial books, impact indicators, team capacity, and evidence data room.",
};

export default async function ScorecardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main id="main-content" className="min-h-screen bg-paper">
      <SiteNav />
      <div className="pt-6">
        <ReadinessScorecardTool isAuthenticated={Boolean(user)} />
      </div>
      <SiteFooter />
    </main>
  );
}
