import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders headings, links, and lists", () => {
    const html = renderMarkdown("## Heading\n\nA [link](https://example.com).\n\n- one\n- two");
    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("<li>one</li>");
  });

  it("strips script tags even if authored directly", () => {
    const html = renderMarkdown('<script>alert("xss")</script>\n\nSafe paragraph.');
    expect(html).not.toContain("<script");
    expect(html).toContain("Safe paragraph.");
  });

  it("strips disallowed attributes like onerror", () => {
    const html = renderMarkdown('<img src="x.png" onerror="alert(1)" alt="x">');
    expect(html).not.toContain("onerror");
  });

  it("blocks javascript: URLs in links", () => {
    const html = renderMarkdown("[click me](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });
});

