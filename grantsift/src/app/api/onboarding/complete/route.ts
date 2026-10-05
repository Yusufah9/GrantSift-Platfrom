import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FundingProfileService } from "@/lib/services/funding-profile-service";
import { EmailService } from "@/lib/email/email-service";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { organization, fundingProfile } = body;

    if (!organization || !organization.name) {
      return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
    }

    const orgName = organization.name.trim();
    const slug = slugify(orgName, { lower: true, strict: true }) + "-" + Math.random().toString(36).substring(2, 6);

    let userId = user?.id;

    // If no active user session, check if demo user or create a guest profile
    if (!userId) {
      const { data: users } = await admin.auth.admin.listUsers();
      const demo = users?.users?.find((u) => u.email === "demo@grantsift.org");
      if (demo) {
        userId = demo.id;
      } else {
        return NextResponse.json({ error: "Please log in to complete organization setup." }, { status: 401 });
      }
    }

    // 1. Create or update organization
    const { data: orgData, error: orgError } = await (admin as any)
      .from("organizations")
      .insert({
        name: orgName,
        slug,
        org_type: organization.orgType || "Startup",
        industry: organization.sector || "Technology",
        sector: organization.sector || "Technology",
        country: organization.country || "Nigeria",
        city: organization.location || "Lagos",
        website: organization.website || null,
        description: organization.detailedDescription || organization.mission,
        team_size: organization.teamSize || 1,
        problem_statement: organization.primaryProblemAddressed,
        solution_statement: organization.mission,
        target_beneficiaries: organization.targetBeneficiaries,
        stage: organization.stage || "Early Stage",
        revenue: organization.revenue || 0,
        funding_received: organization.fundingReceived || 0,
        registration_status: organization.registrationStatus,
        geographic_focus: organization.geographicFocus,
        primary_problem_addressed: organization.primaryProblemAddressed,
        typical_project_size: organization.typicalProjectSize,
        funding_currently_seeking: organization.fundingCurrentlySeeking,
        phone_number: organization.phoneNumber,
        current_grant_funding: organization.currentGrantFunding,
        grants_received_last_12m: organization.grantsReceivedLast12m,
        current_grant_programs: organization.currentGrantPrograms,
        owner_id: userId,
      })
      .select()
      .single();

    const createdOrgId = orgData?.id || slug;

    // 2. Save structured funding profile
    if (fundingProfile && createdOrgId) {
      const profileService = new FundingProfileService(admin);
      await profileService.saveFundingProfile({
        organizationId: createdOrgId,
        primarySectors: fundingProfile.primarySectors || [organization.sector],
        technologyKeywords: fundingProfile.technologyKeywords || ["Innovation"],
        fundingInterests: fundingProfile.fundingInterests || ["Non-dilutive grant"],
        targetAwardMin: fundingProfile.targetAwardMin || 10000,
        targetAwardMax: fundingProfile.targetAwardMax || 500000,
        currency: "USD",
        eligibleCountries: [organization.country || "Nigeria", "Global"],
        eligibleRegions: ["Sub-Saharan Africa", "Africa", "Global"],
        summaryNarrative: fundingProfile.summaryNarrative || organization.mission,
        isVerified: true,
      });
    }

    // 3. Ensure a primary Project exists under this Organization (backwards-compatibility & project workspace)
    await admin.from("projects").insert({
      user_id: userId,
      name: `${orgName} Core Initiative`,
      status: "active",
      org_name: orgName,
      org_industry: organization.sector,
      org_country: organization.country,
      org_website: organization.website,
      grant_amount_sought: organization.fundingCurrentlySeeking || 150000,
    });

    // 4. Update user metadata
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user?.user_metadata,
        organization_id: createdOrgId,
        organization_name: orgName,
        onboarded: true,
      },
    });

    // 5. Send Welcome Email via Brevo
    if (user?.email) {
      try {
        const emailService = new EmailService();
        await emailService.sendWelcomeEmail(
          user.email,
          user.user_metadata?.full_name || orgName
        );
      } catch (mailErr) {
        console.warn("Brevo welcome email non-fatal notice:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      organizationId: createdOrgId,
      message: "Organization onboarded successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to complete onboarding." },
      { status: 500 }
    );
  }
}
