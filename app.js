import db from './data.js?v=7';
import { cardHtml, dealHtml, esc, CATEGORIES, PLATFORMS, formatStars } from './card.mjs?v=7';

const appsById = Object.fromEntries(db.apps.map((a) => [a.id, a]));
const hasAlts = (app) => db.alternatives.some((a) => (a.replaces || []).includes(app.id));
const replaceableApps = db.apps.filter(hasAlts);

const searchInput = document.getElementById('appSearch');
const resultsArea = document.getElementById('resultsArea');
const initialState = document.getElementById('initialState');

const renderCards = (list) => list.map((a) => cardHtml(a, appsById, { base: '' })).join('');
const showResults = (html) => {
  initialState.classList.add('hidden');
  resultsArea.classList.remove('hidden');
  resultsArea.innerHTML = html;
  resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
const showHome = () => {
  resultsArea.classList.add('hidden');
  resultsArea.innerHTML = '';
  initialState.classList.remove('hidden');
};

// ---- Home sections --------------------------------------------------------
function renderStats() {
  const stars = db.alternatives.reduce((n, a) => n + ((a.health && a.health.stars) || 0), 0);
  const items = [
    [db.alternatives.length, 'free alternatives'],
    [replaceableApps.length, 'paid apps covered'],
    [CATEGORIES.length, 'categories'],
    [formatStars(stars), 'GitHub stars combined'],
  ];
  document.getElementById('stats').innerHTML = items
    .map(([n, label]) => `<div class="stat"><strong>${esc(n)}</strong><span>${esc(label)}</span></div>`).join('');
}

function renderCategories() {
  document.getElementById('categoryGrid').innerHTML = CATEGORIES.map((cat) => {
    const count = db.alternatives.filter((a) => a.category === cat.id || (a.categories || []).includes(cat.id)).length;
    if (!count) return '';
    return `<a class="category-card glass-panel" href="category/${cat.id}/">
      <span class="cat-emoji" aria-hidden="true">${cat.emoji}</span>
      <span class="cat-name">${esc(cat.label)}</span>
      <span class="cat-count">${count} ${count === 1 ? "app" : "apps"}</span>
    </a>`;
  }).join('');
}

function renderPlatforms() {
  const el = document.getElementById('platformChips');
  el.innerHTML = PLATFORMS.map((p) => `<button class="chip" type="button" data-platform="${p.id}">${p.emoji} ${esc(p.label)}</button>`).join('');
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-platform]');
    if (btn) { searchInput.value = ''; location.hash = `platform=${btn.dataset.platform}`; }
  });
}

function renderPopular() {
  const ranked = replaceableApps
    .map((app) => [app, db.alternatives.filter((a) => (a.replaces || []).includes(app.id)).length])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);
  document.getElementById('popularChips').innerHTML = ranked
    .map(([app]) => `<a class="chip" href="alternatives/${app.id}/">${esc(app.name)}</a>`).join('');
}

function renderFeatured() {
  const top = [...db.alternatives]
    .filter((a) => a.screenshot)
    .sort((a, b) => ((b.health && b.health.stars) || 0) - ((a.health && a.health.stars) || 0))
    .slice(0, 6);
  document.getElementById('featuredGrid').innerHTML = renderCards(top);
}

function renderDeals() {
  if (!db.deals || !db.deals.length) return;
  document.getElementById('dealsSection').hidden = false;
  document.getElementById('dealGrid').innerHTML = db.deals.map(dealHtml).join('');
}

// ---- Search & filter views -------------------------------------------------
function header(title, sub) {
  return `<div class="results-head"><button class="btn btn-ghost back" type="button" id="backBtn">← Back</button>
    <div><h2>${title}</h2>${sub ? `<p class="subtitle left">${sub}</p>` : ''}</div></div>`;
}

function bindBack() {
  const btn = document.getElementById('backBtn');
  if (btn) btn.addEventListener('click', () => { searchInput.value = ''; history.pushState('', '', location.pathname); showHome(); });
}

function handleSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) { showHome(); return; }

  const matchedApps = db.apps.filter((a) => hasAlts(a) && (a.name.toLowerCase().includes(q) || a.id.includes(q) || (a.vendor || '').toLowerCase().includes(q)));
  const appIds = new Set(matchedApps.map((a) => a.id));
  const byReplace = db.alternatives.filter((alt) => (alt.replaces || []).some((id) => appIds.has(id)));
  const byName = db.alternatives.filter((alt) => !byReplace.includes(alt) &&
    (alt.name.toLowerCase().includes(q) || (alt.summary || '').toLowerCase().includes(q)));
  const results = [...byReplace, ...byName];

  if (!results.length) {
    showResults(`${header(`No results for “${esc(query)}”`, 'Try a different name, or browse the categories below.')}`);
    bindBack();
    return;
  }
  const title = matchedApps.length
    ? `Free alternatives to ${matchedApps.map((a) => esc(a.name)).join(', ')}`
    : `Results for “${esc(query)}”`;
  showResults(`${header(title, `${results.length} free ${results.length === 1 ? 'app' : 'apps'} found`)}<div class="alts-grid">${renderCards(results)}</div>`);
  bindBack();
}

function handlePlatform(id) {
  const platform = PLATFORMS.find((p) => p.id === id);
  if (!platform) { showHome(); return; }
  const list = db.alternatives.filter((a) => (a.platforms || []).includes(id));
  showResults(`${header(`${platform.emoji} Free apps for ${esc(platform.label)}`, `${list.length} open-source apps available`)}<div class="alts-grid">${renderCards(list)}</div>`);
  bindBack();
}

function route() {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('platform=')) { handlePlatform(hash.slice(9)); return; }
  const q = new URLSearchParams(location.search).get('q');
  if (q && !searchInput.value) { searchInput.value = q; handleSearch(q); return; }
  if (!searchInput.value) showHome();
}

let timer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => handleSearch(e.target.value), 120);
});
window.addEventListener('hashchange', route);

renderStats();
renderCategories();
renderPlatforms();
renderPopular();
renderFeatured();
renderDeals();
route();
