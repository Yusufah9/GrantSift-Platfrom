import { Metadata } from "next";
import { BusinessPlanBuilder } from "@/components/business-plan/business-plan-builder";

export const metadata: Metadata = {
  title: "Data-Driven Business Plan Builder | GrantSift OS",
  description:
    "Institutional 33-section investor-grade business plan builder with TAM/SAM/SOM financial model alignment, URIO framework, SWOT, PESTEL, and risk analysis.",
};

export default function BusinessPlanPage() {
  return (
    <div className="space-y-6">
      <BusinessPlanBuilder />
    </div>
  );
}
