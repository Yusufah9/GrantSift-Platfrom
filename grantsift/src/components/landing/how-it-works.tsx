const STEPS = [
  {
    title: "Add a funder",
    body: "Paste the grant funder's official URL, or paste the requirements yourself if you already have them.",
  },
  {
    title: "Find the evidence",
    body: "GrantSift searches YouTube for founders and organizations who have discussed winning this grant, and pulls out their concrete tips.",
  },
  {
    title: "Build your profile",
    body: "Tell GrantSift about your organization: what you do, your team, your traction so far.",
  },
  {
    title: "See the gaps",
    body: "Every requirement is checked against your profile. Nothing is marked ready unless it's backed by something you or a source actually said.",
  },
  {
    title: "Export your plan",
    body: "Get a task-by-task SOP and a downloadable workbook covering eligibility, documents, budget, and your application timeline.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-paper-line">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="font-serif text-2xl text-ink md:text-3xl">How it works</h2>
        <ol className="mt-12 divide-y divide-paper-line border-t border-paper-line">
          {STEPS.map((step, i) => (
            <li key={step.title} className="grid gap-2 py-6 md:grid-cols-[3rem_1fr_2fr] md:items-baseline md:gap-8">
              <span className="font-mono text-sm text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-serif text-lg text-ink">{step.title}</h3>
              <p className="text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
