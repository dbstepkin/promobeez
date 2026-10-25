// Builds the creator-side "how to get collaborations" articles (EN + FI Helsinki, IT Milan)
// from content-{en,fi,it}/*.md. Shell (CSS, nav, footer, scripts) is copied from a recent
// hand-built article in each language, like build-comparison-pages.js.
// Run: node scripts/build-creator-articles.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.promobeez.com';
const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const PAGES = [
  { md: 'content-en/creator-collaborations-helsinki.en.md', out: 'blog/creator-collaborations-helsinki.html', city: 'Helsinki' },
  { md: 'content-fi/yhteistyot-sisallontuottajalle-helsinki.fi.md', out: 'fi/blogi/yhteistyot-sisallontuottajalle-helsinki.html', city: 'Helsinki' },
  { md: 'content-it/collaborazioni-creator-milano.it.md', out: 'it/blog/collaborazioni-creator-milano.html', city: 'Milano' },
];

const L = {
  en: {
    template: 'blog/influencer-marketing-wrong-metrics.html', assets: '../assets/',
    home: '/', blog: '/blog', homeName: 'Home', blogName: 'Blog', blogUrl: `${BASE}/blog`,
    toc: 'On this page', tocAria: 'Table of contents',
    by: 'By', published: 'Published', reviewed: 'Last reviewed', read: 'min read',
    locale: 'en_FI', code: 'EN', all: 'All posts', topic: 'Influencer marketing for creators',
  },
  fi: {
    template: 'fi/blogi/vaikuttajamarkkinoinnin-vaarat-mittarit.html', assets: '../../assets/',
    home: '/fi', blog: '/fi/blogi', homeName: 'Koti', blogName: 'Blogi', blogUrl: `${BASE}/fi/blogi`,
    toc: 'Tällä sivulla', tocAria: 'Sisällysluettelo',
    by: 'Kirjoittanut', published: 'Julkaistu', reviewed: 'Päivitetty', read: 'min lukuaika',
    locale: 'fi_FI', code: 'FI', all: 'Kaikki artikkelit', topic: 'Kaupalliset yhteistyöt sisällöntuottajille',
  },
  it: {
    template: 'it/blog/influencer-marketing-metriche-sbagliate.html', assets: '../../assets/',
    home: '/', blog: '/it/blog', homeName: 'Home', blogName: 'Blog', blogUrl: `${BASE}/it/blog`,
    toc: 'In questa pagina', tocAria: 'Indice',
    by: 'Di', published: 'Pubblicato il', reviewed: 'Ultima revisione', read: 'min di lettura',
    locale: 'it_IT', code: 'IT', all: 'Tutti gli articoli', topic: 'Collaborazioni per creator',
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
    } else if (val.startsWith('[')) {
      fm[kv[1]] = val.slice(1, -1).split(',').map((s) => s.trim());
      obj = null;
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

function link(t, u) {
  const ext = !u.startsWith(BASE) && /^https?:/.test(u);
  return `<a href="${href(u)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${t}</a>`;
}

function inline(s) {
  return esc(s)
    .replace(/\[\[(\d+)\]\]\(#ref-\d+\)/g, '<a class="cite" href="#ref-$1">[$1]</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => link(t, u))
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

// Converts the markdown body into article HTML.
// Returns { html, lede, toc, faq, refs, shortAnswer, cta }.
function convert(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  const toc = [];
  const faq = [];
  const refs = [];
  let lede = null;
  let shortAnswer = null;
  let section = null;
  let i = 0;

  // Everything after the last horizontal rule is the closing CTA block.
  const hr = lines.lastIndexOf('---');
  const ctaLines = hr >= 0 ? lines.slice(hr + 1).map((l) => l.trim()).filter(Boolean) : [];
  const end = hr >= 0 ? hr : lines.length;
  const cta = {
    h: (ctaLines.find((l) => /^## /.test(l)) || '').slice(3),
    p: ctaLines.find((l) => !/^(## |\[)/.test(l)) || '',
    btn: (ctaLines.find((l) => /^\[[^\]]+\]\([^)]+\)$/.test(l)) || '').match(/^\[([^\]]+)\]\(([^)]+)\)$/),
    links: [...((ctaLines.find((l) => / · /.test(l)) || '').matchAll(/\[([^\]]+)\]\(([^)]+)\)/g))].map((m) => ({ t: m[1], u: m[2] })),
  };

  while (i < end) {
    const line = lines[i];
    const t = line.trim();

    if (!t || /^# /.test(t) || /^(Home|Etusivu) \//.test(t) || /^(By|Kirjoittanut|Di) \[/.test(t)) { i++; continue; }
    if (!section && /^\*\*[^*]+\*\*$/.test(t)) { i++; continue; } // eyebrow line above the H1
    if (!section && !lede && !/^[>|#-]/.test(t)) { lede = t; i++; continue; }

    if (/^> /.test(line)) {
      let block = '';
      while (i < end && /^>/.test(lines[i])) block += ' ' + lines[i++].replace(/^>\s?/, '');
      block = block.trim();
      const m = block.match(/^\*\*([^*]+)\*\*\s*(.*)$/s);
      if (m && !shortAnswer) {
        shortAnswer = { title: m[1].replace(/\.$/, ''), text: m[2] };
        out.push(`<div class="callout"><strong>${esc(shortAnswer.title)}</strong>${inline(shortAnswer.text)}</div>`);
      } else {
        out.push(`<blockquote class="dm"><p>${inline(block)}</p></blockquote>`);
      }
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < end && /^\|/.test(lines[i])) rows.push(lines[i++]);
      let caption = null;
      while (i < end && !lines[i].trim()) i++;
      if (i < end && /^\*[^*].*\*$/.test(lines[i].trim())) caption = lines[i++].trim().slice(1, -1);
      out.push(table(rows, caption));
      continue;
    }

    const h2 = t.match(/^## (?:\d+\. )?(.+?)(?: \{#([^}]+)\})?$/);
    if (h2) {
      if (section === 'faq') out.push('</div>');
      if (/^(On this page|Tällä sivulla|In questa pagina)$/.test(h2[1])) {
        i++;
        while (i < end && (/^\d+\. \[/.test(lines[i]) || !lines[i].trim())) {
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

    // FAQ: a bold line ending in "?" is the question, the paragraphs below it are the answer.
    if (section === 'faq' && /^\*\*[^*]+\?\*\*$/.test(t)) {
      const q = t.slice(2, -2);
      i++;
      const paras = [];
      while (i < end && !/^\*\*[^*]+\?\*\*$/.test(lines[i].trim()) && !/^## /.test(lines[i].trim())) {
        if (lines[i].trim()) paras.push(lines[i].trim());
        i++;
      }
      faq.push({ q, a: paras.map(plain).join(' ') });
      out.push(`<details><summary>${esc(q)}</summary>${paras.map((p) => `<p>${inline(p)}</p>`).join('')}</details>`);
      continue;
    }

    if (section === 'references' && /^\d+\. /.test(t)) {
      out.push('<div class="refs"><ol>');
      while (i < end && /^\d+\. /.test(lines[i])) {
        const num = lines[i].match(/^(\d+)\./)[1];
        const txt = lines[i].replace(/^\d+\.\s*/, '');
        const url = (txt.match(/(https?:\/\/\S+)$/) || [])[1];
        if (url) refs.push(url);
        const body = url ? inline(txt.slice(0, -url.length)) + link(esc(url), url) : inline(txt);
        out.push(`<li id="ref-${num}">${body}</li>`);
        i++;
      }
      out.push('</ol></div>');
      continue;
    }

    if (/^\d+\. /.test(t)) {
      out.push('<ol>');
      while (i < end && /^\d+\. /.test(lines[i])) out.push(`<li>${inline(lines[i++].replace(/^\d+\.\s*/, ''))}</li>`);
      out.push('</ol>');
      continue;
    }

    if (/^- /.test(t)) {
      out.push('<ul>');
      while (i < end && /^- /.test(lines[i])) out.push(`<li>${inline(lines[i++].slice(2))}</li>`);
      out.push('</ul>');
      continue;
    }

    out.push(`<p>${inline(t)}</p>`);
    i++;
  }
  if (section === 'faq') out.push('</div>');
  return { html: out.join('\n\n    '), lede, toc, faq, refs, shortAnswer, cta };
}

function fmtDate(iso, lang) {
  const [y, m, day] = iso.slice(0, 10).split('-').map(Number);
  const en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const it = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  if (lang === 'fi') return `${day}.${m}.${y}`;
  return `${day} ${(lang === 'it' ? it : en)[m - 1]} ${y}`;
}

function langSwitch(lang, urls) {
  const a = (code, url, name) => `<a href="${href(url)}" hreflang="${code}" lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${name}</a>`;
  const label = { en: 'Language', fi: 'Kieli', it: 'Lingua' }[lang];
  return `<details class="lang-switch"><summary aria-label="${label}"><svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg><span class="lang-switch__code">${L[lang].code}</span></summary><div class="lang-switch__menu" role="list">${a('en', urls.en, 'English')}${a('fi', urls.fi, 'Suomeksi')}${a('it', urls.it, 'Italiano')}</div></details>`;
}

const EXTRA_CSS = `  .dm{margin:16px 0 22px;padding:16px 20px;background:#fff;border:1px solid rgba(16,13,26,.1);border-radius:14px;font-size:16px}
  .dm p{margin:0;font-size:16px}
  .table-wrap caption{caption-side:bottom;text-align:left;font-size:13px;color:var(--gray);padding-top:8px}
`;

function build(page) {
  const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(ROOT, page.md), 'utf8'));
  const lang = fm.lang;
  const c = L[lang];
  const tpl = fs.readFileSync(path.join(ROOT, c.template), 'utf8');
  const style = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
  const nav = tpl.match(/<nav id="nav">[\s\S]*?<\/nav>/)[0];
  const foot = tpl.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const tail = tpl.slice(tpl.indexOf('</footer>') + '</footer>'.length);
  const urls = { en: fm.hreflang.en, fi: fm.hreflang['fi-FI'], it: fm.hreflang['it-IT'] };
  const swapLang = (s) => s.replace(/<details class="lang-switch">[\s\S]*?<\/details>/, langSwitch(lang, urls));

  const doc = convert(body);
  const words = plain(body).split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const img = fm['meta-og:image'];
  const imgFile = img.split('/').pop().replace(/\.png$/, '');
  const authorUrl = fm['meta-article:author'];
  const pub = fm['meta-article:published_time'];
  const mod = fm['meta-article:modified_time'];
  const desc = fm['meta-description'];
  const altLocales = fm['meta-og:locale:alternate'] || [];

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
        keywords: [fm['keywords-primary'], ...(fm['keywords-secondary'] || [])].filter(Boolean).join(', '),
        about: [
          { '@type': 'Thing', name: c.topic },
          { '@type': 'City', name: page.city },
        ],
        audience: { '@type': 'Audience', audienceType: 'Content creators and micro-influencers' },
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

  const ctaBtn = doc.cta.btn;
  const ctaLinks = doc.cta.links.map((l) => `<a href="${href(l.u)}">${esc(l.t)}</a>`).join('\n        ');

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
<link rel="alternate" hreflang="it-IT" href="${urls.it}">
<link rel="alternate" hreflang="x-default" href="${fm.hreflang['x-default']}">
<meta property="og:type" content="article">
<meta property="og:url" content="${fm.canonical}">
<meta property="og:title" content="${attr(fm['meta-og:title'])}">
<meta property="og:description" content="${attr(fm['meta-og:description'])}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:image:alt" content="${attr(fm['image-alt'])}">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${c.locale}">
${altLocales.map((l) => `<meta property="og:locale:alternate" content="${l}">`).join('\n')}
<meta property="article:published_time" content="${pub}">
<meta property="article:modified_time" content="${mod}">
<meta property="article:section" content="${attr(fm['meta-article:section'])}">
<meta property="article:author" content="${authorUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(fm['meta-twitter:title'])}">
<meta name="twitter:description" content="${attr(fm['meta-twitter:description'])}">
<meta name="twitter:image" content="${img}">

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>

<link rel="stylesheet" href="${c.assets}fonts.css">
${style.replace('</style>', EXTRA_CSS + '</style>')}
</head>
<body>

${swapLang(nav)}


<header class="article-hero">
  <p class="crumbs" aria-label="Breadcrumb">
    <a href="${c.home}">${c.homeName}</a><span>/</span>
    <a href="${c.blog}">${c.blogName}</a><span>/</span>
    ${esc(fm.crumb)}
  </p>
  <div class="eyebrow">${esc(fm.eyebrow)}</div>
  <h1>${esc(fm.h1)}</h1>
  <p class="lede">${inline(doc.lede)}</p>
  <div class="byline">
    <span>${c.by} <a href="${href(authorUrl)}">${esc(fm['meta-author'])}</a> · ${c.published} ${fmtDate(pub, lang)} · ${c.reviewed} ${fmtDate(mod, lang)} · ${readMin} ${c.read}</span>
  </div>
  <figure class="hero-figure">
    <picture>
      <source type="image/webp" srcset="${c.assets}blog/${imgFile}.webp">
      <img src="${c.assets}blog/${imgFile}.png" width="1200" height="675" alt="${attr(fm['image-alt'])}" fetchpriority="high">
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
      <h2>${esc(doc.cta.h)}</h2>
      <p>${inline(doc.cta.p)}</p>
      <a class="btn" href="${href(ctaBtn[2])}">${esc(ctaBtn[1])}</a>
      <div class="cta-links">
        ${ctaLinks}
      </div>
    </div>
  </article>
</div>


${swapLang(foot)}${tail}`;

  fs.writeFileSync(path.join(ROOT, page.out), html, 'utf8');
  return { file: page.out, bytes: Buffer.byteLength(html), words, readMin, faq: doc.faq.length, toc: doc.toc.length, refs: doc.refs.length };
}

console.log(JSON.stringify(PAGES.map(build), null, 2));
