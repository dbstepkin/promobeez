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

export const config = { matcher: ['/', '/fi', '/fi/:path*', '/blog', '/blog/:path*', '/about/:path*', '/for-:path*', '/influencer-marketing-:path*', '/privacy', '/terms', '/restaurant-pilot', '/promobeez-smm-awards'] };

export default function middleware(request) {
  const url = new URL(request.url);
  const country = request.headers.get('x-vercel-ip-country');
  const cookie = request.headers.get('cookie') || '';
  const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const target = IT[path];
  if (country === 'IT' && target && !/(?:^|;\s*)pb_lang=/.test(cookie) && !url.hostname.startsWith('awards')) {
    return new Response(null, { status: 307, headers: { Location: target + url.search, 'Cache-Control': 'private, no-store', Vary: 'X-Vercel-IP-Country, Cookie' } });
  }
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}
