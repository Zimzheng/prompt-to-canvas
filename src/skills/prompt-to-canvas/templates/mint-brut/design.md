---
version: 1.0
name: Mint Brut
renderer: svg-to-excalidraw
description: >
  A candy-bright neo-brutalist design system for editable canvases, drawn from playful mobile-UI mockups. A mint-green canvas carries flat cream cards capped by hot-pink header bands, all bound by heavy 3–4px black borders with softly rounded corners. Type is a clean bold register — no display typeface survives, so weight and scale do the work — and bright pink / green / gold accents pop as solid color-blocks with bold accent chips breaking the grid. FLAT throughout: no shadows, no gradients. Built for friendly explainers, onboarding flows, step sequences, and comparison or system maps that should feel approachable rather than corporate.

# ── COLOR ────────────────────────────────────────────────────
colors:
  mint: "#D0FDE4" # universal canvas background — bright minty green, friendly, never white
  cream: "#FFFBF3" # card / panel body fill — warm near-white; the surface ink text sits on
  ink: "#000000" # all borders, rules, body text — pure, chunky black
  pink: "#F888C8" # dominant accent: header bands, big numerals; large fills/graphic stamps only, never a field under small text
  green: "#70F0A8" # secondary accent: money-bill stamps, highlights; large fills/graphic stamps only, never a field under small text
  gold: "#F0DE4E" # punctuation accent: coin stamps, badges, dots; large fills/graphic stamps only, never a field under small text
  pale-pink: "#F8E0F0" # soft note / aside panel fill (solid light, not opacity); carries dark ink text
  # Use 2–3 accents per scene, never all at once. Colors pop flat against mint — never blend. Keep dark (ink) text on the light cream/pale-pink fills.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks (pink band on cream card),
# heavy ink borders, panel role-swaps, and scale. Never offset-duplicate or blur for depth.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid ink" # cards, panels, badges, stamps
  rule: "3px solid ink" # dividers, input fields, connectors
  radius: 12 # softly rounded corners on cards/inputs; 0 acceptable on small stamps
---

# Mint Brut — Editable Canvas Design System

A design system for building **friendly explanatory diagrams** as editable
canvases written in SVG. The aesthetic is candy neo-brutalism: flat cream cards with
hot-pink header bands on a bright mint canvas, bound by heavy black borders with gently
rounded corners, punctuated by bold accent chips. It looks playful and
hand-built, not corporate-templated.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
