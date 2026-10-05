/**
 * GrantSift AI Text Sanitizer & Formatting Layer
 *
 * Implements Specification Sections 13, 14, 15, and 34:
 * 1. Prohibits visible raw Markdown syntax: asterisks (**), hashes (###), artificial separators (---).
 * 2. Replaces decorative dashes (—, --, "problem — solution") with commas, colons, or natural sentence flow.
 * 3. Detects and neutralizes stereotypical AI buzzwords:
 *    "fragmented", "frontlines", "frontline", "unlock", "leverage", "game changer",
 *    "transformative", "revolutionary", "cutting edge", "seamless", "robust",
 *    "holistic", "innovative solution", "empower communities", "drive impact",
 *    "foster", "catalyze", "utilize", "delve", "paradigm", "next generation",
 *    "AI powered", "world class", "groundbreaking", "scalable solution", "uniquely positioned".
 * 4. Produces clean, professional, human-readable text suitable for grant reviewers.
 */

// Banned words and their natural human replacements
const BANNED_PHRASE_REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
  // Banned words specified by user
  { regex: /\bfrontline communities\b/gi, replacement: "local communities" },
  { regex: /\bfrontlines\b/gi, replacement: "communities" },
  { regex: /\bfrontline\b/gi, replacement: "direct" },
  { regex: /\bfragmented\b/gi, replacement: "informal and uncoordinated" },
  { regex: /\bsevere fragmentation\b/gi, replacement: "significant coordination gaps" },

  // Forbidden AI jargon from GrantSift Master Grant Writer Section 7
  { regex: /\bgame[- ]changer\b/gi, replacement: "significant development" },
  { regex: /\bgame[- ]changing\b/gi, replacement: "practical" },
  { regex: /\btransformative\b/gi, replacement: "effective" },
  { regex: /\brevolutionary\b/gi, replacement: "substantial" },
  { regex: /\bcutting[- ]edge\b/gi, replacement: "modern" },
  { regex: /\bseamlessly\b/gi, replacement: "directly" },
  { regex: /\bseamless\b/gi, replacement: "coordinated" },
  { regex: /\brobust\b/gi, replacement: "reliable" },
  { regex: /\bholistic\b/gi, replacement: "comprehensive" },
  { regex: /\binnovative solution\b/gi, replacement: "practical intervention" },
  { regex: /\binnovative solutions\b/gi, replacement: "practical interventions" },
  { regex: /\bempower communities\b/gi, replacement: "support local residents" },
  { regex: /\bempower\b/gi, replacement: "enable" },
  { regex: /\bdrive impact\b/gi, replacement: "deliver measurable results" },
  { regex: /\bdriving impact\b/gi, replacement: "delivering results" },
  { regex: /\bcatalyze\b/gi, replacement: "accelerate" },
  { regex: /\bcatalytic\b/gi, replacement: "strategic" },
  { regex: /\butilize\b/gi, replacement: "use" },
  { regex: /\butilizing\b/gi, replacement: "using" },
  { regex: /\butilization\b/gi, replacement: "use" },
  { regex: /\bdelve into\b/gi, replacement: "examine" },
  { regex: /\bdelve\b/gi, replacement: "explore" },
  { regex: /\bdelving\b/gi, replacement: "examining" },
  { regex: /\bparadigm shift\b/gi, replacement: "fundamental change" },
  { regex: /\bparadigm\b/gi, replacement: "model" },
  { regex: /\bnext[- ]generation\b/gi, replacement: "advanced" },
  { regex: /\bAI[- ]powered\b/gi, replacement: "software-supported" },
  { regex: /\bworld[- ]class\b/gi, replacement: "high-standard" },
  { regex: /\bgroundbreaking\b/gi, replacement: "notable" },
  { regex: /\bscalable solution\b/gi, replacement: "sustainable approach" },
  { regex: /\buniquely positioned to\b/gi, replacement: "equipped to" },
  { regex: /\buniquely positioned\b/gi, replacement: "well qualified" },
  { regex: /\bleverage\b/gi, replacement: "draw upon" },
  { regex: /\bleveraging\b/gi, replacement: "applying" },
  { regex: /\bunlock\b/gi, replacement: "enable" },
  { regex: /\bunlocking\b/gi, replacement: "enabling" },
  { regex: /\bunlocks\b/gi, replacement: "enables" },
  { regex: /\bfoster\b/gi, replacement: "encourage" },
  { regex: /\bfostering\b/gi, replacement: "supporting" },
];

/**
 * Sanitizes plain text to remove raw Markdown artifacts, em dashes, asterisks,
 * hashes, and forbidden AI buzzwords.
 */
export function cleanPlainText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let text = raw;

  // 1. Remove Markdown horizontal lines / artificial separators
  text = text.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, "");

  // 2. Remove Markdown code fences and inline backticks
  text = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 3. Remove raw Markdown headings (#, ##, ###, ####, #####)
  // Convert lines starting with # into clean section titles without hash symbols
  text = text.replace(/^[ \t]*#{1,6}[ \t]+([^\n]+)/gm, "$1");

  // 4. Remove bold / italic asterisks (**text**, *text*, ***text***)
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, "$1$2$3");

  // 5. Remove underscores used for emphasis (__text__, _text_)
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, "$1$2$3");

  // 6. Fix dashes (Section 15: No unnecessary dashes, no dash-separated fragments)
  // Replace em dash " — " or en dash " – " with comma, colon, or clean connector
  text = text.replace(/[ \t]*[—–][ \t]*/g, ", ");
  text = text.replace(/([a-zA-Z0-9]),[ \t]+([A-Z])/g, "$1. $2"); // If between clauses, natural period
  text = text.replace(/[ \t]+--[ \t]+/g, ", ");

  // 7. Clean up bullet lists: convert "- " or "* " to clean standard bullets "• "
  text = text.replace(/^[ \t]*[-*][ \t]+/gm, "• ");

  // 8. Convert markdown links [Label](URL) to "Label (URL)" or just "Label"
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // 9. Remove blockquote markers (> )
  text = text.replace(/^[ \t]*>[ \t]*/gm, "");

  // 10. Replace banned AI buzzwords with natural human grant phrasing
  for (const { regex, replacement } of BANNED_PHRASE_REPLACEMENTS) {
    text = text.replace(regex, replacement);
  }

  // 11. Normalize excess spaces and consecutive blank lines
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Parses cleaned text into structured blocks (Headings, Paragraphs, Lists)
 * so that React components can render them cleanly with zero exposed Markdown syntax.
 */
export interface CleanTextBlock {
  type: "heading" | "subheading" | "paragraph" | "bullet_list" | "numbered_list";
  content: string;
  items?: string[];
}

export function parseCleanTextBlocks(raw: string): CleanTextBlock[] {
  const sanitized = cleanPlainText(raw);
  const lines = sanitized.split("\n");
  const blocks: CleanTextBlock[] = [];

  let currentBullets: string[] = [];
  let currentNumbers: string[] = [];

  const flushLists = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: "bullet_list", content: "", items: [...currentBullets] });
      currentBullets = [];
    }
    if (currentNumbers.length > 0) {
      blocks.push({ type: "numbered_list", content: "", items: [...currentNumbers] });
      currentNumbers = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushLists();
      continue;
    }

    // Bullet point
    if (trimmed.startsWith("• ")) {
      if (currentNumbers.length > 0) flushLists();
      currentBullets.push(trimmed.slice(2).trim());
      continue;
    }

    // Numbered item: e.g. "1. " or "1) "
    const numMatch = trimmed.match(/^(\d+)[\.\)][ \t]+(.+)$/);
    if (numMatch && numMatch[2]) {
      if (currentBullets.length > 0) flushLists();
      currentNumbers.push(numMatch[2].trim());
      continue;
    }

    // Flush any pending list
    flushLists();

    // Check if line looks like a title or section heading:
    // Short line ending with colon, or capitalized title without ending punctuation
    const isHeading =
      (trimmed.length < 70 && trimmed.endsWith(":")) ||
      (trimmed.length < 55 && !/[.!?]$/.test(trimmed) && /^[A-Z0-9]/.test(trimmed));

    if (isHeading) {
      blocks.push({
        type: trimmed.endsWith(":") ? "subheading" : "heading",
        content: trimmed.replace(/:$/, ""),
      });
    } else {
      blocks.push({
        type: "paragraph",
        content: trimmed,
      });
    }
  }

  flushLists();
  return blocks;
}
