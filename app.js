import db from './data.js?v=12';
import { cardHtml, dealHtml, displayAdHtml, developerAdHtml, esc, CATEGORIES, PLATFORMS, formatStars } from './card.mjs?v=12';

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
const USER_SUBS_KEY = 'appsolutely_user_subs_v1';

function getStack() {
  try { return JSON.parse(localStorage.getItem(STACK_KEY)) || []; } catch (e) { return []; }
}
function setStack(list) {
  localStorage.setItem(STACK_KEY, JSON.stringify(list));
  updateStackUI();
}
function getUserSubs() {
  try { return JSON.parse(localStorage.getItem(USER_SUBS_KEY)) || []; } catch (e) { return []; }
}
function setUserSubs(list) {
  localStorage.setItem(USER_SUBS_KEY, JSON.stringify(list));
  updateStackUI();
  syncCalculatorSelections();
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
  const drawerSubsSection = document.getElementById('drawerSubsSection');
  const drawerSubsList = document.getElementById('drawerSubsList');

  if (drawerBody) {
    if (!stack.length) {
      drawerBody.innerHTML = `<div class="empty-stack"><span class="empty-icon">📂</span><p>Your stack is empty.</p><small>Click the bookmark icon on any card to build your personalized free software stack!</small></div>`;
      if (drawerSub) drawerSub.textContent = '0 saved tools';
      if (drawerTotal) {
        drawerTotal.textContent = '$0 / yr';
        drawerTotal.classList.remove('loss');
      }
      if (drawerReplacedSub) drawerReplacedSub.textContent = '';
      if (drawerSubsSection) drawerSubsSection.classList.add('hidden');
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

      // Find all paid tools that these saved alternatives actually replace
      const candidateAppIds = new Set();
      items.forEach((a) => {
        (a.replaces || []).forEach((r) => candidateAppIds.add(r));
      });
      const candidateArr = [...candidateAppIds];
      const userSubs = getUserSubs();

      if (candidateArr.length > 0) {
        if (drawerSubsSection) drawerSubsSection.classList.remove('hidden');
        if (drawerSubsList) {
          drawerSubsList.innerHTML = candidateArr.map((appId) => {
            const isChecked = userSubs.includes(appId);
            const price = customPrices[appId] !== undefined ? customPrices[appId] : (APP_PRICES[appId] || 0);
            const appObj = appsById[appId];
            const appName = appObj ? appObj.name : appId;
            return `
              <label class="drawer-sub-row">
                <span class="drawer-sub-label">
                  <input type="checkbox" class="drawer-sub-chk" value="${esc(appId)}" ${isChecked ? 'checked' : ''}>
                  ${esc(appName)}
                </span>
                <span class="drawer-sub-price" onclick="event.stopPropagation()">
                  $<input type="number" class="drawer-cost-input" value="${price > 0 ? price : ''}" placeholder="${price > 0 ? price : '0'}" data-id="${esc(appId)}" min="0" step="5" aria-label="${esc(appName)} annual cost">/yr
                </span>
              </label>
            `;
          }).join('');

          // Bind checkbox toggles
          drawerSubsList.querySelectorAll('.drawer-sub-chk').forEach((chk) => {
            chk.addEventListener('change', () => {
              const current = getUserSubs();
              const next = chk.checked ? [...new Set([...current, chk.value])] : current.filter((x) => x !== chk.value);
              setUserSubs(next);
            });
          });

          // Bind editable price inputs
          drawerSubsList.querySelectorAll('.drawer-cost-input').forEach((inp) => {
            inp.addEventListener('input', (e) => {
              const appId = e.target.dataset.id;
              const val = Math.max(0, Number(e.target.value) || 0);
              customPrices[appId] = val;
              const calcInp = document.querySelector(`.calc-cost-input[data-id="${appId}"]`);
              if (calcInp) calcInp.value = val;
              updateStackUI();
              updateCalculatorTotal();
            });
          });
        }
      } else {
        if (drawerSubsSection) drawerSubsSection.classList.add('hidden');
      }

      // Calculate strictly based on subscriptions the visitor ACTUALLY pays for
      let verifiedGross = 0;
      let activePaidCount = 0;
      candidateArr.forEach((appId) => {
        if (userSubs.includes(appId)) {
          const price = customPrices[appId] !== undefined ? customPrices[appId] : (APP_PRICES[appId] || 0);
          verifiedGross += price;
          activePaidCount++;
        }
      });

      const netSavings = verifiedGross - replacementExpense;

      if (drawerSub) {
        drawerSub.textContent = `${items.length} saved ${items.length === 1 ? 'tool' : 'tools'} · ${candidateArr.length} potential replacement${candidateArr.length === 1 ? '' : 's'}`;
      }

      if (drawerTotal) {
        if (activePaidCount === 0) {
          drawerTotal.textContent = '$0 / yr';
          drawerTotal.classList.remove('loss');
        } else if (netSavings < 0) {
          drawerTotal.textContent = `-$${Math.abs(netSavings).toLocaleString()} / yr`;
          drawerTotal.classList.add('loss');
        } else {
          drawerTotal.textContent = `$${netSavings.toLocaleString()} / yr`;
          drawerTotal.classList.remove('loss');
        }
      }

      if (drawerReplacedSub) {
        if (candidateArr.length === 0) {
          drawerReplacedSub.textContent = 'Save tools that replace paid software to calculate your subscription savings.';
        } else if (activePaidCount === 0) {
          drawerReplacedSub.textContent = 'Check the subscriptions you actually pay for above to calculate verified savings.';
        } else if (netSavings < 0) {
          drawerReplacedSub.textContent = `Replacement costs exceed savings by $${Math.abs(netSavings).toLocaleString()}/year ($${verifiedGross.toLocaleString()}/yr subscriptions − $${replacementExpense.toLocaleString()}/yr replacement expenses).`;
        } else {
          drawerReplacedSub.textContent = `Verified savings from ${activePaidCount} subscription${activePaidCount === 1 ? '' : 's'}${replacementExpense > 0 ? ` after subtracting $${replacementExpense}/yr replacement costs` : ''}.`;
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

// ---- Reusable Card Renderers (Apps, Resources, Learning, Games, Guides) -----
function renderResourceCard(item) {
  return `
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
  `;
}

function renderLearningCard(item) {
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
}

function renderGameCard(item) {
  return `
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
  `;
}

function renderGuideCard(g) {
  return `
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
          <span class="format-tags">${esc(g.file_support ? g.file_support.opens_native : '')}</span>
        </div>
        <div class="format-badge-box">
          <span class="format-box-label">💾 Exports To:</span>
          <span class="format-tags">${esc(g.file_support ? g.file_support.exports_to : '')}</span>
        </div>
      </div>

      <div class="guide-steps-container">
        <h4 class="guide-steps-title">Transition Steps:</h4>
        <div class="guide-steps-list">
          ${(g.key_steps || []).map(step => `
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
  `;
}

// ---- Results Rendering & Filtering -----------------------------------------
let currentResults = [];
let currentCostFilter = 'all'; // 'all', 'zero-cost', 'limited-free', 'self-hosted'
let openSourceOnly = false;
let currentSort = 'default';
let currentUnifiedResults = null;
let currentSearchType = 'all';

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

function renderTypeChips(resultsObj) {
  const { alts, learning, resources, games, guides } = resultsObj;
  const total = alts.length + learning.length + resources.length + games.length + guides.length;

  return `
    <div class="search-type-filters" role="tablist" aria-label="Filter results by category">
      <button class="type-chip ${currentSearchType === 'all' ? 'active' : ''}" type="button" data-type="all">
        <span>All Results</span>
        <span class="type-chip-count">${total}</span>
      </button>
      ${alts.length ? `<button class="type-chip ${currentSearchType === 'apps' ? 'active' : ''}" type="button" data-type="apps">
        <span>💻 Apps &amp; Tools</span>
        <span class="type-chip-count">${alts.length}</span>
      </button>` : ''}
      ${learning.length ? `<button class="type-chip ${currentSearchType === 'learning' ? 'active' : ''}" type="button" data-type="learning">
        <span>🎓 Courses &amp; Labs</span>
        <span class="type-chip-count">${learning.length}</span>
      </button>` : ''}
      ${resources.length ? `<button class="type-chip ${currentSearchType === 'resources' ? 'active' : ''}" type="button" data-type="resources">
        <span>🎨 Creative Assets</span>
        <span class="type-chip-count">${resources.length}</span>
      </button>` : ''}
      ${games.length ? `<button class="type-chip ${currentSearchType === 'games' ? 'active' : ''}" type="button" data-type="games">
        <span>🎮 Free Games</span>
        <span class="type-chip-count">${games.length}</span>
      </button>` : ''}
      ${guides.length ? `<button class="type-chip ${currentSearchType === 'guides' ? 'active' : ''}" type="button" data-type="guides">
        <span>🗺️ Guides</span>
        <span class="type-chip-count">${guides.length}</span>
      </button>` : ''}
    </div>
  `;
}

function renderUnifiedContent() {
  if (!currentUnifiedResults) return '';
  const { alts, learning, resources, games, guides } = currentUnifiedResults;
  const sections = [];

  const showApps = (currentSearchType === 'all' || currentSearchType === 'apps') && alts.length > 0;
  const showLearning = (currentSearchType === 'all' || currentSearchType === 'learning') && learning.length > 0;
  const showResources = (currentSearchType === 'all' || currentSearchType === 'resources') && resources.length > 0;
  const showGames = (currentSearchType === 'all' || currentSearchType === 'games') && games.length > 0;
  const showGuides = (currentSearchType === 'all' || currentSearchType === 'guides') && guides.length > 0;

  if (showApps) {
    sections.push(`
      <div class="search-group-section">
        ${currentSearchType === 'all' ? `
          <div class="search-group-head">
            <h3 class="search-group-title">💻 Free Software Alternatives</h3>
            <span class="search-group-count">${alts.length} found</span>
          </div>` : ''}
        ${renderFilterBar(alts.length)}
        <div class="alts-grid" id="altsGrid">${renderCardsWithState(alts)}</div>
      </div>
    `);
  }

  if (showLearning) {
    sections.push(`
      <div class="search-group-section">
        ${currentSearchType === 'all' ? `
          <div class="search-group-head">
            <h3 class="search-group-title">🎓 Free Courses &amp; Practice Labs</h3>
            <span class="search-group-count">${learning.length} found</span>
          </div>` : ''}
        <div class="learning-cards-grid">${learning.map(renderLearningCard).join('')}</div>
      </div>
    `);
  }

  if (showResources) {
    sections.push(`
      <div class="search-group-section">
        ${currentSearchType === 'all' ? `
          <div class="search-group-head">
            <h3 class="search-group-title">🎨 Free Creative Resources</h3>
            <span class="search-group-count">${resources.length} found</span>
          </div>` : ''}
        <div class="resource-cards-grid">${resources.map(renderResourceCard).join('')}</div>
      </div>
    `);
  }

  if (showGames) {
    sections.push(`
      <div class="search-group-section">
        ${currentSearchType === 'all' ? `
          <div class="search-group-head">
            <h3 class="search-group-title">🎮 Free &amp; Open Source Games</h3>
            <span class="search-group-count">${games.length} found</span>
          </div>` : ''}
        <div class="games-cards-grid">${games.map(renderGameCard).join('')}</div>
      </div>
    `);
  }

  if (showGuides) {
    sections.push(`
      <div class="search-group-section">
        ${currentSearchType === 'all' ? `
          <div class="search-group-head">
            <h3 class="search-group-title">🗺️ Software Switching Guides</h3>
            <span class="search-group-count">${guides.length} found</span>
          </div>` : ''}
        <div class="guides-grid">${guides.map(renderGuideCard).join('')}</div>
      </div>
    `);
  }

  return sections.join('');
}

function updateUnifiedResultsView() {
  const container = document.getElementById('unifiedResultsContainer');
  const chipsWrap = document.getElementById('searchTypeChipsWrap');
  if (chipsWrap && currentUnifiedResults) {
    chipsWrap.innerHTML = renderTypeChips(currentUnifiedResults);
  }
  if (container) {
    container.innerHTML = renderUnifiedContent();
    bindResultsEvents();
    updateStackUI();
  }
}

const getAdUnitResults = () => {
  const deal = (db.deals && db.deals.find((d) => d.id === 'retouch4me')) || (db.deals && db.deals[0]);
  return `
  <div class="partner-spotlight-slot partner-spotlight-results" aria-label="Sponsored Partner Offer">
    ${displayAdHtml(deal, { base: '' })}
  </div>`;

};

function triggerAdSense() {
  // Pure affiliate banner architecture — no external ad scripts needed
}

const showResults = (headerHtml, resultsList, { shouldScroll = false } = {}) => {
  currentResults = resultsList;
  currentUnifiedResults = null;
  currentSearchType = 'all';
  currentCostFilter = 'all';
  openSourceOnly = false;
  currentSort = 'default';
  initialState.classList.add('hidden');
  resultsArea.classList.remove('hidden');

  resultsArea.innerHTML = `
    ${headerHtml}
    ${renderFilterBar(resultsList.length)}
    <div class="alts-grid" id="altsGrid">${renderCardsWithState(resultsList)}</div>
    ${getAdUnitResults()}
  `;

  bindResultsEvents();
  updateStackUI();
  triggerAdSense(resultsArea);
  if (shouldScroll) {
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function bindResultsEvents() {
  const chipsWrap = resultsArea.querySelector('#searchTypeChipsWrap') || resultsArea;
  chipsWrap.querySelectorAll('.type-chip').forEach((chip) => {
    chip.onclick = (e) => {
      e.preventDefault();
      currentSearchType = chip.dataset.type;
      updateUnifiedResultsView();
    };
  });

  const bar = resultsArea.querySelector('.filter-sort-bar');
  if (bar) {
    bar.onclick = (e) => {
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
    };
    const sortSelect = bar.querySelector('#sortSelect');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        currentSort = e.target.value;
        updateResultsGrid();
      };
    }
  }
}

// When searching, hero collapses to top and results sit directly under search box.
function alignSearchBar() {
  if (window.scrollY > 0) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

const showHome = () => {
  document.body.classList.remove('is-searching');
  resultsArea.classList.add('hidden');
  resultsArea.innerHTML = '';
  currentUnifiedResults = null;
  currentSearchType = 'all';
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
  document.getElementById('dealGrid').innerHTML = db.deals.map((d) => dealHtml(d, { base: '' })).join('');
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
  const userSubs = getUserSubs();
  grid.innerHTML = POPULAR_SUBSCRIPTIONS.map((s) => `
    <label class="calc-item glass-panel ${userSubs.includes(s.id) ? 'selected' : ''}" data-id="${s.id}">
      <input type="checkbox" name="sub" value="${s.id}" ${userSubs.includes(s.id) ? 'checked' : ''}>
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

  grid.addEventListener('change', () => {
    const checked = [...grid.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value);
    localStorage.setItem(USER_SUBS_KEY, JSON.stringify(checked));
    updateCalculatorTotal();
    updateStackUI();
  });

  grid.addEventListener('input', (e) => {
    if (e.target.classList.contains('calc-cost-input')) {
      const id = e.target.dataset.id;
      const val = Math.max(0, Number(e.target.value) || 0);
      customPrices[id] = val;
      updateCalculatorTotal();
      updateStackUI();
    }
  });

  const expenseInput = document.getElementById('calcExpenseInput');
  if (expenseInput) {
    expenseInput.addEventListener('input', (e) => {
      replacementExpense = Math.max(0, Number(e.target.value) || 0);
      updateCalculatorTotal();
      updateStackUI();
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
      const netSavings = grossTotal - replacementExpense;

      const headHtml = header(
        netSavings >= 0 
          ? `Your Free Replacements (Potential Net Savings: $${netSavings.toLocaleString()}/yr)`
          : `Your Free Replacements (Replacement costs exceed savings by $${Math.abs(netSavings).toLocaleString()}/year)`,
        `${matchedAlts.length} free alternatives replacing ${checkedNames}. ${replacementExpense > 0 ? `(After subtracting $${replacementExpense.toLocaleString()}/yr self-hosting/hardware expenses)` : ''}`
      );
      showResults(headHtml, matchedAlts, { shouldScroll: true });
      bindBack();
    });
  }

  updateCalculatorTotal();
}

function syncCalculatorSelections() {
  const grid = document.getElementById('calcGrid');
  if (!grid) return;
  const subs = getUserSubs();
  grid.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
    chk.checked = subs.includes(chk.value);
  });
  updateCalculatorTotal();
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

  const netSavings = grossTotal - replacementExpense;

  const totalEl = document.getElementById('calcTotal');
  const currencyPrefix = document.getElementById('calcCurrencyPrefix');
  const savingsLabel = document.getElementById('calcSavingsLabel');
  const lossAlert = document.getElementById('calcLossAlert');
  const lossAmount = document.getElementById('calcLossAmount');
  const countEl = document.getElementById('calcSelectedCount');
  const breakdownEl = document.getElementById('calcBreakdown');
  const actionBtn = document.getElementById('calcActionBtn');

  if (totalEl) {
    if (netSavings < 0) {
      totalEl.textContent = `-${Math.abs(netSavings).toLocaleString()}`;
      totalEl.classList.add('loss');
      if (currencyPrefix) currencyPrefix.classList.add('loss');
      if (savingsLabel) savingsLabel.textContent = 'Net Annual Financial Impact:';
      if (lossAlert) {
        lossAlert.classList.remove('hidden');
        if (lossAmount) lossAmount.textContent = `$${Math.abs(netSavings).toLocaleString()}/year`;
      }
    } else {
      totalEl.textContent = netSavings.toLocaleString();
      totalEl.classList.remove('loss');
      if (currencyPrefix) currencyPrefix.classList.remove('loss');
      if (savingsLabel) savingsLabel.textContent = 'Your Potential Annual Savings:';
      if (lossAlert) lossAlert.classList.add('hidden');
    }
  }

  if (countEl) {
    if (checked.length === 0) {
      countEl.textContent = 'Select subscriptions above to calculate potential savings';
    } else if (netSavings < 0) {
      countEl.innerHTML = `<span class="loss-text">Replacement costs exceed savings by $${Math.abs(netSavings).toLocaleString()}/year</span> (${checked.length} subscription${checked.length === 1 ? '' : 's'} selected)`;
    } else {
      countEl.textContent = `${checked.length} subscription${checked.length === 1 ? '' : 's'} selected · Savings calculated`;
    }
  }
  if (breakdownEl) {
    if (checked.length > 0) {
      if (netSavings < 0) {
        breakdownEl.textContent = `Subscriptions: $${grossTotal.toLocaleString()}/yr − $${replacementExpense.toLocaleString()}/yr replacement expenses = -$${Math.abs(netSavings).toLocaleString()}/yr (Replacement costs exceed savings by $${Math.abs(netSavings).toLocaleString()}/year)`;
      } else {
        breakdownEl.textContent = `Subscriptions: $${grossTotal.toLocaleString()}/yr ${replacementExpense > 0 ? `− $${replacementExpense.toLocaleString()}/yr hosting/hardware = $${netSavings.toLocaleString()}/yr net savings` : '(assumes $0 local installation)'}`;
      }
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
  const qClean = q.replace(/[\s\-_]/g, '');
  const qWords = q.split(/\s+/).filter(Boolean);
  if (searchClear) searchClear.classList.toggle('hidden', !q);
  if (!q) { showHome(); return; }
  document.body.classList.add('is-searching');

  const matchStr = (str) => {
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.includes(q)) return true;
    if (qClean.length >= 3 && lower.replace(/[\s\-_]/g, '').includes(qClean)) return true;
    if (qWords.length > 1 && qWords.every((w) => lower.includes(w))) return true;
    return false;
  };

  // 1. Apps & Alternatives
  const matchedApps = db.apps.filter((a) => hasAlts(a) && (matchStr(a.name) || matchStr(a.id) || matchStr(a.vendor)));
  const appIds = new Set(matchedApps.map((a) => a.id));
  const byReplace = db.alternatives.filter((alt) => (alt.replaces || []).some((id) => appIds.has(id)));
  const byName = db.alternatives.filter((alt) => !byReplace.includes(alt) &&
    (matchStr(alt.name) || matchStr(alt.summary) || matchStr(alt.license) || matchStr(alt.category) || (alt.pros || []).some(matchStr) || (alt.cons || []).some(matchStr)));
  const matchedAlts = [...byReplace, ...byName];

  // 2. Free Courses & Practice Labs
  const matchedLearning = (db.learning || []).filter((item) =>
    matchStr(item.title) ||
    matchStr(item.provider) ||
    matchStr(item.description) ||
    matchStr(item.software) ||
    matchStr(item.category) ||
    matchStr(item.format) ||
    matchStr(item.cost_model)
  );

  // 3. Free Creative Resources
  const matchedResources = (db.resources || []).filter((item) =>
    matchStr(item.name) ||
    matchStr(item.description) ||
    matchStr(item.category) ||
    matchStr(item.highlight) ||
    matchStr(item.license)
  );

  // 4. Free & Open-Source Games
  const matchedGames = (db.games || []).filter((item) =>
    matchStr(item.title) ||
    matchStr(item.description) ||
    matchStr(item.genre) ||
    matchStr(item.category) ||
    (item.platforms || []).some(matchStr) ||
    matchStr(item.monetization)
  );

  // 5. Software Switching Guides
  const matchedGuides = (db.guides || []).filter((item) =>
    matchStr(item.title) ||
    matchStr(item.headline) ||
    matchStr(item.from_app) ||
    matchStr(item.to_app) ||
    matchStr(item.gotchas) ||
    (item.key_steps || []).some(s => matchStr(s.title) || matchStr(s.detail))
  );

  const totalMatches = matchedAlts.length + matchedLearning.length + matchedResources.length + matchedGames.length + matchedGuides.length;

  if (totalMatches === 0) {
    currentUnifiedResults = null;
    showResults(`${header(`No results for “${esc(query)}”`, 'Try searching for an app name like Photoshop, Office, Spotify, or browse categories.')}`, [], { shouldScroll: false });
    bindBack();
    alignSearchBar();
    return;
  }

  currentUnifiedResults = {
    alts: matchedAlts,
    learning: matchedLearning,
    resources: matchedResources,
    games: matchedGames,
    guides: matchedGuides,
  };
  currentSearchType = 'all';
  currentResults = matchedAlts;
  currentCostFilter = 'all';
  openSourceOnly = false;
  currentSort = 'default';

  initialState.classList.add('hidden');
  resultsArea.classList.remove('hidden');

  const title = matchedApps.length
    ? `Free alternatives to ${matchedApps.map((a) => esc(a.name)).join(', ')}`
    : `Results for “${esc(query)}”`;

  const breakdown = [];
  if (matchedAlts.length) breakdown.push(`${matchedAlts.length} ${matchedAlts.length === 1 ? 'app' : 'apps'}`);
  if (matchedLearning.length) breakdown.push(`${matchedLearning.length} ${matchedLearning.length === 1 ? 'course' : 'courses'}`);
  if (matchedResources.length) breakdown.push(`${matchedResources.length} ${matchedResources.length === 1 ? 'resource' : 'resources'}`);
  if (matchedGames.length) breakdown.push(`${matchedGames.length} ${matchedGames.length === 1 ? 'game' : 'games'}`);
  if (matchedGuides.length) breakdown.push(`${matchedGuides.length} ${matchedGuides.length === 1 ? 'guide' : 'guides'}`);

  const sub = `${totalMatches} result${totalMatches === 1 ? '' : 's'} across ${breakdown.length} categorie${breakdown.length === 1 ? 'y' : 's'} (${breakdown.join(' · ')})`;

  resultsArea.innerHTML = `
    ${header(title, sub)}
    <div id="searchTypeChipsWrap">${renderTypeChips(currentUnifiedResults)}</div>
    <div id="unifiedResultsContainer">${renderUnifiedContent()}</div>
    ${getAdUnitResults()}
  `;


  bindResultsEvents();
  bindBack();
  updateStackUI();
  alignSearchBar();
  triggerAdSense(resultsArea);
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
  const feedbackEl = document.getElementById('reportFeedback');
  const submitBtn = document.getElementById('submitReportBtn');
  if (nameInput) nameInput.value = name || id;
  if (idInput) idInput.value = id;
  if (feedbackEl) {
    feedbackEl.className = 'report-feedback hidden';
    feedbackEl.innerHTML = '';
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Report';
  }
  reportModal.classList.remove('hidden');
  reportBackdrop?.classList.remove('hidden');
  document.getElementById('reportDetails')?.focus();
}

function closeReportModal() {
  reportModal?.classList.add('hidden');
  reportBackdrop?.classList.add('hidden');
  if (reportForm) reportForm.reset();
  const feedbackEl = document.getElementById('reportFeedback');
  if (feedbackEl) {
    feedbackEl.className = 'report-feedback hidden';
    feedbackEl.innerHTML = '';
  }
}

closeReportBtn?.addEventListener('click', closeReportModal);
cancelReportBtn?.addEventListener('click', closeReportModal);
reportBackdrop?.addEventListener('click', closeReportModal);

if (reportForm) {
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('reportAppId')?.value || '';
    const name = document.getElementById('reportAppName')?.value || 'Software';
    const reason = document.getElementById('reportReason')?.value || '';
    const details = document.getElementById('reportDetails')?.value || '';
    const email = document.getElementById('reportEmail')?.value || '';
    const btn = document.getElementById('submitReportBtn');
    const fb = document.getElementById('reportFeedback');

    if (btn) { btn.disabled = true; btn.textContent = 'Delivering report...'; }
    if (fb) { fb.className = 'report-feedback info'; fb.innerHTML = 'Connecting to editorial verification endpoint...'; }

    try {
      const res = await fetch('https://formsubmit.co/ajax/support@appsolutelyfree.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          appId: id,
          appName: name,
          reason: reason,
          details: details,
          reporterEmail: email || 'anonymous',
          pageUrl: window.location.href,
          timestamp: new Date().toISOString(),
          _subject: '[Appsolutely Free] Correction Report: ' + name,
          _captcha: 'false',
          _template: 'table'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === true || data.success === 'true')) {
        try {
          const reports = JSON.parse(localStorage.getItem('appsolutely_reports_v1')) || [];
          reports.push({ id, name, reason, details, email, timestamp: new Date().toISOString() });
          localStorage.setItem('appsolutely_reports_v1', JSON.stringify(reports));
        } catch (err) {}

        if (fb) {
          fb.className = 'report-feedback success';
          fb.innerHTML = '✓ Report successfully delivered to our verification team. Thank you!';
        }
        showToast(`✓ Correction report for ${name} delivered.`);
        setTimeout(() => {
          closeReportModal();
          if (btn) { btn.disabled = false; btn.textContent = 'Submit Report'; }
        }, 1800);
      } else {
        const errMsg = data.message || ('Endpoint returned HTTP ' + res.status);
        throw new Error(errMsg);
      }
    } catch (err) {
      const mailtoSub = encodeURIComponent('[Appsolutely Free] Correction Report: ' + name);
      const mailtoBody = encodeURIComponent(
        `Software: ${name} (ID: ${id})\n` +
        `Issue / Reason: ${reason}\n` +
        `Details: ${details}\n` +
        `Reporter Email: ${email || 'Not provided'}\n` +
        `Page: ${window.location.href}`
      );
      const mailtoUrl = `mailto:support@appsolutelyfree.com?subject=${mailtoSub}&body=${mailtoBody}`;

      if (fb) {
        fb.className = 'report-feedback error';
        fb.innerHTML = `
          <p style="margin-bottom:0.35rem;"><strong>⚠️ Automated delivery could not be confirmed:</strong> ${esc(err.message || 'Delivery error')}</p>
          <p style="font-size:0.84rem;margin-bottom:0.5rem;">To ensure your correction reaches our verification desk directly, please send it via email:</p>
          <a href="${mailtoUrl}" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:0.4rem;">
            ✉️ Email to support@appsolutelyfree.com ↗
          </a>
        `;
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Retry Submission'; }
    }
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
// ---- Free Creative Resources (Homepage Preview) ----------------------------
function renderResources() {
  const gridEl = document.getElementById('resourceCardsGrid');
  if (!gridEl || !db.resources) return;
  const list = db.resources.slice(0, 3);
  gridEl.innerHTML = list.map(renderResourceCard).join('');
}

// ---- Free Learning & Practice Labs (Homepage Preview) ----------------------
function renderLearning() {
  const gridEl = document.getElementById('learningCardsGrid');
  if (!gridEl || !db.learning) return;
  const list = db.learning.slice(0, 3);
  gridEl.innerHTML = list.map(renderLearningCard).join('');
}

// ---- Free Games (Homepage Preview) -----------------------------------------
function renderGames() {
  const gridEl = document.getElementById('gamesCardsGrid');
  if (!gridEl || !db.games) return;
  const list = db.games.slice(0, 3);
  gridEl.innerHTML = list.map(renderGameCard).join('');
}

// ---- Software Switching Guides (Homepage Preview) --------------------------
function renderGuides() {
  const grid = document.getElementById('guidesGrid');
  if (!grid || !db.guides) return;
  const list = db.guides.slice(0, 2);
  grid.innerHTML = list.map(renderGuideCard).join('');
}


// ---- Topbar Navigation Integration (Dismiss Search on Section Jump) --------
document.querySelectorAll('.topbar-links a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    const isSearchingOrFiltered = document.body.classList.contains('is-searching') ||
      Boolean(searchInput && searchInput.value) ||
      (resultsArea && !resultsArea.classList.contains('hidden')) ||
      (initialState && initialState.classList.contains('hidden'));

    if (isSearchingOrFiltered) {
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.classList.add('hidden');
      showHome();
      if (targetEl) {
        e.preventDefault();
        history.pushState(null, null, `#${targetId}`);
        requestAnimationFrame(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  });
});


// ---- New & Newly Restricted Radar -----------------------------------------
function renderRadar() {
  const timeline = document.getElementById('radarTimeline');
  if (!timeline || !db.radar) return;

  timeline.innerHTML = db.radar.map(entry => {
    let typeClass = 'radar-neutral';
    if (entry.type === 'directory-addition') typeClass = 'radar-addition';
    else if (entry.type === 'new-launch' || entry.type === 'new-addition') typeClass = 'radar-new';
    else if (entry.type === 'restricted') typeClass = 'radar-restricted';
    else if (entry.type === 'price-increase') typeClass = 'radar-price';
    else if (entry.type === 'abandoned' || entry.type === 'warning') typeClass = 'radar-warning';

    const sourceHtml = entry.source_url ? `
      <div class="radar-source-row">
        <a href="${esc(entry.source_url)}" target="_blank" rel="noopener noreferrer" class="radar-source-link">
          🔗 Official Source: ${esc(entry.source_name || 'Announcement')} ↗
        </a>
        ${entry.last_checked ? `<span class="radar-verified">Verified: ${esc(entry.last_checked)}</span>` : ''}
      </div>
    ` : '';

    return `
      <div class="radar-card glass-panel ${typeClass}">
        <div class="radar-card-top">
          <span class="radar-badge ${typeClass}">${esc(entry.badge)}</span>
          <div class="radar-date-wrap">
            <time class="radar-date">${esc(entry.date)}</time>
            ${entry.event_date ? `<small class="radar-event-date">(${esc(entry.event_date)})</small>` : ''}
          </div>
        </div>
        <h3 class="radar-tool-name">${esc(entry.name)}</h3>
        <p class="radar-summary">${esc(entry.summary)}</p>
        <div class="radar-impact-box">
          <span class="impact-label">Impact &amp; Free Replacement:</span>
          <p class="impact-text">${esc(entry.impact)}</p>
        </div>
        ${sourceHtml}
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

// Handle EthicalAds dynamic ad fill / fallback toggling
document.addEventListener('ea-ad-loaded', () => {
  const fallback = document.getElementById('eaFallbackCard');
  if (fallback) fallback.style.display = 'none';
});
document.addEventListener('ea-ad-empty', () => {
  const fallback = document.getElementById('eaFallbackCard');
  if (fallback) fallback.style.display = 'block';
});
