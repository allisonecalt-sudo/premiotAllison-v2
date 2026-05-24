# premiotAllison-v2

מחשבון פרמיות כללית — דור שני.

## What this is

A working fork of [premiotAllison (v1)](https://github.com/allisonecalt-sudo/premiotAllison) used as the staging ground for the next-generation premiot calculator. v1 stays live and unchanged for the OTs who depend on it; v2 is where the upgrade happens.

- **v1 live:** https://allisonecalt-sudo.github.io/premiotAllison/
- **v2 live:** https://allisonecalt-sudo.github.io/premiotAllison-v2/

## What's decided

- Separate repo, separate deploy. Zero risk to v1.
- Calculator logic, HTML, CSS forked as-is from v1 — v2 starts in a working state.
- TypeScript strict scaffold added. New code is TS; existing `app.js` migrates incrementally as features touch it.

## What's built

Inherited from v1: index.html, styles.css, app.js, ESLint, Prettier, Playwright, GitHub Actions CI.

New in v2 setup: TypeScript (strict, noUncheckedIndexedAccess), `npm run typecheck`, consolidated CI workflow, GitHub Pages deploy workflow.

## What's next

Upgrade spec — TBD. Allison will dump requirements.

## Local dev

```bash
npm install
npm run lint
npm run format
npm run typecheck
npm test
```

Open `index.html` in a browser to use the app locally (no build step yet).

## Links

- v1 repo: https://github.com/allisonecalt-sudo/premiotAllison
- Private project notes: `second-brain/projects/clalit/premiot/` (if/when created)
