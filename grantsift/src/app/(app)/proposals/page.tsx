import { createClient } from "@/lib/supabase/server";
import { ProposalStudio } from "@/components/proposals/proposal-studio";

export const metadata = {
  title: "Proposal Studio — Africa Grant Operating System",
  description: "End-to-end grant proposal generation, application form responses, budget builder, and readiness scoring.",
};

interface ProposalsPageProps {
  searchParams?: Promise<{
    type?: string;
    grantId?: string;
  }>;
}

export default async function ProposalsPage(props: ProposalsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orgName = "Rumour Shield";
  let country = "Nigeria";

  if (user) {
    const { data: org } = await (supabase as any)
      .from("organizations")
      .select("name, country")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (org) {
      orgName = org.name;
      country = org.country || "Nigeria";
    }
  }

  return (
    <div className="py-2 sm:py-4">
      <ProposalStudio
        orgName={orgName}
        country={country}
        initialType={searchParams.type || "concept_note"}
      />
    </div>
  );
}
