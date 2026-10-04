export const config = { runtime: 'edge' };

// "Where would your Instagram rank?" form on /promobeez-smm-awards.
// GET  -> issues a short-lived signed form token (ts.nonce.sig).
// POST -> validates the submission and forwards it to the scoring microservice.
//
// Env:
//   AWARDS_WEBHOOK_URL    where the lead is POSTed as JSON (optional; has prod default)
//   AWARDS_WEBHOOK_TOKEN  required, sent as "Authorization: Bearer <token>"
//   AWARDS_FORM_SECRET    required HMAC key for form tokens (no default)

const MIN_FILL_MS = 2500;
const MAX_TOKEN_AGE_MS = 30 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const MAX_BODY = 2048;

const ALLOWED_ORIGIN = /^https:\/\/((www|awards)\.)?promobeez\.com$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const RESERVED = new Set(['p', 'reel', 'reels', 'tv', 'explore', 'accounts', 'direct', 'about', 'developer', 'legal']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best effort only: edge isolates do not share memory, so this stops bursts, not patient abuse.
// Durable limits live on the awards-rank-check Edge Function (Supabase).
const hits = new Map();

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function formSecret() {
  return (process.env.AWARDS_FORM_SECRET || '').trim();
}

function requireSecrets() {
  if (!formSecret()) {
    console.error('awards-check: AWARDS_FORM_SECRET is not set');
    return json({ error: 'not_configured' }, 503);
  }
  if (!(process.env.AWARDS_WEBHOOK_TOKEN || '').trim()) {
    console.error('awards-check: AWARDS_WEBHOOK_TOKEN is not set');
    return json({ error: 'not_configured' }, 503);
  }
  return null;
}

// Accepts "name", "@name", "instagram.com/name", "https://www.instagram.com/name/?hl=en",
// "https:/instagram.com/name" and similar. Returns the lowercase handle or null.
export function parseInstagram(input) {
  let s = String(input || '').trim();
  if (!s || s.length > 200) return null;
  const m = s.match(/(?:instagram\.com|instagr\.am)[/\\]+(.*)$/i);
  if (m) {
    const parts = m[1].split(/[?#]/)[0].split(/[/\\]+/).filter(Boolean);
    s = parts[0] === 'stories' ? parts[1] || '' : parts[0] || '';
    if (RESERVED.has(s.toLowerCase())) return null;
  } else if (/[/\\:\s]/.test(s)) {
    return null;
  }
  s = s.replace(/^@+/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(s) || /^\.|\.$|\.\./.test(s)) return null;
  return s;
}

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sign(ts, nonce) {
  const secret = formSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${ts}.${nonce}`),
  );
  return Array.from(new Uint8Array(sig).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** @returns {{ age: number, nonce: string } | null} */
async function parseToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [ts, nonce, sig] = parts;
  if (!/^\d{13}$/.test(ts) || !/^[a-f0-9]{32}$/.test(nonce) || !sig) return null;
  if (sig !== (await sign(ts, nonce))) return null;
  return { age: Date.now() - Number(ts), nonce };
}

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

export default async function handler(req) {
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGIN.test(origin)) return json({ error: 'forbidden' }, 403);

  const secretErr = requireSecrets();
  if (secretErr) return secretErr;

  if (req.method === 'GET') {
    const ts = String(Date.now());
    const nonce = randomNonce();
    return json({ token: `${ts}.${nonce}.${await sign(ts, nonce)}` }, 200);
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!origin) return json({ error: 'forbidden' }, 403);
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'bad_request' }, 400);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: 'bad_request' }, 400);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  if (!data || typeof data !== 'object') return json({ error: 'bad_request' }, 400);

  // Honeypot: bots that fill every field get a fake success and nothing is forwarded.
  if (data.website) return json({ ok: true }, 200);

  const parsed = await parseToken(data.token);
  if (!parsed || parsed.age < MIN_FILL_MS || parsed.age > MAX_TOKEN_AGE_MS) {
    return json({ error: 'expired' }, 400);
  }

  const handle = parseInstagram(data.instagram);
  if (!handle) return json({ error: 'invalid_instagram' }, 400);
  const email = String(data.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json({ error: 'rate_limited' }, 429);

  const webhook =
    process.env.AWARDS_WEBHOOK_URL ||
    'https://db.promobeez.com/functions/v1/awards-rank-check';
  const token = (process.env.AWARDS_WEBHOOK_TOKEN || '').trim();

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'awards_rank_check',
        instagram: handle,
        instagram_url: `https://www.instagram.com/${handle}/`,
        email,
        lang: data.lang === 'fi' ? 'fi' : 'en',
        edition: String(data.edition || '').slice(0, 80),
        country: req.headers.get('x-vercel-ip-country') || null,
        client_ip: ip === 'unknown' ? null : ip,
        form_nonce: parsed.nonce,
        submitted_at: new Date().toISOString(),
      }),
    });
    if (res.status === 429 || res.status === 409) {
      return json({ error: 'rate_limited' }, 429);
    }
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (e) {
    console.error('awards-check:', e.message);
    return json({ error: 'upstream' }, 502);
  }
  return json({ ok: true }, 200);
}
