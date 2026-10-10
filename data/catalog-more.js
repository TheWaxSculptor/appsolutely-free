// Additional apps and alternatives catalog
// Covers AI assistants, browsers, media players, e-book readers, game engines, accounting, and more.

const ALL = ['windows', 'macos', 'linux'];
const EVERYWHERE = ['windows', 'macos', 'linux', 'ios', 'android', 'web'];
const MOBILE = ['ios', 'android'];

const f = (id, name, website, type, license, platforms, replaces, summary, pros, cons, difficulty = 'easy', extra = {}) =>
  ({ id, name, website, type, license, platforms, replaces, summary, pros, cons, difficulty, ...extra });

const apps = [
  // AI & Chat
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', vendor: 'OpenAI', website: 'https://chatgpt.com/', category: 'dev', price_model: 'subscription', typical: '$20/month subscription' },
  { id: 'github-copilot', name: 'GitHub Copilot', vendor: 'Microsoft / GitHub', website: 'https://github.com/features/copilot', category: 'dev', price_model: 'subscription', typical: '$10-$19/month subscription' },
  
  // Browsers & Privacy
  { id: 'google-chrome', name: 'Google Chrome', vendor: 'Google', website: 'https://www.google.com/chrome/', category: 'utilities', price_model: 'free-with-tracking', typical: 'Free, monetized via ads & data collection' },
  
  // Music & Streaming
  { id: 'spotify', name: 'Spotify Premium', vendor: 'Spotify', website: 'https://www.spotify.com/', category: 'media', price_model: 'subscription', typical: '$11.99/month subscription' },

  // Anti-virus & Security
  { id: 'mcafee', name: 'McAfee / Norton Antivirus', vendor: 'McAfee / Gen Digital', website: 'https://www.mcafee.com/', category: 'security', price_model: 'subscription', typical: '$40-$90/year recurring subscription' },

  // Download & Torrent Managers
  { id: 'idm', name: 'Internet Download Manager (IDM)', vendor: 'Tonec Inc.', website: 'https://www.internetdownloadmanager.com/', category: 'utilities', price_model: 'paid', typical: '$24.95 one-time license' },

  // Publishing & InDesign
  { id: 'adobe-indesign', name: 'Adobe InDesign', vendor: 'Adobe', website: 'https://www.adobe.com/products/indesign.html', category: 'design', price_model: 'subscription', typical: '$22.99/month subscription' },

  // Game Engines
  { id: 'unity', name: 'Unity Engine', vendor: 'Unity Technologies', website: 'https://unity.com/', category: 'dev', price_model: 'freemium', typical: 'Free tier, then revenue share & runtime fees' },

  // Accounting & Finance
  { id: 'quickbooks', name: 'QuickBooks Online', vendor: 'Intuit', website: 'https://quickbooks.intuit.com/', category: 'business', price_model: 'subscription', typical: '$30-$90/month subscription' },

  // Video Encoders
  { id: 'adobe-media-encoder', name: 'Adobe Media Encoder', vendor: 'Adobe', website: 'https://www.adobe.com/products/media-encoder.html', category: 'video', price_model: 'subscription', typical: 'Included with Premiere / CC suite' },

  // Project Management
  { id: 'monday', name: 'Monday.com', vendor: 'monday.com Ltd.', website: 'https://monday.com/', category: 'productivity', price_model: 'subscription', typical: '$9-$24/user/month' },
];

const alts = [
  // ---- AI & LLM Assistants (ChatGPT Plus & Copilot replacements) ------------
  f('ollama', 'Ollama', 'https://ollama.com/', 'open-source', 'MIT', ALL, ['chatgpt-plus', 'github-copilot'],
    'Run state-of-the-art open-source LLMs (Llama 3, Mistral, DeepSeek, Qwen) completely offline and free on your own computer.',
    ['100% private: no data ever leaves your device', 'Works without internet or subscriptions', 'Huge library of open-weights models'],
    ['Requires a computer with decent RAM/GPU', 'Speed depends on your hardware'], 'easy', { repo: 'ollama/ollama' }),
  f('lm-studio', 'LM Studio', 'https://lmstudio.ai/', 'free', 'Free for personal use', ALL, ['chatgpt-plus'],
    'A slick desktop app to discover, download, and chat with local LLMs offline with a ChatGPT-like interface.',
    ['Beautiful UI identical to modern chat apps', 'One-click model downloading', 'Provides a local drop-in OpenAI-compatible API server'],
    ['Requires a modern Mac or PC with GPU', 'Closed-source desktop binary'], 'easy'),
  f('jan', 'Jan.ai', 'https://jan.ai/', 'open-source', 'AGPL-3.0', ALL, ['chatgpt-plus'],
    'An open-source alternative to ChatGPT that runs 100% offline on your device, customizable with extensions.',
    ['Clean, modern desktop interface', 'Self-hosted and local-first', 'Supports local hardware and remote APIs'],
    ['Model downloads can be large (4GB - 16GB)', 'Hardware requirements for heavy models'], 'easy', { repo: 'janhq/jan' }),
  f('claude-free', 'Claude by Anthropic', 'https://claude.ai/', 'freemium', 'Free tier, paid Pro', ['web', 'ios', 'android'], ['chatgpt-plus'],
    'Anthropic’s conversational AI assistant known for exceptional writing, coding, and document analysis.',
    ['Generous free tier with top-tier reasoning', 'High-quality code generation and long context', 'Available on web and mobile'],
    ['Free tier has message limits during peak hours', 'Not open-source or offline'], 'easy'),
  f('deepseek', 'DeepSeek AI', 'https://www.deepseek.com/', 'freemium', 'Free web / open weights', ['web', 'ios', 'android'], ['chatgpt-plus'],
    'An open-weight AI model family with state-of-the-art coding and math capabilities, free to use online.',
    ['Outstanding programming and reasoning performance', 'Open weights available to download', 'Free web interface'],
    ['Cloud servers can be congested', 'Requires account for web app'], 'easy'),
  f('continue', 'Continue.dev', 'https://www.continue.dev/', 'open-source', 'Apache-2.0', ['windows', 'macos', 'linux'], ['github-copilot'],
    'The leading open-source AI code assistant for VS Code and JetBrains, connecting to local or cloud models.',
    ['Autocomplete, chat, and codebase understanding inside your IDE', 'Works with Ollama, LM Studio, or cloud APIs', 'Fully open-source'],
    ['Requires setting up your own model provider', 'Autocomplete quality depends on chosen model'], 'moderate', { repo: 'continuedev/continue' }),

  // ---- Notion & Obsidian modern additions -----------------------------------
  f('affine', 'AFFiNE', 'https://affine.pro/', 'open-source', 'MIT', EVERYWHERE, ['notion', 'figma'],
    'A next-gen privacy-first open-source workspace combining Notion-style docs, Miro-style whiteboards, and databases.',
    ['Seamless switch between document view and infinite canvas whiteboard', 'Local-first with peer sync', 'No vendor lock-in'],
    ['Younger ecosystem than Notion', 'Self-hosting takes configuration'], 'easy', { repo: 'toeverything/AFFiNE' }),
  f('anytype', 'Anytype', 'https://anytype.io/', 'open-source', 'Any Source Available License', EVERYWHERE, ['notion'],
    'A beautiful local-first, decentralized, and encrypted alternative to Notion for notes, docs, and tasks.',
    ['End-to-end encrypted peer-to-peer sync', 'Works completely offline without an internet connection', 'Gorgeous native desktop & mobile apps'],
    ['Different paradigm takes some getting used to', 'Smaller plugin ecosystem'], 'easy', { repo: 'anyproto/anytype-ts' }),

  // ---- Browsers & Privacy (Google Chrome replacements) -----------------------
  f('firefox', 'Mozilla Firefox', 'https://www.mozilla.org/firefox/', 'open-source', 'MPL-2.0', EVERYWHERE, ['google-chrome'],
    'The premier independent, open-source web browser that protects your privacy and supports powerful extensions.',
    ['Independent rendering engine (Gecko) not controlled by Google', 'Full Manifest V2 ad-blocker support', 'Cross-device sync with privacy protection'],
    ['Slightly different performance profile on some sites', 'Market share is smaller than Chromium'], 'easy', { repo: 'mozilla/gecko-dev' }),
  f('brave', 'Brave Browser', 'https://brave.com/', 'open-source', 'MPL-2.0', EVERYWHERE, ['google-chrome'],
    'A fast, Chromium-based browser with built-in ad, tracker, and fingerprinting blocking by default.',
    ['Blocks ads and trackers out of the box with zero configuration', 'Runs all Chrome Web Store extensions', '3x faster page loads due to ad stripping'],
    ['Includes crypto/rewards features (can be toggled off)', 'Chromium engine'], 'easy', { repo: 'brave/brave-browser' }),
  f('librewolf', 'LibreWolf', 'https://librewolf.net/', 'open-source', 'MPL-2.0', ALL, ['google-chrome'],
    'A custom, hardened build of Firefox focused on privacy, security, and freedom, with zero telemetry.',
    ['Completely removed telemetry and data collection', 'Pre-configured with uBlock Origin and enhanced tracking protection', 'DuckDuckGo / SearXNG by default'],
    ['Can break logins on high-security banking sites due to strict anti-fingerprinting', 'No automatic updater on Windows without package managers'], 'easy', { repo: 'librewolf-community/browser' }),
  f('tor-browser', 'Tor Browser', 'https://www.torproject.org/', 'open-source', 'BSD-3-Clause', EVERYWHERE, ['google-chrome'],
    'The ultimate privacy browser that bounces your traffic through an encrypted relay network worldwide.',
    ['Complete anonymity and censorship circumvention', 'Defeats browser fingerprinting completely', 'Free and non-profit maintained'],
    ['Slower browsing speed due to multi-hop routing', 'Some websites block known exit nodes'], 'moderate'),

  // ---- Music & Streaming (Spotify replacements) ------------------------------
  f('spotube', 'Spotube', 'https://spotube.krtirtho.dev/', 'open-source', 'BSD-4-Clause', EVERYWHERE, ['spotify'],
    'An open-source Spotify client that uses Spotify’s metadata with YouTube as the audio source, giving you ad-free music.',
    ['No Spotify Premium subscription needed', 'No ads and no telemetry', 'Download tracks for offline listening'],
    ['Relies on YouTube audio matching, so very niche live tracks may mismatch', 'Cannot play Spotify Podcasts'], 'easy', { repo: 'KRTirtho/spotube' }),
  f('vlc', 'VLC Media Player', 'https://www.videolan.org/vlc/', 'open-source', 'GPL-2.0', EVERYWHERE, ['spotify', 'plex'],
    'The legendary free media player that plays virtually any video, audio, DVD, or stream format without codec packs.',
    ['Plays absolutely every video and audio codec known to man', 'Zero ads, spyware, or user tracking', 'Hardware acceleration and streaming support'],
    ['Traditional media player UI rather than a cloud library', 'Does not provide cloud music catalogs'], 'easy', { repo: 'videolan/vlc' }),
  f('nuclear', 'Nuclear Music Player', 'https://nuclear.js.org/', 'open-source', 'AGPL-3.0', ALL, ['spotify'],
    'A modern streaming music player that pulls free music from free sources across the internet into one slick UI.',
    ['Free streaming with no ads', 'Scrobbling to Last.fm and lyrics integration', 'Multi-source searching'],
    ['Electron-based, so can use more RAM than native apps', 'Track matching occasionally differs'], 'easy', { repo: 'nukeop/nuclear' }),

  // ---- Antivirus & Ad-blocking (McAfee / Norton replacements) ----------------
  f('ublock-origin', 'uBlock Origin', 'https://ublockorigin.com/', 'open-source', 'GPL-3.0', ['web', 'windows', 'macos', 'linux', 'android'], ['mcafee'],
    'The world’s most effective, lightweight, open-source content blocker for ads, trackers, coin miners, and malware domains.',
    ['Completely wipes ads, popups, and tracker scripts from the web', 'Tiny CPU and memory footprint compared to antivirus web shields', 'Completely free and non-commercial'],
    ['Browser extension only; does not scan local files', 'Chromium is restricting extensions via Manifest V3 (works best on Firefox)'], 'easy', { repo: 'gorhill/uBlock' }),
  f('malwarebytes-free', 'Malwarebytes (Free Scanner)', 'https://www.malwarebytes.com/', 'freemium', 'Free manual scanner, paid real-time', ['windows', 'macos', 'android', 'ios'], ['mcafee'],
    'The gold-standard free on-demand malware, spyware, and adware detection and cleaning tool.',
    ['Detects malware and junkware traditional antivirus misses', 'Free manual scanning and removal forever', 'No subscription required to clean an infected PC'],
    ['Free version lacks real-time background protection (rely on Windows Defender)', 'Occasional upgrade prompts'], 'easy'),

  // ---- Download Managers (IDM replacements) ----------------------------------
  f('fdm', 'Free Download Manager (FDM)', 'https://www.freedownloadmanager.org/', 'free', 'Freeware', ['windows', 'macos', 'linux', 'android'], ['idm'],
    'A modern, multi-threaded download accelerator and torrent client that speeds up downloads by splitting files.',
    ['Up to 10x download acceleration via split connections', 'Built-in BitTorrent client', 'Browser integration for Chrome, Firefox, Edge'],
    ['Closed source (though completely free)', 'Slightly larger installer than IDM'], 'easy'),
  f('jdownloader', 'JDownloader 2', 'https://jdownloader.org/', 'open-source', 'GPL', ALL, ['idm'],
    'The most comprehensive open-source download manager for hoster sites, link grabbing, and batch extraction.',
    ['Link grabber catches video/audio from thousands of sites', 'Automatic archive extraction (RAR/ZIP)', 'Captcha solving and cloud remote control'],
    ['Java-based interface looks technical', 'Installer has optional sponsor offers (use clean installer)'], 'moderate'),
  f('motrix', 'Motrix', 'https://motrix.app/', 'open-source', 'MIT', ALL, ['idm'],
    'A gorgeous, minimalist download manager powered by aria2 supporting HTTP, FTP, BitTorrent, and Magnet links.',
    ['Stunning minimalist dark UI', 'Up to 64 concurrent download threads', 'No ads or tracking'],
    ['Fewer site-specific decrypters than JDownloader', 'Development is quiet'], 'easy', { repo: 'agalwood/motrix' }),

  // ---- InDesign & Publishing (Adobe InDesign replacements) -------------------
  f('scribus', 'Scribus', 'https://www.scribus.net/', 'open-source', 'GPL-2.0', ALL, ['adobe-indesign'],
    'A professional desktop publishing application for layout, typography, and prepress PDF output.',
    ['Full CMYK color support, spot colors, and ICC color management', 'Interactive PDF form creation', 'Free for commercial book & magazine production'],
    ['Steeper learning curve than InDesign', 'Cannot natively open proprietary InDesign .indd files'], 'moderate'),

  // ---- Video Transcoding & Utilities (Media Encoder replacements) ------------
  f('handbrake', 'HandBrake', 'https://handbrake.fr/', 'open-source', 'GPL-2.0', ALL, ['adobe-media-encoder', 'camtasia'],
    'The open-source video transcoder for converting video from nearly any format to a selection of modern codecs.',
    ['Massive preset library for devices, web, and streaming', 'Hardware encoding (NVENC, Intel QSV, Apple Silicon)', 'Batch queue encoding'],
    ['Encoding only; does not edit or trim timelines', 'Cannot decrypt commercial copy-protected Blu-rays natively'], 'easy', { repo: 'HandBrake/HandBrake' }),
  f('shutter-encoder', 'Shutter Encoder', 'https://www.shutterencoder.com/', 'free', 'Free / Donationware', ALL, ['adobe-media-encoder'],
    'A pro-grade video converter based on FFmpeg tailored for film editors and broadcast workflows.',
    ['Converts to Apple ProRes, DNxHD, H.264, and AV1', 'Built-in subtitling, rewinding, and audio normalization', 'No installation needed for portable build'],
    ['Interface is dense with professional video specs', 'Can be intimidating for casual users'], 'moderate'),

  // ---- Game Engines (Unity replacements) -------------------------------------
  f('godot', 'Godot Engine', 'https://godotengine.org/', 'open-source', 'MIT', ALL, ['unity'],
    'The free, open-source 2D and 3D game engine that is completely free of royalties, runtime fees, and subscriptions.',
    ['100% free under MIT with ZERO royalties forever', 'Lightweight 50MB single executable with fast startup', 'Clean node-based scene architecture with GDScript & C#'],
    ['High-end 3D graphics pipeline still maturing compared to Unreal/Unity', 'Fewer console export kits out of the box'], 'moderate', { repo: 'godotengine/godot' }),

  // ---- Small Business & Accounting (QuickBooks replacements) -----------------
  f('gnucash', 'GnuCash', 'https://www.gnucash.org/', 'open-source', 'GPL-2.0', ALL, ['quickbooks', 'ynab'],
    'Personal and small-business financial-accounting software with double-entry bookkeeping, invoicing, and reporting.',
    ['Double-entry accounting principles ensure accurate books', 'Invoicing, accounts receivable, and accounts payable', 'Local storage with no recurring subscription fees'],
    ['Interface is traditional and requires understanding basic bookkeeping', 'No mobile cloud sync app out of the box'], 'moderate', { repo: 'Gnucash/gnucash' }),
  f('wave-apps', 'Wave Accounting', 'https://www.waveapps.com/', 'freemium', 'Free invoicing & accounting', ['web', 'ios', 'android'], ['quickbooks'],
    'Free invoicing and accounting for small business owners and freelancers with no monthly software fee.',
    ['Free unlimited invoicing, accounting, and receipt scanning', 'Professional invoice templates with payment links', 'Clean web dashboard'],
    ['Charges standard transaction fees if customers pay via credit card', 'Payroll is a paid add-on'], 'easy'),

  // ---- Project Management (Monday.com & Jira replacements) -------------------
  f('taiga', 'Taiga', 'https://taiga.io/', 'open-source', 'MPL-2.0', ['web', 'self-hosted'], ['monday', 'trello'],
    'A user-friendly, agile project management tool with Scrum and Kanban boards for cross-functional teams.',
    ['Beautiful, intuitive interface designed for agile developers', 'Scrum sprints, user stories, and epics', 'Free hosted tier and self-hostable'],
    ['Fewer traditional Gantt chart tools than Monday.com', 'Self-hosting requires Docker'], 'easy', { repo: 'taigaio/taiga-front' }),
  f('openproject', 'OpenProject', 'https://www.openproject.org/', 'open-source', 'GPL-3.0', ['web', 'self-hosted'], ['monday', 'trello'],
    'The leading open-source project management software for classic, agile, or hybrid projects with Gantt charts.',
    ['Comprehensive interactive Gantt charts and timelines', 'Agile boards and task tracking', 'Enterprise security and accessibility compliance'],
    ['Heavier setup and system requirements for self-hosting', 'Advanced features in Enterprise edition'], 'moderate', { repo: 'opf/openproject' }),
];

module.exports = { apps, alts };
