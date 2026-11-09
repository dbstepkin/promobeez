// Vercel Routing Middleware: visitors from Italy get the Italian version of a page.
// A language chosen in the switcher (pb_lang cookie, set by /assets/lang-pref.js) always wins.
const IT = {
  '/': '/it',
  '/fi': '/it',
  '/for-businesses': '/it/per-le-attivita',
  '/fi/yrityksille': '/it/per-le-attivita',
  '/for-creators': '/it/per-i-creator',
  '/fi/sisallontuottajille': '/it/per-i-creator',
  '/blog': '/it/blog',
  '/fi/blogi': '/it/blog',
  '/privacy': '/it/privacy',
  '/terms': '/it/termini',
  '/restaurant-pilot': '/it/pilota-ristoranti',
  '/promobeez-smm-awards': '/it/promobeez-smm-awards',
  '/fi/promobeez-smm-awards': '/it/promobeez-smm-awards',
  '/about/andrey-shepelev': '/it/chi-siamo/andrey-shepelev',
  '/fi/tietoa/andrey-shepelev': '/it/chi-siamo/andrey-shepelev',
  '/influencer-marketing-for-restaurants': '/it/influencer-marketing-per-ristoranti',
  '/fi/vaikuttajamarkkinointi-ravintolalle': '/it/influencer-marketing-per-ristoranti',
  '/influencer-marketing-for-cafes': '/it/influencer-marketing-per-bar-e-caffetterie',
  '/fi/vaikuttajamarkkinointi-kahvilalle': '/it/influencer-marketing-per-bar-e-caffetterie',
  '/influencer-marketing-for-salons': '/it/influencer-marketing-per-saloni',
  '/fi/vaikuttajamarkkinointi-kampaamolle': '/it/influencer-marketing-per-saloni',
  '/influencer-marketing-for-gyms': '/it/influencer-marketing-per-palestre',
  '/fi/vaikuttajamarkkinointi-kuntosalille': '/it/influencer-marketing-per-palestre',
  '/blog/how-to-promote-a-restaurant-in-helsinki': '/it/blog/come-promuovere-un-ristorante-a-milano',
  '/blog/how-to-promote-a-restaurant-in-milan': '/it/blog/come-promuovere-un-ristorante-a-milano',
  '/fi/blogi/ravintolan-markkinointi-helsingissa': '/it/blog/come-promuovere-un-ristorante-a-milano',
  '/blog/creator-collaborations-helsinki': '/it/blog/collaborazioni-creator-milano',
  '/fi/blogi/yhteistyot-sisallontuottajalle-helsinki': '/it/blog/collaborazioni-creator-milano',
  '/blog/how-to-choose-a-local-creator': '/it/blog/come-scegliere-un-creator-locale',
  '/fi/blogi/miten-valita-paikallinen-sisallontuottaja': '/it/blog/come-scegliere-un-creator-locale',
  '/blog/why-audiences-trust-small-creators-more-than-brands': '/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator',
  '/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin': '/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator',
  '/blog/influencer-marketing-wrong-metrics': '/it/blog/influencer-marketing-metriche-sbagliate',
  '/fi/blogi/vaikuttajamarkkinoinnin-vaarat-mittarit': '/it/blog/influencer-marketing-metriche-sbagliate',
  '/blog/barter-collab-platforms-europe-map': '/it/blog/piattaforme-barter-europa-mappa',
  '/fi/blogi/vaihtokauppa-alustat-euroopassa': '/it/blog/piattaforme-barter-europa-mappa',
  '/blog/best-restaurant-social-media-helsinki-q3-2026': '/it/blog/miglior-social-ristoranti-helsinki-q3-2026',
  '/fi/blogi/helsingin-paras-ravintola-some-q3-2026': '/it/blog/miglior-social-ristoranti-helsinki-q3-2026',
  '/blog/influencer-marketing-disclosure-finland': '/it/blog/pubblicita-influencer-regole-italia',
  '/fi/blogi/vaikuttajamarkkinoinnin-merkinta': '/it/blog/pubblicita-influencer-regole-italia',
  '/blog/promobeez-vs-collaborup': '/it/blog/promobeez-vs-collaborup',
  '/blog/promobeez-vs-vaiku': '/it/blog/promobeez-vs-vaiku',
  '/fi/blogi/promobeez-vs-vaiku': '/it/blog/promobeez-vs-vaiku',
  '/blog/promobeez-vs-castersapp': '/it/blog/promobeez-vs-castersapp',
  '/fi/blogi/promobeez-vs-castersapp': '/it/blog/promobeez-vs-castersapp',
  '/blog/promobeez-vs-invited-agency': '/it/blog/promobeez-vs-invited-agency',
  '/fi/blogi/promobeez-vs-invited': '/it/blog/promobeez-vs-invited-agency',
};

export const config = { matcher: ['/', '/fi', '/fi/:path*', '/blog', '/blog/:path*', '/about/:path*', '/for-:path*', '/influencer-marketing-:path*', '/privacy', '/terms', '/restaurant-pilot', '/promobeez-smm-awards', '/investments', '/investments/:path*', '/investments.html'] };

// ---- Investor page: /investments is closed behind a password (env INVESTOR_PASSWORD) ----
const INV_COOKIE = 'pb_inv';
const NOINDEX = 'noindex, nofollow, noarchive, nosnippet';

async function invToken(pw) {
  const data = new TextEncoder().encode(pw + '|promobeez-investors');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function loginPage(error, status, search = '') {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${NOINDEX}"><title>Promobeez · Investors</title><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/fonts.css">
<style>*{box-sizing:border-box;margin:0}body{min-height:100vh;display:grid;place-items:center;background:#13111F;color:#fff;font-family:'General Sans',system-ui,sans-serif;padding:16px}
form{width:100%;max-width:380px}h1{font-family:'Clash Display',sans-serif;font-size:40px;font-weight:600;margin:20px 0 8px}p{color:#A7A3B8;margin-bottom:28px}
input{width:100%;padding:16px 18px;border-radius:14px;border:1.5px solid #3A3550;background:#1F1B33;color:#fff;font-size:17px;outline:none}input:focus{border-color:#F7A21B}
button{width:100%;margin-top:14px;padding:16px;border:0;border-radius:14px;background:#F7A21B;color:#13111F;font-weight:600;font-size:17px;cursor:pointer}.err{color:#FF8A5B;margin:12px 0 0;font-size:15px}</style></head>
<body><form method="post" action="/investments${search}"><img src="/assets/favicon.svg" width="48" height="48" alt=""><h1>Investor materials</h1><p>Enter the password you received from the Promobeez team.</p>
<input type="password" name="password" autocomplete="current-password" placeholder="Password" required autofocus><button type="submit">Open</button>${error ? '<p class="err">Wrong password. Try again.</p>' : ''}</form></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX } });
}

async function investorGate(request, url) {
  const pw = (typeof process !== 'undefined' && process.env && process.env.INVESTOR_PASSWORD) || '';
  if (!pw) return new Response('Investor page is not configured.', { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': NOINDEX } });
  const token = await invToken(pw);
  // Keep the personal-link tag (?i=acme-ventures) through the password form.
  const tag = (url.searchParams.get('i') || '').toLowerCase();
  const search = /^[a-z0-9][a-z0-9._-]{0,59}$/.test(tag) ? '?i=' + tag : '';

  if (request.method === 'POST') {
    let given = '';
    try { given = String((await request.formData()).get('password') || ''); } catch (e) { given = ''; }
    if (sameString(await invToken(given), token)) {
      return new Response(null, { status: 303, headers: {
        Location: '/investments' + search,
        'Set-Cookie': `${INV_COOKIE}=${token}; Path=/investments; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store',
      } });
    }
    return loginPage(true, 401, search);
  }

  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)pb_inv=([a-f0-9]{64})/);
  if (m && sameString(m[1], token)) {
    if (url.pathname === '/investments.html') return new Response(null, { status: 308, headers: { Location: '/investments' } });
    return new Response(null, { headers: { 'x-middleware-next': '1', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX } });
  }
  return loginPage(false, 401, search);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname === '/investments' || url.pathname.startsWith('/investments/') || url.pathname === '/investments.html') {
    return investorGate(request, url);
  }
  const country = request.headers.get('x-vercel-ip-country');
  const cookie = request.headers.get('cookie') || '';
  const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const target = IT[path];
  if (country === 'IT' && target && !/(?:^|;\s*)pb_lang=/.test(cookie) && !url.hostname.startsWith('awards')) {
    return new Response(null, { status: 307, headers: { Location: target + url.search, 'Cache-Control': 'private, no-store', Vary: 'X-Vercel-IP-Country, Cookie' } });
  }
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}
