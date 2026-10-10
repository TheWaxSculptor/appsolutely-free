import db from './data.js?v=4';

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('appSearch');
  const resultsArea = document.getElementById('resultsArea');
  const initialState = document.getElementById('initialState');
  const popularChips = document.getElementById('popularChips');

  // Populate popular chips
  db.apps.forEach((app, index) => {
    const chip = document.createElement('div');
    chip.className = 'chip animate-slide-up';
    chip.style.animationDelay = `${index * 0.05}s`;
    chip.textContent = app.name;
    chip.addEventListener('click', () => {
      searchInput.value = app.name;
      handleSearch(app.name);
    });
    popularChips.appendChild(chip);
  });

  // Attach events to platform chips
  const platformChips = document.querySelectorAll('#platformChips .chip');
  platformChips.forEach((chip, index) => {
    chip.addEventListener('click', () => {
      searchInput.value = '';
      renderAlternativesByPlatform(chip.dataset.platform, chip.textContent);
    });
  });

  searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  function handleSearch(query) {
    if (!query.trim()) {
      resultsArea.classList.add('hidden');
      initialState.classList.remove('hidden');
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchedApp = db.apps.find(a => 
      a.name.toLowerCase().includes(lowerQuery) || 
      (a.id && a.id.toLowerCase().includes(lowerQuery))
    );

    if (matchedApp) {
      renderAppResults(matchedApp);
    } else {
      resultsArea.classList.remove('hidden');
      initialState.classList.add('hidden');
      resultsArea.innerHTML = `<div class="glass-panel" style="padding: 2rem; text-align: center;">No apps found matching "${query}"</div>`;
    }
  }

  function renderAppResults(app) {
    initialState.classList.add('hidden');
    resultsArea.classList.remove('hidden');

    const appAlternatives = db.alternatives.filter(alt => alt.replaces && alt.replaces.includes(app.id));

    let html = `
      <div class="app-header animate-fade-in">
        <div>
          <h2>${app.name}</h2>
          <div class="app-vendor">by ${app.vendor || 'Unknown'}</div>
        </div>
        <div class="app-price">${app.typical_price || app.price_model || 'Paid'}</div>
      </div>
      <div class="alts-grid">
    `;

    if (appAlternatives.length === 0) {
      html += `<div class="glass-panel" style="padding: 2rem; text-align: center;">No alternatives found for this app yet.</div>`;
    } else {
      appAlternatives.forEach((alt, index) => {
        html += generateAltCard(alt, index);
      });
    }

    html += `</div>`;
    resultsArea.innerHTML = html;
  }

  function renderAlternativesByPlatform(platform, platformName) {
    initialState.classList.add('hidden');
    resultsArea.classList.remove('hidden');

    const platformAlts = db.alternatives.filter(alt => alt.platforms && alt.platforms.includes(platform));

    let html = `
      <div class="app-header animate-fade-in">
        <div>
          <h2>Top Apps for ${platformName}</h2>
          <div class="app-vendor">Browse completely free & open-source software for your device</div>
        </div>
      </div>
      <div class="alts-grid">
    `;

    if (platformAlts.length === 0) {
      html += `<div class="glass-panel" style="padding: 2rem; text-align: center;">No apps found for this platform yet.</div>`;
    } else {
      platformAlts.forEach((alt, index) => {
        html += generateAltCard(alt, index);
      });
    }

    html += `</div>`;
    resultsArea.innerHTML = html;
  }

  function generateAltCard(alt, index) {
    const prosHtml = alt.pros ? alt.pros.map(p => `<li>${p}</li>`).join('') : '';
    const consHtml = alt.cons ? alt.cons.map(c => `<li>${c}</li>`).join('') : '';
    
    const platformMap = {
      'windows': 'Windows',
      'macos': 'Mac',
      'linux': 'Linux',
      'web': 'Web',
      'android': 'Android',
      'ios': 'iPhone / iPad',
      'self-hosted': 'Self-Hosted'
    };
    const platformsHtml = alt.platforms ? alt.platforms.map(p => `<span class="platform-badge">${platformMap[p] || p}</span>`).join('') : '';

    return `
      <div class="alt-card glass-panel animate-slide-up" style="animation-delay: ${index * 0.1}s">
        <div class="alt-header">
          <div>
            <a href="${alt.website}" target="_blank" class="alt-title">${alt.name}</a>
            ${alt.health && alt.health.stars ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;"><svg style="vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>${alt.health.stars.toLocaleString()} stars</div>` : ''}
          </div>
          <span class="badge badge-open-source">${alt.type || 'open-source'}</span>
        </div>
        
        ${platformsHtml ? `<div class="platforms-container">${platformsHtml}</div>` : ''}

        <div class="alt-summary">${alt.summary || ''}</div>
        
        <div class="features-grid">
          ${prosHtml ? `
          <div class="feature-list pros">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Pros</h4>
            <ul>${prosHtml}</ul>
          </div>` : ''}
          
          ${consHtml ? `
          <div class="feature-list cons">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Cons</h4>
            <ul>${consHtml}</ul>
          </div>` : ''}
        </div>

        <div class="alt-footer">
          <div><span class="difficulty-badge">Switch Difficulty: ${alt.switching_difficulty || 'unknown'}</span></div>
          <div>License: ${alt.license || 'unknown'}</div>
        </div>
      </div>
    `;
  }

});
