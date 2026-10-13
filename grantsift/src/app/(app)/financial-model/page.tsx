import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FinancialModelBuilder } from "@/components/finance/financial-model-builder";

export const metadata: Metadata = {
  title: "Universal Financial Model Builder | GrantSift OS",
  description:
    "Institutional 5-year integrated 3-statement financial model engine with DCF valuation, indirect method cash flows, SaaS metrics, and Excel/Colab export.",
};

export default async function FinancialModelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialInputs: Record<string, any> = {
    companyName: "My Organization",
    industry: "Technology & Commercial Growth",
    currency: "$",
  };

  if (user) {
    const { data: org } = await (supabase as any)
      .from("organizations")
      .select("name, sector, industry, country, funding_currently_seeking")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (org) {
      initialInputs = {
        companyName: org.name || "My Organization",
        industry: org.sector || org.industry || "Technology & Innovation",
        currency: "$",
        targetAsk: Number(org.funding_currently_seeking) || 250_000,
      };
    }
  }

  return (
    <div className="space-y-6">
      <FinancialModelBuilder initialInputs={initialInputs} />
    </div>
  );
}
