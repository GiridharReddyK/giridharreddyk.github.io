/* ==========================================================================
   main.js — small, dependency-free helpers for the site.
   Everything here is optional: every page still reads fine without JS.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;

  /* ---------- Light / dark theme toggle ----------
     The early <script> in each page's <head> applies a saved choice before
     the page paints (no flash). This part handles the button. */
  const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

  const currentTheme = () => {
    const chosen = root.getAttribute("data-theme");
    if (chosen === "light" || chosen === "dark") return chosen;
    return systemPrefersDark() ? "dark" : "light";
  };

  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    const syncThemeLabel = () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      themeBtn.setAttribute("aria-label", `Switch to ${next} mode`);
      themeBtn.title = `Switch to ${next} mode`;
    };
    syncThemeLabel();

    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* private mode / storage blocked: the toggle still works for this page */
      }
      syncThemeLabel();
    });
  }

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

  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
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
        if (link.hash === `#${active.id}`) link.setAttribute("aria-current", "location");
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

  /* ---------- Publication panels (Summary / Bib) ----------
     A button with data-panel and aria-controls="some-id" shows/hides the
     element with that id. Opening one panel closes the others in the same entry. */
  document.querySelectorAll("[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      const willOpen = panel.hidden;

      btn
        .closest(".pub")
        ?.querySelectorAll("[data-panel]")
        .forEach((other) => {
          const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.hidden = true;
          other.setAttribute("aria-expanded", "false");
        });

      panel.hidden = !willOpen;
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });

  /* ---------- Copy BibTeX ---------- */
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy command was rejected");
    } finally {
      area.remove();
    }
  };

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      const pre = btn.parentElement.querySelector("pre");
      if (!pre) return;
      try {
        await copyText(pre.textContent.trim());
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => {
        btn.textContent = label;
      }, 1600);
    });
  });

  /* ---------- Project filters ----------
     Buttons: <button data-filter="rf">. Cards: <li data-category="rf radio">. */
  const filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    const cards = document.querySelectorAll("[data-category]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let transitionId = 0;

    const showMatching = (filter) => {
      cards.forEach((card) => {
        const categories = card.dataset.category.split(/\s+/);
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    };

    // Cards stay `hidden` (out of the layout, tab order and accessibility tree).
    // Where supported, a view transition animates the cards that stay, leave or
    // appear; elsewhere the change is instant.
    const applyFilter = (filter) => {
      if (!document.startViewTransition || prefersReducedMotion.matches) {
        showMatching(filter);
        return;
      }
      const id = ++transitionId;
      cards.forEach((card, i) => {
        card.style.viewTransitionName = `card-${i}`;
      });
      document.startViewTransition(() => showMatching(filter)).finished.finally(() => {
        if (id !== transitionId) return; // a newer transition is still using the names
        cards.forEach((card) => {
          card.style.viewTransitionName = "";
        });
      });
    };

    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;

      filterBar.querySelectorAll("button[data-filter]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      applyFilter(btn.dataset.filter);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
