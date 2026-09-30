import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project-service";
import { ProjectCard } from "@/components/projects/project-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware guarantees this won't render for a signed-out visitor

  const projects = await new ProjectService(supabase).listMyProjects(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Your projects</h1>
        <Link href="/projects/new" className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-stamp-dark">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 border border-dashed border-paper-line px-6 py-16 text-center">
          <p className="text-ink-soft">You haven&apos;t started a project yet.</p>
          <Link href="/projects/new" className="mt-4 inline-block text-sm text-stamp-dark underline">
            Add a grant funder to get started
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
