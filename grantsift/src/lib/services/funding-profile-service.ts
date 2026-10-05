import "server-only";
import { type SupabaseClient } from "@supabase/supabase-js";
import { GeminiService } from "@/lib/ai/gemini-service";

export interface FundingProfileData {
  id?: string;
  organizationId: string;
  primarySectors: string[];
  technologyKeywords: string[];
  fundingInterests: string[];
  targetAwardMin: number;
  targetAwardMax: number;
  currency: string;
  eligibleCountries: string[];
  eligibleRegions: string[];
  summaryNarrative: string;
  isVerified: boolean;
  lastSynthesizedAt?: string;
}

export interface SynthesizeProfileInput {
  orgName: string;
  orgType: string;
  country: string;
  geographicFocus?: string;
  sector?: string;
  industry?: string;
  stage?: string;
  mission?: string;
  problemStatement?: string;
  solutionStatement?: string;
  targetBeneficiaries?: string;
  detailedDescription?: string;
  fundingCurrentlySeeking?: number;
}

export class FundingProfileService {
  private readonly gemini = new GeminiService();

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Synthesize a structured Funding Profile from organization details and narrative
   * (Specification §7: AI Funding Profile).
   */
  async synthesizeProfile(input: SynthesizeProfileInput): Promise<Omit<FundingProfileData, "organizationId">> {
    const prompt = `You are the Grant Discovery Intelligence System for an African organization.
Analyze the following organization profile and build a structured funding profile:
- Organization Name: ${input.orgName}
- Type: ${input.orgType}
- Country: ${input.country}
- Geographic Focus: ${input.geographicFocus || input.country}
- Sector / Industry: ${input.sector || input.industry || "General"}
- Stage: ${input.stage || "Early Stage"}
- Mission: ${input.mission || "N/A"}
- Problem Statement: ${input.problemStatement || "N/A"}
- Solution Statement: ${input.solutionStatement || "N/A"}
- Target Beneficiaries: ${input.targetBeneficiaries || "Local communities and direct beneficiaries"}
- Detailed Description: ${input.detailedDescription || "N/A"}
- Target Funding Seeking: $${(input.fundingCurrentlySeeking || 100000).toLocaleString()} USD

Extract:
1. Primary sectors (3-6 key sector names like Artificial Intelligence, Information Integrity, Clean Energy, Agriculture, Healthcare, etc.)
2. Technology keywords (3-8 specific technical or operational capabilities like AI, Claim Verification, Python, Mobile Tech, IoT, Solar Mini-grids, etc.)
3. Funding interests (4-8 specific grant types like AI grants, Responsible AI, Non-dilutive seed funding, Climate innovation, Civic technology, etc.)
4. Recommended minimum and maximum grant target amounts in USD
5. Summary narrative (2-3 sentences explaining the organization's unique grant positioning in Africa)

Respond in JSON format with keys:
{
  "primarySectors": string[],
  "technologyKeywords": string[],
  "fundingInterests": string[],
  "targetAwardMin": number,
  "targetAwardMax": number,
  "summaryNarrative": string
}`;

    try {
      const result = await this.gemini.generateText(prompt, "fast");
      const cleaned = result.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        primarySectors: Array.isArray(parsed.primarySectors) && parsed.primarySectors.length > 0 ? parsed.primarySectors : [input.sector || "Technology", "Innovation"],
        technologyKeywords: Array.isArray(parsed.technologyKeywords) && parsed.technologyKeywords.length > 0 ? parsed.technologyKeywords : ["Digital Solutions", "Local Impact"],
        fundingInterests: Array.isArray(parsed.fundingInterests) && parsed.fundingInterests.length > 0 ? parsed.fundingInterests : ["Non-dilutive grant", "Innovation funding", "Technical assistance"],
        targetAwardMin: Number(parsed.targetAwardMin) || Math.max(10000, Math.floor((input.fundingCurrentlySeeking || 100000) * 0.3)),
        targetAwardMax: Number(parsed.targetAwardMax) || Math.max(50000, Math.ceil((input.fundingCurrentlySeeking || 100000) * 1.5)),
        currency: "USD",
        eligibleCountries: [input.country, "Nigeria", "Ghana", "Kenya", "South Africa", "Global"].filter((v, i, a) => a.indexOf(v) === i),
        eligibleRegions: ["West Africa", "Sub-Saharan Africa", "Pan-Africa", "Global"],
        summaryNarrative: parsed.summaryNarrative || `${input.orgName} is an African ${input.orgType} based in ${input.country} addressing critical challenges through scalable innovation and targeted community impact.`,
        isVerified: true,
        lastSynthesizedAt: new Date().toISOString(),
      };
    } catch {
      // Fallback deterministic synthesis if AI call fails or offline
      return this.heuristicSynthesis(input);
    }
  }

  /**
   * Deterministic rule-based synthesis fallback (ensures offline robustness)
   */
  private heuristicSynthesis(input: SynthesizeProfileInput): Omit<FundingProfileData, "organizationId"> {
    const text = `${input.orgName} ${input.sector} ${input.mission} ${input.detailedDescription} ${input.problemStatement}`.toLowerCase();
    const sectors: string[] = [];
    const tech: string[] = [];
    const interests: string[] = ["Non-dilutive grant", "Innovation seed funding"];

    if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("verif") || text.includes("rumour") || text.includes("media")) {
      sectors.push("Artificial Intelligence", "Information Integrity", "Civic Technology", "Digital Trust");
      tech.push("Multilingual AI", "Claim Verification", "Media Analysis", "NLP");
      interests.push("AI for Good", "Responsible AI", "Information integrity grants", "Media literacy grants");
    }
    if (text.includes("clean energy") || text.includes("solar") || text.includes("climate")) {
      sectors.push("Clean Energy", "Climate Action", "Sustainability");
      tech.push("Solar PV", "Mini-grids", "Energy Efficiency");
      interests.push("Climate resilience grants", "Clean energy seed funding");
    }
    if (text.includes("health") || text.includes("medical") || text.includes("clinic")) {
      sectors.push("Healthcare", "Digital Health", "Biotech");
      tech.push("Telemedicine", "Diagnostic Tech", "Health Informatics");
      interests.push("Global health grants", "Community health innovation");
    }
    if (text.includes("agri") || text.includes("farm") || text.includes("crop")) {
      sectors.push("Agriculture", "Food Security", "AgriTech");
      tech.push("Precision Agriculture", "Cold Storage", "Bio-inputs");
      interests.push("Food security grants", "Smallholder resilience");
    }

    if (sectors.length === 0) {
      sectors.push(input.sector || "Social Enterprise", "Innovation", "Economic Empowerment");
      tech.push("Cloud Software", "Community Workflows");
    }

    const seeking = input.fundingCurrentlySeeking || 100000;

    return {
      primarySectors: sectors,
      technologyKeywords: tech,
      fundingInterests: interests,
      targetAwardMin: Math.max(10000, Math.round(seeking * 0.25)),
      targetAwardMax: Math.max(50000, Math.round(seeking * 1.5)),
      currency: "USD",
      eligibleCountries: [input.country, "Nigeria", "Ghana", "Kenya", "Global"].filter((v, i, a) => a.indexOf(v) === i),
      eligibleRegions: ["West Africa", "Sub-Saharan Africa", "Africa", "Global"],
      summaryNarrative: `${input.orgName} is an emerging ${input.orgType} based in ${input.country}, actively positioned for competitive funding in ${sectors.slice(0, 3).join(", ")}.`,
      isVerified: true,
      lastSynthesizedAt: new Date().toISOString(),
    };
  }

  /**
   * Save or update funding profile for an organization
   */
  async saveFundingProfile(profile: FundingProfileData): Promise<FundingProfileData> {
    const { data, error } = await this.supabase
      .from("funding_profiles")
      .upsert(
        {
          organization_id: profile.organizationId,
          primary_sectors: profile.primarySectors,
          technology_keywords: profile.technologyKeywords,
          funding_interests: profile.fundingInterests,
          target_award_min: profile.targetAwardMin,
          target_award_max: profile.targetAwardMax,
          currency: profile.currency,
          eligible_countries: profile.eligibleCountries,
          eligible_regions: profile.eligibleRegions,
          summary_narrative: profile.summaryNarrative,
          is_verified: profile.isVerified,
          last_synthesized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" }
      )
      .select()
      .single();

    if (error) {
      // In case table isn't migrated in dev environment yet, return in-memory profile
      return profile;
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      primarySectors: data.primary_sectors,
      technologyKeywords: data.technology_keywords,
      fundingInterests: data.funding_interests,
      targetAwardMin: Number(data.target_award_min),
      targetAwardMax: Number(data.target_award_max),
      currency: data.currency,
      eligibleCountries: data.eligible_countries,
      eligibleRegions: data.eligible_regions,
      summaryNarrative: data.summary_narrative,
      isVerified: data.is_verified,
      lastSynthesizedAt: data.last_synthesized_at,
    };
  }

  /**
   * Get funding profile by organization ID
   */
  async getFundingProfile(organizationId: string): Promise<FundingProfileData | null> {
    const { data, error } = await this.supabase
      .from("funding_profiles")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      primarySectors: data.primary_sectors,
      technologyKeywords: data.technology_keywords,
      fundingInterests: data.funding_interests,
      targetAwardMin: Number(data.target_award_min),
      targetAwardMax: Number(data.target_award_max),
      currency: data.currency,
      eligibleCountries: data.eligible_countries,
      eligibleRegions: data.eligible_regions,
      summaryNarrative: data.summary_narrative,
      isVerified: data.is_verified,
      lastSynthesizedAt: data.last_synthesized_at,
    };
  }
}
