---
version: 1.0
name: Riso Brut
renderer: svg-to-excalidraw
description: >
  A neo-brutalist editorial design system for editable canvases. Warm cream canvas, heavy 4px ink borders, hard solid-offset shadows (no blur), and flat saturated color-blocking in four accents. Bold uppercase Latin labels in a technical-spec register. No gradients, no rounded cards, no subtlety — the collision of flat colors is the design. Built for explanatory diagrams: pipelines, stages, comparisons, system maps, timelines.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#EFE9D9" # universal canvas background — warm, never white
  cream-2: "#E4DCC4" # recessed fill (e.g. table bodies)
  ink: "#0F0F0F" # all borders, body text, rules, default shadow — near-black, slightly softened
  ink-2: "#2A2A2A" # secondary text / footnotes
  green: "#1F8A4C" # dominant accent      (depth: green-dark #136636)
  pink: "#F06CA8" # high-energy accent   (depth: pink-dark  #D14E8B)
  orange: "#E85A1F" # the featured-shadow color / accent fill
  yellow: "#F5C518" # punctuation accent: badges, circles, highlights
  # Use 2–3 accents per scene, NEVER all four at once. Colors fire at full saturation and collide on the canvas (the collision is the point) — never blend or gradient them.

# ── SHADOW ───────────────────────────────────────────────────
shadow:
  # There is no box-shadow and no blur. A hard shadow IS a duplicate shape.
  recipe: "redraw the shape at +10–12px x/y in the shadow color, placed BEHIND the real shape"
  color: "ink (default) | orange (featured blocks)"

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid ink" # cards, panels, boxes, badges, banners
  rule: "3px solid ink" # dividers, axes, connectors
  radius: 0 # squared corners always (rx allowed only on an optional pill)
---

# Riso Brut — Editable Canvas Design System

A design system for building **explanatory diagrams** as editable Feishu whiteboards
written in SVG. The aesthetic is neo-brutalist editorial: flat saturated color on warm
cream, heavy ink borders, hard offset shadows, bold uppercase type. Built to make a
single dense frame that explains something — and looks designed, not templated.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
