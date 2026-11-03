#!/usr/bin/env node

console.error(
  [
    "[Prompt to Canvas] scripts/build-scene.mjs has been retired.",
    "Use the current content-led SVG-to-Excalidraw workflow instead:",
    "  1. compose diagram.svg using SKILL.md, RULES.md and the selected visual direction",
    "  2. node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json",
    "  3. node scripts/validate-scene.mjs --scene scene.json",
    "  4. node scripts/open-editor.mjs --scene scene.json",
  ].join("\n"),
);

process.exit(1);
