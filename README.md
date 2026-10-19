# giridharreddyk.github.io

Source code for my personal website, [giridharreddyk.github.io](https://giridharreddyk.github.io): a portfolio covering my research interests, publications, projects and CV.

The site is a small static project written in plain HTML, CSS and JavaScript. It has no frameworks, build tooling or package dependencies, and is hosted on GitHub Pages.

## Features

- Four content pages: home (profile, news, selected publications), publications (with BibTeX and summaries), projects (filterable cards) and a web CV
- Sticky translucent navigation with section anchors, scroll tracking and a mobile-only disclosure below 640px
- Light and dark themes that follow the system preference, with a manual toggle that persists across visits
- Print stylesheet for the CV page (A4), including a QR code back to the site, which is also the source of the downloadable PDF
- Progressive enhancement: cross-fading page navigation and an animated project filter using the View Transitions API, disabled for visitors who prefer reduced motion
- Sharing and search metadata: Open Graph and Twitter cards, JSON-LD structured data (`Person`, plus `CollectionPage` lists for publications and projects), `sitemap.xml` and `robots.txt`
- Accessibility: semantic landmarks, a skip link that moves focus, visible focus styles, contrast-checked colours, links that do not rely on colour alone and reduced-motion support
- Performance: no third-party requests, preloaded fonts with metric-matched fallbacks (no layout shift while they load), a responsive hero image and lazy-loaded project imagery

## Tech stack

- HTML5, modern CSS (custom properties, `light-dark()`, nesting, Grid, Flexbox, logical properties) and vanilla JavaScript (ES2022)
- [IBM Plex](https://www.ibm.com/plex/) typefaces, self-hosted as WOFF2 subsets, so pages make no third-party requests
- GitHub Pages for hosting

## Project structure

```
.
├── index.html            Home: profile, news, selected publications, contact
├── publications.html     Publications (BibTeX, summaries) and talks
├── projects.html         Filterable project cards
├── cv.html               Web CV, also the source of the downloadable PDF
├── 404.html              Custom not-found page
├── robots.txt
├── sitemap.xml
├── .nojekyll             Serve files as-is (no Jekyll processing)
└── assets/
    ├── css/style.css     Stylesheet: design tokens, themes, print styles
    ├── js/main.js        Theme, section tracking, mobile nav, panels, project filters
    ├── fonts/            Self-hosted IBM Plex (WOFF2) and its licence
    ├── img/              Favicon, profile photo, link-preview card, project figures
    └── pdf/              Downloadable CV
```

## Local development

Clone the repository and serve it with any static file server:

```bash
git clone https://github.com/GiridharReddyK/giridharreddyk.github.io.git
cd giridharreddyk.github.io
python3 -m http.server 8000
```

Then open <http://localhost:8000>. There is no build step: edit the relevant HTML, CSS or JavaScript files and reload the page. The header and footer are plain HTML repeated on each page, so navigation changes need to be applied to every page.

## Review and validation

The navigation implementation and design review are documented in [docs/REVIEW.md](docs/REVIEW.md).

Run the dependency-free checks with:

```bash
python3 scripts/check-site.py
node --check assets/js/main.js
node scripts/check-navigation.cjs
```

The interaction checks use simulated DOM geometry. They do not replace testing in an actual browser.

## Deployment

GitHub Pages publishes the root of the `main` branch. Pushing changes to `main` triggers a new deployment, and the site updates within a minute or two.

## Acknowledgements

- Typefaces: IBM Plex Sans, Serif and Mono ([SIL Open Font License 1.1](https://openfontlicense.org/); licence text in `assets/fonts/LICENSE.txt`)
- Social icons: [Simple Icons](https://simpleicons.org) (CC0 1.0)
- The layout draws on conventions from academic site themes such as [al-folio](https://github.com/alshedivat/al-folio); all code here is original

## Copyright

© 2026 Giridhar Reddy Karnati. The content, photographs and CV are not licensed for reuse.
