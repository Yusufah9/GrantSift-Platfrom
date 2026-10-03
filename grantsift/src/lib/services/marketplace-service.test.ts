import { describe, it, expect } from "vitest";
import { MarketplaceService, VERIFIED_WRITERS } from "./marketplace-service";

describe("MarketplaceService", () => {
  const service = new MarketplaceService();

  it("lists all verified grant writers", () => {
    const writers = service.listWriters();
    expect(writers.length).toBe(VERIFIED_WRITERS.length);
  });

  it("filters writers by sector", () => {
    const cleanEnergyWriters = service.listWriters({ sector: "Clean Energy" });
    expect(cleanEnergyWriters.length).toBeGreaterThan(0);
    expect(cleanEnergyWriters.every((w) => w.sectors.includes("Clean Energy"))).toBe(true);
  });

  it("allows a client to post a grant requirement project", () => {
    const newProject = service.createProject({
      clientId: "client-test",
      clientOrgName: "BioHarvest Innovations",
      title: "Need expert for Horizon Europe Health Call",
      description: "Looking for grant writer to lead our work package narrative.",
      sector: "Healthcare",
      country: "South Africa",
      budgetUsd: 5000,
      deadline: "2026-12-01",
    });

    expect(newProject.id).toBeDefined();
    expect(newProject.status).toBe("open");

    const allProjects = service.listProjects();
    expect(allProjects.some((p) => p.id === newProject.id)).toBe(true);
  });

  it("allows a grant writer to submit a proposal", () => {
    const proposal = service.submitProposal({
      projectId: "proj-1",
      writerId: "writer-david-mwangi",
      writerName: "David Mwangi",
      proposedFeeUsd: 3200,
      timelineDays: 12,
      coverLetter: "I have prepared multiple successful clean energy applications.",
      approach: "Step 1 gap review, Step 2 draft synthesis, Step 3 founder review.",
    });

    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe("submitted");

    const projectProposals = service.listProposalsForProject("proj-1");
    expect(projectProposals.some((p) => p.id === proposal.id)).toBe(true);
  });
});
