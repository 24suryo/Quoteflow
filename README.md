# QuoteFlow — Bilingual Quote Generator, Poster Studio & PWA

QuoteFlow is a static-first, bilingual (**English** & **Bahasa Indonesia**) inspirational quote platform and minimalist HTML5 Canvas poster designer built with **Astro** and **TypeScript**.

## Key Features

- **12 Categories & 108 Bilingual Quotes:** Curated and original reflections with English & Indonesian text, interpretations, tags, and verified attribution metadata.
- **Interactive Quote Generator (`/generator/`, `/id/generator/`):** Random non-repeating shuffle, previous/next navigation, keyword search, category filter, instant `EN ↔ ID` toggle, copy text / copy with author, Web Share API, and `LocalStorage` favorites & history.
- **HTML5 Canvas Poster Studio (`/designer/`, `/id/designer/`):** Four social formats (`1080×1080`, `1080×1350`, `1200×675`, `1080×1920`), 12 preset templates, solid or gradient backgrounds, typography selection (`Playfair Display`, `Inter`, `Lora`, `Montserrat`), auto-fit line wrapping, decorations, and direct PNG download.
- **Full SEO & Bilingual Routing:** Dedicated `/quotes/[category]/`, `/quote/[slug]/`, `/library/`, `/favorites/`, `/blog/`, `/about/`, `/contact/`, `/privacy-policy/`, `/terms/`, canonical tags, `hreflang`, JSON-LD schemas, and `/sitemap.xml`.
- **Offline-Ready PWA:** Web App Manifest, generated SVG & PNG icons (`192×192`, `512×512`, maskable), and `/sw.js` Service Worker caching static assets and visited pages while bypassing third-party ad/analytics domains.

## Local Development & Commands

```bash
npm install
node scripts/generate-icons.mjs
node scripts/validate-db.mjs
npm run build
npm run preview
Write-Utf8File "README.md" @'
# QuoteFlow — Bilingual Quote Generator, Poster Studio & PWA

QuoteFlow is a static-first, bilingual (**English** & **Bahasa Indonesia**) inspirational quote platform and minimalist HTML5 Canvas poster designer built with **Astro** and **TypeScript**.

## Key Features

- **12 Categories & 108 Bilingual Quotes:** Curated and original reflections with English & Indonesian text, interpretations, tags, and verified attribution metadata.
- **Interactive Quote Generator (`/generator/`, `/id/generator/`):** Random non-repeating shuffle, previous/next navigation, keyword search, category filter, instant `EN ↔ ID` toggle, copy text / copy with author, Web Share API, and `LocalStorage` favorites & history.
- **HTML5 Canvas Poster Studio (`/designer/`, `/id/designer/`):** Four social formats (`1080×1080`, `1080×1350`, `1200×675`, `1080×1920`), 12 preset templates, solid or gradient backgrounds, typography selection (`Playfair Display`, `Inter`, `Lora`, `Montserrat`), auto-fit line wrapping, decorations, and direct PNG download.
- **Full SEO & Bilingual Routing:** Dedicated `/quotes/[category]/`, `/quote/[slug]/`, `/library/`, `/favorites/`, `/blog/`, `/about/`, `/contact/`, `/privacy-policy/`, `/terms/`, canonical tags, `hreflang`, JSON-LD schemas, and `/sitemap.xml`.
- **Offline-Ready PWA:** Web App Manifest, generated SVG & PNG icons (`192×192`, `512×512`, maskable), and `/sw.js` Service Worker caching static assets and visited pages while bypassing third-party ad/analytics domains.

## Local Development & Commands

```bash
npm install
node scripts/generate-icons.mjs
node scripts/validate-db.mjs
npm run build
npm run preview