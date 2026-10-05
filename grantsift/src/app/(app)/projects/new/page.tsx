import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Set up Organization Profile — Grant OS",
  description: "Organization-first profile setup and AI funding profile synthesis.",
};

export default function NewProjectPage() {
  return (
    <div className="py-2 sm:py-6">
      <OnboardingWizard />
    </div>
  );
}
