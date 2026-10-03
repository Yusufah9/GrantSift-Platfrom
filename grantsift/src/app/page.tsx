import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { InteractiveOSShowcase } from "@/components/landing/interactive-os-showcase";
import { TrustBento } from "@/components/landing/trust-bento";
import { ProductMock } from "@/components/landing/product-mock";
import { ReadinessScorecardTool } from "@/components/landing/readiness-scorecard-tool";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InfraPanel } from "@/components/landing/infra-panel";
import { WorkStack } from "@/components/landing/work-stack";
import { TrustSection } from "@/components/landing/trust-section";
import { SolutionsGrid } from "@/components/landing/solutions-grid";
import { LearnMore } from "@/components/landing/learn-more";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main id="main-content">
      <SiteNav />
      <Hero />
      <InteractiveOSShowcase />
      <ReadinessScorecardTool />
      <TrustBento />
      <ProductMock />
      <ProblemSolution />
      <HowItWorks />
      <InfraPanel />
      <WorkStack />
      <TrustSection />
      <SolutionsGrid />
      <LearnMore />
      <CtaBand />
      <SiteFooter />
    </main>
  );
}

