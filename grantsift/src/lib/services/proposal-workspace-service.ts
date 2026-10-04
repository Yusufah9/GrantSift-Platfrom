export type ProposalType =
  | "grant_proposal"
  | "letter_of_inquiry"
  | "concept_note"
  | "expression_of_interest"
  | "project_proposal"
  | "full_application"
  | "business_proposal"
  | "funding_request"
  | "technical_proposal"
  | "financial_proposal"
  | "custom_proposal";

export interface BudgetItem {
  id: string;
  category:
    | "Personnel"
    | "Equipment"
    | "Materials & Supplies"
    | "Travel & Transport"
    | "Training & Workshops"
    | "Subcontracts & Consulting"
    | "Monitoring & Evaluation"
    | "Administration & Overhead"
    | "Contingency";
  description: string;
  quantity: number;
  unitCost: number;
  currency: string;
  totalCost: number;
  justification?: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  description: string;
  content: string;
  wordCountTarget?: number;
  isRequired: boolean;
}

export interface ProposalWorkspaceState {
  id: string;
  type: ProposalType;
  title: string;
  funderName: string;
  grantName: string;
  targetAmount: number;
  currency: string;
  sections: ProposalSection[];
  budgetItems: BudgetItem[];
  budgetTotal: number;
  version: number;
  lastSavedAt: string;
  status: "draft" | "under_review" | "approved" | "submitted";
}

export const PROPOSAL_TYPE_LABELS: Record<ProposalType, string> = {
  grant_proposal: "Standard Grant Proposal",
  letter_of_inquiry: "Letter of Inquiry (LOI)",
  concept_note: "Concept Note (2-3 Pages)",
  expression_of_interest: "Expression of Interest (EOI)",
  project_proposal: "Detailed Project Proposal",
  full_application: "Full Formal Application",
  business_proposal: "Commercial & Business Proposal",
  funding_request: "Direct Funding Request",
  technical_proposal: "Technical & Engineering Proposal",
  financial_proposal: "Financial & Cost Proposal",
  custom_proposal: "Custom Proposal",
};

export class ProposalWorkspaceService {
  /**
   * Generates tailored proposal sections based on selected proposal type (PRD §15).
   * Strict natural writing: no AI clichés, clear human structure.
   */
  createInitialProposal(params: {
    type: ProposalType;
    grantName: string;
    funderName: string;
    orgName: string;
    country: string;
    problemStatement?: string;
    solutionStatement?: string;
    fundingAmount?: number;
    currency?: string;
  }): ProposalWorkspaceState {
    const {
      type,
      grantName,
      funderName,
      orgName,
      country,
      problemStatement = "",
      solutionStatement = "",
      fundingAmount = 100000,
      currency = "USD",
    } = params;

    const sections = this.getSectionsForType(type, {
      orgName,
      country,
      funderName,
      grantName,
      problemStatement,
      solutionStatement,
      fundingAmount,
      currency,
    });

    const defaultBudget = this.createDefaultBudget(fundingAmount, currency);

    return {
      id: `prop-${Date.now()}`,
      type,
      title: `${PROPOSAL_TYPE_LABELS[type]} for ${grantName}`,
      funderName,
      grantName,
      targetAmount: fundingAmount,
      currency,
      sections,
      budgetItems: defaultBudget,
      budgetTotal: defaultBudget.reduce((sum, item) => sum + item.totalCost, 0),
      version: 1,
      lastSavedAt: new Date().toISOString(),
      status: "draft",
    };
  }

  private getSectionsForType(
    type: ProposalType,
    ctx: {
      orgName: string;
      country: string;
      funderName: string;
      grantName: string;
      problemStatement: string;
      solutionStatement: string;
      fundingAmount: number;
      currency: string;
    }
  ): ProposalSection[] {
    const { orgName, country, funderName, grantName, problemStatement, solutionStatement, fundingAmount, currency } = ctx;

    switch (type) {
      case "letter_of_inquiry":
        return [
          {
            id: "loi-summary",
            title: "Executive Summary & Purpose",
            description: "Brief introduction of applicant, funding request, and key project milestone.",
            content: `${orgName} respectfully submits this Letter of Inquiry to ${funderName} requesting ${currency} ${fundingAmount.toLocaleString()} to support our practical initiative in ${country}.`,
            isRequired: true,
          },
          {
            id: "loi-need",
            title: "Statement of Need",
            description: "Specific community or market problem being addressed.",
            content: problemStatement || `In ${country}, frontline communities face persistent structural constraints that require localized, proven intervention models.`,
            isRequired: true,
          },
          {
            id: "loi-methodology",
            title: "Proposed Intervention & Outcomes",
            description: "Specific activities and tangible outcomes achieved during grant timeline.",
            content: solutionStatement || `Our team deploys practical field interventions designed to achieve measurable improvements in beneficiary livelihoods within 12 months.`,
            isRequired: true,
          },
          {
            id: "loi-budget-summary",
            title: "Budget Overview & Sustainability",
            description: "High-level allocation and financial transition plan.",
            content: `The requested ${currency} ${fundingAmount.toLocaleString()} will fund equipment deployment (50%), field personnel (30%), and independent evaluation (20%). Following grant completion, operations sustain through earned local service revenue.`,
            isRequired: true,
          },
        ];

      case "concept_note":
        return [
          {
            id: "cn-project-profile",
            title: "Project Overview",
            description: "Title, organization details, geographic scope, and total budget.",
            content: `Project: Community Resilience Initiative\nApplicant: ${orgName}\nJurisdiction: ${country}\nFunding Target: ${currency} ${fundingAmount.toLocaleString()}`,
            isRequired: true,
          },
          {
            id: "cn-context",
            title: "Context and Problem Analysis",
            description: "Evidence-based problem definition in target region.",
            content: problemStatement || `Current field assessments in ${country} indicate baseline constraints affecting local productivity and economic security.`,
            isRequired: true,
          },
          {
            id: "cn-approach",
            title: "Proposed Solution & Theory of Change",
            description: "Core strategy, work packages, and implementation logic.",
            content: solutionStatement || `Our solution implements modular, community-led operations that eliminate operational bottlenecks and deliver documented results.`,
            isRequired: true,
          },
          {
            id: "cn-impact",
            title: "Expected Results & Key Performance Indicators",
            description: "Target beneficiary numbers and evaluation metrics.",
            content: `Key Deliverables:\n1. 500 direct beneficiary households enrolled and verified in Month 3.\n2. 40% measurable productivity gain documented by Month 12.\n3. Operational break-even achieved by Month 18.`,
            isRequired: true,
          },
        ];

      case "technical_proposal":
        return [
          {
            id: "tech-exec",
            title: "Technical Executive Summary",
            description: "Comprehensive technical brief for technical evaluation committee.",
            content: `${orgName} proposes an engineering and operational solution engineered specifically for operating conditions in ${country}.`,
            isRequired: true,
          },
          {
            id: "tech-architecture",
            title: "Technical Architecture & Specifications",
            description: "Detailed system design, equipment standards, and deployment protocols.",
            content: `Technical specifications, hardware/software standards, and compliance certifications adherence.`,
            isRequired: true,
          },
          {
            id: "tech-workplan",
            title: "Implementation Methodology & Phased Work Plan",
            description: "Gantt-aligned phases, technical milestones, and deliverable schedules.",
            content: `Phase 1 (Months 1-3): Site preparation and procurement.\nPhase 2 (Months 4-9): System deployment and operational commissioning.\nPhase 3 (Months 10-12): Performance optimization and handover.`,
            isRequired: true,
          },
          {
            id: "tech-risk",
            title: "Technical Risk Management & Quality Assurance",
            description: "Failsafe measures, maintenance schedules, and security protocols.",
            content: `Detailed contingency protocols for equipment downtime, power interruption, and supply chain delays.`,
            isRequired: true,
          },
        ];

      case "financial_proposal":
        return [
          {
            id: "fin-summary",
            title: "Financial Narrative & Cost Principles",
            description: "Foundational cost principles, value for money, and accounting controls.",
            content: `This financial proposal provides a transparent, verifiable budget structure for ${currency} ${fundingAmount.toLocaleString()}, demonstrating value for money.`,
            isRequired: true,
          },
          {
            id: "fin-breakdown",
            title: "Detailed Category Breakdown & Justifications",
            description: "Personnel, capital expenditure, operating costs, and monitoring allocations.",
            content: `Unit cost explanations linked directly to planned implementation activities.`,
            isRequired: true,
          },
          {
            id: "fin-controls",
            title: "Financial Governance & Audit Controls",
            description: "Banking segregation, dual-signatory authorizations, and statutory audit compliance.",
            content: `Organizational internal controls ensure independent oversight, quarterly expense reconciliation, and third-party annual audits.`,
            isRequired: true,
          },
        ];

      case "grant_proposal":
      default:
        return [
          {
            id: "gp-executive-summary",
            title: "Executive Summary",
            description: "A concise overview of the problem, proposed solution, target beneficiaries, and expected outcomes.",
            content: `${orgName} respectfully applies for funding from ${funderName} under the ${grantName} program. Based in ${country}, our project delivers measurable improvements for frontline communities through practical field deployment.`,
            isRequired: true,
          },
          {
            id: "gp-problem-statement",
            title: "Problem Statement & Context",
            description: "Documented community challenge, local context, and baseline evidence.",
            content: problemStatement || `In ${country}, target constituents experience acute operational challenges that restrict economic self-reliance.`,
            isRequired: true,
          },
          {
            id: "gp-solution-methodology",
            title: "Project Description & Methodology",
            description: "Specific activities, implementation steps, and operational approach.",
            content: solutionStatement || `We implement a direct intervention model verified through preliminary field pilots to address local priorities.`,
            isRequired: true,
          },
          {
            id: "gp-outcomes-impact",
            title: "Goals, Objectives, and Measurable Impact",
            description: "Verifiable outputs, outcomes, and monitoring framework.",
            content: `The project achieves three core objectives over the 12-month grant cycle:\n1. Expand direct service coverage to verified households.\n2. Establish local operational training programs.\n3. Validate independent monitoring and evaluation indicators.`,
            isRequired: true,
          },
          {
            id: "gp-sustainability",
            title: "Organizational Capacity & Sustainability Plan",
            description: "Team qualifications, governance structure, and post-grant transition plan.",
            content: `${orgName} maintains an experienced operational team with demonstrated execution capacity in ${country}. Following the grant period, operations transition to sustainable earned revenue.`,
            isRequired: true,
          },
        ];
    }
  }

  private createDefaultBudget(total: number, currency: string): BudgetItem[] {
    const equipmentCost = Math.round(total * 0.4);
    const personnelCost = Math.round(total * 0.3);
    const trainingCost = Math.round(total * 0.15);
    const meCost = Math.round(total * 0.1);
    const adminCost = Math.round(total * 0.05);

    return [
      {
        id: "b-1",
        category: "Equipment",
        description: "Field deployment equipment and technical hardware",
        quantity: 1,
        unitCost: equipmentCost,
        currency,
        totalCost: equipmentCost,
        justification: "Core physical infrastructure necessary for project execution.",
      },
      {
        id: "b-2",
        category: "Personnel",
        description: "Project Lead and Technical Field Officers (12 Months)",
        quantity: 2,
        unitCost: Math.round(personnelCost / 2),
        currency,
        totalCost: personnelCost,
        justification: "Dedicated technical staff directly overseeing implementation.",
      },
      {
        id: "b-3",
        category: "Training & Workshops",
        description: "Community stakeholder onboarding and technical training sessions",
        quantity: 4,
        unitCost: Math.round(trainingCost / 4),
        currency,
        totalCost: trainingCost,
        justification: "Quarterly workshops training local beneficiaries on operations.",
      },
      {
        id: "b-4",
        category: "Monitoring & Evaluation",
        description: "Third-party impact baseline and final evaluation survey",
        quantity: 1,
        unitCost: meCost,
        currency,
        totalCost: meCost,
        justification: "Independent verification of stated impact metrics.",
      },
      {
        id: "b-5",
        category: "Administration & Overhead",
        description: "Communication, compliance reporting, and office overhead",
        quantity: 12,
        unitCost: Math.round(adminCost / 12),
        currency,
        totalCost: adminCost,
        justification: "Monthly operational support adhering to funder overhead ceiling.",
      },
    ];
  }
}

export const proposalWorkspaceService = new ProposalWorkspaceService();
