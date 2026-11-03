---
version: 1.0
name: Editorial Forest
renderer: svg-to-excalidraw
description: >
  A serif-led editorial palette in the register of a literary quarterly or art-book monograph. A
  tight five-color set pairs a deep forest green with a dusty rose pink over an oat-cream paper
  ground. Confident, paper-feeling, and committed to a small vocabulary, closer to a Penguin classic
  or a quiet annual report than a tech keynote. Flat color only, no gradients or shadows. The three
  primary surfaces (green, pink, cream) carry surface-dependent text inversion.

# ── COLOR ────────────────────────────────────────────────────
colors:
  green: "#2e4a2a" # deep forest green — the most distinctive surface: slide surface, tile fill, card border, divider color, AND primary heading/text color on cream
  green-deep: "#243a21" # text color on pink surfaces (pure green lacks contrast there)
  green-lite: "#3a5a36" # second green fill when two greens sit side by side; carries pink text
  pink: "#e89cb1" # surface, tile fill, and the on-green text color: dusty rose, the system's primary accent
  pink-deep: "#d27e96" # border on pink-filled tiles where same-color border must differentiate
  cream: "#efe7d4" # oat paper: default non-cover background AND on-green body text color
  cream-2: "#e6dcc4" # subtly darker cream tile on the cream ground (pair with a 2px green border)
  ink: "#1a1a17" # body text on cream surfaces: warm near-black, never pure #000
  # Use a small vocabulary per scene. Body is ink on cream; on a green surface text becomes cream
  # or pink; on a pink surface text becomes green-deep or cream.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text color follows the surface. On cream: ink (warm near-black), green for headings. On a green fill: cream (body) or pink. On a pink fill: green-deep or cream."
  note: "Large bold light text on the green fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, never the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2px solid green for cream-2 tiles; pink-deep for borders on pink tiles. Many surfaces are borderless flat fills."
  rule: "2px solid green for dividers and meta rules"
  radius: "low to none (rx 0 to 8); the look is squared editorial, not soft"
---

# Editorial Forest — Editable Canvas Design System

A deep forest green, a dusty rose, and an oat-cream page: three surfaces and a couple of near-duplicate
shades, used with editorial discipline. Pick one surface to anchor a scene, keep the color count low,
and let the green-and-pink pairing carry the identity.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
