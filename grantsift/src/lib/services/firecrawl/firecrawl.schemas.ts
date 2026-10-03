import { z } from "zod";

export const GrantExtractionSchema = z.object({
  grantName: z.string().describe("Title or name of the grant opportunity"),
  funder: z.string().describe("Foundation, corporate, government, or institutional funder name"),
  description: z.string().describe("Short 2-3 sentence overview of the grant focus"),
  amountMin: z.number().optional().describe("Minimum award amount in specified currency"),
  amountMax: z.number().optional().describe("Maximum award amount in specified currency"),
  currency: z.string().default("USD").describe("Currency denomination, e.g. USD, EUR, GBP"),
  deadline: z.string().optional().describe("Application deadline in YYYY-MM-DD or readable date format"),
  eligibility: z.array(z.string()).default([]).describe("Key eligibility rules or criteria"),
  eligibleCountries: z.array(z.string()).default([]).describe("List of eligible countries or regions"),
  sectors: z.array(z.string()).default([]).describe("Focal sectors (e.g. Clean Energy, Agriculture, Health)"),
  organizationTypes: z.array(z.string()).default([]).describe("Eligible applicant types (e.g. Startup, SME, NGO)"),
  requirements: z.array(z.string()).default([]).describe("List of required documents or application materials"),
  applicationUrl: z.string().optional().describe("Direct URL to apply or access application portal"),
});

export type GrantExtractionData = z.infer<typeof GrantExtractionSchema>;
