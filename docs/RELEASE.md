# Release Strategy

This repository should be published as a source repository plus one bundled
skill runtime. The goal is to keep the GitHub repository installable without
shipping duplicate build output.

## What To Commit

Commit these paths:

- `src/skills/prompt-to-canvas/` - the distributable skill, including one clean
  copy of the prebuilt editor runtime in `assets/editor/`
- `src/editor/` - editor source code
- `docs/` - product, technical, user, and release documentation
- `scripts/` - deployment helper scripts
- `package.json` and `package-lock.json` - reproducible editor builds
- `LICENSE` and `NOTICE.md` - license and attribution records

Do not commit these paths:

- `node_modules/`
- `src/static/`
- `.local/`
- `docs/superpowers/`
- temporary scene files such as `tmp-*.json` or `*.tmp`

## Size Policy

The expected repository payload after cleanup is:

- Skill package: about 14 MB
- Bundled editor runtime: about 8 MB
- Style preview images: about 5 MB

If `src/skills/prompt-to-canvas/assets/editor/` grows far beyond the clean
`src/static/` build size, it probably contains stale hashed build files. Refresh
it with:

```bash
npm run build:skill
```

## Release Flow

1. Install dependencies from the lockfile.

```bash
npm ci
```

2. Rebuild and sync the bundled skill editor runtime.

```bash
npm run build:skill
```

3. Run the skill preflight check.

```bash
npm run preflight
```

4. Run dependency security audit.

```bash
npm audit
```

5. Check size and ignored files.

```bash
du -sh src/skills/prompt-to-canvas src/skills/prompt-to-canvas/assets/editor
git status --short --ignored
```

6. Create a git tag for the release.

```bash
git tag v1.1.0
```

7. Publish the repository to GitHub.

8. Optional: attach a release zip containing only the skill directory.

```bash
git archive --format zip --prefix prompt-to-canvas/ \
  -o prompt-to-canvas-skill-v1.1.0.zip \
  HEAD:src/skills/prompt-to-canvas
```

## GitHub Positioning

Use this repository description:

> Agent skill for turning content into polished editable Excalidraw canvases.

Recommended topics:

- `agent-skill`
- `codex`
- `claude-code`
- `excalidraw`
- `visualization`
- `svg`
- `infographic`

## Compliance Checklist

Before every public release:

- Root `LICENSE` exists and matches the README claim.
- `NOTICE.md` mentions upstream skill inspiration and editor dependencies.
- `src/static/` is not committed.
- `node_modules/` is not committed.
- `.local/` and `docs/superpowers/` are not committed.
- `npm run build:skill` has been run after editor changes.
- `npm run preflight` passes.
- `npm audit` reports 0 vulnerabilities, or any remaining finding is documented
  in `SECURITY.md` with a concrete mitigation plan.
- README install instructions match the current supported agent paths.
