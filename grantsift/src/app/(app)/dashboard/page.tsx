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

import { FindGrantsEngine } from "@/components/discovery/find-grants-engine";

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

  const { data: orgRecord } = await (supabase as any)
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const primaryOrg = orgRecord
    ? {
        projectName: `${orgRecord.name} Core Project`,
        orgName: orgRecord.name,
        country: orgRecord.country || "Nigeria",
        industry: orgRecord.sector || orgRecord.industry || "Technology",
        sector: orgRecord.sector || orgRecord.industry || "Technology",
        orgType: orgRecord.org_type || "Startup",
        stage: orgRecord.stage || "Early Stage",
        fundingRequirement: Number(orgRecord.funding_currently_seeking) || 150000,
        problemStatement: orgRecord.problem_statement || orgRecord.primary_problem_addressed || "Advancing scalable sustainable development.",
        solutionStatement: orgRecord.solution_statement || "Deploying high-impact technology solutions.",
        targetBeneficiaries: orgRecord.target_beneficiaries || "Community smallholders and local enterprises",
        hasIncorporation: true,
        hasAuditedFinancials: false,
      }
    : projects[0]
    ? {
        projectName: projects[0].name,
        orgName: projects[0].org_name || projects[0].name,
        country: projects[0].org_country || "Nigeria",
        industry: projects[0].org_industry || "Technology",
        sector: projects[0].org_industry || "Technology",
        orgType: "Startup",
        stage: "Early Stage",
        fundingRequirement: Number(projects[0].grant_amount_sought) || 100000,
        problemStatement: "Advancing scalable sustainable development.",
        solutionStatement: "Deploying high-impact technology solutions.",
        targetBeneficiaries: "Community smallholders and local enterprises",
        hasIncorporation: true,
        hasAuditedFinancials: false,
      }
    : undefined;

  return (
    <div className="space-y-10">
      {isNewlyOnboarded && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 shadow-sm flex items-start gap-3">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-semibold text-emerald-950">Welcome to GrantSift, {userDisplayName}!</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your account is successfully onboarded. Our AI Grant Discovery Engine is now actively matching real-world funding opportunities for your organization.
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Welcome, {userDisplayName}</h1>
          <p className="text-xs text-ink-faint mt-1">
            Permanent Grant Discovery &bull; Intelligence Dossiers &bull; Proposal Generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/proposals"
            className="rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-paper-raised transition-all"
          >
            ✍️ Proposal Studio
          </Link>
          <Link
            href="/onboarding"
            className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-stamp-dark transition-all shadow-sm active:scale-95"
          >
            + Organization Profile
          </Link>
        </div>
      </div>

      {/* Active Organization Profiles Section */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-ink">
              Your Active Organization Workspace ({projects.length})
            </h3>
            <Link href="/workspace" className="text-xs font-semibold text-stamp-dark hover:underline">
              Open Full Workspace &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Permanent Find Grants Engine (Specification §2, §9) */}
      <div className="pt-2">
        <FindGrantsEngine
          organizationProfile={primaryOrg}
          isPaidUser={user.user_metadata?.is_pro === true}
        />
      </div>
    </div>
  );
}

