// Shared by the browser (app.js) and the static page generator (build-data.js).

export const CATEGORIES = [
  { id: 'design', label: 'Design & Illustration', emoji: '🎨', blurb: 'Free alternatives to Photoshop, Illustrator, and Figma.' },
  { id: 'photo', label: 'Photo Editing', emoji: '📷', blurb: 'RAW processing and photo workflows without a subscription.' },
  { id: 'video', label: 'Video & Animation', emoji: '🎬', blurb: 'Edit, composite, and record video for free.' },
  { id: 'audio', label: 'Audio & Music', emoji: '🎧', blurb: 'Record, mix, and compose with open-source studios.' },
  { id: 'office', label: 'Office & Documents', emoji: '📄', blurb: 'Documents, PDFs, diagrams, and email without Microsoft 365.' },
  { id: 'productivity', label: 'Notes & Productivity', emoji: '📝', blurb: 'Notes, tasks, budgeting, and scheduling you control.' },
  { id: 'communication', label: 'Chat & Meetings', emoji: '💬', blurb: 'Team chat and video calls without per-seat pricing.' },
  { id: 'security', label: 'Security & Privacy', emoji: '🔐', blurb: 'Password managers, 2FA apps, and private VPNs.' },
  { id: 'cloud', label: 'Cloud & Storage', emoji: '☁️', blurb: 'Sync files and photos on your terms.' },
  { id: 'media', label: 'Media & Streaming', emoji: '📺', blurb: 'Music, podcasts, audiobooks, and media servers.' },
  { id: 'dev', label: 'Developer Tools', emoji: '💻', blurb: 'Editors, API clients, and backends you can own.' },
  { id: '3d-cad', label: '3D & CAD', emoji: '🧊', blurb: 'Model, design, and engineer without a license fee.' },
  { id: 'business', label: 'Business & Analytics', emoji: '📊', blurb: 'Analytics, dashboards, email, and automation.' },
  { id: 'utilities', label: 'System Utilities', emoji: '🛠️', blurb: 'Archivers, VMs, remote desktop, and cleanup tools.' },
];

export const PLATFORMS = [
  { id: 'windows', label: 'Windows', emoji: '🪟' },
  { id: 'macos', label: 'Mac', emoji: '🍎' },
  { id: 'linux', label: 'Linux', emoji: '🐧' },
  { id: 'ios', label: 'iPhone / iPad', emoji: '📱' },
  { id: 'android', label: 'Android', emoji: '🤖' },
  { id: 'web', label: 'Web', emoji: '🌐' },
  { id: 'self-hosted', label: 'Self-Hosted', emoji: '🖥️' },
];

const PLATFORM_LABEL = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.label]));

const COST_BADGES = {
  'zero-cost': ['$0 to use', 'badge-zero-cost'],
  'limited-free': ['Limited free plan', 'badge-limited-free'],
  'self-hosted': ['Requires hosting/hardware', 'badge-self-hosted'],
};

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function formatStars(n) {
  if (!n) return '';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

const STAR_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';
const CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const X_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';

/**
 * @param alt            alternative record
 * @param appsById       map of paid-app id -> app record (for "replaces" chips)
 * @param opts.base      URL prefix for internal links ('' in the SPA, '/' on static pages)
 */
export function cardHtml(alt, appsById = {}, opts = {}) {
  const base = opts.base ?? '/';
  const initial = esc((alt.name || '?').trim().charAt(0).toUpperCase());
  const stars = alt.health && alt.health.stars ? formatStars(alt.health.stars) : '';
  const platforms = (alt.platforms || []).map((p) => `<span class="platform-badge">${esc(PLATFORM_LABEL[p] || p)}</span>`).join('');
  const replaces = (alt.replaces || [])
    .map((id) => appsById[id])
    .filter(Boolean)
    .map((a) => `<a class="replace-chip" href="${base}alternatives/${esc(a.id)}/">${esc(a.name)}</a>`)
    .join('');
  const pros = (alt.pros || []).slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join('');
  const cons = (alt.cons || []).slice(0, 2).map((c) => `<li>${esc(c)}</li>`).join('');
  const shot = alt.screenshot
    ? `<img class="shot-img" src="${base}${esc(alt.screenshot)}" alt="Screenshot of ${esc(alt.name)}" loading="lazy" width="800" height="500" onerror="this.parentNode.classList.add('no-shot');this.remove()">`
    : '';
  const icon = alt.domain
    ? `<img class="app-icon" src="https://www.google.com/s2/favicons?domain=${esc(alt.domain)}&sz=64" alt="" width="40" height="40" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'app-icon app-icon-fallback',textContent:'${initial}'}))">`
    : `<span class="app-icon app-icon-fallback">${initial}</span>`;
  const repoBtn = alt.repo && alt.repo.url
    ? `<a class="btn btn-ghost" href="${esc(alt.repo.url)}" target="_blank" rel="noopener">Source code</a>`
    : '';

  const cost = COST_BADGES[alt.cost_tier] || COST_BADGES['zero-cost'];
  const osBadge = alt.is_open_source ? '<span class="badge badge-open-source">Open source</span>' : '';
  const costBadge = `<span class="badge ${cost[1]}">${cost[0]}</span>`;
  const lastChecked = alt.last_verified ? `<span class="last-checked" title="Information verified by editors">✓ Last checked: ${esc(alt.last_verified)}</span>` : '';
  const warningBox = alt.warnings && alt.warnings.length
    ? `<div class="card-warning-box"><span class="warn-icon" aria-hidden="true">⚠️</span><div class="warn-content"><strong>Important limitation:</strong> ${esc(alt.warnings[0].text || alt.warnings[0])}</div></div>`
    : '';

  return `
  <article class="alt-card glass-panel" data-id="${esc(alt.id)}" data-type="${esc(alt.cost_tier || 'zero-cost')}" data-cost="${esc(alt.cost_tier || 'zero-cost')}" data-opensource="${alt.is_open_source ? 'true' : 'false'}" data-stars="${alt.health?.stars || 0}" data-difficulty="${esc(alt.switching_difficulty || 'moderate')}" data-name="${esc(alt.name)}">
    <a class="shot${alt.screenshot ? '' : ' no-shot'}" href="${esc(alt.website)}" target="_blank" rel="noopener" aria-label="Visit ${esc(alt.name)}">
      ${shot}
      <span class="shot-fallback">${icon}</span>
    </a>
    <div class="alt-body">
      <div class="alt-header">
        ${icon}
        <div class="alt-title-wrap">
          <h3 class="alt-title"><a href="${esc(alt.website)}" target="_blank" rel="noopener">${esc(alt.name)}</a></h3>
          <div class="alt-meta">
            ${stars ? `<span class="stars">${STAR_SVG}${stars}</span>` : ''}
            <span>${esc(alt.license || 'Free')}</span>
            ${lastChecked}
          </div>
        </div>
        <div class="header-badges">
          <button class="btn-icon bookmark-btn" type="button" data-id="${esc(alt.id)}" data-name="${esc(alt.name)}" title="Save to My Free Stack" aria-label="Save ${esc(alt.name)} to stack">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button class="btn-icon share-btn" type="button" data-id="${esc(alt.id)}" data-name="${esc(alt.name)}" data-url="${esc(alt.website)}" title="Share alternative" aria-label="Share ${esc(alt.name)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>
      <div class="badges-row">
        ${osBadge}
        ${costBadge}
      </div>
      <div class="platforms-container">${platforms}</div>
      <p class="alt-summary">${esc(alt.summary || '')}</p>
      ${replaces ? `<div class="replaces"><span>Replaces</span>${replaces}</div>` : ''}
      ${warningBox}
      <div class="features-grid">
        ${pros ? `<div class="feature-list pros"><h4>${CHECK_SVG} Pros</h4><ul>${pros}</ul></div>` : ''}
        ${cons ? `<div class="feature-list cons"><h4>${X_SVG} Cons</h4><ul>${cons}</ul></div>` : ''}
      </div>
      <div class="alt-footer">
        <div class="footer-left-info">
          <span class="difficulty-badge">Switching: ${esc(alt.switching_difficulty || 'unknown')}</span>
          <button class="report-btn" type="button" data-id="${esc(alt.id)}" data-name="${esc(alt.name)}">Report outdated information</button>
        </div>
        <div class="btn-row">
          ${repoBtn}
          <a class="btn btn-primary" href="${esc(alt.website)}" target="_blank" rel="noopener">Get ${esc(alt.name)}</a>
        </div>
      </div>
    </div>
  </article>`;
}

export function displayAdHtml(deal, opts = {}) {
  if (!deal) return '';
  const options = (typeof opts === 'object' && !Array.isArray(opts) && opts !== null) ? opts : {};
  const base = options.base ?? '/';
  const imgUrl = deal.image ? (deal.image.startsWith('http') || deal.image.startsWith('/') ? deal.image : `${base}${deal.image}`) : '';
  const discount = deal.discount ? `<span class="partner-discount-tag">${esc(deal.discount)}</span>` : '';
  const rating = deal.rating ? `<span class="partner-rating-pill">${esc(deal.rating)}</span>` : '';
  const promo = deal.promo_highlight || 'EXCLUSIVE PARTNER DEAL';
  const perksHtml = (deal.perks || []).slice(0, 3).map((p) => `<li><span class="partner-check-icon">✓</span> <span>${esc(p)}</span></li>`).join('');

  return `
  <div class="partner-billboard display-ad-billboard glass-panel" data-partner-id="${esc(deal.id)}">
    <div class="partner-billboard-grid ad-billboard-grid">
      <div class="partner-billboard-media ad-billboard-media">
        ${imgUrl ? `<img class="partner-billboard-img ad-billboard-img" src="${esc(imgUrl)}" alt="${esc(deal.title)}" loading="lazy" width="720" height="400">` : `<div class="partner-fallback-visual ad-fallback-visual"><span class="partner-fallback-emoji ad-fallback-emoji">${deal.icon || '⚡'}</span></div>`}
        <div class="partner-media-badges ad-media-badges">
          <span class="partner-pill ad-pill sponsored">FEATURED PARTNER</span>
          ${discount}
        </div>
      </div>
      <div class="partner-billboard-info ad-billboard-info">
        <div class="partner-billboard-header ad-billboard-header">
          <span class="partner-pill ad-pill highlight">${esc(promo)}</span>
          <span class="partner-partner-label ad-partner-label">${esc(deal.badge || 'Verified Partner')}</span>
          ${rating}
        </div>
        <h3 class="partner-billboard-title ad-billboard-title">
          <a href="${esc(deal.url)}" target="_blank" rel="noopener sponsored nofollow">${esc(deal.title)}</a>
        </h3>
        <p class="partner-billboard-desc ad-billboard-desc">${esc(deal.text)}</p>
        ${perksHtml ? `<ul class="partner-perks-list ad-perks-list">${perksHtml}</ul>` : ''}
        <div class="partner-billboard-footer ad-billboard-footer">
          <a href="${esc(deal.url)}" target="_blank" rel="noopener sponsored nofollow" class="btn btn-primary btn-partner-cta btn-ad-cta">
            <span>${esc(deal.cta || 'Claim Offer')}</span> <span class="arrow" aria-hidden="true">↗</span>
          </a>
          <span class="partner-disclosure-note ad-disclosure-note">Official Verified Partner • Direct link with discount</span>
        </div>
      </div>
    </div>
  </div>`;
}

export function dealHtml(deal, opts = {}) {
  if (!deal) return '';
  const options = (typeof opts === 'object' && !Array.isArray(opts) && opts !== null) ? opts : {};
  const base = options.base ?? '/';
  const label = deal.badge || (deal.is_sponsored ? 'Sponsored Partner' : 'Optional Paid Service');
  const promo = deal.promo_highlight || 'EXCLUSIVE DEAL';
  const discount = deal.discount ? `<span class="partner-discount-tag">${esc(deal.discount)}</span>` : '';
  const rating = deal.rating ? `<span class="partner-rating-pill">${esc(deal.rating)}</span>` : '';
  const imgUrl = deal.image ? (deal.image.startsWith('http') || deal.image.startsWith('/') ? deal.image : `${base}${deal.image}`) : '';
  const perksHtml = (deal.perks || []).slice(0, 3).map((p) => `<li><span class="partner-check-icon">✓</span> <span>${esc(p)}</span></li>`).join('');

  return `
  <aside class="deal-card partner-spotlight-card display-ad-card glass-panel" data-partner-id="${esc(deal.id)}">
    <div class="partner-card-media-wrap ad-card-media-wrap">
      ${imgUrl ? `<img class="partner-card-img ad-card-img" src="${esc(imgUrl)}" alt="${esc(deal.title)}" loading="lazy" width="600" height="340">` : `<div class="partner-fallback-visual ad-fallback-visual"><span class="partner-fallback-emoji ad-fallback-emoji">${deal.icon || '⚡'}</span></div>`}
      <div class="partner-media-badges ad-media-badges">
        <span class="partner-pill ad-pill sponsored">PARTNER</span>
        ${discount}
      </div>
    </div>
    <div class="partner-card-content ad-card-content">
      <div class="partner-card-top-row ad-card-top-row">
        <span class="partner-partner-name ad-partner-name">${esc(label)}</span>
        ${rating}
      </div>
      <h3 class="partner-card-title ad-card-title"><a href="${esc(deal.url)}" target="_blank" rel="noopener sponsored nofollow">${esc(deal.title)}</a></h3>
      <p class="partner-card-desc ad-card-desc">${esc(deal.text)}</p>
      ${perksHtml ? `<ul class="partner-perks-list ad-perks-list">${perksHtml}</ul>` : ''}
      <div class="partner-card-actions ad-card-actions">
        <a href="${esc(deal.url)}" target="_blank" rel="noopener sponsored nofollow" class="btn btn-primary btn-partner-cta btn-ad-cta">
          <span>${esc(deal.cta || 'Claim Offer')}</span> <span class="arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </aside>`;
}



