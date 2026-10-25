"""Regroups the blog index pages (blog.html, fi/blogi.html) into sections with a filter bar.

Reads the existing post cards from <main class="posts">, sorts them into categories by URL,
and rewrites <main> plus the card CSS. Card text is kept as it is. Run again after adding a
post card anywhere inside <main>: the card is picked up and placed in its category.
Run: python scripts/regroup-blog-index.py
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CATS = {
    'en': {
        'file': 'blog.html',
        'all': 'All posts',
        'more': {'creators': 'Read the guide', 'guides': 'Read the guide', 'research': 'Read the research', 'compare': 'Read the comparison'},
        'sections': [
            ('creators', 'For creators', 'How to find and land local collaborations as a small creator.'),
            ('guides', 'Guides', 'Practical playbooks for cafés, restaurants, salons and gyms.'),
            ('research', 'Research and awards', 'Our own data, market maps and evidence reviews.'),
            ('compare', 'Platform comparisons', 'How Promobeez compares with other ways to work with creators in Finland.'),
        ],
    },
    'fi': {
        'file': 'fi/blogi.html',
        'all': 'Kaikki',
        'more': {'creators': 'Lue opas', 'guides': 'Lue opas', 'research': 'Lue tutkimus', 'compare': 'Lue vertailu'},
        'sections': [
            ('creators', 'Sisällöntuottajille', 'Miten pieni sisällöntuottaja löytää ja saa paikallisia yhteistöitä.'),
            ('guides', 'Oppaat', 'Käytännön ohjeet kahviloille, ravintoloille, kampaamoille ja saleille.'),
            ('research', 'Tutkimus ja palkinnot', 'Omaa dataa, markkinakarttoja ja tutkimuskatsauksia.'),
            ('compare', 'Vertailut', 'Miten Promobeez eroaa muista tavoista tehdä yhteistyötä sisällöntuottajien kanssa Suomessa.'),
        ],
    },
}

RULES = [
    ('creators', r'creator-collaborations|yhteistyot-sisallontuottajalle'),
    ('compare', r'promobeez-vs-'),
    ('research', r'best-restaurant-social-media|helsingin-paras|barter-collab-platforms|vaihtokauppa-alustat|wrong-metrics|vaarat-mittarit|why-audiences-trust|miksi-yleiso-luottaa'),
    ('guides', r'.'),
]

CSS = """
  .posts{max-width:1120px;margin:0 auto;padding:0 40px 96px}
  .blog-filter{position:sticky;top:64px;z-index:20;display:flex;flex-wrap:wrap;gap:8px;padding:14px 0;margin-bottom:8px;background:var(--paper)}
  .blog-filter a{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:100px;border:1px solid rgba(16,13,26,.14);font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;transition:background .15s,border-color .15s,color .15s}
  .blog-filter a:hover{border-color:var(--ink)}
  .blog-filter a[aria-current="true"]{background:var(--ink);border-color:var(--ink);color:#fff}
  .blog-filter .n{font-size:12px;font-weight:600;opacity:.55}
  .blog-section{padding-top:40px;scroll-margin-top:120px}
  .blog-section[hidden]{display:none}
  .section-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 24px;padding-bottom:18px;margin-bottom:28px;border-bottom:1px solid rgba(16,13,26,.1)}
  .section-head h2{font-size:clamp(24px,3vw,30px);line-height:1.2}
  .section-head p{font-size:15px;color:var(--gray)}
  .post-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 32px}
  .post-grid--compact{grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 24px}
  .post-card{position:relative;display:flex;flex-direction:column;transition:opacity .2s}
  .post-card:hover .post-title{color:var(--coral)}
  .post-card figure{margin:0 0 16px;overflow:hidden;border-radius:6px;aspect-ratio:16/9;background:#eee}
  .post-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}
  .post-card:hover img{transform:scale(1.03)}
  .post-meta{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--gray);margin-bottom:8px}
  .post-title{font-size:21px;line-height:1.28;margin-bottom:8px;transition:color .2s;letter-spacing:-.01em}
  .post-grid--compact .post-title{font-size:18px}
  .post-title a{color:inherit;text-decoration:none}
  .post-title a::after{content:"";position:absolute;inset:0}
  .post-excerpt{font-size:15px;color:var(--gray);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .post-grid--compact .post-excerpt{-webkit-line-clamp:2}
  .post-more{margin-top:auto;font-size:14px;font-weight:600;color:var(--ink);pointer-events:none}
  .post-more span{display:inline-block;transition:transform .2s}
  .post-card:hover .post-more span{transform:translateX(4px)}
  @media(max-width:900px){.post-grid--compact{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:640px){
    .post-grid,.post-grid--compact{grid-template-columns:1fr;gap:32px}
    .blog-filter{top:56px;flex-wrap:nowrap;overflow-x:auto;margin:0 -20px 8px;padding:12px 20px;scrollbar-width:none}
    .blog-filter::-webkit-scrollbar{display:none}
    .blog-filter a{flex:0 0 auto}
  }
"""

SCRIPT = """<script>
(function(){
  var bar=document.querySelector('.blog-filter');if(!bar)return;
  var secs=[].slice.call(document.querySelectorAll('.blog-section'));
  function show(cat){
    secs.forEach(function(s){s.hidden=cat!=='all'&&s.id!==cat});
    [].forEach.call(bar.querySelectorAll('a'),function(a){a.setAttribute('aria-current',a.dataset.cat===cat?'true':'false')});
  }
  bar.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a)return;e.preventDefault();
    show(a.dataset.cat);
    history.replaceState(null,'',a.dataset.cat==='all'?location.pathname:'#'+a.dataset.cat);
    var top=bar.getBoundingClientRect().top+scrollY;if(scrollY>top)scrollTo({top:top-70,behavior:'smooth'});
  });
  var h=location.hash.slice(1);if(secs.some(function(s){return s.id===h}))show(h);
})();
</script>
"""


def cat_of(url):
    return next(c for c, rx in RULES if re.search(rx, url))


MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def card(raw, cat, more, first, lang):
    a = raw
    a = re.sub(r'<article class="post-card"[^>]*>', '<article class="post-card">', a, 1)
    img_attrs = 'loading="eager" fetchpriority="high"' if first else 'loading="lazy"'
    a = re.sub(r'loading="(eager|lazy)"( fetchpriority="high")?', img_attrs, a, 1)

    # Grid meta = date + read time only; the section already names the category.
    def meta(m):
        inner = m.group(1)
        iso = re.search(r'datetime="([^"]+)"', inner).group(1)
        y, mo, d = (int(x) for x in iso.split('-'))
        label = f'{d}.{mo}.{y}' if lang == 'fi' else f'{d} {MONTHS[mo - 1]} {y}'
        mins = re.search(r'(\d+ min[^<·]*?)\s*(?:·|<|$)', re.sub(r'<time[\s\S]*?</time>', '', inner))
        read = f'<span>{mins.group(1).strip()}</span>' if mins else ''
        return f'<div class="post-meta"><time datetime="{iso}">{label}</time>{read}</div>'
    a = re.sub(r'<div class="post-meta">([\s\S]*?)</div>', meta, a, 1)
    a = re.sub(r'<p class="post-more">[\s\S]*?</p>', f'<p class="post-more">{more} <span aria-hidden="true">→</span></p>', a, 1)
    return '  ' + a.strip()


def regroup(lang):
    cfg = CATS[lang]
    path = ROOT / cfg['file']
    s = path.read_text(encoding='utf-8')
    main = re.search(r'<main class="posts">[\s\S]*?</main>', s)
    raws = re.findall(r'<article class="post-card"[\s\S]*?</article>', main.group(0))
    posts = []
    for r in raws:
        url = re.search(r'<h2 class="post-title"><a href="([^"]+)"', r).group(1)
        date = re.search(r'datetime="([^"]+)"', r).group(1)
        posts.append((cat_of(url), date, r))

    first_done = False
    filt = [f'<a href="#" data-cat="all" aria-current="true">{cfg["all"]} <span class="n">{len(posts)}</span></a>']
    sections = []
    for cat, title, sub in cfg['sections']:
        items = sorted([p for p in posts if p[0] == cat], key=lambda p: p[1], reverse=True)
        if not items:
            continue
        filt.append(f'<a href="#{cat}" data-cat="{cat}" aria-current="false">{html.escape(title)} <span class="n">{len(items)}</span></a>')
        cards = []
        for _, _, r in items:
            cards.append(card(r, cat, cfg['more'][cat], not first_done, lang))
            first_done = True
        # three columns unless that leaves a lone card in the last row (4 posts read better as 2x2)
        grid = 'post-grid' if len(items) % 3 == 1 and len(items) % 2 == 0 else 'post-grid post-grid--compact'
        sections.append(f'''  <section class="blog-section" id="{cat}" aria-labelledby="h-{cat}">
    <div class="section-head"><h2 id="h-{cat}">{html.escape(title)}</h2><p>{html.escape(sub)}</p></div>
    <div class="{grid}">
{chr(10).join('    ' + c.replace(chr(10), chr(10) + '  ') for c in cards)}
    </div>
  </section>''')

    # a div, not <nav>: the site's global nav{} rule is the fixed top menu
    new_main = (f'<main class="posts">\n  <div class="blog-filter" role="navigation" aria-label="{"Blog categories" if lang == "en" else "Blogin aiheet"}">\n    '
                + '\n    '.join(filt) + '\n  </div>\n\n' + '\n\n'.join(sections) + '\n</main>')
    s = s[:main.start()] + new_main + s[main.end():]

    # replace the old card CSS block (from .posts{ to the last .post-card rule) once
    if '.blog-filter{' not in s:
        s = re.sub(r'\n  \.posts\{[\s\S]*?\.post-card:hover \.post-more span\{[^}]*\}\n', CSS, s, 1)
    else:
        s = re.sub(r'\n  \.posts\{[\s\S]*?\.blog-filter a\{flex:0 0 auto\}\n  \}\n', CSS, s, 1)
    if 'blog-filter' not in s.split('</main>')[1]:
        s = s.replace('</main>\n', '</main>\n\n' + SCRIPT, 1)
    path.write_text(s, encoding='utf-8')
    print(cfg['file'], {c: sum(1 for p in posts if p[0] == c) for c, *_ in cfg['sections']})


for lang in CATS:
    regroup(lang)
