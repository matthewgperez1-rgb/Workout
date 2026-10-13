import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const url = process.env.TRAINING_LOG_URL || 'https://matthewgperez1-rgb.github.io/Workout/';
assert.equal(new URL(url).origin, 'https://matthewgperez1-rgb.github.io');
assert.equal(new URL(url).pathname, '/Workout/');
const release = process.env.GITHUB_SHA || 'release';
await mkdir('qa-production', { recursive: true });
const browser = await chromium.launch({ headless: true });
async function files(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) result.push(...await files(file));
    else result.push(file);
  }
  return result;
}
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'America/New_York', serviceWorkers: 'allow', extraHTTPHeaders: { 'Cache-Control': 'no-cache' } });
  for (const file of await files('dist')) {
    const relative = file.slice('dist/'.length).split(path.sep).join('/');
    const response = await context.request.get(new URL(relative + '?release=' + release, url).href);
    assert.equal(response.status(), 200, relative + ' response');
    assert.deepEqual(await response.body(), await readFile(file), relative + ' source mismatch');
  }
  console.log('Every published asset matches the tested source byte-for-byte.');
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url + '?release=' + release, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').innerText(), 'Today');
  await page.screenshot({ path: 'qa-production/live-today-390.png', fullPage: true });
  for (const name of ['Plan', 'History', 'Progress', 'Library']) {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name, exact: true }).click();
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok(await page.locator('main').isVisible());
    const bounds = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(bounds.scroll <= bounds.width + 1, name + ' overflow');
    await page.screenshot({ path: 'qa-production/live-' + name.toLowerCase() + '-390.png', fullPage: true });
  }
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  assert.match(await page.locator('main').innerText(), /3\.0\.0/);
  await page.screenshot({ path: 'qa-production/live-settings-390.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Production navigation, version, mobile layout and JavaScript smoke checks passed.');
  console.log('Verified production URL: ' + url);
  await context.close();
} finally {
  await browser.close();
}
