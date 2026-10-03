export interface GrantWriterProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  sectors: string[];
  countriesServed: string[];
  languages: string[];
  experienceYears: number;
  grantsWonCount: number;
  totalFundsRaisedUsd: number;
  hourlyRateUsd: number;
  availability: "Available" | "Busy" | "Limited";
  rating: number; // 0 to 5.0
  reviewCount: number;
  isVerified: boolean;
}

export interface ClientProjectPost {
  id: string;
  clientId: string;
  clientOrgName: string;
  title: string;
  description: string;
  sector: string;
  country: string;
  budgetUsd: number;
  deadline: string;
  status: "open" | "in_review" | "assigned" | "closed";
  proposalsCount: number;
  createdAt: string;
}

export interface WriterProposal {
  id: string;
  projectId: string;
  writerId: string;
  writerName: string;
  proposedFeeUsd: number;
  timelineDays: number;
  coverLetter: string;
  approach: string;
  status: "submitted" | "shortlisted" | "accepted" | "declined";
  submittedAt: string;
}

export const VERIFIED_WRITERS: GrantWriterProfile[] = [
  {
    id: "writer-amara-okafor",
    name: "Dr. Amara Okafor",
    title: "Senior Grant Strategist & Climate Finance Consultant",
    bio: "Ex-AfDB consultant with 11+ years advising climate tech, renewable energy, and agricultural startups across Sub-Saharan Africa. Successfully secured over $14M in institutional grants.",
    sectors: ["Clean Energy", "Agriculture", "Climate Action"],
    countriesServed: ["Nigeria", "Kenya", "Ghana", "Rwanda", "South Africa"],
    languages: ["English", "French"],
    experienceYears: 11,
    grantsWonCount: 38,
    totalFundsRaisedUsd: 14200000,
    hourlyRateUsd: 120,
    availability: "Available",
    rating: 4.95,
    reviewCount: 42,
    isVerified: true,
  },
  {
    id: "writer-david-mwangi",
    name: "David Mwangi",
    title: "Technology & Venture Grant Specialist",
    bio: "Helping seed and Series A African tech founders win non-dilutive grant funding from Google, USAID, and European innovation councils. 8 years grant writing experience.",
    sectors: ["Technology", "Fintech", "Education"],
    countriesServed: ["Kenya", "Uganda", "Tanzania", "Rwanda", "Global"],
    languages: ["English", "Swahili"],
    experienceYears: 8,
    grantsWonCount: 26,
    totalFundsRaisedUsd: 6800000,
    hourlyRateUsd: 95,
    availability: "Available",
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
  },
  {
    id: "writer-fatima-hassan",
    name: "Fatima Al-Hassan",
    title: "Healthcare & Global Development Grants Director",
    bio: "Specializing in NIH, Wellcome Trust, and Gates Foundation healthcare proposals. Author of multi-million dollar health equity consortia submissions.",
    sectors: ["Healthcare", "Social Enterprise", "Research"],
    countriesServed: ["Egypt", "Nigeria", "South Africa", "United Kingdom", "Global"],
    languages: ["English", "Arabic"],
    experienceYears: 14,
    grantsWonCount: 52,
    totalFundsRaisedUsd: 22500000,
    hourlyRateUsd: 150,
    availability: "Limited",
    rating: 5.0,
    reviewCount: 61,
    isVerified: true,
  },
];

export class MarketplaceService {
  private writers: GrantWriterProfile[] = [...VERIFIED_WRITERS];
  private projects: ClientProjectPost[] = [
    {
      id: "proj-1",
      clientId: "client-sample-1",
      clientOrgName: "SolarBridge Mini-Grids",
      title: "Grant Writer needed for AfDB SEFA $500k Catalyst Submission",
      description: "We are an operational mini-grid developer in western Kenya looking for a certified grant specialist to finalize our technical narrative and financial justification.",
      sector: "Clean Energy",
      country: "Kenya",
      budgetUsd: 3500,
      deadline: "2026-11-20",
      status: "open",
      proposalsCount: 3,
      createdAt: "2026-10-01",
    },
    {
      id: "proj-2",
      clientId: "client-sample-2",
      clientOrgName: "FarmLink Logistics",
      title: "Proposal consultant for USAID Feed the Future Agri-Tech Grant",
      description: "Seeking an experienced agricultural grant writer to prepare compliance documentation and 24-month M&E plan for our cold-chain platform.",
      sector: "Agriculture",
      country: "Nigeria",
      budgetUsd: 2800,
      deadline: "2026-10-25",
      status: "open",
      proposalsCount: 2,
      createdAt: "2026-10-02",
    },
  ];

  private proposals: WriterProposal[] = [
    {
      id: "prop-1",
      projectId: "proj-1",
      writerId: "writer-amara-okafor",
      writerName: "Dr. Amara Okafor",
      proposedFeeUsd: 3400,
      timelineDays: 14,
      coverLetter: "I have prepared 5 successful SEFA submissions with AfDB and know their technical scoring criteria thoroughly.",
      approach: "Conduct baseline data room audit, draft 5-section narrative, and calibrate budget justification against allowable cost ceilings.",
      status: "shortlisted",
      submittedAt: "2026-10-02",
    },
  ];

  listWriters(filter?: { sector?: string; country?: string; maxRate?: number }): GrantWriterProfile[] {
    let list = [...this.writers];
    if (filter?.sector && filter.sector !== "All") {
      list = list.filter((w) => w.sectors.includes(filter.sector!));
    }
    if (filter?.country && filter.country !== "All") {
      list = list.filter((w) => w.countriesServed.includes(filter.country!) || w.countriesServed.includes("Global"));
    }
    if (filter?.maxRate) {
      list = list.filter((w) => w.hourlyRateUsd <= filter.maxRate!);
    }
    return list;
  }

  getWriterById(id: string): GrantWriterProfile | null {
    return this.writers.find((w) => w.id === id) ?? null;
  }

  listProjects(sector?: string): ClientProjectPost[] {
    if (!sector || sector === "All") return this.projects;
    return this.projects.filter((p) => p.sector === sector);
  }

  createProject(post: Omit<ClientProjectPost, "id" | "proposalsCount" | "createdAt" | "status">): ClientProjectPost {
    const newProject: ClientProjectPost = {
      ...post,
      id: `proj-${Date.now()}`,
      status: "open",
      proposalsCount: 0,
      createdAt: new Date().toISOString().split("T")[0]!,
    };
    this.projects.unshift(newProject);
    return newProject;
  }

  submitProposal(proposal: Omit<WriterProposal, "id" | "status" | "submittedAt">): WriterProposal {
    const newProp: WriterProposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      status: "submitted",
      submittedAt: new Date().toISOString().split("T")[0]!,
    };
    this.proposals.unshift(newProp);
    const proj = this.projects.find((p) => p.id === proposal.projectId);
    if (proj) proj.proposalsCount += 1;
    return newProp;
  }

  listProposalsForProject(projectId: string): WriterProposal[] {
    return this.proposals.filter((p) => p.projectId === projectId);
  }
}
