const AUDIENCES = [
  { name: "Founders", body: "Understand what an early stage grant actually expects, beyond the pitch deck." },
  { name: "Grant writers", body: "Keep every client's requirements and sources in one traceable place." },
  { name: "NGOs", body: "Show funders your monitoring and governance capacity clearly, with evidence." },
  { name: "Consultants", body: "Run readiness checks for multiple clients without rebuilding the process each time." },
  { name: "Venture builders", body: "Assess grant fit for a portfolio of companies at once." },
  { name: "Accelerators", body: "Give cohort companies a shared, repeatable application workflow." },
];

export function SolutionsGrid() {
  return (
    <section id="solutions" className="border-b border-paper-line">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="font-serif text-2xl text-ink md:text-3xl">Built for the people preparing the application</h2>
        <div className="mt-12 grid gap-px bg-paper-line sm:grid-cols-2 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <div key={audience.name} className="bg-paper px-6 py-8 transition-colors duration-200 hover:bg-paper-raised">
              <h3 className="font-serif text-lg text-ink">{audience.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{audience.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
