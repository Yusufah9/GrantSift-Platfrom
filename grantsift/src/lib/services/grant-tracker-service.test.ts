import { describe, it, expect } from "vitest";
import { GrantTrackerService, type TrackedGrantApplication } from "./grant-tracker-service";

const TEST_APPLICATIONS: TrackedGrantApplication[] = [
  {
    id: "app-sefa-1",
    grantId: "grant-afdb-clean-energy",
    grantTitle: "Sustainable Energy Fund for Africa (SEFA) Catalyst Grant",
    funderName: "African Development Bank (AfDB)",
    organizationName: "SolarBridge Mini-Grids",
    targetAmountUsd: 500000,
    deadline: "2026-12-15",
    stage: "writing",
    founderApprovalStatus: "none",
    missingDocuments: ["2-Year Audited Accounts"],
    notes: "High strategic fit for off-grid expansion.",
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
    stage: "awarded",
    founderApprovalStatus: "approved",
    missingDocuments: [],
    notes: "Seed tranche cleared.",
    approvalHistory: [],
  },
];

describe("GrantTrackerService", () => {
  const service = new GrantTrackerService(TEST_APPLICATIONS);

  it("lists all active grant applications across stages", () => {
    const apps = service.listApplications();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps.some((a) => a.stage === "writing")).toBe(true);
    expect(apps.some((a) => a.stage === "awarded")).toBe(true);
  });

  it("executes the founder approval workflow: approval", () => {
    const updated = service.processFounderReview({
      applicationId: "app-tef-2",
      founderName: "Lead Founder",
      decision: "approved",
      comments: "Budget justification looks solid. Proceed to submit.",
      version: "v2",
    });

    expect(updated.founderApprovalStatus).toBe("approved");
    expect(updated.stage).toBe("approved");
    expect(updated.approvalHistory.length).toBeGreaterThan(0);
    expect(updated.approvalHistory[0]?.decision).toBe("approved");
  });

  it("executes founder changes requested with audit comments", () => {
    const updated = service.processFounderReview({
      applicationId: "app-sefa-1",
      founderName: "Operations Director",
      decision: "changes_requested",
      comments: "Please re-allocate 10% from travel to technology equipment.",
      version: "v1",
    });

    expect(updated.founderApprovalStatus).toBe("changes_requested");
    expect(updated.stage).toBe("changes_requested");
    expect(updated.approvalHistory[0]?.comments).toContain("re-allocate 10%");
  });

  it("prevents submission before founder approval is granted", () => {
    expect(() =>
      service.recordSubmission({
        applicationId: "app-sefa-1", // currently changes_requested
        isExternal: true,
        confirmationNumber: "EXT-9988",
      })
    ).toThrow("Cannot submit application without verified founder approval.");
  });

  it("allows submission once approved and records confirmation number", () => {
    const submitted = service.recordSubmission({
      applicationId: "app-tef-2", // approved earlier
      isExternal: true,
      submissionUrl: "https://www.tefconnect.com/portal/application/9988",
      confirmationNumber: "TEF-CONF-7749",
    });

    expect(submitted.stage).toBe("submitted");
    expect(submitted.isExternalSubmission).toBe(true);
    expect(submitted.confirmationNumber).toBe("TEF-CONF-7749");
  });

  it("tracks missing documents and moves stage to awaiting_documents", () => {
    const app = service.requestDocument("app-tef-2", "Tax Compliance Certificate");
    expect(app.missingDocuments).toContain("Tax Compliance Certificate");
    expect(app.stage).toBe("awaiting_documents");
  });
});
