"use client";

import { useState } from "react";
import Link from "next/link";

export interface SopStepDefinition {
  stepNumber: number;
  title: string;
  category: "Discovery & Qualification" | "Deep Research" | "Documentation" | "Proposal & Budget" | "Review & Sign-Off" | "Submission & Post-Award";
  summary: string;
  detailedInstructions: string;
  inputsRequired: string[];
  outputsGenerated: string[];
  platformActionLabel?: string;
  platformActionHref?: string;
}

export const EXACT_24_SOP_STEPS: SopStepDefinition[] = [
  {
    stepNumber: 1,
    title: "Understand Organization",
    category: "Discovery & Qualification",
    summary: "Before searching for grants, understand the organization you are writing for.",
    detailedInstructions:
      "Collect: Organization/company name, what they do, problem they solve, target beneficiaries/customers, location, industry/sector, stage, revenue/financial position, team, previous work, impact, funding needs, project they want funded. Review company profile, account details, previous proposals, and existing documents.",
    inputsRequired: ["Company profile", "Account details", "Previous proposals", "Existing pitch decks"],
    outputsGenerated: ["Master organization baseline profile", "Problem & solution summary"],
    platformActionLabel: "View Organization Profile",
    platformActionHref: "/workspace?tab=profile",
  },
  {
    stepNumber: 2,
    title: "Build Eligibility Profile",
    category: "Discovery & Qualification",
    summary: "Identify the characteristics that determine which grants they can apply for.",
    detailedInstructions:
      "Map out: Country, sector, organization type (Startup, NGO, University, Business), project type, funding amount needed, geographic scope, target beneficiaries, gender requirements, age requirements, revenue requirements, and stage requirements. This becomes your grant-search profile/scorecard.",
    inputsRequired: ["Operating jurisdiction", "Legal registration status", "Historical revenue", "Target funding amount"],
    outputsGenerated: ["Organization Eligibility Profile", "Readiness Scorecard"],
    platformActionLabel: "Complete Scorecard",
    platformActionHref: "/workspace?tab=scorecard",
  },
  {
    stepNumber: 3,
    title: "Search for Grants",
    category: "Discovery & Qualification",
    summary: "Search for grants matching the organization's eligibility profile.",
    detailedInstructions:
      "Search grant websites, grant databases, funder portals, Opportunity Square, Instrumentl, and other relevant websites. Example queries: 'Climate grants for Nigerian startups 2026' or 'Education grants for NGOs in Nigeria'. Build a curated list of potential grants before writing.",
    inputsRequired: ["Target keywords", "Geographic criteria", "Sector focus"],
    outputsGenerated: ["List of potential grant opportunities"],
    platformActionLabel: "Search Grant Database",
    platformActionHref: "/database",
  },
  {
    stepNumber: 4,
    title: "Verify Grant Website",
    category: "Discovery & Qualification",
    summary: "Open the original website for every potential grant to verify critical facts.",
    detailedInstructions:
      "Verify: Is the grant actually open? Deadline, funding amount, eligible countries, eligible organizations, eligible projects, requirements, application process, required documents, application questions, evaluation criteria, and submission method. Determine genuine suitability rather than relying on search snippets.",
    inputsRequired: ["Official funder URL", "Program RFP document"],
    outputsGenerated: ["Verification confirmation", "Verified deadline and criteria"],
    platformActionLabel: "Live Web Verification",
    platformActionHref: "/workspace?tab=research&mode=grant_analysis",
  },
  {
    stepNumber: 5,
    title: "Research Funder",
    category: "Deep Research",
    summary: "Research the organization providing the money.",
    detailedInstructions:
      "Understand: Who are they? What do they fund? What problems do they care about? What countries do they fund? What types of organizations do they support? What language do they use? What are their priorities? Look at their website, reports, announcements, social media, and public declarations.",
    inputsRequired: ["Funder website", "Annual reports", "Public announcements"],
    outputsGenerated: ["Funder Intelligence Profile", "Thematic priorities list"],
    platformActionLabel: "Research Funder",
    platformActionHref: "/workspace?tab=research&mode=funder_research",
  },
  {
    stepNumber: 6,
    title: "Research Previous Recipients",
    category: "Deep Research",
    summary: "Investigate people and organizations that previously received the grant.",
    detailedInstructions:
      "Use Google, LinkedIn, YouTube, X/Twitter, organization websites, news articles, and interviews. What did organizations that received this funding actually do? Examine their project, positioning, problem description, impact, beneficiaries, implementation approach, language, and results.",
    inputsRequired: ["Previous winner names", "Press releases", "Recipient case studies"],
    outputsGenerated: ["Recipient analysis dossier", "Historical funding benchmarks"],
    platformActionLabel: "Recipient Intelligence",
    platformActionHref: "/workspace?tab=research&mode=recipient_research",
  },
  {
    stepNumber: 7,
    title: "Extract Insights & Patterns",
    category: "Deep Research",
    summary: "Identify recurring patterns and strategic observations across past winners.",
    detailedInstructions:
      "Do not simply copy. Look for patterns: specific problem definition, specific community, measurable impact, practical implementation plan, strong partnerships, and sustainability. Distinguish between official requirements, research insights, personal observations, and recipient advice.",
    inputsRequired: ["Past winner dossiers", "Evaluation rubric"],
    outputsGenerated: ["Pattern analysis report", "Strategic positioning notes"],
    platformActionLabel: "Review Insights",
    platformActionHref: "/workspace?tab=research",
  },
  {
    stepNumber: 8,
    title: "Extract Requirements",
    category: "Documentation",
    summary: "Build an exhaustive checklist of everything the grant requires before writing.",
    detailedInstructions:
      "Create checklist: Eligibility (e.g. Nigerian organization, registered business, operating 2+ years), Documents (CAC certificate, financial statements, founder CV, bank statement, tax documents), Proposal sections (Executive summary, problem statement, solution, methodology, impact, sustainability), Financial requirements, and letters of support. Prevents discovering missing items at the end.",
    inputsRequired: ["Grant application guidelines", "Official RFP checklist"],
    outputsGenerated: ["Master Requirements Checklist"],
    platformActionLabel: "View Requirements",
    platformActionHref: "/workspace?tab=research",
  },
  {
    stepNumber: 9,
    title: "Identify Missing Documents",
    category: "Documentation",
    summary: "Compare grant requirements against what is currently available in the Data Room.",
    detailedInstructions:
      "Compare requirements against existing assets (CAC certificate: Available, Founder CV: Available, Financial statement: Available, Bank statement: Missing, Partnership letter: Missing). Flag all gaps explicitly.",
    inputsRequired: ["Data Room inventory", "Master Requirements Checklist"],
    outputsGenerated: ["Document gap assessment", "Missing documents list"],
    platformActionLabel: "Open Data Room",
    platformActionHref: "/workspace?tab=documents",
  },
  {
    stepNumber: 10,
    title: "Request Documents from Founder",
    category: "Documentation",
    summary: "Request missing verification documents directly from the organization founder.",
    detailedInstructions:
      "Request missing items from the founder (tax clearance certificates, audited financials, signed partner letters) with clear deadlines so delays do not threaten submission.",
    inputsRequired: ["Missing documents list"],
    outputsGenerated: ["Founder document requests", "Uploaded Data Room files"],
    platformActionLabel: "Upload to Data Room",
    platformActionHref: "/workspace?tab=documents",
  },
  {
    stepNumber: 11,
    title: "Research Proposal",
    category: "Proposal & Budget",
    summary: "Synthesize research evidence to structure the proposal strategy.",
    detailedInstructions:
      "Combine Organization information + Grant requirements + Funder research + Previous recipient research + Supporting evidence to determine how the proposal should be structured and positioned.",
    inputsRequired: ["Synthesized research dossier", "Funder priorities"],
    outputsGenerated: ["Proposal outline", "Win theme strategy"],
    platformActionLabel: "Proposal Intelligence",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 12,
    title: "Write Proposal",
    category: "Proposal & Budget",
    summary: "Draft the actual application narrative sections in natural, professional language.",
    detailedInstructions:
      "Prepare required sections: Executive summary, organization profile, problem statement, needs assessment, project description, solution, objectives, activities, methodology, work plan, timeline, target beneficiaries, expected outcomes, impact, M&E, sustainability, team, and risk management.",
    inputsRequired: ["Proposal template", "Data Room evidence", "Funder requirements"],
    outputsGenerated: ["Draft proposal narrative"],
    platformActionLabel: "Open Proposal Editor",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 13,
    title: "Build Budget",
    category: "Proposal & Budget",
    summary: "Create the itemized financial proposal based on the actual project work plan.",
    detailedInstructions:
      "Determine line items: Personnel, equipment, software/technology, transportation, training, materials, operations, communication, monitoring, and administration. Ensure: Budget ↔ Activities ↔ Timeline ↔ Objectives align seamlessly.",
    inputsRequired: ["Activity work plan", "Supplier quotes", "Personnel rates"],
    outputsGenerated: ["Itemized Budget Table", "Budget Justification Narrative"],
    platformActionLabel: "Open Budget Builder",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 14,
    title: "Add Visuals",
    category: "Proposal & Budget",
    summary: "Incorporate professional charts, tables, diagrams, and project graphics.",
    detailedInstructions:
      "Do not make the proposal text-heavy. Add appropriate images, charts, tables, implementation diagrams, and organization branding to make the proposal easier to read and evaluate. Avoid decorative fluff.",
    inputsRequired: ["Implementation diagrams", "Financial tables", "Field photos"],
    outputsGenerated: ["Visualized proposal assets"],
    platformActionLabel: "Proposal Workspace",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 15,
    title: "Review Against Requirements",
    category: "Review & Sign-Off",
    summary: "Audit the proposal draft directly against the original grant guidelines.",
    detailedInstructions:
      "Check: Did I answer everything? Did I follow word limits? Did I provide every required document? Did I use the correct format? Did I answer every question? Is the budget correct and numbers consistent? Did I follow the deadline?",
    inputsRequired: ["Complete draft", "Funder guidelines checklist"],
    outputsGenerated: ["Compliance verification matrix"],
    platformActionLabel: "Review Workspace",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 16,
    title: "Quality Control",
    category: "Review & Sign-Off",
    summary: "Conduct rigorous editorial and factual quality control.",
    detailedInstructions:
      "Review for: Accuracy, grammar, numbers, consistency, evidence, budget calculations, formatting, and missing information. Ensure zero fabricated facts.",
    inputsRequired: ["Draft narrative and budget"],
    outputsGenerated: ["QC approved application package"],
    platformActionLabel: "Quality Review",
    platformActionHref: "/workspace?tab=proposals",
  },
  {
    stepNumber: 17,
    title: "Send to Founder",
    category: "Review & Sign-Off",
    summary: "Send completed application package to the founder for human-in-the-loop review.",
    detailedInstructions:
      "Send: Proposal narrative, itemized budget, supporting documents, application portal answers, key research findings, and any outstanding considerations.",
    inputsRequired: ["Completed application package"],
    outputsGenerated: ["Review invitation dispatch"],
    platformActionLabel: "Request Approval",
    platformActionHref: "/workspace?tab=approvals",
  },
  {
    stepNumber: 18,
    title: "Founder Reviews",
    category: "Review & Sign-Off",
    summary: "Founder evaluates draft and provides feedback or additional information.",
    detailedInstructions:
      "Founder reviews: Approve, request changes, or provide additional information. If changes are requested, revise the application immediately.",
    inputsRequired: ["Founder comments"],
    outputsGenerated: ["Founder feedback log"],
    platformActionLabel: "Review Feedback",
    platformActionHref: "/workspace?tab=approvals",
  },
  {
    stepNumber: 19,
    title: "Changes / Approval",
    category: "Review & Sign-Off",
    summary: "Secure explicit final approval before proceeding with submission.",
    detailedInstructions:
      "Once the founder says 'Approved', you have authorized permission to proceed. A grant writer must never submit without authorized founder approval.",
    inputsRequired: ["Founder sign-off record"],
    outputsGenerated: ["Formal approval record"],
    platformActionLabel: "Check Approval",
    platformActionHref: "/workspace?tab=approvals",
  },
  {
    stepNumber: 20,
    title: "Submit",
    category: "Submission & Post-Award",
    summary: "Complete the actual application on the funder portal or submission channel.",
    detailedInstructions:
      "Enter information, upload documents, upload proposal, upload budget, answer portal questions, submit, and download confirmation receipt.",
    inputsRequired: ["Approved proposal", "Data Room documents", "Funder portal credentials"],
    outputsGenerated: ["Submission confirmation", "Timestamped receipt"],
    platformActionLabel: "Record Submission",
    platformActionHref: "/tracker",
  },
  {
    stepNumber: 21,
    title: "Track Application",
    category: "Submission & Post-Award",
    summary: "Log submission details in the tracker and monitor progress.",
    detailedInstructions:
      "Record grant name, funder, amount requested, deadline, submission date, confirmation number, portal URL, and expected response date. Track: Submitted → Under Review → Decision.",
    inputsRequired: ["Confirmation number", "Submission date"],
    outputsGenerated: ["Active tracker record"],
    platformActionLabel: "Open Tracker",
    platformActionHref: "/tracker",
  },
  {
    stepNumber: 22,
    title: "Award Management",
    category: "Submission & Post-Award",
    summary: "If awarded, manage the agreement, milestones, and disbursements.",
    detailedInstructions:
      "Once awarded: Record award amount, store award letter, store agreement, record funding period, track milestones, track spending, and track reporting deadlines.",
    inputsRequired: ["Signed award agreement", "Disbursement schedule"],
    outputsGenerated: ["Award tracking file", "Milestone schedule"],
    platformActionLabel: "Award Records",
    platformActionHref: "/tracker",
  },
  {
    stepNumber: 23,
    title: "Reporting",
    category: "Submission & Post-Award",
    summary: "Track and submit required narrative and financial progress reports.",
    detailedInstructions:
      "Maintain milestone logs, compile beneficiary metrics, prepare interim financial reports, and submit periodic progress updates to the funder.",
    inputsRequired: ["Milestone reports", "Expense records"],
    outputsGenerated: ["Funder progress reports"],
    platformActionLabel: "Reporting Schedule",
    platformActionHref: "/tracker",
  },
  {
    stepNumber: 24,
    title: "Repeat for Next Grant",
    category: "Submission & Post-Award",
    summary: "Run a continuous multi-grant pipeline rather than writing in isolation.",
    detailedInstructions:
      "Run your pipeline in parallel: While Grant 1 is under review, research Grant 2, write Grant 3, collect documents for Grant 4, and get Grant 5 approved.",
    inputsRequired: ["Pipeline schedule", "Next grant selection"],
    outputsGenerated: ["Active pipeline progression"],
    platformActionLabel: "Explore Next Grant",
    platformActionHref: "/database",
  },
];

export function GrantSopPipeline() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]);
  const [selectedStepNumber, setSelectedStepNumber] = useState<number>(3);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const selectedStep =
    EXACT_24_SOP_STEPS.find((s) => s.stepNumber === selectedStepNumber) || EXACT_24_SOP_STEPS[0]!;

  const progressPercent = Math.round((completedSteps.length / EXACT_24_SOP_STEPS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header with Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Standard Operating Procedure
            </span>
            <span className="text-xs text-ink-faint">&bull; 24 Operational Steps</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink mt-1">
            Grant Writing &amp; Operations Pipeline
          </h1>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl">
            The complete operational procedure: from organization understanding to post-award management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-ink">{completedSteps.length} of 24 Done</span>
            <div className="w-36 h-2 rounded-full bg-paper border border-paper-line overflow-hidden mt-1">
              <div
                className="h-full bg-stamp-dark transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Steps List vs Detailed Operational Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: 24 Steps Sequential Checklist */}
        <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-2">
          {EXACT_24_SOP_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.stepNumber);
            const isSelected = selectedStepNumber === step.stepNumber;
            return (
              <div
                key={step.stepNumber}
                onClick={() => setSelectedStepNumber(step.stepNumber)}
                className={`rounded-lg p-3 text-xs border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-stamp-dark bg-stamp/5 shadow-sm"
                    : "border-paper-line bg-paper-raised hover:border-ink/20"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(step.stepNumber);
                    }}
                    className={`h-4 w-4 rounded shrink-0 border flex items-center justify-center font-bold text-[10px] transition-all ${
                      isCompleted
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : "border-paper-line bg-paper text-transparent"
                    }`}
                  >
                    ✓
                  </button>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${isCompleted ? "line-through text-ink-faint" : "text-ink"}`}>
                      Step {step.stepNumber} — {step.title}
                    </p>
                    <p className="text-[11px] text-ink-faint truncate">{step.summary}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-ink-faint shrink-0">
                  #{step.stepNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Step Detailed Inspector */}
        <div className="lg:col-span-7 space-y-5 rounded-xl border border-paper-line bg-paper-raised p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-paper-line">
            <div>
              <span className="text-[11px] font-semibold text-stamp-dark uppercase tracking-wider">
                {selectedStep.category} &bull; Step {selectedStep.stepNumber}
              </span>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5">{selectedStep.title}</h2>
              <p className="text-xs text-ink-soft mt-1">{selectedStep.summary}</p>
            </div>

            <button
              type="button"
              onClick={() => toggleStep(selectedStep.stepNumber)}
              className={`rounded px-3 py-1.5 text-xs font-semibold border transition-all shrink-0 ${
                completedSteps.includes(selectedStep.stepNumber)
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-paper border-paper-line text-ink-soft hover:text-ink"
              }`}
            >
              {completedSteps.includes(selectedStep.stepNumber) ? "✓ Completed" : "Mark Done"}
            </button>
          </div>

          {/* Operational Instructions */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-ink">Operational Instructions</h4>
            <p className="text-ink-soft leading-relaxed bg-paper p-3.5 rounded-lg border border-paper-line">
              {selectedStep.detailedInstructions}
            </p>
          </div>

          {/* Inputs & Outputs Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 rounded-lg bg-paper p-3 border border-paper-line">
              <h5 className="font-semibold text-ink">Inputs Required</h5>
              <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                {selectedStep.inputsRequired.map((inp, idx) => (
                  <li key={idx}>{inp}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 rounded-lg bg-paper p-3 border border-paper-line">
              <h5 className="font-semibold text-ink">Outputs Generated</h5>
              <ul className="list-disc pl-4 space-y-1 text-ink-soft">
                {selectedStep.outputsGenerated.map((out, idx) => (
                  <li key={idx}>{out}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Direct Platform Action */}
          {selectedStep.platformActionLabel && selectedStep.platformActionHref && (
            <div className="pt-2 border-t border-paper-line flex items-center justify-between">
              <span className="text-xs text-ink-faint">Ready to execute this step?</span>
              <Link
                href={selectedStep.platformActionHref}
                className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all"
              >
                {selectedStep.platformActionLabel} &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
