import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustSection } from "@/components/landing/trust-section";
import { SolutionsGrid } from "@/components/landing/solutions-grid";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main id="main-content">
      <SiteNav />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <TrustSection />
      <SolutionsGrid />
      <SiteFooter />
    </main>
  );
}
