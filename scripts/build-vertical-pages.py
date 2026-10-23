"""Builds the industry landing pages (restaurants, cafés, salons, gyms) in EN and FI.

Shell (head scripts, CSS, icon sprite, nav, CTA, Calendly, footer) comes from for-businesses.html and
fi/yrityksille.html, so design and tracking stay identical. Copy lives in vertical_content.py.
Run: python scripts/build-vertical-pages.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vertical_content import COMMON, NAMES, PAGES, REAL, SLUGS, VERTICALS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://www.promobeez.com'
TEMPLATES = {'en': 'for-businesses.html', 'fi': 'fi/yrityksille.html'}
SIGNUP = 'https://my.promobeez.com/auth/register?role=brand'


def url(lang, v):
    return f'/{SLUGS[lang][v]}' if lang == 'en' else f'/fi/{SLUGS[lang][v]}'


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)


def attr(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')


def lang_switch(lang, v):
    code = lang.upper()
    label = 'Language' if lang == 'en' else 'Kieli'
    cur = lambda l: ' aria-current="page"' if l == lang else ''
    return (f'<details class="lang-switch"><summary aria-label="{label}"><svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg><span class="lang-switch__code">{code}</span></summary>'
            f'<div class="lang-switch__menu" role="list"><a href="{url("en", v)}" hreflang="en" lang="en"{cur("en")}>English</a><a href="{url("fi", v)}" hreflang="fi" lang="fi"{cur("fi")}>Suomeksi</a></div></details>')


def head(tpl, lang, v, p):
    h = tpl[:tpl.index('</style>') + len('</style>')]
    canon = BASE + url(lang, v)
    h = re.sub(r'<title>[\s\S]*?</title>', f'<title>{p["title"]}</title>', h, 1)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{attr(p["desc"])}">', h, 1)
    h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{canon}">', h, 1)
    alts = (f'<link rel="alternate" hreflang="en" href="{BASE}{url("en", v)}">\n'
            f'<link rel="alternate" hreflang="fi-FI" href="{BASE}{url("fi", v)}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{BASE}{url("en", v)}">\n')
    h = re.sub(r'(<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n)+', alts, h, 1)
    h = re.sub(r'<meta property="og:locale:alternate" content="it_IT">\n', '', h)
    og_title = p['title'].replace(' | Promobeez', '')
    h = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{canon}">', h, 1)
    h = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{attr(og_title)}">', h, 1)
    h = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{attr(p["desc"])}">', h, 1)
    h = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{attr(og_title)}">', h, 1)
    h = re.sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{attr(p["desc"])}">', h, 1)

    c = COMMON[lang]
    faq = [(c['price_q'], strip_tags(c['price_a']))] + list(p['faq'])
    ld = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Service',
                '@id': f'{canon}#service',
                'name': og_title,
                'serviceType': 'Influencer marketing via barter collaborations',
                'description': p['desc'],
                'audience': {'@type': 'BusinessAudience', 'name': NAMES[lang][v]},
                'provider': {'@id': f'{BASE}/#organization'},
                'areaServed': [{'@type': 'City', 'name': 'Helsinki'}, {'@type': 'Country', 'name': 'Finland'}],
                'offers': {'@type': 'Offer', 'price': '15', 'priceCurrency': 'EUR', 'description': '(almost) Free: one offer, three contact unlocks, refundable'},
                'url': canon,
                'inLanguage': lang,
            },
            {
                '@type': 'Organization',
                '@id': f'{BASE}/#organization',
                'name': 'Promobeez',
                'legalName': 'Daring Spirit Oy',
                'url': f'{BASE}/',
                'logo': {'@type': 'ImageObject', 'url': f'{BASE}/assets/logo-transparent.png', 'width': 512, 'height': 512},
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': c['crumb_home'], 'item': f'{BASE}/' if lang == 'en' else f'{BASE}/fi'},
                    {'@type': 'ListItem', 'position': 2, 'name': c['crumb_biz'], 'item': BASE + c['biz_path']},
                    {'@type': 'ListItem', 'position': 3, 'name': NAMES[lang][v]},
                ],
            },
            {
                '@type': 'FAQPage',
                'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq],
            },
        ],
    }
    h = re.sub(r'<script type="application/ld\+json"[^>]*>[\s\S]*?</script>',
               '<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>', h, 1)
    return h


def cards(items):
    return '\n'.join(f'      <div class="bcard"><div class="ic"><svg><use href="#{i}"/></svg></div><h3>{t}</h3><p>{d}</p></div>' for i, t, d in items)


def body(tpl, lang, v, p):
    c = COMMON[lang]
    # icon sprite + top nav; the template's extra stylesheets (creator search, analysis, collab example) are not needed
    sprite_and_nav = tpl[tpl.index('<svg class="pb-icons"'):tpl.index('</nav>') + len('</nav>')]
    sprite_and_nav = re.sub(r'<details class="lang-switch">[\s\S]*?</details>', lang_switch(lang, v), sprite_and_nav, 1)
    hero_note = re.search(r'<p class="hero-note">[\s\S]*?</p>', tpl).group(0)
    cta = re.search(r'<section class="cta">[\s\S]*?</section>', tpl).group(0)
    calendly = re.search(r'<section class="calendly-sec"[\s\S]*?</section>', tpl).group(0)
    footer = re.search(r'<footer>[\s\S]*?</footer>', tpl).group(0)
    footer = re.sub(r'<details class="lang-switch">[\s\S]*?</details>', lang_switch(lang, v), footer, 1)
    tail = tpl[tpl.index('</footer>') + len('</footer>'):]
    tail = re.sub(r'<script defer src="[^"]*business-creator-analysis\.js"></script>\n?', '', tail)

    eyebrow = f'{c["eyebrow_prefix"]} {NAMES[lang][v].lower()}'.strip() if lang == 'en' else NAMES[lang][v]
    steps = '\n'.join(
        f'      <div class="step"><div class="n">{c["step"]} 0{n}</div><h3>{t}</h3><p>{d}</p><span class="ghost" aria-hidden="true">0{n}</span></div>'
        for n, (t, d) in enumerate(p['steps'], 1))
    reads = '\n'.join(
        f'      <a class="read-card" href="{href}">\n        <div class="eyebrow">{tag}</div>\n        <h3>{title}</h3>\n      </a>'
        for href, tag, title in p['read'])
    others = ' · '.join(f'<a href="{url(lang, o)}">{NAMES[lang][o]}</a>' for o in VERTICALS if o != v)
    r = REAL[(lang, v)]
    real = cards([('i-gift', c['real_gave'], r['gave']), ('i-camera', c['real_asked'], r['asked']), ('i-check', c['real_why'], r['why'])])
    faq = [(c['price_q'], c['price_a'])] + list(p['faq'])
    faq_html = '\n'.join(f'    <details>\n      <summary>{q}</summary>\n      <p>{a}</p>\n    </details>' for q, a in faq)

    return f'''
</head>
<body>
{sprite_and_nav.strip()}

<header class="hero">
  <div class="mesh"><span class="m1"></span><span class="m2"></span><span class="m3"></span><span class="m4"></span></div>
  <div class="hero-inner">
    <div class="eyebrow">{eyebrow}</div>
    <h1>{p["h1"]}</h1>
    <p>{p["lede"]}</p>
    <a class="btn btn-coral" href="{SIGNUP}">{c["cta_btn"]}</a>
    {hero_note}
  </div>
</header>

<section class="benefits">
  <div class="wrap">
    <h2 class="h2">{p["why_h"]}</h2>
    <p class="lead">{p["why_lead"]}</p>
    <div class="bgrid bgrid--2">
{cards(p["why"])}
    </div>
  </div>
</section>

<section class="benefits">
  <div class="wrap">
    <h2 class="h2">{c["offers_h"]}</h2>
    <p class="lead">{c["offers_lead"]}</p>
    <div class="bgrid bgrid--2">
{cards(p["offers"])}
    </div>
  </div>
</section>

<section class="steps-sec">
  <div class="wrap">
    <h2 class="h2">{c["steps_h"]}</h2>
    <div class="steps">
{steps}
    </div>
  </div>
</section>

<section class="benefits">
  <div class="wrap">
    <h2 class="h2">{c["real_h"]}</h2>
    <p class="lead">{c["real_lead"].format(cat=r["cat"])}</p>
    <div class="real-offer"><div class="eyebrow">{r["where"]}</div><h3>&ldquo;{r["title"]}&rdquo;</h3></div>
    <div class="bgrid">
{real}
    </div>
  </div>
</section>

{cta}

{calendly}

<section class="read-before" aria-label="{c["read_h"]}">
  <div class="wrap">
    <h2>{c["read_h"]}</h2>
    <div class="read-grid">
{reads}
    </div>
    <p class="lead vertical-others">{c["other_h"]}: {others}</p>
  </div>
</section>

<section class="faq">
  <div class="wrap" style="max-width:820px">
    <h2 class="h2">{c["faq_h"]}</h2>
{faq_html}
  </div>
</section>

{footer}{tail}'''


def build(lang, v):
    tpl = (ROOT / TEMPLATES[lang]).read_text(encoding='utf-8')
    p = PAGES[(lang, v)]
    h = head(tpl, lang, v, p)
    h = h.replace('</style>', '  .bgrid--2{grid-template-columns:repeat(2,1fr)}\n  @media(max-width:860px){.bgrid--2{grid-template-columns:1fr}}\n  .real-offer{margin:22px 0 22px}\n  .real-offer .eyebrow{color:var(--coral);margin-bottom:6px}\n  .real-offer h3{font-size:26px}\n  .vertical-others{margin-top:28px;font-size:15px}\n  .vertical-others a{color:var(--coral);font-weight:600;text-decoration:none}\n</style>', 1)
    out = (ROOT / (SLUGS[lang][v] + '.html')) if lang == 'en' else (ROOT / 'fi' / (SLUGS[lang][v] + '.html'))
    out.write_text(h + body(tpl, lang, v, p), encoding='utf-8')
    return out.relative_to(ROOT).as_posix()


if __name__ == '__main__':
    for lang in ('en', 'fi'):
        for v in VERTICALS:
            print(build(lang, v))
