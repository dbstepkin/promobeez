#!/usr/bin/env node
/**
 * Builds the Promobeez SMM Awards pages from content/awards/editions.js.
 *
 *   node scripts/build-awards.js
 *
 * Output:
 *   promobeez-smm-awards.html            hub, shows the featured edition (EN)
 *   fi/promobeez-smm-awards.html         hub (FI)
 *   promobeez-smm-awards/<slug>.html     every other published edition (EN)
 *   fi/promobeez-smm-awards/<slug>.html  every other published edition (FI)
 *
 * Nav, footer and base CSS are lifted from the awards blog article so the pages
 * stay in step with the rest of the site.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = require('../content/awards/editions.js');
const SITE = 'https://www.promobeez.com';
const BASE = { en: '/promobeez-smm-awards', fi: '/fi/promobeez-smm-awards' };
const SHELL_SRC = {
  en: 'blog/best-restaurant-social-media-helsinki-q3-2026.html',
  fi: 'fi/blogi/helsingin-paras-ravintola-some-q3-2026.html',
};

const T = {
  en: {
    htmlLang: 'en', ogLocale: 'en_FI', ogAlt: 'fi_FI',
    brand: 'Promobeez SMM Awards',
    title: (e) => `Promobeez SMM Awards: ${ind(e, 'en')}, ${e.city}, ${q(e, 'en')} | Promobeez`,
    desc: (e) => `The social media award nobody can apply for. ${q(e, 'en')} results for ${ind(e, 'en').toLowerCase()} in ${e.city}: overall winner ${e.overall.name}, category winners and the method in brief. Public data only, no jury, no votes.`,
    h1: (e) => `${e.city}'s best social media, measured, not nominated`,
    h1Html: (e) => `${esc(e.city)}'s best social media, <em>measured, not nominated</em>`,
    lede: 'We rank local businesses by one thing: how their own audience responds on social media. Public data only. No entry form, no jury, no votes.',
    whyTitle: 'Why it won', aboutTitle: 'About the place',
    industry: 'Industry', quarter: 'Quarter', soon: 'upcoming', moreIndustries: 'More industries',
    results: (e) => `${ind(e, 'en')} in ${e.city}, ${q(e, 'en')}`,
    measured: (e) => `Measured on ${e.network}. Data as of ${date(e.dataAsOf, 'en')}.`,
    outOf: 'out of 100', followers: 'followers', website: 'Website', photo: 'Photo',
    fullResults: 'Full results and methodology →',
    fullResultsNote: 'District top 10s, city top 10, chain ranking, benchmarks and every formula are in the article.',
    checkTitle: 'Where would your Instagram rank?',
    checkLede: (e) => `Enter your account. We score it with the same formula as the awards and email you the result: your score and the place it would take ${e.cityIn.en}.`,
    igLabel: 'Instagram account', igPh: '@yourplace or instagram.com/yourplace', next: 'Next →',
    emailTitle: 'Where should we send the result?', emailLabel: 'Email address', emailPh: 'you@example.com',
    send: 'Send me my place', change: '← Change account',
    consent: 'We use your email to send this result.', privacy: 'Privacy policy', privacyHref: '/privacy',
    okTitle: 'Done.', okText: 'We are scoring @{ig} and will email the result to {email}.',
    errIg: 'That does not look like an Instagram account. Try @name or a profile link.',
    errEmail: 'Check the email address.',
    errRate: 'Too many requests. Try again in a few minutes.',
    errGeneric: 'Something went wrong. Try again in a minute.',
    approachTitle: 'How it works, in brief',
    nots: [
      ['No entry', 'Nobody applies and nobody pays. If a business is on Google Maps and its website links its own public account, it is in.'],
      ['No opt-out', 'A business cannot stay out to avoid a bad result. Everyone is measured on the same public data.'],
      ['No jury, no votes', 'No personal taste and no "vote for us" campaigns. The formula decides, and the formula is published.'],
    ],
    scoreParts: [
      ['80%', 'Results', 'How strongly a typical post lands, compared with what is normal for an account of that size.'],
      ['20%', 'Stability', 'The account keeps posting, and its weaker posts hold up too.'],
    ],
    noPoints: 'Follower count, giveaways and one viral post earn nothing.',
    editionsTitle: 'All editions',
    editionsLede: 'One edition is one industry in one city for one quarter. New ones are added here as they are published.',
    current: 'Results', viewResults: 'View results →', onThisPage: 'On this page',
    upcomingCard: 'Next edition', moreCard: 'More industries and cities will be added.',
    ctaTitle: "Want your account in next quarter's results?",
    ctaText: 'The accounts that win are the ones real locals react to. Promobeez connects local businesses with nano and micro creators on a barter basis: a meal or a service for content, no agency fee.',
    ctaBtn: 'For businesses →', ctaHref: '/for-businesses',
    heroCta: 'See the winners', heroCta2: 'Check your Instagram',
    home: 'Home', homeHref: '/', crumb: 'SMM Awards',
  },
  fi: {
    htmlLang: 'fi', ogLocale: 'fi_FI', ogAlt: 'en_FI',
    brand: 'Promobeez SMM Awards',
    title: (e) => `Promobeez SMM Awards: ${ind(e, 'fi')}, ${e.city}, ${q(e, 'fi')} | Promobeez`,
    desc: (e) => `Somepalkinto, johon ei voi hakea. Tulokset ${q(e, 'fi')}, ${ind(e, 'fi').toLowerCase()}, ${e.city}: kokonaisvoittaja ${e.overall.name}, sarjojen voittajat ja menetelmä lyhyesti. Vain julkista dataa, ei raatia, ei äänestystä.`,
    h1: () => 'Somepalkinto, johon ei voi hakea',
    h1Html: () => 'Somepalkinto, <em>johon ei voi hakea</em>',
    lede: 'Asetamme paikalliset yritykset järjestykseen yhden asian perusteella: miten niiden oma yleisö reagoi somessa. Vain julkista dataa. Ei hakulomaketta, ei raatia, ei äänestystä.',
    whyTitle: 'Miksi voitti', aboutTitle: 'Paikasta',
    industry: 'Toimiala', quarter: 'Neljännes', soon: 'tulossa', moreIndustries: 'Lisää toimialoja',
    results: (e) => `${ind(e, 'fi')}, ${e.city}, ${q(e, 'fi')}`,
    measured: (e) => `Mitattu Instagramissa. Aineisto ${date(e.dataAsOf, 'fi')}.`,
    outOf: 'pistettä sadasta', followers: 'seuraajaa', website: 'Verkkosivut', photo: 'Kuva',
    fullResults: 'Koko tulokset ja menetelmä →',
    fullResultsNote: 'Alueiden kärkikymmeniköt, koko kaupungin kärkikymmenikkö, ketjujen sarja, vertailuluvut ja kaikki kaavat löytyvät artikkelista.',
    checkTitle: 'Monenneksi sinun Instagramisi sijoittuisi?',
    checkLede: (e) => `Kirjoita tilisi. Pisteytämme sen samalla kaavalla kuin palkinnon tilit ja lähetämme tuloksen sähköpostiisi: pisteet ja sijan, jolle tili ${e.cityIn.fi} yltäisi.`,
    igLabel: 'Instagram-tili', igPh: '@paikkasi tai instagram.com/paikkasi', next: 'Seuraava →',
    emailTitle: 'Mihin lähetämme tuloksen?', emailLabel: 'Sähköpostiosoite', emailPh: 'sina@esimerkki.fi',
    send: 'Lähetä sijoitukseni', change: '← Vaihda tili',
    consent: 'Käytämme sähköpostiosoitettasi tämän tuloksen lähettämiseen.', privacy: 'Tietosuojaseloste', privacyHref: '/privacy',
    okTitle: 'Valmista.', okText: 'Pisteytämme tiliä @{ig} ja lähetämme tuloksen osoitteeseen {email}.',
    errIg: 'Tämä ei näytä Instagram-tililtä. Kokeile muotoa @nimi tai profiilin linkkiä.',
    errEmail: 'Tarkista sähköpostiosoite.',
    errRate: 'Liian monta pyyntöä. Yritä muutaman minuutin päästä uudelleen.',
    errGeneric: 'Jokin meni vikaan. Yritä hetken päästä uudelleen.',
    approachTitle: 'Menetelmä lyhyesti',
    nots: [
      ['Ei hakemusta', 'Kukaan ei hae eikä kukaan maksa. Jos yritys on Google Mapsissa ja sen sivuilta on linkki sen omaan julkiseen tiliin, se on mukana.'],
      ['Ei poisjääntiä', 'Yritys ei voi jäädä pois välttääkseen huonon tuloksen. Kaikki mitataan samalla julkisella datalla.'],
      ['Ei raatia, ei ääniä', 'Ei henkilökohtaisia mieltymyksiä eikä ”äänestä meitä” -kampanjoita. Kaava ratkaisee, ja kaava on julkaistu.'],
    ],
    scoreParts: [
      ['80 %', 'Tulokset', 'Kuinka vahvasti tyypillinen julkaisu osuu verrattuna siihen, mikä on tavallista samankokoiselle tilille.'],
      ['20 %', 'Vakaus', 'Tili julkaisee säännöllisesti, ja myös sen heikommat julkaisut pitävät tasonsa.'],
    ],
    noPoints: 'Seuraajamäärästä, arvonnoista tai yhdestä viraalijulkaisusta ei saa pisteitä.',
    editionsTitle: 'Kaikki kierrokset',
    editionsLede: 'Yksi kierros on yksi toimiala yhdessä kaupungissa yhden neljänneksen ajalta. Uudet lisätään tähän sitä mukaa kuin ne julkaistaan.',
    current: 'Tulokset', viewResults: 'Katso tulokset →', onThisPage: 'Tällä sivulla',
    upcomingCard: 'Seuraava kierros', moreCard: 'Lisää toimialoja ja kaupunkeja on tulossa.',
    ctaTitle: 'Haluatko tilisi ensi neljänneksen tuloksiin?',
    ctaText: 'Voittavat tilit ovat niitä, joihin oikeat paikalliset reagoivat. Promobeez yhdistää paikalliset yritykset nano- ja mikrotuottajiin vaihtokaupalla: ateria tai palvelu sisältöä vastaan, ilman toimistopalkkiota.',
    ctaBtn: 'Yrityksille →', ctaHref: '/fi/yrityksille',
    heroCta: 'Katso voittajat', heroCta2: 'Testaa Instagramisi',
    home: 'Koti', homeHref: '/fi', crumb: 'SMM Awards',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const loc = (v, lang) => (v && typeof v === 'object' ? v[lang] : v);
const ind = (e, lang) => DATA.industries[e.industry][lang];
const q = (e, lang) => (lang === 'fi' ? `Q${e.quarter}/${e.year}` : `Q${e.quarter} ${e.year}`);
const num = (n, lang) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'fi' ? ' ' : ',');
const score = (n, lang) => (lang === 'fi' ? n.toFixed(1).replace('.', ',') : n.toFixed(1));
function date(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'fi') return `${d}.${m}.${y}`;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}
const order = (a, b) => b.year - a.year || b.quarter - a.quarter;
const featured = DATA.editions.find((e) => e.featured) || [...DATA.editions].sort(order)[0];
const urlOf = (e, lang) => (e === featured ? BASE[lang] : `${BASE[lang]}/${e.slug}`);
const ig = (h) => `https://www.instagram.com/${h}/`;
const EXT = 'target="_blank" rel="nofollow noopener noreferrer"';

function between(src, start, end, file) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`build-awards: marker "${start}" … "${end}" not found in ${file}`);
  return src.slice(a, b + end.length);
}

/** Nav, footer and shared CSS from an existing page, with the language switch repointed. */
function shell(lang, e) {
  const file = SHELL_SRC[lang];
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const css = between(src, '*,*::before', '.article-hero{', file).replace(/\.article-hero\{$/, '') +
    between(src, '  footer{', '/* --- awards article --- */', file).replace('/* --- awards article --- */', '');
  const sw = (cur) => `<div class="lang-switch__menu" role="list"><a href="${urlOf(e, 'en')}" hreflang="en" lang="en"${cur === 'en' ? ' aria-current="page"' : ''}>English</a><a href="${urlOf(e, 'fi')}" hreflang="fi" lang="fi"${cur === 'fi' ? ' aria-current="page"' : ''}>Suomeksi</a></div>`;
  const fix = (html) => html
    .replace(/<div class="lang-switch__menu"[\s\S]*?<\/div>/g, sw(lang))
    .replace(/(<a href="[^"]*\/blogi?")\s+aria-current="page"/, '$1');
  return {
    css,
    nav: fix(between(src, '<nav id="nav">', '</nav>', file)).replace(`<a href="${BASE[lang]}">Awards</a>`, `<a href="${BASE[lang]}" aria-current="page">Awards</a>`),
    footer: fix(between(src, '<footer>', '</footer>', file)),
  };
}

const NAV_FIT = {
  en: `  @media(max-width:1200px){.nav-links{gap:18px}}
  @media(max-width:1080px){.nav-links>a[href$="#pricing"]{display:none}}
  @media(max-width:1030px){.nav-links>a[href$="#how"]{display:none}}
  @media(max-width:920px){.nav-links>a[href$="/blog"]{display:none}}
  @media(max-width:870px){.nav-links>a[href*="creator"]{display:none}}
`,
  fi: `  @media(max-width:1300px){.nav-links{gap:18px}}
  @media(max-width:1200px){.nav-links>a[href$="#pricing"]{display:none}}
  @media(max-width:1090px){.nav-links>a[href$="#how"]{display:none}}
  @media(max-width:975px){.nav-links>a[href$="/blogi"]{display:none}}
  @media(max-width:925px){.nav-links>a[href*="sisallontuottajille"]{display:none}}
`,
};

const CSS = `
  main{display:block}
  .wrap{max-width:1240px;margin:0 auto;padding-left:48px;padding-right:48px}
  h2{font-size:clamp(28px,min(3.6vw,6vh),46px);letter-spacing:-.025em}
  .btn{display:inline-flex;align-items:center;justify-content:center;background:var(--ink);color:#fff;text-decoration:none;padding:15px 28px;border-radius:100px;font-weight:600;font-size:15px;border:0;cursor:pointer;font-family:inherit;white-space:nowrap}
  .btn:hover{opacity:.9}
  .btn[disabled]{opacity:.55;cursor:default}
  .btn-y{background:var(--yellow);color:var(--ink)}
  .btn-ghost{background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4)}
  .btn-ghost:hover{box-shadow:inset 0 0 0 1.5px #fff;opacity:1}

  /* nav sits on the dark hero until the page scrolls */
  #nav:not(.scrolled) .logo,#nav:not(.scrolled) .nav-links>a,#nav:not(.scrolled) .nav-login,#nav:not(.scrolled) .lang-switch summary{color:#fff}
  #nav:not(.scrolled) .nav-cta{background:#fff;color:var(--ink)!important}
  #nav:not(.scrolled) .nav-auth{border-left-color:rgba(255,255,255,.22)}
  #nav:not(.scrolled) .lang-switch summary:hover,#nav:not(.scrolled) .lang-switch[open] summary{background:rgba(255,255,255,.1)}
  #nav:not(.scrolled) .beemark path{stroke:#fff}

  /* ---------- hero ---------- */
  .hero{position:relative;color:#fff;min-height:100svh;display:flex;flex-direction:column;overflow:hidden;
    background:
      radial-gradient(60% 70% at 88% 18%,rgba(255,158,27,.4) 0,rgba(255,158,27,0) 60%),
      radial-gradient(55% 65% at 8% 100%,rgba(255,90,60,.36) 0,rgba(255,90,60,0) 62%),
      var(--ink)}
  .hero-in{flex:1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(32px,6vw,96px);align-items:center;width:100%;
    padding-top:max(96px,calc(84px + env(safe-area-inset-top,0px)));padding-bottom:24px}
  .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--yellow);
    padding:8px 14px 8px 11px;border-radius:100px;background:rgba(255,201,60,.12);box-shadow:inset 0 0 0 1px rgba(255,201,60,.35);margin-bottom:clamp(18px,3.4vh,34px)}
  .eyebrow svg{width:17px;height:17px}
  .hero h1{font-size:clamp(40px,min(5.6vw,10.4vh),100px);line-height:.98;letter-spacing:-.035em;margin-bottom:clamp(16px,3.4vh,34px);text-wrap:balance}
  .hero h1 em{font-style:normal;background:linear-gradient(100deg,var(--tang),var(--yellow));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .lede{font-size:clamp(16px,2.5vh,21px);line-height:1.5;color:rgba(255,255,255,.8);max-width:520px;margin-bottom:clamp(20px,4.4vh,44px)}
  .hero-cta{display:flex;flex-wrap:wrap;gap:12px}

  .collage{position:relative;justify-self:end;width:100%;max-width:min(520px,62vh);aspect-ratio:1/1.06}
  .collage img{position:absolute;object-fit:cover;border-radius:24px;box-shadow:0 30px 70px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08);display:block;height:auto}
  .collage .c1{right:0;top:0;width:60%;aspect-ratio:1;transform:rotate(4deg)}
  .collage .c2{left:0;top:26%;width:52%;aspect-ratio:4/5;transform:rotate(-5deg)}
  .collage .c3{right:4%;bottom:0;width:50%;aspect-ratio:4/3.4;transform:rotate(-2deg)}
  .medal{position:absolute;left:34%;top:6%;width:84px;height:84px;border-radius:50%;background:linear-gradient(140deg,var(--yellow),var(--tang));color:var(--ink);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px rgba(0,0,0,.4);transform:rotate(-10deg)}
  .medal svg{width:40px;height:40px}

  .switch{display:flex;flex-wrap:wrap;gap:10px 40px;padding:18px 0 24px;border-top:1px solid rgba(255,255,255,.12)}
  .switch-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .switch-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-right:4px}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:100px;font-size:13.5px;font-weight:600;color:#fff;text-decoration:none;line-height:1.2;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
  a.chip:hover{box-shadow:inset 0 0 0 1px #fff}
  .chip[aria-current]{background:#fff;color:var(--ink);box-shadow:none}
  .chip.off{box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);color:rgba(255,255,255,.55);font-weight:500}
  .chip small{font-size:11px;font-weight:500;opacity:.85}

  /* ---------- one leader, one screen ---------- */
  .lead{padding:56px 0;scroll-margin-top:0}
  .lead:nth-of-type(even):not(.dark){background:#fff}
  .lead.dark{color:#fff;background:radial-gradient(70% 90% at 100% 0%,rgba(255,158,27,.34) 0,rgba(255,90,60,.14) 40%,rgba(16,13,26,0) 72%),var(--ink)}
  .lead-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,6vw,96px);align-items:center}
  .lead-pic{position:relative;border-radius:32px;overflow:hidden;height:min(68vh,640px);background:#e9e4dc}
  .lead-pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .credit{position:absolute;left:14px;bottom:12px;font-size:11px;color:rgba(255,255,255,.9);text-decoration:none;background:rgba(16,13,26,.5);padding:3px 9px;border-radius:8px}
  .lead-top{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .lead-cat{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--coral)}
  .dark .lead-cat{color:var(--yellow)}
  .lead-n{font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--gray);font-variant-numeric:tabular-nums}
  .dark .lead-n{color:rgba(255,255,255,.5)}
  .lead-name{font-size:clamp(32px,min(4.8vw,8vh),72px);line-height:1;letter-spacing:-.03em;margin:clamp(10px,2.2vh,22px) 0 clamp(6px,1.2vh,12px);text-wrap:balance}
  .lead-meta{font-size:14.5px;color:var(--gray)}
  .lead-meta a{color:inherit}
  .dark .lead-meta{color:rgba(255,255,255,.7)}
  .lead-score{display:flex;align-items:baseline;gap:12px;margin:clamp(14px,3.2vh,34px) 0}
  .lead-score b{font-family:'Clash Display',sans-serif;font-weight:600;font-size:clamp(46px,9.5vh,96px);line-height:.85;letter-spacing:-.03em;font-variant-numeric:tabular-nums;
    background:linear-gradient(100deg,var(--coral),var(--amber));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .dark .lead-score b{background:none;-webkit-text-fill-color:var(--yellow);color:var(--yellow)}
  .lead-score span{font-size:14px;color:var(--gray);max-width:200px;line-height:1.3}
  .dark .lead-score span{color:rgba(255,255,255,.7)}
  .lead-cols{display:grid;grid-template-columns:1fr 1fr;gap:28px}
  .lead-cols h3{font-family:'General Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gray);margin-bottom:8px}
  .dark .lead-cols h3{color:rgba(255,255,255,.55)}
  .lead-cols p{font-size:clamp(13.5px,2vh,15.5px);line-height:1.55;color:#3b3648}
  .dark .lead-cols p{color:rgba(255,255,255,.86)}
  .lead-foot{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px;margin-top:clamp(16px,3.4vh,34px);padding-top:clamp(14px,2.4vh,22px);border-top:1px solid rgba(16,13,26,.12);font-size:14px;font-weight:600}
  .dark .lead-foot{border-top-color:rgba(255,255,255,.16)}
  .lead-addr{display:inline-flex;align-items:center;gap:7px;font-weight:500;margin-right:auto}
  .lead-addr svg{width:16px;height:16px;flex-shrink:0;color:var(--coral)}
  .dark .lead-addr svg{color:var(--yellow)}
  .lead-foot a{color:inherit;text-underline-offset:3px;white-space:nowrap}
  .lead-foot a:hover{color:var(--coral)}
  .dark .lead-foot a:hover{color:var(--yellow)}

  /* ---------- other sections ---------- */
  .screen{padding-top:56px;padding-bottom:56px}
  .sec-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 24px;margin-bottom:clamp(16px,3vh,28px)}
  .sec-note{font-size:14px;color:var(--gray)}
  .sec-note.under{margin-top:16px}
  .sec-intro{font-size:17px;color:#4a4458;max-width:720px;margin:-8px 0 24px}

  .check{border-radius:32px;padding:clamp(32px,9vh,96px) clamp(22px,5vw,72px);color:#fff;display:grid;grid-template-columns:1.05fr 1fr;gap:32px 64px;align-items:center;
    background:radial-gradient(110% 150% at 0% 0%,rgba(255,90,60,.5) 0,rgba(255,158,27,.2) 42%,rgba(16,13,26,0) 72%),var(--ink)}
  .check h2{font-size:clamp(30px,min(4.4vw,8vh),58px);line-height:1.02;margin-bottom:16px;text-wrap:balance}
  .check-lede{font-size:17px;color:rgba(255,255,255,.82);line-height:1.55;max-width:460px}
  .cform{background:var(--paper);color:var(--ink);border-radius:22px;padding:28px}
  .cform label{display:block;font-size:13px;font-weight:600;margin-bottom:8px}
  .cform input[type=text],.cform input[type=email]{width:100%;font:inherit;font-size:16px;padding:15px 16px;border-radius:12px;border:1.5px solid rgba(16,13,26,.18);background:#fff;color:var(--ink)}
  .cform input:focus{outline:none;border-color:var(--ink)}
  .cform input[aria-invalid=true]{border-color:var(--coral)}
  .cform .btn{width:100%;margin-top:12px}
  .cerr{font-size:13.5px;color:#c8321a;margin-top:8px}
  .cerr:empty{display:none}
  .cnote{font-size:12.5px;color:var(--gray);margin-top:12px;line-height:1.45}
  .cnote a{color:var(--gray)}
  .cback{background:none;border:0;font:inherit;font-size:13px;color:var(--gray);cursor:pointer;padding:0;margin-top:12px;text-decoration:underline;text-underline-offset:3px}
  .cwho{font-family:'Clash Display',sans-serif;font-weight:600;font-size:20px;margin-bottom:14px;word-break:break-all}
  .csteps{display:flex;gap:6px;margin-bottom:18px}
  .csteps i{height:4px;flex:1;border-radius:2px;background:rgba(16,13,26,.12)}
  .csteps i.on{background:var(--amber)}
  .cdone b{display:block;font-family:'Clash Display',sans-serif;font-size:24px;margin-bottom:6px}
  .hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}

  .nums{display:grid;grid-template-columns:repeat(var(--n,4),1fr);margin-bottom:clamp(14px,3vh,28px);border-top:1px solid rgba(16,13,26,.12);border-bottom:1px solid rgba(16,13,26,.12)}
  .nums div{padding:clamp(10px,2vh,18px) 18px clamp(10px,2vh,18px) 0}
  .nums div+div{padding-left:18px;border-left:1px solid rgba(16,13,26,.12)}
  .nums b{display:block;font-family:'Clash Display',sans-serif;font-weight:600;font-size:clamp(24px,4.4vh,38px);line-height:1.1;font-variant-numeric:tabular-nums}
  .nums span{display:block;font-size:12.5px;color:var(--gray);line-height:1.35;margin-top:4px}
  .nots{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px}
  .nots div{border:1px dashed rgba(16,13,26,.25);border-radius:18px;padding:clamp(14px,2.6vh,22px);font-size:clamp(13.5px,2vh,15px);line-height:1.5}
  .nots b{display:block;font-family:'Clash Display',sans-serif;font-size:clamp(17px,2.8vh,21px);margin-bottom:6px}
  .parts{display:grid;grid-template-columns:4fr 1fr;gap:14px}
  .part{border-radius:18px;padding:clamp(14px,2.6vh,22px);font-size:clamp(13.5px,2vh,15px);line-height:1.5;background:#fff;border:1px solid rgba(16,13,26,.08)}
  .part:first-child{background:var(--ink);color:#fff;border-color:var(--ink)}
  .part b{font-family:'Clash Display',sans-serif;font-size:clamp(28px,5vh,40px);line-height:1;display:block}
  .part:first-child b{color:var(--yellow)}
  .part strong{display:block;font-family:'Clash Display',sans-serif;font-size:18px;margin:8px 0 4px}

  .egrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .ecard{display:flex;flex-direction:column;gap:4px;border-radius:18px;padding:clamp(16px,2.8vh,22px);min-height:clamp(120px,20vh,160px);text-decoration:none;color:var(--ink);background:#fff;border:1px solid rgba(16,13,26,.1)}
  a.ecard:hover{border-color:var(--amber);box-shadow:0 12px 30px rgba(16,13,26,.08)}
  .ecard.off{background:transparent;border-style:dashed;color:var(--gray)}
  .etag{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--coral)}
  .ecard.off .etag{color:var(--gray)}
  .ename{font-family:'Clash Display',sans-serif;font-weight:600;font-size:21px;line-height:1.2}
  .emeta{font-size:14px;color:var(--gray)}
  .ego{margin-top:auto;padding-top:12px;font-size:14px;font-weight:600}
  .cta-band{margin-top:clamp(14px,3vh,28px);padding:clamp(18px,4vh,36px) 28px;border-radius:24px;background:linear-gradient(135deg,rgba(255,90,60,.1),rgba(255,201,60,.16));text-align:center}
  .cta-band h2{font-size:clamp(22px,3.6vh,28px);margin-bottom:10px}
  .cta-band p{color:#4a4458;margin:0 auto clamp(12px,2.4vh,20px);max-width:560px}

  .js .reveal{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease}
  .js .reveal.in{opacity:1;transform:none}
  @media(prefers-reduced-motion:reduce){.js .reveal{transition:none!important;opacity:1;transform:none}}

  @media(min-width:981px){
    .lead,.screen{min-height:100svh;display:flex;flex-direction:column;justify-content:center}
    .lead{padding:84px 0 28px}
    .screen{padding-top:84px;padding-bottom:28px}
    .lead.flip .lead-pic{order:2}
  }
  @media(min-width:981px) and (max-height:720px){
    .lead-cols{gap:22px}
    .lead-foot{font-size:13px}
    .lead-meta{font-size:13.5px}
    .sec-intro{font-size:15px;margin:-4px 0 14px}
    .btn{padding:12px 22px;font-size:14px}
    .medal{width:64px;height:64px}.medal svg{width:30px;height:30px}
    .cta-band p{font-size:14px}
    .nums span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  }
  @media(min-width:981px) and (max-width:1180px){.sec-note.under{display:none}.nums span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
  @media(max-width:980px){
    .hero{min-height:0}
    .hero-in{grid-template-columns:1fr;gap:48px;padding-bottom:48px}
    .collage{justify-self:center;max-width:440px}
    .lead-in{grid-template-columns:1fr;gap:28px}
    .lead-pic{height:auto;aspect-ratio:4/3}
    .check{grid-template-columns:1fr}
    .nots,.egrid,.parts{grid-template-columns:1fr}
    .nums{grid-template-columns:repeat(2,1fr)}
    .nums div,.nums div+div{padding:12px 12px 12px 0;border-left:0}
  }
  @media(max-width:520px){#nav .nav-login{display:none}}
  @media(max-width:760px){
    .wrap{padding-left:20px;padding-right:20px}
    .hero-in{padding-top:max(100px,calc(84px + env(safe-area-inset-top,0px)))}
    .hero-cta .btn{flex:1 1 100%}
    #nav .logo{font-size:19px;gap:7px}
    #nav .beemark{width:26px;height:26px}
    #nav .nav-cta{padding:9px 13px;font-size:13px!important;white-space:nowrap}
    #nav .nav-auth{gap:8px}
    #nav .lang-switch summary{padding:6px 4px}
    .lead-cols{grid-template-columns:1fr;gap:18px}
    .lead-pic{border-radius:24px}
    .medal{width:64px;height:64px}.medal svg{width:30px;height:30px}
  }
`;

const TROPHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M10 17h4"/></svg>';

function ring(s, lang) {
  const off = (213.6 * (1 - s / 100)).toFixed(1);
  const label = score(s, lang);
  return `<svg class="ring" viewBox="0 0 80 80" role="img" aria-label="${label} / 100"><circle cx="40" cy="40" r="34" class="ring-bg"/><circle cx="40" cy="40" r="34" class="ring-fg" stroke-dasharray="213.6" style="--off:${off}"/><text x="40" y="45" text-anchor="middle">${label}</text></svg>`;
}

function switcher(e, lang) {
  const t = T[lang];
  const published = [...DATA.editions].sort(order);
  const industries = Object.keys(DATA.industries).map((key) => {
    const latest = published.find((x) => x.industry === key);
    if (!latest) return `<span class="chip off">${esc(DATA.industries[key][lang])} <small>${t.soon}</small></span>`;
    const cur = key === e.industry ? ' aria-current="true"' : '';
    return `<a class="chip" href="${urlOf(latest, lang)}"${cur}>${esc(DATA.industries[key][lang])} · ${esc(latest.city)}</a>`;
  });
  industries.push(`<span class="chip off">${t.moreIndustries} <small>${t.soon}</small></span>`);
  const same = (x) => x.industry === e.industry && x.city === e.city;
  const quarters = [
    ...DATA.upcoming.filter(same).sort(order).map((x) => `<span class="chip off">${q(x, lang)} <small>${t.soon}</small></span>`),
    ...published.filter(same).map((x) => `<a class="chip" href="${urlOf(x, lang)}"${x === e ? ' aria-current="true"' : ''}>${q(x, lang)}</a>`),
  ].reverse();
  return `<div class="switch" role="navigation" aria-label="${t.industry} / ${t.quarter}">
      <div class="switch-row"><span class="switch-label">${t.industry}</span>${industries.join('')}</div>
      <div class="switch-row"><span class="switch-label">${t.quarter}</span>${quarters.join('')}</div>
    </div>`;
}

function editionCards(e, lang) {
  const t = T[lang];
  const cards = [...DATA.editions].sort(order).map((x) => {
    const here = x === e;
    return `<a class="ecard" href="${here ? '#winners' : urlOf(x, lang)}"><span class="etag">${t.current} · ${q(x, lang)}</span><span class="ename">${esc(ind(x, lang))}</span><span class="emeta">${esc(x.city)} · ${esc(x.overall.name)} ${score(x.overall.score, lang)}</span><span class="ego">${here ? t.onThisPage + ' ↑' : t.viewResults}</span></a>`;
  });
  const up = [...DATA.upcoming].sort(order).reverse().map((x) =>
    `<div class="ecard off"><span class="etag">${t.upcomingCard} · ${q(x, lang)}</span><span class="ename">${esc(DATA.industries[x.industry][lang])}</span><span class="emeta">${esc(x.city)}</span></div>`);
  const more = `<div class="ecard off"><span class="etag">${t.soon}</span><span class="ename">${t.moreIndustries}</span><span class="emeta">${t.moreCard}</span></div>`;
  return [...cards, ...up, more].join('\n');
}

function jsonLd(e, lang) {
  const t = T[lang];
  const url = SITE + urlOf(e, lang);
  const award = (cat) => `${t.brand} ${q(e, lang)}: ${cat}`;
  const item = (name, handle, cat, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: { '@type': 'LocalBusiness', name, address: { '@type': 'PostalAddress', addressLocality: e.city }, sameAs: ig(handle), award: award(cat) },
  });
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url + '#page',
        url,
        name: t.title(e).replace(' | Promobeez', ''),
        description: t.desc(e),
        inLanguage: lang,
        dateModified: e.dataAsOf,
        publisher: { '@id': SITE + '/#organization' },
        mainEntity: { '@id': url + '#winners' },
        isBasedOn: SITE + e.article[lang],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: SITE + (lang === 'fi' ? '/fi' : '/') },
          { '@type': 'ListItem', position: 2, name: t.brand },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': url + '#winners',
        name: `${t.brand}: ${t.results(e)}`,
        numberOfItems: e.winners.length + 1,
        itemListElement: [
          item(e.overall.name, e.overall.handle, loc(e.overall.label, lang), 0),
          ...e.winners.map((w, i) => item(loc(w.name, lang), w.handle, loc(w.category, lang), i + 1)),
        ],
      },
    ],
  }, null, 2);
}

const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

/** Every awarded account as one flat list: overall winner, category winners, special award. */
function leaders(e, lang) {
  const t = T[lang];
  const base = (x) => ({
    handle: x.handle, site: x.site, credit: x.credit, image: x.image, w: x.w, h: x.h, followers: x.followers,
    name: loc(x.name, lang), about: loc(x.about, lang), address: loc(x.address, lang),
  });
  const list = [{ ...base(e.overall), label: loc(e.overall.label, lang), big: score(e.overall.score, lang), bigNote: t.outOf, why: loc(e.overall.why, lang), dark: true }];
  for (const w of e.winners) {
    list.push({ ...base(w), label: `${loc(e.categoryLabel, lang)} · ${loc(w.category, lang)}`, big: score(w.score, lang), bigNote: t.outOf, why: loc(w.why, lang) });
  }
  if (e.special) {
    const x = e.special;
    list.push({ ...base(x), label: `${loc(x.label, lang)} · ${loc(x.title, lang)}`, big: loc(x.stat, lang), bigNote: loc(x.statLabel, lang), why: loc(x.text, lang), dark: true });
  }
  return list;
}

function page(e, lang) {
  const t = T[lang];
  const sh = shell(lang, e);
  const url = SITE + urlOf(e, lang);
  const ls = leaders(e, lang);
  const formCfg = JSON.stringify({ lang, edition: e.slug, errIg: t.errIg, errEmail: t.errEmail, errRate: t.errRate, errGeneric: t.errGeneric, okText: t.okText }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(t.title(e))}</title>
<meta name="description" content="${esc(t.desc(e))}">
<meta name="theme-color" content="#FF9E1B">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.svg">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${SITE + urlOf(e, 'en')}">
<link rel="alternate" hreflang="fi-FI" href="${SITE + urlOf(e, 'fi')}">
<link rel="alternate" hreflang="x-default" href="${SITE + urlOf(e, 'en')}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(t.brand + ': ' + t.h1(e))}">
<meta property="og:description" content="${esc(t.desc(e))}">
<meta property="og:image" content="${SITE + e.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:locale:alternate" content="${t.ogAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t.brand + ': ' + t.h1(e))}">
<meta name="twitter:description" content="${esc(t.desc(e))}">
<meta name="twitter:image" content="${SITE + e.ogImage}">

<script type="application/ld+json">
${jsonLd(e, lang)}
</script>

<script>document.documentElement.className='js'</script>
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  ${sh.css.trim()}
${CSS}${NAV_FIT[lang]}</style>
</head>
<body>

${sh.nav}

<main>
  <header class="hero">
    <div class="wrap hero-in">
      <div class="hero-copy">
        <div class="eyebrow">${TROPHY}${t.brand} · ${q(e, lang)}</div>
        <h1>${t.h1Html(e)}</h1>
        <p class="lede">${esc(t.lede)}</p>
        <div class="hero-cta"><a class="btn btn-y" href="#winners">${t.heroCta} ↓</a><a class="btn btn-ghost" href="#check">${t.heroCta2}</a></div>
      </div>
      <div class="collage" aria-hidden="true">
${ls.slice(0, 3).map((l, i) => `        <img class="c${i + 1}" src="${l.image}" alt="" width="${l.w}" height="${l.h}"${i ? '' : ' fetchpriority="high"'}>`).join('\n')}
        <div class="medal">${TROPHY}</div>
      </div>
    </div>
    <div class="wrap">${switcher(e, lang)}</div>
  </header>

${ls.map((l, i) => `  <section class="lead${l.dark ? ' dark' : ''}${i % 2 ? ' flip' : ''}" id="${i ? l.handle : 'winners'}">
    <div class="wrap lead-in">
      <figure class="lead-pic reveal"><img src="${l.image}" width="${l.w}" height="${l.h}" alt="${esc(l.name)}" loading="lazy"><a class="credit" href="${l.site}" ${EXT}>${t.photo}: ${esc(l.credit)}</a></figure>
      <div class="lead-txt reveal">
        <div class="lead-top"><span class="lead-cat">${esc(l.label)}</span><span class="lead-n">${String(i + 1).padStart(2, '0')} / ${String(ls.length).padStart(2, '0')}</span></div>
        <h2 class="lead-name">${esc(l.name)}</h2>
        <div class="lead-meta"><a href="${ig(l.handle)}" ${EXT}>@${l.handle}</a> · ${num(l.followers, lang)} ${t.followers}</div>
        <div class="lead-score"><b>${esc(l.big)}</b><span>${esc(l.bigNote)}</span></div>
        <div class="lead-cols">
          <div><h3>${t.whyTitle}</h3><p>${esc(l.why)}</p></div>
          <div><h3>${t.aboutTitle}</h3><p>${esc(l.about)}</p></div>
        </div>
        <div class="lead-foot">
          <span class="lead-addr">${PIN}${esc(l.address)}</span>
          <a href="${ig(l.handle)}" ${EXT}>Instagram ↗</a>
          <a href="${l.site}" ${EXT}>${esc(l.credit)} ↗</a>
        </div>
      </div>
    </div>
  </section>`).join('\n\n')}

  <section class="wrap screen" id="check">
    <div class="check">
      <div>
        <h2>${esc(t.checkTitle)}</h2>
        <p class="check-lede">${esc(t.checkLede(e))}</p>
      </div>
      <form class="cform" id="cform" novalidate>
        <div class="csteps" aria-hidden="true"><i class="on"></i><i></i></div>
        <div id="cstep1">
          <label for="cig">${t.igLabel}</label>
          <input type="text" id="cig" name="instagram" placeholder="${esc(t.igPh)}" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="200" required>
          <div class="hp" aria-hidden="true"><label for="cweb">Website</label><input type="text" id="cweb" name="website" tabindex="-1" autocomplete="off"></div>
          <p class="cerr" id="cerr1" role="alert"></p>
          <button type="submit" class="btn">${t.next}</button>
        </div>
        <div id="cstep2" hidden>
          <div class="cwho" id="cwho"></div>
          <label for="cemail">${t.emailTitle}</label>
          <input type="email" id="cemail" name="email" placeholder="${esc(t.emailPh)}" aria-label="${t.emailLabel}" autocomplete="email" maxlength="254" required>
          <p class="cerr" id="cerr2" role="alert"></p>
          <button type="submit" class="btn" id="csend">${t.send}</button>
          <p class="cnote">${t.consent} <a href="${t.privacyHref}">${t.privacy}</a>.</p>
          <button type="button" class="cback" id="cback">${t.change}</button>
        </div>
        <div id="cdone" class="cdone" hidden role="status"><b>${t.okTitle}</b><p id="cdonetext"></p></div>
      </form>
    </div>
  </section>

  <section class="wrap screen" id="approach">
    <div class="sec-head"><h2>${t.approachTitle}</h2><a class="btn" href="${e.article[lang]}#method">${t.fullResults}</a></div>
    <div class="nums" style="--n:${e.stats.length}">${e.stats.map((st) => `<div><b>${num(st.n, lang)}</b><span>${esc(st[lang])}</span></div>`).join('')}</div>
    <div class="nots">${t.nots.map(([b, s]) => `<div><b>${esc(b)}</b>${esc(s)}</div>`).join('')}</div>
    <div class="parts">${t.scoreParts.map(([p, b, s]) => `<div class="part"><b>${p}</b><strong>${esc(b)}</strong>${esc(s)}</div>`).join('')}</div>
    <p class="sec-note under">${esc(t.noPoints)} ${esc(t.fullResultsNote)}</p>
  </section>

  <section class="wrap screen" id="editions">
    <div class="sec-head"><h2>${t.editionsTitle}</h2></div>
    <p class="sec-intro">${esc(t.editionsLede)}</p>
    <div class="egrid">
${editionCards(e, lang)}
    </div>
    <div class="cta-band">
      <h2>${esc(t.ctaTitle)}</h2>
      <p>${esc(t.ctaText)}</p>
      <a class="btn" href="${t.ctaHref}">${t.ctaBtn}</a>
    </div>
  </section>
</main>

${sh.footer}
<script>
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('in')});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(el){io.observe(el)});
  }
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>20)},{passive:true});
  document.addEventListener('click',function(e){
    document.querySelectorAll('details.lang-switch[open]').forEach(function(d){if(!d.contains(e.target))d.removeAttribute('open');});
  });
})();
</script>
<script>
(function(){
  var C=${formCfg};
  var API='/api/awards-check';
  var form=document.getElementById('cform');if(!form)return;
  var $=function(id){return document.getElementById(id)};
  var ig=$('cig'),email=$('cemail'),s1=$('cstep1'),s2=$('cstep2'),done=$('cdone'),send=$('csend');
  var bars=form.querySelectorAll('.csteps i');
  var handle=null,token=null,busy=false;
  var RESERVED=['p','reel','reels','tv','explore','accounts','direct','about','developer','legal'];

  // Accepts name, @name, instagram.com/name, full profile URLs (with or without protocol, query, trailing slash).
  function parse(v){
    var s=String(v||'').trim();if(!s||s.length>200)return null;
    var m=s.match(/(?:instagram\\.com|instagr\\.am)[\\/\\\\]+(.*)$/i);
    if(m){
      var p=m[1].split(/[?#]/)[0].split(/[\\/\\\\]+/).filter(Boolean);
      s=p[0]==='stories'?(p[1]||''):(p[0]||'');
      if(RESERVED.indexOf(s.toLowerCase())>-1)return null;
    }else if(/[\\/\\\\:\\s]/.test(s))return null;
    s=s.replace(/^@+/,'').toLowerCase();
    if(!/^[a-z0-9._]{1,30}$/.test(s)||/^\\.|\\.$|\\.\\./.test(s))return null;
    return s;
  }
  function getToken(){
    if(token)return Promise.resolve(token);
    return fetch(API,{headers:{Accept:'application/json'}}).then(function(r){return r.json()}).then(function(d){token=d.token;return token});
  }
  function err(n,msg,input){$('cerr'+n).textContent=msg||'';if(input)input.setAttribute('aria-invalid',msg?'true':'false');}
  function step(n){s1.hidden=n!==1;s2.hidden=n!==2;done.hidden=n!==3;form.querySelector('.csteps').hidden=n===3;bars[1].className=n>1?'on':'';}

  ig.addEventListener('focus',function(){getToken().catch(function(){})},{once:true});
  $('cback').addEventListener('click',function(){step(1);ig.focus()});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(s2.hidden){
      handle=parse(ig.value);
      if(!handle){err(1,C.errIg,ig);return;}
      err(1,'',ig);$('cwho').textContent='@'+handle;step(2);email.focus();getToken().catch(function(){});
      return;
    }
    if(busy)return;
    var mail=email.value.trim();
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(mail)){err(2,C.errEmail,email);return;}
    err(2,'',email);busy=true;send.disabled=true;
    getToken().then(function(tk){
      return fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({instagram:handle,email:mail,website:$('cweb').value,token:tk,lang:C.lang,edition:C.edition})});
    }).then(function(r){
      return r.json().catch(function(){return {}}).then(function(d){
        if(r.ok&&d.ok){
          token=null;
          $('cdonetext').textContent=C.okText.replace('{ig}',handle).replace('{email}',mail);step(3);
          if(window.gtag)window.gtag('event','awards_rank_check',{edition:C.edition});
          return;
        }
        if(d.error==='expired'||d.error==='rate_limited')token=null;
        if(d.error==='invalid_instagram'){step(1);err(1,C.errIg,ig);return;}
        err(2,d.error==='invalid_email'?C.errEmail:r.status===429?C.errRate:C.errGeneric,d.error==='invalid_email'?email:null);
      });
    }).catch(function(){err(2,C.errGeneric)}).then(function(){busy=false;send.disabled=false;});
  });
})();
</script>
<script src="/assets/lang-pref.js" defer></script>
<script src="/assets/cookie-consent.js" defer></script>
</body>
</html>
`;
}

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('wrote', rel);
}

for (const e of DATA.editions) {
  for (const lang of ['en', 'fi']) {
    write(urlOf(e, lang).replace(/^\//, '') + '.html', page(e, lang));
  }
}
