# -*- coding: utf-8 -*-
"""Stagger blog article publish dates across locales."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Today = 2026-08-02
# Trust: -10d, How-to: -5d, Disclosure: today
TRUST = {
    "iso": "2026-07-23T09:00:00+03:00",
    "day": "2026-07-23",
    "en": "23 July 2026",
    "fi": "23.7.2026",
    "fi_long": "23. heinäkuuta 2026",
    "it": "23 luglio 2026",
}
HOWTO = {
    "iso": "2026-07-28T09:00:00+03:00",
    "day": "2026-07-28",
    "en": "28 July 2026",
    "fi": "28.7.2026",
    "fi_long": "28. heinäkuuta 2026",
    "it": "28 luglio 2026",
}
DISC = {
    "iso": "2026-08-02T14:00:00+03:00",
    "day": "2026-08-02",
    "en": "2 August 2026",
    "fi": "2.8.2026",
    "fi_long": "2. elokuuta 2026",
    "it": "2 agosto 2026",
}


def replace_all(path: Path, pairs: list[tuple[str, str]]) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    for a, b in pairs:
        text = text.replace(a, b)
    if text != orig:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


changed = []

# --- Trust articles (EN/FI/IT) ---
trust_files = [
    ROOT / "blog/why-audiences-trust-small-creators-more-than-brands.html",
    ROOT / "fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin.html",
    ROOT / "it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator.html",
]
for path in trust_files:
    pairs = [
        ("2026-07-30T09:00:00+03:00", TRUST["iso"]),
        ("2026-08-02T14:00:00+03:00", TRUST["iso"]),  # drop "updated today" → same as published
        ("30 July 2026", TRUST["en"]),
        ("2 August 2026", TRUST["en"]),
        ("30.7.2026", TRUST["fi"]),
        ("2.8.2026", TRUST["fi"]),
        ("30 luglio 2026", TRUST["it"]),
        ("2 agosto 2026", TRUST["it"]),
    ]
    if replace_all(path, pairs):
        changed.append(path.relative_to(ROOT).as_posix())

# --- How-to articles ---
howto_files = [
    ROOT / "blog/how-to-choose-a-local-creator.html",
    ROOT / "fi/blogi/miten-valita-paikallinen-sisallontuottaja.html",
    ROOT / "it/blog/come-scegliere-un-creator-locale.html",
]
for path in howto_files:
    pairs = [
        ("2026-07-30T09:00:00+03:00", HOWTO["iso"]),
        ("2026-08-02T14:00:00+03:00", HOWTO["iso"]),
        ("30 July 2026", HOWTO["en"]),
        ("2 August 2026", HOWTO["en"]),
        ("30.7.2026", HOWTO["fi"]),
        ("2.8.2026", HOWTO["fi"]),
        ("30 luglio 2026", HOWTO["it"]),
        ("2 agosto 2026", HOWTO["it"]),
    ]
    if replace_all(path, pairs):
        changed.append(path.relative_to(ROOT).as_posix())

# Disclosure already today — ensure published/modified stay DISC (no change needed for iso).
# Still normalize any leftover if needed.

# --- Blog indexes: update dates + reorder newest first ---
# EN blog.html
blog = ROOT / "blog.html"
text = blog.read_text(encoding="utf-8")
# Replace dates in place first for each card section carefully via markers
text = text.replace(
    '<time datetime="2026-07-30">30 July 2026</time>\n      <span>15 min read</span>',
    f'<time datetime="{TRUST["day"]}">{TRUST["en"]}</time>\n      <span>15 min read</span>',
)
text = text.replace(
    '<time datetime="2026-07-30">30 July 2026</time>\n      <span>12 min read</span>',
    f'<time datetime="{HOWTO["day"]}">{HOWTO["en"]}</time>\n      <span>12 min read</span>',
)
# disclosure already Aug 2
# Reorder cards: extract three articles
import re

main = re.search(r'(<main class="posts">)(.*?)(</main>)', text, re.S)
if main:
    body = main.group(2)
    cards = re.findall(r'\n  <article class="post-card".*?</article>', body, re.S)
    if len(cards) == 3:
        # identify by href
        by = {}
        for c in cards:
            if "influencer-marketing-disclosure" in c:
                by["disc"] = c
            elif "how-to-choose" in c:
                by["howto"] = c
            elif "why-audiences-trust" in c:
                by["trust"] = c
        if len(by) == 3:
            # newest first: disc, howto, trust — first card no margin, rest margin-top
            def fix_margin(card: str, first: bool) -> str:
                if first:
                    return re.sub(
                        r'<article class="post-card"[^>]*>',
                        '<article class="post-card">',
                        card,
                        count=1,
                    )
                if 'style="margin-top:48px"' in card:
                    return card
                return card.replace(
                    '<article class="post-card">',
                    '<article class="post-card" style="margin-top:48px">',
                    1,
                )

            new_body = (
                fix_margin(by["disc"], True)
                + fix_margin(by["howto"], False)
                + fix_margin(by["trust"], False)
                + "\n"
            )
            text = text[: main.start(2)] + new_body + text[main.end(2) :]
# Fix ItemList order in EN blog JSON-LD
old_list = '''      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.promobeez.com/blog/why-audiences-trust-small-creators-more-than-brands",
          "name": "Why audiences trust small creators more than brand ads"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://www.promobeez.com/blog/how-to-choose-a-local-creator",
          "name": "How to choose a local creator for your business"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://www.promobeez.com/blog/influencer-marketing-disclosure-finland",
          "name": "Influencer marketing disclosure in Finland: KKV guidance"
        }
      ]'''
new_list = '''      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.promobeez.com/blog/influencer-marketing-disclosure-finland",
          "name": "Influencer marketing disclosure in Finland: KKV guidance"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://www.promobeez.com/blog/how-to-choose-a-local-creator",
          "name": "How to choose a local creator for your business"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://www.promobeez.com/blog/why-audiences-trust-small-creators-more-than-brands",
          "name": "Why audiences trust small creators more than brand ads"
        }
      ]'''
if old_list in text:
    text = text.replace(old_list, new_list)
blog.write_text(text, encoding="utf-8", newline="\n")
changed.append("blog.html")

# FI blogi
fi_blog = ROOT / "fi/blogi.html"
text = fi_blog.read_text(encoding="utf-8")
text = text.replace(
    '<div class="post-meta"><time datetime="2026-07-30">30.7.2026</time><span>15 min lukuaika · Tutkimuskatsaus · Andrey Shepelev</span></div>',
    f'<div class="post-meta"><time datetime="{TRUST["day"]}">{TRUST["fi"]}</time><span>15 min lukuaika · Tutkimuskatsaus · Andrey Shepelev</span></div>',
)
text = text.replace(
    '<div class="post-meta"><time datetime="2026-07-30">30.7.2026</time><span>12 min lukuaika · Opas · Andrey Shepelev</span></div>',
    f'<div class="post-meta"><time datetime="{HOWTO["day"]}">{HOWTO["fi"]}</time><span>12 min lukuaika · Opas · Andrey Shepelev</span></div>',
)
main = re.search(r'(<main class="posts">)(.*?)(</main>)', text, re.S)
if main:
    body = main.group(2)
    cards = re.findall(r'\n  <article class="post-card".*?</article>', body, re.S)
    by = {}
    for c in cards:
        if "vaikuttajamarkkinoinnin-merkinta" in c:
            by["disc"] = c
        elif "miten-valita" in c:
            by["howto"] = c
        elif "miksi-yleiso" in c:
            by["trust"] = c
    if len(by) == 3:

        def fix_margin(card: str, first: bool) -> str:
            if first:
                return re.sub(
                    r'<article class="post-card"[^>]*>',
                    '<article class="post-card">',
                    card,
                    count=1,
                )
            if 'style="margin-top:48px"' in card:
                return card
            return card.replace(
                '<article class="post-card">',
                '<article class="post-card" style="margin-top:48px">',
                1,
            )

        new_body = (
            fix_margin(by["disc"], True)
            + fix_margin(by["howto"], False)
            + fix_margin(by["trust"], False)
            + "\n"
        )
        text = text[: main.start(2)] + new_body + text[main.end(2) :]
old_list = '''      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.promobeez.com/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin",
          "name": "Miksi yleisö luottaa pieniin sisällöntuottajiin enemmän kuin brändin mainoksiin"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://www.promobeez.com/fi/blogi/miten-valita-paikallinen-sisallontuottaja",
          "name": "Miten valita paikallinen sisällöntuottaja yrityksellesi"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://www.promobeez.com/blog/vaikuttajamarkkinoinnin-merkinta",
          "name": "Vaikuttajamarkkinoinnin merkintä: KKV:n ohjeet"
        }
      ]'''
new_list = '''      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.promobeez.com/blog/vaikuttajamarkkinoinnin-merkinta",
          "name": "Vaikuttajamarkkinoinnin merkintä: KKV:n ohjeet"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://www.promobeez.com/fi/blogi/miten-valita-paikallinen-sisallontuottaja",
          "name": "Miten valita paikallinen sisällöntuottaja yrityksellesi"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://www.promobeez.com/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin",
          "name": "Miksi yleisö luottaa pieniin sisällöntuottajiin enemmän kuin brändin mainoksiin"
        }
      ]'''
if old_list in text:
    text = text.replace(old_list, new_list)
fi_blog.write_text(text, encoding="utf-8", newline="\n")
changed.append("fi/blogi.html")

# IT blog — 2 articles only
it_blog = ROOT / "it/blog.html"
text = it_blog.read_text(encoding="utf-8")
text = text.replace(
    '<div class="post-meta"><time datetime="2026-07-30">30 luglio 2026</time><span>15 min di lettura · Rassegna delle evidenze · Andrey Shepelev</span></div>',
    f'<div class="post-meta"><time datetime="{TRUST["day"]}">{TRUST["it"]}</time><span>15 min di lettura · Rassegna delle evidenze · Andrey Shepelev</span></div>',
)
text = text.replace(
    '<div class="post-meta"><time datetime="2026-07-30">30 luglio 2026</time><span>12 min di lettura · Guida operativa · Andrey Shepelev</span></div>',
    f'<div class="post-meta"><time datetime="{HOWTO["day"]}">{HOWTO["it"]}</time><span>12 min di lettura · Guida operativa · Andrey Shepelev</span></div>',
)
main = re.search(r'(<main class="posts">)(.*?)(</main>)', text, re.S)
if main:
    body = main.group(2)
    cards = re.findall(r'\n  <article class="post-card".*?</article>', body, re.S)
    by = {}
    for c in cards:
        if "come-scegliere" in c:
            by["howto"] = c
        elif "perche-il-pubblico" in c:
            by["trust"] = c
    if len(by) == 2:

        def fix_margin(card: str, first: bool) -> str:
            if first:
                return re.sub(
                    r'<article class="post-card"[^>]*>',
                    '<article class="post-card">',
                    card,
                    count=1,
                )
            if 'style="margin-top:48px"' in card:
                return card
            return card.replace(
                '<article class="post-card">',
                '<article class="post-card" style="margin-top:48px">',
                1,
            )

        new_body = fix_margin(by["howto"], True) + fix_margin(by["trust"], False) + "\n"
        text = text[: main.start(2)] + new_body + text[main.end(2) :]
# IT itemlist if present
text2 = text
# try swap positions in JSON-LD
text2 = text2.replace(
    '"url": "https://www.promobeez.com/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator"',
    '"url": "https://www.promobeez.com/it/blog/COME_TMP"',
)
text2 = text2.replace(
    '"url": "https://www.promobeez.com/it/blog/come-scegliere-un-creator-locale"',
    '"url": "https://www.promobeez.com/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator"',
)
text2 = text2.replace(
    '"url": "https://www.promobeez.com/it/blog/COME_TMP"',
    '"url": "https://www.promobeez.com/it/blog/come-scegliere-un-creator-locale"',
)
# Also swap names if itemlist has both - safer to leave itemlist if structure unclear
# Revert JSON swap — too risky. Just update dates in cards.
it_blog.write_text(text, encoding="utf-8", newline="\n")
changed.append("it/blog.html")

# Author pages
about = ROOT / "about/andrey-shepelev.html"
text = about.read_text(encoding="utf-8")
text = text.replace("30 July 2026 · Evidence review", f'{TRUST["en"]} · Evidence review')
text = text.replace("30 July 2026 · Playbook", f'{HOWTO["en"]} · Playbook')
text = text.replace("2 August 2026 · Finland", f'{DISC["en"]} · Finland')
# reorder list items newest first
ul = re.search(r'(<ul class="posts">)(.*?)(</ul>)', text, re.S)
if ul:
    items = re.findall(r'\n    <li>.*?</li>', ul.group(2), re.S)
    by = {}
    for it in items:
        if "disclosure-finland" in it:
            by["disc"] = it
        elif "how-to-choose" in it:
            by["howto"] = it
        elif "why-audiences" in it:
            by["trust"] = it
    if len(by) == 3:
        text = text[: ul.start(2)] + by["disc"] + by["howto"] + by["trust"] + "\n  " + text[ul.end(2) :]
about.write_text(text, encoding="utf-8", newline="\n")
changed.append("about/andrey-shepelev.html")

fi_about = ROOT / "fi/tietoa/andrey-shepelev.html"
text = fi_about.read_text(encoding="utf-8")
text = text.replace("30.7.2026 · Tutkimuskatsaus", f'{TRUST["fi"]} · Tutkimuskatsaus')
text = text.replace("30.7.2026 · Opas", f'{HOWTO["fi"]} · Opas')
text = text.replace("2.8.2026 · Suomi", f'{DISC["fi"]} · Suomi')
ul = re.search(r'(<ul class="posts">)(.*?)(</ul>)', text, re.S)
if ul:
    items = re.findall(r'\n    <li>.*?</li>', ul.group(2), re.S)
    by = {}
    for it in items:
        if "merkinta" in it:
            by["disc"] = it
        elif "miten-valita" in it:
            by["howto"] = it
        elif "miksi-yleiso" in it:
            by["trust"] = it
    if len(by) == 3:
        text = text[: ul.start(2)] + by["disc"] + by["howto"] + by["trust"] + "\n  " + text[ul.end(2) :]
fi_about.write_text(text, encoding="utf-8", newline="\n")
changed.append("fi/tietoa/andrey-shepelev.html")

it_about = ROOT / "it/chi-siamo/andrey-shepelev.html"
text = it_about.read_text(encoding="utf-8")
text = text.replace("30 luglio 2026 · Rassegna delle evidenze", f'{TRUST["it"]} · Rassegna delle evidenze')
text = text.replace("30 luglio 2026 · Guida operativa", f'{HOWTO["it"]} · Guida operativa')
ul = re.search(r'(<ul class="posts">)(.*?)(</ul>)', text, re.S)
if ul:
    items = re.findall(r'\n    <li>.*?</li>', ul.group(2), re.S)
    by = {}
    for it in items:
        if "come-scegliere" in it:
            by["howto"] = it
        elif "perche" in it:
            by["trust"] = it
    if len(by) == 2:
        text = text[: ul.start(2)] + by["howto"] + by["trust"] + "\n  " + text[ul.end(2) :]
it_about.write_text(text, encoding="utf-8", newline="\n")
changed.append("it/chi-siamo/andrey-shepelev.html")

# Sitemap lastmod for article URLs
sm = ROOT / "sitemap.xml"
text = sm.read_text(encoding="utf-8")


def set_lastmod(xml: str, loc_path: str, day: str) -> str:
    # replace lastmod immediately after matching loc
    return re.sub(
        rf'(<loc>https://www\.promobeez\.com{re.escape(loc_path)}</loc>\s*<lastmod>)[^<]+',
        rf"\g<1>{day}",
        xml,
    )


for path, day in [
    ("/blog/why-audiences-trust-small-creators-more-than-brands", TRUST["day"]),
    ("/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin", TRUST["day"]),
    ("/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator", TRUST["day"]),
    ("/blog/how-to-choose-a-local-creator", HOWTO["day"]),
    ("/fi/blogi/miten-valita-paikallinen-sisallontuottaja", HOWTO["day"]),
    ("/it/blog/come-scegliere-un-creator-locale", HOWTO["day"]),
    ("/blog/vaikuttajamarkkinoinnin-merkinta", DISC["day"]),
    ("/blog/influencer-marketing-disclosure-finland", DISC["day"]),
]:
    text = set_lastmod(text, path, day)
sm.write_text(text, encoding="utf-8", newline="\n")
changed.append("sitemap.xml")

# Source markdown (optional but keep in sync)
md_pairs = [
    (
        ROOT / "content-fi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin.fi.md",
        TRUST,
        "fi",
    ),
    (ROOT / "content-fi/miten-valita-paikallinen-sisallontuottaja.fi.md", HOWTO, "fi"),
    (
        ROOT / "content-it/perche-il-pubblico-si-fida-dei-piccoli-creator.it.md",
        TRUST,
        "it",
    ),
    (ROOT / "content-it/come-scegliere-un-creator-locale.it.md", HOWTO, "it"),
]
for path, d, lang in md_pairs:
    if not path.exists():
        continue
    pairs = [
        ("2026-07-30T09:00:00+03:00", d["iso"]),
        ("2026-08-02T14:00:00+03:00", d["iso"]),
        ("30.7.2026", d["fi"]),
        ("2.8.2026", d["fi"]),
        ("30 luglio 2026", d["it"]),
        ("2 agosto 2026", d["it"]),
    ]
    if replace_all(path, pairs):
        changed.append(path.relative_to(ROOT).as_posix())

for path, content in [
    (
        ROOT / "content-fi/blogi-index.fi.md",
        [
            ("30.7.2026 · 15 min", f'{TRUST["fi"]} · 15 min'),
            ("30.7.2026 · 12 min", f'{HOWTO["fi"]} · 12 min'),
        ],
    ),
    (
        ROOT / "content-it/blog-index.it.md",
        [
            ("30 luglio 2026 · 15 min", f'{TRUST["it"]} · 15 min'),
            ("30 luglio 2026 · 12 min", f'{HOWTO["it"]} · 12 min'),
        ],
    ),
]:
    if path.exists() and replace_all(path, content):
        changed.append(path.relative_to(ROOT).as_posix())

print("updated", len(changed))
for c in changed:
    print(" -", c)
