const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const catalog = require('../data/catalog.js');
const freeCatalog = require('../data/catalog-free.js');
const moreCatalog = require('../data/catalog-more.js');
const extendedCatalog = require('../data/catalog-extended.js');

const root = path.join(__dirname, '..');
const appsDir = path.join(root, 'data/appsolutely-free-data/apps');
const altsDir = path.join(root, 'data/appsolutely-free-data/alternatives');
const healthFile = path.join(root, 'data/health.json');
const screensDir = path.join(root, 'assets/screens');

function readYamlDir(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((file) => {
      const data = yaml.load(fs.readFileSync(path.join(dir, file), 'utf8'));
      data.id = file.replace(/\.ya?ml$/, '');
      return data;
    });
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

function loadAll() {
  let health = {};
  try { health = JSON.parse(fs.readFileSync(healthFile, 'utf8')); } catch (e) { /* no health yet */ }

  const apps = readYamlDir(appsDir);
  const appIds = new Set(apps.map((a) => a.id));
  [...catalog.apps, ...(moreCatalog.apps || []), ...(extendedCatalog.apps || [])].forEach((a) => {
    if (!appIds.has(a.id)) { appIds.add(a.id); apps.push({ ...a }); }
  });

  const alts = readYamlDir(altsDir);
  const altIds = new Set(alts.map((a) => a.id));
  [...catalog.alts, ...freeCatalog.alts, ...(moreCatalog.alts || []), ...(extendedCatalog.alts || [])].forEach((a) => {
    if (altIds.has(a.id)) {
      const existing = alts.find((x) => x.id === a.id);
      if (existing && Array.isArray(a.replaces)) {
        existing.replaces = [...new Set([...(existing.replaces || []), ...a.replaces])];
      }
      return;
    }
    altIds.add(a.id);
    const alt = { type: 'open-source', ...a, switching_difficulty: a.difficulty };
    delete alt.difficulty;
    if (typeof alt.repo === 'string') {
      alt.repo = { host: 'github', url: `https://github.com/${alt.repo}` };
    }
    alts.push(alt);
  });

  const appById = Object.fromEntries(apps.map((a) => [a.id, a]));

  apps.forEach((app) => {
    app.category = app.category || 'utilities';
    app.domain = domainOf(app.website);
  });

  const KNOWN_WARNINGS = {
    'apache-openoffice': 'Development is quiet with reported unfixed security issues in older releases; LibreOffice is strongly recommended instead.',
    'ollama': 'Requires a modern Mac or PC with 8GB+ RAM (ideally dedicated GPU or Apple Silicon) to run heavy models smoothly.',
    'lm-studio': 'Closed-source desktop binary; running 7B+ parameter models requires a dedicated GPU or Apple Silicon.',
    'jan': 'Large model weights (4GB - 16GB) require significant disk space and local GPU for fast responses.',
    'marq': 'Free cloud tier limits stored documents and exports to 3 pages per document.',
    'quillbot': 'Free web paraphraser is capped at 125 words per submission.',
    'prowritingaid-free': 'Free web checks are limited to 500 words per document.',
    'tally': 'Custom domains and white-labeling (removing the "Made with Tally" badge) require a paid Pro tier.',
    'cavalry': 'Free starter tier restricts video renders to 1080p and omits advanced dynamics.',
    'dub': 'Free cloud plan is limited to 25 new shortened links per month (unlimited when self-hosted).',
    'shottr': 'macOS only; periodic dialog asks to support the developer with a $12 optional license.',
    'malwarebytes-free': 'Free version provides on-demand malware scanning only; real-time background protection requires paid Pro.',
    'canva': 'Many premium stock photos, vector icons, and background removal tools require Canva Pro.',
  };

  alts.forEach((alt) => {
    alt.domain = domainOf(alt.website);
    if (alt.repo && alt.repo.url && health[alt.repo.url]) alt.health = health[alt.repo.url];
    const firstApp = (alt.replaces || []).map((id) => appById[id]).find(Boolean);
    alt.category = alt.category || (firstApp ? firstApp.category : 'utilities');
    alt.categories = [...new Set((alt.replaces || []).map((id) => appById[id] && appById[id].category).filter(Boolean))];
    if (fs.existsSync(path.join(screensDir, `${alt.id}.jpg`))) alt.screenshot = `assets/screens/${alt.id}.jpg`;

    // 1. Separate Open Source license flag
    const osLicenses = ['mit', 'gpl', 'apache', 'bsd', 'mpl', 'agpl', 'lgpl', 'zlib', 'odbl', 'cc0'];
    const lic = (alt.license || '').toLowerCase();
    alt.is_open_source = alt.type === 'open-source' || osLicenses.some((l) => lic.includes(l));

    // 2. Separate Cost Tier: zero-cost, limited-free, self-hosted
    const isSelfHosted = (alt.platforms || []).includes('self-hosted') ||
      ['ollama', 'lm-studio', 'jan', 'vaultwarden', 'audiobookshelf', 'jellyfin', 'listmonk', 'mathesar'].includes(alt.id);
    const isFreemium = alt.type === 'freemium' ||
      lic.includes('free tier') || lic.includes('freemium') || lic.includes('free personal') || lic.includes('paid');

    if (isSelfHosted) {
      alt.cost_tier = 'self-hosted';
      alt.cost_label = 'Requires hosting/hardware';
    } else if (isFreemium) {
      alt.cost_tier = 'limited-free';
      alt.cost_label = 'Limited free plan';
    } else {
      alt.cost_tier = 'zero-cost';
      alt.cost_label = '$0 to use';
    }

    // 3. Verification date
    alt.last_verified = alt.last_verified || '2026-10';

    // 4. Important limitations / warnings
    if (!alt.warnings || !alt.warnings.length) {
      if (KNOWN_WARNINGS[alt.id]) {
        alt.warnings = [{ text: KNOWN_WARNINGS[alt.id] }];
      } else if (isSelfHosted && !['ollama', 'lm-studio', 'jan'].includes(alt.id)) {
        alt.warnings = [{ text: 'Requires user-managed server, Docker, or hosting infrastructure.' }];
      }
    }
  });

  let stacks = [];
  try { stacks = JSON.parse(fs.readFileSync(path.join(root, 'data/stacks.json'), 'utf8')); } catch (e) {}

  let resources = [];
  try { resources = JSON.parse(fs.readFileSync(path.join(root, 'data/resources.json'), 'utf8')); } catch (e) {}

  let learning = [];
  try { learning = JSON.parse(fs.readFileSync(path.join(root, 'data/learning.json'), 'utf8')); } catch (e) {}

  let games = [];
  try { games = JSON.parse(fs.readFileSync(path.join(root, 'data/games.json'), 'utf8')); } catch (e) {}

  let aiHub = [];
  try { aiHub = JSON.parse(fs.readFileSync(path.join(root, 'data/ai-hub.json'), 'utf8')); } catch (e) {}

  let guides = [];
  try { guides = JSON.parse(fs.readFileSync(path.join(root, 'data/guides.json'), 'utf8')); } catch (e) {}

  let radar = [];
  try { radar = JSON.parse(fs.readFileSync(path.join(root, 'data/radar.json'), 'utf8')); } catch (e) {}

  return { apps, alts, stacks, resources, learning, games, aiHub, guides, radar };
}

module.exports = { loadAll, domainOf, root };
