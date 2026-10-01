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

  if (!user) return null; // middleware guarantees this won't render for a signed-out visitor

  const projects = await new ProjectService(supabase).listMyProjects(user.id);
  const isNewlyOnboarded = searchParams.onboarded === "true" || searchParams.verified === "true";
  const userDisplayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="space-y-8">
      {isNewlyOnboarded && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 shadow-sm flex items-start gap-3">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-semibold text-emerald-950">Welcome to GrantSift, {userDisplayName}!</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your account is successfully verified and onboarded. You can now analyze funders and build application packages.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Welcome, {userDisplayName}</h1>
          <p className="text-xs text-ink-faint mt-1">Manage your active grant projects and funder readiness pipelines.</p>
        </div>
        <Link
          href="/projects/new"
          className="rounded bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-stamp-dark transition-all shadow-sm active:scale-95"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-paper-line bg-paper-raised/40 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stamp/10 text-stamp-dark text-xl font-serif">
            1
          </div>
          <h2 className="mt-4 font-serif text-lg font-medium text-ink">
            Onboarding: Get started with your first grant
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            GrantSift sifts through grant guidelines, videos, and funder requirements to build your compliance checklists and narrative SOPs.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/projects/new"
              className="rounded bg-stamp-dark px-5 py-2.5 text-sm font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
            >
              Start Your First Grant Project &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

