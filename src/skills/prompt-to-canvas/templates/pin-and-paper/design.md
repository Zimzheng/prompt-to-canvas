---
version: 1.0
name: Pin & Paper
renderer: svg-to-excalidraw
description: >
  A clean, graphic three-color palette: a white page with a royal cobalt blue and a canary yellow as
  the two accents. Blue leads as both the ink and the bold surface (text, borders, header bands, key
  fills); yellow is the punch, used for big numerals, a highlight swipe, thin rules, and small accent
  marks. Fresh and confident, like a modern brand one-pager. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white: "#FFFFFF" # universal canvas: clean white page
  blue: "#2A3C99" # royal cobalt: PRIMARY accent and the ink. Text, borders, dividers, header bands, key surface fills (stage header bands, outcome bar); white cards are delineated on the white page by a 2px blue border
  yellow: "#F1E84E" # canary yellow: SECONDARY accent (the punch). Big stage numerals, highlight swipe under the title, thin row rules, small accent marks, large headings on a blue fill
  # White page + two accents. Blue leads (and carries text); yellow supports as the punch. Two
  # accents per scene; let the white breathe. Yellow is too light for text on white, never use it there.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the white page and on white cards, text is blue. On a blue fill, text is white (body) or yellow (a heading or numeral). Never use yellow for text on white."
  note: "Large bold white/yellow text on the cobalt fill reads well on the live board. Inspect text colour and contrast in the local editor and final export."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid blue for cards and panel outlines, so a white card reads on the white page; the blue header band is a borderless flat fill"
  rule: "thin blue or yellow rules for row dividers"
  radius: "low (rx 0 to 10); crisp and graphic"
---

# Pin & Paper — Editable Canvas Design System

A clean white page with a royal cobalt that is both the ink and a bold surface, and a canary yellow for
the punch. Lead with blue (title, body, header bands, card borders), let yellow snap in on the big
numerals, a highlight swipe under the title, and the thin row rules, and keep the white open so the two
accents pop.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
