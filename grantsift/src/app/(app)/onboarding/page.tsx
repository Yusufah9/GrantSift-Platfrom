import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Onboarding — Africa Grant Operating System",
  description: "Set up your organization profile and build your automated AI funding profile.",
};

export default function OnboardingPage() {
  return (
    <div className="py-6 sm:py-10">
      <OnboardingWizard />
    </div>
  );
}
