#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SKILL_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

fail() {
  printf 'Prompt to Canvas preflight failed: %s\n' "$1" >&2
  exit 1
}

need_file() {
  [ -f "$SKILL_ROOT/$1" ] || fail "missing $1"
}

need_dir() {
  [ -d "$SKILL_ROOT/$1" ] || fail "missing $1"
}

command -v node >/dev/null 2>&1 || fail "Node.js is not installed"

NODE_MAJOR=$(node -p "Number(process.versions.node.split('.')[0])")
[ "$NODE_MAJOR" -ge 20 ] || fail "Node.js 20 or newer is required; found $(node -p process.versions.node)"

need_file "SKILL.md"
need_file "CATALOG.md"
need_file "RULES.md"
need_file "scripts/svg-to-scene.mjs"
need_file "scripts/validate-scene.mjs"
need_file "scripts/open-editor.mjs"
need_file "assets/editor/index.html"
need_file "assets/editor/editor-bridge.js"
need_dir "templates"
need_dir "assets/styles"

TEMPLATE_COUNT=$(find "$SKILL_ROOT/templates" -mindepth 2 -maxdepth 2 -name design.md | wc -l | tr -d ' ')
STYLE_COUNT=$(find "$SKILL_ROOT/assets/styles" -maxdepth 1 -name '*.png' | wc -l | tr -d ' ')

[ "$TEMPLATE_COUNT" -eq 35 ] || fail "expected 35 template design files, found $TEMPLATE_COUNT"
[ "$STYLE_COUNT" -eq 35 ] || fail "expected 35 style preview images, found $STYLE_COUNT"

printf 'Prompt to Canvas preflight OK\n'
