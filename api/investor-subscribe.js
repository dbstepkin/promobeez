export const config = { runtime: 'edge' };

// "Keep me in the loop" email signup on the investor page. Served at /investments/subscribe.
// Saves an investor.subscribe event in product_events (service role only). The founders see the list,
// with a CSV download, in the private report at /investments/visitors.

import { isInvestor, json, supabaseEnv, sb } from './_investor-auth.js';

const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,24}$/i;

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  if (!(await isInvestor(request))) return json({ error: 'unauthorized' }, 401);
  const env = supabaseEnv();
  if (!env) return json({ error: 'not_configured' }, 503);

  let body = {};
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ error: 'too_large' }, 413);
    body = JSON.parse(text || '{}');
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }

  if (body.website) return json({ ok: true }); // honeypot: bots fill hidden fields
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 80) || null;
  const vid = /^[a-z0-9-]{8,64}$/.test(String(body.vid || '')) ? String(body.vid) : 'subscribe-' + crypto.randomUUID();
  const ref = /^[a-z0-9][a-z0-9._-]{0,59}$/.test(String(body.ref || '')) ? String(body.ref) : null;

  const h = request.headers;
  let city = h.get('x-vercel-ip-city') || '';
  try { city = decodeURIComponent(city); } catch (e) { /* keep raw */ }

  try {
    await sb(env, 'product_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        event_name: 'investor.subscribe',
        anonymous_id: vid,
        entity_type: 'investor_page',
        metadata: { email, name, ref, channel: 'email', country: h.get('x-vercel-ip-country') || null, city: city.slice(0, 80) || null },
      }),
    });
    return json({ ok: true });
  } catch (e) {
    console.error('investor-subscribe:', e && e.message);
    return json({ error: 'unavailable' }, 502);
  }
}
