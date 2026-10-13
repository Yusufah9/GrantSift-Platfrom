import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project-service";
import { ProjectCard } from "@/components/projects/project-card";

interface DashboardPageProps {
  searchParams?: Promise<{
    onboarded?: string;
    verified?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const projects = await new ProjectService(supabase).listMyProjects(user.id);
  const isNewlyOnboarded = searchParams.onboarded === "true" || searchParams.verified === "true";
  const userDisplayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";

  // Fetch user organizations
  const { data: orgs } = await (supabase as any)
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const primaryOrg = (orgs && orgs[0]) || null;
  const orgIds = (orgs || []).map((o: any) => o.id);

  // Fetch saved_grants
  let savedGrants: any[] = [];
  if (orgIds.length > 0) {
    const { data } = await (supabase as any)
      .from("saved_grants")
      .select("*")
      .in("organization_id", orgIds);
    savedGrants = data || [];
  }

  // Fetch grant_applications
  let applications: any[] = [];
  if (orgIds.length > 0) {
    const { data } = await (supabase as any)
      .from("grant_applications")
      .select("*")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false });
    applications = data || [];
  }

  // Fetch recent activity
  let recentActivity: any[] = [];
  if (orgIds.length > 0) {
    const { data } = await (supabase as any)
      .from("activity_logs")
      .select("*")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false })
      .limit(6);
    recentActivity = data || [];
  }

  // Pipeline calculations
  const totalSaved = Math.max(savedGrants.length, applications.length);
  const inPrepCount = applications.filter((a) =>
    ["discovered", "research", "drafting"].includes(a.stage)
  ).length;
  const readyCount = applications.filter((a) =>
    ["internal_review", "founder_approval"].includes(a.stage)
  ).length;
  const submittedCount = applications.filter((a) =>
    ["submitted", "funder_review"].includes(a.stage)
  ).length;
  const awardedCount = applications.filter((a) => a.stage === "awarded").length;
  const closedCount = applications.filter((a) =>
    ["rejected", "declined", "withdrawn"].includes(a.stage)
  ).length;

  // Upcoming deadlines from applications & saved_grants
  const now = new Date();
  const allDeadlines = [
    ...applications.map((a) => ({
      id: a.id,
      title: a.title,
      funder: a.funder_name,
      deadline: a.deadline,
      stage: a.stage,
      amount: a.amount_requested,
    })),
    ...savedGrants.map((s) => ({
      id: s.id,
      title: s.grant_title,
      funder: s.funder_name,
      deadline: s.deadline,
      stage: "saved",
      amount: s.amount_max,
    })),
  ]
    .filter((d) => d.deadline && d.deadline !== "Open Call")
    .map((d) => ({
      ...d,
      daysRemaining: Math.ceil(
        (new Date(d.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .filter((d) => !isNaN(d.daysRemaining) && d.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {isNewlyOnboarded && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900 shadow-sm flex items-start gap-3 animate-fade-in">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-bold text-emerald-950">Welcome to GrantSift, {userDisplayName}!</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your organization workspace is ready. You can discover vetted grant calls, start proposals, build financial models, and track deadlines.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-mono font-bold uppercase text-teal-800">
              Operations Overview
            </span>
            <span className="text-xs text-slate-500">
              &bull; {primaryOrg?.name || "Workspace"}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-900 mt-1">
            Welcome, {userDisplayName}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time pipeline monitoring &bull; Deadlines &bull; Writing studio &bull; Financial modeling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/proposals"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          >
            ✍️ Proposal Studio
          </Link>
          <Link
            href="/discover"
            className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            🔍 Discover Grants
          </Link>
        </div>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Opportunities</p>
          <p className="mt-2 text-2xl font-bold text-brand-900">{totalSaved}</p>
          <Link href="/discover" className="mt-1 inline-block text-[11px] font-semibold text-teal-700 hover:underline">
            View catalog &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">In Preparation</p>
          <p className="mt-2 text-2xl font-bold text-teal-700">{inPrepCount + readyCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Drafting & review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</p>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{submittedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Under funder review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Awarded Grants</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{awardedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Approved for funding</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Closed / Unsuccessful</p>
          <p className="mt-2 text-2xl font-bold text-slate-600">{closedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Concluded records</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upcoming Deadlines */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2">
                <span>⏰</span> Approaching Deadlines
              </h3>
              <Link href="/tracker" className="text-xs font-bold text-teal-700 hover:underline">
                View all tracker deadlines &rarr;
              </Link>
            </div>

            {allDeadlines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700">No approaching deadlines recorded</p>
                <p className="text-[11px] text-slate-500">
                  Save opportunities from the Discover catalog to track approaching application cut-offs.
                </p>
                <Link
                  href="/discover"
                  className="inline-block mt-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  Browse open calls &rarr;
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allDeadlines.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.funder} &bull; Deadline: {item.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.daysRemaining <= 7
                            ? "bg-rose-100 text-rose-800"
                            : item.daysRemaining <= 30
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.daysRemaining === 0 ? "Due Today" : `${item.daysRemaining} days left`}
                      </span>
                      <Link
                        href={`/tracker`}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Projects / Workspaces */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2">
                <span>🏢</span> Organization Projects ({projects.length})
              </h3>
              <Link href="/workspace" className="text-xs font-bold text-teal-700 hover:underline">
                Open Organization OS &rarr;
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700">No project workspaces created yet</p>
                <p className="text-[11px] text-slate-500">
                  Create a project to match grant opportunities, organize narratives, and generate customized proposals.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-block mt-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  Create Project Profile &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="font-serif text-base font-bold text-brand-900">Operational Actions</h3>
            <div className="grid gap-2 text-xs">
              <Link
                href="/discover"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>🔍 Discover Verified Grants</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
              <Link
                href="/proposals"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>✍️ Create Grant Proposal</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
              <Link
                href="/tracker"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>📋 Open Pipeline Tracker</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
              <Link
                href="/financial-model"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>📈 Build 5-Yr Financial Model</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
              <Link
                href="/business-plan"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>📑 Generate Business Plan</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
              <Link
                href="/workspace"
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 font-semibold text-slate-800 hover:bg-teal-50 hover:border-teal-200 transition-all"
              >
                <span>🏛️ Organization OS Workspace</span>
                <span className="text-slate-400">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="font-serif text-base font-bold text-brand-900">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500">
                No recent activity recorded yet. Your actions will appear here as you discover grants, create proposals, and track applications.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                    <span className="text-sm">📌</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 capitalize">
                        {act.action?.replace(/_/g, " ") || "Activity"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {act.details?.grantTitle || act.details?.title || "Organization record updated"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
