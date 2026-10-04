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
    h1: 'The social media award nobody can apply for',
    lede: 'Promobeez SMM Awards rank local businesses by one thing: how their own audience responds on social media. Public data only. No entry form, no jury, no public vote. One industry and one city at a time, repeated every quarter.',
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
    home: 'Home', homeHref: '/', crumb: 'SMM Awards',
  },
  fi: {
    htmlLang: 'fi', ogLocale: 'fi_FI', ogAlt: 'en_FI',
    brand: 'Promobeez SMM Awards',
    title: (e) => `Promobeez SMM Awards: ${ind(e, 'fi')}, ${e.city}, ${q(e, 'fi')} | Promobeez`,
    desc: (e) => `Somepalkinto, johon ei voi hakea. Tulokset ${q(e, 'fi')}, ${ind(e, 'fi').toLowerCase()}, ${e.city}: kokonaisvoittaja ${e.overall.name}, sarjojen voittajat ja menetelmä lyhyesti. Vain julkista dataa, ei raatia, ei äänestystä.`,
    h1: 'Somepalkinto, johon ei voi hakea',
    lede: 'Promobeez SMM Awards asettaa paikalliset yritykset järjestykseen yhden asian perusteella: miten niiden oma yleisö reagoi somessa. Vain julkista dataa. Ei hakulomaketta, ei raatia, ei yleisöäänestystä. Yksi toimiala ja yksi kaupunki kerrallaan, neljännesvuosittain.',
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
    nav: fix(between(src, '<nav id="nav">', '</nav>', file)),
    footer: fix(between(src, '<footer>', '</footer>', file)),
  };
}

const CSS = `
  main{display:block}
  .wrap{max-width:1120px;margin:0 auto;padding:0 40px}
  .aw-hero{padding-top:max(130px,calc(100px + env(safe-area-inset-top,0px)))}
  .crumbs{font-size:13px;color:var(--gray);margin-bottom:22px}
  .crumbs a{color:var(--gray);text-decoration:none}
  .crumbs a:hover{color:var(--ink)}
  .crumbs span{margin:0 8px;opacity:.5}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--coral);margin-bottom:16px}
  .eyebrow svg{width:18px;height:18px}
  .aw-hero h1{font-size:clamp(36px,6vw,68px);line-height:1.02;letter-spacing:-.03em;max-width:880px;margin-bottom:22px;text-wrap:balance}
  .lede{font-size:19px;color:#4a4458;max-width:720px;margin-bottom:30px}

  .switch{display:flex;flex-wrap:wrap;gap:14px 34px;padding:18px 0;border-top:1px solid rgba(16,13,26,.1);border-bottom:1px solid rgba(16,13,26,.1)}
  .switch-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .switch-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--gray);margin-right:4px}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:100px;border:1px solid rgba(16,13,26,.16);font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;background:#fff;line-height:1.2}
  a.chip:hover{border-color:var(--ink)}
  .chip[aria-current]{background:var(--ink);border-color:var(--ink);color:#fff}
  .chip.off{background:transparent;border-style:dashed;color:var(--gray);font-weight:500}
  .chip small{font-size:11px;font-weight:500;opacity:.8}

  section.wrap{padding-top:64px}
  .sec-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 24px;margin-bottom:22px}
  h2{font-size:clamp(26px,3.4vw,38px)}
  .sec-head p,.sec-note{font-size:14px;color:var(--gray)}
  .sec-intro{font-size:17px;color:#4a4458;max-width:720px;margin:-8px 0 26px}

  .tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:26px}
  .tile{background:#fff;border:1px solid rgba(16,13,26,.08);border-radius:14px;padding:16px 14px}
  .tile b{display:block;font-family:'Clash Display',sans-serif;font-size:30px;line-height:1.1;font-variant-numeric:tabular-nums}
  .tile span{font-size:12.5px;color:var(--gray);line-height:1.35;display:block;margin-top:6px}

  .champ{display:grid;grid-template-columns:1.15fr 1fr;border-radius:24px;overflow:hidden;color:#fff;
    background:radial-gradient(120% 160% at 100% 100%,rgba(255,158,27,.5) 0,rgba(255,90,60,.22) 40%,rgba(16,13,26,0) 72%),var(--ink)}
  .champ figure{position:relative;min-height:340px}
  .champ img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .credit{position:absolute;left:10px;bottom:8px;font-size:10.5px;color:rgba(255,255,255,.85);background:rgba(16,13,26,.5);padding:2px 7px;border-radius:6px;text-decoration:none}
  .champ-body{padding:38px 36px;display:flex;flex-direction:column;justify-content:center}
  .qeb{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--yellow)}
  .champ-name{font-family:'Clash Display',sans-serif;font-weight:600;font-size:clamp(32px,4vw,46px);line-height:1.05;margin:10px 0 6px}
  .champ-meta{font-size:14px;color:rgba(255,255,255,.75)}
  .champ-meta a,.champ-links a{color:#fff}
  .champ-score{display:flex;align-items:baseline;gap:10px;margin:22px 0 14px}
  .champ-score b{font-family:'Clash Display',sans-serif;font-weight:600;font-size:76px;line-height:.9;color:var(--yellow);font-variant-numeric:tabular-nums}
  .champ-score span{font-size:14px;color:rgba(255,255,255,.8)}
  .champ-why{font-size:15.5px;line-height:1.55;color:rgba(255,255,255,.9)}
  .champ-links{margin-top:16px;font-size:14px;display:flex;gap:18px}

  .wgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
  .wcard{grid-column:span 2;background:#fff;border:1px solid rgba(16,13,26,.1);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;transition:transform .25s ease,box-shadow .25s ease}
  .wcard:nth-child(-n+2){grid-column:span 3}
  .wcard:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(16,13,26,.1)}
  .wcard figure{position:relative;aspect-ratio:16/10;background:#eee}
  .wcard:nth-child(-n+2) figure{aspect-ratio:16/8.4}
  .wcard img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .wzone{position:absolute;left:12px;top:12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--paper);color:var(--ink);padding:6px 11px;border-radius:100px}
  .wbody{padding:18px 20px 18px;display:flex;flex-direction:column;flex:1}
  .wrow{display:flex;align-items:center;gap:14px}
  .wname{font-family:'Clash Display',sans-serif;font-weight:600;font-size:22px;line-height:1.15}
  .whandle{font-size:13px;color:var(--gray);margin-top:3px}
  .wwhy{font-size:14.5px;margin:12px 0 14px;line-height:1.5;color:#3b3648}
  .wlinks{margin-top:auto;display:flex;gap:16px;font-size:13.5px;font-weight:600}
  .wlinks a{color:var(--ink);text-underline-offset:3px}
  .wlinks a:hover{color:var(--coral)}
  .ring{width:68px;height:68px;flex-shrink:0;margin-left:auto}
  .ring-bg{fill:none;stroke:rgba(16,13,26,.08);stroke-width:7}
  .ring-fg{fill:none;stroke:var(--amber);stroke-width:7;stroke-linecap:round;transform:rotate(-90deg);transform-origin:40px 40px;stroke-dashoffset:var(--off);transition:stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)}
  .js .reveal:not(.in) .ring-fg{stroke-dashoffset:213.6}
  .ring text{font-family:'Clash Display',sans-serif;font-weight:600;font-size:19px;fill:var(--ink)}

  .special{margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:20px 40px;padding:28px 32px;border-radius:20px;color:#fff;
    background:radial-gradient(120% 160% at 100% 0%,rgba(255,158,27,.55) 0,rgba(255,90,60,.25) 38%,rgba(16,13,26,0) 70%),var(--ink)}
  .special-name{font-family:'Clash Display',sans-serif;font-weight:600;font-size:30px;line-height:1.1;margin:8px 0 4px}
  .special p{font-size:15px;line-height:1.55;color:rgba(255,255,255,.88);margin-top:12px;max-width:640px}
  .special-stat{flex-shrink:0;text-align:right}
  .special-stat b{display:block;font-family:'Clash Display',sans-serif;font-weight:600;font-size:64px;line-height:1;color:var(--yellow)}
  .special-stat span{display:block;font-size:13px;color:rgba(255,255,255,.8);max-width:170px;margin:6px 0 0 auto;line-height:1.35}

  .more{margin-top:26px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
  .btn{display:inline-flex;align-items:center;justify-content:center;background:var(--ink);color:#fff;text-decoration:none;padding:14px 26px;border-radius:100px;font-weight:600;font-size:15px;border:0;cursor:pointer;font-family:inherit}
  .btn:hover{opacity:.9}
  .btn[disabled]{opacity:.55;cursor:default}

  .check{border-radius:24px;padding:44px 40px;color:#fff;display:grid;grid-template-columns:1fr 1fr;gap:28px 48px;align-items:center;
    background:radial-gradient(110% 150% at 0% 0%,rgba(255,90,60,.5) 0,rgba(255,158,27,.2) 42%,rgba(16,13,26,0) 72%),var(--ink)}
  .check h2{margin-bottom:12px}
  .check-lede{font-size:16px;color:rgba(255,255,255,.82);line-height:1.55}
  .cform{background:var(--paper);color:var(--ink);border-radius:18px;padding:24px}
  .cform label{display:block;font-size:13px;font-weight:600;margin-bottom:8px}
  .cform input[type=text],.cform input[type=email]{width:100%;font:inherit;font-size:16px;padding:14px 16px;border-radius:12px;border:1.5px solid rgba(16,13,26,.18);background:#fff;color:var(--ink)}
  .cform input:focus{outline:none;border-color:var(--ink)}
  .cform input[aria-invalid=true]{border-color:var(--coral)}
  .cform .btn{width:100%;margin-top:12px}
  .cerr{font-size:13.5px;color:#c8321a;margin-top:8px;min-height:0}
  .cnote{font-size:12.5px;color:var(--gray);margin-top:12px;line-height:1.45}
  .cnote a{color:var(--gray)}
  .cback{background:none;border:0;font:inherit;font-size:13px;color:var(--gray);cursor:pointer;padding:0;margin-top:12px;text-decoration:underline;text-underline-offset:3px}
  .cwho{font-family:'Clash Display',sans-serif;font-weight:600;font-size:20px;margin-bottom:14px;word-break:break-all}
  .csteps{display:flex;gap:6px;margin-bottom:16px}
  .csteps i{height:4px;flex:1;border-radius:2px;background:rgba(16,13,26,.12)}
  .csteps i.on{background:var(--amber)}
  .cdone b{display:block;font-family:'Clash Display',sans-serif;font-size:24px;margin-bottom:6px}
  .hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}

  .nots{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}
  .nots div{border:1px dashed rgba(16,13,26,.25);border-radius:16px;padding:18px;font-size:14.5px;line-height:1.5}
  .nots b{display:block;font-family:'Clash Display',sans-serif;font-size:18px;margin-bottom:4px}
  .parts{display:grid;grid-template-columns:4fr 1fr;gap:12px}
  .part{border-radius:16px;padding:18px;font-size:14.5px;line-height:1.5;background:#fff;border:1px solid rgba(16,13,26,.08)}
  .part:first-child{background:var(--ink);color:#fff;border-color:var(--ink)}
  .part b{font-family:'Clash Display',sans-serif;font-size:30px;line-height:1;display:block}
  .part:first-child b{color:var(--yellow)}
  .part strong{display:block;font-family:'Clash Display',sans-serif;font-size:17px;margin:6px 0 4px}
  .approach-p{font-size:16px;color:#4a4458;max-width:760px;margin-top:18px}

  .egrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .ecard{display:flex;flex-direction:column;gap:4px;border-radius:18px;padding:20px;min-height:150px;text-decoration:none;color:var(--ink);background:#fff;border:1px solid rgba(16,13,26,.1)}
  a.ecard:hover{border-color:var(--amber);box-shadow:0 12px 30px rgba(16,13,26,.08)}
  .ecard.off{background:transparent;border-style:dashed;color:var(--gray)}
  .etag{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--coral)}
  .ecard.off .etag{color:var(--gray)}
  .ename{font-family:'Clash Display',sans-serif;font-weight:600;font-size:21px;line-height:1.2}
  .emeta{font-size:14px;color:var(--gray)}
  .ego{margin-top:auto;padding-top:12px;font-size:14px;font-weight:600}

  .cta-band{margin:72px 0 80px;padding:40px 28px;border-radius:24px;background:linear-gradient(135deg,rgba(255,90,60,.1),rgba(255,201,60,.16));text-align:center}
  .cta-band h2{font-size:28px;margin-bottom:10px}
  .cta-band p{color:#4a4458;margin:0 auto 20px;max-width:560px}

  .js .reveal{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease}
  .js .reveal.in{opacity:1;transform:none}
  @media(prefers-reduced-motion:reduce){.js .reveal,.ring-fg,.wcard{transition:none!important}.js .reveal{opacity:1;transform:none}}

  @media(max-width:900px){
    .champ,.check{grid-template-columns:1fr}
    .champ figure{min-height:0;aspect-ratio:16/10}
    .wcard,.wcard:nth-child(-n+2){grid-column:span 3}
    .wcard:nth-child(-n+2) figure{aspect-ratio:16/10}
    .tiles{grid-template-columns:repeat(2,1fr)}.tile:last-child{grid-column:1/-1}
    .nots,.egrid{grid-template-columns:1fr}
    .parts{grid-template-columns:1fr}
  }
  @media(max-width:760px){
    .wrap{padding:0 20px}
    .aw-hero{padding-top:max(110px,calc(88px + env(safe-area-inset-top,0px)))}
    section.wrap{padding-top:48px}
    .champ-body{padding:26px 22px}
    .champ-score b{font-size:60px}
    .check{padding:28px 20px}
    .special{flex-direction:column;align-items:flex-start;padding:24px 22px}
    .special-stat{text-align:left}.special-stat span{margin-left:0}
  }
  @media(max-width:620px){.wcard,.wcard:nth-child(-n+2){grid-column:1/-1}}
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
    return `<a class="ecard" href="${here ? '#results' : urlOf(x, lang)}"><span class="etag">${t.current} · ${q(x, lang)}</span><span class="ename">${esc(ind(x, lang))}</span><span class="emeta">${esc(x.city)} · ${esc(x.overall.name)} ${score(x.overall.score, lang)}</span><span class="ego">${here ? t.onThisPage + ' ↑' : t.viewResults}</span></a>`;
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

function page(e, lang) {
  const t = T[lang];
  const sh = shell(lang, e);
  const url = SITE + urlOf(e, lang);
  const o = e.overall;
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
<meta property="og:title" content="${esc(t.brand + ': ' + t.h1)}">
<meta property="og:description" content="${esc(t.desc(e))}">
<meta property="og:image" content="${SITE + e.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:site_name" content="Promobeez">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:locale:alternate" content="${t.ogAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t.brand + ': ' + t.h1)}">
<meta name="twitter:description" content="${esc(t.desc(e))}">
<meta name="twitter:image" content="${SITE + e.ogImage}">

<script type="application/ld+json">
${jsonLd(e, lang)}
</script>

<script>document.documentElement.className='js'</script>
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  ${sh.css.trim()}
${CSS}</style>
</head>
<body>

${sh.nav}

<main>
  <header class="wrap aw-hero">
    <p class="crumbs" aria-label="Breadcrumb"><a href="${t.homeHref}">${t.home}</a><span>/</span>${t.crumb}</p>
    <div class="eyebrow">${TROPHY}${t.brand}</div>
    <h1>${esc(t.h1)}</h1>
    <p class="lede">${esc(t.lede)}</p>
    ${switcher(e, lang)}
  </header>

  <section class="wrap" id="results">
    <div class="sec-head"><h2>${esc(t.results(e))}</h2><p>${esc(t.measured(e))}</p></div>
    <div class="champ reveal">
      <figure><img src="${o.image}" width="${o.w}" height="${o.h}" alt="${esc(o.name)}" fetchpriority="high"><a class="credit" href="${o.site}" ${EXT}>${t.photo}: ${esc(o.credit)}</a></figure>
      <div class="champ-body">
        <div class="qeb">${esc(loc(o.label, lang))}</div>
        <div class="champ-name">${esc(o.name)}</div>
        <div class="champ-meta"><a href="${ig(o.handle)}" ${EXT}>@${o.handle}</a> · ${num(o.followers, lang)} ${t.followers}</div>
        <div class="champ-score"><b>${score(o.score, lang)}</b><span>${t.outOf}</span></div>
        <p class="champ-why">${esc(loc(o.why, lang))}</p>
      </div>
    </div>
    <div class="tiles">${e.stats.map((s) => `<div class="tile"><b data-count="${s.n}">${num(s.n, lang)}</b><span>${esc(s[lang])}</span></div>`).join('')}</div>
  </section>

  <section class="wrap" id="winners">
    <div class="sec-head"><h2>${esc(loc(e.categoriesTitle, lang))}</h2></div>
    <p class="sec-intro">${esc(loc(e.categoriesIntro, lang))}</p>
    <div class="wgrid">
${e.winners.map((w) => `      <article class="wcard reveal">
        <figure><img src="${w.image}" width="${w.w}" height="${w.h}" alt="${esc(loc(w.name, lang))}" loading="lazy"><span class="wzone">${esc(loc(w.category, lang))}</span><a class="credit" href="${w.site}" ${EXT}>${t.photo}: ${esc(w.credit)}</a></figure>
        <div class="wbody">
          <div class="wrow"><div><h3 class="wname">${esc(loc(w.name, lang))}</h3><div class="whandle">@${w.handle} · ${num(w.followers, lang)} ${t.followers}</div></div>${ring(w.score, lang)}</div>
          <p class="wwhy">${esc(loc(w.why, lang))}</p>
          <div class="wlinks"><a href="${ig(w.handle)}" ${EXT}>Instagram ↗</a><a href="${w.site}" ${EXT}>${t.website} ↗</a></div>
        </div>
      </article>`).join('\n')}
    </div>
${e.special ? `    <div class="special reveal">
      <div><div class="qeb">${esc(loc(e.special.label, lang))} · ${esc(loc(e.special.title, lang))}</div><div class="special-name">${esc(e.special.name)}</div><div class="champ-meta"><a href="${ig(e.special.handle)}" ${EXT}>@${e.special.handle}</a> · ${num(e.special.followers, lang)} ${t.followers}</div><p>${esc(loc(e.special.text, lang))}</p></div>
      <div class="special-stat"><b>${esc(loc(e.special.stat, lang))}</b><span>${esc(loc(e.special.statLabel, lang))}</span></div>
    </div>` : ''}
    <div class="more"><a class="btn" href="${e.article[lang]}">${t.fullResults}</a><span class="sec-note">${esc(t.fullResultsNote)}</span></div>
  </section>

  <section class="wrap" id="check">
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

  <section class="wrap" id="approach">
    <div class="sec-head"><h2>${t.approachTitle}</h2></div>
    <div class="nots">${t.nots.map(([b, s]) => `<div><b>${esc(b)}</b>${esc(s)}</div>`).join('')}</div>
    <div class="parts">${t.scoreParts.map(([p, b, s]) => `<div class="part"><b>${p}</b><strong>${esc(b)}</strong>${esc(s)}</div>`).join('')}</div>
    <p class="approach-p">${esc(loc(e.approach, lang))} ${esc(t.noPoints)}</p>
    <div class="more"><a class="btn" href="${e.article[lang]}#method">${t.fullResults}</a></div>
  </section>

  <section class="wrap" id="editions">
    <div class="sec-head"><h2>${t.editionsTitle}</h2></div>
    <p class="sec-intro">${esc(t.editionsLede)}</p>
    <div class="egrid">
${editionCards(e, lang)}
    </div>
  </section>

  <div class="wrap">
    <div class="cta-band">
      <h2>${esc(t.ctaTitle)}</h2>
      <p>${esc(t.ctaText)}</p>
      <a class="btn" href="${t.ctaHref}">${t.ctaBtn}</a>
    </div>
  </div>
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
          $('cdonetext').textContent=C.okText.replace('{ig}',handle).replace('{email}',mail);step(3);
          if(window.gtag)window.gtag('event','awards_rank_check',{edition:C.edition});
          return;
        }
        if(d.error==='expired')token=null;
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
