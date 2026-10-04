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
  private applications: TrackedGrantApplication[] = [];

  constructor(initialApps?: TrackedGrantApplication[]) {
    if (initialApps) {
      this.applications = [...initialApps];
    }
  }

  listApplications(orgName?: string): TrackedGrantApplication[] {
    if (!orgName) return [...this.applications];
    return this.applications.filter((a) => a.organizationName.toLowerCase() === orgName.toLowerCase());
  }

  getApplicationById(id: string): TrackedGrantApplication | undefined {
    return this.applications.find((a) => a.id === id);
  }

  saveOpportunityToTracker(params: {
    grantId: string;
    grantTitle: string;
    funderName: string;
    organizationName: string;
    targetAmountUsd: number;
    deadline?: string;
    missingDocuments?: string[];
  }): TrackedGrantApplication {
    const existing = this.applications.find((a) => a.grantId === params.grantId);
    if (existing) return existing;

    const newApp: TrackedGrantApplication = {
      id: `app-${Date.now()}`,
      grantId: params.grantId,
      grantTitle: params.grantTitle,
      funderName: params.funderName,
      organizationName: params.organizationName || "My Organization",
      targetAmountUsd: params.targetAmountUsd || 100000,
      deadline: params.deadline || "2026-12-15",
      stage: "discovered",
      founderApprovalStatus: "none",
      missingDocuments: params.missingDocuments || ["Audited Financials"],
      notes: "Saved from Grant Database.",
      approvalHistory: [],
    };

    this.applications.unshift(newApp);
    return newApp;
  }

  updateStage(applicationId: string, newStage: ApplicationStage): TrackedGrantApplication {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found.`);
    app.stage = newStage;
    return { ...app };
  }

  requestDocument(applicationId: string, documentName: string): TrackedGrantApplication {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found.`);
    if (!app.missingDocuments.includes(documentName)) {
      app.missingDocuments.push(documentName);
    }
    app.stage = "awaiting_documents";
    return { ...app };
  }

  processFounderReview(params: {
    applicationId: string;
    founderName: string;
    decision: ApprovalDecision;
    comments: string;
    version: string;
  }): TrackedGrantApplication {
    const app = this.getApplicationById(params.applicationId);
    if (!app) throw new Error(`Application ${params.applicationId} not found.`);

    const approvalEvent: ApprovalEvent = {
      id: `appr-${Date.now()}`,
      applicationId: app.id,
      founderName: params.founderName,
      decision: params.decision,
      comments: params.comments,
      timestamp: new Date().toISOString(),
      version: params.version,
    };

    app.approvalHistory.push(approvalEvent);
    if (params.decision === "approved") {
      app.founderApprovalStatus = "approved";
      app.stage = "approved";
    } else if (params.decision === "changes_requested") {
      app.founderApprovalStatus = "changes_requested";
      app.stage = "changes_requested";
    } else {
      app.founderApprovalStatus = "rejected";
    }

    return { ...app };
  }

  recordSubmission(params: {
    applicationId: string;
    isExternal: boolean;
    submissionUrl?: string;
    confirmationNumber: string;
  }): TrackedGrantApplication {
    const app = this.getApplicationById(params.applicationId);
    if (!app) throw new Error(`Application ${params.applicationId} not found.`);
    if (app.founderApprovalStatus !== "approved") {
      throw new Error("Cannot submit application without verified founder approval.");
    }

    app.stage = "submitted";
    app.isExternalSubmission = params.isExternal;
    app.submissionUrl = params.submissionUrl;
    app.confirmationNumber = params.confirmationNumber;
    return { ...app };
  }
}

export const grantTrackerService = new GrantTrackerService();
