// Shared Meta Conversion API helper. Filename "_" = not deployed as a Vercel route.
// Sends the same event to every ID in META_PIXEL_IDS. Failures are logged, never thrown to callers.

const GRAPH_VERSION = 'v21.0';
const DEFAULT_PIXEL_IDS = ['1367558515342525', '4625362231124918'];

export function metaPixelIds() {
  const raw = (process.env.META_PIXEL_IDS || '').trim();
  if (!raw) return DEFAULT_PIXEL_IDS.slice();
  return raw
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter((id) => /^\d{5,20}$/.test(id));
}

export async function sha256Hex(value) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeEmail(email) {
  const v = String(email || '').trim().toLowerCase();
  if (!v || !v.includes('@')) return '';
  return v;
}

export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 7 ? digits : '';
}

export async function hashUserData({ email, phone, fbp, fbc, clientIp, userAgent } = {}) {
  const user_data = {};
  const em = normalizeEmail(email);
  if (em) user_data.em = [await sha256Hex(em)];
  const ph = normalizePhone(phone);
  if (ph) user_data.ph = [await sha256Hex(ph)];
  if (fbp && typeof fbp === 'string' && fbp.length < 200) user_data.fbp = fbp;
  if (fbc && typeof fbc === 'string' && fbc.length < 500) user_data.fbc = fbc;
  if (clientIp && clientIp !== 'unknown') user_data.client_ip_address = clientIp;
  if (userAgent) user_data.client_user_agent = String(userAgent).slice(0, 512);
  return user_data;
}

/**
 * Fire-and-forget friendly: resolves to { ok, results } and never throws.
 * @param {{
 *   eventName: string,
 *   eventId?: string,
 *   eventSourceUrl?: string,
 *   actionSource?: string,
 *   email?: string,
 *   phone?: string,
 *   fbp?: string,
 *   fbc?: string,
 *   clientIp?: string,
 *   userAgent?: string,
 *   customData?: Record<string, unknown>,
 *   eventTime?: number,
 * }} opts
 */
export async function sendMetaCapiEvent(opts) {
  const token = (process.env.META_CAPI_ACCESS_TOKEN || '').trim();
  const pixelIds = metaPixelIds();
  if (!token || !pixelIds.length) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const eventName = String(opts.eventName || '').trim();
  if (!eventName) return { ok: false, skipped: true, reason: 'missing_event' };

  const eventTime = Number.isFinite(opts.eventTime)
    ? Math.floor(opts.eventTime)
    : Math.floor(Date.now() / 1000);

  const user_data = await hashUserData(opts);
  const event = {
    event_name: eventName,
    event_time: eventTime,
    action_source: opts.actionSource || 'website',
    user_data,
  };

  if (opts.eventId) event.event_id = String(opts.eventId).slice(0, 100);
  if (opts.eventSourceUrl) event.event_source_url = String(opts.eventSourceUrl).slice(0, 2048);
  if (opts.customData && typeof opts.customData === 'object') {
    event.custom_data = opts.customData;
  }

  const body = { data: [event] };
  const testCode = (process.env.META_CAPI_TEST_EVENT_CODE || '').trim();
  if (testCode) body.test_event_code = testCode;

  const results = await Promise.all(
    pixelIds.map(async (pixelId) => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
        const text = await res.text();
        if (!res.ok) {
          console.error('meta-capi:', pixelId, res.status, text.slice(0, 300));
          return { pixelId, ok: false, status: res.status };
        }
        return { pixelId, ok: true, status: res.status };
      } catch (e) {
        console.error('meta-capi:', pixelId, e && e.message);
        return { pixelId, ok: false, error: String(e && e.message) };
      }
    })
  );

  return { ok: results.every((r) => r.ok), results };
}

export function clientIpFromRequest(req) {
  const fwd = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return fwd || req.headers.get('x-real-ip') || '';
}

/** Non-blocking: schedule CAPI without delaying the caller response path. */
export function fireMetaCapiEvent(opts) {
  try {
    const p = sendMetaCapiEvent(opts);
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    /* never break callers */
  }
}
