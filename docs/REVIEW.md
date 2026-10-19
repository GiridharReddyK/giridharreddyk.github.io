# Portfolio code and design review

Reviewed 19 October 2026 against `main` at `57fc760338963620af267cb24dbdb32fae92c05c`.

## Scope and evidence

The live homepage was opened and visually inspected in Chrome. Source review covered all five HTML pages, the shared CSS and JavaScript, README, robots.txt, sitemap.xml, and the repository asset inventory. Images, font binaries and the downloadable CV were inventoried rather than exhaustively audited. External publications, contact accounts and personal claims were not independently verified.

The current implementation already had desktop navigation, sticky positioning, translucent blur, smooth scrolling, scroll padding, reduced-motion support, self-hosted fonts, metadata, a skip link and theme persistence. The main navigation problem was missing section mapping, not a complete absence of these features.

## Findings and changes

| Priority | Source / observed issue | Change |
|---|---|---|
| High | Homepage navigation linked to other pages; hero, research, news, publications and contact sections lacked usable IDs. | Added stable section IDs and native hash links. The new selected-work section gives Projects an actual homepage target. CV remains a clearly labeled separate page. |
| High | Mobile navigation remained open after selecting a link. It also remained open after tabbing away or resizing. | Close on link activation, Escape, outside click, leaving header focus, and breakpoint changes. Escape restores focus to the toggle. Section links move focus to their destination. |
| High | Without JS, the original mobile CSS hid every navigation link while the menu button could not open them. | Mobile links are visible by default; the collapsed disclosure is enabled only after listeners are installed. Without JS, the expanded header is not sticky. |
| Medium | No indication of the reader's current homepage section. | One `aria-current="location"` link with a visible underline. A passive scroll listener schedules one update per animation frame; load, resize, hash and layout changes also update it. The short final Contact section activates at the bottom. |
| Medium | Fixed header assumptions can become inaccurate when the header's geometry changes. | Preserve CSS scroll padding and observe actual header height when ResizeObserver is available. No manual scrolling or history interception is needed. |
| Medium | Uniform text rows made the page feel like a continuous CV; the long news archive preceded selected publications. | Introduced stronger sans-serif heading hierarchy, selected-work cards with an existing engineering image, clearer spacing and contact treatment. Keep four recent news entries visible and place seven earlier updates in native details/summary. No entries were removed. |
| Medium | Small icon controls were 36px and publication panel controls were very compact. | Enlarge icon and publication controls to at least 44px; mobile menu rows are at least 48px. |
| Medium | Skipped section layout used estimated 500px heights. This complicates reliable geometry-based tracking on a page of very different section lengths. | Remove section layout skipping for predictable anchors and tracking. This trades a small potential layout optimization for stable section geometry; no performance benchmark is claimed. |
| Low | Repeated headers could diverge across pages. | Apply the same brand, breakpoint, link order and mobile button markup to home, publications, projects, CV and 404. Publications/Projects retain page-current states on their own pages. |

## Implementation map

| Deliverable | Exact implementation |
|---|---|
| Navbar HTML, section IDs, selected work and news archive | [index.html](../index.html) |
| Header markup on other pages | [projects.html](../projects.html), [publications.html](../publications.html), [cv.html](../cv.html), [404.html](../404.html) |
| Sticky glass header, responsive menu, link states | [style.css](../assets/css/style.css), section 3 |
| Scroll padding | [style.css](../assets/css/style.css), `html` in section 2 |
| Smooth scrolling and reduced motion | [style.css](../assets/css/style.css), media queries before the editorial layout block |
| Menu and active section behavior | [main.js](../assets/js/main.js), Navigation block |
| Existing theme, publication and project features | [main.js](../assets/js/main.js), retained and covered by behavioral checks |

Desktop/tablet navigation is horizontal from 640 CSS pixels upward. Below 640px, JavaScript enhances it into a mobile disclosure. The full name is compacted to the GRK mark below 1041px so the tablet links have space. The full brand returns on mobile, except below 360px. The blur supports Safari's prefixed property, with an opaque fallback when blur is unsupported. Light/dark colors use the existing theme tokens.

The menu is a normal navigation list and disclosure button, not an ARIA application menu. It therefore uses ordinary Tab navigation rather than menu roles or arrow-key trapping. Opening it focuses the first link; Escape returns to the toggle. It does not lock body scrolling or trap users inside the header.

The scroll tracker reads section positions in navigation order. If adding or moving sections, keep the six homepage links in the same order as the sections. Native anchors retain deep linking, back/forward history and open-in-new-tab behavior. Smooth movement is enabled only when reduced motion is not requested. JavaScript never calls `scrollIntoView` or forces animation.

## Further design improvements

1. Make the work more tangible: add real antenna photographs, measured response plots and concise “problem / contribution / result” explanations to individual project cards. Use only results you can substantiate. The existing array model is reused here; no illustrative performance data was invented.
2. Lead project descriptions with your personal contribution. Distinguish design, simulation, fabrication and measurements, especially on collaborative work.
3. Keep the homepage selective. Four recent updates and two featured projects are enough to invite exploration; maintain the comprehensive history on CV and project pages.
4. Reconcile the award wording: the homepage's general Silver Medal wording is broader than the CV's precise highest-CGPA-through-Semester-II description. Verify and choose consistent wording before changing this biographical claim.
5. Repeated plain-HTML headers are reasonable for five pages. If the site grows, use a shared template during a build step rather than fetching the essential navigation with client-side JS.

## Validation and limits

Passed:

```bash
python3 scripts/check-site.py
node --check assets/js/main.js
node scripts/check-navigation.cjs
```

The structural check covers five pages, HTML page/fragment navigation, unique IDs, ARIA references and main/H1 landmarks. The interaction tests cover mobile disclosure, focus, Escape, outside clicks, resize, section selection, the short final section, theme persistence, project filtering and publication panel toggling. DOM geometry is simulated; these tests are not browser rendering tests.

The environment's browser approval gate declined the local preview. No alternate route was used to bypass that decision. Therefore the refactor has **not** received visual QA in a browser, an automated accessibility scan, a Lighthouse run, or real Safari/mobile/print verification. The original live homepage was visually inspected, but the proposed design must still be checked before merge.

Before merging, serve the branch locally and inspect 320, 375, 639, 640, 768, 1024 and 1440px widths; light/dark mode; reduced motion; keyboard-only navigation; direct hashes and back/forward; archive expansion; JavaScript disabled; filtered projects; publication panels; and CV print output. Check contrast over real content beneath the translucent header. External links and the existing PDF should be opened manually as well.

This branch does not change the published site until it is merged into `main`.
