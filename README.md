# premiotAllison-v2

מחשבון פרמיות כללית — דור שני.

## What this is

THE premiot calculator — the one app every OT uses. Started as a fork of
[premiotAllison (v1)](https://github.com/allisonecalt-sudo/premiotAllison).

- **Live:** https://allisonecalt-sudo.github.io/premiotAllison-v2/
- **v1 archived 2026-10-19:** its address (https://allisonecalt-sudo.github.io/premiotAllison/)
  now forwards here, so the OTs' old links keep working. v1 users' saved data
  carries over on first load (same site; `loadFromStorage` / `loadHoursState`
  migrate `premiot_data` + `premiot_hours`) — keep that migration code. The old
  v1 app is at tag `v1-final` in the v1 repo.

## What's decided

- One app. Every change goes here; v1 is archived (Allison's call, 2026-10-19).
- Holiday calendar runs through 2030 (`HOLIDAYS` in app.js, checked against
  hebcal in Israel mode). A month past it shows a red line. To extend: add the
  next year's dates, then raise `HOLIDAY_YEAR_TO`. Election days go in by hand.
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
