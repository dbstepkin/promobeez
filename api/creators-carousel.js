export const config = { runtime: 'edge' };

// Live offers feed on /for-creators and the home page, served from our own origin.
// my.promobeez.com only allows CORS from www.promobeez.com, so preview deploys
// (*.vercel.app) could not load the feed straight from the browser.
//
// The visitor's IP country is added to the body as `geo` so the page can pick the
// Italy or Finland view. Because the answer depends on the visitor it is not shared-cached.

const UPSTREAM = 'https://my.promobeez.com/api/public/for-creators-carousel';

function json(body, status, cache) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });
}

export default async function handler(req) {
  if (req.method !== 'GET') return json('{"visible":false}', 405, 'no-store');
  const geo = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  try {
    // the country is passed on so the feed can filter per market once it supports it
    const url = /^(IT|FI)$/.test(geo) ? `${UPSTREAM}?country=${geo}` : UPSTREAM;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return json('{"visible":false}', 502, 'no-store');
    const data = await res.json();
    data.geo = geo || null;
    // image URLs are short-lived signed links, so keep the cache brief
    return json(JSON.stringify(data), 200, 'private, max-age=60');
  } catch {
    return json('{"visible":false}', 502, 'no-store');
  }
}
