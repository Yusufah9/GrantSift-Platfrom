import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Start a new project</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Add the funder you&apos;re applying to and a few details about your organization. GrantSift
        will use this to check readiness once processing is wired up in the next phase.
      </p>
      <div className="mt-10">
        <ProjectForm />
      </div>
    </div>
  );
}

