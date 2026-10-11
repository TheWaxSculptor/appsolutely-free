// Generates data.js (for the SPA) plus static, crawlable SEO pages and sitemap.xml.
const fs = require('fs');
const path = require('path');
const { loadAll, root } = require('./scripts/load-all');

const SITE = 'https://appsolutelyFree.com';
const ADSENSE = 'ca-pub-2161345131320461';
const VERSION = '11';

async function main() {
  const { cardHtml, dealHtml, esc, CATEGORIES, categoryById } = await import('./card.mjs');
  const { apps, alts, stacks, resources, learning, games, aiHub, guides, radar } = loadAll();
  const appsById = Object.fromEntries(apps.map((a) => [a.id, a]));
  let deals = [];
  try { deals = JSON.parse(fs.readFileSync(path.join(root, 'data/affiliates.json'), 'utf8')); } catch (e) { /* none */ }

  const reportModalHtml = `
  <div class="modal-backdrop hidden" id="reportModalBackdrop"></div>
  <div class="modal-dialog hidden glass-panel" id="reportModal" role="dialog" aria-modal="true" aria-labelledby="reportModalTitle">
    <div class="modal-header">
      <h3 id="reportModalTitle">Report Outdated Information</h3>
      <button type="button" class="btn-icon modal-close-btn" id="closeReportModalBtn" aria-label="Close dialog">✕</button>
    </div>
    <form id="reportForm" class="modal-body">
      <p class="modal-lead">Help keep Appsolutely Free accurate. If pricing, licensing, or limitations have changed, let us know:</p>
      <div class="form-group">
        <label for="reportAppName">Software Alternative</label>
        <input type="text" id="reportAppName" class="form-input" readonly>
        <input type="hidden" id="reportAppId">
      </div>
      <div class="form-group">
        <label for="reportReason">What needs updating?</label>
        <select id="reportReason" class="form-input form-select" required>
          <option value="pricing">Pricing or Cost Tier (e.g. no longer free / price changed)</option>
          <option value="license">License or Open Source status changed</option>
          <option value="limitation">Missing or changed limitation / warning</option>
          <option value="broken">Broken link, archived repository, or discontinued</option>
          <option value="other">Other correction</option>
        </select>
      </div>
      <div class="form-group">
        <label for="reportDetails">Correction details or source link</label>
        <textarea id="reportDetails" class="form-input form-textarea" rows="3" placeholder="Provide details or paste a URL to official documentation..." required></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="cancelReportBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Report</button>
      </div>
    </form>
  </div>
  <script>
    document.addEventListener('click', function(e) {
      var r = e.target.closest('.report-btn');
      if (r) {
        e.preventDefault();
        var nameEl = document.getElementById('reportAppName');
        var idEl = document.getElementById('reportAppId');
        if (nameEl) nameEl.value = r.dataset.name || r.dataset.id;
        if (idEl) idEl.value = r.dataset.id;
        document.getElementById('reportModal').classList.remove('hidden');
        document.getElementById('reportModalBackdrop').classList.remove('hidden');
      }
      if (e.target.closest('#closeReportModalBtn') || e.target.closest('#cancelReportBtn') || e.target === document.getElementById('reportModalBackdrop')) {
        document.getElementById('reportModal').classList.add('hidden');
        document.getElementById('reportModalBackdrop').classList.add('hidden');
      }
    });
    document.getElementById('reportForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you! Your feedback has been received and our team will verify.');
      document.getElementById('reportModal').classList.add('hidden');
      document.getElementById('reportModalBackdrop').classList.add('hidden');
    });
  </script>`;

  const adUnit = `
  <div class="ad-slot-container" aria-label="Advertisement">
    <span class="ad-label">Advertisement</span>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${ADSENSE}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
      try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    </script>
  </div>`;

  // ---- data.js for the SPA -------------------------------------------------
  const data = { apps, alternatives: alts, deals, stacks, resources, learning, games, aiHub, guides, radar };
  fs.writeFileSync(path.join(root, 'data.js'), `const data = ${JSON.stringify(data)};\nexport default data;\n`);
  console.log(`data.js: ${apps.length} paid apps, ${alts.length} alternatives, ${stacks.length} stacks, ${resources.length} creative resources, ${learning.length} learning resources, ${games.length} games, ${aiHub.length} AI tools, ${guides.length} guides, ${radar.length} radar updates`);

  // ---- static pages --------------------------------------------------------
  const year = new Date().getFullYear();
  const head = ({ title, description, canonical, jsonLd }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/style.css?v=${VERSION}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700;900&display=swap" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>`;

  const nav = `
  <nav class="topbar" aria-label="Main">
    <a class="brand" href="/">App<span>solutely</span> Free</a>
    <div class="topbar-links">
      <a href="/#categories">Categories</a>
      <a href="/#platforms">Platforms</a>
      <form class="topbar-search" action="/" method="get" role="search"><input name="q" type="search" placeholder="Search apps…" aria-label="Search apps"></form>
    </div>
  </nav>`;

  const footer = `
  <footer class="site-footer">
    <p><strong>Appsolutely Free</strong> helps you replace expensive subscriptions with free and open-source software.</p>
    <p class="fine">Some links may be affiliate or sponsored links. Prices and features change, so check each vendor's site. © ${year}</p>
  </footer>`;

  const write = (rel, html) => {
    const file = path.join(root, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  };

  const urls = [{ loc: `${SITE}/`, priority: '1.0' }];
  const dealsFor = (cat) => deals.filter((d) => !d.category || d.category === cat);

  // One page per paid app: "Best free alternatives to X"
  for (const app of apps) {
    const list = alts.filter((a) => (a.replaces || []).includes(app.id));
    if (!list.length) continue;
    const names = list.slice(0, 3).map((a) => a.name).join(', ');
    const title = `Best Free Alternatives to ${app.name} (${year}) — Open Source`;
    const description = `Looking to replace ${app.name}? Compare free, open-source alternatives like ${names}. Features, pros, cons, platforms, and download links.`;
    const canonical = `${SITE}/alternatives/${app.id}/`;
    const cat = categoryById(app.category);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Free alternatives to ${app.name}`,
      itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: a.website })),
    };
    const sponsored = dealsFor(app.category).slice(0, 1).map(dealHtml).join('');
    const others = apps.filter((a) => a.id !== app.id && a.category === app.category && alts.some((x) => (x.replaces || []).includes(a.id)))
      .slice(0, 8).map((a) => `<a class="chip" href="/alternatives/${a.id}/">${esc(a.name)}</a>`).join('');
    write(`alternatives/${app.id}`, `${head({ title, description, canonical, jsonLd })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › ${cat ? `<a href="/category/${cat.id}/">${esc(cat.label)}</a> ›` : ''} ${esc(app.name)}</p>
    <header class="page-head">
      <h1>Free alternatives to <span class="grad">${esc(app.name)}</span></h1>
      <p class="subtitle">${esc(app.name)} by ${esc(app.vendor || 'its vendor')} costs: <strong>${esc(app.typical_price || 'money')}</strong>. These ${list.length} free apps (many open source) can replace it, with screenshots, pros, and cons.</p>
    </header>
    <section class="alts-grid" aria-label="Alternatives to ${esc(app.name)}">
      ${list.map((a) => cardHtml(a, appsById, { base: '/' })).join('\n')}
    </section>
    ${adUnit}
    ${sponsored}
    ${others ? `<section class="more"><h2>More comparisons in ${esc(cat ? cat.label : 'this category')}</h2><div class="chips">${others}</div></section>` : ''}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
    urls.push({ loc: canonical, priority: '0.8' });
  }

  // One page per category
  for (const cat of CATEGORIES) {
    const list = alts.filter((a) => a.category === cat.id || (a.categories || []).includes(cat.id));
    if (!list.length) continue;
    const title = `Best Free & Open Source ${cat.label} Software (${year})`;
    const description = `${cat.blurb} Browse ${list.length} free, open-source ${cat.label.toLowerCase()} apps with screenshots, pros, and cons.`;
    const canonical = `${SITE}/category/${cat.id}/`;
    const jsonLd = {
      '@context': 'https://schema.org', '@type': 'ItemList', name: title,
      itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: a.website })),
    };
    const related = apps.filter((a) => a.category === cat.id && alts.some((x) => (x.replaces || []).includes(a.id)))
      .map((a) => `<a class="chip" href="/alternatives/${a.id}/">Alternatives to ${esc(a.name)}</a>`).join('');
    const sponsored = dealsFor(cat.id).slice(0, 1).map(dealHtml).join('');
    write(`category/${cat.id}`, `${head({ title, description, canonical, jsonLd })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › ${esc(cat.label)}</p>
    <header class="page-head">
      <h1>${cat.emoji} Free <span class="grad">${esc(cat.label)}</span> Software</h1>
      <p class="subtitle">${esc(cat.blurb)}</p>
      ${related ? `<div class="chips center">${related}</div>` : ''}
    </header>
    <section class="alts-grid">
      ${list.map((a) => cardHtml(a, appsById, { base: '/' })).join('\n')}
    </section>
    ${adUnit}
    ${sponsored}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
    urls.push({ loc: canonical, priority: '0.7' });
  }

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`);
  console.log(`Wrote ${urls.length - 1} static pages and sitemap.xml`);
}

main().catch((e) => { console.error(e); process.exit(1); });
