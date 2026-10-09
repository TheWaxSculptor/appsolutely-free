import db from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('appSearch');
  const resultsArea = document.getElementById('resultsArea');
  const initialState = document.getElementById('initialState');
  const popularChips = document.getElementById('popularChips');

  // Populate popular chips
  db.apps.forEach(app => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = app.name;
    chip.addEventListener('click', () => {
      searchInput.value = app.name;
      handleSearch(app.name);
    });
    popularChips.appendChild(chip);
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
      <div class="app-header">
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
      appAlternatives.forEach(alt => {
        
        const prosHtml = alt.pros ? alt.pros.map(p => `<li>${p}</li>`).join('') : '';
        const consHtml = alt.cons ? alt.cons.map(c => `<li>${c}</li>`).join('') : '';

        html += `
          <div class="alt-card glass-panel">
            <div class="alt-header">
              <a href="${alt.website}" target="_blank" class="alt-title">${alt.name}</a>
              <span class="badge badge-open-source">${alt.type || 'open-source'}</span>
            </div>
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
      });
    }

    html += `</div>`;
    resultsArea.innerHTML = html;
  }
});
