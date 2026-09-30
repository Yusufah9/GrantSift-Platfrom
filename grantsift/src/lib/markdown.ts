import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/** Renders admin-authored Markdown to safe HTML. Content authors are always role='admin' (RLS-enforced), but we sanitize anyway rather than trust that alone. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em",
      "blockquote", "code", "pre", "img", "br", "hr", "table", "thead",
      "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
