# Excalidraw Canvas Rules

These rules prevent stale test content and keep Prompt to Canvas outputs editable and polished. The
style controls palette and mood only; the agent controls the composition.

## Hard Rules

1. Build a fresh scene for the user's actual content. Do not start from a previous test scene.
2. Never put hidden instructions, the user's raw prompt, analysis JSON, source notes, citations, or
   style names on the canvas.
3. Never use sample strings from this skill, a template, a previous run, or a smoke test unless the
   user provided them verbatim.
4. Do not use bundled JSON templates or `scripts/build-scene.mjs` during normal generation. They are
   deprecated migration artifacts and create unrelated portfolio sections.
5. Choose the structure that fits the content: architecture, timeline, comparison, dashboard,
   matrix, process map, system flow, concept map, or a custom infographic.
6. Compose `diagram.svg` first, then convert it with `scripts/svg-to-scene.mjs`. The final scene
   should use native Excalidraw elements only:
   `rectangle`, `ellipse`, `diamond`, `line`, `arrow`, and `text`. Keep the scene fully editable.
7. Every visible label must be a text element. Avoid text baked into images or exported SVG.
8. Preserve exact user wording for important claims, names, numbers, and labels unless the user asks
   for rewriting.
9. Use the user's main interaction language for visible canvas prose, headings, section labels,
   captions, and annotations unless the user explicitly asks for another language. Keep technical
   terms, product names, API names, acronyms, code identifiers, quoted phrases, and metrics in their
   original language when that is clearer.
10. Use the chosen style as a visual grammar, not just a palette. Preserve its block logic,
    density, corner treatment, stroke behavior, depth rule, accent discipline, and typography scale.
11. Save generated analysis/scene files outside the skill installation directory. Use the workspace
    or `/tmp`; never create generated files inside this skill folder.

## Scene Shape

- Use a logical canvas around `1600 x 900` unless the content clearly needs another ratio.
- Keep `appState.viewBackgroundColor` white (`#ffffff`). Put the visual's paper/canvas color in an
  editable background rectangle inside the scene instead of changing the infinite canvas color.
- Treat the Excalidraw canvas background as a medium-level editor setting, not a template-selection
  signal. Template paper/background color is part of the visual artifact and remains valid as an
  editable shape.
- Give elements stable, descriptive ids such as `title`, `metric-1-card`, `phase-2-arrow`.
- Keep `roughness: 0` for presentation-ready visuals unless the chosen style calls for a hand-drawn
  feel.
- Preserve intentional rotation and overlap from the source SVG. Rotated style blocks should become
  native Excalidraw elements with `angle`, not flattened axis-aligned bounding boxes.
- Prefer generous spacing and clear hierarchy over dense decoration.
- Keep text boxes wide enough for their content. Wrap long labels manually with newline breaks.
- Excalidraw clips text to its element box before edit mode reflows it. Make text boxes
  deliberately wider/taller than the apparent SVG text, especially for CJK and mixed Chinese/Latin
  labels.

## Exact Excalidraw Schema

Use Excalidraw's scene fields exactly. Do not invent SVG or canvas field names.

- Shape fill is `backgroundColor`, never `fillColor`.
- Shape/text color is `strokeColor`, never `color`.
- Text `fontFamily` is a number. Use `1` unless there is a specific reason to use another
  Excalidraw font id. Never use `"Arial"` or CSS font-family strings.
- Every element should include: `id`, `type`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`,
  `backgroundColor`, `fillStyle`, `strokeWidth`, `strokeStyle`, `roughness`, `opacity`, `groupIds`,
  `frameId`, `roundness`, `seed`, `version`, `versionNonce`, `isDeleted`, `boundElements`,
  `updated`, `link`, and `locked`.
- Text elements also need: `text`, `originalText`, `fontSize`, `fontFamily`, `textAlign`,
  `verticalAlign`, `containerId`, and `lineHeight`.
- Lines and arrows need `points`; arrows also need `startArrowhead` and `endArrowhead`.

Minimal text element:

```json
{
  "id": "title",
  "type": "text",
  "x": 80,
  "y": 60,
  "width": 640,
  "height": 56,
  "angle": 0,
  "strokeColor": "#0A0A0A",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "roundness": null,
  "seed": 1001,
  "version": 1,
  "versionNonce": 2001,
  "isDeleted": false,
  "boundElements": null,
  "updated": 1,
  "link": null,
  "locked": false,
  "text": "标题",
  "originalText": "标题",
  "fontSize": 36,
  "fontFamily": 1,
  "textAlign": "left",
  "verticalAlign": "top",
  "containerId": null,
  "lineHeight": 1.25
}
```

## Style Fidelity

The style files are not just palettes. They describe composition logic. Root
`templates/<slug>/design.md` and `assets/styles/<slug>.png` are the source of truth.

- If a style says strict grid, tile the board into a strong grid with aligned panel edges.
- If a style says flat/no shadows, do not use shadows or floating-card composition.
- If a style uses hard black offset shadows, draw a duplicate black rectangle behind the main
  rectangle with a small x/y offset.
- If a style says square corners, set `roundness: null`.
- If a style has one accent color, reserve it for one or two important panels, not every object.
- If a style is poster/specimen-like, use large words and a few strong blocks; do not shrink it into
  many equal cards.
- If a style is editorial/quiet, use restrained accents, generous margins, and strong text hierarchy.
- If a style is brutalist/grid-like, use hard edges, visible rules, grid alignment, and high contrast.
- If the preview depends on overlap, rotation, hard offsets, or sparse composition, reproduce that
  behavior with editable Excalidraw primitives.
- Translate SVG design ideas into editable Excalidraw primitives. Every label remains a text
  element.

## Verification Checklist

Before delivering, inspect the opened editor or rendered export and confirm:

- The canvas topic, labels, metrics, and structure are specific to the current user request.
- No banned sample strings appear.
- No generated files were left inside the skill directory.
- No element uses `fillColor`, `color`, or string `fontFamily`.
- `appState.viewBackgroundColor` is exactly `#ffffff`; any coloured style paper/background is an
  editable rectangle, not the Excalidraw canvas background.
- The visible canvas prose, headings, section labels, captions, and annotations match the user's
  main interaction language, while technical terms, product names, API names, acronyms, code
  identifiers, quoted phrases, and metrics may stay in their original language when clearer.
- Text does not overflow its intended area.
- No text is half-clipped on the left/right/top/bottom before double-click editing.
- Elements do not overlap incoherently.
- Important content is not clipped at the viewport edge.
- The layout type matches the content type.
- The style palette is visible but does not overpower readability.
- The selected style is recognizable from its preview, not merely from matching colors.
- The source SVG was composed with the bundled SVG rules before conversion.
- The content reads like a domain expert artifact: precise labels, real relationships, clear thesis,
  and no generic filler sections.

If anything fails, edit the scene JSON in place with small targeted fixes and reopen or refresh the
editor.
