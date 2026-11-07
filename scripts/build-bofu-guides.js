// Builds the locale-only bottom-of-funnel guides (FI /fi/blogi/*, IT /it/blog/*) from blog/_drafts/*.{fi,it}.md.
// Same markdown format and converter as the comparison pages (build-comparison-pages.js);
// the shell (CSS, nav, footer, scripts) is copied from a live article in each language so the design stays in sync.
// These pages have no counterpart in the other languages, so they emit no hreflang (blog/_drafts/README.md).
// Run: node scripts/build-bofu-guides.js [fi|it]
const fs = require('fs');
const path = require('path');
const { parseFrontmatter, convert, plain, esc, attr, href, BASE, ROBOTS } = require('./build-comparison-pages.js');

const ROOT = path.join(__dirname, '..');

const L = {
  fi: {
    template: 'fi/blogi/vaikuttajamarkkinoinnin-vaarat-mittarit.html',
    dir: 'fi/blogi', home: '/fi', homeName: 'Koti', blog: '/fi/blogi', blogName: 'Blogi', blogLd: 'Promobeez Blogi',
    crumbsAria: 'Breadcrumb', tocTitle: 'Tällä sivulla', tocAria: 'Sisällysluettelo', locale: 'fi_FI', code: 'FI', langAria: 'Kieli',
    byline: (a, pub, mod, min) => `Kirjoittanut ${a} · Julkaistu ${pub} · Päivitetty ${mod} · ${min} min lukuaika`,
    date: (iso) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return `${d}.${m}.${y}`; },
    others: { en: '/blog', fi: null, it: '/it/blog' },
    cta: {
      h: 'Löydä paikalliset sisällöntuottajat 15 eurolla kuukaudessa',
      p: 'Julkaise vaihtokauppatarjous, katso ketkä lähialueen tuottajat hakevat, ja ota yhteyttä vain niihin, jotka sopivat.',
      btn: 'Julkaise ensimmäinen tarjous →', href: '/fi/yrityksille', all: 'Kaikki artikkelit',
    },
  },
  it: {
    template: 'it/blog/influencer-marketing-metriche-sbagliate.html',
    dir: 'it/blog', home: '/it', homeName: 'Home', blog: '/it/blog', blogName: 'Blog', blogLd: 'Blog di Promobeez',
    crumbsAria: 'Percorso', tocTitle: 'In questa pagina', tocAria: 'In questa pagina', locale: 'it_IT', code: 'IT', langAria: 'Lingua',
    byline: (a, pub, mod, min) => `Di ${a} · Pubblicato il ${pub} · Ultima revisione ${mod} · ${min} min di lettura`,
    date: (iso) => {
      const mesi = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
      const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return `${d} ${mesi[m - 1]} ${y}`;
    },
    others: { en: '/blog', fi: '/fi/blogi', it: null },
    cta: {
      h: 'Trovate creator locali a Milano',
      p: "Apriamo presto a Milano: iscrivetevi ora e, al lancio, pubblicate un'offerta in barter e contattate solo i creator che vi convincono.",
      btn: 'Entrate in lista per Milano →', href: '/it/per-le-attivita', all: 'Tutti gli articoli',
    },
  },
};

// `cluster` links every guide to the others in the same buying-decision cluster (same language).
const PAGES = [
  { lang: 'fi', slug: 'vaikuttajamarkkinointi-hinta', eyebrow: 'Hinnat', crumb: 'Vaikuttajamarkkinoinnin hinta', alt: 'Vaikuttajamarkkinoinnin hinnat Suomessa 2026: nano- ja mikrotuottajat, UGC, toimistot ja alustat' },
  { lang: 'fi', slug: 'vaikuttajamarkkinointialustat-suomessa', eyebrow: 'Vertailu', crumb: 'Vaikuttajamarkkinointialustat Suomessa', alt: 'Vaikuttajamarkkinointialustat Suomessa 2026: Vaiku, CastersApp, Invited Agency, Influee ja Promobeez' },
  { lang: 'fi', slug: 'vaikuttajamarkkinointitoimisto-vai-alusta', eyebrow: 'Opas', crumb: 'Toimisto vai alusta', alt: 'Vaikuttajamarkkinointitoimisto vai itsepalvelualusta: vertailukortti paikalliselle yritykselle' },
  { lang: 'fi', slug: 'paikalliset-vaikuttajat-helsinki', eyebrow: 'Opas', crumb: 'Paikalliset vaikuttajat Helsingissä', alt: 'Paikalliset vaikuttajat ja sisällöntuottajat Helsingissä: opas yritykselle' },
  { lang: 'fi', slug: 'ugc-vai-vaikuttajayhteistyo', eyebrow: 'Opas', crumb: 'UGC vai vaikuttajayhteistyö', alt: 'UGC-sisältö vai vaikuttajayhteistyö: vertailukortti paikalliselle yritykselle' },
  { lang: 'it', slug: 'quanto-costa-influencer-marketing', eyebrow: 'Prezzi', crumb: "Quanto costa l'influencer marketing", alt: "Prezzi dell'influencer marketing in Italia 2026: nano e micro influencer, UGC, agenzie e piattaforme" },
  { lang: 'it', slug: 'piattaforme-influencer-marketing-italia', eyebrow: 'Confronto', crumb: 'Piattaforme di influencer marketing in Italia', alt: 'Piattaforme di influencer marketing in Italia 2026: CollaborUp, Influee, Kolsquare, agenzie e Promobeez' },
  { lang: 'it', slug: 'agenzia-o-piattaforma-influencer', eyebrow: 'Guida', crumb: 'Agenzia o piattaforma', alt: "Agenzia di influencer marketing o piattaforma self-service: scheda di confronto per un'attività locale" },
  { lang: 'it', slug: 'trovare-influencer-locali-milano', eyebrow: 'Guida', crumb: 'Influencer locali a Milano', alt: "Come trovare influencer e creator locali a Milano: guida per un'attività" },
  { lang: 'it', slug: 'ugc-o-influencer', eyebrow: 'Guida', crumb: 'UGC o influencer', alt: "Contenuti UGC o collaborazione con influencer: scheda di confronto per un'attività locale" },
];

const langSwitch = (c, selfPath) => {
  const a = (code, url, name) => `<a href="${url || selfPath}" hreflang="${code}" lang="${code}"${url ? '' : ' aria-current="page"'}>${name}</a>`;
  return `<details class="lang-switch"><summary aria-label="${c.langAria}"><svg class="lang-switch__globe" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg><span class="lang-switch__code">${c.code}</span></summary><div class="lang-switch__menu" role="list">${a('en', c.others.en, 'English')}${a('fi', c.others.fi, 'Suomeksi')}${a('it', c.others.it, 'Italiano')}</div></details>`;
};

function build(page) {
  const c = L[page.lang];
  const md = `blog/_drafts/${page.slug}.${page.lang}.md`;
  const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(ROOT, md), 'utf8'));
  const tpl = fs.readFileSync(path.join(ROOT, c.template), 'utf8');
  const style = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
  const nav = tpl.match(/<nav id="nav">[\s\S]*?<\/nav>/)[0];
  const foot = tpl.match(/<footer>[\s\S]*?<\/footer>/)[0];
  const tail = tpl.slice(tpl.indexOf('</footer>') + '</footer>'.length);
  const selfPath = `${c.blog}/${page.slug}`;
  const swapLang = (s) => s.replace(/<details class="lang-switch">[\s\S]*?<\/details>/g, langSwitch(c, selfPath));
  const assets = '../../assets/';

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
        isPartOf: { '@type': 'Blog', name: c.blogLd, url: `${BASE}${c.blog}` },
        inLanguage: page.lang,
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
          { '@type': 'ListItem', position: 1, name: c.homeName, item: `${BASE}${c.home}` },
          { '@type': 'ListItem', position: 2, name: c.blogName, item: `${BASE}${c.blog}` },
          { '@type': 'ListItem', position: 3, name: fm.h1 },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: doc.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  const related = PAGES.filter((p) => p !== page && p.lang === page.lang).map((p) => `<a href="${c.blog}/${p.slug}">${p.crumb}</a>`).join('\n        ');
  const author = `<a href="${href(authorUrl)}">${esc(fm['meta-author'])}</a>`;

  const html = `<!DOCTYPE html>
<html lang="${page.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fm.title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="theme-color" content="#FF9E1B">
<meta name="author" content="${attr(fm['meta-author'])}">
<meta name="robots" content="${ROBOTS}">
<link rel="icon" type="image/svg+xml" href="${assets}favicon.svg">
<link rel="apple-touch-icon" href="${assets}apple-touch-icon.svg">
<link rel="canonical" href="${fm.canonical}">
<meta property="og:type" content="article">
<meta property="og:url" content="${fm.canonical}">
<meta property="og:title" content="${attr(fm.h1)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${c.locale}">
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

<link rel="stylesheet" href="${assets}fonts.css">
${style.replace('</style>', '  .disclosure{font-size:14px;color:var(--gray)}\n</style>')}
</head>
<body>

${swapLang(nav)}


<header class="article-hero">
  <p class="crumbs" aria-label="${c.crumbsAria}">
    <a href="${c.home}">${c.homeName}</a><span>/</span>
    <a href="${c.blog}">${c.blogName}</a><span>/</span>
    ${esc(page.crumb)}
  </p>
  <div class="eyebrow">${page.eyebrow}</div>
  <h1>${esc(fm.h1)}</h1>
  <p class="lede">${esc(desc)}</p>
  <div class="byline">
    <span>${c.byline(author, c.date(pub), c.date(mod), readMin)}</span>
  </div>
  <figure class="hero-figure">
    <picture>
      <source type="image/webp" srcset="${assets}blog/${page.slug}.webp">
      <img src="${assets}blog/${page.slug}.png" width="1200" height="675" alt="${attr(page.alt)}" fetchpriority="high">
    </picture>
  </figure>
</header>

<div class="layout">
  <aside class="toc" aria-label="${c.tocAria}">
    <h2>${c.tocTitle}</h2>
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
        ${related}
        <a href="${c.blog}">${c.cta.all}</a>
      </div>
    </div>
  </article>
</div>


${swapLang(foot)}${tail}`;

  const out = `${c.dir}/${page.slug}.html`;
  fs.writeFileSync(path.join(ROOT, out), html, 'utf8');
  return { file: out, words, faq: doc.faq.length, toc: doc.toc.length, refs: doc.refs.length };
}

module.exports = { PAGES };
if (require.main === module) {
  const only = process.argv[2];
  console.log(JSON.stringify(PAGES.filter((p) => !only || p.lang === only).map(build), null, 2));
}
