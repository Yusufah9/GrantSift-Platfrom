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
