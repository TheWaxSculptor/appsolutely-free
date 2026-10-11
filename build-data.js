// Generates data.js (for the SPA) plus static, crawlable SEO pages and sitemap.xml.
const fs = require('fs');
const path = require('path');
const { loadAll, root } = require('./scripts/load-all');

const SITE = 'https://appsolutelyfree.com';
const ADSENSE = 'ca-pub-2161345131320461';
const VERSION = '14';

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
  const head = ({ title, description, canonical, jsonLd, image }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#0a0f1e">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image || 'https://appsolutelyfree.com/assets/screenshots/photopea.webp'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image || 'https://appsolutelyfree.com/assets/screenshots/photopea.webp'}">
  <link rel="stylesheet" href="/style.css?v=${VERSION}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>`;

  const nav = `
  <nav class="topbar" aria-label="Main">
    <a class="brand" href="/">App<span>solutely</span> Free</a>
    <div class="topbar-links">
      <a href="/#categories">Categories</a>
      <a href="/#platforms">Platforms</a>
      <a href="/about/">About</a>
      <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="coffee-nav-btn" title="Support Yishay on Buy Me a Coffee">
        <span class="coffee-icon" aria-hidden="true">☕</span>
        <span>Buy a Coffee</span>
      </a>
      <form class="topbar-search" action="/" method="get" role="search"><input name="q" type="search" placeholder="Search apps…" aria-label="Search apps"></form>
    </div>
  </nav>`;

  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-creator-banner">
        <div class="creator-info">
          <strong>Appsolutely Free</strong> is founded by <strong>Yishay Stewart-Mitchell</strong> in Jamaica, Queens. Built on the belief that <em>“Your budget shouldn’t decide whether you get to start.”</em>
        </div>
        <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="footer-coffee-btn">
          ☕ Buy Yishay a coffee
        </a>
      </div>
      <div class="footer-links">
        <a href="/about/">About the Founder</a>
        <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener">☕ Buy Me a Coffee</a>
        <a href="/#categories">All Categories</a>
        <a href="/#calculatorSection">Savings Calculator</a>
        <a href="https://github.com/TheWaxSculptor/appsolutely-free" target="_blank" rel="noopener">GitHub</a>
      </div>
      <p><strong>Appsolutely Free</strong> helps you replace expensive subscriptions with free and open-source software.</p>
      <p class="fine">Some links may be affiliate or sponsored links. Prices and features change, so check each vendor's site. © ${year}</p>
    </div>
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

  // Dedicated About the Founder page
  const aboutTitle = `About the Founder — Yishay Stewart-Mitchell | Appsolutely Free`;
  const aboutDesc = `Meet Yishay Stewart-Mitchell, creator and technology professional from Jamaica, Queens, and founder of Appsolutely Free. Discover the mission behind transparent, free software curation.`;
  const aboutCanonical = `${SITE}/about/`;
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Yishay Stewart-Mitchell',
      jobTitle: 'Founder & Technology Professional',
      worksFor: {
        '@type': 'Organization',
        name: 'Appsolutely Free',
        url: 'https://appsolutelyfree.com/'
      },
      homeLocation: {
        '@type': 'Place',
        name: 'Jamaica, Queens, New York'
      },
      knowsAbout: ['IT Support', 'Audio Production', 'Programming', 'Custom Electronics', 'Open-Source Software'],
      sameAs: [
        'https://buymeacoffee.com/yishay',
        'https://github.com/TheWaxSculptor/appsolutely-free'
      ]
    }
  };

  write('about', `${head({ title: aboutTitle, description: aboutDesc, canonical: aboutCanonical, jsonLd: aboutJsonLd })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › About the Founder</p>
    
    <section class="founder-section" style="margin-top: 1.25rem;">
      <div class="founder-card glass-panel">
        <div class="founder-grid">
          <div class="founder-story">
            <div class="founder-badge-row">
              <span class="eyebrow amber"><span class="pulse-amber"></span>Founder &amp; Mission</span>
              <span class="founder-location">📍 Jamaica, Queens, NY</span>
            </div>
            <h1 class="founder-heading">
              “Your budget shouldn’t decide <span class="grad-gold">whether you get to start.</span>”
            </h1>
            
            <div class="founder-intro">
              <div class="founder-avatar-wrap">
                <div class="founder-avatar" aria-hidden="true">YS</div>
                <div class="founder-meta">
                  <strong class="founder-name">Yishay Stewart-Mitchell</strong>
                  <span class="founder-role">Creator &amp; Founder, Appsolutely Free</span>
                </div>
              </div>
              <div class="founder-tags">
                <span class="founder-tag">🎧 Audio Production</span>
                <span class="founder-tag">💻 IT Support</span>
                <span class="founder-tag">⚡ Programming</span>
                <span class="founder-tag">🔌 Custom Electronics</span>
              </div>
            </div>

            <div class="founder-bio">
              <p>I’m <strong>Yishay Stewart-Mitchell</strong>, a creator and technology professional from Jamaica, Queens, and the founder of <strong>Appsolutely Free</strong>.</p>
              <p>My background spans IT support, audio production, programming, and custom electronics. Across those fields, I’ve seen how quickly software costs can add up—especially when you’re learning, starting a business, or trying to bring an idea to life.</p>
              <p>I created Appsolutely Free to make useful technology easier to find and understand. The goal is simple: help people discover free and open-source alternatives, understand the tradeoffs, and choose tools that fit their needs and budget.</p>
              <p>To me, “free” deserves an explanation. A useful recommendation should tell you whether an app has limits, requires paid hosting, or charges for features you might need. That transparency is part of what I want to build here.</p>
              <p>Whether you’re a student, artist, developer, small-business owner, or someone tired of another monthly subscription, I want Appsolutely Free to help you keep creating and learning.</p>
            </div>

            <div class="founder-quote-banner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="quote-svg" aria-hidden="true"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
              <blockquote>Your budget shouldn’t decide whether you get to start.</blockquote>
            </div>
          </div>

          <div class="founder-support-card">
            <div class="coffee-card-inner">
              <div class="coffee-card-header">
                <div class="coffee-cup-icon" aria-hidden="true">☕</div>
                <div>
                  <span class="coffee-eyebrow">Direct Creator Support</span>
                  <h2 class="coffee-card-title">Buy Yishay a Coffee</h2>
                </div>
              </div>

              <p class="coffee-desc">
                Appsolutely Free is completely free to use, independent, and curated by hand. No paywalls, no investor agendas, and zero bloatware.
              </p>

              <div class="coffee-perks">
                <div class="perk-item">
                  <span class="perk-check">✓</span>
                  <span>Keeps the database running &amp; free for everyone</span>
                </div>
                <div class="perk-item">
                  <span class="perk-check">✓</span>
                  <span>Supports testing &amp; verifying new open-source tools</span>
                </div>
                <div class="perk-item">
                  <span class="perk-check">✓</span>
                  <span>Empowers independent, transparent tech guidance</span>
                </div>
              </div>

              <div class="coffee-tiers">
                <span class="coffee-tiers-label">Quick Support on Buy Me a Coffee:</span>
                <div class="coffee-tier-chips">
                  <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="coffee-tier-chip">
                    <strong>$3</strong> <span>Quick Espresso</span>
                  </a>
                  <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="coffee-tier-chip featured">
                    <span class="tier-popular">Popular</span>
                    <strong>$5</strong> <span>A Warm Brew</span>
                  </a>
                  <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="coffee-tier-chip">
                    <strong>$15</strong> <span>Server Fuel</span>
                  </a>
                </div>
              </div>

              <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="btn-bmc-primary">
                <span class="bmc-icon" aria-hidden="true">☕</span>
                <span class="bmc-label">buymeacoffee.com/yishay</span>
                <span class="bmc-arrow" aria-hidden="true">→</span>
              </a>

              <div class="coffee-transparency">
                <span>🔒 Secure one-time or monthly support via Stripe / Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: aboutCanonical, priority: '0.9' });

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`);
  console.log(`Wrote ${urls.length - 1} static pages and sitemap.xml`);
}

main().catch((e) => { console.error(e); process.exit(1); });
