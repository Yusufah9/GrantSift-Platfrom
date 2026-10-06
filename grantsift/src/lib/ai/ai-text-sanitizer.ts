/**
 * GrantSift AI Text Sanitizer & Formatting Layer
 *
 * Implements Specification Sections 13, 14, 15, and 34 plus the Human Voice rules:
 * 1. Prohibits visible raw Markdown syntax: asterisks (**), hashes (###), artificial separators (---).
 * 2. Replaces every en dash and em dash (—, –, " -- ") with a semicolon, as the user requires.
 *    Number ranges like 2024-2026 are left alone.
 * 3. Detects and neutralizes AI giveaway words, marketing hype and cliché sentence openers
 *    ("dive into", "game-changing", "seamless", "robust", "leverage", "in today's fast-paced world" ...).
 * 4. Produces clean, plain, human-readable text that sounds like a colleague wrote it.
 */

// Whole cliché sentences or openers. These are removed outright (the rest of the sentence stays).
const CLICHE_OPENERS: RegExp[] = [
  /\bin today'?’?s (?:ever[- ]evolving |fast[- ]paced )?(?:digital )?(?:world|landscape|era)[,;]?\s*/gi,
  /\bin the ever[- ]evolving (?:digital )?(?:world|landscape)[,;]?\s*/gi,
  /\bthis comprehensive guide will walk you through\s*/gi,
  /\bby the end of this (?:article|proposal|document),? you'?’?ll discover how to\s*/gi,
  /\blet'?’?s dive into(?: the world of)?\s*/gi,
  /\bwithout further ado[,;]?\s*/gi,
  /\bit goes without saying(?: that)?[,;]?\s*/gi,
  /\ball things considered[,;]?\s*/gi,
  /\bthat being said[,;]?\s*/gi,
  /\bin a nutshell[,;]?\s*/gi,
  /\bat the end of the day[,;]?\s*/gi,
  /\byou don'?’?t want to miss this[.!]?\s*/gi,
  /\bwhether you'?’?re a seasoned pro or just starting out[,;]?\s*/gi,
];

// Banned words and their plain human replacements.
// Replacements must never be words that are themselves on the banned list.
const BANNED_PHRASE_REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
  // Words from earlier user feedback
  { regex: /\bfrontline communities\b/gi, replacement: "local communities" },
  { regex: /\bfrontlines\b/gi, replacement: "communities" },
  { regex: /\bfrontline\b/gi, replacement: "direct" },
  { regex: /\bsevere fragmentation\b/gi, replacement: "big coordination gaps" },
  { regex: /\bfragmented\b/gi, replacement: "informal and uncoordinated" },

  // Multi word phrases first so single words don't break them up
  { regex: /\bunleash(?:ing)? your potential\b/gi, replacement: "do more" },
  { regex: /\bignite your passion\b/gi, replacement: "get started" },
  { regex: /\bempower your journey\b/gi, replacement: "help you" },
  { regex: /\btake it to the next level\b/gi, replacement: "improve it" },
  { regex: /\bsecret sauces?\b/gi, replacement: "method" },
  { regex: /\buncover hidden secrets\b/gi, replacement: "find out" },
  { regex: /\bjourney to success\b/gi, replacement: "path to results" },
  { regex: /\bunlock exclusive insights\b/gi, replacement: "see the details" },
  { regex: /\bunlock the secrets to\b/gi, replacement: "learn" },
  { regex: /\byour one[- ]stop solution\b/gi, replacement: "one place for this" },
  { regex: /\bsupercharge your results\b/gi, replacement: "get better results" },
  { regex: /\bboost your productivity\b/gi, replacement: "save time" },
  { regex: /\binsider tips\b/gi, replacement: "tips" },
  { regex: /\bultimate guide\b/gi, replacement: "guide" },
  { regex: /\blife hacks?\b/gi, replacement: "tip" },
  { regex: /\bmust[- ]have\b/gi, replacement: "useful" },
  { regex: /\bmodern landscape\b/gi, replacement: "market today" },
  { regex: /\brevolutioni[sz]e the way you\b/gi, replacement: "change how you" },
  { regex: /\btransform your life\b/gi, replacement: "help you" },
  { regex: /\bcutting[- ]edge technology\b/gi, replacement: "current technology" },
  { regex: /\bcutting[- ]edge\b/gi, replacement: "current" },
  { regex: /\binnovative solutions\b/gi, replacement: "practical approaches" },
  { regex: /\binnovative solution\b/gi, replacement: "practical approach" },
  { regex: /\brobust platform\b/gi, replacement: "reliable platform" },
  { regex: /\bseamless experience\b/gi, replacement: "simple experience" },
  { regex: /\bfuture[- ]proof\b/gi, replacement: "long lasting" },
  { regex: /\bnext[- ]generation\b/gi, replacement: "newer" },
  { regex: /\bthought[- ]provoking\b/gi, replacement: "useful" },
  { regex: /\bcurated experience\b/gi, replacement: "selected set" },
  { regex: /\btailored to your needs\b/gi, replacement: "built for you" },
  { regex: /\bvalue[- ]packed\b/gi, replacement: "useful" },
  { regex: /\benriching journey\b/gi, replacement: "good experience" },
  { regex: /\bholistic approach\b/gi, replacement: "full approach" },
  { regex: /\bsynergistic effect\b/gi, replacement: "combined effect" },
  { regex: /\bparadigm shift\b/gi, replacement: "big change" },
  { regex: /\bempirical evidence\b/gi, replacement: "evidence" },
  { regex: /\bactionable insights\b/gi, replacement: "clear next steps" },
  { regex: /\bdisruptive innovation\b/gi, replacement: "new approach" },
  { regex: /\bintuitive design\b/gi, replacement: "simple design" },
  { regex: /\bfeature[- ]packed\b/gi, replacement: "full featured" },
  { regex: /\bend[- ]to[- ]end\b/gi, replacement: "full" },
  { regex: /\bgame[- ]changers?\b/gi, replacement: "big step" },
  { regex: /\bgame[- ]changing\b/gi, replacement: "practical" },
  { regex: /\bempower communities\b/gi, replacement: "support local people" },
  { regex: /\bdrive impact\b/gi, replacement: "deliver results" },
  { regex: /\bdriving impact\b/gi, replacement: "delivering results" },
  { regex: /\bscalable solution\b/gi, replacement: "approach that can grow" },
  { regex: /\buniquely positioned to\b/gi, replacement: "ready to" },
  { regex: /\buniquely positioned\b/gi, replacement: "well placed" },
  { regex: /\bAI[- ]powered\b/gi, replacement: "software supported" },
  { regex: /\bworld[- ]class\b/gi, replacement: "high standard" },
  { regex: /\bdelve into\b/gi, replacement: "look at" },
  { regex: /\bdive into\b/gi, replacement: "look at" },
  { regex: /\bdiving into\b/gi, replacement: "looking at" },
  { regex: /\bnot only that,? but also\b/gi, replacement: "also" },
  { regex: /\binto the world of\b/gi, replacement: "into" },

  // Single words
  { regex: /\btransformative\b/gi, replacement: "useful" },
  { regex: /\btransformational\b/gi, replacement: "major" },
  { regex: /\btransformation\b/gi, replacement: "change" },
  { regex: /\btransforming\b/gi, replacement: "changing" },
  { regex: /\btransformed\b/gi, replacement: "changed" },
  { regex: /\btransforms\b/gi, replacement: "changes" },
  { regex: /\btransform\b/gi, replacement: "change" },
  { regex: /\brevolutionary\b/gi, replacement: "new" },
  { regex: /\bgroundbreaking\b/gi, replacement: "new" },
  { regex: /\bseamlessly\b/gi, replacement: "smoothly" },
  { regex: /\bseamless\b/gi, replacement: "smooth" },
  { regex: /\brobust\b/gi, replacement: "strong" },
  { regex: /\bholistic\b/gi, replacement: "full" },
  { regex: /\bsynergistic\b/gi, replacement: "combined" },
  { regex: /\bsynergy\b/gi, replacement: "teamwork" },
  { regex: /\bempowering\b/gi, replacement: "helping" },
  { regex: /\bempowers\b/gi, replacement: "helps" },
  { regex: /\bempower\b/gi, replacement: "help" },
  { regex: /\bcatalyze\b/gi, replacement: "speed up" },
  { regex: /\bcatalytic\b/gi, replacement: "early" },
  { regex: /\butilization\b/gi, replacement: "use" },
  { regex: /\butilizing\b/gi, replacement: "using" },
  { regex: /\butilized\b/gi, replacement: "used" },
  { regex: /\butilizes\b/gi, replacement: "uses" },
  { regex: /\butilize\b/gi, replacement: "use" },
  { regex: /\bleveraging\b/gi, replacement: "using" },
  { regex: /\bleveraged\b/gi, replacement: "used" },
  { regex: /\bleverages\b/gi, replacement: "uses" },
  { regex: /\bleverage\b/gi, replacement: "use" },
  { regex: /\bdelving\b/gi, replacement: "looking" },
  { regex: /\bdelve\b/gi, replacement: "look" },
  { regex: /\bparadigm\b/gi, replacement: "model" },
  { regex: /\bunlocking\b/gi, replacement: "opening" },
  { regex: /\bunlocks\b/gi, replacement: "opens" },
  { regex: /\bunlock\b/gi, replacement: "open" },
  { regex: /\bunleash\b/gi, replacement: "release" },
  { regex: /\bfostering\b/gi, replacement: "building" },
  { regex: /\bfoster\b/gi, replacement: "build" },
  { regex: /\bcomprehensively\b/gi, replacement: "fully" },
  { regex: /\bcomprehensive\b/gi, replacement: "full" },
  { regex: /\boptimization\b/gi, replacement: "improvement" },
  { regex: /\boptimizing\b/gi, replacement: "improving" },
  { regex: /\boptimized\b/gi, replacement: "improved" },
  { regex: /\boptimize\b/gi, replacement: "improve" },
  { regex: /\bjourneys\b/gi, replacement: "paths" },
  { regex: /\bjourney\b/gi, replacement: "path" },
  { regex: /\bcurated\b/gi, replacement: "selected" },
  { regex: /\bpitfalls\b/gi, replacement: "mistakes" },
  { regex: /\bunparalleled\b/gi, replacement: "strong" },
  { regex: /\bjaw[- ]dropping\b/gi, replacement: "striking" },
  { regex: /\bawe[- ]inspiring\b/gi, replacement: "impressive" },
  { regex: /\bbreathtaking\b/gi, replacement: "impressive" },
  { regex: /\bmind[- ](?:blowing|bending)\b/gi, replacement: "surprising" },
  { regex: /\blife[- ]changing\b/gi, replacement: "important" },
  { regex: /\bcaptivating\b/gi, replacement: "interesting" },
  { regex: /\bmesmeri[sz]ing\b/gi, replacement: "interesting" },
  { regex: /\bunforgettable\b/gi, replacement: "memorable" },
  { regex: /\bdynamic\b/gi, replacement: "active" },
  { regex: /\bscalable\b/gi, replacement: "able to grow" },
  { regex: /\bat scale\b/gi, replacement: "widely" },
  { regex: /\bto scale\b/gi, replacement: "to grow" },
  { regex: /\bscaling up\b/gi, replacement: "growing" },
  { regex: /\bscaling\b/gi, replacement: "growing" },
];

/**
 * Replaces en dashes and em dashes with semicolons.
 * "growing — but trust" -> "growing; but trust". Numeric ranges like "2024–2026" become "2024 to 2026".
 */
export function replaceDashes(raw: string): string {
  let text = raw;
  // Numeric ranges written with en/em dash: keep meaning without a dash
  text = text.replace(/(\d)\s*[—–]\s*(\d)/g, "$1 to $2");
  // Any other en/em dash, with or without spaces
  text = text.replace(/[ \t]*[—–][ \t]*/g, "; ");
  // Double hyphen used as a dash
  text = text.replace(/[ \t]+--[ \t]+/g, "; ");
  text = text.replace(/([A-Za-z])--([A-Za-z])/g, "$1; $2");
  // Spaced single hyphen between words used as a dash ("growth - but")
  text = text.replace(/([A-Za-z,.)])[ \t]+-[ \t]+([A-Za-z(])/g, "$1; $2");
  // Clean up "; ;" or ";;" and semicolons at line ends
  text = text.replace(/;\s*;/g, ";");
  text = text.replace(/;[ \t]*$/gm, ".");
  text = text.replace(/^[ \t]*;[ \t]*/gm, "");
  return text;
}

/**
 * Rewrites "It's not about X, it's about Y" and "not only X but also Y" into plain sentences.
 */
function rewriteClichePatterns(raw: string): string {
  let text = raw;
  text = text.replace(
    /\b(?:it|this)(?:'s| is|’s) not (?:just )?about ([^,;.]+)[,;]\s*(?:it|this)(?:'s| is|’s) about ([^.]+)\./gi,
    (_m, _a, b: string) => `This is about ${b.trim()}.`,
  );
  text = text.replace(/\bthis isn'?’?t just about ([^;.]+);\s*it'?’?s about ([^.]+)\./gi, (_m, _a, b: string) => `This is about ${b.trim()}.`);
  text = text.replace(/\bnot only ([^,;.]+?),? but also ([^,;.]+)/gi, (_m, a: string, b: string) => `${a.trim()} and ${b.trim()}`);
  return text;
}

/**
 * Returns the list of AI giveaway phrases still present in a text.
 * Used by tests and quality checks.
 */
export function findAiGiveaways(text: string): string[] {
  const found: string[] = [];
  for (const re of CLICHE_OPENERS) {
    const m = text.match(new RegExp(re.source, "i"));
    if (m) found.push(m[0].trim());
  }
  for (const { regex } of BANNED_PHRASE_REPLACEMENTS) {
    const m = text.match(new RegExp(regex.source, "i"));
    if (m) found.push(m[0]);
  }
  if (/[—–]/.test(text)) found.push("dash");
  return found;
}

function capitalizeSentenceStarts(text: string): string {
  return text
    .replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());
}

/**
 * Sanitizes plain text to remove raw Markdown artifacts, dashes, asterisks,
 * hashes, cliché openers and banned AI words.
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
  text = text.replace(/^[ \t]*#{1,6}[ \t]+([^\n]+)/gm, "$1");

  // 4. Remove bold / italic asterisks (**text**, *text*, ***text***)
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, "$1$2$3");

  // 5. Remove underscores used for emphasis (__text__, _text_)
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, "$1$2$3");

  // 6. Clean up bullet lists before dash handling: "- " or "* " at line start become "• "
  text = text.replace(/^[ \t]*[-*][ \t]+/gm, "• ");

  // 7. Dashes become semicolons (user rule: no en dashes in any content)
  text = replaceDashes(text);

  // 8. Convert markdown links [Label](URL) to "Label (URL)"
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // 9. Remove blockquote markers (> )
  text = text.replace(/^[ \t]*>[ \t]*/gm, "");

  // 10. Remove cliché openers and rewrite cliché sentence patterns
  for (const re of CLICHE_OPENERS) {
    text = text.replace(re, "");
  }
  text = rewriteClichePatterns(text);

  // 11. Replace banned AI words with plain human phrasing
  for (const { regex, replacement } of BANNED_PHRASE_REPLACEMENTS) {
    text = text.replace(regex, (match) => {
      // keep a leading capital letter if the original had one
      if (match[0] && match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  // 12. Normalize spaces, blank lines, and sentence starts after removals
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/ +([,.;:])/g, "$1");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = capitalizeSentenceStarts(text);

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

/**
 * Standard proposal and text content sanitizer enforcing natural corporate voice,
 * zero AI clichés, and conversion of dashes to semicolons or periods.
 */
export const sanitizeProposalContent = cleanPlainText;
