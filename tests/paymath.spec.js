// Pay-math regression test — runs against the LOCAL files, so a wrong ₪ is
// caught before deploy, not after. Ground truth = official Clalit premia
// pages (פרוט תגמולי פרמיה), anonymized: hours + treatments only, no names/IDs.
// Source of every expected number: second-brain projects/clalit/premiot/
// two-machon-2026-06-10.md (2026-09-16 and 2026-11-01 verification sections).
/* global __dirname */
const { test, expect } = require('@playwright/test');
const path = require('path');

const APP = 'file://' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function fresh(page) {
  await page.goto(APP);
  await page.evaluate(() => localStorage.clear());
  await page.goto(APP);
}

// Official blocks. tifukot = RAW (the app doubles them; makdam 2).
// teken = שעות עבודה (PDF, without עודפות) + שלט + מזכה + לא מזכה.
const OFFICIAL = [
  {
    name: 'worker A, one clinic, work month 06/2026',
    c: { w: 74.02, nosfot: 1.67, shalat: 11, mz: 3, lmz: 15, tif: 68 },
    pot: 176,
    avg: 0.93,
    want: { pct: 51, takara: 2754, mecane: 75.69, hours: 86.69, avgPay: 0.8, total: 2754 },
  },
  {
    name: 'worker B merged, 04/2026',
    c: { w: 44.96, nosfot: 0.02, shalat: 13, mz: 15.38, lmz: 0, tif: 45 },
    pot: 135,
    avg: 0.6,
    want: { takara: 2916, avgPay: 1, total: 2721.25 },
  },
  {
    name: 'worker B split clinic 1, 05/2026',
    c: { w: 18.25, nosfot: 0, shalat: 6, mz: 0, lmz: 8, tif: 25 },
    pot: 164,
    avg: 0.68,
    want: { takara: 810, avgPay: 1, total: 810 },
  },
  {
    name: 'worker B split clinic 2, 05/2026',
    c: { w: 42.27, nosfot: 0.03, shalat: 17, mz: 0, lmz: 0, tif: 43 },
    pot: 164,
    avg: 0.68,
    want: { takara: 1944, avgPay: 1, total: 1944 },
  },
  {
    name: 'worker B merged, 06/2026',
    c: { w: 58.36, nosfot: 0.02, shalat: 8, mz: 2.73, lmz: 18.9, tif: 54 },
    pot: 176,
    avg: 0.73,
    want: { takara: 2106, avgPay: 0.85, total: 2106 },
  },
  {
    name: 'worker B merged, 07/2026',
    c: { w: 79.05, nosfot: 0.08, shalat: 12, mz: 12, lmz: 0, tif: 73 },
    pot: 176,
    avg: 0.75,
    want: { takara: 3186, avgPay: 0.85, total: 3186 },
  },
];

for (const o of OFFICIAL) {
  test(`engine matches the official page: ${o.name}`, async ({ page }) => {
    await fresh(page);
    const r = await page.evaluate((o) => {
      const c = {
        shaTeken: o.c.w + o.c.shalat + o.c.mz + o.c.lmz,
        shaNosfot: o.c.nosfot,
        shaLaTipulit: o.c.shalat,
        headrutMazaka: o.c.mz,
        headrutLoMazaka: o.c.lmz,
        tifukot: o.c.tif,
      };
      // eslint-disable-next-line no-undef
      return calcClinic(c, o.pot, 5400, o.avg, 40.49, 2);
    }, o);
    expect(r.takaraClinic).toBeCloseTo(o.want.takara, 2);
    expect(r.avgTipulim).toBeCloseTo(o.want.avgPay, 2);
    expect(r.totalClinic).toBeCloseTo(o.want.total, 1);
    if (o.want.pct) expect(Math.round(r.mishraPct * 100)).toBe(o.want.pct);
    if (o.want.mecane) expect(r.mecane).toBeCloseTo(o.want.mecane, 2);
    if (o.want.hours) expect(r.totalHoursLeTashlum).toBeCloseTo(o.want.hours, 2);
  });
}

test('two clinics: נפרד and מאוחד totals, and the switch drives the headline', async ({ page }) => {
  await fresh(page);
  await page.evaluate(() => {
    /* eslint-disable no-undef */
    switchTab('calc');
    addClinic();
    document.getElementById('shaPotential').value = '164';
    document.getElementById('avgShnati').value = '0.68';
    Object.assign(clinics[0], {
      shaTeken: 32.25,
      shaLaTipulit: 6,
      headrutLoMazaka: 8,
      tifukot: 25,
    });
    Object.assign(clinics[1], { shaTeken: 59.27, shaNosfot: 0.03, shaLaTipulit: 17, tifukot: 43 });
    calc();
    /* eslint-enable no-undef */
  });
  const sw = await page.locator('#methodSwitch').innerText();
  expect(sw).toContain('נפרד');
  expect(sw).toContain('מאוחד');
  // Official May 2026: split 810 + 1944 = 2754; merged gives the same (51%)
  expect(await page.locator('#r_total_sticky').innerText()).toContain('2,754.00');
  await page.locator('.ms-btn', { hasText: 'מאוחד' }).click();
  expect(await page.locator('#r_total_label').innerText()).toContain('מאוחד');
  expect(await page.locator('#r_total_sticky').innerText()).toContain('2,754.00');
});

test('planner premium equals the calculator, to the agora', async ({ page }) => {
  await fresh(page);
  // The case that used to differ by ₪40.49 (average 0.27 vs 0.28)
  const r = await page.evaluate(() => {
    /* eslint-disable no-undef */
    document.getElementById('shaPotential').value = '176';
    document.getElementById('avgShnati').value = '0.7';
    Object.assign(clinics[0], { shaTeken: 100, shaLaTipulit: 20, tifukot: 51 });
    calc();
    switchTab('notfuka');
    return calcClinic(clinics[0], 176, 5400, 0.7, 40.49, 2);
    /* eslint-enable no-undef */
  });
  const txt = await page.locator('#noTfukaResults').innerText();
  const shown = txt.match(/פרמיית עבודה משוערת:\s*‏?([\d,]+\.\d\d)/);
  expect(shown).not.toBeNull();
  expect(parseFloat(shown[1].replace(/,/g, ''))).toBeCloseTo(r.premiatAvoda, 2);
});

test('"add N תפוקות" advice actually reaches the cap', async ({ page }) => {
  await fresh(page);
  const misses = await page.evaluate(() => {
    /* eslint-disable no-undef */
    document.getElementById('shaPotential').value = '176';
    document.getElementById('avgShnati').value = '0.8';
    const out = [];
    for (const teken of [70, 85, 100, 120]) {
      for (const shalat of [5, 12, 20]) {
        for (const tif of [35, 45, 55, 65]) {
          Object.assign(clinics[0], { shaTeken: teken, shaLaTipulit: shalat, tifukot: tif });
          calc();
          const m = document
            .getElementById('suggestArea')
            .innerText.match(/הוסיפי\s+(\d+)\s+תפוקות/);
          if (!m) continue;
          const after = calcClinic(
            { ...clinics[0], tifukot: tif + Number(m[1]) },
            176,
            5400,
            0.8,
            40.49,
            2,
          );
          if (after.totalClinic < after.takaraClinic - 0.5) out.push({ teken, shalat, tif });
        }
      }
    }
    return out;
    /* eslint-enable no-undef */
  });
  expect(misses).toEqual([]);
});

test('storage blocked: page still renders a clinic card', async ({ browser }) => {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(APP);
  expect(await page.locator('[data-clinic-card]').count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await ctx.close();
});
