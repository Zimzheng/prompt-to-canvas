# Prompt to Canvas

[简体中文](README.md) | [English](README.en.md)

**Turn notes, project stories, and technical plans into Excalidraw canvases you can keep editing.**

A skill package for AI coding agents such as Codex and Claude Code. The agent organizes your content, chooses a visual direction from **35 styles**, composes a layout, and opens it in the bundled local editor. Edit text, shapes, and connectors, then export PNG or SVG.

[Install](#install) · [Browse styles](src/skills/prompt-to-canvas/CATALOG.md) · [Read the workflow](src/skills/prompt-to-canvas/SKILL.md)

## Visual preview

[![Soft Editorial style preview: a three-column explanation of LLM training](src/skills/prompt-to-canvas/assets/styles/soft-editorial.png)](src/skills/prompt-to-canvas/templates/soft-editorial/design.md)

This is the repository's **Soft Editorial style example**, showing its palette and information hierarchy, rather than an editor screenshot. Click it to read the style rules. The [full catalogue](src/skills/prompt-to-canvas/CATALOG.md) covers 35 styles across restrained, balanced, and bold visual directions.

## What you can make

| Your content | Canvas ideas |
| --- | --- |
| Project stories and product cases | Portfolio boards, reviews, results summaries |
| System modules, processes, technical plans | Architecture diagrams, flowcharts, concept maps |
| Milestones and release plans | Roadmaps and timelines |
| Metrics and before/after changes | Metric boards and comparisons |

- **Editable output**: SVG layouts become native Excalidraw text and shapes.
- **Content-driven composition**: styles supply visual rules; the agent decides the narrative, grouping, hierarchy, and connections.
- **Bundled local editor**: a prebuilt runtime is included, so ordinary installation needs no frontend dependency setup.
- **Ready to share**: Chinese/English editor UI, browser-local autosave, and PNG/SVG export.

## Install

You need **Git, Node.js 20+**, and an agent environment that can read skill files and execute local commands. These commands use a macOS/Linux shell.

Get the repository:

```bash
git clone https://github.com/Zimzheng/prompt-to-canvas.git
cd prompt-to-canvas
```

Run one of the following, depending on your agent:

**Codex**

```bash
mkdir -p ~/.codex/skills
cp -R src/skills/prompt-to-canvas ~/.codex/skills/
sh ~/.codex/skills/prompt-to-canvas/scripts/preflight.sh
```

**Claude Code**

```bash
mkdir -p ~/.claude/skills
cp -R src/skills/prompt-to-canvas ~/.claude/skills/
sh ~/.claude/skills/prompt-to-canvas/scripts/preflight.sh
```

A successful check prints `Prompt to Canvas preflight OK`. Start a new agent session and explicitly name `prompt-to-canvas`.

The repository also provides `bash scripts/deploy.sh`, targeting Codex by default; set `SKILLS_DIR` to choose another skill directory. The helper synchronizes files and deletes extra files inside the target skill directory, so back up local changes before updating. Follow the skill's local HTTP startup workflow to use the editor.

## First canvas

Tell the agent your content, purpose, and preferred style:

```text
Use prompt-to-canvas to turn this fictional project plan into an editable roadmap.
Audience: product review. Style: clean and professional. Use English canvas text.

Project: Team knowledge assistant
Phase 1: Organize documents and build a search index.
Phase 2: Add question answering with source citations.
Phase 3: Collect feedback and improve answer quality.
Highlight each phase's goal and deliverable.
```

This is a fictional example. Replace it with your notes, architecture description, or project review.

The agent confirms purpose and style, builds SVG, converts and validates the scene, and provides a local editor link. Open it, edit the text and shapes, and use the **PNG / SVG** buttons to export.

```text
Content and purpose → Information structure and style → SVG composition
                    → Editable Excalidraw scene → Local editing → PNG / SVG
```

The skill relies on the agent for analysis and composition. It is not a standalone text-to-diagram service. Keep the local editor process running while using its link.

## Saving and privacy

The editor runs through a local HTTP server and autosaves the current scene in browser `localStorage`. Do not rely on an old autosave after clearing browser data, switching browsers, or opening a new canvas link. Export files to retain your results.

The local editor and the agent service are separate parts of the workflow. Content you send to the agent remains subject to your model provider's and runtime's data policies. Multiplayer collaboration is not integrated; PNG and SVG are the implemented export formats.

## Development and validation

Ordinary installation uses the bundled editor. Install npm dependencies when changing the editor source:

```bash
npm ci
npm run dev
```

Build the editor and synchronize it into the distributable skill package:

```bash
npm run build:skill
npm run preflight
```

Editor source lives in `src/editor/`; the distributable package lives in `src/skills/prompt-to-canvas/`. `src/static/` is a Git-ignored build directory; the distributable runtime is the skill's `assets/editor/` directory.

Report problems through [Issues](https://github.com/Zimzheng/prompt-to-canvas/issues), or submit a Pull Request improving styles, rules, scripts, or the editor. After editor changes, rebuild and synchronize the runtime, then check generation, editing, and export.

## Documentation

| Document | Contents |
| --- | --- |
| [Skill entry point](src/skills/prompt-to-canvas/SKILL.md) | Current prerequisites and generation/validation workflow |
| [Style catalogue](src/skills/prompt-to-canvas/CATALOG.md) | Mood, formality, and palettes for 35 styles |
| [Drawing rules](src/skills/prompt-to-canvas/RULES.md) | SVG composition constraints |
| [Release guide](docs/RELEASE.md) | Release checks and package size policy |
| [Security policy](SECURITY.md) | Reporting security issues |

The `docs/` directory also retains product, technical, and API design documents. For current behavior, follow the skill entry point and code.

## License and acknowledgements

[MIT licensed](LICENSE). The editor builds on Excalidraw, React, and Vite; the visual system draws inspiration from `beautiful-feishu-whiteboard`. See [NOTICE.md](NOTICE.md) for third-party attribution and license notes.
