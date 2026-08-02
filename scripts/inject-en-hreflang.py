# -*- coding: utf-8 -*-
"""Inject hreflang + language switcher into English twin pages. Do not alter article bodies beyond head/nav/footer chrome."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.promobeez.com"

CLUSTERS = [
    {
        "file": "for-businesses.html",
        "en": "/for-businesses",
        "fi": "/fi/yrityksille",
        "it": "/it/per-le-attivita",
    },
    {
        "file": "for-creators.html",
        "en": "/for-creators",
        "fi": "/fi/sisallontuottajille",
        "it": "/it/per-i-creator",
    },
    {
        "file": "blog.html",
        "en": "/blog",
        "fi": "/fi/blogi",
        "it": "/it/blog",
    },
    {
        "file": "blog/why-audiences-trust-small-creators-more-than-brands.html",
        "en": "/blog/why-audiences-trust-small-creators-more-than-brands",
        "fi": "/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin",
        "it": "/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator",
    },
    {
        "file": "blog/how-to-choose-a-local-creator.html",
        "en": "/blog/how-to-choose-a-local-creator",
        "fi": "/fi/blogi/miten-valita-paikallinen-sisallontuottaja",
        "it": "/it/blog/come-scegliere-un-creator-locale",
    },
    {
        "file": "about/andrey-shepelev.html",
        "en": "/about/andrey-shepelev",
        "fi": "/fi/tietoa/andrey-shepelev",
        "it": "/it/chi-siamo/andrey-shepelev",
    },
]

GLOBE = (
    '<svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" '
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true">'
    '<circle cx="12" cy="12" r="9"/>'
    '<path d="M3 12h18"/>'
    '<path d="M12 3a15 15 0 0 1 0 18"/>'
    '<path d="M12 3a15 15 0 0 0 0 18"/>'
    "</svg>"
)

LANG_CSS = """
  .lang-switch{position:relative;display:inline-block;font-size:13px;font-weight:600;z-index:1100}
  .lang-switch summary{
    list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
    color:var(--ink);opacity:.72;user-select:none;padding:6px 8px;border-radius:8px;
    transition:opacity .15s,background .15s;
  }
  .lang-switch summary::-webkit-details-marker{display:none}
  .lang-switch summary:hover,.lang-switch[open] summary{opacity:1;background:rgba(16,13,26,.05)}
  .lang-switch__code{letter-spacing:.06em;font-size:12px;font-weight:700;line-height:1}
  .lang-switch__menu{
    position:absolute;top:calc(100% + 8px);right:0;min-width:156px;
    background:#fff;border:1px solid rgba(16,13,26,.1);border-radius:12px;
    box-shadow:0 14px 36px rgba(16,13,26,.14);padding:6px;
    display:flex;flex-direction:column;gap:2px;
  }
  .lang-switch__menu a{
    text-decoration:none;color:var(--ink)!important;opacity:.75!important;
    padding:10px 12px;border-radius:8px;font-size:13px!important;font-weight:500!important;
    white-space:nowrap;display:block;
  }
  .lang-switch__menu a:hover{background:rgba(16,13,26,.05);opacity:1!important}
  .lang-switch__menu a[aria-current="page"]{opacity:1!important;color:var(--coral)!important;font-weight:600!important}
  footer .lang-switch summary{color:#fff;opacity:.55}
  footer .lang-switch summary:hover,footer .lang-switch[open] summary{opacity:1;background:rgba(255,255,255,.08)}
  footer .lang-switch__menu{
    top:auto;bottom:calc(100% + 8px);
    background:#16131f;border-color:rgba(255,255,255,.1);
    box-shadow:0 -14px 36px rgba(0,0,0,.35);
  }
  footer .lang-switch__menu a{color:#fff!important;opacity:.7!important}
  footer .lang-switch__menu a:hover{background:rgba(255,255,255,.08);opacity:1!important}
  footer .lang-switch__menu a[aria-current="page"]{color:#FF9E1B!important;opacity:1!important}
"""

CLOSE_SCRIPT = """
<script>
(function(){
  document.addEventListener('click',function(e){
    document.querySelectorAll('details.lang-switch[open]').forEach(function(d){
      if(!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();
</script>
"""


def hreflang_block(en, fi, it):
    return (
        f'<link rel="alternate" hreflang="en" href="{BASE}{en}">\n'
        f'<link rel="alternate" hreflang="fi-FI" href="{BASE}{fi}">\n'
        f'<link rel="alternate" hreflang="it-IT" href="{BASE}{it}">\n'
        f'<link rel="alternate" hreflang="x-default" href="{BASE}{en}">\n'
    )


def switcher(en, fi, it, code="EN", aria="Language"):
    # details/summary — never <nav>: page CSS styles all `nav` as the fixed site header.
    return (
        f'<details class="lang-switch">'
        f'<summary aria-label="{aria}">{GLOBE}<span class="lang-switch__code">{code}</span></summary>'
        f'<div class="lang-switch__menu" role="list">'
        f'<a href="{en}" hreflang="en" lang="en" aria-current="page">English</a>'
        f'<a href="{fi}" hreflang="fi" lang="fi">Suomeksi</a>'
        f'<a href="{it}" hreflang="it" lang="it">Italiano</a>'
        f"</div></details>"
    )


def inject(path: Path, en: str, fi: str, it: str) -> None:
    text = path.read_text(encoding="utf-8")
    if 'hreflang="fi-FI"' in text and "lang-switch__globe" in text:
        print(f"skip (already done): {path.relative_to(ROOT)}")
        return

    hl = hreflang_block(en, fi, it)

    if 'hreflang="fi-FI"' not in text:
        text = re.sub(
            r'(<link rel="canonical" href="[^"]+">\s*)',
            r"\1" + hl,
            text,
            count=1,
        )

    if 'property="og:locale"' in text and "og:locale:alternate" not in text:
        text = text.replace(
            '<meta property="og:locale" content="en_FI">',
            '<meta property="og:locale" content="en_FI">\n'
            '<meta property="og:locale:alternate" content="fi_FI">\n'
            '<meta property="og:locale:alternate" content="it_IT">',
            1,
        )

    if ".lang-switch__globe" not in text and ".lang-switch{" not in text:
        text = text.replace("</style>", LANG_CSS + "</style>", 1)

    text = text.replace(
        ".nav-links a:not(.nav-cta):not(.nav-login){display:none}",
        ".nav-links>a{display:none}",
    )

    sw = switcher(en, fi, it)

    if "lang-switch" not in text.split("<footer>")[0]:
        text = re.sub(
            r'(<div class="nav-auth">)',
            sw + "\n    " + r"\1",
            text,
            count=1,
        )

    if text.count("lang-switch__globe") < 2:
        footer_sw = switcher(en, fi, it)
        if 'class="f-links"' in text:
            text = re.sub(
                r'(<div class="f-links">)',
                r"\1\n    " + footer_sw,
                text,
                count=1,
            )
        else:
            text = text.replace("</footer>", "  " + footer_sw + "\n</footer>", 1)

    if "details.lang-switch[open]" not in text:
        text = text.replace("</body>", CLOSE_SCRIPT + "</body>", 1)

    path.write_text(text, encoding="utf-8", newline="\n")
    print(f"updated {path.relative_to(ROOT)}")


def main():
    for c in CLUSTERS:
        inject(ROOT / c["file"], c["en"], c["fi"], c["it"])


if __name__ == "__main__":
    main()
