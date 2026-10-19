# Exact navbar implementation

These are extracts from the refactored source, not additional files to load. The complete files remain the source of truth. CSS uses the existing theme variables defined in style.css. Keep the existing theme toggle code in main.js.

## HTML

```html
<header class="site-header">
      <nav class="container nav" aria-label="Main">
        <a class="brand" href="/" aria-label="Giridhar Reddy Karnati — home"><span class="brand-mark" aria-hidden="true">GRK<span>.</span></span><span class="brand-name">Giridhar Reddy Karnati</span></a>
        <div class="nav-right">
          <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path class="menu-line-top" d="M4 8h16" /><path class="menu-line-bottom" d="M4 16h16" /></svg>
          </button>
          <ul class="nav-links" id="nav-links">
            <li><a href="/" data-section="about">About</a></li>
            <li><a href="#research">Research</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#publications">Publications</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="cv.html">CV</a></li>
          </ul>
          <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode">
            <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
```

The six home links target sections in document order. About uses `/` with `data-section="about"` to keep the URL clean while retaining scrolling and active states. main.js also replaces the legacy homepage `#about` fragment with `/` using the History API. Keep the real classes, content and headings in index.html. CV links to cv.html rather than a nonexistent section.

```html
<section id="about" tabindex="-1" aria-labelledby="name">...</section>
<section id="research" tabindex="-1" aria-labelledby="interests-title">...</section>
<section id="news" tabindex="-1" aria-labelledby="news-title">...</section>
<section id="projects" tabindex="-1" aria-labelledby="projects-title">...</section>
<section id="publications" tabindex="-1" aria-labelledby="pubs-title">...</section>
<section id="contact" tabindex="-1" aria-labelledby="contact-title">...</section>
```

## CSS

```css
/* ---------- 3. Header & navigation ---------- */
.site-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 50;
  background: var(--bg); /* opaque fallback when blur is unavailable */
  border-block-end: 1px solid var(--border);
}

@supports ((backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px))) {
  .site-header {
    background: color-mix(in srgb, var(--bg) 78%, transparent);
    -webkit-backdrop-filter: saturate(160%) blur(20px);
    backdrop-filter: saturate(160%) blur(20px);
  }
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 64px;
}
.brand {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: 12px;
  color: var(--text);
  white-space: nowrap;
}
.brand:hover { text-decoration: none; }
.brand-mark { font-size: 1.2rem; font-weight: 600; letter-spacing: -0.07em; }
.brand-mark span { color: var(--accent); }
.brand-name { font-size: 0.8rem; font-weight: 500; letter-spacing: -0.02em; }
.nav-right { display: flex; align-items: center; gap: 14px; }
.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(4px, 1vw, 16px);
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-links a {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 4px;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: color 160ms ease;
}
.nav-links a:hover { color: var(--text); text-decoration: none; }
.nav-links a[aria-current] { color: var(--text); }
.nav-links a[aria-current]::after {
  content: "";
  position: absolute;
  inset-inline: 4px;
  inset-block-end: 3px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
}
.icon-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.icon-btn:hover { color: var(--text); background: var(--bg-soft); }
.icon-btn svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.theme-toggle .icon-sun { display: var(--icon-sun); }
.theme-toggle .icon-moon { display: var(--icon-moon); }
.nav-toggle { display: none; }
.nav-toggle path { transform-origin: center; transition: transform 160ms ease; }
.nav-toggle[aria-expanded="true"] .menu-line-top { transform: translateY(4px) rotate(45deg); }
.nav-toggle[aria-expanded="true"] .menu-line-bottom { transform: translateY(-4px) rotate(-45deg); }

@media (max-width: 1040px) {
  .brand-name { display: none; }
}

/* Tablet and desktop keep the horizontal bar. Only phones use a disclosure. */
@media (max-width: 639px) {
  .site-header:not(.nav-ready) { position: static; }
  .nav { flex-wrap: wrap; gap: 0; }
  .nav-right { gap: 4px; }
  .brand-name { display: inline; }
  .nav-links {
    position: absolute;
    inset-inline: 0;
    inset-block-start: 100%;
    display: flex; /* links remain usable when JavaScript is unavailable */
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    max-height: calc(100dvh - var(--header-h));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px 24px 24px;
    background: var(--bg);
    border-block-end: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .nav-links a { min-height: 48px; font-size: 1.15rem; padding-inline: 8px; }
  .nav-links a[aria-current]::after { inset-inline: 8px auto; width: 24px; }
  .nav-ready .nav-toggle { display: inline-flex; }
  .nav-ready .nav-links:not(.is-open) { display: none; }
  .site-header:not(.nav-ready) .nav-right { display: contents; }
  .site-header:not(.nav-ready) .nav-links {
    position: static;
    order: 3;
    width: 100%;
    max-height: none;
    box-shadow: none;
  }
}
@media (max-width: 359px) {
  .brand-name { display: none; }
}

html { scroll-padding-block-start: calc(var(--header-h, 64px) + 16px); }
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; scroll-behavior: auto !important; }
}
```

## JavaScript

Load main.js with defer. Inside its existing IIFE, root is document.documentElement. The exact navigation block is:

```js
/* ---------- Navigation: native anchors, mobile disclosure and scroll state ---------- */
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const mobileNav = window.matchMedia("(max-width: 639px)");
  if (header && navToggle && navLinks) {
    const setNav = (open, returnFocus = false) => {
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (returnFocus) navToggle.focus();
    };
    navToggle.addEventListener("click", () => {
      const open = !navLinks.classList.contains("is-open");
      setNav(open);
      if (open) navLinks.querySelector("a")?.focus();
    });
    navLinks.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      setNav(false);
      // Let the browser handle scrolling, URL history and reduced-motion CSS.
      // Move keyboard focus to the chosen section without triggering a second scroll.
      const href = link.getAttribute("href");
      if (link.dataset.section === "about") {
        const target = document.getElementById("about");
        if (target) {
          event.preventDefault();
          if (window.location.pathname !== "/" || window.location.hash) {
            window.history.pushState(null, "", "/" + window.location.search);
          }
          target.focus({ preventScroll: true });
          target.scrollIntoView({ block: "start" });
        }
        return;
      }
      if (href?.startsWith("#")) {
        const target = document.getElementById(href.slice(1));
        target?.focus({ preventScroll: true });
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navLinks.classList.contains("is-open")) setNav(false, true);
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setNav(false);
    });
    header.addEventListener("focusout", (event) => {
      if (!header.contains(event.relatedTarget)) setNav(false);
    });
    mobileNav.addEventListener("change", () => {
      const focusedLink = navLinks.contains(document.activeElement);
      setNav(false, mobileNav.matches && focusedLink);
    });
    // Added only after listeners exist: mobile links stay visible if JS fails.
    header.classList.add("nav-ready");
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        root.style.setProperty("--header-h", `${Math.ceil(header.getBoundingClientRect().height)}px`);
      }).observe(header);
    }
  }

  const sectionLinks = [...document.querySelectorAll('.nav-links a[data-section], .nav-links a[href^="#"]')];
  const sectionId = (link) => link.dataset.section || link.hash.slice(1);
  const sections = sectionLinks.map((link) => document.getElementById(sectionId(link))).filter(Boolean);
  if (sections.length && header) {
    let scheduled = false;
    const syncActiveSection = () => {
      scheduled = false;
      const offset = header.getBoundingClientRect().height + 24;
      let active = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset) active = section;
      }
      // The last short section may never reach the activation line.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        active = sections[sections.length - 1];
      }
      sectionLinks.forEach((link) => {
        if (sectionId(link) === active.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const scheduleSync = () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(syncActiveSection);
      }
    };
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("hashchange", scheduleSync);
    window.addEventListener("load", scheduleSync);
    if ("ResizeObserver" in window) {
      new ResizeObserver(scheduleSync).observe(document.querySelector("main"));
    }
    syncActiveSection();
  }
```
