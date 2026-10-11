import db from './data.js?v=11';
import { cardHtml, dealHtml, esc, CATEGORIES, PLATFORMS, formatStars } from './card.mjs?v=11';

const appsById = Object.fromEntries(db.apps.map((a) => [a.id, a]));
const altsById = Object.fromEntries(db.alternatives.map((a) => [a.id, a]));
const hasAlts = (app) => db.alternatives.some((a) => (a.replaces || []).includes(app.id));
const replaceableApps = db.apps.filter(hasAlts);

const searchInput = document.getElementById('appSearch');
const searchClear = document.getElementById('searchClear');
const resultsArea = document.getElementById('resultsArea');
const initialState = document.getElementById('initialState');

// Standard annual subscription costs for deduplicated stack savings
const APP_PRICES = {
  'photoshop': 264,
  'microsoft-office': 99,
  'spotify': 144,
  'premiere-pro': 264,
  'notion': 120,
  'slack': 104,
  '1password': 36,
  'adobe-acrobat': 240,
  'dropbox': 120,
  'quickbooks': 360,
  'chatgpt-plus': 240,
  'autocad': 1980,
  'illustrator': 264,
  'after-effects': 264,
  'lightroom': 120,
  'indesign': 264,
  'figma': 144,
  'airtable': 240,
  'fl-studio': 199,
  'ableton-live': 439,
  'logic-pro': 199,
  'final-cut-pro': 299,
  'zoom': 150,
  'calendly': 120,
  'grammarly': 144,
  'trello': 60,
  'monday': 120,
  'cleanmymac': 40,
  'lastpass': 36,
  'nordvpn': 72,
  'wolfram-alpha': 84,
  'matlab': 940,
  'jetbrains': 289,
  'github-copilot': 120,
  'parallels': 100,
  'winrar': 29,
  'tableau': 840,
  'postman': 168,
  'datadog': 180,
  'auth0': 276,
  'mailchimp': 156,
};

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
  const drawerReplacedSub = document.getElementById('drawerReplacedSub');

  if (drawerBody) {
    if (!stack.length) {
      drawerBody.innerHTML = `<div class="empty-stack"><span class="empty-icon">📂</span><p>Your stack is empty.</p><small>Click the bookmark icon on any card to build your personalized free software stack!</small></div>`;
      if (drawerSub) drawerSub.textContent = '0 saved tools';
      if (drawerTotal) drawerTotal.textContent = '$0 / yr';
      if (drawerReplacedSub) drawerReplacedSub.textContent = '';
    } else {
      const items = stack.map((id) => altsById[id]).filter(Boolean);
      drawerBody.innerHTML = items.map((a) => `
        <div class="drawer-item">
          <img class="drawer-icon" src="https://www.google.com/s2/favicons?domain=${esc(a.domain)}&sz=64" alt="" width="28" height="28" onerror="this.style.display='none'">
          <div class="drawer-item-info">
            <strong>${esc(a.name)}</strong>
            <small>${esc(a.cost_label || a.license || 'Free')}</small>
          </div>
          <div class="drawer-item-actions">
            <a class="btn btn-ghost btn-sm" href="${esc(a.website)}" target="_blank" rel="noopener">Open</a>
            <button class="btn-icon btn-sm remove-stack-btn" type="button" data-id="${esc(a.id)}" aria-label="Remove ${esc(a.name)}">✕</button>
          </div>
        </div>
      `).join('');

      // Calculate from subscriptions the visitor actually replaces (deduplicated)
      const replacedAppIds = new Set();
      items.forEach((a) => {
        (a.replaces || []).forEach((r) => replacedAppIds.add(r));
      });
      const replacedArr = [...replacedAppIds];
      let totalEst = 0;
      replacedArr.forEach((appId) => {
        totalEst += APP_PRICES[appId] || 120;
      });

      if (drawerSub) {
        drawerSub.textContent = `${items.length} saved ${items.length === 1 ? 'tool' : 'tools'}${replacedArr.length ? ` · ${replacedArr.length} subscription${replacedArr.length === 1 ? '' : 's'} replaced` : ''}`;
      }
      if (drawerTotal) {
        drawerTotal.textContent = `$${totalEst.toLocaleString()} / yr`;
      }
      if (drawerReplacedSub) {
        if (replacedArr.length > 0) {
          const names = replacedArr.map((id) => (appsById[id] ? appsById[id].name : id)).slice(0, 4).join(', ');
          const extra = replacedArr.length > 4 ? ` +${replacedArr.length - 4} more` : '';
          drawerReplacedSub.textContent = `Calculated from replaced subscriptions: ${names}${extra}. (Multiple alternatives to the same tool do not multiply savings)`;
        } else {
          drawerReplacedSub.textContent = 'Save tools that replace paid apps to calculate your subscription savings.';
        }
      }
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
let currentCostFilter = 'all'; // 'all', 'zero-cost', 'limited-free', 'self-hosted'
let openSourceOnly = false;
let currentSort = 'default';

function renderCardsWithState(list) {
  let filtered = [...list];
  if (currentCostFilter !== 'all') {
    filtered = filtered.filter((a) => a.cost_tier === currentCostFilter);
  }
  if (openSourceOnly) {
    filtered = filtered.filter((a) => a.is_open_source);
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
  grid.innerHTML = html || `<div class="no-filter-match"><p>No apps match this filter criteria.</p><button class="btn btn-ghost" id="resetFilterBtn">Reset filters (${currentResults.length})</button></div>`;
  updateStackUI();
  const resetBtn = document.getElementById('resetFilterBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    currentCostFilter = 'all';
    openSourceOnly = false;
    const bar = resultsArea.querySelector('.filter-sort-bar');
    if (bar) {
      bar.querySelectorAll('.cost-pill').forEach((p) => p.classList.toggle('active', p.dataset.cost === 'all'));
      const osBtn = bar.querySelector('#osToggleBtn');
      if (osBtn) osBtn.classList.remove('active');
    }
    updateResultsGrid();
  });
}

function renderFilterBar(totalCount) {
  const zeroCostCount = currentResults.filter((a) => a.cost_tier === 'zero-cost').length;
  const limitedFreeCount = currentResults.filter((a) => a.cost_tier === 'limited-free').length;
  const selfHostedCount = currentResults.filter((a) => a.cost_tier === 'self-hosted').length;
  const osCount = currentResults.filter((a) => a.is_open_source).length;

  return `
  <div class="filter-sort-bar glass-panel">
    <div class="filter-pills" role="tablist" aria-label="Filter alternatives by cost tier">
      <button class="filter-pill cost-pill ${currentCostFilter === 'all' ? 'active' : ''}" type="button" data-cost="all">All (${totalCount})</button>
      ${zeroCostCount ? `<button class="filter-pill cost-pill ${currentCostFilter === 'zero-cost' ? 'active' : ''}" type="button" data-cost="zero-cost">✨ $0 to use (${zeroCostCount})</button>` : ''}
      ${limitedFreeCount ? `<button class="filter-pill cost-pill ${currentCostFilter === 'limited-free' ? 'active' : ''}" type="button" data-cost="limited-free">🎁 Limited free plan (${limitedFreeCount})</button>` : ''}
      ${selfHostedCount ? `<button class="filter-pill cost-pill ${currentCostFilter === 'self-hosted' ? 'active' : ''}" type="button" data-cost="self-hosted">🖥️ Requires hosting/hardware (${selfHostedCount})</button>` : ''}
      ${osCount ? `<button class="filter-pill os-pill ${openSourceOnly ? 'active' : ''}" type="button" id="osToggleBtn">🐧 Open Source Only (${osCount})</button>` : ''}
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

const showResults = (headerHtml, resultsList, { shouldScroll = false } = {}) => {
  currentResults = resultsList;
  currentCostFilter = 'all';
  openSourceOnly = false;
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
  if (shouldScroll) {
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function bindResultsEvents() {
  const bar = resultsArea.querySelector('.filter-sort-bar');
  if (bar) {
    bar.addEventListener('click', (e) => {
      const costPill = e.target.closest('.cost-pill');
      if (costPill) {
        bar.querySelectorAll('.cost-pill').forEach((p) => p.classList.remove('active'));
        costPill.classList.add('active');
        currentCostFilter = costPill.dataset.cost;
        updateResultsGrid();
        return;
      }
      const osPill = e.target.closest('#osToggleBtn');
      if (osPill) {
        openSourceOnly = !openSourceOnly;
        osPill.classList.toggle('active', openSourceOnly);
        updateResultsGrid();
        return;
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
  const heroBadge = document.getElementById('heroBadgeText');
  if (heroBadge) {
    heroBadge.textContent = `${db.alternatives.length} Hand-Picked Free Alternatives Across ${CATEGORIES.length} Categories`;
  }
  const stars = db.alternatives.reduce((n, a) => n + ((a.health && a.health.stars) || 0), 0);
  const items = [
    [db.alternatives.length, 'free alternatives'],
    [replaceableApps.length, 'paid apps covered'],
    [CATEGORIES.length, 'categories'],
    [(db.resources || []).length, 'creative resources'],
    [(db.learning || []).length, 'free courses & labs'],
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

const customPrices = Object.fromEntries(POPULAR_SUBSCRIPTIONS.map((s) => [s.id, s.price]));
let replacementExpense = 0;

function renderCalculator() {
  const grid = document.getElementById('calcGrid');
  if (!grid) return;
  grid.innerHTML = POPULAR_SUBSCRIPTIONS.map((s) => `
    <label class="calc-item glass-panel" data-id="${s.id}">
      <input type="checkbox" name="sub" value="${s.id}">
      <span class="calc-item-emoji">${s.icon}</span>
      <span class="calc-item-name">${esc(s.name)}</span>
      <span class="calc-item-price calc-item-price-static">$${s.price}/yr</span>
      <div class="calc-price-edit-row" onclick="event.stopPropagation()">
        <span>$</span>
        <input type="number" class="calc-cost-input" value="${s.price}" min="0" step="5" data-id="${s.id}" aria-label="${esc(s.name)} cost per year">
        <span>/yr</span>
      </div>
    </label>
  `).join('');

  grid.addEventListener('change', updateCalculatorTotal);
  grid.addEventListener('input', (e) => {
    if (e.target.classList.contains('calc-cost-input')) {
      const id = e.target.dataset.id;
      const val = Math.max(0, Number(e.target.value) || 0);
      customPrices[id] = val;
      updateCalculatorTotal();
    }
  });

  const expenseInput = document.getElementById('calcExpenseInput');
  if (expenseInput) {
    expenseInput.addEventListener('input', (e) => {
      replacementExpense = Math.max(0, Number(e.target.value) || 0);
      updateCalculatorTotal();
    });
  }

  const actionBtn = document.getElementById('calcActionBtn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const checked = [...grid.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value);
      if (!checked.length) return;
      const matchedAlts = db.alternatives.filter((a) => (a.replaces || []).some((r) => checked.includes(r)));
      const checkedNames = checked.map((id) => (appsById[id] ? appsById[id].name : id)).join(', ');
      
      let grossTotal = 0;
      checked.forEach((id) => {
        grossTotal += (customPrices[id] !== undefined ? customPrices[id] : (POPULAR_SUBSCRIPTIONS.find((s) => s.id === id)?.price || 0));
      });
      const netSavings = Math.max(0, grossTotal - replacementExpense);

      const headHtml = header(
        `Your Free Replacements (Potential Savings: $${netSavings.toLocaleString()}/yr)`,
        `${matchedAlts.length} free alternatives replacing ${checkedNames}. ${replacementExpense > 0 ? `(After subtracting $${replacementExpense.toLocaleString()}/yr self-hosting/hardware expense)` : ''}`
      );
      showResults(headHtml, matchedAlts, { shouldScroll: true });
      bindBack();
    });
  }
}

function updateCalculatorTotal() {
  const grid = document.getElementById('calcGrid');
  if (!grid) return;
  const checked = [...grid.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value);

  grid.querySelectorAll('.calc-item').forEach((item) => {
    const isChecked = checked.includes(item.dataset.id);
    item.classList.toggle('selected', isChecked);
  });

  let grossTotal = 0;
  checked.forEach((id) => {
    grossTotal += (customPrices[id] !== undefined ? customPrices[id] : (POPULAR_SUBSCRIPTIONS.find((s) => s.id === id)?.price || 0));
  });

  const netSavings = Math.max(0, grossTotal - replacementExpense);

  const totalEl = document.getElementById('calcTotal');
  const countEl = document.getElementById('calcSelectedCount');
  const breakdownEl = document.getElementById('calcBreakdown');
  const actionBtn = document.getElementById('calcActionBtn');

  if (totalEl) totalEl.textContent = netSavings.toLocaleString();
  if (countEl) {
    countEl.textContent = checked.length === 0
      ? 'Select subscriptions above to calculate potential savings'
      : `${checked.length} subscription${checked.length === 1 ? '' : 's'} selected · Potential savings calculated`;
  }
  if (breakdownEl) {
    if (checked.length > 0) {
      breakdownEl.textContent = `Subscriptions: $${grossTotal.toLocaleString()}/yr ${replacementExpense > 0 ? `− $${replacementExpense.toLocaleString()}/yr hosting/hardware = $${netSavings.toLocaleString()}/yr net potential savings` : '(assumes $0 local installation)'}`;
    } else {
      breakdownEl.textContent = '';
    }
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
    showResults(`${header(`No results for “${esc(query)}”`, 'Try searching for an app name like Photoshop, Office, Spotify, or browse categories.')}`, [], { shouldScroll: false });
    bindBack();
    return;
  }
  const title = matchedApps.length
    ? `Free alternatives to ${matchedApps.map((a) => esc(a.name)).join(', ')}`
    : `Results for “${esc(query)}”`;
  showResults(header(title, `${results.length} free ${results.length === 1 ? 'app' : 'apps'} found`), results, { shouldScroll: false });
  bindBack();
}

function handlePlatform(id) {
  const platform = PLATFORMS.find((p) => p.id === id);
  if (!platform) { showHome(); return; }
  const list = db.alternatives.filter((a) => (a.platforms || []).includes(id));
  showResults(header(`${platform.emoji} Free apps for ${esc(platform.label)}`, `${list.length} verified alternatives available`), list, { shouldScroll: true });
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
    closeReportModal();
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

// Card Click Delegations (Bookmark, Share, Report)
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
  const reportBtn = e.target.closest('.report-btn');
  if (reportBtn) {
    e.preventDefault();
    e.stopPropagation();
    openReportModal(reportBtn.dataset.id, reportBtn.dataset.name);
    return;
  }
  const removeBtn = e.target.closest('.remove-stack-btn');
  if (removeBtn) {
    toggleStack(removeBtn.dataset.id);
    return;
  }
});

// ---- Report Outdated Information Modal -------------------------------------
const reportModal = document.getElementById('reportModal');
const reportBackdrop = document.getElementById('reportModalBackdrop');
const reportForm = document.getElementById('reportForm');
const closeReportBtn = document.getElementById('closeReportModalBtn');
const cancelReportBtn = document.getElementById('cancelReportBtn');

function openReportModal(id, name) {
  if (!reportModal) return;
  const nameInput = document.getElementById('reportAppName');
  const idInput = document.getElementById('reportAppId');
  if (nameInput) nameInput.value = name || id;
  if (idInput) idInput.value = id;
  reportModal.classList.remove('hidden');
  reportBackdrop?.classList.remove('hidden');
  document.getElementById('reportDetails')?.focus();
}

function closeReportModal() {
  reportModal?.classList.add('hidden');
  reportBackdrop?.classList.add('hidden');
  if (reportForm) reportForm.reset();
}

closeReportBtn?.addEventListener('click', closeReportModal);
cancelReportBtn?.addEventListener('click', closeReportModal);
reportBackdrop?.addEventListener('click', closeReportModal);

if (reportForm) {
  reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('reportAppId')?.value;
    const name = document.getElementById('reportAppName')?.value;
    const reason = document.getElementById('reportReason')?.value;
    const details = document.getElementById('reportDetails')?.value;

    try {
      const reports = JSON.parse(localStorage.getItem('appsolutely_reports_v1')) || [];
      reports.push({ id, name, reason, details, timestamp: new Date().toISOString() });
      localStorage.setItem('appsolutely_reports_v1', JSON.stringify(reports));
    } catch (err) {}

    showToast(`✓ Thank you! Report for ${name} submitted. Our team will verify.`);
    closeReportModal();
  });
}

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

// ---- Free Creative Resources -----------------------------------------------
let currentResFilter = 'all';
function renderResources() {
  const chipsEl = document.getElementById('resourceFilterChips');
  const gridEl = document.getElementById('resourceCardsGrid');
  if (!gridEl || !db.resources) return;

  const categories = ['all', ...Array.from(new Set(db.resources.map(r => r.category)))];

  chipsEl.innerHTML = categories.map(cat => `
    <button type="button" class="chip ${currentResFilter === cat ? 'active' : ''}" data-cat="${esc(cat)}">
      ${cat === 'all' ? 'All Creative Resources' : esc(cat)}
    </button>
  `).join('');

  chipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentResFilter = btn.dataset.cat;
      renderResources();
    });
  });

  const list = currentResFilter === 'all' ? db.resources : db.resources.filter(r => r.category === currentResFilter);

  gridEl.innerHTML = list.map(item => `
    <div class="resource-card glass-panel">
      <div class="res-top">
        <div>
          <span class="res-cat-badge">${esc(item.category)}</span>
          <h3 class="res-name">${esc(item.name)}</h3>
        </div>
        <span class="res-license-pill">${esc(item.license)}</span>
      </div>
      <p class="res-desc">${esc(item.description)}</p>

      <div class="res-terms-row">
        <span class="res-term-badge term-commercial">
          Commercial: <strong>${esc(item.commercial_use)}</strong>
        </span>
        <span class="res-term-badge term-attribution">
          Attribution: <strong>${esc(item.attribution)}</strong>
        </span>
      </div>

      <div class="res-highlight-box">
        <span class="highlight-star">✨</span>
        <small>${esc(item.highlight)}</small>
      </div>

      <div class="res-footer">
        <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
          Browse Library ↗
        </a>
      </div>
    </div>
  `).join('');
}

// ---- Free Learning & Practice Labs -----------------------------------------
let currentLearnFilter = 'all';
function renderLearning() {
  const chipsEl = document.getElementById('learningFilterChips');
  const gridEl = document.getElementById('learningCardsGrid');
  if (!gridEl || !db.learning) return;

  const categories = ['all', ...Array.from(new Set(db.learning.map(l => l.category)))];

  chipsEl.innerHTML = categories.map(cat => `
    <button type="button" class="chip ${currentLearnFilter === cat ? 'active' : ''}" data-cat="${esc(cat)}">
      ${cat === 'all' ? 'All Learning & Labs' : esc(cat)}
    </button>
  `).join('');

  chipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLearnFilter = btn.dataset.cat;
      renderLearning();
    });
  });

  const list = currentLearnFilter === 'all' ? db.learning : db.learning.filter(l => l.category === currentLearnFilter);

  gridEl.innerHTML = list.map(item => {
    const hasCert = (item.has_certificate || '').toLowerCase().startsWith('yes');
    return `
      <div class="learning-card glass-panel">
        <div class="learning-card-top">
          <div>
            <span class="learn-software-badge">${esc(item.software || item.category)}</span>
            <h3 class="learn-title">${esc(item.title)}</h3>
            <span class="learn-provider">By ${esc(item.provider)}</span>
          </div>
          <span class="learn-cost-badge">${esc(item.cost_model)}</span>
        </div>

        <p class="learn-desc">${esc(item.description)}</p>

        <div class="learn-spec-row">
          <div class="cert-status-badge ${hasCert ? 'cert-free' : 'cert-none'}">
            <span class="cert-icon">${hasCert ? '🎓' : '🛠️'}</span>
            <span>Certificate: <strong>${esc(item.has_certificate)}</strong></span>
          </div>
          <div class="learn-format-pill">
            <span>Format: <strong>${esc(item.format)}</strong></span>
          </div>
        </div>

        <div class="learning-footer">
          <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            Start Free Course ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// ---- Free Games ------------------------------------------------------------
let currentGamesFilter = 'all';
function renderGames() {
  const chipsEl = document.getElementById('gamesFilterChips');
  const gridEl = document.getElementById('gamesCardsGrid');
  if (!gridEl || !db.games) return;

  const categories = ['all', ...Array.from(new Set(db.games.map(g => g.category)))];

  chipsEl.innerHTML = categories.map(cat => `
    <button type="button" class="chip ${currentGamesFilter === cat ? 'active' : ''}" data-cat="${esc(cat)}">
      ${cat === 'all' ? 'All Free Games' : esc(cat)}
    </button>
  `).join('');

  chipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentGamesFilter = btn.dataset.cat;
      renderGames();
    });
  });

  const list = currentGamesFilter === 'all' ? db.games : db.games.filter(g => g.category === currentGamesFilter);

  gridEl.innerHTML = list.map(item => `
    <div class="game-card glass-panel">
      <div class="game-top">
        <div>
          <span class="game-genre-badge">${esc(item.genre)}</span>
          <h3 class="game-title">${esc(item.title)}</h3>
        </div>
        <span class="game-tier-pill">${esc(item.tier)}</span>
      </div>

      <p class="game-desc">${esc(item.description)}</p>

      <div class="game-monetization-row">
        <span class="monetization-badge">
          🛡️ Monetization: <strong>${esc(item.monetization)}</strong>
        </span>
      </div>

      <div class="game-platforms-row">
        <span class="platforms-label">Platforms:</span>
        ${(item.platforms || []).map(p => `<span class="platform-mini-pill">${esc(p)}</span>`).join('')}
      </div>

      <div class="game-footer">
        <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
          Play / Download ↗
        </a>
      </div>
    </div>
  `).join('');
}

// ---- Software Switching Guides ---------------------------------------------
function renderGuides() {
  const grid = document.getElementById('guidesGrid');
  if (!grid || !db.guides) return;

  grid.innerHTML = db.guides.map(g => `
    <div class="guide-card glass-panel" id="guide-${esc(g.id)}">
      <div class="guide-header">
        <div class="guide-migration-flow">
          <span class="guide-from">${esc(g.from_app)}</span>
          <span class="flow-arrow">➔</span>
          <span class="guide-to">${esc(g.to_app)}</span>
        </div>
        <h3 class="guide-title">${esc(g.title)}</h3>
        <p class="guide-headline">${esc(g.headline)}</p>
      </div>

      <div class="guide-file-formats">
        <div class="format-badge-box">
          <span class="format-box-label">📂 Opens Native:</span>
          <span class="format-tags">${esc(g.file_support.opens_native)}</span>
        </div>
        <div class="format-badge-box">
          <span class="format-box-label">💾 Exports To:</span>
          <span class="format-tags">${esc(g.file_support.exports_to)}</span>
        </div>
      </div>

      <div class="guide-steps-container">
        <h4 class="guide-steps-title">Transition Steps:</h4>
        <div class="guide-steps-list">
          ${g.key_steps.map(step => `
            <div class="guide-step-item">
              <strong>${esc(step.title)}</strong>
              <p>${esc(step.detail)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="guide-gotchas-box">
        <div class="gotcha-head">
          <span>⚠️</span>
          <strong>Critical Gotchas &amp; Workarounds:</strong>
        </div>
        <p>${esc(g.gotchas)}</p>
      </div>
    </div>
  `).join('');
}

// ---- New & Newly Restricted Radar -----------------------------------------
function renderRadar() {
  const timeline = document.getElementById('radarTimeline');
  if (!timeline || !db.radar) return;

  timeline.innerHTML = db.radar.map(entry => {
    let typeClass = 'radar-neutral';
    if (entry.type === 'new-addition') typeClass = 'radar-new';
    else if (entry.type === 'restricted') typeClass = 'radar-restricted';
    else if (entry.type === 'price-increase') typeClass = 'radar-price';
    else if (entry.type === 'warning') typeClass = 'radar-warning';

    return `
      <div class="radar-card glass-panel ${typeClass}">
        <div class="radar-card-top">
          <span class="radar-badge ${typeClass}">${esc(entry.badge)}</span>
          <time class="radar-date">${esc(entry.date)}</time>
        </div>
        <h3 class="radar-tool-name">${esc(entry.name)}</h3>
        <p class="radar-summary">${esc(entry.summary)}</p>
        <div class="radar-impact-box">
          <span class="impact-label">Impact &amp; Free Replacement:</span>
          <p class="impact-text">${esc(entry.impact)}</p>
        </div>
      </div>
    `;
  }).join('');
}

window.addEventListener('hashchange', route);

// ---- Init ------------------------------------------------------------------
renderStats();
renderCalculator();
renderResources();
renderLearning();
renderGames();
renderGuides();
renderRadar();
renderCategories();
renderPlatforms();
renderPopular();
renderFeatured();
renderDeals();
updateStackUI();
route();
