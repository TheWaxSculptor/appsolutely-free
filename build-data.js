// Generates data.js (for the SPA) plus static, crawlable SEO pages and sitemap.xml.
const fs = require('fs');
const path = require('path');
const { loadAll, root } = require('./scripts/load-all');

const SITE = 'https://appsolutelyfree.com';
const AWIN_AFFID = '2867391';
const VERSION = '17';

async function main() {
  const { cardHtml, dealHtml, displayAdHtml, esc, CATEGORIES, categoryById } = await import('./card.mjs');
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
      <div class="form-group">
        <label for="reportEmail">Your email (optional, for follow-up)</label>
        <input type="email" id="reportEmail" class="form-input" placeholder="you@example.com">
      </div>
      <div id="reportFeedback" class="report-feedback hidden"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="cancelReportBtn">Cancel</button>
        <button type="submit" class="btn btn-primary" id="submitReportBtn">Submit Report</button>
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
        var fb = document.getElementById('reportFeedback');
        if (fb) { fb.className = 'report-feedback hidden'; fb.innerHTML = ''; }
        document.getElementById('reportModal').classList.remove('hidden');
        document.getElementById('reportModalBackdrop').classList.remove('hidden');
      }
      if (e.target.closest('#closeReportModalBtn') || e.target.closest('#cancelReportBtn') || e.target === document.getElementById('reportModalBackdrop')) {
        document.getElementById('reportModal').classList.add('hidden');
        document.getElementById('reportModalBackdrop').classList.add('hidden');
      }
    });
    document.getElementById('reportForm')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      var id = document.getElementById('reportAppId')?.value || '';
      var name = document.getElementById('reportAppName')?.value || 'Software';
      var reason = document.getElementById('reportReason')?.value || '';
      var details = document.getElementById('reportDetails')?.value || '';
      var email = document.getElementById('reportEmail')?.value || '';
      var btn = document.getElementById('submitReportBtn');
      var fb = document.getElementById('reportFeedback');

      if (btn) { btn.disabled = true; btn.textContent = 'Delivering report...'; }
      if (fb) { fb.className = 'report-feedback info'; fb.innerHTML = 'Connecting to editorial verification endpoint...'; }

      try {
        var res = await fetch('https://formsubmit.co/ajax/support@appsolutelyfree.com', {
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

        var data = await res.json().catch(function() { return {}; });

        if (res.ok && (data.success === true || data.success === 'true')) {
          if (fb) {
            fb.className = 'report-feedback success';
            fb.innerHTML = '✓ Report successfully delivered to our verification team. Thank you!';
          }
          setTimeout(function() {
            document.getElementById('reportModal').classList.add('hidden');
            document.getElementById('reportModalBackdrop').classList.add('hidden');
            if (btn) { btn.disabled = false; btn.textContent = 'Submit Report'; }
            document.getElementById('reportDetails').value = '';
          }, 1800);
        } else {
          var errMsg = data.message || ('Server returned HTTP ' + res.status);
          throw new Error(errMsg);
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Retry Submission'; }
        if (fb) {
          fb.className = 'report-feedback error';
          var mailSubject = encodeURIComponent('[Appsolutely Free] Correction Report: ' + name);
          var mailBody = encodeURIComponent('Software: ' + name + ' (' + id + ')\nReason: ' + reason + '\nDetails: ' + details + '\nURL: ' + window.location.href);
          fb.innerHTML = '<p style="margin-bottom:0.35rem;"><strong>⚠️ Automated delivery could not be confirmed:</strong> ' + (err.message || 'Delivery error') + '</p><p style="font-size:0.84rem;margin-bottom:0.5rem;">Please send your report directly to our editorial inbox:</p><a href="mailto:support@appsolutelyfree.com?subject=' + mailSubject + '&body=' + mailBody + '" class="btn btn-secondary btn-sm" style="display:inline-block;">✉️ Email to support@appsolutelyfree.com ↗</a>';
        }
      }
    });
  </script>`;

  const makeHouseBanner = (deal, base = '/') => {
    if (!deal) return '';
    return displayAdHtml(deal, { base });
  };

  const dealsFor = (cat) => deals.filter((d) => !d.category || d.category === cat || (Array.isArray(d.categories) && d.categories.includes(cat)));

  const dealTop = deals.find((d) => d.id === 'nordvpn') || deals[0];
  const dealInfeed = deals.find((d) => d.id === 'retouch4me') || deals[1];
  const dealBottom = deals.find((d) => d.id === 'kingkoil') || deals[2];

  const getContextInfeed = (catId) => {
    const match = dealsFor(catId)[0] || dealInfeed;

    return `
    <div class="partner-spotlight-slot partner-spotlight-infeed" aria-label="Sponsored Partner Offer">
      ${makeHouseBanner(match)}
    </div>`;
  };

  const adUnitTop = `
  <div class="partner-spotlight-slot partner-spotlight-top" aria-label="Sponsored Partner Offer">
    ${makeHouseBanner(dealTop)}
  </div>`;

  const adUnitInfeed = `
  <div class="partner-spotlight-slot partner-spotlight-infeed" aria-label="Sponsored Partner Offer">
    ${makeHouseBanner(dealInfeed)}
  </div>`;

  const adUnitBottom = `
  <div class="partner-spotlight-slot partner-spotlight-bottom" aria-label="Sponsored Partner Offer">
    ${makeHouseBanner(dealBottom)}
  </div>`;

  const adUnit = adUnitBottom;



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
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#0a0f1e">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>">
  <meta property="og:site_name" content="Appsolutely Free">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image || 'https://appsolutelyfree.com/assets/screenshots/photopea.webp'}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@appsolutelyfree">
  <meta name="twitter:creator" content="@yishay">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image || 'https://appsolutelyfree.com/assets/screenshots/photopea.webp'}">
  <link rel="stylesheet" href="/style.css?v=${VERSION}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>`;

  const nav = `
  <nav class="topbar" aria-label="Main">
    <a class="brand" href="/">App<span>solutely</span> Free</a>
    <div class="topbar-links">
      <a href="/#categories">Categories</a>
      <a href="/resources/">Resources</a>
      <a href="/learning/">Learning</a>
      <a href="/games/">Games</a>
      <a href="/guides/">Guides</a>
      <a href="/#calculatorSection">Calculator</a>
      <a href="/about/">About</a>
      <a href="/editorial-standards/">Editorial</a>
      <a href="/contact/">Contact</a>
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
        <a href="/editorial-standards/">Editorial Standards</a>
        <a href="/privacy/">Privacy Policy</a>
        <a href="/contact/">Contact &amp; Corrections</a>
        <a href="/#categories">All Categories</a>
        <a href="/resources/">Creative Resources</a>
        <a href="/learning/">Free Learning</a>
        <a href="/games/">Free Games</a>
        <a href="/guides/">Switching Guides</a>
        <a href="/#calculatorSection">Savings Calculator</a>
        <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener">☕ Buy Me a Coffee</a>
        <a href="https://github.com/TheWaxSculptor/appsolutely-free" target="_blank" rel="noopener">GitHub</a>
      </div>
      <p><strong>Appsolutely Free</strong> helps you replace expensive subscriptions with free and open-source software, tutorials, and creative assets.</p>
      <p class="fine">Independently curated. Optional paid services and sponsored links are clearly labeled. Prices and features change over time; verify with official sources. © ${year} Appsolutely Free.</p>
    </div>
  </footer>`;


  const write = (rel, html) => {
    const file = path.join(root, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  };

  const urls = [{ loc: `${SITE}/`, priority: '1.0', changefreq: 'daily' }];

  // One page per paid app: "Best free alternatives to X"

  for (const app of apps) {
    const list = alts.filter((a) => (a.replaces || []).includes(app.id));
    if (!list.length) continue;
    const names = list.slice(0, 3).map((a) => a.name).join(', ');
    const title = `Best Free Alternatives to ${app.name} (${year}) — Open Source`;
    const description = `Looking to replace ${app.name}? Compare free, open-source alternatives like ${names}. Features, pros, cons, platforms, and download links.`;
    const canonical = `${SITE}/alternatives/${app.id}/`;
    const cat = categoryById(app.category);
    const topShot = list[0]?.screenshot ? `${SITE}/${list[0].screenshot}` : 'https://appsolutelyfree.com/assets/screenshots/photopea.webp';

    const topAlt = list[0];
    const secondAlt = list[1];
    const openSourceAlts = list.filter((x) => x.is_open_source);

    const faqItems = [
      {
        q: `What is the best free alternative to ${app.name}?`,
        a: `The highest-rated free alternative to ${app.name} is ${topAlt ? topAlt.name : 'open-source software'}${secondAlt ? `, followed by ${secondAlt.name}` : ''}. ${topAlt ? `${topAlt.name} provides ${topAlt.summary || 'robust features'} without a paid subscription.` : ''}`
      },
      {
        q: `How much can I save by replacing ${app.name}?`,
        a: `${app.name} by ${app.vendor || 'its vendor'} typically costs ${app.typical_price || 'a recurring subscription'}. By switching to verified free alternatives like ${names}, you eliminate ongoing software fees ($0 to use).`
      },
      {
        q: `Are these ${app.name} alternatives safe and free of bloatware?`,
        a: `Yes. Every alternative listed on Appsolutely Free is manually audited for active maintenance, zero adware, no bundled crypto miners, and transparent software licensing.`
      },
      {
        q: `Can I open files created in ${app.name} using these free tools?`,
        a: `Many alternatives support industry-standard and native formats (such as standard document, image, or media interchange formats). Check each tool's feature badges or our migration roadmaps for compatibility notes.`
      }
    ];

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            ...(cat ? [{ '@type': 'ListItem', position: 2, name: cat.label, item: `${SITE}/category/${cat.id}/` }] : []),
            { '@type': 'ListItem', position: cat ? 3 : 2, name: `Alternatives to ${app.name}`, item: canonical }
          ]
        },
        {
          '@type': 'ItemList',
          name: `Free alternatives to ${app.name}`,
          description: description,
          numberOfItems: list.length,
          itemListElement: list.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: a.name,
            url: a.website,
            item: {
              '@type': 'SoftwareApplication',
              name: a.name,
              applicationCategory: cat ? cat.label : 'Multimedia & Utilities',
              operatingSystem: (a.platforms || []).join(', ') || 'Windows, macOS, Linux',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              description: a.summary || `Free alternative to ${app.name}`
            }
          }))
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqItems.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a
            }
          }))
        }
      ]
    };

    const guide = guides.find((g) => (g.from_app && g.from_app.toLowerCase().includes(app.name.toLowerCase())) || g.id.includes(app.id));
    const guideBannerHtml = guide ? `
    <aside class="guide-banner glass-panel">
      <div class="guide-banner-icon">📘</div>
      <div class="guide-banner-body">
        <span class="eyebrow amber">Migration Roadmap</span>
        <h3>Switching from ${esc(app.name)} to ${esc(guide.to_app)}</h3>
        <p>${esc(guide.headline)}</p>
        <a href="/guides/#guide-${esc(guide.id)}" class="btn btn-primary btn-sm">Read Switching Guide &amp; Gotchas →</a>
      </div>
    </aside>` : '';

    const faqHtml = `
    <section class="page-faq glass-panel" aria-labelledby="faqTitle">
      <h2 id="faqTitle">Frequently Asked Questions: Replacing ${esc(app.name)}</h2>
      <p class="page-faq-sub">Common questions about replacing ${esc(app.name)} with free and open-source software:</p>
      <div class="faq-grid">
        ${faqItems.map((f) => `
          <details class="faq-item" open>
            <summary>${esc(f.q)}</summary>
            <div class="faq-answer"><p>${esc(f.a)}</p></div>
          </details>
        `).join('\n')}
      </div>
    </section>`;

    const cardsHtml = list.length >= 3
      ? [...list.slice(0, 2).map((a) => cardHtml(a, appsById, { base: '/' })), getContextInfeed(app.category), ...list.slice(2).map((a) => cardHtml(a, appsById, { base: '/' }))].join('\n')
      : list.map((a) => cardHtml(a, appsById, { base: '/' })).join('\n');

    const others = apps.filter((a) => a.id !== app.id && a.category === app.category && alts.some((x) => (x.replaces || []).includes(a.id)))
      .slice(0, 8).map((a) => `<a class="chip" href="/alternatives/${a.id}/">${esc(a.name)}</a>`).join('');

    write(`alternatives/${app.id}`, `${head({ title, description, canonical, jsonLd, image: topShot })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › ${cat ? `<a href="/category/${cat.id}/">${esc(cat.label)}</a> ›` : ''} ${esc(app.name)}</p>
    <header class="page-head">
      <h1>Free alternatives to <span class="grad">${esc(app.name)}</span></h1>
      <p class="subtitle">${esc(app.name)} by ${esc(app.vendor || 'its vendor')} costs: <strong>${esc(app.typical_price || 'money')}</strong>. These ${list.length} free apps (many open source) can replace it, with screenshots, pros, and cons.</p>
    </header>
    ${adUnitTop}
    ${guideBannerHtml}
    <section class="alts-grid" aria-label="Alternatives to ${esc(app.name)}">
      ${cardsHtml}
    </section>
    ${adUnitBottom}
    ${faqHtml}
    ${others ? `<section class="more"><h2>More comparisons in ${esc(cat ? cat.label : 'this category')}</h2><div class="chips">${others}</div></section>` : ''}
  </main>

  ${footer}
  ${reportModalHtml}
</body>
</html>`);
    urls.push({ loc: canonical, priority: '0.9', changefreq: 'weekly' });
  }

  // One page per category
  for (const cat of CATEGORIES) {
    const list = alts.filter((a) => a.category === cat.id || (a.categories || []).includes(cat.id));
    if (!list.length) continue;
    const title = `Best Free & Open Source ${cat.label} Software (${year})`;
    const description = `${cat.blurb} Browse ${list.length} free, open-source ${cat.label.toLowerCase()} apps with screenshots, pros, and cons.`;
    const canonical = `${SITE}/category/${cat.id}/`;
    const catShot = list[0]?.screenshot ? `${SITE}/${list[0].screenshot}` : 'https://appsolutelyfree.com/assets/screenshots/photopea.webp';

    const catFaqItems = [
      {
        q: `What are the best free ${cat.label} applications?`,
        a: `Top free tools in ${cat.label} include ${list.slice(0, 3).map((x) => x.name).join(', ')}. Each provides verified, robust features without recurring software subscription costs.`
      },
      {
        q: `Are open-source ${cat.label} applications safe for commercial use?`,
        a: `Yes. Tools featured on Appsolutely Free carry open licenses (like GPL, MIT, Apache, or Mozilla) permitting commercial projects. All recommendations are screened to guarantee zero bloatware and zero spyware.`
      },
      {
        q: `What platforms do these ${cat.label} tools support?`,
        a: `Most software options in this category run across Windows, macOS, Linux, and modern web browsers. Check individual cards for platform badges and installation links.`
      }
    ];

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: cat.label, item: canonical }
          ]
        },
        {
          '@type': 'CollectionPage',
          name: title,
          description: description,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: list.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.name,
              url: a.website
            }))
          }
        },
        {
          '@type': 'FAQPage',
          mainEntity: catFaqItems.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a
            }
          }))
        }
      ]
    };

    const catCardsHtml = list.length >= 4
      ? [...list.slice(0, 3).map((a) => cardHtml(a, appsById, { base: '/' })), getContextInfeed(cat.id), ...list.slice(3).map((a) => cardHtml(a, appsById, { base: '/' }))].join('\n')
      : list.map((a) => cardHtml(a, appsById, { base: '/' })).join('\n');

    const catFaqHtml = `
    <section class="page-faq glass-panel" aria-labelledby="catFaqTitle">
      <h2 id="catFaqTitle">Frequently Asked Questions: ${esc(cat.label)}</h2>
      <p class="page-faq-sub">Everything you need to know about free and open-source ${esc(cat.label.toLowerCase())} tools:</p>
      <div class="faq-grid">
        ${catFaqItems.map((f) => `
          <details class="faq-item" open>
            <summary>${esc(f.q)}</summary>
            <div class="faq-answer"><p>${esc(f.a)}</p></div>
          </details>
        `).join('\n')}
      </div>
    </section>`;

    const related = apps.filter((a) => a.category === cat.id && alts.some((x) => (x.replaces || []).includes(a.id)))
      .map((a) => `<a class="chip" href="/alternatives/${a.id}/">Alternatives to ${esc(a.name)}</a>`).join('');

    write(`category/${cat.id}`, `${head({ title, description, canonical, jsonLd, image: catShot })}
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
    ${adUnitTop}
    <section class="alts-grid">
      ${catCardsHtml}
    </section>
    ${adUnitBottom}
    ${catFaqHtml}
  </main>

  ${footer}
  ${reportModalHtml}
</body>
</html>`);
    urls.push({ loc: canonical, priority: '0.8', changefreq: 'weekly' });
  }

  // Dedicated About the Founder page
  const aboutTitle = `About the Founder — Yishay Stewart-Mitchell | Appsolutely Free`;
  const aboutDesc = `Meet Yishay Stewart-Mitchell, creator and technology professional from Jamaica, Queens, and founder of Appsolutely Free. Discover the mission behind transparent, free software curation.`;
  const aboutCanonical = `${SITE}/about/`;
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'About the Founder', item: aboutCanonical }
        ]
      },
      {
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
      }
    ]
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
                <span class="coffee-tiers-label">Suggested contribution levels on Buy Me a Coffee:</span>
                <div class="coffee-tier-chips">
                  <div class="coffee-tier-chip">
                    <strong>$3</strong> <span>Quick Espresso</span>
                    <small class="tier-hint">1 coffee</small>
                  </div>
                  <div class="coffee-tier-chip featured">
                    <span class="tier-popular">Most Popular</span>
                    <strong>$5</strong> <span>A Warm Brew</span>
                    <small class="tier-hint">Standard coffee</small>
                  </div>
                  <div class="coffee-tier-chip">
                    <strong>$15</strong> <span>Server Fuel</span>
                    <small class="tier-hint">3 coffees</small>
                  </div>
                </div>
              </div>

              <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="btn-bmc-primary">
                <span class="bmc-icon" aria-hidden="true">☕</span>
                <span class="bmc-label">Choose Your Amount at buymeacoffee.com/yishay</span>
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
    ${adUnitBottom}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: aboutCanonical, priority: '0.7', changefreq: 'monthly' });

  // 1. Dedicated Creative Resources Page
  const resCards = resources.map((item) => `
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
        <span class="res-term-badge term-commercial">Commercial: <strong>${esc(item.commercial_use)}</strong></span>
        <span class="res-term-badge term-attribution">Attribution: <strong>${esc(item.attribution)}</strong></span>
      </div>
      <div class="res-highlight-box">
        <span class="highlight-star">✨</span>
        <small>${esc(item.highlight)}</small>
      </div>
      <div class="res-footer">
        <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Browse Library ↗</a>
      </div>
    </div>
  `);

  const resCardsHtml = resCards.length >= 4
    ? [...resCards.slice(0, 3), adUnitInfeed, ...resCards.slice(3)].join('\n')
    : resCards.join('\n');

  write('resources', `${head({
    title: `Free Creative Resources — Fonts, Stock Photos, Audio & 3D Assets (${year})`,
    description: `Hand-picked commercial-use fonts, SVG icons, stock photography, sound effects, and 3D models with transparent licensing and attribution terms.`,
    canonical: `${SITE}/resources/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Creative Resources', item: `${SITE}/resources/` }
          ]
        },
        {
          '@type': 'CollectionPage',
          name: 'Free Creative Resources',
          description: 'Hand-picked fonts, stock photos, sound effects, and 3D models with verified commercial licenses.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › Creative Resources</p>
    <header class="page-head">
      <span class="eyebrow blue">Commercial-Use Assets</span>
      <h1>Free <span class="grad">Creative Resources</span></h1>
      <p class="subtitle">Hand-picked font libraries, SVG icon sets, stock photography, sound effects, audio samples, and 3D assets with transparent commercial usage and attribution terms.</p>
    </header>
    ${adUnitTop}
    <section class="resource-cards-grid" aria-label="Creative Resources">
      ${resCardsHtml}
    </section>
    ${adUnitBottom}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: `${SITE}/resources/`, priority: '0.8', changefreq: 'weekly' });

  // 2. Dedicated Free Learning & Practice Labs Page
  const learnCards = learning.map((item) => {
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
          <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Start Free Course ↗</a>
        </div>
      </div>
    `;
  });

  const learnCardsHtml = learnCards.length >= 4
    ? [...learnCards.slice(0, 3), adUnitInfeed, ...learnCards.slice(3)].join('\n')
    : learnCards.join('\n');

  write('learning', `${head({
    title: `Free Learning & Practice Labs — Master Creative & Dev Tools (${year})`,
    description: `Official free courses, interactive practice labs, and full curricula for Blender, DaVinci Resolve, Godot, Linux, and web development.`,
    canonical: `${SITE}/learning/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Free Learning & Labs', item: `${SITE}/learning/` }
          ]
        },
        {
          '@type': 'CollectionPage',
          name: 'Free Learning & Practice Labs',
          description: 'Zero-tuition tutorials and practice labs for creative and developer software.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › Free Learning</p>
    <header class="page-head">
      <span class="eyebrow green">Zero Tuition · World-Class Knowledge</span>
      <h1>Free <span class="grad">Learning &amp; Labs</span></h1>
      <p class="subtitle">Master creative and developer software with official video series, interactive practice sandboxes, and full curricula. Genuinely free learning distinguished from paid certificate traps.</p>
    </header>
    ${adUnitTop}
    <section class="learning-cards-grid" aria-label="Free Learning and Labs">
      ${learnCardsHtml}
    </section>
    ${adUnitBottom}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: `${SITE}/learning/`, priority: '0.8', changefreq: 'weekly' });

  // 3. Dedicated Free Games Page
  const gameCards = games.map((item) => `
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
        <span class="monetization-badge">🛡️ Monetization: <strong>${esc(item.monetization)}</strong></span>
      </div>
      <div class="game-platforms-row">
        <span class="platforms-label">Platforms:</span>
        ${(item.platforms || []).map((p) => `<span class="platform-mini-pill">${esc(p)}</span>`).join('')}
      </div>
      <div class="game-footer">
        <a href="${esc(item.url)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Play / Download ↗</a>
      </div>
    </div>
  `);

  const gamesCardsHtml = gameCards.length >= 4
    ? [...gameCards.slice(0, 3), adUnitInfeed, ...gameCards.slice(3)].join('\n')
    : gameCards.join('\n');

  write('games', `${head({
    title: `Free & Open-Source Games — Fair Play & Zero Microtransactions (${year})`,
    description: `Community-developed open-source games and legitimate giveaway trackers. Zero pay-to-win, zero predatory microtransactions.`,
    canonical: `${SITE}/games/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Free Games', item: `${SITE}/games/` }
          ]
        },
        {
          '@type': 'CollectionPage',
          name: 'Free & Open-Source Games',
          description: 'Open-source PC games and fair browser titles with transparent monetization.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › Free Games</p>
    <header class="page-head">
      <span class="eyebrow cyan">100% Free · Fair Play</span>
      <h1>Free &amp; <span class="grad">Open-Source Games</span></h1>
      <p class="subtitle">Community-developed open-source games, fair browser titles, and legitimate 100% giveaway trackers. Clearly distinguished from microtransaction traps and ad-heavy clones.</p>
    </header>
    ${adUnitTop}
    <section class="games-cards-grid" aria-label="Free Games">
      ${gamesCardsHtml}
    </section>
    ${adUnitBottom}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: `${SITE}/games/`, priority: '0.8', changefreq: 'weekly' });

  // 4. Dedicated Software Switching Guides Page
  const guideCards = guides.map((g) => `
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
          ${(g.key_steps || []).map((step) => `
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
  `);

  const guidesCardsHtml = guideCards.length >= 3
    ? [...guideCards.slice(0, 2), adUnitInfeed, ...guideCards.slice(2)].join('\n')
    : guideCards.join('\n');

  write('guides', `${head({
    title: `Software Switching Guides — Migration Roadmaps & Gotchas (${year})`,
    description: `Step-by-step export/import workflows, native file compatibility, shortcut preservation, and gotchas before cancelling subscriptions.`,
    canonical: `${SITE}/guides/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Switching Guides', item: `${SITE}/guides/` }
          ]
        },
        {
          '@type': 'CollectionPage',
          name: 'Software Switching Guides',
          description: 'Step-by-step migration roadmaps for leaving expensive software subscriptions.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container wide">
    <p class="crumbs"><a href="/">Home</a> › Switching Guides</p>
    <header class="page-head">
      <span class="eyebrow amber">Migration Roadmaps</span>
      <h1>Software <span class="grad">Switching Guides</span></h1>
      <p class="subtitle">"What happens to my existing work?" Step-by-step export/import workflows, native file compatibility, shortcut preservation, and critical gotchas to verify before cancelling paid subscriptions.</p>
    </header>
    ${adUnitTop}
    <section class="guides-grid" aria-label="Software Switching Guides">
      ${guidesCardsHtml}
    </section>
    ${adUnitBottom}
  </main>
  ${footer}
  ${reportModalHtml}
</body>
</html>`);
  urls.push({ loc: `${SITE}/guides/`, priority: '0.8', changefreq: 'weekly' });

  // 5. Editorial Standards Page
  write('editorial-standards', `${head({
    title: `Editorial Standards & Verification Policy | Appsolutely Free`,
    description: `How Appsolutely Free reviews, categorizes, tests, and verifies software listings, licensing models, and privacy standards.`,
    canonical: `${SITE}/editorial-standards/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Editorial Standards', item: `${SITE}/editorial-standards/` }
          ]
        },
        {
          '@type': 'AboutPage',
          name: 'Editorial Standards & Verification Policy',
          description: 'Curation methodology, pricing transparency criteria, and correction review workflow.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container" style="max-width: 860px;">
    <p class="crumbs"><a href="/">Home</a> › Editorial Standards</p>
    <header class="page-head" style="text-align: left; margin-bottom: 2rem;">
      <span class="eyebrow blue">Integrity &amp; Curation Methodology</span>
      <h1>Editorial Standards &amp; <span class="grad">Verification Policy</span></h1>
      <p class="subtitle" style="margin: 0; text-align: left;">Every app, course, asset, and guide on Appsolutely Free is hand-reviewed with clear criteria. Here is how we verify recommendations and handle corrections.</p>
    </header>

    <article class="glass-panel" style="padding: 2.25rem; border-radius: var(--radius); line-height: 1.7; display: flex; flex-direction: column; gap: 1.5rem;">
      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin-bottom: 0.6rem; color: #fff;">1. Transparent Pricing Taxonomy</h2>
        <p>To us, "free" is not a marketing buzzword. Every listing is explicitly classified under one of three transparent tiers:</p>
        <ul style="padding-left: 1.5rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
          <li><strong>✨ $0 to use:</strong> Free for personal and commercial use with zero recurring software fees (e.g. Blender, GIMP, OBS Studio, Audacity).</li>
          <li><strong>🎁 Limited free plan:</strong> Free tier exists but has real limits on users, storage, export resolution, or advanced features (e.g. Notion, Figma, Airtable).</li>
          <li><strong>🖥️ Requires hosting/hardware:</strong> The software license is free and open-source, but running it requires a VPS, cloud server, or home lab hardware (e.g. Penpot, Coolify, Supabase).</li>
        </ul>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin-bottom: 0.6rem; color: #fff;">2. Zero Bloatware &amp; Privacy First</h2>
        <p>We reject programs bundled with adware, unwanted browser toolbars, hidden crypto miners, or predatory trackers. Software that degrades user privacy or requires intrusive third-party installers is permanently excluded.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin-bottom: 0.6rem; color: #fff;">3. Active Maintenance &amp; Health Checks</h2>
        <p>Open-source repositories are monitored for development velocity, recent commit timestamps, star counts, and open security issues. Abandoned or vulnerable packages (such as outdated OpenOffice builds) carry explicit, prominent warning banners.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin-bottom: 0.6rem; color: #fff;">4. Commercial Disclosure &amp; Independence</h2>
        <p>Editorial recommendations are never sold. Listings cannot pay for higher ranking or positive reviews. When optional paid hosting or commercial services are linked (such as VPS providers for self-hosting), they are strictly segregated and transparently marked as <em>Optional Paid Services</em> or <em>Sponsored</em>.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin-bottom: 0.6rem; color: #fff;">5. Fast Correction Reporting</h2>
        <p>Software evolves quickly. Every listing card includes a <em>Report outdated information</em> button. Submissions are delivered directly to our verification team and resolved promptly. You can also reach our team at <a href="mailto:support@appsolutelyfree.com" style="color: var(--accent-ice); text-decoration: underline;">support@appsolutelyfree.com</a>.</p>
      </section>
    </article>
    ${adUnitBottom}
  </main>
  ${footer}
</body>
</html>`);
  urls.push({ loc: `${SITE}/editorial-standards/`, priority: '0.7', changefreq: 'monthly' });

  // 6. Privacy Policy Page
  write('privacy', `${head({
    title: `Privacy Policy | Appsolutely Free`,
    description: `Privacy policy for Appsolutely Free. No user tracking cookies, client-side stack persistence, and transparent disclosures.`,
    canonical: `${SITE}/privacy/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE}/privacy/` }
          ]
        },
        {
          '@type': 'AboutPage',
          name: 'Privacy Policy',
          description: 'Privacy practices and data policies for Appsolutely Free.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container" style="max-width: 860px;">
    <p class="crumbs"><a href="/">Home</a> › Privacy Policy</p>
    <header class="page-head" style="text-align: left; margin-bottom: 2rem;">
      <span class="eyebrow green">Privacy &amp; Data Rights</span>
      <h1>Privacy <span class="grad">Policy</span></h1>
      <p class="subtitle" style="margin: 0; text-align: left;">We believe technology directories should respect your privacy. Here is a plain-English explanation of our data practices.</p>
    </header>

    <article class="glass-panel" style="padding: 2.25rem; border-radius: var(--radius); line-height: 1.7; display: flex; flex-direction: column; gap: 1.5rem;">
      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.6rem; color: #fff;">1. We Don't Track You</h2>
        <p>Appsolutely Free does not run invasive cross-site tracking scripts or sell visitor profiles to data brokers. You can browse all 260+ alternatives, courses, games, and guides with zero account creation.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.6rem; color: #fff;">2. Local Storage ("My Stack" &amp; Calculator)</h2>
        <p>Tools saved to "My Stack" and selected subscriptions in the Annual Savings Calculator are stored exclusively in your browser's private <code>localStorage</code>. This data never touches our server and is never shared.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.6rem; color: #fff;">3. Advertising &amp; Affiliate Disclosure</h2>
        <p>To fund server hosting, domain fees, and continuous editorial testing, this site displays Google AdSense units and may participate in affiliate programs. When you click an external link to an optional paid provider, they may place a referral cookie subject to their privacy policy.</p>
      </section>

      <section>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.6rem; color: #fff;">4. Correction Reports &amp; Contact</h2>
        <p>When you submit a correction report or email us, any contact details you provide (such as your email address) are used solely to communicate regarding that specific report. We never add visitors to promotional marketing lists.</p>
      </section>
    </article>
    ${adUnitBottom}
  </main>
  ${footer}
</body>
</html>`);
  urls.push({ loc: `${SITE}/privacy/`, priority: '0.5', changefreq: 'yearly' });

  // 7. Contact Page
  write('contact', `${head({
    title: `Contact & Corrections | Appsolutely Free`,
    description: `Contact the Appsolutely Free team or founder Yishay Stewart-Mitchell. Submit software suggestions, report corrections, or partner with us.`,
    canonical: `${SITE}/contact/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Contact & Corrections', item: `${SITE}/contact/` }
          ]
        },
        {
          '@type': 'ContactPage',
          name: 'Contact Appsolutely Free',
          description: 'Contact details, software suggestions, and correction inquiries.'
        }
      ]
    }
  })}
<body>
  <div class="background-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
  ${nav}
  <main class="container" style="max-width: 860px;">
    <p class="crumbs"><a href="/">Home</a> › Contact</p>
    <header class="page-head" style="text-align: left; margin-bottom: 2rem;">
      <span class="eyebrow amber">Get In Touch</span>
      <h1>Contact &amp; <span class="grad">Corrections</span></h1>
      <p class="subtitle" style="margin: 0; text-align: left;">Have a software suggestion, spotted outdated pricing, or want to support our mission? We’d love to hear from you.</p>
    </header>

    <div class="glass-panel" style="padding: 2.25rem; border-radius: var(--radius); line-height: 1.7; display: flex; flex-direction: column; gap: 1.75rem;">
      <div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.5rem; color: #fff;">✉️ Email the Editorial Team</h2>
        <p>Send software tips, corrections, or inquiries directly to our inbox:</p>
        <a href="mailto:support@appsolutelyfree.com" style="display: inline-block; margin-top: 0.4rem; font-size: 1.1rem; color: var(--accent-ice); font-weight: 700; text-decoration: underline;">support@appsolutelyfree.com</a>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.5rem; color: #fff;">☕ Direct Creator Support</h2>
        <p>Appsolutely Free is created by Yishay Stewart-Mitchell from Jamaica, Queens. If this directory saved you money or helped you discover great tools, consider buying a coffee:</p>
        <a href="https://buymeacoffee.com/yishay" target="_blank" rel="noopener noreferrer" class="btn btn-bmc-primary" style="margin-top: 0.8rem; display: inline-flex;">☕ Buy Yishay a Coffee on BuyMeACoffee.com/yishay</a>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 0.5rem; color: #fff;">🐙 Open Source &amp; Community Contributions</h2>
        <p>Appsolutely Free is built openly. You can browse our source repository, submit data updates, and report issues on GitHub:</p>
        <a href="https://github.com/TheWaxSculptor/appsolutely-free" target="_blank" rel="noopener noreferrer" style="color: var(--accent-ice); text-decoration: underline; font-weight: 600;">github.com/TheWaxSculptor/appsolutely-free ↗</a>
      </div>
    </div>
    ${adUnitBottom}
  </main>
  ${footer}
</body>
</html>`);
  urls.push({ loc: `${SITE}/contact/`, priority: '0.7', changefreq: 'monthly' });

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq || 'weekly'}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`);
  console.log(`Wrote ${urls.length - 1} static pages and sitemap.xml`);
}

main().catch((e) => { console.error(e); process.exit(1); });
