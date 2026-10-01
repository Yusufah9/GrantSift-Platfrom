import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = { title: "Terms · GrantSift" };

export default function TermsPage() {
  return (
    <main id="main-content">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl text-ink">Terms</h1>
        <div className="article-content mt-8">
          <p className="text-sm text-ink-faint">
            This is a starting template, not a reviewed legal document. Replace it with terms
            drafted or reviewed by counsel before launch.
          </p>
          <h2>No guarantee of funding</h2>
          <p>
            GrantSift helps you prepare a stronger, better-organized application. It cannot and does
            not promise that any application will be funded.
          </p>
          <h2>Your responsibility</h2>
          <p>
            AI-generated content is a synthesis aid, not an official requirement. You&apos;re
            responsible for verifying every requirement against the funder&apos;s own documentation
            before you submit.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

