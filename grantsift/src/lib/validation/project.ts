import { z } from "zod";

const currentYear = new Date().getFullYear();

/** Treats an empty string from an optional form field as "not provided" instead of failing validation or coercing to 0. */
function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess((v) => (v === "" || v === undefined || v === null ? undefined : v), schema.optional());
}

function optionalString(schema: z.ZodString) {
  return z.preprocess((v) => (v === "" || v === undefined || v === null ? undefined : v), schema.optional());
}

export const organizationProfileSchema = z.object({
  orgName: z.string().trim().min(2, "Organization name is required").max(200),
  orgIndustry: z.string().trim().min(2, "Industry is required").max(120),
  orgCountry: z.string().trim().min(2, "Country is required").max(120),
  orgWebsite: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  orgEmail: z.string().trim().email("Enter a valid email address"),
  orgTeamSize: optionalNumber(z.coerce.number().int("Team size must be a whole number").nonnegative("Team size cannot be negative")),
  orgYearFounded: optionalNumber(
    z.coerce.number().int().gte(1900, "Enter a realistic year").lte(currentYear, "Year founded cannot be in the future"),
  ),
  orgFundingToDate: optionalNumber(z.coerce.number().nonnegative("Funding amount cannot be negative")),

  // Comprehensive Organization Intake Fields (Specification §1)
  orgType: optionalString(z.string().trim()), // Startup, Business, SME, NGO, Nonprofit, University, Research institution, Social enterprise, Individual/project
  countriesServed: optionalString(z.string().trim()),
  sector: optionalString(z.string().trim()),
  problemStatement: optionalString(z.string().trim().max(10000)),
  solutionStatement: optionalString(z.string().trim().max(10000)),
  targetBeneficiaries: optionalString(z.string().trim().max(5000)),
  stage: optionalString(z.string().trim()), // Idea, Prototype, Pre-Seed, Seed, Early Stage, Growth, Scale-Up
  revenue: optionalNumber(z.coerce.number().nonnegative()),
  fundingReceived: optionalNumber(z.coerce.number().nonnegative()),
  fundingRequired: optionalNumber(z.coerce.number().nonnegative()),
  geographicFocus: optionalString(z.string().trim().max(200)),
  projectDescription: optionalString(z.string().trim().max(10000)),
  impactAreas: optionalString(z.string().trim()),
  sdgs: optionalString(z.string().trim()),
  teamInfo: optionalString(z.string().trim().max(5000)),
  previousGrants: optionalString(z.string().trim().max(5000)),
  registrationStatus: optionalString(z.string().trim().max(200)),
  otherEligibility: optionalString(z.string().trim().max(5000)),
  hasBusinessPlan: z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean().optional()),
  hasPitchDeck: z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean().optional()),
  hasFinancialModel: z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean().optional()),
});

export const grantTargetSchema = z.object({
  grantFunderUrl: z
    .string()
    .trim()
    .url("Enter the funder's official URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    }, "Only http(s) URLs are supported"),
  grantAmountSought: optionalNumber(z.coerce.number().nonnegative()),
  grantDeadline: optionalString(z.string().date("Enter a valid date")),
  pastedRequirements: z.string().trim().max(20000).optional(),
});

export const optionalGrantTargetSchema = z.object({
  grantFunderUrl: z
    .string()
    .trim()
    .url("Enter the funder's official URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    }, "Only http(s) URLs are supported")
    .optional()
    .or(z.literal("")),
  grantAmountSought: optionalNumber(z.coerce.number().nonnegative()),
  grantDeadline: optionalString(z.string().date("Enter a valid date")),
  pastedRequirements: z.string().trim().max(20000).optional(),
});

export const youtubeUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return ["youtube.com", "m.youtube.com", "youtu.be"].includes(host);
    } catch {
      return false;
    }
  }, "Only youtube.com or youtu.be URLs are supported");

export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
export type GrantTargetInput = z.infer<typeof grantTargetSchema>;
export type OptionalGrantTargetInput = z.infer<typeof optionalGrantTargetSchema>;

