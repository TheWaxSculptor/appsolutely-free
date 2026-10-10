import db from './data.js?v=10';
import { cardHtml, dealHtml, esc, CATEGORIES, PLATFORMS, formatStars } from './card.mjs?v=10';

const appsById = Object.fromEntries(db.apps.map((a) => [a.id, a]));
const altsById = Object.fromEntries(db.alternatives.map((a) => [a.id, a]));
const hasAlts = (app) => db.alternatives.some((a) => (a.replaces || []).includes(app.id));
const replaceableApps = db.apps.filter(hasAlts);

const searchInput = document.getElementById('appSearch');
const searchClear = document.getElementById('searchClear');
const resultsArea = document.getElementById('resultsArea');
const initialState = document.getElementById('initialState');

// ---- Stack / Bookmarks (LocalStorage) --------------------------------------
const STACK_KEY = 'appsolutely_free_stack_v1';
function getStack() {
  try { return JSON.parse(localStorage.getItem(STACK_KEY)) || []; } catch (e) { return []; }
}
function setStack(list) {
  localStorage.setItem(STACK_KEY, JSON.stringify(list));
  updateStackUI();
}
function toggleStack(id) {
  const stack = getStack();
  const exists = stack.includes(id);
  const next = exists ? stack.filter((x) => x !== id) : [...stack, id];
  setStack(next);
  const alt = altsById[id];
  showToast(exists ? `Removed ${alt ? alt.name : 'app'} from stack` : `⭐ Saved ${alt ? alt.name : 'app'} to your stack!`);
}

function updateStackUI() {
  const stack = getStack();
  const countEl = document.getElementById('stackCount');
  if (countEl) countEl.textContent = stack.length;

  // Update bookmark button states across DOM
  document.querySelectorAll('.bookmark-btn').forEach((btn) => {
    const active = stack.includes(btn.dataset.id);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });

  // Render Drawer contents
  const drawerBody = document.getElementById('drawerBody');
  const drawerSub = document.getElementById('drawerSub');
  const drawerTotal = document.getElementById('drawerTotalSaved');
  if (drawerBody) {
    if (!stack.length) {
      drawerBody.innerHTML = `<div class="empty-stack"><span class="empty-icon">📂</span><p>Your stack is empty.</p><small>Click the bookmark icon on any card to build your personalized free software stack!</small></div>`;
      if (drawerSub) drawerSub.textContent = '0 saved tools';
      if (drawerTotal) drawerTotal.textContent = '$0 / yr';
    } else {
      const items = stack.map((id) => altsById[id]).filter(Boolean);
      drawerBody.innerHTML = items.map((a) => `
        <div class="drawer-item">
          <img class="drawer-icon" src="https://www.google.com/s2/favicons?domain=${esc(a.domain)}&sz=64" alt="" width="28" height="28" onerror="this.style.display='none'">
          <div class="drawer-item-info">
            <strong>${esc(a.name)}</strong>
            <small>${esc(a.license || 'Free')}</small>
          </div>
          <div class="drawer-item-actions">
            <a class="btn btn-ghost btn-sm" href="${esc(a.website)}" target="_blank" rel="noopener">Open</a>
            <button class="btn-icon btn-sm remove-stack-btn" type="button" data-id="${esc(a.id)}" aria-label="Remove ${esc(a.name)}">✕</button>
          </div>
        </div>
      `).join('');
      if (drawerSub) drawerSub.textContent = `${items.length} saved ${items.length === 1 ? 'tool' : 'tools'}`;
      // Estimate savings: $180 average per tool replaced
      const est = items.length * 180;
      if (drawerTotal) drawerTotal.textContent = `$${est.toLocaleString()} / yr`;
    }
  }
}

// ---- Toast Notifications ---------------------------------------------------
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast glass-panel';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// ---- Results Rendering & Filtering -----------------------------------------
let currentResults = [];
let currentFilter = 'all';
let currentSort = 'default';

function renderCardsWithState(list) {
  let filtered = [...list];
  if (currentFilter !== 'all') {
    filtered = filtered.filter((a) => a.type === currentFilter);
  }
  if (currentSort === 'stars') {
    filtered.sort((a, b) => ((b.health && b.health.stars) || 0) - ((a.health && a.health.stars) || 0));
  } else if (currentSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'difficulty') {
    const rank = { easy: 1, moderate: 2, hard: 3 };
    filtered.sort((a, b) => (rank[a.switching_difficulty] || 2) - (rank[b.switching_difficulty] || 2));
  }
  return filtered.map((a) => cardHtml(a, appsById, { base: '' })).join('');
}

function updateResultsGrid() {
  const grid = document.getElementById('altsGrid');
  if (!grid) return;
  const html = renderCardsWithState(currentResults);
  grid.innerHTML = html || `<div class="no-filter-match"><p>No apps match this filter criteria.</p><button class="btn btn-ghost" id="resetFilterBtn">Show all (${currentResults.length})</button></div>`;
  updateStackUI();
  const resetBtn = document.getElementById('resetFilterBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    currentFilter = 'all';
    document.querySelectorAll('.filter-pill').forEach((p) => p.classList.toggle('active', p.dataset.type === 'all'));
    updateResultsGrid();
  });
}

function renderFilterBar(totalCount) {
  const openSourceCount = currentResults.filter((a) => a.type === 'open-source').length;
  const freeCount = currentResults.filter((a) => a.type === 'free').length;
  const freemiumCount = currentResults.filter((a) => a.type === 'freemium').length;

  return `
  <div class="filter-sort-bar glass-panel">
    <div class="filter-pills" role="tablist" aria-label="Filter alternatives by license">
      <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" type="button" data-type="all">All (${totalCount})</button>
      ${openSourceCount ? `<button class="filter-pill ${currentFilter === 'open-source' ? 'active' : ''}" type="button" data-type="open-source">🐧 Open Source (${openSourceCount})</button>` : ''}
      ${freeCount ? `<button class="filter-pill ${currentFilter === 'free' ? 'active' : ''}" type="button" data-type="free">✨ 100% Free (${freeCount})</button>` : ''}
      ${freemiumCount ? `<button class="filter-pill ${currentFilter === 'freemium' ? 'active' : ''}" type="button" data-type="freemium">🎁 Free Tier (${freemiumCount})</button>` : ''}
    </div>
    <div class="sort-wrap">
      <label for="sortSelect">Sort:</label>
      <select id="sortSelect" class="sort-select" aria-label="Sort alternatives">
        <option value="default" ${currentSort === 'default' ? 'selected' : ''}>Recommended</option>
        <option value="stars" ${currentSort === 'stars' ? 'selected' : ''}>⭐ GitHub Stars</option>
        <option value="difficulty" ${currentSort === 'difficulty' ? 'selected' : ''}>⚡ Easiest Switch</option>
        <option value="name" ${currentSort === 'name' ? 'selected' : ''}>🔤 Alphabetical (A-Z)</option>
      </select>
    </div>
  </div>`;
}

const showResults = (headerHtml, resultsList) => {
  currentResults = resultsList;
  currentFilter = 'all';
  currentSort = 'default';
  initialState.classList.add('hidden');
  resultsArea.classList.remove('hidden');

  resultsArea.innerHTML = `
    ${headerHtml}
    ${renderFilterBar(resultsList.length)}
    <div class="alts-grid" id="altsGrid">${renderCardsWithState(resultsList)}</div>
  `;
  bindResultsEvents();
  updateStackUI();
  resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function bindResultsEvents() {
  const bar = resultsArea.querySelector('.filter-sort-bar');
  if (bar) {
    bar.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (pill) {
        bar.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.type;
        updateResultsGrid();
      }
    });
    const sortSelect = bar.querySelector('#sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateResultsGrid();
      });
    }
  }
}

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
      <div class="cat-top">
        <span class="cat-emoji" aria-hidden="true">${cat.emoji}</span>
        <span class="cat-pill">${count} apps</span>
      </div>
      <span class="cat-name">${esc(cat.label)}</span>
      <span class="cat-blurb">${esc(cat.blurb || '')}</span>
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
    .map(([app, c]) => `<a class="chip" href="alternatives/${app.id}/">${esc(app.name)} <span class="chip-count">${c}</span></a>`).join('');
}

function renderFeatured() {
  const top = [...db.alternatives]
    .filter((a) => a.screenshot)
    .sort((a, b) => ((b.health && b.health.stars) || 0) - ((a.health && a.health.stars) || 0))
    .slice(0, 6);
  document.getElementById('featuredGrid').innerHTML = top.map((a) => cardHtml(a, appsById, { base: '' })).join('');
}

function renderDeals() {
  if (!db.deals || !db.deals.length) return;
  document.getElementById('dealsSection').hidden = false;
  document.getElementById('dealGrid').innerHTML = db.deals.map(dealHtml).join('');
}

// ---- Savings Calculator ----------------------------------------------------
const POPULAR_SUBSCRIPTIONS = [
  { id: 'photoshop', name: 'Photoshop', price: 264, icon: '🎨' },
  { id: 'microsoft-office', name: 'Microsoft 365', price: 99, icon: '📄' },
  { id: 'spotify', name: 'Spotify Premium', price: 144, icon: '🎧' },
  { id: 'premiere-pro', name: 'Premiere Pro', price: 264, icon: '🎬' },
  { id: 'notion', name: 'Notion Plus', price: 120, icon: '📝' },
  { id: 'slack', name: 'Slack Pro', price: 104, icon: '💬' },
  { id: '1password', name: '1Password', price: 36, icon: '🔐' },
  { id: 'adobe-acrobat', name: 'Acrobat Pro', price: 240, icon: '📑' },
  { id: 'dropbox', name: 'Dropbox Plus', price: 120, icon: '☁️' },
  { id: 'quickbooks', name: 'QuickBooks', price: 360, icon: '📊' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 240, icon: '🤖' },
  { id: 'autocad', name: 'AutoCAD', price: 1980, icon: '🧊' },
];

function renderCalculator() {
  const grid = document.getElementById('calcGrid');
  if (!grid) return;
  grid.innerHTML = POPULAR_SUBSCRIPTIONS.map((s) => `
    <label class="calc-item glass-panel" data-id="${s.id}" data-price="${s.price}">
      <input type="checkbox" name="sub" value="${s.id}">
      <span class="calc-item-emoji">${s.icon}</span>
      <span class="calc-item-name">${esc(s.name)}</span>
      <span class="calc-item-price">$${s.price}/yr</span>
    </label>
  `).join('');

  grid.addEventListener('change', updateCalculatorTotal);
  const actionBtn = document.getElementById('calcActionBtn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const checked = [...grid.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value);
      if (!checked.length) return;
      const matchedAlts = db.alternatives.filter((a) => (a.replaces || []).some((r) => checked.includes(r)));
      const checkedNames = checked.map((id) => (appsById[id] ? appsById[id].name : id)).join(', ');
      const total = checked.reduce((acc, id) => {
        const item = POPULAR_SUBSCRIPTIONS.find((s) => s.id === id);
        return acc + (item ? item.price : 0);
      }, 0);
      const headHtml = header(
        `Your Free Stack (Save $${total.toLocaleString()}/yr)`,
        `${matchedAlts.length} free alternatives replacing ${checkedNames}`
      );
      showResults(headHtml, matchedAlts);
      bindBack();
    });
  }
}

function updateCalculatorTotal() {
  const grid = document.getElementById('calcGrid');
  const checked = [...grid.querySelectorAll('input[type="checkbox"]:checked')];
  let total = 0;
  checked.forEach((c) => {
    const parent = c.closest('.calc-item');
    if (parent) {
      total += Number(parent.dataset.price) || 0;
      parent.classList.add('selected');
    }
  });
  grid.querySelectorAll('input[type="checkbox"]:not(:checked)').forEach((c) => {
    const parent = c.closest('.calc-item');
    if (parent) parent.classList.remove('selected');
  });

  const totalEl = document.getElementById('calcTotal');
  const countEl = document.getElementById('calcSelectedCount');
  const actionBtn = document.getElementById('calcActionBtn');

  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (countEl) {
    countEl.textContent = checked.length === 0
      ? 'Select subscriptions above to calculate'
      : `${checked.length} subscription${checked.length === 1 ? '' : 's'} selected (100% saved)`;
  }
  if (actionBtn) {
    actionBtn.disabled = checked.length === 0;
    actionBtn.textContent = checked.length === 0
      ? 'Select Subscriptions'
      : `Show Free Replacements (${checked.length})`;
  }
}

// ---- Search & Filter Views -------------------------------------------------
function header(title, sub) {
  return `<div class="results-head">
    <button class="btn btn-ghost back" type="button" id="backBtn">← Back</button>
    <div><h2>${title}</h2>${sub ? `<p class="subtitle left">${sub}</p>` : ''}</div>
  </div>`;
}

function bindBack() {
  const btn = document.getElementById('backBtn');
  if (btn) btn.addEventListener('click', () => {
    searchInput.value = '';
    if (searchClear) searchClear.classList.add('hidden');
    history.pushState('', '', location.pathname);
    showHome();
  });
}

function handleSearch(query) {
  const q = query.trim().toLowerCase();
  if (searchClear) searchClear.classList.toggle('hidden', !q);
  if (!q) { showHome(); return; }

  const matchedApps = db.apps.filter((a) => hasAlts(a) && (a.name.toLowerCase().includes(q) || a.id.includes(q) || (a.vendor || '').toLowerCase().includes(q)));
  const appIds = new Set(matchedApps.map((a) => a.id));
  const byReplace = db.alternatives.filter((alt) => (alt.replaces || []).some((id) => appIds.has(id)));
  const byName = db.alternatives.filter((alt) => !byReplace.includes(alt) &&
    (alt.name.toLowerCase().includes(q) || (alt.summary || '').toLowerCase().includes(q)));
  const results = [...byReplace, ...byName];

  if (!results.length) {
    showResults(`${header(`No results for “${esc(query)}”`, 'Try searching for an app name like Photoshop, Office, Spotify, or browse categories.')}`, []);
    bindBack();
    return;
  }
  const title = matchedApps.length
    ? `Free alternatives to ${matchedApps.map((a) => esc(a.name)).join(', ')}`
    : `Results for “${esc(query)}”`;
  showResults(header(title, `${results.length} free ${results.length === 1 ? 'app' : 'apps'} found`), results);
  bindBack();
}

function handlePlatform(id) {
  const platform = PLATFORMS.find((p) => p.id === id);
  if (!platform) { showHome(); return; }
  const list = db.alternatives.filter((a) => (a.platforms || []).includes(id));
  showResults(header(`${platform.emoji} Free apps for ${esc(platform.label)}`, `${list.length} verified alternatives available`), list);
  bindBack();
}

function route() {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('platform=')) { handlePlatform(hash.slice(9)); return; }
  const q = new URLSearchParams(location.search).get('q');
  if (q && !searchInput.value) { searchInput.value = q; handleSearch(q); return; }
  if (!searchInput.value) showHome();
}

// ---- Quick Tags, Clear & Keyboard Shortcut ---------------------------------
let timer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => handleSearch(e.target.value), 100);
});

if (searchClear) {
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    searchInput.focus();
    showHome();
  });
}

// Press "/" anywhere to focus search
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    closeDrawer();
  }
});

// Trending Quick Tags
document.getElementById('quickTags')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.quick-tag');
  if (btn) {
    searchInput.value = btn.textContent;
    handleSearch(btn.dataset.q || btn.textContent);
  }
});

// Card Click Delegations (Bookmark & Share)
document.addEventListener('click', (e) => {
  const bkmk = e.target.closest('.bookmark-btn');
  if (bkmk) {
    e.preventDefault();
    e.stopPropagation();
    toggleStack(bkmk.dataset.id);
    return;
  }
  const share = e.target.closest('.share-btn');
  if (share) {
    e.preventDefault();
    e.stopPropagation();
    const url = share.dataset.url || window.location.href;
    const name = share.dataset.name || 'Software Alternative';
    if (navigator.share) {
      navigator.share({ title: `Free alternative: ${name}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`🔗 Link for ${name} copied to clipboard!`);
      }).catch(() => {
        showToast(`Visit ${url}`);
      });
    }
    return;
  }
  const removeBtn = e.target.closest('.remove-stack-btn');
  if (removeBtn) {
    toggleStack(removeBtn.dataset.id);
    return;
  }
});

// ---- Drawer Open / Close ---------------------------------------------------
const drawer = document.getElementById('stackDrawer');
const backdrop = document.getElementById('drawerBackdrop');
function openDrawer() {
  updateStackUI();
  drawer?.classList.remove('hidden');
  backdrop?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  drawer?.classList.add('hidden');
  backdrop?.classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('openStackBtn')?.addEventListener('click', openDrawer);
document.getElementById('closeDrawerBtn')?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);

document.getElementById('clearStackBtn')?.addEventListener('click', () => {
  if (confirm('Clear all saved apps from your stack?')) {
    setStack([]);
    showToast('Stack cleared');
  }
});

document.getElementById('copyStackBtn')?.addEventListener('click', () => {
  const stack = getStack().map((id) => altsById[id]).filter(Boolean);
  if (!stack.length) return;
  const text = `My Free Software Stack:\n` + stack.map((a) => `- ${a.name} (${a.website}): Replaces ${(a.replaces || []).join(', ')}`).join('\n') + `\n\nFound via https://appsolutelyfree.com`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('✓ Stack list copied to clipboard!');
  });
});

window.addEventListener('hashchange', route);

// ---- Init ------------------------------------------------------------------
renderStats();
renderCalculator();
renderCategories();
renderPlatforms();
renderPopular();
renderFeatured();
renderDeals();
updateStackUI();
route();
