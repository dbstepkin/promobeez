export const config = { runtime: 'edge' };

// Restaurant pilot form on /restaurant-pilot.
// POST {restaurant, name, phone} -> emails the lead to team@promobeez.com via Resend.
//
// Env:
//   RESEND_API_KEY  required (same key as /api/subscribe)

const TO = 'team@promobeez.com';
const FROM = 'Promobeez Pilot <team@promobeez.com>';
const MIN_FILL_MS = 2000;
const MAX_BODY = 2048;
const ALLOWED_ORIGIN = /^https:\/\/(www\.)?promobeez\.com$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function clean(v, max) {
  return String(v || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGIN.test(origin)) return json({ error: 'forbidden' }, 403);

  const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
  if (!RESEND_API_KEY) {
    console.error('pilot-apply: RESEND_API_KEY is not set');
    return json({ error: 'not_configured' }, 503);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413);

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Bots: filled honeypot or instant submit. Answer ok so they don't retry.
  if (data.website || Number(data.elapsed) < MIN_FILL_MS) return json({ ok: true }, 200);

  const restaurant = clean(data.restaurant, 120);
  const name = clean(data.name, 80);
  const phone = clean(data.phone, 30);
  const page = clean(data.page, 200);

  if (restaurant.length < 2 || name.length < 2) return json({ error: 'missing_fields' }, 400);
  if (!/^[+()\d\s.-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
    return json({ error: 'invalid_phone' }, 400);
  }

  const tel = phone.replace(/[^\d+]/g, '');
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#100D1A">
      <h2 style="margin:0 0 12px">New restaurant pilot application</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td style="color:#7A7486">Restaurant</td><td><b>${esc(restaurant)}</b></td></tr>
        <tr><td style="color:#7A7486">Name</td><td>${esc(name)}</td></tr>
        <tr><td style="color:#7A7486">Phone</td><td><a href="tel:${esc(tel)}">${esc(phone)}</a></td></tr>
        <tr><td style="color:#7A7486">Page</td><td>${esc(page || '/restaurant-pilot')}</td></tr>
      </table>
    </div>`;
  const text = `New restaurant pilot application\n\nRestaurant: ${restaurant}\nName: ${name}\nPhone: ${phone}\nPage: ${page || '/restaurant-pilot'}\n`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `Pilot application: ${restaurant}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error('pilot-apply: Resend error', res.status, await res.text());
    return json({ error: 'send_failed' }, 502);
  }

  return json({ ok: true }, 200);
}
