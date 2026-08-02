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
        "after_canonical": True,
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

LANG_CSS = """
  .lang-switch{display:inline-flex;gap:12px;align-items:center;margin-left:16px;font-size:13px}
  .lang-switch a{color:inherit;text-decoration:none;opacity:.7;font-weight:500}
  .lang-switch a:hover,.lang-switch a[aria-current="page"]{opacity:1}
  footer .lang-switch a{color:rgba(255,255,255,.55)}
  footer .lang-switch a:hover{color:#fff}
"""


def hreflang_block(en, fi, it):
    return (
        f'<link rel="alternate" hreflang="en" href="{BASE}{en}">\n'
        f'<link rel="alternate" hreflang="fi-FI" href="{BASE}{fi}">\n'
        f'<link rel="alternate" hreflang="it-IT" href="{BASE}{it}">\n'
        f'<link rel="alternate" hreflang="x-default" href="{BASE}{en}">\n'
    )


def switcher(en, fi, it, footer=False):
    cur = ' aria-current="page"' if False else ""
    # EN page: English is current
    return (
        f'<nav class="lang-switch" aria-label="Language">'
        f'<a href="{en}" hreflang="en" lang="en" aria-current="page">English</a>'
        f'<a href="{fi}" hreflang="fi" lang="fi">Suomeksi</a>'
        f'<a href="{it}" hreflang="it" lang="it">Italiano</a>'
        f"</nav>"
    )


def inject(path: Path, en: str, fi: str, it: str) -> None:
    text = path.read_text(encoding="utf-8")
    if 'hreflang="fi-FI"' in text and "lang-switch" in text:
        print(f"skip (already done): {path.relative_to(ROOT)}")
        return

    # Remove old incomplete hreflang if any (none expected on these)
    hl = hreflang_block(en, fi, it)

    # Insert after canonical
    if 'hreflang="fi-FI"' not in text:
        text = re.sub(
            r'(<link rel="canonical" href="[^"]+">\s*)',
            r"\1" + hl,
            text,
            count=1,
        )

    # og:locale:alternate if og:locale present and alternates missing
    if 'property="og:locale"' in text and "og:locale:alternate" not in text:
        text = text.replace(
            '<meta property="og:locale" content="en_FI">',
            '<meta property="og:locale" content="en_FI">\n'
            '<meta property="og:locale:alternate" content="fi_FI">\n'
            '<meta property="og:locale:alternate" content="it_IT">',
            1,
        )

    # CSS
    if ".lang-switch{" not in text:
        text = text.replace("</style>", LANG_CSS + "</style>", 1)

    sw = switcher(en, fi, it)

    # Header: after nav-auth closing or before </div> of nav-links
    if "lang-switch" not in text.split("<footer>")[0]:
        # insert before closing of .nav-links
        text = re.sub(
            r"(<div class=\"nav-auth\">[\s\S]*?</div>\s*)(</div>\s*</nav>)",
            r"\1" + sw + "\n  \2",
            text,
            count=1,
        )

    # Footer: before closing f-links or after contact
    if text.count("lang-switch") < 2:
        # insert before </div> of f-links (last occurrence before footer socials often)
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

    path.write_text(text, encoding="utf-8", newline="\n")
    print(f"updated {path.relative_to(ROOT)}")


def main():
    for c in CLUSTERS:
        inject(ROOT / c["file"], c["en"], c["fi"], c["it"])


if __name__ == "__main__":
    main()
