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

const TYPE_BADGE = {
  'open-source': ['Open source', 'badge-open-source'],
  free: ['Free', 'badge-free'],
  freemium: ['Free tier', 'badge-freemium'],
  'source-available': ['Source available', 'badge-freemium'],
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

  return `
  <article class="alt-card glass-panel">
    <a class="shot${alt.screenshot ? '' : ' no-shot'}" href="${esc(alt.website)}" target="_blank" rel="noopener" aria-label="Visit ${esc(alt.name)}">
      ${shot}
      <span class="shot-fallback">${icon}</span>
    </a>
    <div class="alt-body">
      <div class="alt-header">
        ${icon}
        <div class="alt-title-wrap">
          <h3 class="alt-title"><a href="${esc(alt.website)}" target="_blank" rel="noopener">${esc(alt.name)}</a></h3>
          <div class="alt-meta">${stars ? `<span class="stars">${STAR_SVG}${stars}</span>` : ''}<span>${esc(alt.license || 'Open source')}</span></div>
        </div>
        <span class="badge ${(TYPE_BADGE[alt.type] || TYPE_BADGE['open-source'])[1]}">${(TYPE_BADGE[alt.type] || TYPE_BADGE['open-source'])[0]}</span>
      </div>
      <div class="platforms-container">${platforms}</div>
      <p class="alt-summary">${esc(alt.summary || '')}</p>
      ${replaces ? `<div class="replaces"><span>Replaces</span>${replaces}</div>` : ''}
      <div class="features-grid">
        ${pros ? `<div class="feature-list pros"><h4>${CHECK_SVG} Pros</h4><ul>${pros}</ul></div>` : ''}
        ${cons ? `<div class="feature-list cons"><h4>${X_SVG} Cons</h4><ul>${cons}</ul></div>` : ''}
      </div>
      <div class="alt-footer">
        <span class="difficulty-badge">Switching: ${esc(alt.switching_difficulty || 'unknown')}</span>
        <div class="btn-row">
          ${repoBtn}
          <a class="btn btn-primary" href="${esc(alt.website)}" target="_blank" rel="noopener">Get ${esc(alt.name)}</a>
        </div>
      </div>
    </div>
  </article>`;
}

export function dealHtml(deal) {
  return `
  <aside class="deal-card glass-panel">
    <span class="ad-label">Sponsored</span>
    <h3>${esc(deal.title)}</h3>
    <p>${esc(deal.text)}</p>
    <a class="btn btn-primary" href="${esc(deal.url)}" target="_blank" rel="noopener sponsored nofollow">${esc(deal.cta || 'Learn more')}</a>
  </aside>`;
}
