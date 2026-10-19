# Visualization Strategy

Prompt to Canvas must use the bundled style system as the design source of truth. Compose an
SVG-first design, then convert that SVG into editable Excalidraw elements. Do not design directly in
Excalidraw unless the user explicitly asks to bypass style fidelity.

## Selection and diversity

Resolve the visual direction using [style-selection.md](style-selection.md) before composing.
Do not treat the README example, familiar palettes, or the previous canvas as a default. Preserve
an explicitly chosen style or series; for independent delegated outputs, consider a different,
equally suitable visual family. A style change must affect the visual grammar beyond colour.

## Design Priority

1. Medium limits and editability are mandatory; `diagram.svg` must satisfy `RULES.md` before
   conversion.
2. The user's content and intended use determine narrative structure, topology, grouping, and
   label load. Preserve causal links, ordering, boundaries, and comparison criteria.
3. The selected `templates/<slug>/design.md` controls palette, geometry, stroke, corners, depth,
   hierarchy, and visual rhythm within those content relationships. If its defining traits cannot
   support the content, revisit selection rather than erasing relationships or shrinking text.
4. `assets/styles/<slug>.png` illustrates visual language. Do not inherit its example labels,
   three-stage/column structure, node count, or aspect ratio. Same-content previews make styles
   comparable; they are not page templates. Follow explicit user requests to reproduce a layout.
5. Generic dashboard/card patterns are a fallback only when content and selected style support them.

Never override a selected style with old defaults such as blue SaaS cards, soft drop shadows,
12px rounded panels, gradient data cards, or generic portfolio sections.

## Why Composition Matters

Professional canvases hide expertise inside the editorial act of making the board. The template,
allowed primitives, and render-review loop force the agent to decide: what is the thesis, what must
be large, which concepts are adjacent, which relationships need arrows, which labels are precise
enough, and what should be cut.

Avoid the common failure mode: creating a private expert analysis, then translating it into generic
cards named "核心能力", "关键价值", "主要流程", or "技术架构". That is analysis-shaped content, not a
professional artifact. The board should feel as if the expert directly composed the final page.

## Template Translation

First create SVG using only primitives allowed by `RULES.md`. Then `scripts/svg-to-scene.mjs`
translates those primitives to Excalidraw like this:

| SVG design idea | Excalidraw translation |
| --- | --- |
| borderless color block | `rectangle` with matching `backgroundColor`, no/low stroke |
| sharp editorial panel | `rectangle`, `roundness: null`, aligned to grid |
| hard offset shadow | duplicate rectangle behind, same size/corner, offset 8-18px |
| rotated or overlapped block | native shape with preserved `angle`, not an axis-aligned bounding box |
| circle/ellipse marker | `ellipse` with exact fill and stroke behavior |
| rule/divider/axis | `line` with matching stroke width and color |
| connector with arrow | `arrow` or `line` with native Excalidraw arrowhead |
| big specimen word | large text element, high weight implied by size/contrast |
| small explanatory label | text element in a high-contrast quiet area |

## Style Fidelity Checklist

Before drawing, extract from the selected `design.md`:

- canvas color
- ink color
- accent colors and how many may appear together
- stroke width and whether borders are allowed
- corner radius: square, rounded, pill, or mixed
- depth rule: flat, hard shadow, rotated blocks, overlap, or no shadow
- density: poster-like sparse, grid dense, editorial medium, dashboard-like
- typography behavior: large display words, quiet body labels, labels on blocks, etc.
- forbidden moves: no shadows, no borders, no small text on saturated fills, no overuse of accents

The selected visual language should be recognizable through palette, geometry, hierarchy, and
rhythm, while its layout expresses the current content rather than the preview example. Missing
profile/design details are not permission to invent a signature constraint.

## Layout Choice

Choose the structure from the content, then render it in the selected style grammar:

- `architecture`: layers, components, interfaces, data/control flow, feedback loops.
- `system-map`: actors, states, loops, decisions, constraints, outputs.
- `concept-map`: definition, mechanism, architecture, examples, implications.
- `process`: stages, handoffs, inputs/outputs, checkpoints.
- `comparison`: before/after, alternatives, tradeoffs, decision criteria.
- `timeline`: phases, milestones, inflection points.
- `pyramid`: foundational layer -> capability layer -> application/outcome layer.
- `tree`: trunk/root principles with branching technology routes or capability families.
- `cycle`: repeated loop with feedback, learning, adaptation, or operating cadence.
- `dashboard`: metrics and operating levers, only when data is central.
- `matrix`: dimensions, tradeoffs, prioritization, capability map.
- `poster`: one core thesis with 2-4 supporting blocks.

Avoid defaulting to a three-column card layout. The layout must prove the core thesis. When the user
has chosen a presentation form, obey that choice unless it becomes impossible with the provided
content; if it is impossible, explain briefly and choose the nearest structure.

## Professional Content Rules

- Use specific domain labels. Replace "核心能力" with labels like "上下文状态", "评估闭环",
  "执行轨迹", "人机校准", when those fit the topic.
- Show relationships, not just lists. Use arrows, adjacency, hierarchy, or spatial grouping to show
  why things connect.
- Keep the canvas concise: usually one thesis, 3-6 major nodes, and 3-5 supporting annotations.
- If the user asks for "架构", include layers, boundaries, inputs/outputs, feedback/control paths,
  and key design decisions.
- If the user asks "是什么", include definition, mental model, mechanism, and why it matters.

## Excalidraw Craft

- Use a logical width around 1600–1700; let content determine height. Do not copy the preview
  aspect ratio or force every output into 16:9.
- Align edges deliberately. Use repeated x/y coordinates and consistent gaps.
- Use fewer, stronger shapes. A well-composed board beats many small cards.
- Keep all text editable and manually wrapped.
- Inspect after opening. Fix overflow, weak hierarchy, generic content, and any visual move that
  contradicts the selected template.
- When fixing visual style, edit `diagram.svg` and reconvert. Edit `scene.json` only for
  Excalidraw-specific cleanup after the SVG is already visually correct.
