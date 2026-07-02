#!/usr/bin/env node

console.error(
  [
    "[Prompt to Canvas] scripts/build-scene.mjs has been retired.",
    "Use the upstream Beautiful Feishu Whiteboard SVG-first flow instead:",
    "  1. compose diagram.svg from CATALOG.md, RULES.md, and templates/<slug>/design.md",
    "  2. node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json",
    "  3. node scripts/validate-scene.mjs --scene scene.json",
    "  4. node scripts/open-editor.mjs --scene scene.json",
  ].join("\n"),
);

process.exit(1);
