export const config = { runtime: 'edge' };

// Logs what happens on the investor page into product_events (service role only):
//   investor.page_view   - page opened
//   investor.panel_open  - a "details" panel opened (metadata.panel)
//   investor.section_view - a screen was on screen for 2+ seconds (metadata.section)
//   investor.time        - active seconds since the last report, per screen and per panel
//   investor.whatsapp_click - clicked the WhatsApp group link
// Served at /investments/visit (vercel.json rewrite). Only for visitors past the password gate.
// Stores no IP address: a random browser id, the ?i= tag from a personal link, Vercel geo, device.

import { isInvestor, json, supabaseEnv, sb, SECTIONS } from './_investor-auth.js';

const EVENTS = {
  view: 'investor.page_view', panel: 'investor.panel_open', whatsapp: 'investor.whatsapp_click',
  section: 'investor.section_view', time: 'investor.time',
};
const MAX_SECS = 3600;

// Keeps only known keys (screen ids or p-* panel ids) with whole seconds in range.
function seconds(obj, allowed) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj).slice(0, 40)) {
    if (!allowed(k)) continue;
    const n = Math.round(Number(v));
    if (Number.isFinite(n) && n > 0) out[k] = Math.min(n, MAX_SECS);
  }
  return out;
}

function clean(s, re, max) {
  s = String(s || '').trim().toLowerCase().slice(0, max);
  return re.test(s) ? s : '';
}

function device(ua) {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function browser(ua) {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome\//i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  if (/firefox\//i.test(ua)) return 'Firefox';
  return 'Other';
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  if (!(await isInvestor(request))) return json({ error: 'unauthorized' }, 401);
  const env = supabaseEnv();
  if (!env) return json({ ok: false }, 503);

  let body = {};
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'too_large' }, 413);
    body = JSON.parse(text || '{}');
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }

  const name = EVENTS[body.event];
  const vid = clean(body.vid, /^[a-z0-9-]{8,64}$/, 64);
  if (!name || !vid) return json({ error: 'bad_request' }, 400);

  const h = request.headers;
  const ua = h.get('user-agent') || '';
  if (/bot|crawler|spider|preview|headless/i.test(ua)) return json({ ok: true, skipped: 'bot' });
  let city = h.get('x-vercel-ip-city') || '';
  try { city = decodeURIComponent(city); } catch (e) { /* keep raw */ }

  const metadata = {
    ref: clean(body.ref, /^[a-z0-9][a-z0-9._-]{0,59}$/, 60) || null,
    panel: name === 'investor.panel_open' ? clean(body.panel, /^p-[a-z-]{1,30}$/, 32) || null : undefined,
    referrer: clean(body.referrer, /^[a-z0-9.-]{1,100}$/, 100) || null,
    country: h.get('x-vercel-ip-country') || null,
    region: h.get('x-vercel-ip-country-region') || null,
    city: city.slice(0, 80) || null,
    device: device(ua),
    browser: browser(ua),
    width: Number.isFinite(body.w) ? Math.max(0, Math.min(10000, Math.round(body.w))) : null,
  };
  if (name === 'investor.section_view') {
    if (!SECTIONS.includes(body.section)) return json({ error: 'bad_section' }, 400);
    metadata.section = body.section;
  }
  if (name === 'investor.time') {
    const secs = Math.round(Number(body.secs));
    if (!Number.isFinite(secs) || secs < 1) return json({ ok: true, skipped: 'empty' });
    metadata.secs = Math.min(secs, MAX_SECS);
    metadata.dwell = seconds(body.dwell, (k) => SECTIONS.includes(k));
    metadata.pdwell = seconds(body.pdwell, (k) => /^p-[a-z-]{1,30}$/.test(k));
  }

  try {
    await sb(env, 'product_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ event_name: name, anonymous_id: vid, entity_type: 'investor_page', metadata }),
    });
    return json({ ok: true });
  } catch (e) {
    console.error('investor-visit:', e && e.message);
    return json({ ok: false }, 502);
  }
}
