// Takes this entry's 4 screenshots: serves app/ locally, seeds 13 earned
// trophies into localStorage (the way a real player would look part-way
// through), opens each view, and saves a JPEG at 1280x800. Also reports
// console errors and any request that leaves the local server.
import { chromium } from '/home/hatch/workspace/makefun/tools/shot/node_modules/playwright-core/index.mjs';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const entry = dirname(fileURLToPath(import.meta.url));
const port = 8093;
const shotsDir = join(entry, 'screenshots');

// 13 trophies a player would plausibly have early on: the opening missions,
// the first chapters, and the easy free-roam counts.
const seededEarned = [2, 3, 4, 5, 8, 15, 19, 21, 28, 35, 42, 52, 55];

const shots = [
  { file: '1-checklist.jpg', path: '/?trophy=17', note: 'Tracker, guide to The Shootist open' },
  { file: '2-roadmap.jpg', path: '/?view=roadmap', note: 'Roadmap to the platinum' },
  { file: '3-missables.jpg', path: '/?view=missables', note: 'Missables, flagged with reasons' },
  { file: '4-spoilers.jpg', path: '/?view=tracker&spoilers=on&trophy=9', note: 'Spoiler mode on, hidden story trophy' },
];

const server = spawn('/home/hatch/.local/node22/bin/node', ['serve.ts', '--port', String(port)], {
  cwd: entry,
  stdio: ['ignore', 'pipe', 'pipe'],
});
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch({
  executablePath: '/home/hatch/workspace/makefun/work/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const problems = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(`http://127.0.0.1:${port}`) && !url.startsWith('data:')) {
    problems.push(`non-local request: ${url}`);
  }
});
await page.addInitScript((earned) => {
  localStorage.setItem('leonida-trophy-guide-v1', JSON.stringify({
    earned, spoilersHidden: false, selectedId: null,
  }));
}, seededEarned);

for (const shot of shots) {
  await page.goto(`http://127.0.0.1:${port}${shot.path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(shotsDir, shot.file), type: 'jpeg', quality: 82 });
  console.log(`shot ${shot.file} — ${shot.note}`);
}

const summary = await page.evaluate(() => ({
  earned: document.getElementById('earnedCount')?.textContent,
  rows: document.querySelectorAll('.trophy-row').length,
  roadmapStages: document.querySelectorAll('.stage').length,
  missableGroups: document.querySelectorAll('.missable-group').length,
}));
console.log('summary:', JSON.stringify(summary));
console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'NO PROBLEMS');
await browser.close();
server.kill();
