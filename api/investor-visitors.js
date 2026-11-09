export const config = { runtime: 'edge' };

// Private "who opened the investor page" report for the founders. Served at /investments/visitors.
// Needs env INVESTOR_ADMIN_KEY. Open once as /investments/visitors?key=<INVESTOR_ADMIN_KEY>:
// that sets an admin cookie for 90 days, so later visits need no key in the URL.
// Investors with the shared page password cannot open it.

import { sha256hex, cookieValue, supabaseEnv, sbAll, NOINDEX } from './_investor-auth.js';

const PANELS = {
  'p-traction': 'Traction', 'p-collabs': 'Collab examples', 'p-problem': 'Problem', 'p-product': 'Product',
  'p-pricing': 'Pricing', 'p-cake': 'Layer cake', 'p-market': 'Market', 'p-comp': 'Competition',
  'p-expansion': 'Expansion', 'p-funds': 'Use of funds',
};

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX, ...extra } });
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Helsinki', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function page(inner) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${NOINDEX}">
<title>Investor page visitors</title><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/fonts.css">
<style>*{box-sizing:border-box;margin:0}body{font-family:'General Sans',system-ui,sans-serif;background:#F6F5FA;color:#13111F;padding:32px 16px}
.w{max-width:1100px;margin:0 auto}h1{font-family:'Clash Display',sans-serif;font-size:36px;font-weight:600;margin-bottom:6px}h2{font-family:'Clash Display',sans-serif;font-size:22px;font-weight:600;margin:36px 0 12px}
.m{color:#5B5770;margin-bottom:24px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.c{background:#fff;border-radius:16px;padding:18px}.c b{display:block;font-family:'Clash Display',sans-serif;font-size:34px;font-weight:600;color:#E2671F}.c span{color:#5B5770;font-size:14px}
.t{overflow-x:auto;background:#fff;border-radius:16px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #E7E5EE;vertical-align:top;white-space:nowrap}
th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#5B5770}td.wrap{white-space:normal;min-width:220px}.tag{display:inline-block;background:#FFF4DF;border-radius:20px;padding:2px 10px;font-weight:600}
code{background:#FFF4DF;padding:2px 6px;border-radius:6px}</style></head><body><div class="w">${inner}</div></body></html>`;
}

export default async function handler(request) {
  const adminKey = (process.env.INVESTOR_ADMIN_KEY || '').trim();
  if (!adminKey) return html(page('<h1>Not configured</h1><p class="m">Set INVESTOR_ADMIN_KEY in the Vercel project.</p>'), 503);
  const token = await sha256hex(adminKey + '|promobeez-investor-admin');
  const url = new URL(request.url);
  const given = url.searchParams.get('key');

  if (given) {
    if ((await sha256hex(given + '|promobeez-investor-admin')) !== token) return html(page('<h1>Wrong key</h1>'), 401);
    return new Response(null, { status: 303, headers: {
      Location: '/investments/visitors',
      'Set-Cookie': `pb_inv_admin=${token}; Path=/investments; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    } });
  }
  if (cookieValue(request, 'pb_inv_admin') !== token) {
    return html(page('<h1>Private</h1><p class="m">Open this page with your admin key: <code>/investments/visitors?key=…</code></p>'), 401);
  }

  const env = supabaseEnv();
  if (!env) return html(page('<h1>Not configured</h1><p class="m">Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.</p>'), 503);

  let rows;
  try {
    rows = await sbAll(env, 'product_events?select=event_name,anonymous_id,metadata,created_at&event_name=in.(investor.page_view,investor.panel_open)&order=created_at.desc');
  } catch (e) {
    return html(page('<h1>Database error</h1><p class="m">' + esc(e.message) + '</p>'), 502);
  }

  const now = Date.now();
  const views = rows.filter((r) => r.event_name === 'investor.page_view');
  const byVisitor = new Map();
  for (const r of rows.slice().reverse()) {
    const m = r.metadata || {};
    let v = byVisitor.get(r.anonymous_id);
    if (!v) {
      v = { id: r.anonymous_id, first: r.created_at, last: r.created_at, views: 0, panels: new Map(), refs: new Set(), place: '', device: '', referrer: '' };
      byVisitor.set(r.anonymous_id, v);
    }
    v.last = r.created_at;
    if (m.ref) v.refs.add(m.ref);
    if (m.city || m.country) v.place = [m.city, m.country].filter(Boolean).join(', ');
    if (m.device) v.device = m.device + (m.browser ? ' · ' + m.browser : '');
    if (m.referrer && !v.referrer) v.referrer = m.referrer;
    if (r.event_name === 'investor.page_view') v.views++;
    if (r.event_name === 'investor.panel_open' && m.panel) v.panels.set(m.panel, (v.panels.get(m.panel) || 0) + 1);
  }
  const visitors = [...byVisitor.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
  const week = visitors.filter((v) => now - Date.parse(v.last) < 7 * 864e5).length;
  const tagged = new Set(visitors.flatMap((v) => [...v.refs]));

  const byRef = new Map();
  for (const v of visitors) for (const ref of v.refs) {
    const x = byRef.get(ref) || { ref, visitors: 0, views: 0, last: v.last };
    x.visitors++; x.views += v.views; if (v.last > x.last) x.last = v.last;
    byRef.set(ref, x);
  }

  const panelTotals = new Map();
  for (const r of rows) if (r.event_name === 'investor.panel_open' && r.metadata && r.metadata.panel) panelTotals.set(r.metadata.panel, (panelTotals.get(r.metadata.panel) || 0) + 1);

  const inner = `
<h1>Investor page visitors</h1>
<p class="m">Everyone who got past the password on /investments. Times are Helsinki time. To see who a visitor is, send each investor a personal link like <code>promobeez.com/investments?i=acme-ventures</code>.</p>
<div class="cards">
  <div class="c"><b>${views.length}</b><span>page views</span></div>
  <div class="c"><b>${visitors.length}</b><span>unique visitors (browsers)</span></div>
  <div class="c"><b>${week}</b><span>visitors in the last 7 days</span></div>
  <div class="c"><b>${tagged.size}</b><span>personal links opened</span></div>
</div>
${byRef.size ? `<h2>Personal links</h2><div class="t"><table><tr><th>Link tag</th><th>Visitors</th><th>Views</th><th>Last seen</th></tr>
${[...byRef.values()].sort((a, b) => (a.last < b.last ? 1 : -1)).map((x) => `<tr><td><span class="tag">${esc(x.ref)}</span></td><td>${x.visitors}</td><td>${x.views}</td><td>${fmt(x.last)}</td></tr>`).join('')}</table></div>` : ''}
<h2>Visitors</h2><div class="t"><table><tr><th>Last seen</th><th>Who</th><th>Where</th><th>Device</th><th>Views</th><th>Opened</th><th>First seen</th></tr>
${visitors.map((v) => `<tr><td>${fmt(v.last)}</td><td>${v.refs.size ? [...v.refs].map((r) => `<span class="tag">${esc(r)}</span>`).join(' ') : '<span style="color:#A7A3B8">unknown · ' + esc(v.id.slice(0, 6)) + '</span>'}${v.referrer ? '<br><small style="color:#A7A3B8">from ' + esc(v.referrer) + '</small>' : ''}</td><td>${esc(v.place)}</td><td>${esc(v.device)}</td><td>${v.views}</td><td class="wrap">${[...v.panels].map(([p, n]) => esc(PANELS[p] || p) + (n > 1 ? ' ×' + n : '')).join(', ') || '—'}</td><td>${fmt(v.first)}</td></tr>`).join('') || '<tr><td colspan="7">No visits yet.</td></tr>'}
</table></div>
${panelTotals.size ? `<h2>What investors open most</h2><div class="t"><table><tr><th>Panel</th><th>Opens</th></tr>${[...panelTotals].sort((a, b) => b[1] - a[1]).map(([p, n]) => `<tr><td>${esc(PANELS[p] || p)}</td><td>${n}</td></tr>`).join('')}</table></div>` : ''}`;
  return html(page(inner));
}
