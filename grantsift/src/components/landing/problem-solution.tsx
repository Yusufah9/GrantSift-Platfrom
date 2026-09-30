const PROBLEMS = [
  "Grant knowledge is scattered across funder sites, YouTube interviews, and word of mouth.",
  "Requirements are easy to miss until an application is rejected for missing them.",
  "Supporting documents are often incomplete when the deadline arrives.",
  "Good advice is hard to turn into a checklist you can actually follow.",
];

const SOLUTION_STEPS = [
  { term: "Analyze", detail: "Read the funder's own eligibility and priorities." },
  { term: "Extract", detail: "Pull specific tips from founders who have won this grant before." },
  { term: "Organize", detail: "Turn scattered advice into a single, traceable knowledge base." },
  { term: "Assess", detail: "Compare your organization against the actual requirements." },
  { term: "Prepare", detail: "Generate a task-by-task plan with owners and deadlines." },
  { term: "Export", detail: "Download a workbook you can hand to your team today." },
];

export function ProblemSolution() {
  return (
    <section id="product" className="border-b border-paper-line">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h2 className="font-serif text-2xl text-ink md:text-3xl">
            Most grant preparation happens from memory and scattered notes.
          </h2>
          <ul className="mt-8 space-y-4">
            {PROBLEMS.map((problem) => (
              <li key={problem} className="border-l-2 border-signal-risk/40 pl-4 text-ink-soft">
                {problem}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink md:text-3xl">
            GrantSift keeps the process traceable, start to finish.
          </h2>
          <dl className="mt-8 space-y-6">
            {SOLUTION_STEPS.map((step) => (
              <div key={step.term} className="border-b border-paper-line pb-4">
                <dt className="font-mono text-sm text-stamp-dark">{step.term}</dt>
                <dd className="mt-1 text-ink-soft">{step.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
