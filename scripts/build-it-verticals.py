"""Builds the Italian industry pages (it/influencer-marketing-per-*.html) from the live EN pages.

The EN pages are the layout source (they carry hand edits the old generator no longer reproduces).
Page copy comes from vertical_content.py (the 'it' entries, paired field by field with 'en');
shared chrome (nav, CTA, Calendly, footer) is translated in CHROME below.
Run: python scripts/build-it-verticals.py
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from vertical_content import COMMON, NAMES, PAGES, REAL, SLUGS, VERTICALS  # noqa: E402

spec = importlib.util.spec_from_file_location('loc', ROOT / 'scripts' / 'localize-html.py')
loc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(loc)

BASE = 'https://www.promobeez.com'
CHROME = {
    'Sign up free<span data-growth-trial> — first 14 days on Growth included</span>.': 'Iscrizione gratuita<span data-growth-trial>, con i primi 14 giorni di Growth inclusi</span>.',
    'Reach local creators <em>in Helsinki</em>': 'Raggiungete i creator locali <em>a Milano</em>',
    "Not sure where to start? Let's talk!": 'Non sapete da dove iniziare? Parliamone!',
    'Prefer WhatsApp?<br>Message us': 'Preferite WhatsApp?<br>Scriveteci',
    'Promo': 'Promo', 'beez': 'beez',
    'For businesses': 'Per le attività', 'For creators': 'Per i creator', 'Blog': 'Blog', 'Awards': 'Awards',
    'Pricing': 'Prezzi', 'EN': 'IT', 'English': 'English', 'Suomeksi': 'Suomeksi', 'Log in': 'Accedi', 'Sign up →': 'Iscriviti →',
    '14 days of Growth free': '14 giorni di Growth gratis', 'Every new business starts on': 'Ogni nuova attività parte con',
    'Growth': 'Growth', '— then (almost) Free, Starter (€69) or Growth (€109)': ', poi (quasi) Free, Starter (69 €) o Growth (109 €)',
    'Create your account →': 'Create il vostro account →',
    '© 2026 Daring Spirit Oy · Made in Helsinki': '© 2026 Daring Spirit Oy · Made in Helsinki',
    'Home': 'Home', 'Privacy': 'Privacy', 'Terms': 'Termini', 'Contact': 'Contatti', 'Language': 'Lingua',
    'Schedule a call': 'Prenota una chiamata', 'WhatsApp contact': 'Contatto WhatsApp',
    'Instagram': 'Instagram', 'TikTok': 'TikTok', 'Facebook': 'Facebook', 'LinkedIn': 'LinkedIn', 'Threads': 'Threads',
    'Influencer marketing via barter collaborations': 'Influencer marketing con collaborazioni in barter',
    'Helsinki': 'Milano', 'Finland': 'Italy', 'EUR': 'EUR', 'en': 'it', 'Promobeez': 'Promobeez', 'Daring Spirit Oy': 'Daring Spirit Oy',
    '(almost) Free: one offer, three contact unlocks, refundable': '(quasi) Free: un\'offerta, tre sblocchi di contatto, rimborsabile',
    'Playbook': 'Guida operativa', 'Evidence': 'Evidenze', 'Guide': 'Guida', 'Research': 'Ricerca', 'Finland ': 'Italia',
    'Step 01': 'Passo 01', 'Step 02': 'Passo 02', 'Step 03': 'Passo 03',
    'Real offer': 'Offerta reale', 'Name hidden': 'Nome nascosto', 'Barter': 'Barter',
    'What you get': 'Cosa ricevi', 'Content in return': 'Contenuti in cambio', 'Who it is for': 'Per chi è',
    'Post an offer like this →': 'Pubblicate un\'offerta così →', 'Post your first offer →': 'Pubblicate la prima offerta →',
    'How it works': 'Come funziona', 'A real offer that worked': 'Un\'offerta reale che ha funzionato',
    'Read next': 'Da leggere', 'Frequently asked questions': 'Domande frequenti', 'How much does it cost?': 'Quanto costa?',
}
PACKS_OFF_EN = '(almost) Free is €15 once for one offer and three contact unlocks, refunded in one click if the offer gets fewer than three applications in 14 days. Starter is €69 a month and Growth €109 a month.'
PACKS_OFF_IT = '(quasi) Free costa 15 € una tantum per un\'offerta e tre sblocchi di contatto, rimborsati con un clic se l\'offerta riceve meno di tre candidature in 14 giorni. Starter costa 69 € al mese e Growth 109 € al mese.'
PACKS_EN = 'Basic is €15 a month and includes your first offer: 5 applications, all of them unlockable. After that you add application slots per offer and pay only for applications that arrive: 5 for €34, or 12 for €68 with 2 as a gift.'
PACKS_IT = 'Basic costa 15 € al mese e include la prima offerta: 5 candidature, tutte sbloccabili. Poi aggiungete posti per candidature su ogni offerta e pagate solo le candidature che arrivano: 5 a 34 € oppure 12 a 68 € con 2 in regalo.'
PRICE_EN = ('The campaign costs what your offer costs you. <span data-growth-trial>New businesses get 14 days of Growth free. After that: </span>'
            f'<span data-packs-off>{PACKS_OFF_EN}</span><span data-packs>{PACKS_EN}</span> No commission on collaborations while you are on a paid plan.')
PRICE_IT = ('La campagna costa quanto costa a voi la vostra offerta. <span data-growth-trial>Le nuove attività ricevono 14 giorni di Growth gratis. Poi: </span>'
            f'<span data-packs-off>{PACKS_OFF_IT}</span><span data-packs>{PACKS_IT}</span> Nessuna commissione sulle collaborazioni finché avete un piano a pagamento.')
CHROME.update({
    PACKS_OFF_EN: PACKS_OFF_IT, PACKS_EN: PACKS_IT, PRICE_EN: PRICE_IT,
    loc.re.sub(r'<[^>]+>', '', COMMON['en']['price_a']): loc.re.sub(r'<[^>]+>', '', COMMON['it']['price_a']),
})


def pairs(en, it):
    if isinstance(en, str):
        yield en, it
    elif isinstance(en, (list, tuple)):
        for a, b in zip(en, it):
            yield from pairs(a, b)
    elif isinstance(en, dict):
        for k in en:
            yield from pairs(en[k], it[k])


def build(v):
    src = SLUGS['en'][v] + '.html'
    tr = dict(CHROME)
    p_en, p_it = PAGES[('en', v)], PAGES[('it', v)]
    for a, b in pairs(p_en, p_it):
        tr[a] = b
    tr[p_en['title'].replace(' | Promobeez', '')] = p_it['title'].replace(' | Promobeez', '')
    r_en, r_it = REAL[('en', v)], REAL[('it', v)]
    for a, b in pairs(r_en, r_it):
        tr[a] = b
    tr[f'{COMMON["en"]["real_posted"]}: {r_en["posted"]}'] = f'{COMMON["it"]["real_posted"]}: {r_it["posted"]}'
    tr[COMMON['en']['real_lead'].format(cat=r_en['cat'])] = COMMON['it']['real_lead'].format(cat=r_it['cat'])
    for o in VERTICALS:
        tr[NAMES['en'][o]] = NAMES['it'][o]
    tr[f'For {NAMES["en"][v].lower()}'] = NAMES['it'][v]
    others = ' · '.join(f'<a href="/{SLUGS["en"][o]}">{NAMES["en"][o]}</a>' for o in VERTICALS if o != v)
    tr[f'Other industries: {others}'] = 'Altri settori: ' + others.replace('>' + '<', '><')
    for o in VERTICALS:
        tr[f'Other industries: {others}'] = tr[f'Other industries: {others}'].replace(f'>{NAMES["en"][o]}<', f'>{NAMES["it"][o]}<')
    tr[loc.re.sub(r'<[^>]+>', '', tr.get(f'Other industries: {others}', ''))] = ''
    # FAQ JSON-LD carries the plain-text price answer and plain FAQ answers
    out = f'it/{SLUGS["it"][v]}.html'
    head = (f'<link rel="canonical" href="{BASE}/{out[:-5]}">\n'
            f'<link rel="alternate" hreflang="en" href="{BASE}/{SLUGS["en"][v]}">\n'
            f'<link rel="alternate" hreflang="fi-FI" href="{BASE}/fi/{SLUGS["fi"][v]}">\n'
            f'<link rel="alternate" hreflang="it-IT" href="{BASE}/{out[:-5]}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{BASE}/{SLUGS["en"][v]}">')
    data = {'_meta': {'src': src, 'out': out, 'lang': 'it', 'urls': {}, 'head': head,
                      'switch': {'en': f'/{SLUGS["en"][v]}', 'fi': f'/fi/{SLUGS["fi"][v]}', 'it': f'/{out[:-5]}'},
                      'replace': [['"inLanguage": "it"', '"inLanguage": "it"']]}}
    for s in loc.segments((ROOT / src).read_text(encoding='utf-8')):
        data[s] = tr.get(s, '')
    mp = ROOT / 'content-it' / 'pages' / f'vertical-{v}.json'
    mp.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
    loc.apply(mp)


if __name__ == '__main__':
    for v in VERTICALS:
        build(v)
