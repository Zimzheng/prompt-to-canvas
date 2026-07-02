# Notices and Attribution

Prompt to Canvas is released under the MIT License. This file documents the
main upstream projects and bundled assets that should be understood before
publishing or redistributing this repository.

## Upstream Skill Inspiration

This project includes design-system concepts, style catalogue structure, and
style assets derived from or inspired by:

- `beautiful-feishu-whiteboard`
- Repository: https://github.com/zarazhangrui/beautiful-feishu-whiteboard
- License: MIT
- Copyright: Copyright (c) 2026 Zara Zhang (@zarazhangrui)

The original upstream license text is preserved at
`src/skills/prompt-to-canvas/LICENSE.beautiful-feishu-whiteboard`.

Prompt to Canvas changes the output target from Feishu/Lark whiteboards to a
local Excalidraw-based editor. The Feishu/Lark CLI workflow is not required for
this project.

## Editor Runtime

The bundled editor is built from the following npm dependencies:

- `@excalidraw/excalidraw` - MIT License
- `react` - MIT License
- `react-dom` - MIT License
- `vite` - MIT License
- `@vitejs/plugin-react` - MIT License

The exact dependency versions are recorded in `package-lock.json`.

Security overrides for vulnerable transitive dependencies are recorded in
`package.json` under `overrides`. Keep these overrides unless a future upstream
editor release removes the need for them and `npm audit` remains clean.

## Bundled Build Artifacts

`src/skills/prompt-to-canvas/assets/editor/` contains a prebuilt static editor
runtime so the skill can run without requiring every user to rebuild the editor.
It should be refreshed with:

```bash
npm run build:skill
```

`src/static/` is a local build output directory and is intentionally ignored by
git. Do not publish both `src/static/` and the bundled skill runtime, because
that duplicates the same editor assets.

## Style Preview Images

`src/skills/prompt-to-canvas/assets/styles/` contains 35 PNG style previews.
They are documentation and style-selection aids for agents and users; they are
not required by the editor runtime.
