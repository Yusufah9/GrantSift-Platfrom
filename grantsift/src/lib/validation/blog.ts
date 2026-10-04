import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, "Use lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().trim().min(10, "Write some content first").max(50_000),
  featuredImage: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || val.startsWith("data:image/") || /^https?:\/\//.test(val),
      { message: "Must be a valid image URL or uploaded image data" }
    )
    .optional()
    .or(z.literal("")),
  categoryName: z.string().trim().max(80).optional(),
  tagsCsv: z.string().trim().max(300).optional(),
  metaDescription: z.string().trim().max(200).optional(),
  canonicalUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

export type PostInput = z.infer<typeof postSchema>;
