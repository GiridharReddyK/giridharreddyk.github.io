"""Dependency-free checks for local links, landmarks and navigation targets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links, self.references = [], [], []
        self.h1 = self.main = 0
        self.feed(path.read_text())

    def handle_starttag(self, tag, pairs):
        a = dict(pairs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'a' and 'href' in a:
            self.links.append(a['href'])
        for name in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
            self.references.extend(a.get(name, '').split())
        self.h1 += tag == 'h1'
        self.main += tag == 'main'


pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
count = 0
for name, page in pages.items():
    assert page.h1 == 1 and page.main == 1, f'{name}: main/h1 landmarks'
    assert all(n == 1 for n in Counter(page.ids).values()), f'{name}: duplicate ID'
    assert all(ref in page.ids for ref in page.references), f'{name}: broken ARIA reference'
    for href in page.links:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            continue
        target = unquote(url.path).lstrip('/') or (name if not url.path else 'index.html')
        if target.endswith('.html'):
            assert target in pages, f'{name}: missing page {href}'
            if url.fragment:
                assert unquote(url.fragment) in pages[target].ids, f'{name}: broken anchor {href}'
        count += 1

home = pages['index.html']
assert all(x in home.ids for x in ['about', 'research', 'news', 'projects', 'publications', 'contact'])
print(f'PASS: {len(pages)} pages; {count} local links; unique IDs, ARIA references and landmarks')
