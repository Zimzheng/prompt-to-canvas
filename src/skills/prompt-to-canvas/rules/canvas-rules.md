# Scene and verification invariants

## Scene

- Build a fresh artifact from the current user's content. Do not reuse a test scene or deprecated
  `build-scene.mjs`/JSON templates. Generated files stay outside the skill installation directory.
- Compose SVG first; convert with the bundled converter. Native output uses rectangle, ellipse,
  diamond, line, arrow and text elements. No rasterized labels or image-based structural diagrams.
- Use exact Excalidraw fields: `backgroundColor`, `strokeColor`, numeric `fontFamily`, `points` for
  lines/arrows. Do not invent `fillColor`, `color` or CSS font strings.
- `appState.viewBackgroundColor` is `#ffffff`; artifact paper is an editable rectangle.
- Use unique, meaningful element IDs. Give actual components SVG groups. Bind central node labels
  with `data-container-id`; bind flow arrows with `data-start-id` / `data-end-id`. See [../RULES.md](../RULES.md).
- Preserve user wording and facts; use the user's language for prose. Canvas text serves the reader.
  Requested legends, units, citations and dates are valid content. Prompt echoes, file paths, style
  names and generation commentary normally belong in chat.

## Verification

Run `validate-scene.mjs`; it checks structural fields, finite geometry, IDs, supported element types,
reciprocal bindings and group references, with optional language checks. It does not prove domain
correctness, collision freedom, visual quality or a diversity improvement.

Inspect the actual editor or final export for:

- all meaningful entities, branch conditions, joins and feedback routes;
- readable text without clipping, cramped padding or accidental overlaps;
- clear main path and meaningful distinction of secondary/exception paths;
- a coherent visual system that supports the mechanism;
- label/arrow behavior when a representative bound node is moved, followed by undo;
- PNG/SVG export and local loading when converter behavior has changed.

Fix source SVG and reconvert. Use scene JSON edits only for Excalidraw-specific cleanup, preserving
bindings and source parity. Never report browser/export checks as passed if only the schema ran.
