export const config = { runtime: 'edge' };

// Live offers feed on /for-creators, served from our own origin.
// my.promobeez.com only allows CORS from www.promobeez.com, so preview deploys
// (*.vercel.app) could not load the feed straight from the browser.

const UPSTREAM = 'https://my.promobeez.com/api/public/for-creators-carousel';

function json(body, status, cache) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });
}

export default async function handler(req) {
  if (req.method !== 'GET') return json('{"visible":false}', 405, 'no-store');
  try {
    const res = await fetch(UPSTREAM, { headers: { Accept: 'application/json' } });
    if (!res.ok) return json('{"visible":false}', 502, 'no-store');
    // image URLs are short-lived signed links, so keep the cache brief
    return json(await res.text(), 200, 'public, s-maxage=60, stale-while-revalidate=120');
  } catch {
    return json('{"visible":false}', 502, 'no-store');
  }
}
