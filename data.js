
const data = {
    apps: [
  {
    "name": "Figma",
    "vendor": "Figma, Inc.",
    "website": "https://www.figma.com",
    "category": "design",
    "price_model": "freemium",
    "typical_price": "Free tier available; paid seats billed monthly",
    "must_have_features": [
      "Real-time collaboration",
      "Vector editing",
      "Reusable components and variants",
      "Auto layout",
      "Interactive prototyping",
      "Developer handoff",
      "Plugins and extensions"
    ],
    "id": "figma"
  },
  {
    "name": "Microsoft Office",
    "aliases": [
      "Microsoft 365",
      "Word",
      "Excel",
      "PowerPoint"
    ],
    "vendor": "Microsoft Corporation",
    "website": "https://www.microsoft.com/microsoft-365",
    "category": "office",
    "price_model": "subscription",
    "typical_price": "Subscription or one-time purchase, depending on the edition",
    "must_have_features": [
      "Word processing with tracked changes",
      "Spreadsheets with formulas and pivot tables",
      "Presentations with templates and transitions",
      "Opening and saving .docx, .xlsx, and .pptx files",
      "Charts and graphs",
      "Mail merge",
      "PDF export",
      "Real-time co-authoring"
    ],
    "id": "microsoft-office"
  },
  {
    "name": "Photoshop",
    "vendor": "Adobe Inc.",
    "website": "https://www.adobe.com/products/photoshop.html",
    "category": "design",
    "price_model": "subscription",
    "typical_price": "Monthly subscription",
    "must_have_features": [
      "Layers and masks",
      "Non-destructive adjustment layers",
      "Selection and masking tools",
      "Retouching tools (clone and healing)",
      "Editable type layers",
      "PSD file compatibility",
      "Layer styles and smart objects",
      "Color management (CMYK and ICC profiles)"
    ],
    "id": "photoshop"
  },
  {
    "name": "Premiere Pro",
    "aliases": [
      "Adobe Premiere Pro",
      "Premiere"
    ],
    "vendor": "Adobe Inc.",
    "website": "https://www.adobe.com/products/premiere.html",
    "category": "video",
    "price_model": "subscription",
    "typical_price": "Monthly subscription",
    "must_have_features": [
      "Multi-track timeline editing",
      "Trim tools (ripple, roll, slip, slide)",
      "Color grading with scopes",
      "Keyframed effects and transitions",
      "Audio mixing and loudness metering",
      "Titles and captions",
      "Common codec import and export (H.264, HEVC, ProRes)",
      "Timeline interchange (XML, EDL, AAF)"
    ],
    "id": "premiere-pro"
  }
],
    alternatives: [
  {
    "name": "Apache OpenOffice",
    "summary": "Long-running free office suite with a word processor, spreadsheet, presentations, drawing, and database tools.",
    "type": "open-source",
    "license": "Apache-2.0",
    "website": "https://www.openoffice.org",
    "repo": {
      "host": "github",
      "url": "https://github.com/apache/openoffice"
    },
    "replaces": [
      "microsoft-office"
    ],
    "platforms": [
      "windows",
      "macos",
      "linux"
    ],
    "install": [
      "installer"
    ],
    "maturity": "established",
    "switching_difficulty": "moderate",
    "pros": [
      "Free suite covering documents, spreadsheets, presentations, drawing, and databases",
      "Opens common Microsoft Office file formats"
    ],
    "cons": [
      "Releases are infrequent; the latest stable version, 4.1.16, is from November 2025",
      "Some Microsoft Office formatting may not carry over",
      "LibreOffice is more actively maintained"
    ],
    "warnings": [
      {
        "text": "Reported security risk status of red since March 2026 over old unfixed vulnerabilities. Verify before publishing.",
        "source": "https://en.wikipedia.org/wiki/Apache_OpenOffice"
      }
    ],
    "privacy": {
      "telemetry": "unknown",
      "ads": false
    },
    "last_verified": "2026-10-09",
    "id": "apache-openoffice"
  },
  {
    "name": "FilmCraft",
    "summary": "Native video editor with Premiere-style panels, trim tools, color grading, and its own built-in codecs.",
    "type": "open-source",
    "license": "MIT OR Apache-2.0",
    "website": "https://getartcraft.com/apps/filmcraft",
    "repo": {
      "host": "github",
      "url": "https://github.com/storytold/filmcraft"
    },
    "replaces": [
      "premiere-pro"
    ],
    "platforms": [
      "windows",
      "macos",
      "linux",
      "web"
    ],
    "install": [
      "installer",
      "build-from-source"
    ],
    "maturity": "early",
    "switching_difficulty": "moderate",
    "pros": [
      "Premiere-style workspaces, tools, and keyboard shortcuts",
      "Exchanges timelines as Final Cut XML, OpenTimelineIO, EDL, and AAF",
      "Color grading panel with live scopes"
    ],
    "cons": [
      "The project estimates it is about 50 to 60 percent ready for real work",
      "No plugin hosting such as VST3, Audio Units, or OpenFX",
      "H.264 is the only delivery-codec export",
      "Hardware decoding works on macOS only"
    ],
    "best_for": "Editors who want a free, Premiere-like workflow and can accept an early-stage tool.",
    "privacy": {
      "telemetry": "unknown",
      "ads": false
    },
    "last_verified": "2026-10-09",
    "id": "filmcraft"
  },
  {
    "name": "Penpot",
    "summary": "Browser-based design and prototyping tool for teams, built on open standards and available to self-host.",
    "type": "open-source",
    "license": "MPL-2.0",
    "website": "https://penpot.app",
    "repo": {
      "host": "github",
      "url": "https://github.com/penpot/penpot"
    },
    "replaces": [
      "figma"
    ],
    "platforms": [
      "web",
      "self-hosted"
    ],
    "install": [
      "hosted-web",
      "docker"
    ],
    "parity": {
      "figma": 78
    },
    "switching_difficulty": "moderate",
    "pros": [
      "Can be self-hosted, so files stay on your own server",
      "Layout concepts mirror CSS flexbox and grid, which helps designer-developer handoff",
      "Real-time collaboration and commenting"
    ],
    "cons": [
      "Smaller plugin and template ecosystem than Figma",
      "Self-hosting needs Docker and ongoing server upkeep"
    ],
    "best_for": "Teams that want an open, self-hostable design tool.",
    "privacy": {
      "telemetry": "unknown",
      "ads": false
    },
    "last_verified": "2026-10-09",
    "verified_by": "example-contributor",
    "id": "penpot"
  },
  {
    "name": "PhotoCraft",
    "summary": "Native, offline image editor with layers, masks, adjustment layers, and layered PSD support, laid out like Photoshop.",
    "type": "open-source",
    "license": "MIT OR Apache-2.0",
    "website": "https://getartcraft.com/apps/photocraft",
    "repo": {
      "host": "github",
      "url": "https://github.com/storytold/photocraft"
    },
    "replaces": [
      "photoshop"
    ],
    "platforms": [
      "windows",
      "macos",
      "linux",
      "web"
    ],
    "install": [
      "installer",
      "build-from-source"
    ],
    "maturity": "early",
    "switching_difficulty": "moderate",
    "pros": [
      "Menus and shortcuts follow Photoshop's layout",
      "Opens and saves layered PSD and PSB files",
      "Runs offline with no account"
    ],
    "cons": [
      "Early alpha; the project says it is not yet a replacement for daily professional work",
      "No generative AI features",
      "About twenty tools and plug-in compatibility are still missing"
    ],
    "best_for": "Photoshop users who want a free, offline editor and can accept rough edges.",
    "privacy": {
      "telemetry": "unknown",
      "ads": false
    },
    "last_verified": "2026-10-09",
    "id": "photocraft"
  }
]
};
export default data;
