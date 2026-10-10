const fs = require('fs');
const path = require('path');
const { loadAll } = require('./load-all');

const healthFile = path.join(__dirname, '../data/health.json');

async function fetchHealth() {
  const { alts } = loadAll();
  let healthData = {};
  try { healthData = JSON.parse(fs.readFileSync(healthFile, 'utf8')); } catch (e) { /* first run */ }

  const headers = { 'User-Agent': 'Appsolutely-Free-Health-Check' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  for (const data of alts) {
    if (data.repo && data.repo.host === 'github' && data.repo.url) {
      const parts = data.repo.url.replace(/\/$/, '').split('/');
      const repo = parts[parts.length - 1];
      const owner = parts[parts.length - 2];

      console.log(`Fetching health for ${owner}/${repo}...`);

      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (response.ok) {
          const repoData = await response.json();
          healthData[data.repo.url] = {
            stars: repoData.stargazers_count,
            last_commit: repoData.pushed_at || repoData.updated_at,
            open_issues: repoData.open_issues_count
          };
        } else {
          console.warn(`Failed to fetch ${owner}/${repo}: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error(`Error fetching ${owner}/${repo}:`, err.message);
      }
    }
  }

  fs.writeFileSync(healthFile, JSON.stringify(healthData, null, 2));
  console.log(`Wrote health data for ${Object.keys(healthData).length} repos to data/health.json`);
}

fetchHealth();
