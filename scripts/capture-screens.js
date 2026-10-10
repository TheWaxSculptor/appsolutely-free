// Captures real website screenshots of every alternative using headless Chrome.
// Usage: node scripts/capture-screens.js [--force] [id ...]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadAll, root } = require('./load-all');

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = path.join(root, 'assets/screens');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

const { alts } = loadAll();
const targets = alts.filter((a) => a.website && (only.length === 0 || only.includes(a.id)));

for (const alt of targets) {
  const jpg = path.join(outDir, `${alt.id}.jpg`);
  if (!force && fs.existsSync(jpg)) continue;
  const png = path.join(outDir, `${alt.id}.png`);
  console.log(`Capturing ${alt.id} (${alt.website})`);
  try {
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,800',
      '--virtual-time-budget=8000', `--screenshot=${png}`, alt.website,
    ], { stdio: 'ignore', timeout: 40000 });
    execFileSync('sips', ['-Z', '800', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', jpg], { stdio: 'ignore' });
  } catch (e) {
    console.warn(`  failed: ${e.message.split('\n')[0]}`);
  } finally {
    if (fs.existsSync(png)) fs.unlinkSync(png);
  }
}
console.log('Done.');
