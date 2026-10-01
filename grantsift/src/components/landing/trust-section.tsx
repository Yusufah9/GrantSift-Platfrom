import { SourceBadge } from "@/components/ui/source-badge";

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-12 rounded-[40px] bg-ink p-8 text-paper md:grid-cols-2 md:p-16">
        <div>
          <h2 className="display text-4xl !text-paper md:text-6xl">Every recommendation shows where it came from.</h2>
          <p className="mt-6 max-w-md text-lg text-paper/70">
            Donor language is easy to misread and AI is easy to over trust. GrantSift labels each piece of information by its source, so you always know what is official and what is a suggestion.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-8">
          <div className="flex flex-wrap gap-3 text-paper [&_.stamp-badge]:!border-paper/30 [&_.stamp-badge]:!bg-paper/10 [&_.stamp-badge]:!text-paper">
            <SourceBadge kind="official_funder" />
            <SourceBadge kind="government" />
            <SourceBadge kind="institution" />
            <SourceBadge kind="expert_source" />
            <SourceBadge kind="ai_synthesis" />
            <SourceBadge kind="user_provided" />
          </div>
          <p className="text-sm text-paper/60">
            AI generated content is a synthesis aid, not an official requirement. Always confirm requirements against the funder&apos;s own documentation before you submit.
          </p>
        </div>
      </div>
    </section>
  );
}

