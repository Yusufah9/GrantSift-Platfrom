import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = { title: "Contact · GrantSift" };

export default function ContactPage() {
  return (
    <main id="main-content">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl text-ink">Contact</h1>
        <div className="article-content mt-8">
          <p>
            Questions, feedback, or a funder you&apos;d like GrantSift to support better? Reach us at{" "}
            <a href="mailto:hello@grantsift.app">hello@grantsift.app</a>.
          </p>
          <p className="text-sm text-ink-faint">
            Replace this address with your own support inbox before launch. See{" "}
            <code>EMAIL_FROM</code> in <code>.env.example</code>.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
