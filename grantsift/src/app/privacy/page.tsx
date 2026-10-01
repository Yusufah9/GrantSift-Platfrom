import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = { title: "Privacy · GrantSift" };

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl text-ink">Privacy</h1>
        <div className="article-content mt-8">
          <p className="text-sm text-ink-faint">
            This is a starting template, not a reviewed legal document. Replace it with a policy
            drafted or reviewed by counsel before launch.
          </p>
          <h2>What GrantSift stores</h2>
          <p>
            Your account details, the organization profile and funder information you enter, and the
            sources and insights GrantSift generates for your projects. This data is stored in your
            Supabase project and protected by Row Level Security, so only your account can read it.
          </p>
          <h2>What GrantSift fetches on your behalf</h2>
          <p>
            When you add a funder, GrantSift fetches that funder&apos;s public page and searches
            YouTube for public videos. It does not access private accounts or private data on your
            behalf.
          </p>
          <h2>Third parties</h2>
          <p>
            GrantSift sends the text it extracts to Google&apos;s Gemini API to generate readiness
            and SOP suggestions, and to the YouTube Data API to search for public videos. Review
            those providers&apos; own terms before processing sensitive information.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

