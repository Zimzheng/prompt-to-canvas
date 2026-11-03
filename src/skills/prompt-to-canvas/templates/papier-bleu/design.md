---
version: 1.0
name: Papier Bleu
renderer: svg-to-excalidraw
description: >
  A calm two-tone system in the spirit of Matisse's papiers découpés — soft aqua color-blocks on warm cream, with deep-blue type. Breezy, gallery-calm; depth comes from flat color and generous negative space, not grids or shadows. The softness is carried by rounded-rectangles, circles, and ellipses (the board's native soft shapes) — not freeform cut-outs. Flat color only (no gradients, no shadows). Built for gentle explainers, journeys, calm overviews, and boards that should feel artful rather than technical.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#FAF3EB" # warm ivory — the canvas and the "negative" space
  aqua: "#72D0E9" # sky aqua — the hero color-blocks (the "paper")
  aqua-2: "#4FB8D8" # one step deeper aqua — for layering one block over another
  navy: "#1A3C8F" # deep blue — ALL type, plus fine accents (thin rules, small dots)
  # Two-tone (cream + aqua) carried by SHAPE; navy is the ink. Calm, never loud — let it breathe.
  # Rule: keep it to 2–3 elements per scene; let one large aqua block anchor and give room to breathe.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "All text is NAVY (a deep saturated blue — renders true). Navy reads on both cream and aqua."
  note: "Navy is the design choice. Check text colour and contrast in the local editor and final export."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT — no shadows, no gradients. Depth = overlapping color-blocks (aqua over aqua-2), role-swaps, scale, and open space.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 — shapes are flat fills, no border by default"
  rule: "2px solid navy — optional quiet hairline accent only"
  radius: "high rounded (rx ≥ 24) for the soft feel — OR sharp (rx 0) when a crisp block is wanted; both are native. NOT 'organic' — the soft look comes from circles, ellipses, and rounded-rects."
---

# Papier Bleu — Editable Canvas Design System

Matisse cut-outs, rebuilt in the board's native vocabulary. A warm cream page, big soft aqua
blocks, and calm deep-blue type. Soft, asymmetric, airy — an art print, not a diagram. Let one
large aqua block anchor the board and give everything room to breathe.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
