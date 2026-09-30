import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = { title: "About · GrantSift" };

export default function AboutPage() {
  return (
    <main id="main-content">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl text-ink">About GrantSift</h1>
        <div className="article-content mt-8">
          <p>
            GrantSift helps founders, grant writers, NGOs, and consultants turn a grant funder&apos;s
            public requirements, and what past recipients say about winning that grant, into a
            working application plan.
          </p>
          <p>
            Every recommendation GrantSift makes is labeled by where it came from: the funder&apos;s
            own page, a public video, or a synthesis GrantSift produced. GrantSift never presents a
            synthesized suggestion as an official requirement, and it never fabricates a statistic,
            a testimonial, or a partnership.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
