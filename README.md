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

- Two-machon arc (2026-06-10): Clalit's premia reports flip between computing
  each machon separately and pooling everything under one machon — and the
  methods pay differently when one machon is below the 1.0 average gate.
  Shipped: together-vs-separate comparison card (calc tab, appears with 2+
  clinics). Possible follow-up: a compare-to-official-report view (paste what
  the PDF credited, flag vanished treatments).
- "שעות בלי תפוקה" tab (Hagit's idea, shipped 2026-06-10): reverse calculator —
  enter the hours that don't produce (שלט + absences) and learn how many hours
  are judged, the 50% shalat cap, and how many tfukot the month demands.
- Known quirk: Clalit rounds the payment average to 2 decimals before
  multiplying; the app keeps full precision (differences of a few ₪).

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
