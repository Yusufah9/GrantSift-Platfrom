import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { GeminiService } from "@/lib/ai/gemini-service";
import { ReadinessRepository } from "@/lib/repositories/readiness-repository";
import { SopRepository } from "@/lib/repositories/sop-repository";
import { AppError } from "@/lib/errors/app-error";
import { cleanPlainText } from "@/lib/ai/ai-text-sanitizer";

const sopPlanSchema = z.object({
  tasks: z.array(
    z.object({
      phase: z.string().trim().min(3).max(100),
      task: z.string().trim().min(3).max(250),
      owner: z.string().trim().max(80),
      input: z.string().trim().max(350),
      output: z.string().trim().max(350),
      requiredDocument: z.string().trim().max(200).optional(),
      notes: z.string().trim().max(500).optional(),
    }),
  ),
});

const SOP_SYSTEM_PROMPT = `You are GrantSift's Principal Grant Operations Architect.
Generate an opportunity-specific Standard Operating Procedure (SOP) organized across six sequential grant lifecycle phases:
Phase 1: Strategic Intelligence & Eligibility Verification
Phase 2: Statutory Evidence Assembly & Data Room Preparation
Phase 3: Technical Architecture & Proposal Formulation
Phase 4: Activity-Based Budgeting & Financial Modeling
Phase 5: Compliance Audit & Governance Sign-Off
Phase 6: Submission, Receipt Archiving & Milestone Tracking

Operational Requirements:
1. Formulate concrete, action-oriented task titles prefixed by their phase (e.g. "[Phase 1] Audit Funder Thematic Priorities and Past Recipient Precedents").
2. Assign practical, specialized roles (such as "Lead Proposal Strategist", "Finance Director", "Technical Architect", "Monitoring and Evaluation Specialist", or "Executive Director").
3. Specify exact source inputs required (e.g. "Historical 3-year cash flow statements, CAC annual filings, supplier equipment proforma invoices").
4. Specify tangible, verifiable deliverable outputs (e.g. "Signed Activity-Based Financial Model in Excel with direct vendor quote references").
5. Attach statutory or formal document requirements where relevant (e.g. "Certificate of Incorporation", "3-Year Audited Financial Statements", "Signed Partner MoU").
6. Provide actionable operational notes detailing compliance thresholds, quality standards, and verification steps.
7. Integrate all open readiness gaps into appropriate phases with prioritized corrective action.
8. Strictly avoid raw Markdown characters: no asterisks (**), no hashes (###), and no em dashes (—). Use clean, direct English.`;

export class SopService {
  private readonly readiness: ReadinessRepository;
  private readonly repo: SopRepository;
  private readonly gemini = new GeminiService();

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.readiness = new ReadinessRepository(supabase);
    this.repo = new SopRepository(supabase);
  }

  async generate(projectId: string) {
    const { data: project, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error || !project) throw new AppError("VALIDATION_ERROR", "Project not found.");

    const allReadiness = await this.readiness.listForProject(projectId);
    const gaps = allReadiness.filter((item) => !item.is_met);

    const gapListText = gaps.length > 0
      ? gaps.map((g, i) => `${i + 1}. Requirement: ${g.requirement} | Status Gap: ${g.gap_description ?? "Unmet criteria"}`).join("\n")
      : "No unmet gaps detected. Focus on end-to-end proposal submission excellence and audit trail compliance.";

    const userPrompt = `Project Context:
Opportunity / Project Name: ${project.name}
Funder Name: ${project.grant_funder_name ?? "Institutional Funder"}
Funder Website / Program: ${project.grant_funder_url ?? "Not specified"}
Grant Deadline: ${project.grant_deadline ?? "21 days from today"}
Readiness Gaps to Address:
${gapListText}

Generate 10 to 14 sequential, highly detailed operational tasks distributed across the 6 phases. Ensure every readiness gap has a specific remediation task with an assigned owner, clear inputs, verifiable outputs, and operational notes.`;

    let generatedTasks;
    try {
      const plan = await this.gemini.generateStructured({
        tier: "synthesis",
        systemPrompt: SOP_SYSTEM_PROMPT,
        userPrompt,
        schema: sopPlanSchema,
      });
      generatedTasks = plan.tasks;
    } catch {
      generatedTasks = this.buildFallbackSop(project, gaps);
    }

    const deadlines = computeBackwardDeadlines(project.grant_deadline, generatedTasks.length);

    const rows = generatedTasks.map((t, index) => {
      const taskTitle = t.task.startsWith("[Phase") ? t.task : `[${t.phase}] ${t.task}`;
      return {
        project_id: projectId,
        task: cleanPlainText(taskTitle),
        owner: cleanPlainText(t.owner),
        input: cleanPlainText(t.input),
        output: cleanPlainText(t.output),
        deadline: deadlines[index] ?? null,
        status: "not_started" as const,
        required_document: t.requiredDocument ? cleanPlainText(t.requiredDocument) : null,
        traced_to_source_id: gaps[index % Math.max(1, gaps.length)]?.traced_to_source_id ?? null,
        notes: t.notes ? cleanPlainText(t.notes) : null,
        sort_order: index,
      };
    });

    const inserted = await this.repo.replaceForProject(projectId, rows);

    // Chain dependencies sequentially
    for (let i = 1; i < inserted.length; i++) {
      await this.repo.setDependency(inserted[i]!.id, inserted[i - 1]!.id);
    }

    return this.repo.listForProject(projectId);
  }

  private buildFallbackSop(project: { name: string; grant_funder_name?: string | null; grant_deadline?: string | null }, gaps: Array<{ requirement: string; gap_description: string | null }>) {
    const funder = project.grant_funder_name ?? "Target Funder";

    const baseTasks = [
      {
        phase: "Phase 1: Strategic Intelligence",
        task: `[Phase 1] Audit ${funder} Guidelines and Past Recipient Precedents`,
        owner: "Lead Proposal Strategist",
        input: "Official RFP documentation, funder annual reports, and past winner profiles.",
        output: "Synthesis dossier detailing funder priorities and win theme strategy.",
        requiredDocument: "Master Funder Intelligence Dossier",
        notes: "Examine evaluation rubric thresholds and determine exact geographic and thematic alignment.",
      },
      {
        phase: "Phase 1: Strategic Intelligence",
        task: "[Phase 1] Cross-Check Legal Eligibility Criteria",
        owner: "Compliance Officer",
        input: "Organization incorporation certificates, operating years, and tax clearance records.",
        output: "Eligibility compliance confirmation sign-off.",
        requiredDocument: "Corporate Registration & Status Report",
        notes: "Verify minimum operational track record and corporate entity eligibility before drafting.",
      },
      {
        phase: "Phase 2: Evidence Assembly",
        task: "[Phase 2] Compile Statutory Documentation in Data Room",
        owner: "Finance & Operations Manager",
        input: "Audited financial statements for prior 2 fiscal years, tax clearance, and bank statements.",
        output: "Verified institutional data room folder.",
        requiredDocument: "Audited Financial Statements & Tax Clearance",
        notes: "Scan all originals at 300 DPI in PDF format. Ensure signatory pages are properly stamped.",
      },
      {
        phase: "Phase 2: Evidence Assembly",
        task: "[Phase 2] Secure Signed Partner Letters of Support and MoUs",
        owner: "Executive Director",
        input: "Draft partnership agreements, community stakeholder contact list, and project scope.",
        output: "Executed Letters of Support and bilateral MoUs.",
        requiredDocument: "Bilateral Memorandum of Understanding (MoU)",
        notes: "Confirm partner co-commitments and specific in-kind or operational contributions.",
      },
      {
        phase: "Phase 3: Technical Proposal",
        task: "[Phase 3] Draft Problem Statement and Theory of Change",
        owner: "Lead Proposal Writer",
        input: "Baseline field survey data, localized demographic statistics, and community assessment.",
        output: "Validated problem analysis narrative and logical framework matrix.",
        requiredDocument: "Logical Framework Matrix (Logframe)",
        notes: "Anchor narrative in empirical local metrics. Clearly disaggregate direct and indirect beneficiaries.",
      },
      {
        phase: "Phase 3: Technical Proposal",
        task: "[Phase 3] Detail Implementation Methodology and Milestone Work Packages",
        owner: "Technical Lead",
        input: "Project activity roadmap, technical specifications, and vendor capability profiles.",
        output: "Quarterly milestone workplan narrative and Gantt schedule.",
        requiredDocument: "Project Implementation Schedule (Gantt)",
        notes: "Structure activities into 4 discrete quarterly milestones with tangible gate deliverables.",
      },
      {
        phase: "Phase 4: Financial Proposal",
        task: "[Phase 4] Build Activity-Based Budget and Itemized Cost Model",
        owner: "Finance Director",
        input: "Work package activities, supplier proforma quotes, and market personnel salary benchmarks.",
        output: "Multi-currency financial model in Excel with complete budget justification narrative.",
        requiredDocument: "Detailed Activity-Based Budget Spreadsheet",
        notes: "Ensure 100% mathematical consistency across narrative text, summary tables, and annexes.",
      },
      {
        phase: "Phase 4: Financial Proposal",
        task: "[Phase 4] Establish Foreign Exchange Risk and Inflation Reserve Plan",
        owner: "Finance Director",
        input: "Central bank foreign exchange projections and local inflation trend analysis.",
        output: "Currency risk mitigation memo and allowable contingency schedule.",
        requiredDocument: "Financial Risk & Hedging Policy",
        notes: "Verify funder ceiling on contingency and administrative overhead allowances.",
      },
      {
        phase: "Phase 5: Compliance Audit",
        task: "[Phase 5] Conduct Rigorous 10-Point Readiness and Word Count Audit",
        owner: "Quality Assurance Lead",
        input: "Full draft proposal, budget narrative, guidelines checklist, and portal questions.",
        output: "Audit scorecard certifying 100% compliance with zero formatting errors.",
        requiredDocument: "Pre-Submission Compliance Verification Matrix",
        notes: "Verify every portal prompt has been fully answered within strict character limits.",
      },
      {
        phase: "Phase 5: Compliance Audit",
        task: "[Phase 5] Executive Review and Final Founder Sign-Off",
        owner: "Executive Director",
        input: "Complete application package including proposal, budget, and supporting annexes.",
        output: "Formal executive authorization to submit.",
        requiredDocument: "Signed Board Authorization / Governance Sign-Off",
        notes: "Never submit to funder portal without authorized human-in-the-loop executive sign-off.",
      },
      {
        phase: "Phase 6: Submission & Post-Award",
        task: `[Phase 6] Submit Application via ${funder} Portal 48 Hours Ahead of Deadline`,
        owner: "Lead Proposal Strategist",
        input: "Funder portal credentials, finalized narrative documents, and PDF annexes.",
        output: "Official timestamped submission receipt and confirmation number.",
        requiredDocument: "Official Submission Confirmation Receipt",
        notes: "Submit early to protect against portal server congestion or network timeouts.",
      },
      {
        phase: "Phase 6: Submission & Post-Award",
        task: "[Phase 6] Archive Application Package and Configure Grant Milestone Tracker",
        owner: "Operations Associate",
        input: "Submitted PDF package, confirmation receipt, and funder response timetable.",
        output: "Active tracker record with reminder gates for funder notifications.",
        requiredDocument: "Master Application Archive Dossier",
        notes: "Log key dates for evaluation committee review, due diligence interview, and expected decision.",
      },
    ];

    // If there are specific gaps, prepend customized remedial tasks
    if (gaps.length > 0) {
      const gapTasks = gaps.slice(0, 3).map((gap, i) => ({
        phase: "Phase 2: Evidence Assembly",
        task: `[Phase 2] Remediate Gap: ${cleanPlainText(gap.requirement).slice(0, 80)}`,
        owner: "Compliance Officer",
        input: `Current status: ${gap.gap_description ?? "Deficient documentation"}`,
        output: `Rectified evidence package addressing ${gap.requirement}`,
        requiredDocument: `${gap.requirement.slice(0, 40)} Verification`,
        notes: "Prioritize this task immediately to resolve critical compliance disqualification risk.",
      }));
      return [...gapTasks, ...baseTasks];
    }

    return baseTasks;
  }
}

/** Spaces tasks evenly between today and the deadline; returns nulls if there's no deadline to work from. */
export function computeBackwardDeadlines(deadline: string | null, count: number): (string | null)[] {
  if (!deadline || count === 0) return new Array(count).fill(null);

  const deadlineDate = new Date(deadline);
  const today = new Date();
  const rawDays = Math.floor((deadlineDate.getTime() - today.getTime()) / 86_400_000);
  if (rawDays <= 0) return new Array(count).fill(deadline);
  const totalDays = Math.max(1, rawDays);

  const step = totalDays / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today.getTime() + step * (i + 1) * 86_400_000);
    return date.toISOString().slice(0, 10);
  });
}


