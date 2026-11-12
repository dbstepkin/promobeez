export const config = { runtime: 'edge' };

// Browser → CAPI bridge. Pixel stays client-side; this endpoint mirrors events server-side
// to both META_PIXEL_IDS with the same event_id for deduplication.

import { clientIpFromRequest, sendMetaCapiEvent } from './_meta-capi.js';

const ALLOWED_ORIGIN =
  /^https:\/\/(www\.)?promobeez\.com$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'Schedule',
  'Engage20s',
]);

const MAX_BODY = 4096;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function cookieFromHeader(cookieHeader, name) {
  const m = String(cookieHeader || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGIN.test(origin)) return json({ error: 'forbidden' }, 403);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413);

  let data;
  try {
    data = JSON.parse(raw || '{}');
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const eventName = String(data.event_name || data.eventName || '').trim();
  if (!ALLOWED_EVENTS.has(eventName)) return json({ error: 'invalid_event' }, 400);

  const cookie = req.headers.get('cookie') || '';
  const fbp = String(data.fbp || cookieFromHeader(cookie, '_fbp') || '').slice(0, 200);
  const fbc = String(data.fbc || cookieFromHeader(cookie, '_fbc') || '').slice(0, 500);

  // Always 200 after validation so browser beacon never retries aggressively.
  // CAPI misconfig / Meta errors are logged inside sendMetaCapiEvent.
  const result = await sendMetaCapiEvent({
    eventName,
    eventId: data.event_id || data.eventId,
    eventSourceUrl: data.event_source_url || data.eventSourceUrl || req.headers.get('referer') || '',
    email: data.email,
    phone: data.phone,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    clientIp: clientIpFromRequest(req),
    userAgent: req.headers.get('user-agent') || '',
    customData:
      data.custom_data && typeof data.custom_data === 'object'
        ? data.custom_data
        : data.customData && typeof data.customData === 'object'
          ? data.customData
          : undefined,
  });

  return json({ ok: true, sent: !result.skipped, skipped: !!result.skipped });
}
