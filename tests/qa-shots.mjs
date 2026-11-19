// End-to-end QA + screenshot run for the GTA VI trophy guide.
// Run: node tests/qa-shots.mjs  (exit 0 = all checks pass)
// Uses the Playwright library in ~/pw-install (bundled Chromium) — the
// Playwright MCP server tools are not exposed in this session, so the
// library drives the same Chromium binary instead. Every shot is a real
// render of the app served over local HTTP by the kit's serve.ts.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire('/home/hatch/pw-install/package.json');
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const shotsDir = join(root, 'screenshots');
const PORT = 8123;
const BASE = `http://localhost:${PORT}/`;

mkdirSync(shotsDir, { recursive: true });

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: root, stdio: 'pipe' });
const waitReady = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('serve.ts did not start')), 15000);
  server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(timer); resolve(); } });
  server.stderr.on('data', (d) => process.stderr.write(d));
});
await waitReady;

const results = [];
function check(label, fn) {
  try { fn(); results.push(['PASS', label]); console.log('ok -', label); }
  catch (e) { results.push(['FAIL', `${label}: ${e.message}`]); console.log('FAIL -', label, '-', e.message); }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
const page = await context.newPage();
const externalRequests = [];
page.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://localhost:8123')) externalRequests.push(u); });
page.on('pageerror', (e) => results.push(['FAIL', `pageerror: ${e.message}`]));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-trophy-name]');

const cardCount = await page.locator('[data-trophy-name]').count();
check('55 trophy cards render', () => assert.equal(cardCount, 55));
check('progress starts at 0 of 55', async () => {
  assert.match(await page.locator('#progress').innerText(), /0 of 55 earned/);
});
check('no external network requests on load', () => assert.deepEqual(externalRequests, []));

// --- readback: toggle a trophy, reload, it stays ticked ---
await page.locator('[data-trophy-name="Cunning Stunts"] input[type="checkbox"]').check();
await page.locator('[data-trophy-name="Whip It Good"] input[type="checkbox"]').check();
await page.locator('[data-trophy-name="Treat Yo Self"] input[type="checkbox"]').check();
let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gta6-trophy-guide-progress-v1')));
check('localStorage holds the 3 ticked trophies', () => {
  assert.deepEqual([...stored].sort(), ['Cunning Stunts', 'Treat Yo Self', 'Whip It Good']);
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-trophy-name]');
check('after reload the 3 trophies are still ticked (readback)', async () => {
  assert.equal(await page.locator('[data-trophy-name="Cunning Stunts"] input[type="checkbox"]').isChecked(), true);
  assert.match(await page.locator('#progress').innerText(), /3 of 55 earned/);
});

// --- export: download the file, read it back ---
const downloadPromise = page.waitForEvent('download');
await page.locator('#export').click();
const download = await downloadPromise;
const exportPath = '/tmp/gta6-export-check.json';
await download.saveAs(exportPath);
const exported = JSON.parse(readFileSync(exportPath, 'utf-8'));
check('export file contains the 3 earned trophies', () => {
  assert.deepEqual([...exported].sort(), ['Cunning Stunts', 'Treat Yo Self', 'Whip It Good']);
});

// --- import: clear, then import a 2-name file ---
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-trophy-name]');
writeFileSync('/tmp/gta6-import-check.json', JSON.stringify(['A Long Road', 'Little Boxes']));
await page.locator('#import').setInputFiles('/tmp/gta6-import-check.json');
await page.waitForFunction(() => document.getElementById('progress').textContent.includes('2 of 55'));
check('import round-trip: 2 trophies earned after import (readback)', async () => {
  assert.equal(await page.locator('[data-trophy-name="A Long Road"] input[type="checkbox"]').isChecked(), true);
  assert.equal(await page.locator('[data-trophy-name="Little Boxes"] input[type="checkbox"]').isChecked(), true);
});

// --- filters ---
await page.locator('#grade').selectOption('silver');
check('grade filter silver shows 6', async () => assert.equal(await page.locator('[data-trophy-name]').count(), 6));
await page.locator('#grade').selectOption('all');
await page.locator('#kind').selectOption('story');
check('kind filter story shows 12', async () => assert.equal(await page.locator('[data-trophy-name]').count(), 12));
await page.locator('#kind').selectOption('all');
await page.locator('#missable-only').check();
check('missable-only shows 1', async () => assert.equal(await page.locator('[data-trophy-name]').count(), 1));
check('missable card is Positive Mental Attitude', async () => {
  assert.equal(await page.locator('[data-trophy-name]').first().getAttribute('data-trophy-name'), 'Positive Mental Attitude');
});
await page.locator('#missable-only').uncheck();
await page.locator('#search').fill('stunt');
const searchCount = await page.locator('[data-trophy-name]').count();
check('search "stunt" narrows the list', () => assert.ok(searchCount >= 1 && searchCount < 55, `got ${searchCount}`));
await page.locator('#search').fill('');
await page.locator('#earned-only').check();
check('earned-only shows the 2 imported trophies', async () => assert.equal(await page.locator('[data-trophy-name]').count(), 2));
await page.locator('#earned-only').uncheck();

// --- spoiler: on by default, 28 masked; off reveals all ---
check('spoiler on masks 28 hidden trophies', async () => {
  assert.equal(await page.locator('.trophy-name', { hasText: 'Hidden trophy' }).count(), 28);
});
await page.locator('#spoiler').uncheck();
check('spoiler off masks none', async () => {
  assert.equal(await page.locator('.trophy-name', { hasText: 'Hidden trophy' }).count(), 0);
});
await page.locator('#spoiler').check();

// --- tabs ---
await page.locator('#tab-roadmap').click();
check('roadmap view shows the 3 steps', async () => {
  assert.equal(await page.locator('#view-roadmap .steps li').count(), 3);
  assert.match(await page.locator('#view-roadmap').innerText(), /Only one trophy may be missable/);
});
await page.locator('#tab-sources').click();
check('sources view lists cited sources with links', async () => {
  assert.ok((await page.locator('#source-list a').count()) >= 2);
});
await page.locator('#tab-guide').click();

// --- screenshots (real renders; states built by real clicks above) ---
async function shot(file, setup) {
  await setup();
  await page.waitForTimeout(300);
  const buf = await page.screenshot({ type: 'jpeg', quality: 80 });
  writeFileSync(join(shotsDir, file), buf);
  const size = statSync(join(shotsDir, file)).size;
  console.log(`shot ${file}: ${size} bytes`);
  return size;
}

// 1 — cover: spoiler off, 3 earned, guide open with sources, filters visible
const s1 = await shot('1-cover-guide.jpg', async () => {
  await page.locator('#spoiler').uncheck();
  await page.evaluate(() => window.scrollTo(0, 0));
});
// 2 — roadmap
const s2 = await shot('2-roadmap.jpg', async () => {
  await page.locator('#tab-roadmap').click();
  await page.evaluate(() => window.scrollTo(0, 0));
});
// 3 — spoiler + export/import: story filter + spoiler on, so the whole
// list reads as masked "Hidden trophy" cards with the toolbar in frame
const s3 = await shot('3-spoiler-export.jpg', async () => {
  await page.locator('#tab-guide').click();
  await page.locator('#spoiler').check();
  await page.locator('#kind').selectOption('story');
  await page.evaluate(() => window.scrollTo(0, 0));
});
// 4 — missable-only filter on the one missable trophy
const s4 = await shot('4-missable-guide.jpg', async () => {
  await page.locator('#kind').selectOption('all');
  await page.locator('#missable-only').check();
  await page.evaluate(() => window.scrollTo(0, 0));
});
for (const [file, size] of [['1-cover-guide.jpg', s1], ['2-roadmap.jpg', s2], ['3-spoiler-export.jpg', s3], ['4-missable-guide.jpg', s4]]) {
  check(`screenshot ${file} is <=256 KiB`, () => assert.ok(size <= 262144, `${size} bytes`));
}

await browser.close();
server.kill();

const failures = results.filter(([s]) => s === 'FAIL');
console.log(`\n${results.length - failures.length}/${results.length} QA checks passed`);
if (failures.length > 0) { console.log('FAILURES:'); for (const [, m] of failures) console.log(' -', m); process.exit(1); }
