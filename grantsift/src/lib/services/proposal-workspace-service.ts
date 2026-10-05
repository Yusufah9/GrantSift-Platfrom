export type ProposalType =
  | "grant_proposal"
  | "technical_proposal"
  | "business_proposal"
  | "financial_proposal"
  | "impact_proposal"
  | "letter_of_inquiry"
  | "concept_note"
  | "expression_of_interest"
  | "project_proposal"
  | "full_application"
  | "funding_request"
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
  technical_proposal: "Technical Proposal (Specification §12)",
  business_proposal: "Business Proposal (Specification §12)",
  financial_proposal: "Financial Proposal (Specification §12)",
  impact_proposal: "Impact Proposal (Specification §12)",
  grant_proposal: "Standard Grant Proposal",
  letter_of_inquiry: "Letter of Inquiry (LOI)",
  concept_note: "Concept Note (2-3 Pages)",
  expression_of_interest: "Expression of Interest (EOI)",
  project_proposal: "Detailed Project Proposal",
  full_application: "Full Formal Application",
  funding_request: "Direct Funding Request",
  custom_proposal: "Custom Proposal",
};

export class ProposalWorkspaceService {
  /**
   * Generates tailored proposal sections based on selected proposal type (Specification §12).
   * Strict natural writing: feeds research directly into Technical, Business, Financial, and Impact proposals.
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
    grantIntelligence?: {
      funderPriorities?: string[];
      previousWinnersPatterns?: string[];
      whatNeedsToBeFixed?: string[];
    };
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
      grantIntelligence,
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
      grantIntelligence,
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
      grantIntelligence?: {
        funderPriorities?: string[];
        previousWinnersPatterns?: string[];
        whatNeedsToBeFixed?: string[];
      };
    }
  ): ProposalSection[] {
    const { orgName, country, funderName, grantName, problemStatement, solutionStatement, fundingAmount, currency, grantIntelligence } = ctx;

    const prioritiesSnippet = grantIntelligence?.funderPriorities?.join("; ") || "Verified community outcomes and financial discipline";
    const winnersSnippet = grantIntelligence?.previousWinnersPatterns?.join("; ") || "Pre-arranged signed MoUs, quarterly milestone tranches, and clear break-even trajectory";

    switch (type) {
      // 1. Technical Proposal (Specification §12)
      case "technical_proposal":
        return [
          {
            id: "tech-exec",
            title: "Technical Executive Summary & Funder Priority Alignment",
            description: "Calibrated to funder technical requirements and verified applicant patterns.",
            content: `${orgName} respectfully submits this Technical Proposal for the ${grantName} administered by ${funderName}. Engineered for field conditions in ${country}, our technical methodology directly incorporates funder priorities: ${prioritiesSnippet}.`,
            isRequired: true,
          },
          {
            id: "tech-architecture",
            title: "System Architecture, Engineering & Methodology",
            description: "Technical specifications, equipment standards, and off-grid performance.",
            content: solutionStatement || `Our technical architecture incorporates localized components designed for high-availability deployment across ${country}. Operational protocols have been calibrated using field data from preliminary pilot test-runs.`,
            isRequired: true,
          },
          {
            id: "tech-milestones",
            title: "Phased Work Plan & Milestone-Gated Deliverables",
            description: "Structured work packages adopting the milestone structure observed in previous winning proposals.",
            content: `Following proven grantee implementation frameworks (${winnersSnippet}), technical execution is structured into 4 quarterly deliverables:\n- Q1: Equipment procurement, site permitting, and baseline calibration.\n- Q2: Physical deployment and technical commissioning.\n- Q3: Operating pilot verification with local beneficiary off-takers.\n- Q4: Independent technical audit and handover.`,
            isRequired: true,
          },
          {
            id: "tech-risk",
            title: "Technical Risk Management & Quality Assurance",
            description: "Failsafe measures, maintenance schedules, and equipment lifecycle protocols.",
            content: `Maintenance reserve protocols and local technician training prevent post-award equipment downtime, addressing a primary evaluation concern flagged by funder review committees.`,
            isRequired: true,
          },
        ];

      // 2. Business Proposal (Specification §12)
      case "business_proposal":
        return [
          {
            id: "biz-market",
            title: "Market Opportunity & Target Demand in " + country,
            description: "Customer segment, market size, and baseline constraints addressed.",
            content: problemStatement || `Across ${country}, target market participants face acute operational inefficiencies and supply deficits that represent a verifiable addressable market.`,
            isRequired: true,
          },
          {
            id: "biz-model",
            title: "Business Model & Post-Grant Revenue Engine",
            description: "Commercial pricing, customer off-take agreements, and long-term self-sufficiency.",
            content: `${orgName} operates an earned-revenue model that eliminates perpetual dependency on grant subsidies. Operational break-even is achieved within 18 months through commercial service fees.`,
            isRequired: true,
          },
          {
            id: "biz-traction",
            title: "Traction, Customer Validation & Historical Growth",
            description: "Signed letters of intent, pilot customer testimonials, and operational metrics.",
            content: `Our venture has validated customer willingness-to-pay through pilot deployments. We have pre-arranged formal commitments with local community off-takers, fulfilling funder due diligence requirements.`,
            isRequired: true,
          },
          {
            id: "biz-scale",
            title: "Scaling Strategy & Competitive Advantage",
            description: "Unit economics, barriers to entry, and geographical expansion roadmap.",
            content: `Unit economics per deployment show a 34% cost advantage over imported alternatives, providing a durable competitive moat in ${country}.`,
            isRequired: true,
          },
        ];

      // 3. Financial Proposal (Specification §12)
      case "financial_proposal":
        return [
          {
            id: "fin-summary",
            title: "Financial Narrative & Cost Assumptions",
            description: "Overall budget justification for " + currency + " " + fundingAmount.toLocaleString() + " strictly adhering to eligible cost guidelines.",
            content: `This Financial Proposal provides transparent, itemized justification for ${currency} ${fundingAmount.toLocaleString()}. 100% of budgeted line items fall within the funder's published allowable cost categories, with administrative overhead strictly capped below 10%.`,
            isRequired: true,
          },
          {
            id: "fin-tranches",
            title: "Quarterly Milestone Tranche Structure",
            description: "Disbursement schedule tied to verified quantitative deliverables.",
            content: `Disbursements are structured into 4 milestone tranches:\n- Tranche 1 (25%): Mobilization and procurement advance.\n- Tranche 2 (25%): Field commissioning and deployment verification.\n- Tranche 3 (30%): Beneficiary verification and operational scale.\n- Tranche 4 (20%): Final monitoring and financial audit.`,
            isRequired: true,
          },
          {
            id: "fin-governance",
            title: "Financial Controls, Dual Authorization & Audit Readiness",
            description: "Accounting controls, dedicated grant escrow account, and independent audit compliance.",
            content: `${orgName} maintains segregated project accounting, dual-signatory authorizations for all expenditures over $1,000, and annual independent statutory audits.`,
            isRequired: true,
          },
        ];

      // 4. Impact Proposal (Specification §12)
      case "impact_proposal":
        return [
          {
            id: "imp-toc",
            title: "Theory of Change & Problem Statement",
            description: "Logical pathway from inputs and activities to short-, medium-, and long-term community impacts.",
            content: `By providing localized technological interventions in ${country}, ${orgName} directly removes baseline constraints, producing measurable productivity gains and economic resilience for target constituents.`,
            isRequired: true,
          },
          {
            id: "imp-beneficiaries",
            title: "Target Beneficiaries & Disaggregated KPIs",
            description: "Quantifiable direct and indirect beneficiary projections with gender and youth breakdowns.",
            content: `Direct Impact Targets over 24 Months:\n- 1,200 direct household beneficiaries verified through GPS survey mapping.\n- At least 60% female smallholder and women-led enterprise participation.\n- 85 verified direct green jobs created for youth in ${country}.`,
            isRequired: true,
          },
          {
            id: "imp-sdgs",
            title: "Sustainable Development Goals (SDG) Alignment",
            description: "Direct mapping to UN SDG targets and indicators.",
            content: `The project directly advances SDG 2 (Zero Hunger), SDG 7 (Affordable and Clean Energy), SDG 8 (Decent Work & Economic Growth), and SDG 13 (Climate Action).`,
            isRequired: true,
          },
          {
            id: "imp-me-framework",
            title: "Monitoring, Evaluation & Learning (MEL) Framework",
            description: "Quarterly data collection protocols, third-party verification, and learning dissemination.",
            content: `Quarterly monitoring is conducted via standardized digital surveying tools with third-party verification prior to release of subsequent funding tranches.`,
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

      case "grant_proposal":
      default:
        return [
          {
            id: "gp-executive-summary",
            title: "Executive Summary & Funder Alignment",
            description: "Concise synthesis of organizational capabilities, funder priority alignment, and high-level milestones.",
            content: `${orgName} respectfully submits this grant proposal for the ${grantName} administered by ${funderName}. Based in ${country}, our initiative deploys practical infrastructure and localized training to achieve verifiable community outcomes over a 24-month lifecycle with a requested allocation of ${currency} ${fundingAmount.toLocaleString()}.`,
            isRequired: true,
          },
          {
            id: "gp-problem-statement",
            title: "Problem Statement & Contextual Need",
            description: "Empirical baseline data, systemic barriers, and urgency of intervention in the target operating region.",
            content: problemStatement || `Across ${country}, target constituents face documented operational deficits in the ${grantName} sector. Over 58% of target producers lack reliable access to modern productive tooling, resulting in severe productivity losses and economic exclusion.`,
            isRequired: true,
          },
          {
            id: "gp-objectives-theory-of-change",
            title: "Project Goals, SMART Objectives & Theory of Change",
            description: "Explicit, time-bound targets and logical pathway from inputs to sustainable community transformation.",
            content: `Primary Goal: Deploy localized infrastructure to expand participant productivity by 35% within 18 months.\n• Objective 1: Commission operational units across target zones within Months 1 to 6.\n• Objective 2: Train 850 local enterprise operators in technical protocols by Month 12.\n• Objective 3: Attain commercial break-even and transition away from grant funding by Month 20.`,
            isRequired: true,
          },
          {
            id: "gp-solution-methodology",
            title: "Implementation Methodology & Phased Work Packages",
            description: "Quarterly milestone work packages, technical architecture, and risk-mitigated execution steps.",
            content: solutionStatement || `Execution follows 4 milestone-gated work packages:\n• Work Package 1 (Months 1 to 3): Baseline surveys, regulatory permitting, and equipment procurement.\n• Work Package 2 (Months 4 to 9): Installation, facility commissioning, and operator certification.\n• Work Package 3 (Months 10 to 18): Full operational run, supply chain integration, and service revenue.\n• Work Package 4 (Months 19 to 24): Independent evaluation and community cooperative ownership transfer.`,
            isRequired: true,
          },
          {
            id: "gp-beneficiary-impact",
            title: "Direct & Indirect Beneficiary Quantification",
            description: "Disaggregated direct and indirect participant counts, gender inclusion, and SDG alignment.",
            content: `Target Impact Metrics:\n• Direct Beneficiaries: 1,450 verified smallholder operators and cooperative members.\n• Gender and Youth Inclusion: Minimum 55% female and youth enrollment across leadership roles.\n• Indirect Beneficiaries: 7,800 community members benefiting from localized service access.\n• SDG Alignment: Advances UN SDG 8 (Decent Work & Economic Growth) and SDG 9 (Infrastructure).`,
            isRequired: true,
          },
          {
            id: "gp-budget-justification",
            title: "Activity-Based Budget Justification & Financial Controls",
            description: "Transparent cost allocation matching proposed work packages with dual-authorization financial governance.",
            content: `Total Funding Requested: ${currency} ${fundingAmount.toLocaleString()}.\nAllocations strictly follow allowable cost ceilings: Equipment (40%), Technical Personnel (28%), Direct Field Operations (16%), Monitoring & Evaluation (10%), and Administrative Overhead (6%). Financial governance requires dual-signatory bank approvals and segregated escrow accounting.`,
            isRequired: true,
          },
          {
            id: "gp-meal-framework",
            title: "Monitoring, Evaluation, Accountability & Learning (MEAL)",
            description: "Objective digital KPI tracking, quarterly verification gates, and independent audit protocols.",
            content: `Monitoring operates through continuous digital data capture with quarterly verification milestones prior to funding tranche disbursements. An external monitoring firm performs unannounced field audits at Months 12 and 24 to verify reported outcomes.`,
            isRequired: true,
          },
          {
            id: "gp-sustainability",
            title: "Organizational Capacity, Risk Management & Post-Grant Sustainability",
            description: "Team leadership track record, operational risk mitigation, and commercial break-even model.",
            content: `${orgName} operates with an experienced local executive team and robust risk mitigation protocols for foreign exchange and supply chain delays. By Month 16, user service fees generate sustainable operational cash flow, enabling complete financial independence and community asset transfer at Month 24.`,
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
