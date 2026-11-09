"""Localizes a hand-built HTML page into another language without touching its CSS, JS or layout.

  python scripts/localize-html.py extract <src.html> <map.json>
      Writes every translatable segment of <src.html> into <map.json> as {"source": ""}
      (existing translations in <map.json> are kept).
  python scripts/localize-html.py apply <map.json>
      Builds the page described by the "_meta" block of <map.json> and lists any segment left untranslated.

Segments are: the inner HTML of leaf text blocks (p, h1-h6, li, summary, td, th, ...), any text left
outside those blocks, translatable attributes (alt, title, aria-label, placeholder, data-tip, meta content)
and the string values of JSON-LD. Inline <script> code is not touched; put its UI strings in "_meta.replace".

"_meta" keys:
  src, out            source and output paths (relative to the repo root)
  lang                html lang, e.g. "it"
  urls                {"/old-path": "/new-path"} applied to href/src/content/JSON-LD URLs
  head                exact HTML for the hreflang + canonical block (replaces the source's one)
  replace             [[from, to], ...] raw replacements applied last (inline script strings, etc.)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://www.promobeez.com'
BLOCK = 'p|h1|h2|h3|h4|h5|h6|li|summary|td|th|figcaption|button|label|dt|dd|caption|option|blockquote|title'
BLOCK_RE = re.compile(r'<(' + BLOCK + r')\b([^>]*)>([\s\S]*?)</\1>', re.I)
INNER_BLOCK = re.compile(r'<(?:' + BLOCK + r'|div|section|ul|ol|table|article|header|footer|nav|details)\b', re.I)
ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'data-tip', 'data-growth-trial-from', 'data-growth-trial-to',
         'data-packs-from', 'data-packs-to', 'data-label', 'data-empty')
META_CONTENT = re.compile(r'<meta\s+(?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)"\s+content="([^"]*)"')
PROTECT = re.compile(r'<(script|style|svg)\b[\s\S]*?</\1>', re.I)


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def has_words(s):
    t = re.sub(r'<[^>]+>|&[a-z#0-9]+;', ' ', s)
    return bool(re.search(r'[A-Za-zÀ-ÿ]{2,}', t))


def protect(html):
    store = []

    def keep(m):
        store.append(m.group(0))
        return f'\x00{len(store) - 1}\x00'
    return PROTECT.sub(keep, html), store


def restore(html, store):
    return re.sub(r'\x00(\d+)\x00', lambda m: store[int(m.group(1))], html)


def walk_json(v, fn):
    if isinstance(v, dict):
        return {k: (walk_json(x, fn) if k not in ('@type', '@context', '@id') else x) for k, x in v.items()}
    if isinstance(v, list):
        return [walk_json(x, fn) for x in v]
    if isinstance(v, str):
        return fn(v)
    return v


def segments(html):
    """Yields (kind, text) in document order."""
    out = []
    body, store = protect(html)

    def blocks(m):
        inner = m.group(3)
        if INNER_BLOCK.search(inner) or '\x00' in inner:
            return m.group(0)
        if has_words(inner):
            out.append(norm(inner))
        return '\x01'
    rest = BLOCK_RE.sub(blocks, body)
    rest = BLOCK_RE.sub(blocks, rest)
    for t in re.split(r'<[^>]+>|\x00\d+\x00|\x01', rest):
        if has_words(t):
            out.append(norm(t))
    for a in ATTRS:
        for m in re.finditer(r'\s' + a + r'="([^"]*)"', html):
            if has_words(m.group(1)):
                out.append(m.group(1))
    for m in META_CONTENT.finditer(html):
        out.append(m.group(1))
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>([\s\S]*?)</script>', html):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        walk_json(data, lambda s: (out.append(s) if has_words(s) and not s.startswith('http') else None) or s)
    seen, uniq = set(), []
    for s in out:
        if s not in seen and not s.startswith('http'):
            seen.add(s)
            uniq.append(s)
    return uniq


def map_url(u, urls, src_rel):
    if not u or u.startswith(('#', 'mailto:', 'tel:', 'data:', 'javascript:')):
        return u
    if not u.startswith(('http', '/')):
        # relative path: make it absolute from the source page's folder
        base = '/' + '/'.join(src_rel.split('/')[:-1])
        parts = [p for p in (base.rstrip('/') + '/' + u).split('/')]
        stack = []
        for p in parts:
            if p == '..':
                stack and stack.pop()
            elif p not in ('', '.'):
                stack.append(p)
        u = '/' + '/'.join(stack)
    pre = BASE if u.startswith(BASE) else ''
    path = u[len(pre):]
    m = re.match(r'([^#?]*)([#?].*)?$', path)
    p, tail = m.group(1), m.group(2) or ''
    if p in urls:
        return pre + urls[p] + tail
    if p.endswith('.html') and p[:-5] in urls:
        return pre + urls[p[:-5]] + tail
    return u


def apply(map_path):
    data = json.loads(Path(map_path).read_text(encoding='utf-8'))
    meta = data['_meta']
    tr = {k: v for k, v in data.items() if k != '_meta'}
    src_rel = meta['src']
    html = (ROOT / src_rel).read_text(encoding='utf-8')
    urls = json.loads((ROOT / meta.get('urls_file', 'content-it/pages/_urls.json')).read_text(encoding='utf-8'))
    urls.update(meta.get('urls', {}))
    missing = []

    def t(s):
        key = norm(s) if s.strip() else s
        v = tr.get(key)
        if v is None:
            v = tr.get(s)
        if v in (None, ''):
            if has_words(s) and not s.startswith('http'):
                missing.append(key)
            return None
        return v

    # JSON-LD
    def ld(m):
        try:
            d = json.loads(m.group(2))
        except json.JSONDecodeError:
            return m.group(0)

        def fn(s):
            if s.startswith(('http', '/')):
                return map_url(s, urls, src_rel)
            return t(s) or s
        return m.group(1) + '\n' + json.dumps(walk_json(d, fn), indent=2, ensure_ascii=False) + '\n</script>'
    html = re.sub(r'(<script type="application/ld\+json"[^>]*>)([\s\S]*?)</script>', ld, html)

    # meta content
    html = META_CONTENT.sub(lambda m: m.group(0).replace(m.group(1), (t(m.group(1)) or m.group(1)).replace('"', '&quot;')), html)

    body, store = protect(html)
    done = []

    def blocks(m):
        inner = m.group(3)
        if INNER_BLOCK.search(inner) or '\x00' in inner or '\x05' in inner or not has_words(inner):
            return m.group(0)
        v = t(inner)
        if v is None:
            return m.group(0)
        lead = re.match(r'\s*', inner).group(0)
        trail = re.search(r'\s*$', inner).group(0)
        done.append(f'<{m.group(1)}{m.group(2)}>{lead}{v}{trail}</{m.group(1)}>')
        return f'\x05{len(done) - 1}\x05'
    body = BLOCK_RE.sub(blocks, body)
    body = BLOCK_RE.sub(blocks, body)

    def text(m):
        s = m.group(0)
        if not has_words(s):
            return s
        v = t(s)
        if v is None:
            return s
        lead = re.match(r'\s*', s).group(0)
        trail = re.search(r'\s*$', s).group(0)
        return lead + v + trail
    body = re.sub(r'(?<=[>\x00\x05])[^<>\x00\x05]+(?=<|\x00|\x05)', text, body)
    while '\x05' in body:
        body = re.sub(r'\x05(\d+)\x05', lambda m: done[int(m.group(1))], body)
    html = restore(body, store)

    # attributes
    for a in ATTRS:
        def at(m):
            v = t(m.group(2)) if has_words(m.group(2)) else None
            return m.group(1) + '"' + (v.replace('"', '&quot;') if v else m.group(2)) + '"'
        html = re.sub(r'(\s' + a + r'=)"([^"]*)"', at, html)

    # urls
    def tag_urls(m):
        tag = m.group(0)
        if 'hreflang=' in tag:
            return tag
        tag = re.sub(r'(\s(?:href|src|action)=")([^"]*)(")', lambda a: a.group(1) + map_url(a.group(2), urls, src_rel) + a.group(3), tag)
        # srcset: relative "../assets/x.webp" would otherwise resolve under /it/ and 404
        tag = re.sub(r'(\ssrcset=")([^"]*)(")', lambda a: a.group(1) + ', '.join(
            ' '.join([map_url(c.split()[0], urls, src_rel)] + c.split()[1:]) for c in a.group(2).split(',') if c.strip()) + a.group(3), tag)
        return re.sub(r'(\scontent=")((?:https?:|/)[^"]*)(")', lambda a: a.group(1) + map_url(a.group(2), urls, src_rel) + a.group(3), tag)
    html = re.sub(r'<(?:a|link|img|script|meta|form|source|iframe)(?=[\s>])[^>]*>', tag_urls, html)
    if meta.get('switch'):
        sw = meta['switch']
        lang = meta['lang']
        cur = lambda l: ' aria-current="page"' if l == lang else ''
        menu = (f'<div class="lang-switch__menu" role="list"><a href="{sw["en"]}" hreflang="en" lang="en"{cur("en")}>English</a>'
                f'<a href="{sw["fi"]}" hreflang="fi" lang="fi"{cur("fi")}>Suomeksi</a>'
                f'<a href="{sw["it"]}" hreflang="it" lang="it"{cur("it")}>Italiano</a></div>')
        html = re.sub(r'<div class="lang-switch__menu" role="list">[\s\S]*?</div>', menu, html)
        html = re.sub(r'<span class="lang-switch__code">[A-Z]{2}</span>', f'<span class="lang-switch__code">{lang.upper()}</span>', html)
        if 'lang-pref.js' not in html:
            html = html.replace('</body>', '<script src="/assets/lang-pref.js" defer></script>\n</body>')
    html = re.sub(r'<html lang="[^"]*"', f'<html lang="{meta["lang"]}"', html, 1)
    if meta['lang'] == 'it' and 'it-launch.js' not in html:
        # Italy is not live yet: every Italian page carries the "opening soon in Milan" bar
        html = html.replace('</body>', '<script src="/assets/it-launch.js" defer></script>\n</body>', 1)
    html = re.sub(r'<meta property="og:locale:alternate" content="[^"]*">\s*', '', html)
    og = {'en': 'en_FI', 'fi': 'fi_FI', 'it': 'it_IT'}
    html = re.sub(r'<meta property="og:locale" content="[^"]*">',
                  f'<meta property="og:locale" content="{og[meta["lang"]]}">' + ''.join(
                      f'\n<meta property="og:locale:alternate" content="{v}">' for k, v in og.items() if k != meta['lang']), html, 1)
    if meta.get('head'):
        link = r'<link rel="(?:canonical|alternate)" (?:hreflang="[^"]*" )?href="[^"]*"\s*/?>\s*'
        html = re.sub(r'(?:' + link + r')+', '\x06', html, 1)
        html = re.sub(link, '', html).replace('\x06', meta['head'].strip() + '\n', 1)
    for a, b in meta.get('replace', []):
        if a not in html:
            print('replace not found:', a[:80])
        html = html.replace(a, b)
    out = ROOT / meta['out']
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    missing = list(dict.fromkeys(missing))
    print(f'{meta["out"]}: {len(missing)} untranslated')
    for s in missing:
        print('  -', s[:140])


def extract(src, map_path):
    p = Path(map_path)
    old = json.loads(p.read_text(encoding='utf-8')) if p.exists() else {}
    data = {'_meta': old.get('_meta', {'src': src, 'out': '', 'lang': 'it', 'urls': {}, 'head': '', 'replace': []})}
    for s in segments((ROOT / src).read_text(encoding='utf-8')):
        data[s] = old.get(s, '')
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'{len(data) - 1} segments -> {map_path}')





EN_WORDS = re.compile(r"\b(the|and|with|your|you|for|from|this|that|are|is|our|we|will|what|when|how|which|of|to|on|it's|don't|can|more|than|about)\b", re.I)


def leftovers(path):
    """Prints visible text / attribute / inline-script strings that still look English."""
    html = (ROOT / path).read_text(encoding='utf-8')
    found = []
    body = re.sub(r'<style[\s\S]*?</style>|<svg[\s\S]*?</svg>|<script type="application/ld\+json"[\s\S]*?</script>', ' ', html)
    for m in re.finditer(r'<script[^>]*>([\s\S]*?)</script>', body):
        for q in re.findall(r"'([^'\n]{8,})'|\"([^\"\n]{8,})\"|`([^`]{8,})`", m.group(1)):
            q = next(x for x in q if x)
            if len(EN_WORDS.findall(q)) >= 2:
                found.append('JS: ' + q)
    body = re.sub(r'<script[\s\S]*?</script>', ' ', body)
    for a in re.findall(r'\s(?:alt|title|aria-label|placeholder|content|data-tip)="([^"]+)"', body):
        if len(EN_WORDS.findall(a)) >= 2:
            found.append('ATTR: ' + a)
    for t in re.split(r'<[^>]+>', body):
        t = norm(t)
        if len(EN_WORDS.findall(t)) >= 2:
            found.append(t)
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>([\s\S]*?)</script>', html):
        for q in re.findall(r'"([^"\n]{12,})"', m.group(1)):
            if len(EN_WORDS.findall(q)) >= 2:
                found.append('LD: ' + q)
    print(f'{path}: {len(found)} suspicious')
    for f in dict.fromkeys(found):
        print('  -', f[:160])


def fill(map_path, lines_path):
    """Fills translations from a text file of 'N|translation' lines (N = 1-based segment number; '=' keeps the source)."""
    p = Path(map_path)
    data = json.loads(p.read_text(encoding='utf-8'))
    keys = [k for k in data if k != '_meta']
    for line in Path(lines_path).read_text(encoding='utf-8').splitlines():
        if not line.strip() or '|' not in line:
            continue
        n, v = line.split('|', 1)
        k = keys[int(n) - 1]
        data[k] = k if v == '=' else v
    p.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')


def numbered(map_path):
    data = json.loads(Path(map_path).read_text(encoding='utf-8'))
    for i, k in enumerate([k for k in data if k != '_meta'], 1):
        if not data[k]:
            print(f'{i}|{k}')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'check':
        for f in sys.argv[2:]:
            leftovers(f)
    elif cmd == 'extract':
        extract(sys.argv[2], sys.argv[3])
    elif cmd == 'fill':
        fill(sys.argv[2], sys.argv[3])
    elif cmd == 'list':
        numbered(sys.argv[2])
    else:
        for m in sys.argv[2:]:
            apply(m)
