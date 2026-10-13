import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BusinessPlanBuilder } from "@/components/business-plan/business-plan-builder";

export const metadata: Metadata = {
  title: "Data-Driven Business Plan Builder | GrantSift OS",
  description:
    "Institutional 33-section investor-grade business plan builder with TAM/SAM/SOM financial model alignment, URIO framework, SWOT, PESTEL, and risk analysis.",
};

export default async function BusinessPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialCompany = {
    name: "Enterprise Innovations",
    sector: "Technology & Operational Services",
    geography: "Pan-African & Emerging Markets",
    currency: "$",
    targetAsk: 250_000,
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
      initialCompany = {
        name: org.name || "Enterprise Innovations",
        sector: org.sector || org.industry || "Technology & Commercial Growth",
        geography: org.country ? `${org.country} & Regional Markets` : "Pan-African & Emerging Markets",
        currency: "$",
        targetAsk: Number(org.funding_currently_seeking) || 250_000,
      };
    }
  }

  return (
    <div className="space-y-6">
      <BusinessPlanBuilder initialCompany={initialCompany} />
    </div>
  );
}
