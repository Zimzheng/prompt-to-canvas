---
name: prompt-to-canvas
version: 1.1.0
description: >
  A library of 35 curated visual styles plus an SVG-to-Excalidraw workflow for building polished,
  editable canvases from user-provided content. Use whenever the user wants to turn notes, metrics,
  project stories, concepts, plans, or architecture into an editable Excalidraw canvas, visual
  portfolio board, infographic, timeline, comparison chart, architecture diagram, or
  presentation-ready visual with PNG/SVG export.
---

# Prompt to Canvas

A design-system skill for creating polished, editable Excalidraw canvases from user-provided
content. The agent composes the layout, uses the bundled style catalogue for visual direction,
builds an SVG source, converts it into editable Excalidraw scene JSON, and opens it in the local
editor.

This is **not** an automatic chart generator or a template filler. The style gives palette and mood;
the agent decides the thesis, structure, grouping, hierarchy, labels, and connectors.

Use the user's main interaction language for visible canvas prose, headings, section labels,
annotations, and captions unless the user explicitly asks for another language. Keep technical
terms, product names, API names, acronyms, code identifiers, metrics, and quoted source phrases in
their original language when that is clearer.

## When to use

- The user wants an editable canvas, infographic, diagram, architecture graphic, timeline,
  comparison, dashboard, concept map, or presentation-ready visual.
- The user gives content and asks to "draw", "visualize", "turn this into a canvas", "make a
  portfolio board", or names this skill.
- The result should be polished, editable, exportable, and visually styled.

## Step 0: prerequisites

Run [`scripts/preflight.sh`](scripts/preflight.sh), or check manually:

- **Node 20 or newer.**
- `assets/editor/index.html` exists.
- `scripts/svg-to-scene.mjs`, `scripts/validate-scene.mjs`, and `scripts/open-editor.mjs` exist.
- `CATALOG.md`, `RULES.md`, `templates/`, and `assets/styles/` exist.

If anything is missing, tell the user what is missing and stop.

## How to run the conversation

1. **Understand the canvas.** Identify the content, purpose, and audience. If that is unclear enough
   to change the board, ask one short question before building.
   - When the host supports structured or selectable choices, use them. Otherwise ask a compact text
     question.
   - Offer 2-3 inferred options, put the recommended option first, and include an "agent picks"
     option in the user's language when the prompt already has enough context.
2. **Ask about the vibe.** Ask for the visual style: quiet, professional, playful, bold, brand-like,
   colour preference, or mood. Offer to pick if the user has no preference. Skip this if the user
   already named a style or clear vibe.
   - Use selectable options when the host supports them.
   - Map options to the catalogue levels: Restrained, Balanced, or Bold.
3. **Pick a style.** Use [`CATALOG.md`](CATALOG.md) to choose one style. Choose from the catalogue
   table alone; do not compare multiple `design.md` files. Tell the user the chosen style and why in
   one line.
4. **Build it.** Read [`RULES.md`](RULES.md), [`rules/canvas-rules.md`](rules/canvas-rules.md),
   [`rules/visualization-strategy.md`](rules/visualization-strategy.md), and only the selected
   `templates/<slug>/design.md`, then:
   - Use [`rules/analysis-prompt.md`](rules/analysis-prompt.md) as a private editorial checklist:
     decide the audience, artifact job, core thesis, key entities, relationships, tradeoffs, and
     3-6 claims that deserve space on the canvas.
   - Match visible canvas prose, headings, section labels, annotations, and captions to the user's
     main interaction language unless the user asks otherwise. Technical terms, product names, API
     names, acronyms, code identifiers, metrics, and quoted source phrases may stay in their
     original language when that is clearer.
   - Compose `diagram.svg` first in a logical space around 1600-1700px wide. Use native SVG shapes:
     `rect`, `circle`, `ellipse`, `line`, `polyline`, and `text`. Keep every visible label as text.
   - Keep the Excalidraw infinite canvas background white. If the chosen style has a coloured
     paper/background, draw it as an editable rectangle inside the scene; never put that colour in
     `appState.viewBackgroundColor`.
   - Keep style selection independent from the Excalidraw canvas background. Choose by content,
     audience, formality, and vibe; template paper/background color remains part of the visual
     artifact as an editable rectangle inside the scene.
   - Put only the finished artifact content on the canvas. Context about prompts, sources, file
     paths, chosen style, or process belongs in the chat reply.
   - Apply the selected style as a visual system: palette, density, stroke, corner treatment,
     hierarchy, accent discipline, and layout mood.
   - Convert the SVG into editable Excalidraw scene JSON:

```bash
node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json
```

   - Validate the scene:

```bash
node scripts/validate-scene.mjs --scene scene.json
```

     When a clear language/script expectation exists, validate it too:

```bash
node scripts/validate-scene.mjs --scene scene.json --expected-language <language-code>
```

   - Inspect the opened editor or rendered export. Fix text clipping, cramped spacing, weak
     hierarchy, accidental overlaps, stale sample text, and style drift. Prefer fixing `diagram.svg`
     and reconverting; use scene JSON edits only for Excalidraw-specific cleanup.
5. **Open the editor.** Use:

```bash
node scripts/open-editor.mjs --scene scene.json
```

   Each call starts an independent local editor URL. Do this for every new canvas, alternate
   template, or regenerated version instead of reusing an old URL. By default the script advances to
   a fresh available port and serves the scene from a unique no-cache URL. A port is released when
   that `open-editor.mjs` process is stopped or the host session ends.

6. **Deliver.** Give the user the printed local URL. Mention that the editor supports
   Chinese/English UI switching, refresh-safe local autosave, and PNG/SVG export. Offer to re-render
   the same content in another style.

## Files

- [`CATALOG.md`](CATALOG.md): 35 styles with vibe, formality, and palette signature.
- [`RULES.md`](RULES.md): SVG medium rules shared by the style system.
- [`templates/<slug>/design.md`](templates/): one palette and mood guide per style.
- [`assets/styles/`](assets/styles/): style preview images.
- [`rules/analysis-prompt.md`](rules/analysis-prompt.md): private content-shaping checklist.
- [`rules/canvas-rules.md`](rules/canvas-rules.md): Excalidraw scene and verification rules.
- [`rules/visualization-strategy.md`](rules/visualization-strategy.md): layout and style-fidelity
  guidance.
- [`scripts/preflight.sh`](scripts/preflight.sh): dependency and resource check.
- [`scripts/svg-to-scene.mjs`](scripts/svg-to-scene.mjs): SVG to editable Excalidraw converter.
- [`scripts/validate-scene.mjs`](scripts/validate-scene.mjs): scene schema validator.
- [`scripts/open-editor.mjs`](scripts/open-editor.mjs): local editor server and scene loader. It
  allocates a fresh port by default for separate generations.

## Smoke test

```bash
scripts/preflight.sh
node scripts/svg-to-scene.mjs --svg test-diagram.svg --out test-scene.json
node scripts/validate-scene.mjs --scene test-scene.json
node scripts/open-editor.mjs --scene test-scene.json --no-open
```
