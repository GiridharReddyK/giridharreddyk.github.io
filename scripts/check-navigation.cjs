/* Dependency-free behavioral regressions. DOM geometry is simulated;
   this does not replace a browser layout or accessibility audit. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element {
  constructor(attrs = {}) {
    this.attrs = {...attrs}; this.events = {}; this.children = [];
    this.dataset = {}; this.hidden = false; this.style = {};
    const classes = new Set();
    this.classList = {add: x => classes.add(x), contains: x => classes.has(x),
      toggle(x, on) { if (on) classes.add(x); else classes.delete(x); }};
  }
  addEventListener(name, fn) { (this.events[name] ??= []).push(fn); }
  emit(name, data = {}) { for (const fn of this.events[name] ?? []) fn({target: this, button: 0, ...data}); }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  contains(el) { return el === this || this.children.some(c => c.contains(el)); }
  closest(selector) { return selector === 'a' && this.attrs.href ? this : null; }
  focus() { document.activeElement = this; }
  get hash() { return this.attrs.href?.startsWith('#') ? this.attrs.href : ''; }
  getBoundingClientRect() { return {top: this.top ?? 0, height: this.height ?? 64}; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}
const root = new Element(); root.scrollHeight = 5000;
const header = new Element(), toggle = new Element({'aria-expanded': 'false'});
const nav = new Element(), theme = new Element(), main = new Element();
const ids = ['about', 'research', 'news', 'projects', 'publications', 'contact'];
const sections = ids.map((id, i) => Object.assign(new Element(), {id, top: i * 700 + 100}));
const links = ids.map(id => new Element({href: '#' + id}));
const cv = new Element({href: 'cv.html'});
nav.children = [...links, cv]; nav.querySelector = () => links[0];
header.children = [toggle, nav, theme];
const media = new Element(); media.matches = true;
const filter = new Element(), filterAll = new Element(), filterRF = new Element();
filterRF.dataset.filter = 'rf'; filterAll.dataset.filter = 'all';
filterRF.closest = () => filterRF; filterAll.closest = () => filterAll;
filter.querySelectorAll = () => [filterAll, filterRF];
const cards = ['rf ic', 'digital', 'radio rf'].map(category => {
  const el = new Element(); el.dataset.category = category; return el;
});
const panel = new Element(); panel.hidden = true;
const panelBtn = new Element({'aria-controls': 'publication-panel'});
const pub = new Element(); pub.querySelectorAll = () => [panelBtn];
panelBtn.closest = () => pub;
const year = new Element();
const document = Object.assign(new Element(), {
  documentElement: root,
  querySelector(selector) {
    return {'.site-header':header,'.nav-toggle':toggle,'.theme-toggle':theme,
      main, '[data-filters]':filter}[selector] ?? null;
  },
  querySelectorAll(selector) {
    return {'.nav-links a[href^="#"]':links,'[data-panel]':[panelBtn],
      '.copy-btn':[],'[data-category]':cards,'[data-year]':[year]}[selector] ?? [];
  },
  getElementById(id) {
    return id === 'nav-links' ? nav : id === 'publication-panel' ? panel : sections.find(s => s.id === id);
  }
});
const window = Object.assign(new Element(), {
  scrollY: 0, innerHeight: 800,
  matchMedia(query) { return query.includes('639px') ? media : {matches: false}; },
  requestAnimationFrame: callback => callback()
});
const store = new Map();
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8'), {
  window, document, localStorage: {getItem:k=>store.get(k), setItem:(k,v)=>store.set(k,v)},
  navigator: {}, setTimeout, console
});
const active = () => links.filter(l => l.getAttribute('aria-current') === 'location');
assert.equal(active()[0], links[0]);
assert(header.classList.contains('nav-ready'));
toggle.emit('click');
assert.equal(toggle.getAttribute('aria-expanded'), 'true');
assert.equal(document.activeElement, links[0]);
nav.emit('click', {target: links[2]});
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
assert.equal(document.activeElement, sections[2]);
toggle.emit('click'); document.emit('keydown', {key: 'Escape'});
assert.equal(document.activeElement, toggle);
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
toggle.emit('click'); document.emit('click', {target: main});
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
toggle.emit('click'); header.emit('focusout', {relatedTarget: main});
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
toggle.emit('click'); media.matches = false; media.emit('change');
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
document.activeElement = links[1]; media.matches = true; media.emit('change');
assert.equal(document.activeElement, toggle);
toggle.emit('click'); nav.emit('click', {target: cv});
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
for (let i = 0; i < sections.length; i++) sections[i].top -= 2150;
window.scrollY = 2150; window.emit('scroll');
assert.equal(active().length, 1); assert.equal(active()[0], links[3]);
// Layout growth (e.g. opening the archive) and upward scrolling update the selection.
sections.forEach((s, i) => {s.top = i * 700 + 100;});
window.scrollY = 0; window.emit('resize');
assert.equal(active()[0], links[0]);
window.scrollY = 4200; window.emit('scroll');
assert.equal(active()[0], links[5]);
theme.emit('click'); assert.equal(root.getAttribute('data-theme'), 'dark');
assert.equal(store.get('theme'), 'dark');
filter.emit('click', {target: filterRF});
assert.deepEqual(cards.map(c=>c.hidden), [false,true,false]);
filter.emit('click', {target: filterAll});
assert(cards.every(c=>!c.hidden));
panelBtn.emit('click'); assert.equal(panel.hidden, false);
panelBtn.emit('click'); assert.equal(panel.hidden, true);
assert.equal(year.textContent, new Date().getFullYear());
console.log('PASS: mobile menu, focus, Escape, outside click, resize, scroll tracking, theme, filters, publication panels');
