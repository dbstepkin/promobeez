// Builds the "Promobeez vs <competitor>" comparison pages (EN + FI) from blog/_drafts/*.md.
// Shell (CSS, nav, footer, scripts) is copied from a recent hand-built article in each language,
// so the pages stay in sync with the live design. Run: node scripts/build-comparison-pages.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.promobeez.com';
const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const PAGES = [
  { md: 'blog/_drafts/promobeez-vs-invited-agency.md', out: 'blog/promobeez-vs-invited-agency.html', img: 'promobeez-vs-invited', rival: 'Invited Agency', crumb: 'Promobeez vs Invited Agency' },
  { md: 'blog/_drafts/promobeez-vs-vaiku.md', out: 'blog/promobeez-vs-vaiku.html', img: 'promobeez-vs-vaiku', rival: 'Vaiku', crumb: 'Promobeez vs Vaiku' },
  { md: 'blog/_drafts/promobeez-vs-castersapp.md', out: 'blog/promobeez-vs-castersapp.html', img: 'promobeez-vs-castersapp', rival: 'CastersApp', crumb: 'Promobeez vs CastersApp' },
  { md: 'blog/_drafts/promobeez-vs-invited.fi.md', out: 'fi/blogi/promobeez-vs-invited.html', img: 'promobeez-vs-invited', rival: 'Invited Agency', crumb: 'Promobeez vs Invited Agency' },
  { md: 'blog/_drafts/promobeez-vs-vaiku.fi.md', out: 'fi/blogi/promobeez-vs-vaiku.html', img: 'promobeez-vs-vaiku', rival: 'Vaiku', crumb: 'Promobeez vs Vaiku' },
  { md: 'blog/_drafts/promobeez-vs-castersapp.fi.md', out: 'fi/blogi/promobeez-vs-castersapp.html', img: 'promobeez-vs-castersapp', rival: 'CastersApp', crumb: 'Promobeez vs CastersApp' },
];

const L = {
  en: {
    template: 'blog/influencer-marketing-wrong-metrics.html',
    assets: '../assets/',
    home: '/', blog: '/blog', homeName: 'Home', blogName: 'Blog', blogUrl: `${BASE}/blog`,
    eyebrow: 'Comparison', toc: 'On this page', tocAria: 'Table of contents',
    by: 'By', published: 'Published', reviewed: 'Last reviewed', read: 'min read',
    locale: 'en_FI', altLocale: 'fi_FI', code: 'EN',
    alt: (r) => `Promobeez vs ${r}: comparison card for local businesses in Finland`,
    cta: {
      h: 'Find creators who can actually visit',
      p: 'Post a barter offer, see which local creators apply, and unlock contacts only when the match is right.',
      btn: 'Post your first offer for €15 →', href: '/for-businesses',
      all: 'All posts',
    },
    related: 'Related comparison',
  },
  fi: {
    template: 'fi/blogi/vaikuttajamarkkinoinnin-vaarat-mittarit.html',
    assets: '../../assets/',
    home: '/fi', blog: '/fi/blogi', homeName: 'Koti', blogName: 'Blogi', blogUrl: `${BASE}/fi/blogi`,
    eyebrow: 'Vertailu', toc: 'Tällä sivulla', tocAria: 'Sisällysluettelo',
    by: 'Kirjoittanut', published: 'Julkaistu', reviewed: 'Päivitetty', read: 'min lukuaika',
    locale: 'fi_FI', altLocale: 'en_FI', code: 'FI',
    alt: (r) => `Promobeez vs ${r}: vertailukortti paikallisille yrityksille`,
    cta: {
      h: 'Löydä sisällöntuottajat, jotka voivat oikeasti tulla käymään',
      p: 'Julkaise vaihtokauppatarjous, katso paikalliset hakijat ja avaa yhteystiedot vasta, kun sopivuus on kohdallaan.',
      btn: 'Julkaise ensimmäinen tarjous 15 eurolla →', href: '/fi/yrityksille',
      all: 'Kaikki artikkelit',
    },
    related: 'Muut vertailut',
  },
};

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error('No frontmatter');
  const fm = {};
  let obj = null;
  for (const line of m[1].split(/\r?\n/)) {
    const nested = line.match(/^\s+(\S+):\s*(.*)$/);
    if (nested) {
      if (obj) obj[nested[1]] = nested[2];
      continue;
    }
    const kv = line.match(/^([\w\-]+(?::[\w\-]+)*):\s*(.*)$/);
    if (!kv) continue;
    const val = kv[2].trim();
    if (val === '') {
      fm[kv[1]] = {};
      obj = fm[kv[1]];
    } else {
      fm[kv[1]] = val;
      obj = null;
    }
  }
  return { fm, body: m[2] };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

// Site-relative links for our own domain, absolute for everyone else.
function href(url) {
  return url.startsWith(BASE) ? url.slice(BASE.length) || '/' : url;
}

function inline(s) {
  return esc(s)
    .replace(/\[\[(\d+)\]\]\(#ref-\d+\)/g, '<a class="cite" href="#ref-$1">[$1]</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
      const ext = !u.startsWith(BASE) && /^https?:/.test(u);
      return `<a href="${href(u)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const plain = (s) => s.replace(/\[\[(\d+)\]\]\(#ref-\d+\)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*?([^*]+)\*\*?/g, '$1').trim();

function table(rows, caption) {
  const cells = rows.filter((r) => !/^\|[\s\-:|]+\|$/.test(r)).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
  let h = '<div class="table-wrap"><table>';
  if (caption) h += `<caption>${inline(caption)}</caption>`;
  h += '<thead><tr>' + cells[0].map((c) => `<th scope="col">${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const row of cells.slice(1)) {
    h += '<tr>' + row.map((c, j) => (j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('') + '</tr>';
  }
  return h + '</tbody></table></div>';
}

// Converts the draft body into article HTML. Returns { html, toc, faq, refs, shortAnswer, disclosure }.
function convert(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  const toc = [];
  const faq = [];
  const refs = [];
  let shortAnswer = null;
  let disclosure = null;
  let section = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t || /^# /.test(t) || /^(Home|Koti) \//.test(t) || /^\*\*(Comparison|Vertailu)\*\*$/.test(t) || /^(By|Kirjoittanut) \[/.test(t)) { i++; continue; }

    if (/^> /.test(line)) {
      let block = '';
      while (i < lines.length && /^> /.test(lines[i])) block += ' ' + lines[i++].slice(2);
      const m = block.trim().match(/^\*\*([^*]+)\*\*\s*(.*)$/s);
      shortAnswer = { title: m[1].replace(/\.$/, ''), text: m[2] };
      out.push(`<div class="callout"><strong>${esc(shortAnswer.title)}</strong>${inline(shortAnswer.text)}</div>`);
      continue;
    }

    if (/^\*[^*].*\*$/.test(t) && !(lines[i + 1] || '').trim() && /^\|/.test(lines[i + 2] || '')) {
      const caption = t.slice(1, -1);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      out.push(table(rows, caption));
      continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      out.push(table(rows, null));
      continue;
    }

    const h2 = t.match(/^## (?:\d+\. )?(.+?)(?: \{#([^}]+)\})?$/);
    if (h2) {
      if (section === 'faq') out.push('</div>');
      if (/^(On this page|Tällä sivulla)$/.test(h2[1])) {
        i++;
        while (i < lines.length && (/^\d+\. \[/.test(lines[i]) || !lines[i].trim())) {
          const m = lines[i].match(/^\d+\. \[([^\]]+)\]\(#([^)]+)\)/);
          if (m) toc.push({ text: m[1], id: m[2] });
          i++;
        }
        continue;
      }
      section = h2[2];
      const n = toc.findIndex((x) => x.id === section);
      out.push(`<h2 id="${section}">${n >= 0 ? n + 1 + '. ' : ''}${inline(h2[1])}</h2>`);
      if (section === 'faq') out.push('<div class="faq">');
      i++;
      continue;
    }

    if (section === 'faq' && /^### /.test(t)) {
      const q = t.slice(4);
      i++;
      const paras = [];
      while (i < lines.length && !/^#{2,3} /.test(lines[i].trim())) {
        if (lines[i].trim()) paras.push(lines[i].trim());
        i++;
      }
      faq.push({ q, a: paras.map(plain).join(' ') });
      out.push(`<details><summary>${esc(q)}</summary>${paras.map((p) => `<p>${inline(p)}</p>`).join('')}</details>`);
      continue;
    }

    if (section === 'references' && /^\d+\. /.test(t)) {
      out.push('<div class="refs"><ol>');
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const num = lines[i].match(/^(\d+)\./)[1];
        const txt = lines[i].replace(/^\d+\.\s*/, '');
        refs.push([...txt.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1]));
        out.push(`<li id="ref-${num}">${inline(txt)}</li>`);
        i++;
      }
      out.push('</ol></div>');
      continue;
    }

    if (/^\*\*\[/.test(t)) { i++; continue; } // closing CTA line, replaced by the cta band

    if (/^- /.test(t)) {
      out.push('<ul>');
      while (i < lines.length && /^- /.test(lines[i])) out.push(`<li>${inline(lines[i++].slice(2))}</li>`);
      out.push('</ul>');
      continue;
    }

    if (/^\*[^*].*\*$/.test(t) && !disclosure) {
      disclosure = t.slice(1, -1);
      out.push(`<p class="disclosure"><em>${inline(disclosure)}</em></p>`);
      i++;
      continue;
    }

    out.push(`<p>${inline(t)}</p>`);
    i++;
  }
  if (section === 'faq') out.push('</div>');
  return { html: out.join('\n\n    '), toc, faq, refs: refs.flat(), shortAnswer, disclosure };
}

function fmtDate(iso, lang) {
  const d = new Date(iso);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, m, day] = iso.slice(0, 10).split('-').map(Number);
  return lang === 'fi' ? `${day}.${m}.${y}` : `${day} ${months[m - 1]} ${y}`;
}

function langSwitch(lang, urls) {
  const a = (code, url, name) => `<a href="${href(url)}" hreflang="${code}" lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${name}</a>`;
  return `<details class="lang-switch"><summary aria-label="${lang === 'fi' ? 'Kieli' : 'Language'}"><svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg><span class="lang-switch__code">${L[lang].code}</span></summary><div class="lang-switch__menu" role="list">${a('en', urls.en, 'English')}${a('fi', urls.fi, 'Suomeksi')}</div></details>`;
}

function build(page) {
  const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(ROOT, page.md), 'utf8'));
  const lang = fm.lang;
  const c = L[lang];
  const tpl = fs.readFileSync(path.join(ROOT, c.template), 'utf8');
  const style = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
  const nav = tpl.match(/<nav id="nav">[\s\S]*?<\/nav>/)[0];
  const foot = tpl.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const tail = tpl.slice(tpl.indexOf('</footer>') + '</footer>'.length);
  const urls = { en: fm.hreflang.en, fi: fm.hreflang['fi-FI'] };
  const swapLang = (s) => s.replace(/<details class="lang-switch">[\s\S]*?<\/details>/, langSwitch(lang, urls));

  const doc = convert(body);
  const words = plain(body).split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const img = `${BASE}/assets/blog/${page.img}.png`;
  const authorUrl = fm['meta-article:author'];
  const pub = fm['meta-article:published_time'];
  const mod = fm['meta-article:modified_time'];
  const ogTitle = fm.h1;
  const desc = fm['meta-description'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${fm.canonical}#article`,
        headline: fm.h1,
        description: desc,
        image: { '@type': 'ImageObject', url: img, width: 1200, height: 675 },
        datePublished: pub,
        dateModified: mod,
        author: { '@id': `${authorUrl}#person` },
        publisher: { '@id': `${BASE}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': fm.canonical },
        isPartOf: { '@type': 'Blog', name: 'Promobeez Blog', url: c.blogUrl },
        inLanguage: lang,
        wordCount: words,
        about: [
          { '@type': 'Organization', name: 'Promobeez', url: `${BASE}/` },
          { '@type': 'Organization', name: page.rival },
        ],
        citation: [...new Set(doc.refs)].map((u) => ({ '@type': 'CreativeWork', url: u })),
      },
      {
        '@type': 'Person',
        '@id': `${authorUrl}#person`,
        name: fm['meta-author'],
        url: authorUrl,
        sameAs: ['https://www.linkedin.com/in/andrewshepelev/'],
        worksFor: { '@id': `${BASE}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'Promobeez',
        legalName: 'Daring Spirit Oy',
        url: `${BASE}/`,
        logo: { '@type': 'ImageObject', url: `${BASE}/assets/logo-transparent.png`, width: 512, height: 512 },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: c.homeName, item: `${BASE}${c.home === '/' ? '/' : c.home}` },
          { '@type': 'ListItem', position: 2, name: c.blogName, item: c.blogUrl },
          { '@type': 'ListItem', position: 3, name: fm.h1 },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: doc.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  const others = PAGES.filter((p) => p !== page && p.md.endsWith('.fi.md') === page.md.endsWith('.fi.md'));
  const relatedLinks = others.map((p) => `<a href="/${p.out.replace(/\.html$/, '')}">${p.crumb}</a>`).join('\n        ');

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fm.title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="theme-color" content="#FF9E1B">
<meta name="author" content="${attr(fm['meta-author'])}">
<meta name="robots" content="${ROBOTS}">
<link rel="icon" type="image/svg+xml" href="${c.assets}favicon.svg">
<link rel="apple-touch-icon" href="${c.assets}apple-touch-icon.svg">
<link rel="canonical" href="${fm.canonical}">

<link rel="alternate" hreflang="en" href="${urls.en}">
<link rel="alternate" hreflang="fi-FI" href="${urls.fi}">
<link rel="alternate" hreflang="x-default" href="${fm.hreflang['x-default']}">
<meta property="og:type" content="article">
<meta property="og:url" content="${fm.canonical}">
<meta property="og:title" content="${attr(ogTitle)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${c.locale}">
<meta property="og:locale:alternate" content="${c.altLocale}">
<meta property="article:published_time" content="${pub}">
<meta property="article:modified_time" content="${mod}">
<meta property="article:section" content="${attr(fm['meta-article:section'])}">
<meta property="article:author" content="${authorUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(ogTitle)}">
<meta name="twitter:description" content="${attr(desc)}">
<meta name="twitter:image" content="${img}">

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>

<link rel="stylesheet" href="${c.assets}fonts.css">
${style.replace('</style>', '  .disclosure{font-size:14px;color:var(--gray)}\n</style>')}
</head>
<body>

${swapLang(nav)}


<header class="article-hero">
  <p class="crumbs" aria-label="Breadcrumb">
    <a href="${c.home}">${c.homeName}</a><span>/</span>
    <a href="${c.blog}">${c.blogName}</a><span>/</span>
    ${esc(page.crumb)}
  </p>
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${esc(fm.h1)}</h1>
  <p class="lede">${esc(desc)}</p>
  <div class="byline">
    <span>${c.by} <a href="${href(authorUrl)}">${esc(fm['meta-author'])}</a> · ${c.published} ${fmtDate(pub, lang)} · ${c.reviewed} ${fmtDate(mod, lang)} · ${readMin} ${c.read}</span>
  </div>
  <figure class="hero-figure">
    <picture>
      <source type="image/webp" srcset="${c.assets}blog/${page.img}.webp">
      <img src="${c.assets}blog/${page.img}.png" width="1200" height="675" alt="${attr(c.alt(page.rival))}" fetchpriority="high">
    </picture>
  </figure>
</header>

<div class="layout">
  <aside class="toc" aria-label="${c.tocAria}">
    <h2>${c.toc}</h2>
    <ol>
${doc.toc.map((x) => `      <li><a href="#${x.id}">${esc(x.text)}</a></li>`).join('\n')}
    </ol>
  </aside>

  <article itemscope itemtype="https://schema.org/BlogPosting">
    <meta itemprop="headline" content="${attr(fm.h1)}">
    <meta itemprop="datePublished" content="${pub}">
    <meta itemprop="dateModified" content="${mod}">
    <meta itemprop="author" content="${attr(fm['meta-author'])}">

    ${doc.html}

    <div class="cta-band">
      <h2>${c.cta.h}</h2>
      <p>${c.cta.p}</p>
      <a class="btn" href="${c.cta.href}">${c.cta.btn}</a>
      <div class="cta-links">
        ${relatedLinks}
        <a href="${c.blog}">${c.cta.all}</a>
      </div>
    </div>
  </article>
</div>


${swapLang(foot)}${tail}`;

  fs.writeFileSync(path.join(ROOT, page.out), html, 'utf8');
  return { file: page.out, bytes: Buffer.byteLength(html), words, faq: doc.faq.length, toc: doc.toc.length };
}

console.log(JSON.stringify(PAGES.map(build), null, 2));
