# SVG to Editable Excalidraw — Medium Rules

These apply to every Prompt to Canvas output. The visual library originated with Feishu;
this package delivers locally through SVG → native Excalidraw scene JSON. Use the conversion and
inspection workflow below. References to Feishu in upstream template names are historical context,
not instructions to create external documents. The selected design supplies visual language;
content determines narrative structure.

## Hard rules

- **Text-family limitation.** The converter currently writes numeric Excalidraw `fontFamily: 1`.
  It does not preserve arbitrary SVG font families, weights, or letter spacing. Do not set
  `font-family` or promise a reference typeface; use size, contrast, spacing and placement for hierarchy.
- **Explicit element styles.** Put fill, stroke, and stroke width on each element (or its inline
  style); this converter does not inherit group CSS. An omitted stroke, `stroke="none"`, or zero
  stroke width remains borderless. Use explicit strokes for visible connectors and outlines.
- **Text lives in `<text>` / `<tspan>`** — never outline glyphs as `<path>`.
- **Shape vocabulary is native-only — a rectangles-and-circles tool.** Build everything from
  `<rect>` (sharp or rounded `rx`), `<circle>`, `<ellipse>`, straight `<line>` / `<polyline>`
  connectors, and `<text>` — these become real editable shapes. Do not rely on `<polygon>` or
  curved/bezier `<path>`: this converter does not turn them into editable structural shapes.
  A path inside a marker definition only signals an arrowhead; it is not a rendered shape. **No freeform / organic / illustrative shapes** (blobs,
  leaves, petals, waves, coral, fans, flowers, stars, confetti, doodles, mascots, "hand-cut"
  silhouettes). If a reference is organic, keep only its **palette** and rebuild with rects + circles.
- **Arrows = native connectors, never hand-drawn heads.** To put an arrowhead on a line, give the
  `<line>` or `<polyline>` a **`marker-end`** (and `marker-start` for a double-headed arrow)
  pointing at a `<marker>` in `<defs>`. The board converts these into **native connectors with a
  clean built-in arrowhead**, and the arrow takes the line's `stroke` colour. **Never draw an
  arrowhead as a separate `<polygon>` / triangle** — use a native arrowhead instead. One marker definition serves the whole board:
  ```svg
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="4"
            orient="auto" markerUnits="strokeWidth"><path d="M0 0 L10 4 L0 8 z"/></marker>
  </defs>
  <line x1="100" y1="80" x2="360" y2="80" stroke="#0D4FA8" stroke-width="3" marker-end="url(#arrow)"/>
  <!-- right-angled connector: polyline (H/V points) + marker-end -->
  <polyline points="100,140 240,140 240,220" fill="none" stroke="#0D4FA8" stroke-width="3" marker-end="url(#arrow)"/>
  <!-- double-headed (e.g. read/write): add marker-start too -->
  <line x1="100" y1="280" x2="360" y2="280" stroke="#0D4FA8" stroke-width="3" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
  ```
  (The marker's own shape/colour is ignored on the board; it just signals "put a native arrowhead
  here." Keep the line straight or right-angled — those map to clean `straight` / `right_angled` connectors.)
  **The classic defect** is a `<line>` plus a separate little `<polyline>` / `<polygon>` chevron drawn
  at its tip — that chevron IS a hand-drawn arrowhead. Delete it and put `marker-end` on the line.
  **Mandatory self-check before you write the board:** run
  `grep -nE '<polygon|<polyline' <dir>/diagram.svg` — every `<polygon>`, and every short `<polyline>`
  shaped like a triangle/chevron at a line's endpoint, is a defect to convert. (A `<polyline>` is fine
  ONLY as a right-angled connector path that itself carries `marker-end` and has no separate chevron.)
  **This matters most when you START FROM or EDIT an existing SVG** (a gallery template, a previous
  board, a translation): its arrows may predate this rule and still be hand-drawn — re-check and
  convert them, don't just edit the text around them.
- **Forbidden** (unsupported in this native conversion workflow): any gradient, `<filter>`, `<pattern>`,
  `<clipPath>`, `<mask>`, blur.
- **Opacity is ignored.** `opacity` / `fill-opacity` / `stroke-opacity` all render fully opaque.
  To get a paler tint, use a **solid lighter hex** — never alpha. (To fake a translucent overlap,
  paint the overlap region as its own solid darker shape.)
- **Text contrast.** Use explicit solid text colours with strong contrast. Inspect the local
  editor and export; do not rely on Feishu-specific export colour caveats. Typography and line
  wrapping can differ after conversion, so the source SVG alone is not sufficient visual QA.
- **Shadows.** No blur/filter shadows (unsupported). Hard **offset shadows are allowed and fine** —
  draw one as a **solid duplicate of the SAME shape** offset behind the real one (never a blur). It must
  match the element's shape exactly: same `rx` (a pill's shadow is a pill, not a rect), same `width`/`height`,
  and inside the same `rotate()` group so it tilts with the element. Default can still be flat — depth also
  comes from flat color blocks, role-swaps, and scale. A selected design's explicit no-shadow rule
  forbids hard offsets too. Conversely, generic legacy boilerplate saying “no gradients/filters/shadows”
  does not override an explicit hard-offset recipe in that design.
- **No decorative micro-chrome.** No ornamental kicker/footer/slug/metadata labels. Every text
  element must be load-bearing and legible (≥ ~16px, strong contrast); keep small text inside
  high-contrast panels, never small on a colored canvas.
- **Never echo the user's instructions or your own process onto the board.** The board shows the
  **content** — never the request that produced it, the inputs you read, or how you built it. A
  whiteboard is a finished artifact, not a homework submission, so it carries no "here's what you
  asked for" framing. Cut every meta / process line, for example:
  - scope or task notes — _"整理范围：仅总结张睿发言；问答部分按她的回答归纳"_, _"本图涵盖第 3-5 章"_
  - source citations — _"来源：会议逐字稿 00:06:28–00:52:58 的张睿发言"_, _"based on the attached doc"_
  - the chosen style / template name — _"风格：Specimen Bold"_, _"Riso Brut template"_
  - audience / format directions, restatements of the prompt, and _"summary of… / 总结自…"_ framing
  - dates, tokens, file paths, or tooling you were not explicitly asked to display

  A **title may name the subject** (e.g. _"张睿 · 发言总结"_ is fine — that is the topic), but nothing
  on the board may describe the task, the source material, or the tool. **Litmus test:** if a line is
  addressed to the person who asked (or to a grader) rather than being a real part of the artifact,
  delete it. Put that kind of context in your chat reply to the user, never on the canvas.

- **Transforms:** `translate` / `rotate` / `scale` are safe; avoid `skewX` / `skewY` / `matrix(...)`.
- **No fixed canvas.** No 16:9, no scaler. Work in a logical coordinate space (≈1600–1700 wide) and
  let content define the bounds.
- **Allow for text bounds** (CJK ≈ 1em, Latin ≈ 0.6em as rough estimates). Pad boxes generously; never fit text to
  the pixel; wrap long lines across `<tspan>`s rather than shrinking.

## Local workflow

1. Resolve style using [rules/style-selection.md](rules/style-selection.md); read the chosen design.
   Choose narrative structure from the content, not the preview's example columns or node count.
2. Compose a native-shape SVG at a logical width around 1600–1700; height follows content.
   Every visible label remains editable text. Check arrows with `rg -n '<polygon|<polyline' diagram.svg`;
   structural polylines should carry `marker-end` where direction is intended.
3. Convert and validate with the bundled scripts:

```sh
node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json
node scripts/validate-scene.mjs --scene scene.json
# Add --expected-language <language-code> when the brief has a language expectation.
node scripts/open-editor.mjs --scene scene.json
```

4. Inspect the actual local editor or rendered export. Check overflow, clipping, padding, contrast,
   accidental overlap, style fidelity and real information relationships. Trace directed edges to
   their intended source and target; counting arrows alone does not prove topology. Do not copy
   sample content, page proportions or three-stage layouts from a style preview.
5. Fix the source SVG locally, batch the observed fixes, reconvert and revalidate. Use scene JSON
   edits only for Excalidraw-specific cleanup. Deliver the local URL and PNG/SVG export instructions
   through the workflow in [SKILL.md](SKILL.md).
