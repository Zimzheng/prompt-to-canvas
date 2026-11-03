---
version: 1.0
name: Violet Marker
renderer: svg-to-excalidraw
description: >
  A friendly highlighter palette on a white page: a bright lavender-violet and an acid lime-green as
  the two accents, with black type. Violet does the colour-blocks (header bands, chips); lime is the
  single highlighter punch (a marker block behind a keyword, accent ticks, an underline). Black carries
  the type; a warm grey softens body copy. Clean, modern, and airy: colour-blocks and whitespace do the
  structure, not heavy frames. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white: "#FFFFFF" # universal canvas: clean white page
  violet: "#C5A1FF" # bright lavender-violet: the main accent — header bands, chips, colour blocks (light enough for black text)
  lime: "#CFEE30" # acid lime-green: the single highlighter PUNCH — a marker block behind a keyword, accent ticks, an underline
  ink: "#000000" # black: all headlines, labels, and structural rules
  slate: "#666463" # warm grey: body / paragraph text on white, where pure black would be too heavy
  # White page + two accents. Violet carries the colour-blocks; lime is the one highlighter punch.
  # Black is the type. Keep it airy; one lime highlight per scene, not many.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text is black (or slate for body) on white and on violet. Lime is only a highlighter fill behind black text or a small mark, never text itself."
  note: "Black text on violet reads fine on the live board. Inspect text colour and contrast in the local editor and final export."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "minimal. Prefer violet colour-blocks and thin rules over heavy frames; no big outer frame"
  rule: "thin violet or lime rules for row dividers"
  radius: "low (rx 0 to 10); clean and modern"
---

# Violet Marker — Editable Canvas Design System

A clean white page with bright violet colour-blocks and one acid-lime highlighter. Lead with black
type, let the violet header bands and chips carry the structure, and spend the lime on a single
highlighter move (a marker block behind a keyword, an underline, a few ticks). Keep the white open and
airy, not boxed-in.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
