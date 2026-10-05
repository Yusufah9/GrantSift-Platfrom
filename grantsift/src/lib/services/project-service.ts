import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ProjectRepository } from "@/lib/repositories/project-repository";
import type { OrganizationProfileInput, GrantTargetInput } from "@/lib/validation/project";
import { AppError } from "@/lib/errors/app-error";

export class ProjectService {
  private readonly repo: ProjectRepository;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.repo = new ProjectRepository(supabase);
  }

  async listMyProjects(userId: string) {
    try {
      return await this.repo.listForUser(userId);
    } catch (cause) {
      throw new AppError("DATABASE_ERROR", "Couldn't load your projects. Please try again.", cause);
    }
  }

  async createProject(
    userId: string,
    org: OrganizationProfileInput,
    grant?: Partial<GrantTargetInput> | null,
  ) {
    let funderHostname: string | null = null;
    const funderUrl = grant?.grantFunderUrl?.trim();
    if (funderUrl) {
      try {
        funderHostname = new URL(funderUrl).hostname;
      } catch {
        throw new AppError("VALIDATION_ERROR", "Enter a valid funder URL.");
      }
    }

    try {
      const project = await this.repo.create({
        user_id: userId,
        name: org.orgName,
        status: "active",
        org_name: org.orgName,
        org_industry: org.orgIndustry,
        org_country: org.orgCountry,
        org_website: org.orgWebsite || null,
        org_email: org.orgEmail,
        org_team_size: org.orgTeamSize ?? null,
        org_year_founded: org.orgYearFounded ?? null,
        org_funding_to_date: org.orgFundingToDate ?? null,
        grant_funder_url: funderUrl || null,
        grant_funder_name: funderHostname || "Auto-Discovered Grants",
        grant_amount_sought: grant?.grantAmountSought ?? (org.fundingRequired ?? null),
        grant_deadline: grant?.grantDeadline ?? null,
      });

      // The funder URL is a source when provided. Pasted requirements, when given,
      // are a second, user-provided source — never merged into the same
      // row, so each keeps its own trust label and traceability.
      const sourcesToInsert = [
        ...(funderUrl && funderHostname
          ? [
              {
                project_id: project.id,
                kind: "funder_org" as const,
                trust: "official_funder" as const,
                funder_url: funderUrl,
                funder_name: funderHostname,
                status: "pending" as const,
              },
            ]
          : []),
        ...(grant?.pastedRequirements
          ? [
              {
                project_id: project.id,
                kind: "user_pasted_text" as const,
                trust: "user_provided" as const,
                pasted_text: grant.pastedRequirements,
                status: "completed" as const,
              },
            ]
          : []),
      ];

      if (sourcesToInsert.length > 0) {
        const { error: sourceError } = await this.supabase.from("sources").insert(sourcesToInsert);
        if (sourceError) throw sourceError;
      }

      return project;
    } catch (cause) {
      if (cause instanceof AppError) throw cause;
      throw new AppError("DATABASE_ERROR", "Couldn't create the project. Please try again.", cause);
    }
  }
}

