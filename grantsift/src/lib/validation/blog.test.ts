import { describe, it, expect } from "vitest";
import { postSchema } from "@/lib/validation/blog";

const base = {
  title: "How to prepare for a site visit",
  slug: "how-to-prepare-for-a-site-visit",
  content: "This is a sufficiently long piece of body content for the post.",
  status: "draft" as const,
};

describe("postSchema", () => {
  it("accepts a well-formed post", () => {
    expect(postSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an uppercase slug", () => {
    expect(postSchema.safeParse({ ...base, slug: "Not-Valid" }).success).toBe(false);
  });

  it("rejects a slug with spaces", () => {
    expect(postSchema.safeParse({ ...base, slug: "not valid" }).success).toBe(false);
  });

  it("rejects content that is too short", () => {
    expect(postSchema.safeParse({ ...base, content: "short" }).success).toBe(false);
  });

  it("accepts a blank featured image and canonical URL", () => {
    const result = postSchema.safeParse({ ...base, featuredImage: "", canonicalUrl: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid featured image URL when one is given", () => {
    const result = postSchema.safeParse({ ...base, featuredImage: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

