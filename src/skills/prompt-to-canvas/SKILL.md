---
name: prompt-to-canvas
metadata:
  version: "1.2.0"
description: >
  Design polished, editable Excalidraw canvases from content: flowcharts, architecture,
  explanations, comparisons, timelines, and visual boards. Combines content-led composition,
  35 visual references or a custom direction, and a local SVG-to-scene workflow with PNG/SVG export.
---

# Prompt to Canvas

Design the relationships before the decoration. The style library is a reference library, not a
menu of page templates. Use the user's language for visible prose; preserve technical identifiers,
names, numbers, and quoted wording when clearer in their original language.

## Priorities

Preserve facts and relationships → serve the reading task → compose topology and hierarchy →
apply a coherent visual language → add purposeful detail. Honour explicit user style, layout,
brand, and series choices. Do not remove a branch, exception, or boundary to fit a reference image.

## Workflow

1. **Check the runtime.** Run `scripts/preflight.sh`. Node 20+ and the bundled editor are required.
   If Node exists outside PATH, use its absolute path or add its directory to the task's PATH.
   Stop and report a genuinely missing dependency; do not silently substitute a static image.
2. **Understand the brief.** Identify the audience, reading task, entities and relationships.
   Ask only when missing facts would materially change correctness or scope. Otherwise infer and
   proceed. Read [rules/analysis-prompt.md](rules/analysis-prompt.md) for content shaping.
3. **Design the composition.** Read [rules/visualization-strategy.md](rules/visualization-strategy.md).
   For a nontrivial brief, briefly compare 2–3 materially different spatial arrangements in working
   notes; choose one. A simple or explicitly prescribed diagram needs no extra alternatives.
   Combine structures where useful. Node count, orientation, and canvas bounds follow the content.
4. **Choose the visual direction.** Read [rules/style-selection.md](rules/style-selection.md).
   With no specified style, choose autonomously. Use [CATALOG.md](CATALOG.md) and, when useful,
   [STYLE_PROFILES.md](STYLE_PROFILES.md), or author a coherent custom direction. Read the full
   `templates/<slug>/design.md` for any selected catalogue style. Announce the direction and one
   concrete reason; this is not an approval gate. Previews illustrate visual treatment, not layout.
5. **Build SVG.** Read [RULES.md](RULES.md) and [rules/canvas-rules.md](rules/canvas-rules.md).
   Create a fresh `diagram.svg` outside the skill directory. Keep labels as text. Use meaningful
   IDs, grouped components and explicit binding attributes for flow nodes. Respect the converter's
   documented subset; unsupported visual features must not disappear silently.
6. **Convert and validate.** From this skill directory, using absolute input/output paths:

   ```sh
   node scripts/svg-to-scene.mjs --svg /absolute/path/diagram.svg --out /absolute/path/scene.json
   node scripts/validate-scene.mjs --scene /absolute/path/scene.json
   # Add --expected-language zh (or the requested script) when appropriate.
   ```

   Fix conversion diagnostics. Schema validation alone does not prove visual or semantic quality.
7. **Open and inspect the actual scene.**

   ```sh
   node scripts/open-editor.mjs --scene /absolute/path/scene.json
   ```

   Each call starts a fresh local URL/port; use a new call for a regenerated canvas or alternative.
   Inspect at overview and readable zoom. Trace branches, joins and feedback; check text, spacing,
   contrast and visual hierarchy. For bound diagrams, move a representative node and confirm its
   label and connected endpoints follow; undo the test. Fix SVG, reconvert and revalidate. Inspect
   the final editor/export after corrections, not just the source SVG.
8. **Deliver.** Give the printed local URL and usable artifact files. Mention Chinese/English UI,
   refresh-safe local autosave and PNG/SVG export. State material limitations if verification could
   not be completed. Offer alternatives when useful, without making them an extra workflow step.

## References

- [CATALOG.md](CATALOG.md): 35 visual references; no default style or default level.
- [STYLE_PROFILES.md](STYLE_PROFILES.md): comparative visual dimensions, not topology constraints.
- [RULES.md](RULES.md): supported SVG subset, binding attributes and conversion limitations.
- [rules/style-selection.md](rules/style-selection.md): autonomous selection and variation.
- [rules/analysis-prompt.md](rules/analysis-prompt.md): content and semantic relationships.
- [rules/visualization-strategy.md](rules/visualization-strategy.md): spatial composition and review.
- [rules/canvas-rules.md](rules/canvas-rules.md): scene and verification invariants.

For maintainers: `node --test scripts/test-converter.mjs` runs portable conversion regressions.
