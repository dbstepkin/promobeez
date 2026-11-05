"""Points the EN and FI pages at their Italian versions: it-IT hreflang link and an "Italiano" entry
in the language switcher. Idempotent. Run after building the IT pages:
  python scripts/add-it-alternates.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://www.promobeez.com'

# (source file, IT path, add hreflang?) -- hreflang only where the IT page is a real translation
PAGES = [
    ('index.html', '/it', True), ('fi/index.html', '/it', True),
    ('privacy.html', '/it/privacy', True), ('terms.html', '/it/termini', True), ('restaurant-pilot.html', '/it/pilota-ristoranti', True),
    ('promobeez-smm-awards.html', '/it/promobeez-smm-awards', True), ('fi/promobeez-smm-awards.html', '/it/promobeez-smm-awards', True),
    ('influencer-marketing-for-restaurants.html', '/it/influencer-marketing-per-ristoranti', True),
    ('fi/vaikuttajamarkkinointi-ravintolalle.html', '/it/influencer-marketing-per-ristoranti', True),
    ('influencer-marketing-for-cafes.html', '/it/influencer-marketing-per-bar-e-caffetterie', True),
    ('fi/vaikuttajamarkkinointi-kahvilalle.html', '/it/influencer-marketing-per-bar-e-caffetterie', True),
    ('influencer-marketing-for-salons.html', '/it/influencer-marketing-per-saloni', True),
    ('fi/vaikuttajamarkkinointi-kampaamolle.html', '/it/influencer-marketing-per-saloni', True),
    ('influencer-marketing-for-gyms.html', '/it/influencer-marketing-per-palestre', True),
    ('fi/vaikuttajamarkkinointi-kuntosalille.html', '/it/influencer-marketing-per-palestre', True),
    ('blog/best-restaurant-social-media-helsinki-q3-2026.html', '/it/blog/miglior-social-ristoranti-helsinki-q3-2026', True),
    ('fi/blogi/helsingin-paras-ravintola-some-q3-2026.html', '/it/blog/miglior-social-ristoranti-helsinki-q3-2026', True),
    ('blog/influencer-marketing-disclosure-finland.html', '/it/blog/pubblicita-influencer-regole-italia', True),
    ('fi/blogi/vaikuttajamarkkinoinnin-merkinta.html', '/it/blog/pubblicita-influencer-regole-italia', True),
    ('blog/promobeez-vs-vaiku.html', '/it/blog/promobeez-vs-vaiku', True), ('fi/blogi/promobeez-vs-vaiku.html', '/it/blog/promobeez-vs-vaiku', True),
    ('blog/promobeez-vs-castersapp.html', '/it/blog/promobeez-vs-castersapp', True), ('fi/blogi/promobeez-vs-castersapp.html', '/it/blog/promobeez-vs-castersapp', True),
    ('blog/promobeez-vs-invited-agency.html', '/it/blog/promobeez-vs-invited-agency', True), ('fi/blogi/promobeez-vs-invited.html', '/it/blog/promobeez-vs-invited-agency', True),
    # Helsinki guide: the Italian counterpart is the Milan guide (switcher only, no hreflang pair)
    ('blog/how-to-promote-a-restaurant-in-helsinki.html', '/it/blog/come-promuovere-un-ristorante-a-milano', False),
    ('fi/blogi/ravintolan-markkinointi-helsingissa.html', '/it/blog/come-promuovere-un-ristorante-a-milano', False),
]


def fix(rel, it, alt):
    p = ROOT / rel
    html = p.read_text(encoding='utf-8')
    before = html
    if alt and 'hreflang="it' not in html.split('</head>')[0]:
        tag = f'<link rel="alternate" hreflang="it-IT" href="{BASE}{it}">'
        m = re.search(r'<link rel="alternate" hreflang="x-default"[^>]*>', html)
        if m:
            html = html[:m.start()] + tag + '\n' + html[m.start():]
        else:
            html = html.replace('</head>', tag + '\n</head>', 1)

    def menu(m):
        block = m.group(0)
        if 'hreflang="it"' in block:
            return re.sub(r'<a href="[^"]*" hreflang="it"', f'<a href="{it}" hreflang="it"', block)
        return block.replace('</div>', f'<a href="{it}" hreflang="it" lang="it">Italiano</a></div>', 1)
    html = re.sub(r'<div class="lang-switch__menu" role="list">[\s\S]*?</div>', menu, html)
    if 'lang-switch' in html and 'lang-pref.js' not in html:
        html = html.replace('</body>', '<script src="/assets/lang-pref.js" defer></script>\n</body>', 1)
    if html != before:
        p.write_text(html, encoding='utf-8')
        print('updated', rel)


if __name__ == '__main__':
    for rel, it, alt in PAGES:
        fix(rel, it, alt)
