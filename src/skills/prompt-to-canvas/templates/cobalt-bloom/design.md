---
version: 1.0
name: Cobalt Bloom
renderer: svg-to-excalidraw
description: >
  A maximal-typographic, two-tone editorial system — electric cobalt blue on a warm blush-salmon ground. The signature is OVERSIZED type: giant solid numerals that anchor the board and a word running vertically up an edge. Off-white book-page panels hold the small text. Fashion-magazine confidence, airy negative space, no clutter — and flat: no shadows. Built for headline boards, yearly/quarterly plans, single-number stats, and bold section openers.

# ── COLOR ────────────────────────────────────────────────────
colors:
  blush: "#DDA8A2" # warm salmon-blush — the canvas
  blush-2: "#CE968F" # one step deeper — an optional recessed block
  cobalt: "#4746C6" # electric cobalt — SHAPES ONLY: borders, bars, the edge block, rules, connectors
  paper: "#F4EFE9" # warm book-page off-white — panels that hold text
  ink: "#171717" # near-black — ALL text
  # TWO-TONE identity (blush + cobalt) is carried by SHAPES and scale, never by colored type. Cobalt never appears as text — it collapses to black on the board. Leave lots of air.

# ── TEXT COLOR (stylistic choice: ink text, cobalt in shapes) ─
text-rules:
  rule: "By choice, text is INK and the cobalt lives in SHAPES — a clean high-contrast two-tone, and it sidesteps the image-export's text-color blackout so the board is easy to verify. (Text color is NOT restricted on the board — cobalt text would render fine on the live board; we just prefer ink here.)"
  on-blush: "INK text — large display only (titles, mega numerals). Keep small text off the blush; put it in paper panels."
  on-paper: "INK text — crisp at any size. This is where body + labels live."
  color: "Cobalt enters via SHAPES: an underline bar under the mega numeral, panel borders, a solid edge bar, dividers."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT — NO shadows. Depth = oversized scale, the two-tone contrast, paper panels, and negative space.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  border: "4px solid cobalt" # paper panels, banners
  rule: "3px solid cobalt" # thin divider under a title or inside a panel
  radius: 0 # squared
---

# Cobalt Bloom — Editable Canvas Design System

Two colors, enormous type. Electric cobalt on a blush-salmon field, with a giant numeral as
the hero and a word climbing one edge. Confident, editorial, airy — the scale of the type _is_
the design. Flat throughout: no shadows, no clutter, no decorative chrome.

## Rules

This guide supplies visual treatment, not a required page layout. Preserve the content's topology.
Current conversion capabilities and limitations are defined in **[../../RULES.md](../../RULES.md)**;
that contract supersedes historical renderer/font/export notes in this guide. Curves and simple
editable geometry are available when useful. Keep this guide's palette, contrast and depth choices
unless a content-driven adaptation is explicitly identified.
