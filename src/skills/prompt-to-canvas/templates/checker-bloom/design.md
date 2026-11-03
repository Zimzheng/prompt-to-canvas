---
version: 1.0
name: Checker Bloom
renderer: svg-to-excalidraw
description: >
  A playful, hand-painted folk palette taken from a gouache still life: a pale mint-green page with
  two confident accents, a cobalt blue and a grass green, plus warm-black ink. Cheerful and
  naive-art, like a painted poster of blue blooms. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  mint: "#E8F1DD" # universal canvas: pale yellow-green, soft and painterly, never white
  ink: "#151515" # all text, borders, and rules
  blue: "#2C6EE0" # primary accent: cobalt. Hero fills, key blocks, the loudest note
  green: "#5E9E4A" # secondary accent: grass green. Supporting fills, dividers, stems-equivalent
  white: "#FFFFFF" # card fills, and a large-bold text option on blue
  # Mint page + two accents (cobalt blue, grass green). Use blue as the lead and green as support,
  # two accents per scene. No red, no third accent.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text is ink on the mint page and on white cards. On a blue or green fill, use large bold white."
  note: "Large bold white text on the cobalt blue reads well on the live board. Inspect text colour and contrast in the local editor and final export."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid ink for cards and panels; many fills can be borderless flat color"
  rule: "2px solid ink for dividers"
  radius: "soft (rx 10 to 20) suits the hand-painted mood; sharp (rx 0) for a crisp block"
---

# Checker Bloom — Editable Canvas Design System

A pale mint page with cobalt-blue and grass-green accents and warm-black ink. The mood is a
hand-painted folk still life: cheerful, naive, and confident. Lead with the cobalt blue, support with
the green, and keep the page mint and airy.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
