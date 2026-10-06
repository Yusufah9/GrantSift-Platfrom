import { Metadata } from "next";
import { FinancialModelBuilder } from "@/components/finance/financial-model-builder";

export const metadata: Metadata = {
  title: "Universal Financial Model Builder | GrantSift OS",
  description:
    "Institutional 5-year integrated 3-statement financial model engine with DCF valuation, indirect method cash flows, SaaS metrics, and Excel/Colab export.",
};

export default function FinancialModelPage() {
  return (
    <div className="space-y-6">
      <FinancialModelBuilder />
    </div>
  );
}
