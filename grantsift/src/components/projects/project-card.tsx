import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block border border-paper-line bg-paper-raised p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-ink">{project.org_name ?? project.name}</h3>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{project.status}</span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {project.grant_funder_name ?? "No funder set"}
        {project.org_country ? ` · ${project.org_country}` : ""}
      </p>
    </Link>
  );
}

