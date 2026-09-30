import { SourceBadge } from "@/components/ui/source-badge";

export function TrustSection() {
  return (
    <section className="border-b border-paper-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="font-serif text-2xl text-ink md:text-3xl">Every recommendation shows where it came from</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          GrantSift labels each piece of information by its source. AI synthesis is never presented
          as an official requirement, and you can trace any recommendation back to the funder,
          a video, or something you entered yourself.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <SourceBadge kind="official_funder" />
          <SourceBadge kind="government" />
          <SourceBadge kind="institution" />
          <SourceBadge kind="expert_source" />
          <SourceBadge kind="ai_synthesis" />
          <SourceBadge kind="user_provided" />
        </div>
        <p className="mt-8 max-w-2xl text-sm text-ink-faint">
          AI generated content is a synthesis aid, not an official requirement. Always confirm
          requirements against the funder&apos;s own documentation before you submit.
        </p>
      </div>
    </section>
  );
}
