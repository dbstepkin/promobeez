// Shared helpers for the investor page APIs (/investments/live, /investments/visit, /investments/visitors).
// Files starting with "_" are not deployed as functions by Vercel.

const NOINDEX = 'noindex, nofollow, noarchive, nosnippet';

export async function sha256hex(s) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function cookieValue(request, name) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// Same token as middleware.js sets after the password form.
export async function isInvestor(request) {
  const pw = (process.env.INVESTOR_PASSWORD || '').trim();
  if (!pw) return false;
  const token = await sha256hex(pw + '|promobeez-investors');
  const got = cookieValue(request, 'pb_inv');
  return /^[a-f0-9]{64}$/.test(got) && sameString(got, token);
}

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX, ...extra },
  });
}

export function supabaseEnv() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && key ? { url, key } : null;
}

export async function sb(env, path, init = {}) {
  const res = await fetch(env.url + '/rest/v1/' + path, {
    ...init,
    headers: { apikey: env.key, Authorization: 'Bearer ' + env.key, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error('supabase ' + res.status + ' ' + path.split('?')[0]);
  return res;
}

// Row count without downloading rows.
export async function sbCount(env, table, filter = '') {
  const res = await sb(env, `${table}?select=*&limit=1${filter ? '&' + filter : ''}`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
  const range = res.headers.get('content-range') || '';
  return Number(range.split('/')[1]) || 0;
}

// All rows, paged by 1000.
export async function sbAll(env, path) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const res = await sb(env, path, { headers: { Range: `${from}-${from + 999}` } });
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

export { NOINDEX };
