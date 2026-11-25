export const config = { runtime: 'edge' };

// D-001g: the current public price of "Pay when they post" for the landing calculator.
// Reads public.public_result_price() (SECURITY DEFINER, returns only the default matrix),
// so changing the default matrix in the database changes the site. The anon key is the
// public client key the app already ships to browsers.

const URL = 'https://db.promobeez.com/rest/v1/rpc/public_result_price';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgyOTkzMTk4LCJleHAiOjE5NDA2NzMxOTh9.XVTm7eVKsaoW4x4FKs8USIJ5kp108Hx13CtWjPzT0Ao';

function json(body, status, cache) {
  return new Response(body, { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });
}

export default async function handler(req) {
  if (req.method !== 'GET') return json('{}', 405, 'no-store');
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) return json('{}', 502, 'no-store');
    const data = await res.json();
    if (!data || !data.params) return json('{}', 502, 'no-store');
    return json(JSON.stringify({ id: data.id, params: data.params }), 200, 'public, s-maxage=300, stale-while-revalidate=3600');
  } catch {
    return json('{}', 502, 'no-store');
  }
}
