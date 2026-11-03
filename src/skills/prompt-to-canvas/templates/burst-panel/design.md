---
version: 1.0
name: Burst Panel
renderer: svg-to-excalidraw
description: >
  A loud neobrutalist dashboard system — a saturated marigold-yellow canvas carved into big lavender panels and near-black ink cards, all bound by chunky black borders with squared-to-soft corners. Type is heavy and plain (no caps gimmickry), the structural signature is flat color-blocking plus role-swapped nested panels and oversized numeral cells, and color does the shouting while ink does the holding. Great for product/system maps, dashboards-as-diagrams, feature comparisons, and pricing/plan explainers that want energy without clutter.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas: "#FBD65A" # marigold-yellow canvas / background — reserve for large fields and graphic shapes, never small labels
  ink: "#1E1E1E" # near-black ink: every border, every divider, dark "feature" sub-cards, structure, big numerals
  panel: "#CFACE8" # lavender — major content panels/zones sit on the yellow
  violet: "#BD89E4" # deep violet — deeper sibling of lavender for a secondary band / role-swap fill; never put small dark text on it (too low-contrast — promote to a cream inner card)
  mint: "#AAE4BA" # mint-green "live" accent — active/selected/go pills & states
  orange: "#FFA76D" # orange "live" accent — action buttons, stamps, call-to-action dots
  cream: "#FFFAF0" # cream — safe high-contrast surface for any body text & small labels / light cards
  # Rule: 2–3 accents per scene (mint OR orange as the one dominant "live" accent; lavender+violet as the
  # structural pair). Dark ink text on cream/lavender/mint/yellow; cream/yellow text only on ink/violet.
  # Temperature is warm-loud (marigold + orange) cooled by the lavender/mint pair — it clashes on purpose.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, chunky borders, panel
# role-swaps (lavender panel → ink sub-card → cream inner card), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #1E1E1E" # panels, cards, the board frame
  rule: "2px solid #1E1E1E" # dividers, pill outlines, connector lines
  radius: 18 # generously rounded rects/pills
---

# Burst Panel — Editable Canvas Design System

A high-energy neobrutalist dashboard look: marigold canvas, fat black borders, lavender and ink panels nested by role-swap, mint/orange accents for "live" states, and oversized numeral cells as the graphic punctuation. Everything is flat and editable.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
