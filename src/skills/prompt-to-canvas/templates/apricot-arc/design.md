---
version: 1.0
name: Apricot Arc
renderer: svg-to-excalidraw
description: >
  A warm mid-century geometric design system for editable canvases. Soft cream canvas, no borders and no shadows — depth comes purely from flat apricot-and-salmon color-blocking and a signature half-circle (arc) motif laid out on a tight checkerboard rhythm. Rounded, friendly, two-hue palette with a deep terracotta ink reserved for text inside light panels. Calm and retro rather than loud. Built for explanatory diagrams that benefit from a soft, rhythmic, optimistic register: stages, comparisons, system maps, timelines, and step pipelines.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#FFF8EE" # universal canvas background — warm soft ivory, never pure white
  paper: "#FFFFFF" # optional clean panel fill (highest-contrast card)
  orange: "#F69834" # primary accent — warm apricot orange; alternates with salmon to create rhythm, not collision
  salmon: "#F9C2BD" # secondary accent — soft salmon pink (pairs with orange); never put light text on salmon
  terracotta: "#C7561E" # ink only — text, big numerals, occasional 3px rule; a deep burnt tone from the orange family so the system never goes cold or black; not a fill block
  ink-2: "#7A4A33" # softer brown for secondary text on light panels
  # Use the 2-hue core (orange + salmon) per scene — that pairing IS the identity; terracotta is for ink only, not a fill block.
  # Dark (terracotta) text on light fills always. No black — the system stays warm.
  # Prefer solid lighter shades (cream over salmon over orange) for this palette.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind (no blur, no duplicate-offset trick).
# Depth and hierarchy come from flat color blocks, the arc motif, panel role-swaps, and scale.
# The reference is borderless: prefer abutting flat shapes over outlined cards.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "none (flat fills, no borders) — use a 3px terracotta stroke ONLY when a panel must read as a discrete card"
  rule: "3px solid terracotta" # dividers, axes, connectors
  radius: 24 # generously rounded corners (soft mid-century); 0 only for tight color-block tiling
---

# Apricot Arc — Editable Canvas Design System

A design system for building **explanatory diagrams** as editable Feishu whiteboards
written in SVG. The aesthetic is warm mid-century geometric: flat apricot-and-salmon
color on soft cream, rounded corners, **no borders and no shadows**, and a signature
**half-circle (arc) motif** tiled in a checkerboard rhythm. It feels retro, calm, and
optimistic — depth is carried entirely by flat color and scale, never by outlines or shading.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
