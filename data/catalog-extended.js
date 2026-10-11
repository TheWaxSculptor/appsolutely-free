// Extended catalog of paid apps and high-demand free/open-source alternatives
// Covering game engines, 3D/VFX, code editors, social platforms, maps, forms, website builders, handwriting, audiobooks, and more.

const ALL = ['windows', 'macos', 'linux'];
const EVERYWHERE = ['windows', 'macos', 'linux', 'ios', 'android', 'web'];
const DESKTOP_WEB = ['windows', 'macos', 'linux', 'web'];
const MOBILE = ['ios', 'android'];

const f = (id, name, website, type, license, platforms, replaces, summary, pros, cons, difficulty = 'easy', extra = {}) =>
  ({ id, name, website, type, license, platforms, replaces, summary, pros, cons, difficulty, ...extra });

const apps = [
  // Code & Text Editors
  { id: 'sublime-text', name: 'Sublime Text / UltraEdit', vendor: 'Sublime HQ / Idera', website: 'https://www.sublimetext.com/', category: 'dev', price_model: 'paid', typical: '$99 license fee' },

  // Chat & Community
  { id: 'discord', name: 'Discord Nitro', vendor: 'Discord Inc.', website: 'https://discord.com/', category: 'communication', price_model: 'subscription', typical: '$9.99/month ($99.99/year) Nitro subscription' },

  // Social & Microblogging
  { id: 'twitter', name: 'X (Twitter) Premium', vendor: 'X Corp.', website: 'https://x.com/', category: 'communication', price_model: 'subscription', typical: '$8-$16/month subscription' },

  // Maps & Navigation
  { id: 'google-maps', name: 'Google Maps', vendor: 'Google', website: 'https://maps.google.com/', category: 'utilities', price_model: 'free-with-tracking', typical: 'Free, monetized via location tracking & ads' },

  // System Launchers
  { id: 'raycast', name: 'Raycast Pro / Alfred Powerpack', vendor: 'Raycast / Running with Crayons', website: 'https://www.raycast.com/', category: 'utilities', price_model: 'subscription', typical: '$8/month or £34 single-user license' },

  // Screen Recording & Sharing
  { id: 'loom', name: 'Loom / ScreenFlow', vendor: 'Atlassian / Telestream', website: 'https://www.loom.com/', category: 'video', price_model: 'subscription', typical: '$12.50-$15/month subscription' },

  // Forms & Surveys
  { id: 'typeform', name: 'Typeform / SurveyMonkey', vendor: 'Typeform / Momentive', website: 'https://www.typeform.com/', category: 'business', price_model: 'subscription', typical: '$25-$83/month subscription' },

  // Website Builders & CMS
  { id: 'squarespace', name: 'Squarespace / Webflow', vendor: 'Squarespace / Webflow Inc.', website: 'https://www.squarespace.com/', category: 'business', price_model: 'subscription', typical: '$16-$49/month hosting & builder subscription' },

  // Handwriting & Tablet Notes
  { id: 'goodnotes', name: 'GoodNotes / Notability', vendor: 'Time Base Technology / Ginger Labs', website: 'https://www.goodnotes.com/', category: 'productivity', price_model: 'subscription', typical: '$9.99-$14.99/year subscription or $29.99 unlock' },

  // Audiobooks & Spoken Media
  { id: 'audible', name: 'Audible', vendor: 'Amazon', website: 'https://www.audible.com/', category: 'media', price_model: 'subscription', typical: '$14.95/month credit subscription' },

  // Math & Calculation
  { id: 'wolfram-alpha', name: 'Wolfram Alpha Pro', vendor: 'Wolfram Research', website: 'https://www.wolframalpha.com/', category: 'dev', price_model: 'subscription', typical: '$5-$9.75/month subscription' },

  // URL Shorteners & Link-in-Bio
  { id: 'bitly', name: 'Bitly / Linktree', vendor: 'Bitly / Linktree', website: 'https://bitly.com/', category: 'business', price_model: 'subscription', typical: '$35/month or $9/month Pro subscription' },
];

const alts = [
  // =========================================================================
  // Game Engines (replaces 'unity')
  // =========================================================================
  f('defold', 'Defold', 'https://defold.com/', 'open-source', 'Defold License (Developer-Friendly)', EVERYWHERE, ['unity'],
    'An ultra-lightweight, high-performance 2D and 3D game engine with blazing fast compile times, zero setup, and no runtime royalties.',
    ['Extremely tiny build sizes (under 5MB HTML5/mobile games)', 'Zero royalties or revenue shares ever', 'Rock-solid Lua scripting workflow'],
    ['Smaller 3D feature set compared to Unreal or Unity', 'Community ecosystem is smaller than Unity'], 'moderate', { repo: 'defold/defold' }),

  f('unreal-engine', 'Unreal Engine', 'https://www.unrealengine.com/', 'free', 'Free to start (5% royalty after $1M gross)', ALL, ['unity'],
    'The industry standard AAA 3D game and virtual production engine featuring photorealistic Nanite geometry and Lumen dynamic lighting.',
    ['Unrivaled photorealistic 3D graphics and lighting out of the box', 'Visual Blueprint scripting plus native C++', '100% free until your game earns over $1,000,000 USD'],
    ['Massive disk install size (50GB - 100GB+)', 'Demanding hardware requirements for development'], 'hard'),

  f('stride', 'Stride 3D', 'https://stride3d.net/', 'open-source', 'MIT', ALL, ['unity'],
    'A free, open-source C# 2D and 3D game engine built on modern .NET, designed as the closest open architectural alternative to Unity.',
    ['Native modern C# and .NET with full async/await support', 'Familiar component and scene editor workflow for Unity developers', 'Completely open source with zero runtime fees'],
    ['Smaller asset store and plugin ecosystem', 'Smaller community than Godot or Unity'], 'moderate', { repo: 'stride3d/stride' }),

  f('raylib', 'Raylib', 'https://www.raylib.com/', 'open-source', 'zlib/libpng', EVERYWHERE, ['unity'],
    'A simple, lightweight C library for videogame programming with no bloated GUI or project managers, beloved by hobbyists and educators.',
    ['Zero bloated editor; pure code-driven videogame programming', 'Bindings for over 60+ programming languages', 'Superb cross-platform performance on web, mobile, and desktop'],
    ['No visual drag-and-drop editor', 'Requires writing game loops and UI manually'], 'moderate', { repo: 'raysan5/raylib' }),

  f('gdevelop', 'GDevelop', 'https://gdevelop.io/', 'open-source', 'MIT / BSL', EVERYWHERE, ['unity'],
    'An intuitive, open-source 2D and 3D game creator that lets anyone build games using visual event-based logic without writing code.',
    ['Visual event sheet system requires zero coding knowledge', 'Built-in asset store with thousands of free sprites and sounds', 'One-click export to iOS, Android, Steam, and web'],
    ['Complex game logic can become unwieldy in event sheets', '3D tools are geared toward simple low-poly games'], 'easy', { repo: '4ian/GDevelop' }),

  // =========================================================================
  // Desktop Publishing & Typesetting (replaces 'adobe-indesign')
  // =========================================================================
  f('marq', 'Marq (Lucidpress)', 'https://www.marq.com/', 'freemium', 'Free tier, paid teams', ['web'], ['adobe-indesign'],
    'A collaborative, web-based desktop publishing and brand templating tool with drag-and-drop page layouts and print-ready export.',
    ['Intuitive drag-and-drop page layout inside any modern browser', 'Real-time collaborative editing with team members', 'Pre-made templates for flyers, newsletters, and brochures'],
    ['Free tier limits stored documents and exports to 3 pages', 'Cloud-only; requires an internet connection'], 'easy'),

  f('typst', 'Typst', 'https://typst.app/', 'open-source', 'Apache-2.0', ['web', 'windows', 'macos', 'linux'], ['adobe-indesign'],
    'A modern, blazingly fast markup-based typesetting system designed to replace LaTeX and InDesign for beautiful reports, books, and papers.',
    ['Instant sub-second compile previews as you type', 'Clean, intuitive syntax far easier to learn than LaTeX', 'Produces publication-grade typography, equations, and PDFs'],
    ['Markup-driven rather than drag-and-drop GUI', 'Newer package ecosystem'], 'moderate', { repo: 'typst/typst' }),

  f('lyx', 'LyX', 'https://www.lyx.org/', 'open-source', 'GPL-2.0', ALL, ['adobe-indesign'],
    'A visual WYSIWYM document processor that combines the ease of a graphical word processor with the typographic brilliance of TeX.',
    ['Mathematical formulas and structural formatting look gorgeous', 'Focus on document structure rather than manual page tinkering', 'Battle-tested for textbooks, theses, and articles'],
    ['Dated graphical interface appearance', 'Steeper learning curve than standard word processors'], 'moderate'),

  // =========================================================================
  // 3D Modeling, Texturing & Voxel Art (replaces 'maya')
  // =========================================================================
  f('wings-3d', 'Wings 3D', 'http://www.wings3d.com/', 'open-source', 'BSD-style', ALL, ['maya'],
    'A dedicated polygon subdivision modeler with an intuitive contextual right-click interface and powerful mesh tools.',
    ['Extremely fast and intuitive subdivision mesh modeling', 'Lightweight and boots up in a split second', 'Context-sensitive menus speed up polygon modeling workflows'],
    ['Modeling only: does not support animation or rigging', 'Traditional interface conventions'], 'moderate'),

  f('magicavoxel', 'MagicaVoxel', 'https://ephtracy.github.io/', 'free', 'Freeware', ['windows', 'macos'], ['maya'],
    'A free, lightweight 8-bit voxel art editor and GPU-accelerated interactive path-tracing renderer that makes 3D creation accessible.',
    ['Stunning built-in interactive path tracer with realistic shadows, glass, and emission', 'Extremely fun, accessible voxel block sculpting', 'Exports directly to OBJ, VOX, and MagicaVoxel formats'],
    ['Voxel aesthetic only; not suitable for traditional curved CAD/NURBS surfaces', 'No bone rigging system'], 'easy'),

  f('dust3d', 'Dust3D', 'https://dust3d.org/', 'open-source', 'MIT', ALL, ['maya'],
    'A quick 3D modeling software for indie game developers to auto-generate watertight base meshes, UV unwrap, and rig characters in minutes.',
    ['Auto-generates clean 3D character meshes from 2D reference lines', 'Built-in automatic UV unwrapping and rigging', 'Exports directly to glTF and FBX for game engines'],
    ['Specialized for quick character base meshes, not detailed micro-sculpting', 'Interface takes an hour to get used to'], 'easy', { repo: 'huxingyi/dust3d' }),

  f('armorpaint', 'ArmorPaint', 'https://armorpaint.org/', 'open-source', 'zlib/libpng (free from source)', ALL, ['maya'],
    'A stand-alone, GPU-accelerated 3D PBR texture painting software designed as an open-source alternative to Substance 3D Painter.',
    ['Physically-based texture painting with real-time viewport feedback', 'Node-based procedural material graph editor', 'Runs smoothly on standard GPUs with ray tracing support'],
    ['Pre-compiled binaries require purchase/donation, though source code is completely free on GitHub', 'Smaller brush library than Substance Painter'], 'moderate', { repo: 'armory3d/armorpaint' }),

  // =========================================================================
  // Music Notation & Scoring (replaces 'sibelius')
  // =========================================================================
  f('lilypond', 'LilyPond', 'https://lilypond.org/', 'open-source', 'GPL-2.0', ALL, ['sibelius'],
    'A music engraving system dedicated to producing the highest publication-quality sheet music from automated code input.',
    ['Engraving quality matches the finest traditional European music publishers', 'Text-based music files can be version-controlled in Git', 'Automated spacing, beams, and collision avoidance'],
    ['Steep learning curve (text programming language, no visual piano roll)', 'Requires a front-end like Frescobaldi for visual previews'], 'hard'),

  f('flat-io', 'Flat.io', 'https://flat.io/', 'freemium', 'Free tier, paid Power', EVERYWHERE, ['sibelius'],
    'A collaborative online music score and guitar tablature editor that runs in your web browser with real-time multi-user editing.',
    ['Real-time Google Docs-style collaboration on sheet music', 'Works in any browser on laptops, iPads, and Chromebooks', 'High-quality instrument playback audio'],
    ['Free plan limits you to 15 concurrent scores', 'Requires internet connection for cloud saving'], 'easy'),

  f('noteflight', 'Noteflight', 'https://www.noteflight.com/', 'freemium', 'Free tier, paid Crescendo', ['web'], ['sibelius'],
    'An established web-based music notation community and editor for writing, listening to, and sharing music online.',
    ['Nothing to install; compose sheet music directly in your web browser', 'Active community to share and discover original scores', 'Print and export MIDI/XML files'],
    ['Free accounts are limited to 10 saved scores', 'Web interface can feel sluggish with huge orchestral scores'], 'easy'),

  // =========================================================================
  // Booking & Scheduling (replaces 'calendly')
  // =========================================================================
  f('koalendar', 'Koalendar', 'https://koalendar.com/', 'freemium', 'Free tier, paid Pro', ['web', 'ios', 'android'], ['calendly'],
    'A clean, modern 1-on-1 booking page software with free Google Calendar sync and no meeting limits on the free plan.',
    ['Unlimited appointments on the free tier', 'Clean, responsive booking page that embeds easily into websites', 'Direct Google Calendar & Outlook integration'],
    ['Group booking and custom branding require Pro plan', 'Basic email reminders only on free plan'], 'easy'),

  f('tidycal', 'TidyCal', 'https://tidycal.com/', 'freemium', 'Free tier, $29 lifetime Pro', ['web'], ['calendly'],
    'A streamlined booking software by AppSumo for scheduling meetings and paid consultations with a generous free plan.',
    ['Zero recurring subscriptions (free tier + $29 lifetime deal for advanced features)', 'Syncs with Google Calendar, Apple Calendar, and Office 365', 'Accepts payments via Stripe and PayPal on paid tier'],
    ['Free tier allows up to 2 calendar connections', 'Simpler interface with fewer enterprise integrations'], 'easy'),

  f('zcal', 'Zcal', 'https://zcal.co/', 'free', 'Free individual plan', ['web'], ['calendly'],
    'A free meeting scheduling app that adds personalized video introductions and collective meeting polling with zero paywalls.',
    ['Generous free plan with unlimited booking links and calendars', 'Record short video/GIF intros to personalize your booking page', 'No branding watermarks on standard bookings'],
    ['Smaller user base and third-party integrations than Calendly', 'No native SMS notifications'], 'easy'),

  // =========================================================================
  // AI Coding Assistants & Agents (replaces 'github-copilot')
  // =========================================================================
  f('void-editor', 'Void', 'https://voideditor.com/', 'open-source', 'Apache-2.0', ALL, ['github-copilot'],
    'An open-source AI code editor alternative to Cursor that lets you use any local or hosted LLM without sending your code to third parties.',
    ['Familiar VS Code fork interface with inline AI edits and codebase chat', 'Supports local models (Ollama/vLLM) or private cloud API keys', 'No telemetry or forced telemetry subscriptions'],
    ['Early development stage compared to mature editors', 'Requires providing your own API key or local model setup'], 'easy', { repo: 'voideditor/void' }),

  f('cline', 'Cline', 'https://cline.bot/', 'open-source', 'Apache-2.0', ALL, ['github-copilot'],
    'An autonomous AI coding agent for VS Code that executes terminal commands, reads browser console, and edits multi-file codebases with your approval.',
    ['Can autonomously create entire projects, debug errors, and run tests', 'Human-in-the-loop approval for every command and file change', 'Works with Claude 3.5 Sonnet, DeepSeek, OpenAI, or local models'],
    ['Can burn through API tokens quickly on large multi-step tasks', 'Requires careful supervision on terminal commands'], 'moderate', { repo: 'cline/cline' }),

  f('aider', 'Aider', 'https://aider.chat/', 'open-source', 'Apache-2.0', ALL, ['github-copilot'],
    'A top-rated command-line AI pair programmer that writes, edits, and commits code directly to your local Git repository.',
    ['Ranks #1 on coding benchmarks for multi-file repo edits', 'Automatically writes Git commits with descriptive commit messages', 'Terminal-native; works with any IDE or terminal emulator'],
    ['Command-line interface (no visual GUI panels)', 'Requires familiarizing yourself with slash commands (/add, /drop)'], 'moderate', { repo: 'Aider-AI/aider' }),

  f('codeium', 'Codeium / Windsurf', 'https://codeium.com/', 'freemium', 'Free personal tier, paid teams', EVERYWHERE, ['github-copilot'],
    'A blazingly fast AI code completion and in-editor chat assistant with a free personal tier supporting over 70+ languages and 40+ IDEs.',
    ['Generous free personal tier with unlimited autocomplete', 'Integrates with VS Code, JetBrains, Vim, Emacs, and Xcode', 'Ultra-fast low latency completions'],
    ['Proprietary backend model (not self-hosted)', 'Advanced team collaboration features require enterprise tier'], 'easy'),

  // =========================================================================
  // Writing & Grammar Checkers (replaces 'grammarly')
  // =========================================================================
  f('quillbot', 'QuillBot', 'https://quillbot.com/', 'freemium', 'Free tier, paid Premium', ['web', 'windows', 'macos'], ['grammarly'],
    'A widely popular AI writing assistant, paraphraser, grammar checker, and summarizer that helps refine essays, emails, and articles.',
    ['One-click sentence rewriting and tone adjustments', 'Free grammar checker and citation generator', 'Browser extensions for Chrome and Edge'],
    ['Free paraphraser has word count limits per paste (125 words)', 'Advanced vocabulary tones locked behind Premium'], 'easy'),

  f('vale', 'Vale', 'https://vale.sh/', 'open-source', 'MIT', ALL, ['grammarly'],
    'An open-source, highly customizable syntax-aware prose and style linter for technical writers and developers.',
    ['Enforces custom company style guides (Google, Microsoft, or custom)', 'Understands Markdown, AsciiDoc, and HTML without breaking syntax', 'Runs in CI/CD pipelines, Git pre-commit hooks, and IDEs'],
    ['CLI-focused tool meant for technical writers, not general consumers', 'Requires YAML configuration to customize rules'], 'moderate', { repo: 'errata-ai/vale' }),

  f('prowritingaid-free', 'ProWritingAid Free', 'https://prowritingaid.com/', 'freemium', 'Free tier, paid Premium', ['web', 'windows', 'macos'], ['grammarly'],
    'A comprehensive writing mentor and style checker that analyzes clarity, passive voice, readability, and pacing.',
    ['In-depth reports on sticky sentences, overused words, and pacing', 'Browser extensions and web editor', 'Helps improve creative and fiction writing craft'],
    ['Free tier limited to 500 words per check', 'Desktop deep app integrations require Premium'], 'easy'),

  // =========================================================================
  // Accounting & Invoicing (replaces 'quickbooks')
  // =========================================================================
  f('akaunting', 'Akaunting', 'https://akaunting.com/', 'open-source', 'GPL-3.0', ['web', 'self-hosted'], ['quickbooks'],
    'A free, open-source online accounting software designed for small businesses and freelancers to manage money from anywhere.',
    ['Invoicing, expense tracking, deposits, and banking feeds in one web portal', 'Self-hostable with full data ownership or hosted cloud option', 'Multi-currency and client portal features'],
    ['App store ecosystem charges for certain third-party extensions', 'Self-hosting requires PHP and MySQL server setup'], 'moderate', { repo: 'akaunting/akaunting' }),

  f('manager-io', 'Manager Accounting', 'https://www.manager.io/', 'free', 'Free desktop version, paid cloud', ALL, ['quickbooks'],
    'A fully-featured, free desktop accounting application with comprehensive double-entry bookkeeping, general ledger, and VAT/sales tax reports.',
    ['Completely free and unlimited on desktop with zero recurring fees', 'Works completely offline; stores data in local database files', 'Full double-entry general ledger, balance sheets, and profit & loss'],
    ['Desktop version is single-user only (multi-user requires Cloud or Server paid edition)', 'Interface is functional rather than flashy'], 'moderate'),

  f('dolibarr', 'Dolibarr ERP & CRM', 'https://www.dolibarr.org/', 'open-source', 'GPL-3.0', ['web', 'self-hosted'], ['quickbooks'],
    'An all-in-one open-source ERP and CRM suite that handles invoices, quotes, inventory, orders, and customer management for companies.',
    ['Modular architecture: enable only the modules you need (invoicing, stock, HR)', 'Handles complex B2B sales pipelines and purchase orders', 'Active global open-source community with over 15 years of updates'],
    ['Traditional enterprise UI', 'Installation requires web server hosting (LAMP stack or Docker)'], 'moderate', { repo: 'Dolibarr/dolibarr' }),

  // =========================================================================
  // Relational Databases & Spreadsheets (replaces 'airtable')
  // =========================================================================
  f('grist', 'Grist', 'https://www.getgrist.com/', 'open-source', 'Apache-2.0', ['web', 'self-hosted'], ['airtable'],
    'A modern relational spreadsheet combining the drag-and-drop flexibility of Airtable with real Python formulas and granular permissions.',
    ['Formulas use real Python syntax instead of clunky formula languages', 'Custom multi-panel dashboards linking tables, cards, and charts', 'Self-hostable via Docker or use the free cloud tier'],
    ['Younger template gallery than Airtable', 'Python formulas require basic scripting familiarity for advanced features'], 'easy', { repo: 'gristlabs/grist-core' }),

  f('teable', 'Teable', 'https://teable.io/', 'open-source', 'AGPL-3.0', ['web', 'self-hosted'], ['airtable'],
    'A super-fast, real-time open-source no-code database built directly on native PostgreSQL, capable of handling millions of records smoothly.',
    ['Blazingly fast performance scaling to 100k+ rows without lag', 'Native Postgres architecture allows direct SQL queries and extensions', 'Modern, responsive Airtable-like spreadsheet interface'],
    ['Newer product under rapid development', 'Self-hosting requires Docker compose stack'], 'easy', { repo: 'teableio/teable' }),

  f('mathesar', 'Mathesar', 'https://mathesar.org/', 'open-source', 'GPL-3.0', ['web', 'self-hosted'], ['airtable'],
    'An open-source web application that turns any existing PostgreSQL database into an intuitive spreadsheet UI for non-technical users.',
    ['Zero schema duplication: operates directly on your actual PostgreSQL database', 'Preserves data types, foreign keys, and constraints automatically', 'Completely free and open-source with no row limits'],
    ['Requires an existing PostgreSQL database', 'Designed for database administration, not marketing Kanban boards'], 'moderate', { repo: 'centerofci/mathesar' }),

  // =========================================================================
  // Mac & PC Cleaners & Uninstallers (replaces 'cleanmymac')
  // =========================================================================
  f('appcleaner', 'AppCleaner', 'https://freemacsoft.net/appcleaner/', 'free', 'Freeware', ['macos'], ['cleanmymac'],
    'A tiny, legendary freeware Mac uninstaller that finds and deletes all hidden application caches, preference plists, and support files.',
    ['Drop an app icon onto the window to locate all hidden leftover files', 'Safe: review exactly what files will be removed before deleting', 'Tiny, fast, and completely free with zero ads or upsells'],
    ['macOS only', 'Focuses purely on application uninstalls rather than disk sweep scans'], 'easy'),

  f('pearcleaner', 'Pearcleaner', 'https://github.com/alienator88/Pearcleaner', 'open-source', 'GPL-3.0', ['macos'], ['cleanmymac'],
    'A modern, open-source macOS app uninstaller and leftovers remover written in native Swift with zero telemetry.',
    ['Native Swift macOS app with clean modern design', 'Deep leftover file search across Application Support and LaunchAgents', 'Completely open-source and privacy-respecting'],
    ['macOS only', 'Distributed via GitHub releases and Homebrew'], 'easy', { repo: 'alienator88/Pearcleaner' }),

  f('grandperspective', 'GrandPerspective', 'https://grandperspectiv.sourceforge.net/', 'open-source', 'GPL-2.0', ['macos'], ['cleanmymac'],
    'A graphical disk space visualization tool that draws an interactive treemap to reveal exactly what large files are eating your storage.',
    ['Visual treemaps make multi-gigabyte hidden videos and caches instantly obvious', 'Scan internal hard drives, external disks, or specific folders', 'Lightweight and open-source'],
    ['Visualizes disk space, but file deletion requires manual user review', 'Traditional macOS utility aesthetic'], 'easy', { repo: { host: 'sourceforge', url: 'https://sourceforge.net/projects/grandperspectiv/' } }),

  // =========================================================================
  // Modern Project Management & Task Boards (replaces 'monday')
  // =========================================================================
  f('focalboard', 'Focalboard', 'https://www.focalboard.com/', 'open-source', 'MIT / AGPL', ['web', 'windows', 'macos', 'linux', 'self-hosted'], ['monday', 'trello'],
    'An open-source multilingual project management tool by Mattermost for organizing work with Kanban boards, tables, galleries, and calendars.',
    ['Available as a standalone desktop app or self-hosted server', 'Familiar Notion/Trello card properties, filters, and custom views', 'Clean, responsive UI with no user subscription caps'],
    ['Standalone desktop app lacks real-time multi-user sync (requires server setup)', 'Smaller integration ecosystem than Monday.com'], 'easy', { repo: 'mattermost/focalboard' }),

  f('leantime', 'Leantime', 'https://leantime.io/', 'open-source', 'GPL-2.0', ['web', 'self-hosted'], ['monday', 'trello'],
    'An open-source strategic project management system that combines lean principles, milestone roadmaps, and ADHD-friendly task design.',
    ['Built for entrepreneurs and cross-functional teams with milestone tracking', 'ADHD-friendly design that prioritizes focus and reduces cognitive overload', 'Gantt charts, idea boards, and strategy roadmaps included'],
    ['Heavier initial interface than simple Kanban boards', 'Self-hosting requires standard PHP/MySQL or Docker setup'], 'moderate', { repo: 'Leantime/leantime' }),

  f('vikunja', 'Vikunja', 'https://vikunja.io/', 'open-source', 'AGPL-3.0', EVERYWHERE, ['monday', 'trello'],
    'A to-do and project management app that lets you organize tasks with Kanban boards, Gantt timelines, lists, and table views.',
    ['Switch seamlessly between List, Kanban, Gantt chart, and Table views', 'CalDAV support to sync tasks with phone calendar apps', 'Fast Go-powered backend that runs effortlessly on low-power servers'],
    ['Requires self-hosting for full control (free public cloud demo available)', 'Focused on task execution rather than complex enterprise timesheets'], 'easy', { repo: 'go-vikunja/vikunja' }),

  // =========================================================================
  // Video Trimming & Lossless Editing (replaces 'adobe-media-encoder')
  // =========================================================================
  f('avidemux', 'Avidemux', 'https://avidemux.sourceforge.net/', 'open-source', 'GPL-2.0', ALL, ['adobe-media-encoder'],
    'A free, open-source video editor designed for simple cutting, filtering, and re-encoding tasks without quality degradation.',
    ['Cut and splice video segments without re-encoding the stream in "Copy" mode', 'Batch processing queue for converting libraries of files', 'Extensive video and audio filter collection (crop, subtitles, deinterlace)'],
    ['Basic timeline interface, not designed for multi-track Hollywood editing', 'No timeline transitions'], 'easy'),

  f('lossless-cut', 'LosslessCut', 'https://github.com/mifi/lossless-cut', 'open-source', 'GPL-2.0', ALL, ['adobe-media-encoder', 'camtasia'],
    'The Swiss Army knife of lossless video, audio, and subtitle trimming that cuts files instantly at keyframes without re-encoding.',
    ['Blazingly fast cuts in seconds with ZERO loss in video/audio quality', 'Extract audio tracks, subtitles, or create thumbnail chapters instantly', 'Supports virtually all video formats powered by FFmpeg'],
    ['Cuts only on video keyframes for pure lossless export', 'Not an effects editor or compositor'], 'easy', { repo: 'mifi/lossless-cut' }),

  // =========================================================================
  // UI Design & Vector Prototyping (replaces 'figma')
  // =========================================================================
  f('lunacy', 'Lunacy by Icons8', 'https://icons8.com/lunacy', 'free', 'Freeware', ALL, ['figma', 'illustrator'],
    'A native vector graphics and UI design software with built-in graphics, AI image upscaling, and 100% offline support.',
    ['Works completely offline without an internet connection', 'Built-in library of free icons, photos, and vector illustrations', 'Opens and edits Sketch and Figma files natively'],
    ['Closed-source freeware', 'Cloud real-time multi-user collaboration requires sign-in'], 'easy'),

  f('quant-ux', 'Quant-UX', 'https://www.quant-ux.com/', 'open-source', 'MIT', ['web', 'self-hosted'], ['figma'],
    'An open-source visual prototyping and usability testing platform that records user test sessions with heatmaps and analytics.',
    ['Create interactive screen prototypes and test them with real users', 'Visual heatmaps and recorded click sessions analyze user flow friction', '100% open-source and privacy-friendly'],
    ['Smaller component library than Figma Community', 'Learning curve for usability analytics configurations'], 'moderate', { repo: 'KlausSchaefers/quant-ux' }),

  f('vectr', 'Vectr', 'https://vectr.com/', 'free', 'Free web application', ['web', 'windows', 'macos', 'linux'], ['figma', 'illustrator'],
    'A fast, simple vector graphics editor for creating 2D graphics, mockups, social headers, and logos in your browser.',
    ['Extremely easy to pick up for beginners and non-designers', 'Real-time URL sharing allows viewing design projects instantly', 'Runs smoothly in any modern web browser'],
    ['Ad-supported web interface', 'Lacks advanced CMYK print preparation features'], 'easy'),

  // =========================================================================
  // Screen Recording & Screenshots (replaces 'snagit', 'camtasia', 'loom')
  // =========================================================================
  f('screenity', 'Screenity', 'https://screenity.io/', 'open-source', 'GPL-3.0', ['web'], ['loom', 'snagit'],
    'A feature-packed open-source screen recorder and annotation tool for Chrome with webcam overlay, zoom, drawing, and trimming.',
    ['Unlimited recordings with zero watermarks or time limits', 'Annotate your screen live with pens, arrows, text, and click highlights', 'Save directly to Google Drive or export as MP4/WebM/GIF'],
    ['Requires a Chromium-based browser (Chrome, Brave, Edge)', 'Desktop recording outside the browser relies on OS screen sharing permission'], 'easy', { repo: 'alyssaxuu/screenity' }),

  f('shottr', 'Shottr', 'https://shottr.cc/', 'freemium', 'Free personal use, $12 Pro', ['macos'], ['snagit'],
    'A tiny, 1.6MB pixel-perfect screenshot utility for macOS with scrolling capture, OCR text extraction, pixel ruler, and blur tools.',
    ['Blazingly fast startup taking less than 15ms to trigger', 'Scrolling screenshot capture for long web pages and chat logs', 'Instant OCR extracts text or QR codes directly from screenshots'],
    ['macOS only', 'Occasional banner prompt to upgrade to the $12 Pro supporter tier'], 'easy'),

  f('kap', 'Kap', 'https://getkap.co/', 'open-source', 'MIT', ['macos'], ['loom', 'snagit'],
    'An open-source macOS screen recorder built on web standards that exports silky-smooth video to MP4, GIF, and WebM with custom plugins.',
    ['Clean, unobtrusive menu bar interface with simple capture crop', 'Export directly to GIF or MP4 with adjustable framerates and dimensions', 'Extensible plugin system for uploading to S3, Streamable, or Imgur'],
    ['macOS only', 'Built with Electron, so slightly higher memory footprint during active recording'], 'easy', { repo: 'wulkano/kap' }),

  // =========================================================================
  // Code & Text Editors (replaces 'sublime-text')
  // =========================================================================
  f('notepad-plus-plus', 'Notepad++', 'https://notepad-plus-plus.org/', 'open-source', 'GPL-3.0', ['windows'], ['sublime-text'],
    'The legendary lightweight, lightning-fast source code and text editor for Windows that opens gigabyte log files in milliseconds.',
    ['Starts up in a split second with negligible CPU and memory usage', 'Handles massive multi-gigabyte log files without breaking a sweat', 'Extensive regex search-and-replace across multiple files and folders'],
    ['Native to Windows only (requires Wine on Linux/Mac)', 'Traditional Windows desktop aesthetic'], 'easy', { repo: 'notepad-plus-plus/notepad-plus-plus' }),

  f('zed', 'Zed', 'https://zed.dev/', 'open-source', 'GPL-3.0 / AGPL', ['macos', 'linux'], ['sublime-text', 'jetbrains'],
    'A high-performance, multiplayer code editor engineered in Rust with GPU-accelerated rendering from the creators of Atom.',
    ['Starts instantly and renders keystrokes at a buttery-smooth 120 FPS', 'Real-time collaborative multiplayer coding built in', 'Integrated AI chat and inline code assistant support'],
    ['Windows version is still in active development (Mac & Linux currently)', 'Extension ecosystem is growing but smaller than VS Code'], 'easy', { repo: 'zed-industries/zed' }),

  f('pulsar', 'Pulsar', 'https://pulsar-edit.dev/', 'open-source', 'MIT', ALL, ['sublime-text'],
    'A community-led, fully hackable open-source code editor continuing the beloved legacy and package ecosystem of GitHub’s Atom.',
    ['100% hackable: customize every piece of the editor via CSS and JavaScript', 'Familiar Atom package manager and themes', 'Completely community-driven with zero corporate control'],
    ['Electron architecture uses more memory than native C++ editors', 'Startup speed is slower than Sublime Text'], 'easy', { repo: 'pulsar-edit/pulsar' }),

  f('neovim', 'Neovim', 'https://neovim.io/', 'open-source', 'Apache-2.0', ALL, ['sublime-text', 'jetbrains'],
    'A modern, highly extensible Vim-based text editor built for blazing speed, featuring native Lua scripting and built-in LSP.',
    ['Runs in any terminal or graphical front-end with zero latency', 'Built-in Language Server Protocol (LSP) and Treesitter syntax highlighting', 'Vibrant community of preconfigured distros (LazyVim, AstroNvim, LunarVim)'],
    ['Steep modal-editing keyboard learning curve for newcomers', 'Requires time to configure keybindings and plugins'], 'hard', { repo: 'neovim/neovim' }),

  // =========================================================================
  // Chat & Communities (replaces 'discord')
  // =========================================================================
  f('revolt', 'Revolt', 'https://revolt.chat/', 'open-source', 'AGPL-3.0', EVERYWHERE, ['discord'],
    'A user-first, open-source chat and voice platform designed as a direct drop-in alternative to Discord with zero monetization lockouts.',
    ['Interface is virtually identical to Discord, making migration effortless', 'No paid Nitro paywalls on emojis, upload limits, or screenshares', 'Self-hostable or use the official public community servers'],
    ['Smaller server directory than Discord', 'Fewer bot developer integrations than mature platforms'], 'easy', { repo: 'revoltchat/frontend' }),

  f('guilded', 'Guilded', 'https://www.guilded.gg/', 'free', 'Proprietary Freeware', EVERYWHERE, ['discord'],
    'A feature-packed gaming community chat platform that provides 1080p 60fps streaming, 500MB uploads, and calendar scheduling for free.',
    ['High-definition 1080p 60fps screen sharing without a subscription', 'Built-in event calendars, tournament brackets, and document wikis', 'Generous 500MB file upload limit per post'],
    ['Requires a Roblox account login', 'Closed-source proprietary platform'], 'easy'),

  // =========================================================================
  // Social & Microblogging (replaces 'twitter')
  // =========================================================================
  f('mastodon', 'Mastodon', 'https://joinmastodon.org/', 'open-source', 'AGPL-3.0', EVERYWHERE, ['twitter'],
    'The premier decentralized, open-source microblogging network with no algorithms, no corporate ads, and no pay-to-win verification.',
    ['Federated across thousands of independent servers (the Fediverse)', 'Chronological timeline with no manipulative engagement algorithms', 'No subscription fees, promoted tweets, or data harvesting'],
    ['Choosing a starting server can cause initial decision fatigue', 'Search is deliberately privacy-scoped to hashtags and mentions'], 'easy', { repo: 'mastodon/mastodon' }),

  f('bluesky', 'Bluesky', 'https://bsky.app/', 'open-source', 'MIT / Apache-2.0', EVERYWHERE, ['twitter'],
    'An open social network built on the AT Protocol featuring customizable algorithmic feeds, domain-as-handle identity, and composable moderation.',
    ['Fast, responsive interface that feels just like classic Twitter', 'Algorithmic choice: subscribe to custom feeds created by the community', 'Use your personal website domain as your verified handle for free'],
    ['Direct messaging features are still evolving', 'Federation with self-hosted instances is in early phases'], 'easy', { repo: 'bluesky-social/social-app' }),

  f('nostr', 'Nostr', 'https://nostr.com/', 'open-source', 'MIT', EVERYWHERE, ['twitter'],
    'A lightweight, decentralized protocol for censorship-resistant global publishing where you own your identity via cryptographic keys.',
    ['Decentralized protocol resistant to single-platform account bans or centralized server takedowns', 'Use any mobile or web client (Damus, Amethyst, Primal, Coracle)', 'Built-in micropayments via Bitcoin Lightning Network zaps'],
    ['Requires keeping your private cryptographic key secure', 'Relay connection concepts differ from standard social logins'], 'moderate', { repo: 'nostr-protocol/nostr' }),

  // =========================================================================
  // Maps & Navigation (replaces 'google-maps')
  // =========================================================================
  f('openstreetmap', 'OpenStreetMap', 'https://www.openstreetmap.org/', 'open-source', 'ODbL', ['web'], ['google-maps'],
    'The community-driven "Wikipedia of world maps", providing free, editable geographic data without tracking your personal location.',
    ['Created and updated by over 10 million volunteers worldwide', 'Zero commercial tracking, profiling, or targeted location ads', 'Open data foundation used by thousands of research and navigation apps'],
    ['Web viewer is an open database browser, not a turn-by-turn voice navigator', 'Search bar requires precise naming on rural addresses'], 'easy', { repo: 'openstreetmap/openstreetmap-website' }),

  f('organic-maps', 'Organic Maps', 'https://organicmaps.app/', 'open-source', 'Apache-2.0', MOBILE, ['google-maps'],
    'A privacy-focused offline maps and turn-by-turn navigation app for hikers, cyclists, and drivers, powered by OpenStreetMap.',
    ['100% offline navigation: download entire countries for trips without cellular data', 'Zero tracking, zero ads, zero telemetry, and battery-friendly', 'Detailed hiking trails, cycling routes, and contour elevation maps'],
    ['No live traffic congestion data (avoids real-time vehicle tracking)', 'Point-of-interest reviews rely on open data rather than Google Reviews'], 'easy', { repo: 'organicmaps/organicmaps' }),

  f('osmand', 'OsmAnd', 'https://osmand.net/', 'open-source', 'GPL-3.0', MOBILE, ['google-maps'],
    'The most feature-dense mobile offline map and GPS navigation app, equipped with nautical depth contours, GPX tracks, and topographic relief.',
    ['Unrivaled customization for off-road GPS, hiking, and sailing', 'Download full offline vector maps with Wikipedia point-of-interest guides', 'Record and export GPX hiking routes with live elevation telemetry'],
    ['Deep settings menu can feel overwhelming for basic city driving', 'Free tier limits number of offline regional map downloads (unlimited on F-Droid)'], 'moderate', { repo: 'osmandapp/OsmAnd' }),

  // =========================================================================
  // Desktop Launchers & Search (replaces 'raycast')
  // =========================================================================
  f('ulauncher', 'Ulauncher', 'https://ulauncher.io/', 'open-source', 'GPL-3.0', ['linux'], ['raycast'],
    'A fast, minimal application launcher for Linux written in Python and GTK with customizable themes and extensive extension support.',
    ['Blazingly fast search for apps, files, and browser bookmarks', 'Rich extension ecosystem for GitHub, Spotify, dictionary, and calculations', 'Lightweight and native to Linux desktop environments'],
    ['Linux only', 'Simpler interface than Raycast with no window tiling manager'], 'easy', { repo: 'Ulauncher/Ulauncher' }),

  f('flow-launcher', 'Flow Launcher', 'https://www.flowlauncher.com/', 'open-source', 'MIT', ['windows'], ['raycast'],
    'A modern, open-source file search and productivity launcher for Windows with instant Everything search integration and rich plugins.',
    ['Integrates seamlessly with Everything search for sub-second file retrieval', 'Execute shell commands, calculate math, and search browser tabs instantly', 'Fully customizable themes and community plugin store'],
    ['Windows only', 'Plugin quality varies between community authors'], 'easy', { repo: 'Flow-Launcher/Flow.Launcher' }),

  f('albert', 'Albert Launcher', 'https://albertlauncher.github.io/', 'open-source', 'GPL-3.0', ['linux'], ['raycast'],
    'A lightning-fast, C++ and Qt-powered keyboard launcher for Linux with minimal resource consumption and modular plugins.',
    ['Negligible CPU and RAM footprint written in native C++', 'Extensible with Python and C++ plugins', 'Fuzzy search across system apps, files, and mathematical expressions'],
    ['Linux only', 'Configuration requires manual plugin toggling in settings'], 'easy', { repo: 'albertlauncher/albert' }),

  // =========================================================================
  // Forms & Surveys (replaces 'typeform')
  // =========================================================================
  f('formbricks', 'Formbricks', 'https://formbricks.com/', 'open-source', 'AGPL-3.0', ['web', 'self-hosted'], ['typeform'],
    'An open-source survey and customer feedback suite designed for in-app micro-surveys, link surveys, and product experience management.',
    ['Trigger targeted micro-surveys directly inside web and mobile apps', 'Self-hostable with full data ownership (GDPR & HIPAA compliant)', 'Generous free cloud tier with unlimited surveys and responses'],
    ['Advanced multi-channel distribution requires developer SDK setup', 'Fewer playful gamified animations than Typeform'], 'easy', { repo: 'formbricks/formbricks' }),

  f('typebot', 'Typebot', 'https://typebot.io/', 'open-source', 'AGPL-3.0', ['web', 'self-hosted'], ['typeform'],
    'An open-source conversational form builder that allows you to craft engaging chat-based lead capture forms and interactive bots.',
    ['Visual node-based canvas for designing conversational chat flows', 'Higher conversion rates by turning static forms into interactive chats', 'Integrates with Webhooks, Google Sheets, OpenAI, and email services'],
    ['Conversational chat paradigm is not ideal for massive 50-question tables', 'Free cloud plan has response limits (unlimited when self-hosted)'], 'easy', { repo: 'baptisteArno/typebot.io' }),

  f('tally', 'Tally', 'https://tally.so/', 'freemium', 'Free tier, paid Pro', ['web'], ['typeform'],
    'The simplest free online form builder that lets you create stunning forms just like typing a document in Notion.',
    ['99% of features are 100% free with unlimited forms and responses', 'Type "/" for form blocks, questions, file uploads, and conditional logic', 'Zero coding needed; embeds seamlessly in any website'],
    ['Custom domains and removing "Made with Tally" badge require Pro tier', 'Web-only cloud application'], 'easy'),

  f('limesurvey', 'LimeSurvey', 'https://www.limesurvey.org/', 'open-source', 'GPL-2.0', ['web', 'self-hosted'], ['typeform'],
    'The world’s leading open-source online survey tool for professional research, universities, and enterprise statistical analysis.',
    ['Unrivaled question type variety and complex multi-page branching logic', 'Full quota management, token participant tracking, and SPSS export', 'Completely open-source and self-hostable with unlimited responses'],
    ['Traditional survey questionnaire aesthetic rather than sleek one-question cards', 'Steeper administration learning curve'], 'moderate', { repo: 'LimeSurvey/LimeSurvey' }),

  // =========================================================================
  // Website Builders & CMS (replaces 'squarespace')
  // =========================================================================
  f('wordpress-org', 'WordPress.org', 'https://wordpress.org/', 'open-source', 'GPL-2.0', ['web', 'self-hosted'], ['squarespace'],
    'The open-source content management system that powers over 43% of the web, with tens of thousands of free themes and plugins.',
    ['Zero platform vendor lock-in; host anywhere on affordable servers', 'Over 60,000 free plugins for e-commerce, SEO, and contact forms', 'Gutenberg block editor allows visual page building without code'],
    ['Requires maintaining your own web hosting and software updates', 'Too many plugins can slow down site performance if unoptimized'], 'easy', { repo: 'WordPress/WordPress' }),

  f('ghost', 'Ghost', 'https://ghost.org/', 'open-source', 'MIT', ['web', 'self-hosted'], ['squarespace'],
    'A modern, blazingly fast open-source publishing platform for independent creators, newsletters, and membership websites.',
    ['Built-in native email newsletter delivery and member subscriptions', 'Ultra-fast Node.js architecture with stellar Core Web Vitals SEO', 'Clean, distraction-free Markdown and card editor'],
    ['Self-hosting requires Node.js and MySQL server administration', 'Focused specifically on publishing and blogs rather than generic corporate brochure sites'], 'moderate', { repo: 'TryGhost/Ghost' }),

  f('hugo', 'Hugo', 'https://gohugo.io/', 'open-source', 'Apache-2.0', ALL, ['squarespace'],
    'The world’s fastest open-source static site generator, compiling thousands of pages into static HTML in fractions of a second.',
    ['Generates entire websites in milliseconds with zero database overhead', 'Host for free on GitHub Pages, Cloudflare Pages, or Netlify free tiers', 'Static file architecture eliminates dynamic CMS database exploits'],
    ['Requires writing Markdown and editing HTML/Go templates', 'No graphical drag-and-drop web admin interface out of the box'], 'moderate', { repo: 'gohugoio/hugo' }),

  f('publii', 'Publii', 'https://getpublii.com/', 'open-source', 'GPL-3.0', ALL, ['squarespace'],
    'A privacy-first open-source desktop CMS for creating ultra-fast, secure static websites without touching a code editor.',
    ['Visual desktop app for Mac, Windows, and Linux to write posts and pages', 'One-click sync to GitHub Pages, GitLab, S3, or standard FTP', 'Blazingly fast static output with zero server maintenance'],
    ['Desktop-based app: editing from a phone or tablet is not supported', 'Smaller theme marketplace than WordPress'], 'easy', { repo: 'GetPublii/Publii' }),

  // =========================================================================
  // Handwriting & Tablet Notes (replaces 'goodnotes')
  // =========================================================================
  f('xournalpp', 'Xournal++', 'https://xournalpp.github.io/', 'open-source', 'GPL-2.0', ALL, ['goodnotes'],
    'An open-source handwriting note-taking application with PDF annotation, pressure-sensitive stylus support, and audio recording.',
    ['Annotate and highlight imported PDF textbooks and documents smoothly', 'Pressure-sensitive pen and stylus support with palm rejection', 'Audio recording synced to your handwritten notes'],
    ['Interface is designed as a desktop application with classic toolbars', 'Mobile Android port is unofficial/in-progress'], 'easy', { repo: 'xournalpp/xournalpp' }),

  f('rnote', 'Rnote', 'https://flathub.org/apps/com.github.flxzt.rnote', 'open-source', 'GPL-3.0', ['linux', 'windows', 'macos'], ['goodnotes'],
    'A vector-based sketch and handwritten note-taking app designed for drawing tablets and touchscreens with smooth infinite canvas.',
    ['Infinite canvas with vector rendering keeps handwriting crisp at any zoom', 'Shape recognition turns rough sketches into perfect circles and rectangles', 'Exports to SVG, PDF, and Xopp with full vector fidelity'],
    ['Best on Linux and GNOME touchscreens (Windows build is newer)', 'No direct cloud sync client built into the app'], 'easy', { repo: 'flxzt/rnote' }),

  f('saber', 'Saber', 'https://saber.adil.hanney.org/', 'open-source', 'GPL-3.0', EVERYWHERE, ['goodnotes'],
    'An open-source handwritten notes app designed for tablets and phones with dark mode inverted ink and Nextcloud synchronization.',
    ['Dark mode inverts colors dynamically so handwriting doesn’t blind you at night', 'Cross-platform sync via Nextcloud or custom WebDAV servers', 'Password protect sensitive notebooks with local encryption'],
    ['Younger project with fewer template options than GoodNotes', 'Tool selection is focused on writing essentials'], 'easy', { repo: 'saber-notes/saber' }),

  // =========================================================================
  // Audiobooks & Spoken Media (replaces 'audible')
  // =========================================================================
  f('libby', 'Libby by OverDrive', 'https://www.overdrive.com/apps/libby', 'free', 'Free (Library Service)', ['ios', 'android', 'web'], ['audible'],
    'Borrow thousands of audiobooks and eBooks completely free using your local public library card with no monthly subscription fees.',
    ['100% free legal access to thousands of bestselling audiobooks and eBooks', 'Clean, delightful mobile player with sleep timer, bookmarks, and variable speed', 'Download audiobooks for offline road trips and commutes'],
    ['Requires an active public library card', 'Popular new releases may have digital hold queues before they become available'], 'easy'),

  f('audiobookshelf', 'Audiobookshelf', 'https://www.audiobookshelf.org/', 'open-source', 'GPL-3.0', EVERYWHERE, ['audible'],
    'A self-hosted open-source audiobook and podcast server with dedicated mobile apps for streaming and multi-device progress sync.',
    ['Stream your own audiobook collection anywhere with synchronized playback across devices', 'Fetches audiobook metadata and chapter covers automatically from open databases', 'Free, polished native iOS and Android apps'],
    ['Requires self-hosting the server via Docker or desktop binary', 'You provide your own audiobook audio files (MP3/M4B)'], 'moderate', { repo: 'advplyr/audiobookshelf' }),

  f('librivox', 'LibriVox', 'https://librivox.org/', 'free', 'Public Domain', EVERYWHERE, ['audible'],
    'A non-profit community of volunteers who record and release free public-domain audiobooks from classic literature.',
    ['Completely free access to over 18,000 public domain audiobooks', 'Classic literature from Shakespeare and Austen to Doyle and Verne', 'Download files as DRM-free MP3s with zero registration'],
    ['Volunteer narrator quality varies across titles', 'Covers historic public domain books only (no contemporary copyrighted books)'], 'easy'),

  // =========================================================================
  // Math & Computational Engines (replaces 'wolfram-alpha')
  // =========================================================================
  f('geogebra', 'GeoGebra', 'https://www.geogebra.org/', 'free', 'Free for non-commercial use', EVERYWHERE, ['wolfram-alpha'],
    'Dynamic mathematics software that brings together geometry, algebra, spreadsheets, graphing, statistics, and calculus in an intuitive app.',
    ['Interactive visual manipulation of geometric shapes and mathematical functions', 'Comprehensive CAS (Computer Algebra System) solves equations step by step', 'Massive free library of classroom interactive simulations'],
    ['Non-commercial free license', 'Interface has many modes which can require exploration'], 'easy'),

  f('desmos', 'Desmos Studio', 'https://www.desmos.com/', 'free', 'Free web application', EVERYWHERE, ['wolfram-alpha'],
    'A free suite of world-class math tools including the legendary Desmos Graphing Calculator and Scientific Calculator.',
    ['Instant, responsive graph plotting as you type mathematical functions', 'Sliders, tables of data, animations, and regression curve fitting', 'Available completely free on the web, iOS, and Android with zero ads'],
    ['Specialized in graphing and algebra rather than general computational trivia queries', 'Step-by-step calculus proofs are limited compared to Wolfram Pro'], 'easy'),

  f('speedcrunch', 'SpeedCrunch', 'https://speedcrunch.org/', 'open-source', 'GPL-2.0', ALL, ['wolfram-alpha'],
    'A high-precision scientific desktop calculator with auto-completion, historical scrollback, and over 80 built-in math functions.',
    ['Up to 50 decimal digits of precision', 'Instant calculation as you type with autocompletion of variables and constants', 'Keyboard-centric workflow makes quick calculations effortless'],
    ['Desktop only; no mobile apps', 'Focused on arithmetic and scientific computation, not symbolic CAS solving'], 'easy', { repo: 'speedcrunch/SpeedCrunch' }),

  // =========================================================================
  // Link Management & Link-in-Bio (replaces 'bitly')
  // =========================================================================
  f('dub', 'Dub.co', 'https://dub.co/', 'open-source', 'AGPL-3.0', ['web', 'self-hosted'], ['bitly'],
    'A modern open-source link management platform with custom domains, QR codes, geolocation targeting, and rich click analytics.',
    ['Custom domains with automated free SSL certificates', 'Detailed analytics covering geolocation, referrers, and device types', 'Generous free tier (25 links/month) or unlimited when self-hosted'],
    ['Free cloud tier has monthly link creation limits', 'Self-hosting requires Next.js and Redis infrastructure'], 'easy', { repo: 'dubinc/dub' }),

  f('kutt', 'Kutt', 'https://kutt.it/', 'open-source', 'MIT', ['web', 'self-hosted'], ['bitly'],
    'A modern open-source URL shortener with support for custom domains, link statistics, password protection, and a RESTful API.',
    ['Completely open-source and free to self-host with zero link limits', 'Set expiration dates and password protection on shortened URLs', 'Simple, clean web dashboard with QR code generation'],
    ['Self-hosting requires Node.js and PostgreSQL/Redis setup', 'Free public server has occasional registration pauses'], 'easy', { repo: 'thedevs-network/kutt' }),

  f('biodrop', 'BioDrop', 'https://biodrop.io/', 'open-source', 'MIT', ['web', 'self-hosted'], ['bitly'],
    'An open-source link-in-bio platform for developers and creators to connect their community to their content with no paywalls.',
    ['100% free and open-source with no premium theme paywalls', 'Add social media icons, blog post links, events, and milestones', 'Community-driven project backed by open-source contributors'],
    ['Profile updates are configured via JSON or web forms', 'Fewer commercial e-commerce checkout widgets than Linktree'], 'easy', { repo: 'EddieHubCommunity/BioDrop' }),

  // =========================================================================
  // Remote Desktop (replaces 'teamviewer')
  // =========================================================================
  f('rustdesk', 'RustDesk', 'https://rustdesk.com/', 'open-source', 'AGPL-3.0', EVERYWHERE, ['teamviewer'],
    'An open-source virtual remote desktop software written in Rust that works out of the box with optional self-hosted relay servers.',
    ['No time limits, no commercial license nag screens, no sudden session cuts', 'End-to-end encryption with peer-to-peer direct connections', 'Free public rendezvous servers or spin up your own private relay'],
    ['Public rendezvous servers can experience latency during peak hours (self-host for peak speed)', 'Requires granting accessibility/screen permissions on macOS'], 'easy', { repo: 'rustdesk/rustdesk' }),

  f('hoptodesk', 'HopToDesk', 'https://www.hoptodesk.com/', 'free', 'Free for personal and commercial use', EVERYWHERE, ['teamviewer'],
    'A completely free remote desktop tool with end-to-end encryption for Windows, Mac, Linux, Android, and iOS.',
    ['Free for both personal and commercial use with zero subscription fees', 'Simple 9-digit ID connection similar to AnyDesk/TeamViewer', 'File transfer, chat, and multi-monitor switching included'],
    ['Proprietary network relays', 'Smaller community than RustDesk'], 'easy'),

  // =========================================================================
  // Password Managers (replaces '1password', 'lastpass')
  // =========================================================================
  f('passbolt', 'Passbolt', 'https://www.passbolt.com/', 'open-source', 'AGPL-3.0', EVERYWHERE, ['1password', 'lastpass'],
    'An open-source password manager designed for agile teams and businesses with granular sharing permissions and OpenPGP cryptography.',
    ['Granular folder and credential sharing permissions for teams', 'Full OpenPGP end-to-end encryption verified by third-party audits', 'Free Community Edition can be self-hosted in your own infrastructure'],
    ['Designed specifically for team sharing rather than solo consumers', 'Self-hosting requires standard Docker or Linux server installation'], 'moderate', { repo: 'passbolt/passbolt_api' }),

  f('vaultwarden', 'Vaultwarden', 'https://github.com/dani-garcia/vaultwarden', 'open-source', 'AGPL-3.0', EVERYWHERE, ['1password', 'lastpass'],
    'A lightweight, self-hosted Bitwarden-compatible backend server written in Rust that runs on minimal RAM and unlocks Bitwarden Premium features.',
    ['Drop-in replacement for Bitwarden server using tiny CPU and RAM resources (ideal for Raspberry Pi)', 'Compatible with all official Bitwarden browser extensions and mobile apps', 'Unlocks premium 2FA features (TOTP generation) and file attachments for free'],
    ['Requires basic Docker knowledge to host and maintain', 'You are responsible for backing up your SQLite/Postgres database'], 'moderate', { repo: 'dani-garcia/vaultwarden' }),

  // =========================================================================
  // Email Marketing (replaces 'mailchimp')
  // =========================================================================
  f('listmonk', 'Listmonk', 'https://listmonk.app/', 'open-source', 'AGPL-3.0', ['web', 'self-hosted'], ['mailchimp'],
    'A high-performance open-source newsletter and mailing list manager powered by PostgreSQL that can send millions of emails at minimal cost.',
    ['Sends thousands of emails per second with tiny memory usage', 'Connect to affordable SMTP providers (Amazon SES, SendGrid, Postmark) to save 90% over Mailchimp', 'Built-in subscriber management, double opt-in, and campaign analytics'],
    ['Self-hosted only (requires a VPS with Docker and PostgreSQL)', 'Requires configuring your own transactional email delivery service'], 'moderate', { repo: 'knadh/listmonk' }),

  // =========================================================================
  // Motion Graphics & VFX Compositing (replaces 'after-effects')
  // =========================================================================
  f('natron', 'Natron', 'https://natrongithub.github.io/', 'open-source', 'GPL-2.0', ALL, ['after-effects'],
    'A powerful open-source node-based compositing software for VFX and motion graphics, similar to Foundry Nuke.',
    ['Flexible node-based workflow ideal for complex keying, roto, and multi-layer composites', 'Full 32-bit floating point color pipeline and OpenFX plugin architecture', 'Cross-platform and completely free with no render watermarks'],
    ['Steeper learning curve for users accustomed to layer-based timelines like After Effects', 'Development releases are spaced out'], 'moderate', { repo: 'NatronGitHub/Natron' }),

  f('cavalry', 'Cavalry', 'https://cavalry.scenegroup.co/', 'freemium', 'Free starter tier, paid Pro', ['windows', 'macos'], ['after-effects'],
    'A next-generation 2D motion graphics and animation software built from the ground up for procedural motion design and UI animators.',
    ['Procedural animation tools make complex particle and geometric animations effortless', 'Blazingly fast GPU-accelerated real-time viewport playback', 'Generous free tier with no time limit and full timeline export'],
    ['Free tier restricts renders to 1080p and disables certain advanced dynamics', 'Closed-source software'], 'moderate'),
];

module.exports = { apps, alts };
