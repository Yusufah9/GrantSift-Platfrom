/**
 * BD & Project Devt Unit SOP Workbook data.
 *
 * Mirrors the IT Unit SOP structure exactly (same 9 sections, same table shapes).
 * Only the content is different: it covers business development, grants, partnerships
 * and project development instead of IT.
 *
 * Written in plain, human language. No dashes in content.
 */

export const SOP_COLORS = {
  primary: "#980F84", // user's chosen color
  dark: "#2C1028", // deep plum for titles and header text contrast
  tint: "#F7EAF5", // light tint for row banding
  border: "#E3C6DE",
  white: "#FFFFFF",
} as const;

export type SopBlock =
  | { kind: "fields"; title: string; rows: Array<[string, string]> }
  | { kind: "table"; title: string; columns: string[]; rows: string[][] }
  | { kind: "list"; title: string; items: string[] }
  | { kind: "text"; title: string; body: string };

export interface SopSheet {
  id: string;
  number: number;
  /** Excel sheet tab name (max 31 chars) */
  tab: string;
  title: string;
  blocks: SopBlock[];
}

export interface SopWorkbook {
  unit: string;
  organization: string;
  version: string;
  lastReviewed: string;
  owner: string;
  sheets: SopSheet[];
}

export const BD_PROJECT_DEVT_SOP: SopWorkbook = {
  unit: "BD & Project Devt Unit",
  organization: "8thGear Hub & Venture Studio",
  version: "1.0",
  lastReviewed: "October 2026",
  owner: "Yusuf Yaru Umaru (Growth Associate)",
  sheets: [
    // 1. Department Overview
    {
      id: "overview",
      number: 1,
      tab: "1. Department Overview",
      title: "Department Overview",
      blocks: [
        {
          kind: "fields",
          title: "Department",
          rows: [
            ["Department", "Business Development & Project Development"],
            ["Unit", "BD & Project Devt"],
            ["Reports To", "Mr. Damilola (final approval) through Dr. Seun (review)"],
            ["SOP Owner", "Yusuf Yaru Umaru, Growth Associate"],
            ["Subject Matter Expert", "Dr. Seun"],
          ],
        },
        {
          kind: "text",
          title: "Mission Statement",
          body:
            "We find the money, partners and programs that help our hub and our ventures grow. Then we write honest, well researched proposals that win them. We work with donors, NGOs, ESOs, hubs and government agencies who want to reach MSMEs and small businesses, and we make sure every promise we make is one we can keep.",
        },
        {
          kind: "list",
          title: "Key Objectives",
          items: [
            "Find at least 8 relevant grant, partnership or program opportunities every month.",
            "Submit at least 3 strong, fully approved proposals every month.",
            "Reach a win rate of 20% or more on submitted proposals within 12 months.",
            "Build working relationships with at least 10 new donors, NGOs, ESOs or agencies every quarter.",
            "Keep a clean pipeline tracker so anyone can see what is open, due and won.",
            "Make sure no proposal leaves the unit without Yusuf, Dr. Seun and Mr. Damilola signing off.",
            "Turn every won project into a clear execution plan the Projects team can run on day one.",
          ],
        },
        {
          kind: "table",
          title: "Organizational Structure",
          columns: ["Position", "Name"],
          rows: [
            ["Growth Associate", "Yusuf Yaru Umaru"],
            ["BD and Grant Writer", "Kunle"],
            ["BD and Grant Writer", "Tomiwa"],
            ["Project Devt Associate", "Seun Oladele"],
          ],
        },
      ],
    },

    // 2. Core Functions and Responsibilities
    {
      id: "core-functions",
      number: 2,
      tab: "2. Core Functions",
      title: "Core Functions and Responsibilities",
      blocks: [
        {
          kind: "text",
          title: "Outsourcing for Opportunities",
          body:
            "This is where everything starts. We look for grants, partnerships, calls for proposals and programs that fit what our hub and ventures do. If we don't find the right opportunity, nothing else in this SOP matters.",
        },
        {
          kind: "list",
          title: "Key Activities",
          items: [
            "Search the internet daily for grants, calls for proposals, RFPs and partnership calls that fit our focus.",
            "Look for government agencies and public programs funding MSME growth, jobs and innovation.",
            "Reach out to NGOs, ESOs, hubs and donors who want local partners to deliver programs for small businesses.",
            "Research each opportunity to understand what the funder really wants and how we can deliver it.",
            "Brainstorm with key stakeholders and team members on how to win each opportunity.",
            "Write proposals, concept notes, expressions of interest and application answers.",
            "Build budgets and financial proposals that match the technical proposal line by line.",
            "Design images, charts and visuals that help reviewers see our plan.",
            "Collect company documents (CAC certificate, audited accounts, tax clearance, CVs, past project reports) from other departments.",
            "Track every opportunity in the pipeline tracker with stage, deadline and owner.",
            "Follow up with funders after submission and record feedback, wins and losses.",
            "Hand over won projects to the Project Devt Associate with an execution plan.",
            "Keep a library of past proposals, budgets and boilerplate we can reuse.",
          ],
        },
        {
          kind: "table",
          title: "Scope",
          columns: ["Scope", "What It Covers"],
          rows: [
            ["Yes (we handle)", "Grants, donor funding and calls for proposals that fit our hub and ventures."],
            ["Yes (we handle)", "Partnerships and collaborations with NGOs, ESOs, hubs, donors and development agencies."],
            ["Yes (we handle)", "Government agency programs that fund MSMEs, SMBs, jobs and innovation."],
            ["Yes (we handle)", "Proposal writing: technical, financial, concept notes, EOIs and LOIs."],
            ["Yes (we handle)", "Program design and execution plans for projects we apply for or win."],
            ["Yes (we handle)", "Visuals and images that support our proposals."],
            ["Yes (we handle)", "Pipeline tracking, funder follow up and win/loss records."],
            ["No (outside our responsibility)", "Non Business Development and Project Devt related opportunities."],
            ["No (outside our responsibility)", "Day to day running of IT systems, payroll or HR matters."],
            ["No (outside our responsibility)", "Signing contracts or submitting on behalf of the organization without approval."],
            ["No (outside our responsibility)", "Equity fundraising for individual ventures, unless the Venture Studio asks us to support."],
          ],
        },
        {
          kind: "list",
          title: "Relationship with Other Departments",
          items: [
            "Collaborate with all departments to get the documents we need to win BD and project opportunities.",
            "Finance: budgets, audited accounts, bank details and cost rates for financial proposals.",
            "Admin / HR: CAC documents, staff CVs, organogram and policies funders ask for.",
            "IT: data protection details, system descriptions and tech architecture for technical proposals.",
            "Venture Studio: venture profiles, traction numbers and founder stories for case studies.",
            "Programs / Projects: past project results and photos we can use as evidence.",
            "Communications: brand assets, approved photos and design support for proposal visuals.",
            "Leadership (Dr. Seun and Mr. Damilola): strategy direction, review and final approval.",
          ],
        },
      ],
    },

    // 3. Process Documentation
    {
      id: "process",
      number: 3,
      tab: "3. Process Documentation",
      title: "Process Documentation",
      blocks: [
        {
          kind: "fields",
          title: "How to Find, Write and Submit a Winning Proposal",
          rows: [
            ["Purpose", "Take an opportunity from first search to an approved, submitted proposal."],
            ["Starts When", "A team member begins the weekly opportunity search, or someone shares a new call."],
            ["Ends When", "Mr. Damilola approves the proposal and it is submitted before the deadline."],
            ["Inputs", "Internet access, pipeline tracker, company documents, past proposals, Grammarly, Claude Pro, Google AI Studio."],
            ["Outputs", "An approved, submitted proposal; an updated tracker; a saved copy in the proposal library."],
            ["Success Looks Like", "Submitted on time, no errors, every claim backed by evidence, and a clear plan if we win."],
          ],
        },
        {
          kind: "table",
          title: "Process Steps",
          columns: ["Step", "Outcome", "What We Do", "Owner", "Input", "Output"],
          rows: [
            [
              "1",
              "Fitting opportunities found",
              "Search for opportunities on the internet that align with our focus and that we can actually win.",
              "Kunle, Tomiwa",
              "Funder sites, grant databases, newsletters, LinkedIn",
              "Shortlist in tracker with deadline and fit notes",
            ],
            [
              "2",
              "Win strategy agreed",
              "Brainstorm strategies and ideas on how to execute and win the program or project we are applying for.",
              "Yusuf Yaru Umaru with writers",
              "Shortlist, funder guidelines",
              "Go / no go decision and a one page strategy note",
            ],
            [
              "3",
              "Proposal plan ready",
              "Research strategies, ideas and ways to write a strong proposal that shows exactly what we will do if the donor gives us the chance.",
              "Kunle, Tomiwa, Seun Oladele",
              "Strategy note, past winning proposals, data sources",
              "Outline with evidence list and execution plan draft",
            ],
            [
              "4",
              "First draft written",
              "Write a statistics driven proposal that teaches and informs the reader.",
              "Kunle, Tomiwa",
              "Outline, evidence, budget inputs from Finance",
              "Complete first draft with budget",
            ],
            [
              "5",
              "Draft cleaned up",
              "Edit all initial proposal drafts written by the BD writers. Check grammar, numbers and funder rules.",
              "BD Writers (peer edit)",
              "First draft, Grammarly, funder checklist",
              "Edited draft ready for review",
            ],
            [
              "6",
              "Internal review passed",
              "Yusuf Yaru Umaru reviews all written proposals and passes them to Dr. Seun.",
              "Yusuf Yaru Umaru",
              "Edited draft",
              "Reviewed draft with comments resolved",
            ],
            [
              "7",
              "Expert feedback applied",
              "Brainstorm with Dr. Seun for ideas and corrections, then review again.",
              "Dr. Seun, Yusuf Yaru Umaru, writers",
              "Reviewed draft",
              "Final draft",
            ],
            [
              "8",
              "Approved and submitted",
              "Submit to Mr. Damilola for approval. Once approved, submit to the funder and log it.",
              "Yusuf Yaru Umaru, Mr. Damilola",
              "Final draft, submission portal login",
              "Approved proposal, submission receipt, tracker updated",
            ],
          ],
        },
        {
          kind: "table",
          title: "FAQ",
          columns: ["Question", "Answer"],
          rows: [
            ["What if the deadline is less than 5 days away?", "Tell Yusuf the same day. He decides if we go ahead and books review time with Dr. Seun and Mr. Damilola."],
            ["Can a writer submit if leaders are unavailable?", "No. Nobody submits without approval. Ask Yusuf to escalate."],
            ["Where do I save drafts?", "In the shared proposal folder, named Funder_Program_Date_Version."],
          ],
        },
      ],
    },

    // 4. Policies, Approvals, and Authority
    {
      id: "policies",
      number: 4,
      tab: "4. Policies & Authority",
      title: "Policies, Approvals, and Authority",
      blocks: [
        {
          kind: "table",
          title: "Departmental Policies",
          columns: ["Policy Name", "Description"],
          rows: [
            [
              "1. BD Writers Policy",
              "Governs how writers write. Writers draft, research and edit, but on no occasion are they allowed to submit any proposal without approval from Yusuf, Dr. Seun and Mr. Damilola.",
            ],
            [
              "2. Intellectual Property Protection Policy",
              "All proposals, budgets, strategies, templates and visuals belong to the organization. They are not shared outside without approval, and we do not copy other organizations' work.",
            ],
            [
              "3. Evidence and Honesty Policy",
              "Every number and claim in a proposal must have a source or come from our own records. We never invent beneficiaries, results or partners.",
            ],
            [
              "4. Funder Communication Policy",
              "Only Yusuf or someone he names speaks to funders on open applications. All emails are copied to the shared BD inbox.",
            ],
            [
              "5. Document Handling and Confidentiality Policy",
              "Company documents (accounts, IDs, bank details) are stored only in the secure shared drive and never sent through personal email.",
            ],
            [
              "6. AI Use Policy",
              "AI tools can help with research and drafts. A human must check every fact, and no confidential data goes into tools without approval.",
            ],
          ],
        },
        {
          kind: "table",
          title: "Approval Limits & Decision Making Authority",
          columns: ["Decision Type", "Team Lead Authority"],
          rows: [
            ["Outsourcing of opportunities", "Yes, permitted to do so."],
            ["Writing initial draft", "Yes, permitted to do so."],
            ["Editing drafts and peer review", "Yes, permitted to do so."],
            ["Go / no go on an opportunity", "Yes, Yusuf decides; Dr. Seun is told for big bids."],
            ["Contacting a funder with questions", "Yes, with Yusuf's knowledge."],
            ["Committing budget figures or co funding", "Not permitted to do so. Needs Dr. Seun and Finance."],
            ["Review and submission", "Not permitted to do so. Needs Mr. Damilola's approval."],
            ["Signing partnership MoUs or contracts", "Not permitted to do so. Mr. Damilola only."],
          ],
        },
      ],
    },

    // 5. Tools, Systems and Resources
    {
      id: "tools",
      number: 5,
      tab: "5. Tools & Resources",
      title: "Tools, Systems and Resources",
      blocks: [
        {
          kind: "table",
          title: "Tools, Systems and Resources",
          columns: ["Tool / System", "What We Use It For"],
          rows: [
            ["Grammarly", "Grammar, clarity and tone checks on every draft."],
            ["Claude Pro", "Research help, outlining, and first pass drafting that writers then rewrite and fact check."],
            ["Google AI Studio", "Creating images and visuals for proposals."],
            ["ChatGPT / Gemini", "Second opinion on structure and summarizing long funder guidelines."],
            ["Perplexity", "Quick research with linked sources we can check."],
            ["GrantSift", "Finding grants, tracking the pipeline, and drafting with our evidence."],
            ["Canva", "Proposal covers, infographics and one page summaries."],
            ["Google Workspace (Docs, Sheets, Drive)", "Shared drafting, budgets, trackers and document storage."],
            ["Notion / Trello", "Task board for each live proposal."],
            ["Zoom / Google Meet", "Brainstorm sessions, funder calls and reviews."],
            ["Excel", "Budgets, financial proposals and pipeline reports."],
          ],
        },
        {
          kind: "table",
          title: "Standard Templates and Documents",
          columns: ["Template / Document", "Purpose"],
          rows: [
            ["Initial draft proposal", "Standard layout writers start from so every draft has the same sections."],
            ["Strategy documents for the business proposals", "One page note on why we can win and how."],
            ["Execution plan", "Who does what, when, and with what budget if we win."],
            ["Concept note template", "Short 2 to 3 page version for first round calls."],
            ["Expression of Interest / Letter of Inquiry", "First contact with funders who don't run open calls."],
            ["Technical proposal template", "Full method, work plan, team and M&E sections."],
            ["Financial proposal and budget template", "Line item budget with notes that match the technical proposal."],
            ["Theory of change and logframe", "Shows how activities lead to results."],
            ["M&E framework", "Indicators, targets and how we will measure them."],
            ["Organization capability statement", "Who we are, what we've done, with numbers."],
            ["Team CV pack", "Up to date CVs in funder friendly format."],
            ["Partnership MoU template", "Starting point for collaboration agreements."],
            ["Opportunity pipeline tracker", "All open, submitted, won and lost opportunities."],
            ["Proposal review checklist", "What Yusuf and Dr. Seun check before approval."],
            ["Win / loss debrief form", "What we learned from each result."],
          ],
        },
        {
          kind: "table",
          title: "Key Resources & Equipment",
          columns: ["Resource / Equipment", "Purpose"],
          rows: [
            ["Laptop for each team member", "Research, writing and design work."],
            ["Reliable internet and backup data", "Portal submissions often happen close to deadlines."],
            ["Shared drive with company documents", "Fast access to CAC, accounts, tax clearance and CVs."],
            ["Proposal library", "Past winning and losing proposals to learn from and reuse."],
            ["Funder contact list (CRM)", "Who we know at each donor, NGO, ESO and agency."],
            ["Paid tool subscriptions", "Claude Pro, Grammarly, Canva and others listed above."],
            ["Power backup", "Keeps work going during outages near deadlines."],
          ],
        },
      ],
    },

    // 6. Controls & Risk Management
    {
      id: "risks",
      number: 6,
      tab: "6. Controls & Risk",
      title: "Controls & Risk Management",
      blocks: [
        {
          kind: "table",
          title: "Key Operational Risks",
          columns: ["Risk Category", "Specific Risk"],
          rows: [
            ["Deadline", "Missing a submission deadline because review started too late."],
            ["Compliance", "Breaking funder rules on format, page limits or eligibility and getting disqualified."],
            ["Quality", "Weak or generic proposals that don't speak to the funder's priorities."],
            ["Accuracy", "Wrong numbers, budget totals that don't add up, or claims without evidence."],
            ["Approval", "A writer submits without the required approvals."],
            ["Documents", "Missing or expired company documents (tax clearance, audited accounts) at submission."],
            ["Intellectual Property", "Proposals or strategies shared outside the organization without approval."],
            ["Reputation", "Over promising to a funder and failing to deliver after winning."],
            ["Capacity", "Too many bids at once, so quality drops across all of them."],
            ["People", "Knowledge sits with one person and is lost when they leave."],
            ["Data Protection", "Confidential data pasted into AI tools or sent through personal email."],
            ["Partnership", "Partners don't deliver their part of a joint proposal or project."],
            ["Currency", "Exchange rate changes make a USD budget too small for Naira costs."],
          ],
        },
        {
          kind: "table",
          title: "Escalation Procedures",
          columns: ["Issue Type", "Response"],
          rows: [
            ["Deadline at risk", "Writer tells Yusuf the same day. Yusuf reprioritizes work and books review slots."],
            ["Missing company document", "Yusuf contacts the owning department head. If not fixed in 48 hours, escalate to Dr. Seun."],
            ["Funder rule unclear", "Yusuf emails the funder for clarity and records the answer in the tracker."],
            ["Disagreement on strategy or content", "Brainstorm with Dr. Seun. His decision stands."],
            ["Unapproved submission or IP leak", "Report to Mr. Damilola at once. Contact the funder if needed."],
            ["Partner not delivering", "Yusuf raises it with the partner within 3 days, then escalates to Mr. Damilola."],
          ],
        },
      ],
    },

    // 7. Performance & Reporting
    {
      id: "performance",
      number: 7,
      tab: "7. Performance & Reporting",
      title: "Performance & Reporting",
      blocks: [
        {
          kind: "table",
          title: "Key Performance Indicators (KPIs)",
          columns: ["KPI Category", "KPI Name"],
          rows: [
            ["Pipeline", "Number of relevant opportunities found per month (target 8+)."],
            ["Output", "Number of approved proposals submitted per month (target 3+)."],
            ["Results", "Win rate on submitted proposals (target 20%+)."],
            ["Results", "Total funding secured per quarter (₦ and USD)."],
            ["Timeliness", "Share of proposals submitted at least 48 hours before deadline (target 90%)."],
            ["Quality", "Average internal review score from the proposal checklist (target 80%+)."],
            ["Partnerships", "New partners and MoUs signed per quarter (target 10 conversations, 2 MoUs)."],
            ["Handover", "Won projects handed over with an execution plan within 7 days (target 100%)."],
          ],
        },
        {
          kind: "table",
          title: "Reports Generated",
          columns: ["Report Name", "Frequency"],
          rows: [
            ["Opportunity pipeline update", "Weekly"],
            ["Proposals submitted and status", "Weekly"],
            ["BD performance dashboard (KPIs)", "Monthly"],
            ["Funding secured and partnership report", "Quarterly"],
            ["Win / loss lessons summary", "Quarterly"],
            ["Annual BD review and plan", "Yearly"],
          ],
        },
        {
          kind: "table",
          title: "Monitoring & Review Processes",
          columns: ["Review Process", "Description"],
          rows: [
            ["Quarterly Appraisal", "Each team member is reviewed on the KPIs above, the quality of their drafts, and what they learned. Yusuf leads, Dr. Seun signs off."],
            ["SOP Review & Update", "Every 6 months the team reads this SOP against how we really work and updates it. Anyone can suggest edits at any time; Yusuf keeps the version history."],
            ["Weekly Pipeline Meeting", "30 minutes every Monday to agree priorities, owners and deadlines for the week."],
            ["Post Submission Debrief", "Within a week of every result, the team notes what worked and what didn't."],
          ],
        },
      ],
    },

    // 8. Onboarding, Knowledge Transfer & Continuity
    {
      id: "onboarding",
      number: 8,
      tab: "8. Onboarding & Continuity",
      title: "Onboarding, Knowledge Transfer & Continuity",
      blocks: [
        {
          kind: "table",
          title: "New Team Member Onboarding",
          columns: ["Week", "Training Focus"],
          rows: [
            ["Week 1", "Meet the team and leaders. Read this SOP, the mission and our ventures. Get access to the shared drive, tracker and tools."],
            ["Week 2", "Study 5 past winning and 3 losing proposals. Shadow a writer on a live draft. Learn the templates."],
            ["Week 3", "Run the opportunity search and add 5 fitting opportunities to the tracker. Edit a draft with Grammarly and the checklist."],
            ["Week 4", "Write sections of a live proposal. Present it to Yusuf for review and take feedback."],
            ["Month 2 to 3", "Lead a full concept note or proposal from search to approval. Join a funder call. Take ownership of one SOP section."],
          ],
        },
        {
          kind: "table",
          title: "Training Requirements",
          columns: ["Role", "Required Skills / Knowledge"],
          rows: [
            ["Growth Associate", "Pipeline management, proposal review, funder relationships, team leadership, budgeting basics."],
            ["BD and Grant Writer", "Clear writing, research with sources, funder guidelines, budgets that match narratives, AI tools, Grammarly."],
            ["Project Devt Associate", "Program design, theory of change, logframes, M&E, execution planning and partner coordination."],
            ["All team members", "MSME and startup ecosystem in Nigeria and Africa, data protection, IP policy, our approval process."],
          ],
        },
        {
          kind: "table",
          title: "Handover & Continuity Arrangements",
          columns: ["Scenario", "Continuity Measures"],
          rows: [
            ["Leave", "Give 2 weeks notice. Update the tracker, save all drafts in the shared folder, and brief a named cover person. Funders on live bids get the cover person's contact."],
            ["Exit", "Give a written handover note with every open opportunity, contact and file location. Hand over tool logins. Yusuf confirms nothing is left on personal devices."],
            ["Sudden absence", "Because all drafts live in the shared drive and the tracker is current, another writer can pick up within one day."],
          ],
        },
      ],
    },

    // 9. Challenges & Improvement Opportunities
    {
      id: "challenges",
      number: 9,
      tab: "9. Challenges & Improvement",
      title: "Challenges & Improvement Opportunities",
      blocks: [
        {
          kind: "table",
          title: "Current Operational Challenges",
          columns: ["Challenge Category", "Specific Challenge"],
          rows: [
            ["Time", "Many calls have short windows, which squeezes review time with Dr. Seun and Mr. Damilola."],
            ["Documents", "Company documents are slow to get from other departments when a deadline is close."],
            ["Data", "Local statistics for strong evidence are hard to find or out of date."],
            ["Capacity", "Two writers can't cover every good opportunity, so we have to say no to some."],
            ["Feedback", "Many funders don't explain rejections, so it's hard to learn from losses."],
            ["Tools", "Paid tools and data sources cost money, and access is shared."],
          ],
        },
        {
          kind: "table",
          title: "Opportunities for Better Coordination",
          columns: ["Department / Team", "Coordination Opportunities"],
          rows: [
            ["Finance", "Keep an up to date document pack (accounts, tax clearance, bank letter) ready at all times. Agree standard cost rates for budgets."],
            ["Admin / HR", "Refresh staff CVs and the organogram every quarter so they're ready for proposals."],
            ["Venture Studio", "Share venture traction numbers and founder stories monthly so we always have fresh case studies."],
            ["Programs / Projects", "Collect results, photos and testimonials during every project for future proposals."],
            ["Communications", "Set up a shared brand and photo library for proposal visuals."],
            ["Leadership", "Hold fixed weekly review slots so approvals don't wait for free time."],
          ],
        },
      ],
    },
  ],
};

/** Counts every row/item for summary badges. */
export function countSopEntries(wb: SopWorkbook): number {
  return wb.sheets.reduce(
    (sum, sheet) =>
      sum +
      sheet.blocks.reduce((s, b) => {
        if (b.kind === "fields") return s + b.rows.length;
        if (b.kind === "table") return s + b.rows.length;
        if (b.kind === "list") return s + b.items.length;
        return s + 1;
      }, 0),
    0,
  );
}
