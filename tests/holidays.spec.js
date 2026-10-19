const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

// Runs against the LOCAL files (not the live site), so it checks this commit
// even before the GitHub Pages deploy finishes.
const APP_FILE = pathToFileURL(path.resolve('index.html')).href;

test('holiday calendar covers 2026-2030, Shabbat-moved days land right', async ({ page }) => {
  await page.goto(APP_FILE);
  const r = await page.evaluate(() => ({
    covered: ['2026-01', '2028-01', '2029-06', '2030-12'].map((m) => window.monthHasHolidayData(m)),
    notCovered: ['2025-12', '2031-01'].map((m) => window.monthHasHolidayData(m)),
    // 2028: 5 Iyar falls on a Monday -> Yom HaZikaron Mon, Yom Ha'atzmaut Tue
    zikaron2028: window.dayRule('2028-05-01').potential,
    atzmaut2028: window.dayRule('2028-05-02').potential,
    // 2029: 5 Iyar falls on a Friday -> moved back to Wed / Thu
    zikaron2029: window.dayRule('2029-04-18').potential,
    atzmaut2029: window.dayRule('2029-04-19').potential,
    plain2029: window.dayRule('2029-04-17').potential,
    cholhamoed2030: window.dayRule('2030-10-15').mult,
  }));
  expect(r.covered).toEqual([true, true, true, true]);
  expect(r.notCovered).toEqual([false, false]);
  expect([r.zikaron2028, r.atzmaut2028]).toEqual([4, 0]);
  expect([r.zikaron2029, r.atzmaut2029]).toEqual([4, 0]);
  expect(r.plain2029).toBe(8);
  expect(r.cholhamoed2030).toBe(0.625);
});

test('a month past the holiday calendar shows the red line', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2031-03-15T10:00:00'));
  await page.goto(APP_FILE);
  // Fresh user lands on the hours tab with the current month picked.
  await expect(page.locator('#hoursMonth')).toHaveValue('2031-03');
  const line = page.locator('#holidayMissingHours');
  await expect(line).toBeVisible();
  await expect(line).toContainText('חסרים נתוני חגים');
  await page.selectOption('#hoursMonth', '2030-03');
  await expect(line).toBeHidden();
  await page.selectOption('#hoursMonth', '2031-03');
  await expect(line).toBeVisible();
});

test('an old save that still has sharedLocked loads fine', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'premiot_clinics_v2',
      JSON.stringify({
        isVetek: '0',
        shaPotential: '150',
        avgShnati: '1.1',
        selectedMonth: 'אוקטובר 2026',
        clinics: [{ id: 'c_old', name: 'ישנה', shaTeken: '120', tifukot: '150', expanded: true }],
        sharedLocked: true,
      }),
    );
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(APP_FILE);
  await expect(page.locator('#shaPotential')).toHaveValue('150');
  // The old lock froze the shared strip (pointer-events: none); it must stay usable.
  await expect(page.locator('#sharedStrip')).not.toHaveClass(/locked/);
  await expect(page.locator('#avgShnati')).toBeEditable();
  await expect(page.locator('#avgShnati')).not.toHaveCSS('pointer-events', 'none');
  await expect(page.locator('[data-clinic-name]').first()).toHaveValue('ישנה');
  expect(errors).toEqual([]);
});
