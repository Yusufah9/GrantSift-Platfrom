# Design system: "Casefile"

## Why not the reference screenshots' look
The Shopify references are dark, glossy, purple/black commerce UI. The PRD
explicitly rules out that visual language for GrantSift (neon, gradients,
glassmorphism, "AI" chrome), and it's the wrong register for the audience:
funders, NGOs, and consultants evaluating whether a claim is credible. What's
worth keeping from the references is the layout discipline — confident type,
generous whitespace, one restrained motion moment — not the palette.

## The grounding idea
A grant application is a formal document with a paper trail: sources,
evidence, requirements, sign-off. The interface should look like a well-kept
case file, not a consumer AI product. That gives a genuine reason for the
source-badge / stamp motif the PRD already asks for in section 75 — it isn't
decoration, it's the actual information architecture (every claim needs a
trust label).

## Tokens
- **Paper** `#EFEEE7` (background), **Paper raised** `#F7F6F1` (cards),
  **Paper line** `#D9D6C9` (hairline rules)
- **Ink** `#191C19` (text), **Ink soft** `#4B5049`, **Ink faint** `#7A7F76`
- **Stamp (ochre)** `#B4661E` — the one accent color, used for primary CTAs
  and the "expert source" badge, evoking an official stamp/seal
- **Ledger (forest green)** `#2E5C4B` — status/readiness green, official and
  government source badges
- **Signal risk (rust red)** `#A23B2E` — gaps and errors only

This deliberately avoids both AI-cliché palettes named in the design brief:
the warm-cream-plus-terracotta look and the near-black-plus-neon look. Paper
tone here is cooler and greyer than the cliché cream, and the accent is a
muted ochre rather than a saturated terracotta or neon.

## Type
- **Source Serif 4** for headlines — an editorial, document-like serif
  without being a legal-document cliché (avoids Times/Georgia defaults)
- **IBM Plex Sans** for UI and body — a grotesk with real bureaucratic/
  technical lineage, fitting "operational" without reaching for Inter
- **IBM Plex Mono** for data, source badges, and figures — ties numeric and
  attribution content to the ledger/stamp motif

## Layout
Left-aligned, document-margin feel. Hairline rules instead of card shadows.
Numbered sequences only where the content is genuinely sequential (the five
step "How it works" list). No rounded-card-kit treatment; panels are
bordered rectangles, like sheets in a folder.

## Restraint
One accent color. No gradients. No per-card shadow. Motion limited to hover
states and simple color transitions — no scroll-triggered fade-and-slide.
`prefers-reduced-motion` is respected globally in `globals.css`.

