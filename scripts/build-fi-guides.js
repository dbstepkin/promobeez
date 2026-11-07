// Builds the Finnish-only bottom-of-funnel guides (/fi/blogi/*) from blog/_drafts/*.fi.md.
// Same markdown format and converter as the comparison pages (build-comparison-pages.js);
// the shell (CSS, nav, footer, scripts) is copied from a live Finnish article so the design stays in sync.
// These pages have no English or Italian counterpart, so they emit no hreflang (blog/_drafts/README.md).
// Run: node scripts/build-fi-guides.js
const fs = require('fs');
const path = require('path');
const { parseFrontmatter, convert, plain, esc, attr, href, fmtDate, BASE, ROBOTS } = require('./build-comparison-pages.js');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = 'fi/blogi/vaikuttajamarkkinoinnin-vaarat-mittarit.html';
const ASSETS = '../../assets/';

// `cluster` links every guide to the others in the same buying-decision cluster.
const PAGES = [
  { md: 'blog/_drafts/vaikuttajamarkkinointi-hinta.fi.md', slug: 'vaikuttajamarkkinointi-hinta', eyebrow: 'Hinnat', crumb: 'Vaikuttajamarkkinoinnin hinta', alt: 'Vaikuttajamarkkinoinnin hinnat Suomessa 2026: nano- ja mikrotuottajat, UGC, toimistot ja alustat' },
  { md: 'blog/_drafts/vaikuttajamarkkinointialustat-suomessa.fi.md', slug: 'vaikuttajamarkkinointialustat-suomessa', eyebrow: 'Vertailu', crumb: 'Vaikuttajamarkkinointialustat Suomessa', alt: 'Vaikuttajamarkkinointialustat Suomessa 2026: Vaiku, CastersApp, Invited Agency, Influee ja Promobeez' },
  { md: 'blog/_drafts/vaikuttajamarkkinointitoimisto-vai-alusta.fi.md', slug: 'vaikuttajamarkkinointitoimisto-vai-alusta', eyebrow: 'Opas', crumb: 'Toimisto vai alusta', alt: 'Vaikuttajamarkkinointitoimisto vai itsepalvelualusta: vertailukortti paikalliselle yritykselle' },
  { md: 'blog/_drafts/paikalliset-vaikuttajat-helsinki.fi.md', slug: 'paikalliset-vaikuttajat-helsinki', eyebrow: 'Opas', crumb: 'Paikalliset vaikuttajat Helsingissä', alt: 'Paikalliset vaikuttajat ja sisällöntuottajat Helsingissä: opas yritykselle' },
  { md: 'blog/_drafts/ugc-vai-vaikuttajayhteistyo.fi.md', slug: 'ugc-vai-vaikuttajayhteistyo', eyebrow: 'Opas', crumb: 'UGC vai vaikuttajayhteistyö', alt: 'UGC-sisältö vai vaikuttajayhteistyö: vertailukortti paikalliselle yritykselle' },
];

const CTA = {
  h: 'Löydä paikalliset sisällöntuottajat 15 eurolla kuukaudessa',
  p: 'Julkaise vaihtokauppatarjous, katso ketkä lähialueen tuottajat hakevat, ja ota yhteyttä vain niihin, jotka sopivat.',
  btn: 'Julkaise ensimmäinen tarjous →',
  href: '/fi/yrityksille',
};

// Navigation only (not hreflang): the closest page in each language.
const langSwitch = (fiPath) =>
  `<details class="lang-switch"><summary aria-label="Kieli"><svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg><span class="lang-switch__code">FI</span></summary><div class="lang-switch__menu" role="list"><a href="/blog" hreflang="en" lang="en">English</a><a href="${fiPath}" hreflang="fi" lang="fi" aria-current="page">Suomeksi</a><a href="/it/blog" hreflang="it" lang="it">Italiano</a></div></details>`;

function build(page) {
  const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(ROOT, page.md), 'utf8'));
  const tpl = fs.readFileSync(path.join(ROOT, TEMPLATE), 'utf8');
  const style = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
  const nav = tpl.match(/<nav id="nav">[\s\S]*?<\/nav>/)[0];
  const foot = tpl.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const tail = tpl.slice(tpl.indexOf('</footer>') + '</footer>'.length);
  const fiPath = `/fi/blogi/${page.slug}`;
  const swapLang = (s) => s.replace(/<details class="lang-switch">[\s\S]*?<\/details>/g, langSwitch(fiPath));

  const doc = convert(body);
  const words = plain(body).split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const img = `${BASE}/assets/blog/${page.slug}.png`;
  const authorUrl = fm['meta-article:author'];
  const pub = fm['meta-article:published_time'];
  const mod = fm['meta-article:modified_time'];
  const desc = fm['meta-description'];
  const about = (fm.about || '').split(';').map((s) => s.trim()).filter(Boolean);

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
        isPartOf: { '@type': 'Blog', name: 'Promobeez Blogi', url: `${BASE}/fi/blogi` },
        inLanguage: 'fi',
        wordCount: words,
        about: about.map((name) => ({ '@type': 'Thing', name })),
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
          { '@type': 'ListItem', position: 1, name: 'Koti', item: `${BASE}/fi` },
          { '@type': 'ListItem', position: 2, name: 'Blogi', item: `${BASE}/fi/blogi` },
          { '@type': 'ListItem', position: 3, name: fm.h1 },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: doc.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  const related = PAGES.filter((p) => p !== page).map((p) => `<a href="/fi/blogi/${p.slug}">${p.crumb}</a>`).join('\n        ');

  const html = `<!DOCTYPE html>
<html lang="fi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fm.title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="theme-color" content="#FF9E1B">
<meta name="author" content="${attr(fm['meta-author'])}">
<meta name="robots" content="${ROBOTS}">
<link rel="icon" type="image/svg+xml" href="${ASSETS}favicon.svg">
<link rel="apple-touch-icon" href="${ASSETS}apple-touch-icon.svg">
<link rel="canonical" href="${fm.canonical}">
<meta property="og:type" content="article">
<meta property="og:url" content="${fm.canonical}">
<meta property="og:title" content="${attr(fm.h1)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="fi_FI">
<meta property="article:published_time" content="${pub}">
<meta property="article:modified_time" content="${mod}">
<meta property="article:section" content="${attr(fm['meta-article:section'])}">
<meta property="article:author" content="${authorUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(fm.h1)}">
<meta name="twitter:description" content="${attr(desc)}">
<meta name="twitter:image" content="${img}">

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>

<link rel="stylesheet" href="${ASSETS}fonts.css">
${style.replace('</style>', '  .disclosure{font-size:14px;color:var(--gray)}\n</style>')}
</head>
<body>

${swapLang(nav)}


<header class="article-hero">
  <p class="crumbs" aria-label="Breadcrumb">
    <a href="/fi">Koti</a><span>/</span>
    <a href="/fi/blogi">Blogi</a><span>/</span>
    ${esc(page.crumb)}
  </p>
  <div class="eyebrow">${page.eyebrow}</div>
  <h1>${esc(fm.h1)}</h1>
  <p class="lede">${esc(desc)}</p>
  <div class="byline">
    <span>Kirjoittanut <a href="${href(authorUrl)}">${esc(fm['meta-author'])}</a> · Julkaistu ${fmtDate(pub, 'fi')} · Päivitetty ${fmtDate(mod, 'fi')} · ${readMin} min lukuaika</span>
  </div>
  <figure class="hero-figure">
    <picture>
      <source type="image/webp" srcset="${ASSETS}blog/${page.slug}.webp">
      <img src="${ASSETS}blog/${page.slug}.png" width="1200" height="675" alt="${attr(page.alt)}" fetchpriority="high">
    </picture>
  </figure>
</header>

<div class="layout">
  <aside class="toc" aria-label="Sisällysluettelo">
    <h2>Tällä sivulla</h2>
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
      <h2>${CTA.h}</h2>
      <p>${CTA.p}</p>
      <a class="btn" href="${CTA.href}">${CTA.btn}</a>
      <div class="cta-links">
        ${related}
        <a href="/fi/blogi">Kaikki artikkelit</a>
      </div>
    </div>
  </article>
</div>


${swapLang(foot)}${tail}`;

  fs.writeFileSync(path.join(ROOT, 'fi/blogi', `${page.slug}.html`), html, 'utf8');
  return { file: `fi/blogi/${page.slug}.html`, words, faq: doc.faq.length, toc: doc.toc.length, refs: doc.refs.length };
}

module.exports = { PAGES };
if (require.main === module) console.log(JSON.stringify(PAGES.map(build), null, 2));
