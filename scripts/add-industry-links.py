"""Adds the "By industry" link block and keyword titles to the home and business pages (EN + FI).

Idempotent: re-running replaces the block instead of adding a second one.
Run after build-vertical-pages.py: python scripts/add-industry-links.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vertical_content import NAMES, SLUGS, VERTICALS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

TITLES = {
    'index.html': 'Promobeez: influencer marketing for local businesses in Finland',
    'for-businesses.html': 'Influencer marketing for small businesses, paid in barter | Promobeez',
    'fi/index.html': 'Promobeez: vaikuttajamarkkinointia paikallisille yrityksille',
    'fi/yrityksille.html': 'Vaikuttajamarkkinointi pienyritykselle vaihtokaupalla | Promobeez',
}

# where the block goes: before this marker
ANCHORS = {
    'index.html': '<section class="next-up"',
    'fi/index.html': '<section class="next-up"',
    'for-businesses.html': '<section class="read-before"',
    'fi/yrityksille.html': '<section class="read-before"',
}

COPY = {
    'en': {
        'h': 'Built for your kind of business',
        'lead': 'What to offer, what to ask for and how to measure it, for each type of local business.',
        'desc': {'restaurants': 'A dinner for a reel', 'cafes': 'Coffee and cake for stories', 'salons': 'A treatment for a before-and-after', 'gyms': 'A trial week for a workout video'},
        'guides': 'Guides',
        'links': [('/blog/how-to-promote-a-restaurant-in-helsinki', 'Promote a restaurant in Helsinki'), ('/blog/how-to-choose-a-local-creator', 'Choose a local creator'), ('/blog/influencer-marketing-disclosure-finland', 'Ad labels in Finland')],
    },
    'fi': {
        'h': 'Tehty juuri sinun alallesi',
        'lead': 'Mitä tarjota, mitä pyytää ja miten mitata, jokaiselle paikalliselle toimialalle.',
        'desc': {'restaurants': 'Illallinen reelsiä vastaan', 'cafes': 'Kahvit ja kakut storyja vastaan', 'salons': 'Hoito ennen-jälkeen-videota vastaan', 'gyms': 'Kokeiluviikko treenivideota vastaan'},
        'guides': 'Oppaat',
        'links': [('/fi/blogi/ravintolan-markkinointi-helsingissa', 'Ravintolan markkinointi Helsingissä'), ('/fi/blogi/miten-valita-paikallinen-sisallontuottaja', 'Miten valita sisällöntuottaja'), ('/fi/blogi/vaikuttajamarkkinoinnin-merkinta', 'Mainosmerkinnät Suomessa')],
    },
}

CSS = """
  /* industry links block (scripts/add-industry-links.py) */
  .industries{padding:72px 0}
  .industries .ind-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:28px}
  .industries .ind-card{display:flex;flex-direction:column;gap:6px;padding:22px;border:1px solid rgba(16,13,26,.1);border-radius:14px;background:#fff;text-decoration:none;color:var(--ink);transition:border-color .2s,transform .2s}
  .industries .ind-card:hover{border-color:var(--coral);transform:translateY(-2px)}
  .industries .ind-name{font-family:'Clash Display',sans-serif;font-weight:600;font-size:19px;line-height:1.25}
  .industries .ind-desc{font-size:14px;color:var(--gray)}
  .industries .ind-go{margin-top:auto;padding-top:8px;font-size:14px;font-weight:600;color:var(--coral)}
  .industries .ind-more{margin-top:22px;font-size:15px;color:var(--gray)}
  .industries .ind-more a{color:var(--ink);font-weight:600}
  @media(max-width:900px){.industries .ind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:520px){.industries .ind-grid{grid-template-columns:1fr}}
"""


def block(lang):
    c = COPY[lang]
    cards = '\n'.join(
        f'      <a class="ind-card" href="{("/" if lang == "en" else "/fi/") + SLUGS[lang][v]}"><span class="ind-name">{NAMES[lang][v]}</span>'
        f'<span class="ind-desc">{c["desc"][v]}</span><span class="ind-go" aria-hidden="true">→</span></a>'
        for v in VERTICALS)
    links = ' · '.join(f'<a href="{h}">{t}</a>' for h, t in c['links'])
    return f'''<section class="industries" aria-labelledby="industries-h">
  <div class="wrap">
    <h2 class="h2" id="industries-h">{c["h"]}</h2>
    <p class="lead">{c["lead"]}</p>
    <div class="ind-grid">
{cards}
    </div>
    <p class="ind-more">{c["guides"]}: {links}</p>
  </div>
</section>

'''


def patch(rel):
    lang = 'fi' if rel.startswith('fi/') else 'en'
    p = ROOT / rel
    s = p.read_text(encoding='utf-8')
    t = TITLES[rel]
    s = re.sub(r'<title>[^<]*</title>', f'<title>{t}</title>', s, 1)
    for prop in ('property="og:title"', 'name="twitter:title"'):
        s = re.sub(rf'<meta {prop} content="[^"]*">', f'<meta {prop} content="{t.replace(" | Promobeez", "")}">', s, 1)
    s = re.sub(r'<section class="industries"[\s\S]*?</section>\n\n', '', s)
    s = s.replace(ANCHORS[rel], block(lang) + ANCHORS[rel], 1)
    if '.industries{' not in s:
        s = s.replace('</style>', CSS + '</style>', 1)
    p.write_text(s, encoding='utf-8')
    print(rel, 'ok')


for rel in TITLES:
    patch(rel)
