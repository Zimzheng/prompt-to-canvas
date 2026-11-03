---
version: 1.0
name: Cut Bloom
renderer: svg-to-excalidraw
description: >
  A calm two-color color-block system — flat periwinkle blue and marigold yellow blocks on a clean white page, built entirely from rectangles, rounded-rects, circles, and ellipses with no borders. Depth comes purely from solid color blocks and figure-ground contrast, plus a darker solid periwinkle where blocks overlap, never from outlines or shadows. Type is quiet and lowercase-leaning so the color blocks carry the show. Best for warm, editorial explainers, concept maps, value/principle showcases, and gentle process flows where the structure should feel soft and unhurried.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper: "#FFFFFF" # canvas and the breathing room between blocks — clean print white, generous margins; white gaps are part of the design, let shapes carry negative space
  periwinkle: "#535D9E" # accent-1 / primary motif — dominant structural color: block & node fills, big numerals, section bands, larger color blocks
  periwinkle-deep: "#4D5794" # accent-1 shade — solid darker periwinkle for the overlap region (NOT opacity), only with rect/ellipse overlaps
  marigold: "#F0CB65" # accent-2 — warm counterpoint / highlight blocks, the "this one" callout; use in twos or threes, never wall-to-wall
  ink: "#2E3566" # ink / structure — deep blue-navy for body text & rare rules; harmonizes with periwinkle
  # Rule: 2 accents per scene (periwinkle + marigold) on white. Dark text on light fills;
  # on the periwinkle fill use white or marigold for any large display word, never small dark labels.
  # Temperature: cool blue lifted by warm yellow — calm, harmonious, not loud.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, figure-ground white gaps,
# panel role-swaps, and scale. Overlap is shown by stacking solid rect/ellipse shapes, not transparency.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 (no outlines — shapes are flat color blocks distinguished by fill)"
  rule: "3px solid #2E3566" # only when an explicit divider is needed
  radius: 28 # cards & blocks are softly rounded (rx); sharp rects are fine too
---

# Cut Bloom — Editable Canvas Design System

A two-color color-block layout: flat periwinkle and marigold rectangles, rounded-rects, and
circles laid on white, no outlines, no shadows — pure solid color doing all the work.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
