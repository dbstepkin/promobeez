const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.promobeez.com';

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
    const key = kv[1].trim();
    const val = kv[2].trim();
    if (val === '') {
      fm[key] = {};
      obj = fm[key];
    } else if (val.startsWith('[')) {
      fm[key] = val.slice(1, -1).split(',').map((s) => s.trim());
    } else {
      fm[key] = val;
      obj = null;
    }
  }
  return { fm, body: m[2] };
}

function inlineMd(s) {
  return s
    .replace(/\[\[(\d+)\]\]\(#ref-\d+\)/g, '<a class="cite" href="#ref-$1">[$1]</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function isTableRow(line) {
  return /^\|/.test(line);
}

function parseTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && isTableRow(lines[i])) {
    rows.push(lines[i]);
    i++;
  }
  let caption = '';
  if (i < lines.length && /^\*[^*].*\*$/.test(lines[i].trim())) {
    caption = lines[i].trim().replace(/^\*|\*$/g, '');
    i++;
  }
  const cells = rows
    .filter((r) => !/^\|[\s\-:|]+\|$/.test(r))
    .map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
  let html = '<div class="table-wrap"><table>';
  if (cells.length) {
    html += '<thead><tr>' + cells[0].map((c) => `<th scope="col">${inlineMd(c)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    for (const row of cells.slice(1)) {
      html += '<tr>';
      row.forEach((c, j) => {
        const isRowHeader = j === 0 && row.length > 1 && !/^\d/.test(c) && !c.includes('€') && !c.includes('%') && !c.startsWith('~') && !c.startsWith('−') && !c.startsWith('+');
        html += isRowHeader ? `<th scope="row">${inlineMd(c)}</th>` : `<td>${inlineMd(c)}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody>';
  }
  if (caption) html += `<caption>${inlineMd(caption)}</caption>`;
  html += '</table></div>';
  return { html, next: i };
}

function formatRefLine(content, num) {
  let c = content.replace(/&/g, '&amp;');
  c = c.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  c = c.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return `<li id="ref-${num}">${c}</li>`;
}

function mdToHtml(body, opts = {}) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let i = 0;
  let started = false;
  let inFaq = false;

  while (i < lines.length) {
    const line = lines[i];

    if (!started) {
      if (/^## (Tällä sivulla|In questa pagina)/.test(line)) {
        i++;
        while (i < lines.length && (/^\d+\. \[/.test(lines[i]) || !lines[i].trim())) i++;
        started = true;
        continue;
      }
      if (/^## /.test(line)) started = true;
      else {
        i++;
        continue;
      }
    }

    if (/^### (Navigaation|Glossario)/.test(line)) break;
    if (/^## (Löydä|Yhdistä|Trova creator)/.test(line)) break;
    if (/^---\s*$/.test(line) && lines.slice(i + 1).some((l) => /Rekisteröidy|Iscriviti|Trova creator|Yhdistä/.test(l))) break;

    if (isTableRow(line)) {
      const t = parseTable(lines, i);
      out.push(t.html);
      i = t.next;
      continue;
    }

    const h2 = line.match(/^## (.+?) \{#([^}]+)\}$/);
    if (h2) {
      inFaq = h2[2] === 'faq';
      if (h2[2] === 'references') {
        const label = /Lähteet/.test(h2[1]) ? 'Lähteet' : 'Riferimenti';
        out.push(`<h2 id="references">${label}</h2><div class="refs"><ol>`);
        i++;
        while (i < lines.length) {
          if (!lines[i].trim()) {
            i++;
            continue;
          }
          if (!/^\d+\. /.test(lines[i])) break;
          const num = lines[i].match(/^(\d+)\./)[1];
          out.push(formatRefLine(lines[i].replace(/^\d+\.\s*/, ''), num));
          i++;
        }
        out.push('</ol></div>');
        continue;
      }
      if (inFaq) {
        out.push(`<h2 id="faq">${inlineMd(h2[1])}</h2>`);
        out.push('<div class="faq">');
        i++;
        continue;
      }
      out.push(`<h2 id="${h2[2]}">${inlineMd(h2[1])}</h2>`);
      i++;
      continue;
    }

    if (/^### /.test(line)) {
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
      i++;
      continue;
    }

    if (/^> /.test(line)) {
      let block = line.slice(2);
      i++;
      while (i < lines.length && /^> /.test(lines[i])) {
        block += ' ' + lines[i].slice(2);
        i++;
      }
      const cm = block.match(/^\*\*([^*]+)\*\*\.?\s*(.*)$/s);
      if (cm) out.push(`<div class="callout"><strong>${inlineMd(cm[1])}</strong> ${inlineMd(cm[2])}</div>`);
      else out.push(`<div class="callout">${inlineMd(block)}</div>`);
      continue;
    }

    if (/^[-*] /.test(line)) {
      out.push('<ul>');
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        out.push(`<li>${inlineMd(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push('</ul>');
      continue;
    }

    if (/^\d+\. \*\*/.test(line) && opts.checklist) {
      out.push('<ol class="checklist">');
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        out.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s*/, ''))}</li>`);
        i++;
      }
      out.push('</ol>');
      continue;
    }

    if (/^## (Usein kysytyt|Domande frequenti)/.test(line)) {
      out.push(`<h2 id="faq">${line.includes('Usein') ? 'Usein kysytyt kysymykset' : 'Domande frequenti'}</h2>`);
      out.push('<div class="faq">');
      inFaq = true;
      i++;
      continue;
    }

    if (/^\*\*[^*]+\*\*\s*$/.test(line.trim()) && inFaq) {
      while (i < lines.length && /^\*\*[^*]+\*\*\s*$/.test(lines[i].trim())) {
        const q = lines[i].trim().replace(/^\*\*|\*\*$/g, '');
        i++;
        const paras = [];
        while (i < lines.length && !/^\*\*[^*]+\*\*\s*$/.test(lines[i].trim()) && !/^## /.test(lines[i])) {
          if (!lines[i].trim()) {
            i++;
            continue;
          }
          paras.push(`<p>${inlineMd(lines[i])}</p>`);
          i++;
        }
        out.push(`<details><summary>${q.replace(/&/g, '&amp;')}</summary>${paras.join('')}</details>`);
      }
      out.push('</div>');
      inFaq = false;
      continue;
    }

    if (!line.trim() || /^# /.test(line) || /^Kirjoittanut|^Di /.test(line) || /^Koti \//.test(line) || /^\*\*(Tutkimuskatsaus|Opas|Rassegna|Guida)/.test(line)) {
      i++;
      continue;
    }
    if (/^## (Tällä sivulla|In questa pagina)/.test(line)) {
      i++;
      while (i < lines.length && !/^## /.test(lines[i])) i++;
      continue;
    }

    out.push(`<p>${inlineMd(line)}</p>`);
    i++;
  }
  return out.join('\n\n');
}

function extractDois(body) {
  return [...new Set([...body.matchAll(/https?:\/\/doi\.org\/[^\s<"]+/g)].map((m) => m[0]))];
}

function analyticsHead(assets) {
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZLZE6QNWP6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ZLZE6QNWP6');
</script>
<script defer src="${assets}attribution.js"></script>
<script defer src="${assets}analytics.js"></script>
<script src="${assets}facebook-pixel.js"></script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1367558515342525&ev=PageView&noscript=1"
/></noscript>`;
}

function langSwitch(current, urls, lang) {
  const label = lang === 'fi' ? 'Kieli' : 'Lingua';
  const en = current === 'en' ? ' aria-current="page"' : '';
  const fi = current === 'fi' ? ' aria-current="page"' : '';
  const it = current === 'it' ? ' aria-current="page"' : '';
  if (lang === 'fi') {
    return `<div class="lang-switch" aria-label="${label}">
      <a href="${urls.en}"${en}>English</a><span class="sep">·</span>
      <a href="${urls.fi}"${fi}>Suomeksi</a><span class="sep">·</span>
      <a href="${urls.it}"${it}>Italiano</a>
    </div>`;
  }
  return `<span class="lang-switch" aria-label="${label}">
      <a href="${urls.en}" hreflang="en"${en}>English</a>
      <a href="${urls.fi}" hreflang="fi-FI"${fi}>Suomeksi</a>
      <a href="${urls.it}" hreflang="it-IT"${it}>Italiano</a>
    </span>`;
}

function fiNav(currentPage, urls) {
  return `<nav id="nav">
  <a class="logo" href="/">
    <svg class="beemark" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
      <defs><linearGradient id="beeBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD84D"/><stop offset="1" stop-color="#FF9E1B"/></linearGradient></defs>
      <path d="M20 13 C18 8 15.5 6.5 13 7" stroke="#100D1A" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M28 13 C30 8 32.5 6.5 35 7" stroke="#100D1A" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12.4" cy="6.6" r="2.4" fill="#FF5A3C"/><circle cx="35.6" cy="6.6" r="2.4" fill="#FF5A3C"/>
      <ellipse class="wing wl" cx="13" cy="19" rx="9" ry="6.5" fill="#fff" fill-opacity=".95" stroke="#100D1A" stroke-width="2"/>
      <ellipse class="wing wr" cx="35" cy="19" rx="9" ry="6.5" fill="#fff" fill-opacity=".95" stroke="#100D1A" stroke-width="2"/>
      <rect x="15" y="16" width="18" height="26" rx="9" fill="url(#beeBody)" stroke="#100D1A" stroke-width="2.4"/>
      <clipPath id="beeClip"><rect x="15" y="16" width="18" height="26" rx="9"/></clipPath>
      <g clip-path="url(#beeClip)"><rect x="13" y="24.5" width="22" height="4.2" fill="#100D1A"/><rect x="13" y="33" width="22" height="4.2" fill="#100D1A"/></g>
    </svg>
    Promo<span class="beez">beez</span>
  </a>
  <div class="nav-links">
    <a href="/#how">Miten se toimii</a>
    <a href="/fi/yrityksille"${currentPage === 'business' ? ' aria-current="page"' : ''}>Yrityksille</a>
    <a href="/fi/sisallontuottajille"${currentPage === 'creators' ? ' aria-current="page"' : ''}>Sisällöntuottajille</a>
    <a href="/fi/blogi"${currentPage === 'blog' ? ' aria-current="page"' : ''}>Blogi</a>
    ${langSwitch('fi', urls, 'fi')}
    <div class="nav-auth">
      <a href="https://my.promobeez.com/auth/login" class="nav-login">Kirjaudu</a>
      <a href="https://my.promobeez.com/auth/register?role=brand" class="nav-cta">Rekisteröidy →</a>
    </div>
  </div>
</nav>`;
}

function itNav(currentPage, urls) {
  return `<nav id="nav">
  <a class="logo" href="/">
    <svg class="beemark" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
      <defs><linearGradient id="beeBody" x1="0" y1="0" x2="0" y2="2"><stop offset="0" stop-color="#FFD84D"/><stop offset="1" stop-color="#FF9E1B"/></linearGradient></defs>
      <path d="M20 13 C18 8 15.5 6.5 13 7" stroke="#100D1A" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M28 13 C30 8 32.5 6.5 35 7" stroke="#100D1A" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12.4" cy="6.6" r="2.4" fill="#FF5A3C"/><circle cx="35.6" cy="6.6" r="2.4" fill="#FF5A3C"/>
      <ellipse class="wing wl" cx="13" cy="19" rx="9" ry="6.5" fill="#fff" fill-opacity=".95" stroke="#100D1A" stroke-width="2"/>
      <ellipse class="wing wr" cx="35" cy="19" rx="9" ry="6.5" fill="#fff" fill-opacity=".95" stroke="#100D1A" stroke-width="2"/>
      <rect x="15" y="16" width="18" height="26" rx="9" fill="url(#beeBody)" stroke="#100D1A" stroke-width="2.4"/>
      <clipPath id="beeClip"><rect x="15" y="16" width="18" height="26" rx="9"/></clipPath>
      <g clip-path="url(#beeClip)"><rect x="13" y="24.5" width="22" height="4.2" fill="#100D1A"/><rect x="13" y="33" width="22" height="4.2" fill="#100D1A"/></g>
    </svg>
    Promo<span class="beez">beez</span>
  </a>
  <div class="nav-links">
    <a href="/it/per-le-attivita#how">Come funziona</a>
    <a href="/it/per-le-attivita"${currentPage === 'business' ? ' aria-current="page"' : ''}>Per le attività</a>
    <a href="/it/per-i-creator"${currentPage === 'creators' ? ' aria-current="page"' : ''}>Per i creator</a>
    <a href="/it/blog"${currentPage === 'blog' ? ' aria-current="page"' : ''}>Blog</a>
    ${langSwitch('it', urls, 'it')}
    <div class="nav-auth">
      <a href="https://my.promobeez.com/auth/login" class="nav-login">Accedi</a>
      <a href="https://my.promobeez.com/auth/register?role=brand" class="nav-cta">Iscriviti →</a>
    </div>
  </div>
</nav>`;
}

function footer(lang, urls) {
  if (lang === 'fi') {
    return `<footer>
  <div class="f-copy">© 2026 Daring Spirit Oy · Tehty Helsingissä</div>
  <div class="f-links">
    <a href="/">Koti</a>
    <a href="/fi/yrityksille">Yrityksille</a>
    <a href="/fi/sisallontuottajille">Sisällöntuottajille</a>
    <a href="/fi/blogi">Blogi</a>
    <a href="/privacy">Tietosuoja</a>
    <a href="/terms">Käyttöehdot</a>
    <a href="mailto:team@promobeez.com">Yhteystiedot</a>
    <span class="lang-switch" aria-label="Kieli">
      <a href="${urls.en}">English</a><span class="sep">·</span>
      <a href="${urls.fi}" aria-current="page">Suomeksi</a><span class="sep">·</span>
      <a href="${urls.it}">Italiano</a>
    </span>
    <span class="f-socials">${socialSvg()}</span>
  </div>
</footer>`;
  }
  return `<footer>
  <div class="f-copy">© 2026 Daring Spirit Oy · Fatto a Helsinki</div>
  <div class="f-links">
    <a href="/">Home</a>
    <a href="/it/per-le-attivita">Per le attività</a>
    <a href="/it/per-i-creator">Per i creator</a>
    <a href="/it/blog">Blog</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Termini</a>
    <a href="mailto:team@promobeez.com">Contatti</a>
    <span class="lang-switch lang-switch--footer" aria-label="Lingua">
      <a href="${urls.en}" hreflang="en">English</a>
      <a href="${urls.fi}" hreflang="fi-FI">Suomeksi</a>
      <a href="${urls.it}" hreflang="it-IT" aria-current="page">Italiano</a>
    </span>
    <span class="f-socials">${socialSvg()}</span>
  </div>
</footer>`;
}

function socialSvg() {
  return `<a href="https://www.instagram.com/promo.beez" class="f-social" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.4" fill="currentColor"/></svg></a>
      <a href="https://www.facebook.com/profile.php?id=61591664677429" class="f-social" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
      <a href="https://www.linkedin.com/company/promobeez/" class="f-social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>`;
}

function articleCss(extra = '') {
  return `  .lang-switch{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;flex-wrap:wrap}
  .lang-switch a{text-decoration:none;color:var(--ink);opacity:.55;white-space:nowrap}
  .lang-switch a:hover,.lang-switch a[aria-current="page"]{opacity:1;color:var(--coral)}
  .lang-switch .sep{color:rgba(16,13,26,.22);font-weight:400}
  footer .lang-switch a{color:rgba(255,255,255,.45)}
  footer .lang-switch a:hover,footer .lang-switch a[aria-current="page"]{color:#fff}
  footer .lang-switch .sep{color:rgba(255,255,255,.2)}
  @media(max-width:760px){nav .lang-switch{display:none}}
${extra}`;
}

function buildArticle(cfg) {
  const raw = fs.readFileSync(path.join(ROOT, cfg.md), 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const template = fs.readFileSync(path.join(ROOT, cfg.template), 'utf8');
  const cssMatch = template.match(/<style>([\s\S]*?)<\/style>/);
  const baseCss = cssMatch ? cssMatch[1] : '';
  const extraCss = cfg.checklist ? `\n  .checklist{list-style:none;margin-left:0}\n  .checklist li{position:relative;padding-left:28px;margin-bottom:12px}\n  .checklist li::before{content:"";position:absolute;left:0;top:8px;width:14px;height:14px;border:2px solid var(--coral);border-radius:3px}` : '';

  const hreflang = fm.hreflang;
  const urls = {
    en: hreflang.en,
    fi: hreflang['fi-FI'],
    it: hreflang['it-IT'],
  };

  const articleHtml = mdToHtml(body, { checklist: cfg.checklist });
  const citations = extractDois(body);
  const authorUrl = fm['meta-article:author'];
  const homeLabel = cfg.lang === 'fi' ? 'Koti' : 'Home';
  const blogLabel = 'Blogi';
  const blogPath = cfg.lang === 'fi' ? '/fi/blogi' : '/it/blog';

  const tocItems = [...body.matchAll(/^[\d]+\. \[([^\]]+)\]\(#([^)]+)\)/gm)].map((m) => ({ text: m[1], id: m[2] }));

  const altLocales = (fm['meta-og:locale:alternate'] || []).map((a) => `<meta property="og:locale:alternate" content="${a}">`).join('\n');

  const faqJson = cfg.type === 'trust' ? trustFaqJson(cfg.lang) : chooseFaqJson(cfg.lang);
  const jsonLd = buildArticleJsonLd(fm, cfg, citations, faqJson);

  const cta = cfg.lang === 'fi' ? buildFiCta(cfg.type) : buildItCta(cfg.type);

  const html = `<!DOCTYPE html>
<html lang="${cfg.lang}">
<head>
${analyticsHead(cfg.assets)}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fm.title}</title>
<meta name="description" content="${fm['meta-description']}">
<meta name="theme-color" content="#FF9E1B">
<meta name="author" content="${fm['meta-author']}">
<meta name="robots" content="${fm['meta-robots']}">
<link rel="icon" type="image/svg+xml" href="${cfg.assets}favicon.svg">
<link rel="apple-touch-icon" href="${cfg.assets}apple-touch-icon.svg">
<link rel="canonical" href="${fm.canonical}">
<link rel="alternate" hreflang="en" href="${hreflang.en}">
<link rel="alternate" hreflang="fi-FI" href="${hreflang['fi-FI']}">
<link rel="alternate" hreflang="it-IT" href="${hreflang['it-IT']}">
<link rel="alternate" hreflang="x-default" href="${hreflang['x-default']}">
<meta property="og:type" content="${fm['meta-og:type']}">
<meta property="og:url" content="${fm['meta-og:url']}">
<meta property="og:title" content="${fm['meta-og:title']}">
<meta property="og:description" content="${fm['meta-og:description']}">
<meta property="og:image" content="${fm['meta-og:image']}">
<meta property="og:image:width" content="${fm['meta-og:image:width']}">
<meta property="og:image:height" content="${fm['meta-og:image:height']}">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${fm['meta-og:locale']}">
${altLocales}
<meta property="article:published_time" content="${fm['meta-article:published_time']}">
<meta property="article:modified_time" content="${fm['meta-article:modified_time']}">
<meta property="article:section" content="${fm['meta-article:section']}">
<meta property="article:author" content="${authorUrl}">
<meta name="twitter:card" content="${fm['meta-twitter:card']}">
<meta name="twitter:title" content="${fm['meta-twitter:title']}">
<meta name="twitter:description" content="${fm['meta-twitter:description']}">
<meta name="twitter:image" content="${fm['meta-og:image']}">
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
<link rel="stylesheet" href="${cfg.assets}fonts.css">
<style>
${baseCss}
${articleCss(extraCss)}
</style>
</head>
<body>

${cfg.lang === 'fi' ? fiNav('blog', urls) : itNav('blog', urls)}

<header class="article-hero">
  <p class="crumbs" aria-label="Breadcrumb">
    <a href="${cfg.lang === 'fi' ? '/' : '/'}">${homeLabel}</a><span>/</span>
    <a href="${blogPath}">${blogLabel}</a><span>/</span>
    ${cfg.crumb}
  </p>
  <div class="eyebrow">${cfg.eyebrow}</div>
  <h1>${fm.h1}</h1>
  <p class="lede">${extractLede(body)}</p>
  <div class="byline">
    <span>${cfg.lang === 'fi' ? 'Kirjoittanut' : 'Di'} <a href="${authorUrl}">${fm['meta-author']}</a>${cfg.lang === 'fi' ? ' · Julkaistu 30.7.2026 · Päivitetty 2.8.2026 · ' + cfg.readMin + ' min lukuaika' : ' · Pubblicato il 30 luglio 2026 · Aggiornato il 2 agosto 2026 · ' + cfg.readMin + ' min di lettura'}</span>
  </div>
  <figure class="hero-figure">
    <picture>
      <source type="image/avif" srcset="${cfg.assets}blog/${cfg.heroImg}.avif">
      <source type="image/webp" srcset="${cfg.assets}blog/${cfg.heroImg}.webp">
      <img src="${cfg.assets}blog/${cfg.heroImg}.png" width="1200" height="675" alt="${fm['image-alt']}" fetchpriority="high">
    </picture>
  </figure>
</header>

<div class="layout">
  <aside class="toc" aria-label="${cfg.tocLabel}">
    <h2>${cfg.tocLabel}</h2>
    <ol>
${tocItems.map((t) => `      <li><a href="#${t.id}">${t.text}</a></li>`).join('\n')}
    </ol>
  </aside>

  <article itemscope itemtype="https://schema.org/BlogPosting">
    <meta itemprop="headline" content="${fm.h1.replace(/"/g, '&quot;')}">
    <meta itemprop="datePublished" content="${fm['meta-article:published_time']}">
    <meta itemprop="dateModified" content="${fm['meta-article:modified_time']}">
    <meta itemprop="author" content="${fm['meta-author']}">

${articleHtml}

${cta}
  </article>
</div>

${footer(cfg.lang, urls)}

<script>
  const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});
</script>
<script src="/assets/cookie-consent.js" defer></script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(path.join(ROOT, cfg.out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, cfg.out), html, 'utf8');
  return fs.statSync(path.join(ROOT, cfg.out)).size;
}

function extractLede(body) {
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('# ')) continue;
    if (line.trim() && !line.startsWith('**') && !line.startsWith('Kirjoittanut') && !line.startsWith('Di ') && !line.startsWith('Koti') && !line.startsWith('Home') && !line.startsWith('##')) {
      return line.trim();
    }
  }
  return '';
}

function buildFiCta(type) {
  if (type === 'trust') {
    return `    <div class="cta-band">
      <h2>Löydä sisällöntuottajat, joihin ihmiset jo luottavat</h2>
      <p>Promobeez yhdistää lähialueen yritykset nano- ja mikrotuottajiin, joiden yleisö asuu lähellä — vaihtokauppaa, selkeät merkinnät, ei provisioita.</p>
      <a class="btn" href="https://my.promobeez.com/auth/register?role=brand">Rekisteröidy ilmaiseksi →</a>
      <div class="cta-links">
        <a href="/fi/yrityksille">Yrityksille</a>
        <a href="/fi/blogi/miten-valita-paikallinen-sisallontuottaja">Miten valita paikallinen sisällöntuottaja</a>
        <a href="/fi/blogi">Kaikki artikkelit</a>
      </div>
    </div>`;
  }
  return `    <div class="cta-band">
      <h2>Yhdistä sisällöntuottajiin, jotka voivat oikeasti tulla käymään</h2>
      <p>Julkaise vaihtokauppatarjous, katso paikalliset hakijat ja avaa yhteystiedot silloin kun sopivuus on kohdallaan — ei provisiota kaupasta.</p>
      <a class="btn" href="https://my.promobeez.com/auth/register?role=brand">Rekisteröidy ilmaiseksi →</a>
      <div class="cta-links">
        <a href="/fi/sisallontuottajille">Sisällöntuottajille</a>
        <a href="/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin">Näyttö tämän takana</a>
        <a href="/fi/blogi">Kaikki artikkelit</a>
      </div>
    </div>`;
}

function buildItCta(type) {
  if (type === 'trust') {
    return `    <div class="cta-band">
      <h2>Trova creator di cui le persone si fidano già</h2>
      <p>Promobeez collega le attività di quartiere con nano e micro creator il cui pubblico vive lì vicino — scambi in barter, disclosure chiara, nessuna commissione.</p>
      <a class="btn" href="https://my.promobeez.com/auth/register?role=brand">Iscriviti gratis →</a>
      <div class="cta-links">
        <a href="/it/per-le-attivita">Per le attività</a>
        <a href="/it/blog/come-scegliere-un-creator-locale">Come scegliere un creator locale</a>
        <a href="/it/blog">Tutti gli articoli</a>
      </div>
    </div>`;
  }
  return `    <div class="cta-band">
      <h2>Trova creator che possono davvero passare a trovarvi</h2>
      <p>Pubblicate un'offerta in barter, guardate chi si candida dalla zona e sbloccate i contatti quando l'abbinamento funziona — nessuna commissione sullo scambio.</p>
      <a class="btn" href="https://my.promobeez.com/auth/register?role=brand">Iscriviti gratis →</a>
      <div class="cta-links">
        <a href="/it/per-i-creator">Per i creator</a>
        <a href="/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator">Le evidenze dietro questo metodo</a>
        <a href="/it/blog">Tutti gli articoli</a>
      </div>
    </div>`;
}

function trustFaqJson(lang) {
  if (lang === 'fi') {
    return [
      { q: 'Voittavatko pienet sisällöntuottajat aina?', a: 'Eivät. Pienet tuottajat voittavat usein luottamuksessa, sitoutumisen tehokkuudessa ja liikevaihdossa seuraajaa kohden niissä maksetuissa Instagram-konteksteissa, joita on tähän mennessä tutkittu. Suuremmat tuottajat voivat silti voittaa massatunnettuudessa, statusviestinnässä ja joissakin meta-analyyseissä ostoaikomuksessa volyymilla.' },
      { q: 'Voinko käyttää Journal of Marketingin liikevaihtolukuja omana vertailulukunani?', a: 'Käytä niitä suuntaa-antavana näyttönä siitä, että pienemmät tuottajat voivat olla tehokkaampia — älä yleispätevänä kertoimena. Beichertin ym. (2024) pääaineisto oli eurooppalainen muodin suoramyyntiyritys, joka käytti alennuskoodeja, ei ravintolakäyntejä tai paikallisia vaihtokauppakampanjoita.' },
      { q: 'Tuhoaako merkintä luottamuksen?', a: 'Ei välttämättä. Kay, Mulcahy ja Parkinson (2020) havaitsivat, että kaupallisen yhteistyön merkinneet mikrovaikuttajat tuottivat korkeamman ostoaikomuksen kuin merkitsemättä jättäneet makrovaikuttajat. Varhainen ja selkeä merkintä voi lukea rehellisyytenä, kun lähde tuntuu jo valmiiksi vertaiselta.' },
    ];
  }
  return [
    { q: 'I piccoli creator vincono sempre?', a: 'No. I piccoli creator vincono spesso su fiducia, efficienza dell\'engagement e ricavi per follower nei contesti Instagram a pagamento studiati finora. I creator più grandi possono ancora vincere sulla notorietà di massa, sul segnale di status e, in alcune meta-analisi, sull\'intenzione d\'acquisto a volume.' },
    { q: 'Posso usare i dati sui ricavi del Journal of Marketing come benchmark per la mia attività?', a: 'Usateli come evidenza direzionale che i creator più piccoli possono essere più efficienti, non come moltiplicatore universale. Il dataset principale di Beichert et al. (2024) era un\'azienda europea di moda direct-to-consumer che usava codici sconto, non visite al ristorante né campagne locali in barter.' },
    { q: 'La disclosure distrugge la fiducia?', a: 'Non necessariamente. Kay, Mulcahy e Parkinson (2020) hanno trovato che i micro influencer che dichiaravano la sponsorizzazione producevano intenzioni d\'acquisto più alte dei macro che non la dichiaravano. Una disclosure precoce e chiara può risultare onesta quando la fonte sembra già un pari.' },
  ];
}

function chooseFaqJson(lang) {
  if (lang === 'fi') {
    return [
      { q: 'Kuinka monta seuraajaa riittää?', a: 'Riittävä seuraajamäärä on se, joka tuottaa kaupallisesti relevanttia tavoittavuutta sinun palvelualueellasi — ei mikään yleispätevä luku. Nano- tai mikrotuottaja, jolla on keskittynyt paikallinen yleisö, voittaa usein suuremman tuottajan, jonka seuraajat eivät voi tulla käymään.' },
      { q: 'Mitä tarjoan sisällöntuottajalle Reels-videosta?', a: 'Tarjoa jotain, jonka tuottaja uskottavasti ostaisi muutenkin — kahvi Reelsistä, pöytä arviosta, kuntosalikuukausi julkaisusta — selkeällä vähittäisarvolla ja selkeällä toimituksella. Kaverin mukaan ottaminen ja toistuvat pienet tarjoukset voittavat yleensä yhden ylisuuren lahjan.' },
      { q: 'Pitääkö lahjaksi saatu ateria merkitä mainokseksi Suomessa?', a: 'Kyllä, kun ateria tai palvelu on saatu mainostarkoituksessa. KKV:n vuonna 2025 päivitetty ohjeistus edellyttää selkeää kaupallista merkintää, kuten Mainos/lahja [Brändi], näkyvissä heti kun kuluttaja näkee sisällön. Tämä ei ole oikeudellinen neuvo.' },
      { q: 'Miten tiedän, toimiko se?', a: 'Priorisoi tallennukset, jaot, yksityisviestit ja kassalla tehdyt maininnat raa\'an tavoittavuuden edelle. Käytä koodisanaa tai "mainitse Reels" -pyyntöä, ja arvioi lyhyt yhteistyösarja yksittäisen julkaisun sijaan.' },
    ];
  }
  return [
    { q: 'Quanti follower bastano?', a: 'Bastano quelli che producono reach commercialmente rilevante nella vostra zona di servizio, non un numero universale. Un nano o micro creator con pubblico locale concentrato spesso batte un creator più grande i cui follower non possono venire.' },
    { q: 'Cosa offro a un creator per un reel?', a: 'Offrite qualcosa che il creator avrebbe plausibilmente comprato comunque — un caffè per un reel, un tavolo per una recensione, un mese di palestra per un post — con un valore di listino leggibile e una consegna chiara. Accompagnatore incluso e offerte piccole ricorrenti di solito battono un unico regalo sovradimensionato.' },
    { q: 'Un pasto offerto va dichiarato come pubblicità in Italia?', a: 'Sì, quando il pasto o il servizio viene ricevuto a fini promozionali. Il Regolamento Digital Chart dello IAP, richiamato dalle Linee guida AGCOM, richiede una segnaletica chiara e visibile fin da subito — per esempio #adv o, nel caso di gifting, #prodottofornitoda [Brand]. Questa non è consulenza legale.' },
    { q: 'Come faccio a sapere se ha funzionato?', a: 'Date priorità a salvataggi, condivisioni, DM e citazioni alla cassa rispetto alla reach grezza. Usate una parola in codice o il "cita il reel", e valutate una serie breve di collaborazioni invece di un singolo post.' },
  ];
}

function buildArticleJsonLd(fm, cfg, citations, faqItems) {
  const authorUrl = fm['meta-article:author'];
  const blogUrl = cfg.lang === 'fi' ? `${BASE}/fi/blogi` : `${BASE}/it/blog`;
  const homeName = cfg.lang === 'fi' ? 'Koti' : 'Home';
  const blogName = cfg.lang === 'fi' ? 'Blogi' : 'Blog';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${fm.canonical}#article`,
        headline: fm.h1,
        description: fm['meta-description'],
        image: { '@type': 'ImageObject', url: fm['meta-og:image'], width: 1200, height: 675 },
        datePublished: fm['meta-article:published_time'],
        dateModified: fm['meta-article:modified_time'],
        author: {
          '@type': 'Person',
          '@id': `${authorUrl}#person`,
          name: fm['meta-author'],
          url: authorUrl,
          sameAs: ['https://www.linkedin.com/in/andrewshepelev/'],
        },
        publisher: {
          '@type': 'Organization',
          '@id': `${BASE}/#organization`,
          name: 'Promobeez',
          legalName: 'Daring Spirit Oy',
          url: `${BASE}/`,
          logo: { '@type': 'ImageObject', url: `${BASE}/assets/logo-transparent.png`, width: 512, height: 512 },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': fm.canonical },
        isPartOf: { '@type': 'Blog', name: 'Promobeez Blog', url: blogUrl },
        inLanguage: cfg.lang,
        citation: citations,
      },
      {
        '@type': 'Person',
        '@id': `${authorUrl}#person`,
        name: fm['meta-author'],
        url: authorUrl,
        sameAs: ['https://www.linkedin.com/in/andrewshepelev/'],
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
          { '@type': 'ListItem', position: 1, name: homeName, item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: blogName, item: blogUrl },
          { '@type': 'ListItem', position: 3, name: fm.h1 },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

function buildIndex(cfg) {
  const raw = fs.readFileSync(path.join(ROOT, cfg.md), 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const template = fs.readFileSync(path.join(ROOT, 'blog.html'), 'utf8');
  const cssMatch = template.match(/<style>([\s\S]*?)<\/style>/);
  const baseCss = cssMatch ? cssMatch[1] : '';
  const hreflang = fm.hreflang;
  const urls = { en: hreflang.en, fi: hreflang['fi-FI'], it: hreflang['it-IT'] };
  const altLocales = (fm['meta-og:locale:alternate'] || []).map((a) => `<meta property="og:locale:alternate" content="${a}">`).join('\n');

  const cards = cfg.lang === 'fi'
    ? [
        { url: '/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin', img: 'small-creator-trust', date: '2026-07-30', meta: '30.7.2026 · 15 min lukuaika · Tutkimuskatsaus · Andrey Shepelev', title: 'Miksi yleisö luottaa pieniin sisällöntuottajiin enemmän kuin brändin mainoksiin', excerpt: 'Pienen sisällöntuottajan luottamusetu: miksi vertaissuositus voittaa oman kehun, mitä Nielsen ja vertaisarvioitu tutkimus osoittavat, ja mikä on nanotuottajien liikevaihtonäyttö.', more: 'Lue artikkeli →' },
        { url: '/fi/blogi/miten-valita-paikallinen-sisallontuottaja', img: 'local-creators-vs-famous', date: '2026-07-30', meta: '30.7.2026 · 12 min lukuaika · Opas · Andrey Shepelev', title: 'Miten valita paikallinen sisällöntuottaja yrityksellesi', excerpt: 'Käytännön käsikirja kahvila- ja kampaamoyrittäjille: kaupallisesti relevantti tavoittavuus, 10 kohdan valintalista, mitä tarjota vaihtokaupassa ja miten mittaat toimiko se.', more: 'Lue artikkeli →' },
      ]
    : [
        { url: '/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator', img: 'small-creator-trust', date: '2026-07-30', meta: '30 luglio 2026 · 15 min di lettura · Rassegna delle evidenze · Andrey Shepelev', title: 'Perché il pubblico si fida dei piccoli creator più che degli annunci dei brand', excerpt: 'Il premio di fiducia dei piccoli creator: perché la raccomandazione fra pari batte l\'autopromozione, cosa mostrano Nielsen e la ricerca peer-reviewed, e quali sono le evidenze sui ricavi dei nano creator.', more: 'Leggi l\'articolo →' },
        { url: '/it/blog/come-scegliere-un-creator-locale', img: 'local-creators-vs-famous', date: '2026-07-30', meta: '30 luglio 2026 · 12 min di lettura · Guida operativa · Andrey Shepelev', title: 'Come scegliere un creator locale per la tua attività', excerpt: 'Un manuale pratico per chi gestisce bar e saloni: reach commercialmente rilevante, checklist di selezione a 10 fattori, cosa offrire in un barter, e come capire se ha funzionato.', more: 'Leggi l\'articolo →' },
      ];

  const introParas = body.split(/\n\n/).filter((p) => p.trim() && !p.startsWith('**') && !p.startsWith('#') && !p.startsWith('---') && !p.includes('30.7.2026') && !p.includes('30 luglio')).slice(0, 2);

  const itemList = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${fm.canonical}#webpage`,
        url: fm.canonical,
        name: fm.h1,
        description: fm['meta-description'],
        isPartOf: { '@id': `${BASE}/#website` },
        publisher: { '@id': `${BASE}/#organization` },
        inLanguage: cfg.lang,
        mainEntity: { '@id': `${fm.canonical}#itemlist` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: cfg.lang === 'fi' ? 'Koti' : 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: cfg.lang === 'fi' ? 'Blogi' : 'Blog' },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${fm.canonical}#itemlist`,
        name: cfg.lang === 'fi' ? 'Promobeez blogi' : 'Promobeez blog',
        numberOfItems: 2,
        itemListElement: cards.map((c, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${BASE}${c.url}`,
          name: c.title,
        })),
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'Promobeez',
        legalName: 'Daring Spirit Oy',
        url: `${BASE}/`,
        logo: { '@type': 'ImageObject', url: `${BASE}/assets/logo-transparent.png`, width: 512, height: 512 },
      },
    ],
  };

  const cardsHtml = cards
    .map(
      (c, idx) => `<article class="post-card"${idx ? ' style="margin-top:48px"' : ''}>
    <figure aria-hidden="true">
      <picture>
        <source type="image/avif" srcset="${cfg.assets}blog/${c.img}.avif">
        <source type="image/webp" srcset="${cfg.assets}blog/${c.img}.webp">
        <img src="${cfg.assets}blog/${c.img}.png" width="1200" height="675" alt="" loading="${idx ? 'lazy' : 'eager'}"${idx ? '' : ' fetchpriority="high"'}>
      </picture>
    </figure>
    <div class="post-meta"><time datetime="${c.date}">${c.meta.split(' · ')[0]}</time><span>${c.meta.split(' · ').slice(1).join(' · ')}</span></div>
    <h2 class="post-title"><a href="${c.url}">${c.title}</a></h2>
    <p class="post-excerpt">${c.excerpt}</p>
    <p class="post-more">${c.more.replace('→', '<span aria-hidden="true">→</span>')}</p>
  </article>`
    )
    .join('\n\n  ');

  const html = `<!DOCTYPE html>
<html lang="${cfg.lang}">
<head>
${analyticsHead(cfg.assets)}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fm.title}</title>
<meta name="description" content="${fm['meta-description']}">
<meta name="theme-color" content="#FF9E1B">
<meta name="robots" content="${fm['meta-robots']}">
<link rel="icon" type="image/svg+xml" href="${cfg.assets}favicon.svg">
<link rel="apple-touch-icon" href="${cfg.assets}apple-touch-icon.svg">
<link rel="canonical" href="${fm.canonical}">
<link rel="alternate" hreflang="en" href="${hreflang.en}">
<link rel="alternate" hreflang="fi-FI" href="${hreflang['fi-FI']}">
<link rel="alternate" hreflang="it-IT" href="${hreflang['it-IT']}">
<link rel="alternate" hreflang="x-default" href="${hreflang['x-default']}">
<meta property="og:type" content="${fm['meta-og:type']}">
<meta property="og:url" content="${fm['meta-og:url']}">
<meta property="og:title" content="${fm['meta-og:title']}">
<meta property="og:description" content="${fm['meta-og:description']}">
<meta property="og:image" content="${fm['meta-og:image']}">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${fm['meta-og:locale']}">
${altLocales}
<meta name="twitter:card" content="${fm['meta-twitter:card']}">
<meta name="twitter:title" content="${fm['meta-twitter:title']}">
<meta name="twitter:description" content="${fm['meta-twitter:description']}">
<meta name="twitter:image" content="${fm['meta-og:image']}">
<script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
</script>
<link rel="stylesheet" href="${cfg.assets}fonts.css">
<style>
${baseCss}
${articleCss('')}
</style>
</head>
<body>

${cfg.lang === 'fi' ? fiNav('blog', urls) : itNav('blog', urls)}

<header class="page-hero">
  <div class="mesh" aria-hidden="true"><span class="m1"></span><span class="m2"></span><span class="m3"></span></div>
  <div class="hero-copy">
    <div class="eyebrow">${cfg.lang === 'fi' ? 'Näkemyksiä' : 'Approfondimenti'}</div>
    <h1>${fm.h1}</h1>
    <div class="intro">
${introParas.map((p) => `      <p>${inlineMd(p.trim())}</p>`).join('\n')}
    </div>
  </div>
</header>

<main class="posts">
  ${cardsHtml}
</main>

${footer(cfg.lang, urls)}

<script>
  const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});
</script>
<script src="/assets/cookie-consent.js" defer></script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(path.join(ROOT, cfg.out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, cfg.out), html, 'utf8');
  return fs.statSync(path.join(ROOT, cfg.out)).size;
}

const articles = [
  { md: 'content-fi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin.fi.md', out: 'fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin.html', template: 'blog/why-audiences-trust-small-creators-more-than-brands.html', assets: '../../assets/', lang: 'fi', type: 'trust', heroImg: 'small-creator-trust', crumb: 'Pienen sisällöntuottajan luottamusetu', eyebrow: 'Tutkimuskatsaus', readMin: '15', tocLabel: 'Tällä sivulla' },
  { md: 'content-fi/miten-valita-paikallinen-sisallontuottaja.fi.md', out: 'fi/blogi/miten-valita-paikallinen-sisallontuottaja.html', template: 'blog/how-to-choose-a-local-creator.html', assets: '../../assets/', lang: 'fi', type: 'choose', heroImg: 'local-creators-vs-famous', crumb: 'Miten valita paikallinen sisällöntuottaja', eyebrow: 'Opas', readMin: '12', tocLabel: 'Tällä sivulla', checklist: true },
  { md: 'content-it/perche-il-pubblico-si-fida-dei-piccoli-creator.it.md', out: 'it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator.html', template: 'blog/why-audiences-trust-small-creators-more-than-brands.html', assets: '../../assets/', lang: 'it', type: 'trust', heroImg: 'small-creator-trust', crumb: 'Il premio di fiducia dei piccoli creator', eyebrow: 'Rassegna delle evidenze', readMin: '15', tocLabel: 'In questa pagina' },
  { md: 'content-it/come-scegliere-un-creator-locale.it.md', out: 'it/blog/come-scegliere-un-creator-locale.html', template: 'blog/how-to-choose-a-local-creator.html', assets: '../../assets/', lang: 'it', type: 'choose', heroImg: 'local-creators-vs-famous', crumb: 'Come scegliere un creator locale', eyebrow: 'Guida operativa', readMin: '12', tocLabel: 'In questa pagina', checklist: true },
];

const indexes = [
  { md: 'content-fi/blogi-index.fi.md', out: 'fi/blogi.html', assets: '../assets/', lang: 'fi' },
  { md: 'content-it/blog-index.it.md', out: 'it/blog.html', assets: '../assets/', lang: 'it' },
];

const written = [];
for (const a of articles) written.push({ file: a.out, bytes: buildArticle(a) });
for (const i of indexes) written.push({ file: i.out, bytes: buildIndex(i) });
console.log(JSON.stringify(written, null, 2));
