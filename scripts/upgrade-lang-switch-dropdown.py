# -*- coding: utf-8 -*-
"""Upgrade lang-switch to globe + 2-letter code + dropdown (details/summary)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

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

NEW_CSS = """
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

OLD_CSS_PATTERNS = [
    re.compile(
        r"\n  \.lang-switch\{display:(?:flex|inline-flex)[\s\S]*?"
        r"(?:@media\(max-width:760px\)\{nav \.lang-switch\{display:none\}\}\n?)",
        re.M,
    ),
    re.compile(
        r"\n  \.lang-switch\{display:(?:flex|inline-flex)[\s\S]*?"
        r"footer \.lang-switch a:hover\{color:#fff\}\n?",
        re.M,
    ),
    re.compile(
        r"\n  \.lang-switch\{display:inline-flex;align-items:center[\s\S]*?"
        r"@media\(max-width:760px\)\{\.lang-switch\{display:none\}[\s\S]*?\}",
        re.M,
    ),
    re.compile(
        r"\n  \.lang-switch\{display:flex;gap:10px[\s\S]*?"
        r"footer \.lang-switch a:hover\{color:#fff\}\n?",
        re.M,
    ),
]

BLOCK_RE = re.compile(
    r'<(?:div|span) class="lang-switch(?:\s+lang-switch--footer)?"[^>]*>.*?</(?:div|span)>',
    re.S,
)

LINK_RE = re.compile(
    r'<a\s+([^>]+)>(.*?)</a>',
    re.S | re.I,
)

ATTR_RE = re.compile(r'(\w[\w:-]*)="([^"]*)"')

LABELS = {
    "en": ("EN", "English"),
    "fi": ("FI", "Suomeksi"),
    "it": ("IT", "Italiano"),
}

ARIA = {
    "en": "Language",
    "fi": "Kieli",
    "it": "Lingua",
}

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


def normalize_lang(hreflang: str | None, href: str, text: str) -> str | None:
    hl = (hreflang or "").lower()
    if hl.startswith("en"):
        return "en"
    if hl.startswith("fi"):
        return "fi"
    if hl.startswith("it"):
        return "it"
    t = text.strip().lower()
    if t in ("english",):
        return "en"
    if t in ("suomeksi", "suomi"):
        return "fi"
    if t in ("italiano", "italian"):
        return "it"
    h = href.lower()
    if "/fi/" in h or h.endswith("/fi") or "vaikuttaja" in h or "blogi" in h or "yrityksille" in h or "sisallontuottajille" in h or "tietoa/" in h:
        # fragile — prefer text/hreflang
        pass
    if re.search(r"(^|/)fi(/|$)", h):
        return "fi"
    if re.search(r"(^|/)it(/|$)", h):
        return "it"
    if h.startswith("http") and "promobeez.com/fi" in h:
        return "fi"
    if h.startswith("http") and "promobeez.com/it" in h:
        return "it"
    if "/blog" in h or "/for-" in h or "/about/" in h:
        return "en"
    return None


def parse_block(block: str) -> tuple[dict[str, str], str | None]:
    urls: dict[str, str] = {}
    current: str | None = None
    for m in LINK_RE.finditer(block):
        attrs = dict(ATTR_RE.findall(m.group(1)))
        href = attrs.get("href", "")
        text = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        lang = normalize_lang(attrs.get("hreflang"), href, text)
        if not lang:
            continue
        # Prefer path-style hrefs; strip absolute to path when same host
        if href.startswith("https://www.promobeez.com"):
            href = href[len("https://www.promobeez.com") :] or "/"
        urls[lang] = href
        if attrs.get("aria-current") == "page":
            current = lang
    return urls, current


def build_switcher(urls: dict[str, str], current: str, footer: bool = False) -> str:
    code, _ = LABELS[current]
    aria = ARIA.get(current, "Language")
    tag = "details"
    parts = [
        f'<{tag} class="lang-switch">',
        f'<summary aria-label="{aria}">{GLOBE}<span class="lang-switch__code">{code}</span></summary>',
        '<div class="lang-switch__menu" role="list">',
    ]
    for lang in ("en", "fi", "it"):
        if lang not in urls:
            continue
        href = urls[lang]
        _, label = LABELS[lang]
        cur = ' aria-current="page"' if lang == current else ""
        hl = {"en": "en", "fi": "fi", "it": "it"}[lang]
        parts.append(
            f'<a href="{href}" hreflang="{hl}" lang="{lang}"{cur}>{label}</a>'
        )
    parts.append("</div></details>")
    return "".join(parts)


def page_lang(html: str) -> str:
    m = re.search(r'<html[^>]*\slang="([a-z]{2})"', html, re.I)
    return (m.group(1).lower() if m else "en")


def replace_css(text: str) -> str:
    for pat in OLD_CSS_PATTERNS:
        if pat.search(text):
            return pat.sub("\n" + NEW_CSS, text, count=1)
    # IT landings may have different CSS chunks
    alt = re.compile(
        r"\n  \.lang-switch\{[^}]+\}[\s\S]*?footer \.lang-switch[^\n]*\n(?:  footer \.lang-switch[^\n]*\n)*",
        re.M,
    )
    if alt.search(text):
        return alt.sub("\n" + NEW_CSS, text, count=1)
    if ".lang-switch__globe" in text:
        return text
    if ".lang-switch{" in text:
        # Replace from first .lang-switch{ through last related rule before </style> or next unrelated
        text2, n = re.subn(
            r"\n  \.lang-switch\{[\s\S]*?(?=\n</style>|\n  @[^{]*\{(?!media\(max-width:760px\)\{nav \.lang-switch)|\n  \.(?!lang-switch|f-))",
            "\n" + NEW_CSS + "\n",
            text,
            count=1,
        )
        if n:
            return text2
    return text.replace("</style>", NEW_CSS + "\n</style>", 1)


def fix_mobile_nav_hide(text: str) -> str:
    """Only hide direct .nav-links > a on mobile so dropdown links stay usable."""
    text = text.replace(
        ".nav-links a:not(.nav-cta):not(.nav-login){display:none}",
        ".nav-links>a{display:none}",
    )
    # Remove old hide-lang-on-mobile if still present after CSS replace fail
    text = re.sub(
        r"@media\(max-width:760px\)\{nav \.lang-switch\{display:none\}\}\n?",
        "",
        text,
    )
    text = re.sub(
        r"@media\(max-width:760px\)\{\.lang-switch\{display:none\}([^}]*)\}",
        lambda m: f"@media(max-width:760px){{{m.group(1).strip()}}}"
        if m.group(1).strip()
        else "",
        text,
    )
    return text


def ensure_close_script(text: str) -> str:
    if "details.lang-switch[open]" in text:
        return text
    if "</body>" in text:
        return text.replace("</body>", CLOSE_SCRIPT + "</body>", 1)
    return text


def process(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    current_default = page_lang(text)
    text = replace_css(text)
    text = fix_mobile_nav_hide(text)

    def repl(m: re.Match) -> str:
        block = m.group(0)
        urls, current = parse_block(block)
        if len(urls) < 2:
            return block
        cur = current or current_default
        if cur not in urls:
            cur = next(iter(urls))
        footer = "footer" in text[: m.start()][-200:].lower() or "f-links" in text[
            max(0, m.start() - 120) : m.start()
        ]
        # Heuristic: second occurrence often footer; check context
        before = text[max(0, m.start() - 80) : m.start()]
        is_footer = "<footer" in before or 'class="f-links"' in before or "f-copy" in before
        return build_switcher(urls, cur, footer=is_footer)

    # Replace sequentially with context awareness
    out = []
    last = 0
    for m in BLOCK_RE.finditer(text):
        out.append(text[last : m.start()])
        block = m.group(0)
        urls, current = parse_block(block)
        if len(urls) < 2:
            out.append(block)
        else:
            cur = current or current_default
            if cur not in urls:
                cur = sorted(urls.keys())[0]
            before = text[max(0, m.start() - 100) : m.start()]
            is_footer = any(
                x in before for x in ("<footer", 'class="f-links"', "f-copy", "f-links")
            )
            out.append(build_switcher(urls, cur, footer=is_footer))
        last = m.end()
    out.append(text[last:])
    text = "".join(out)
    text = ensure_close_script(text)
    return text


def main() -> None:
    files = sorted(ROOT.rglob("*.html"))
    changed = []
    for path in files:
        if "node_modules" in path.parts or "_archive" in path.parts:
            continue
        raw = path.read_text(encoding="utf-8")
        if 'class="lang-switch' not in raw and "class='lang-switch" not in raw:
            continue
        new = process(path)
        if new != raw:
            path.write_text(new, encoding="utf-8", newline="\n")
            changed.append(path.relative_to(ROOT).as_posix())
            print("updated", path.relative_to(ROOT))
        else:
            print("unchanged?", path.relative_to(ROOT))
    print(f"done: {len(changed)} files")


if __name__ == "__main__":
    main()
