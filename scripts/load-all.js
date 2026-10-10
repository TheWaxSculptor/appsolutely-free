const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const catalog = require('../data/catalog.js');
const freeCatalog = require('../data/catalog-free.js');

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
  catalog.apps.forEach((a) => { if (!appIds.has(a.id)) apps.push({ ...a }); });

  const alts = readYamlDir(altsDir);
  const altIds = new Set(alts.map((a) => a.id));
  [...catalog.alts, ...freeCatalog.alts].forEach((a) => {
    if (altIds.has(a.id)) return;
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

  alts.forEach((alt) => {
    alt.domain = domainOf(alt.website);
    if (alt.repo && alt.repo.url && health[alt.repo.url]) alt.health = health[alt.repo.url];
    const firstApp = (alt.replaces || []).map((id) => appById[id]).find(Boolean);
    alt.category = alt.category || (firstApp ? firstApp.category : 'utilities');
    alt.categories = [...new Set((alt.replaces || []).map((id) => appById[id] && appById[id].category).filter(Boolean))];
    if (fs.existsSync(path.join(screensDir, `${alt.id}.jpg`))) alt.screenshot = `assets/screens/${alt.id}.jpg`;
  });

  return { apps, alts };
}

module.exports = { loadAll, domainOf, root };
