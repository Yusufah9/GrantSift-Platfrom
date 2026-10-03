export type ApplicationStage =
  | "discovered"
  | "matched"
  | "researching"
  | "eligible"
  | "writing"
  | "awaiting_documents"
  | "founder_review"
  | "changes_requested"
  | "approved"
  | "submitted"
  | "under_review"
  | "awarded"
  | "declined"
  | "withdrawn"
  | "reporting"
  | "completed";

export type ApprovalDecision = "approved" | "changes_requested" | "rejected";

export interface ApprovalEvent {
  id: string;
  applicationId: string;
  founderName: string;
  decision: ApprovalDecision;
  comments: string;
  timestamp: string;
  version: string;
}

export interface DisbursementTranche {
  id: string;
  trancheNumber: number;
  amountUsd: number;
  milestone: string;
  isReleased: boolean;
  releasedAt?: string;
}

export interface AwardRecord {
  awardAmountUsd: number;
  disbursedAmountUsd: number;
  awardDate: string;
  fundingPeriodMonths: number;
  milestones: DisbursementTranche[];
  reportingDeadlines: string[];
  actualExpenditureUsd: number;
}

export interface TrackedGrantApplication {
  id: string;
  grantId: string;
  grantTitle: string;
  funderName: string;
  organizationName: string;
  targetAmountUsd: number;
  deadline: string;
  stage: ApplicationStage;
  assignedWriterName?: string;
  founderApprovalStatus: "none" | "pending" | "approved" | "changes_requested" | "rejected";
  missingDocuments: string[];
  submissionUrl?: string;
  confirmationNumber?: string;
  isExternalSubmission?: boolean;
  notes: string;
  approvalHistory: ApprovalEvent[];
  award?: AwardRecord;
}

export class GrantTrackerService {
  private applications: TrackedGrantApplication[] = [
    {
      id: "app-sefa-1",
      grantId: "grant-afdb-clean-energy",
      grantTitle: "Sustainable Energy Fund for Africa (SEFA) Catalyst Grant",
      funderName: "African Development Bank (AfDB)",
      organizationName: "SolarBridge Mini-Grids",
      targetAmountUsd: 500000,
      deadline: "2026-12-15",
      stage: "writing",
      assignedWriterName: "Dr. Amara Okafor",
      founderApprovalStatus: "none",
      missingDocuments: ["2-Year Audited Financials", "Environmental Clearance Certificate"],
      notes: "Draft narrative 60% complete. Awaiting financial statements upload from founder.",
      approvalHistory: [],
    },
    {
      id: "app-tef-2",
      grantId: "grant-tony-elumelu-2026",
      grantTitle: "TEF Entrepreneurship Programme Seed Grant",
      funderName: "Tony Elumelu Foundation",
      organizationName: "SolarBridge Mini-Grids",
      targetAmountUsd: 50000,
      deadline: "2026-11-30",
      stage: "founder_review",
      assignedWriterName: "David Mwangi",
      founderApprovalStatus: "pending",
      missingDocuments: [],
      notes: "Proposal and budget finalized. Submitted to founder for sign-off.",
      approvalHistory: [],
    },
    {
      id: "app-usaid-3",
      grantId: "grant-usaid-agri-innovation",
      grantTitle: "Agricultural Innovation for Food Security Grant",
      funderName: "USAID Feed the Future",
      organizationName: "SolarBridge Mini-Grids",
      targetAmountUsd: 250000,
      deadline: "2026-08-30",
      stage: "awarded",
      assignedWriterName: "Dr. Amara Okafor",
      founderApprovalStatus: "approved",
      missingDocuments: [],
      notes: "Award contract executed. Tranche 1 disbursed.",
      approvalHistory: [
        {
          id: "appr-1",
          applicationId: "app-usaid-3",
          founderName: "Chief Executive Officer",
          decision: "approved",
          comments: "Comprehensive proposal and budget look verified against 2026 strategic objectives. Approved for submission.",
          timestamp: "2026-08-15T10:30:00Z",
          version: "v3",
        },
      ],
      award: {
        awardAmountUsd: 250000,
        disbursedAmountUsd: 100000,
        awardDate: "2026-09-01",
        fundingPeriodMonths: 24,
        actualExpenditureUsd: 42000,
        milestones: [
          {
            id: "tranche-1",
            trancheNumber: 1,
            amountUsd: 100000,
            milestone: "Mobilization, equipment procurement and baseline stakeholder onboarding",
            isReleased: true,
            releasedAt: "2026-09-10",
          },
          {
            id: "tranche-2",
            trancheNumber: 2,
            amountUsd: 100000,
            milestone: "Deployment of 15 operational community cold-chain hubs",
            isReleased: false,
          },
          {
            id: "tranche-3",
            trancheNumber: 3,
            amountUsd: 50000,
            milestone: "Impact audit, beneficiary survey verification and final project handover",
            isReleased: false,
          },
        ],
        reportingDeadlines: ["2026-12-01", "2027-06-01", "2027-12-01", "2028-08-30"],
      },
    },
  ];

  listApplications(): TrackedGrantApplication[] {
    return this.applications;
  }

  getApplicationById(id: string): TrackedGrantApplication | null {
    return this.applications.find((a) => a.id === id) ?? null;
  }

  updateStage(applicationId: string, newStage: ApplicationStage): TrackedGrantApplication {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);
    app.stage = newStage;
    return app;
  }

  /**
   * Founder Approval Workflow (PRD §14, §36)
   */
  processFounderReview(params: {
    applicationId: string;
    founderName: string;
    decision: ApprovalDecision;
    comments: string;
    version?: string;
  }): TrackedGrantApplication {
    const app = this.getApplicationById(params.applicationId);
    if (!app) throw new Error(`Application ${params.applicationId} not found`);

    const event: ApprovalEvent = {
      id: `appr-${Date.now()}`,
      applicationId: params.applicationId,
      founderName: params.founderName,
      decision: params.decision,
      comments: params.comments,
      timestamp: new Date().toISOString(),
      version: params.version ?? "v1",
    };

    app.approvalHistory.unshift(event);
    app.founderApprovalStatus = params.decision;

    if (params.decision === "approved") {
      app.stage = "approved";
    } else if (params.decision === "changes_requested") {
      app.stage = "changes_requested";
    } else if (params.decision === "rejected") {
      app.stage = "declined";
    }

    return app;
  }

  /**
   * Records a submission (Platform or External - PRD §84)
   */
  recordSubmission(params: {
    applicationId: string;
    isExternal: boolean;
    submissionUrl?: string;
    confirmationNumber?: string;
  }): TrackedGrantApplication {
    const app = this.getApplicationById(params.applicationId);
    if (!app) throw new Error(`Application ${params.applicationId} not found`);

    if (app.founderApprovalStatus !== "approved") {
      throw new Error("Cannot submit application without verified founder approval.");
    }

    app.stage = "submitted";
    app.isExternalSubmission = params.isExternal;
    app.submissionUrl = params.submissionUrl;
    app.confirmationNumber = params.confirmationNumber;

    return app;
  }

  /**
   * Request a document from the founder (PRD §16)
   */
  requestDocument(applicationId: string, documentName: string): TrackedGrantApplication {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);
    if (!app.missingDocuments.includes(documentName)) {
      app.missingDocuments.push(documentName);
    }
    app.stage = "awaiting_documents";
    return app;
  }
}
