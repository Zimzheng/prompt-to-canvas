# SVG → editable Excalidraw capabilities

This is the local Excalidraw workflow. Renderer labels and Feishu export caveats in upstream design
assets are historical; this file defines current conversion behavior.

## Supported SVG subset

| Input | Editable result / limits |
| --- | --- |
| `rect` | Rectangle; positive `rx`/`ry` selects native rounded treatment, not an exact CSS radius |
| `circle`, `ellipse` | Native ellipse |
| `polygon` | Axis-aligned centered four-point diamond becomes `diamond`; other polygons become closed native lines |
| `line`, `polyline` | Native lines; marker attributes create native arrows |
| `path` | One subpath using M/L/H/V/C/Q/Z, absolute or relative; curves are sampled into editable line points |
| `text`, `tspan` | Editable text; tspans are explicit lines, not independent inline typography |
| `g` | Transform/style inheritance; each group preserves an editable group ID |
| `defs`, `marker` | Definitions are not rendered; marker presence selects native arrowheads |

Always supply explicit fill/stroke for predictable appearance. Omitted/none/zero-width stroke is
borderless. Supported inherited paint attributes include fill, stroke, stroke width/dash, font size,
text anchor, and markers. Inline styles override presentation attributes. Dash arrays select canonical native dashes rather
than reproducing exact SVG dash lengths. Global CSS and selectors
are unsupported. Use `translate`, `rotate`, uniform `scale`; nonuniform scale, skew and matrix
transforms are rejected instead of silently changing geometry.

Curve sampling approximates the shape; it does not preserve a Bézier editing handle. Arc/S/T
commands, multiple subpaths, gradients, filters, patterns, clipping, masks, use/image/foreignObject
and external resources are unsupported. Visible unsupported features fail conversion before an
output is written. Simplify them or choose another representation; do not flatten a structural
relationship to an image. Comments and definition geometry do not create scene elements.

## Text and opacity

Default text uses numeric Excalidraw font ID 1 for compatibility. `data-font-family="2"` selects the
native normal sans-serif alternative; 1, 2 and 3 are supported. Put it on text or an enclosing group.
Arbitrary CSS font families, font weight and letter spacing are not reproduced; the converter warns.
Create hierarchy with scale, placement and contrast. It estimates text bounds rather than measuring
browser glyphs. Wrap with tspans and inspect actual editor/export text; do not rely on pixel-tight fits.

Element opacity is supported. Group opacity multiplies descendant opacity per element, which is
not SVG group compositing for overlapping shapes; a diagnostic calls out this approximation.
Independent fill/stroke opacity is unsupported: use a common element opacity or explicit solid tints.
Use solid text colours with strong contrast. Hard offset shadows can be duplicate matching shapes
when compatible with the chosen visual direction; blur shadows remain unsupported.

## Grouping and bindings

Give meaningful IDs to nodes, labels, groups and edges. SVG group IDs become Excalidraw groupIds
with innermost group first. Grouping preserves joint selection; binding preserves relationships.
Only one text element can be bound to each rectangle, ellipse or diamond. Keep other annotations
unbound or group them with the component. Container text should be centered and fit comfortably.

```svg
<g id="review-component" data-font-family="2">
  <polygon id="review" points="400,100 500,170 400,240 300,170"
           fill="#fff" stroke="#273548" stroke-width="2"/>
  <text id="review-label" x="400" y="178" text-anchor="middle"
        font-size="22" fill="#273548" data-container-id="review">通过？</text>
</g>
<polyline id="accepted" points="500,170 560,170 560,320 620,320"
          fill="none" stroke="#273548" stroke-width="2"
          data-start-id="review" data-end-id="publish" marker-end="url(#arrow)"/>
```

`publish` must exist elsewhere in the same SVG. Bindings are resolved after conversion, so forward
references work. Attributes accept bare IDs or #IDs. Arrows may bind one or both ends; lines without
arrow markers cannot carry endpoint bindings. Keep endpoints on or just outside their intended
shape boundary. The converter records reciprocal references and estimates binding focus/gap;
inspect dragging in the actual editor. Sampled curves reserve an endpoint tangent span for
node movement; this can slightly change their rendering. Large moves can still require manual
route adjustment. No automatic layout, obstacle avoidance or implicit nearest-
node attachment is performed. Explicit attributes prevent accidental attachment to background panels.

## Conversion discipline

Use a real viewBox and content-driven bounds; the converter does not scale or clip the scene to it.
Keep every visible label as text. Use marker attributes rather than drawing separate arrowhead
triangles. Native arrowheads are intentionally canonical rather than arbitrary marker geometry.
Use a white infinite background and an editable rectangle for coloured artifact paper.

```sh
node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json
node scripts/validate-scene.mjs --scene scene.json --expected-language zh
node scripts/open-editor.mjs --scene scene.json
```

Conversion diagnostics identify unsupported features. Fix the SVG and retry. Inspect the actual
scene and final export for routing, text and edit behavior; schema checks alone are insufficient.
