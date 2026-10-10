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
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      '--virtual-time-budget=6000', `--screenshot=${png}`, alt.website,
    ], { stdio: 'ignore', timeout: 20000 });
    execFileSync('sips', ['-Z', '800', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', jpg], { stdio: 'ignore' });
  } catch (e) {
    console.warn(`  live capture failed: ${e.message.split('\n')[0]}, generating branded card`);
    try {
      const fallbackHtml = `data:text/html,<!DOCTYPE html><html><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,%230b0f19,%231e293b);color:%23f8fafc;font-family:system-ui,-apple-system,sans-serif;"><div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:48px 64px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.4);"><div style="font-size:52px;font-weight:900;letter-spacing:-0.03em;margin-bottom:16px;">${encodeURIComponent(alt.name)}</div><div style="font-size:24px;color:%2394a3b8;font-weight:500;">${encodeURIComponent(alt.domain || alt.website)}</div></div></body></html>`;
      execFileSync(CHROME, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,800',
        `--screenshot=${png}`, fallbackHtml,
      ], { stdio: 'ignore', timeout: 10000 });
      execFileSync('sips', ['-Z', '800', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', jpg], { stdio: 'ignore' });
    } catch (e2) {
      console.warn(`  fallback failed: ${e2.message.split('\n')[0]}`);
    }
  } finally {
    if (fs.existsSync(png)) fs.unlinkSync(png);
  }
}
console.log('Done.');
