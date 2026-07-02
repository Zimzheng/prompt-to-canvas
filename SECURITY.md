# Security Policy

## Supported Versions

Only the latest version on the default branch is maintained.

## Dependency Audits

Run the following before publishing a GitHub release:

```bash
npm audit
```

This project uses npm `overrides` to patch vulnerable transitive dependencies
from the bundled editor stack while keeping the direct editor dependency stable.
Do not remove an override unless:

1. `npm audit` remains clean after the change.
2. `npm run build:skill` succeeds.
3. `npm run preflight` succeeds.

## Reporting Issues

Please open a private security advisory on GitHub if the repository is hosted
there. If private advisories are unavailable, contact the maintainer privately
before disclosing exploitable issues publicly.

## Data Handling

Prompt to Canvas is designed for local generation and local editing. The bundled
editor loads scene JSON from the local `open-editor.mjs` server or from encoded
URL data, and browser autosave uses local storage. The project does not include
a hosted backend.
