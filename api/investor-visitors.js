export const config = { runtime: 'edge' };

// Private "who opened the investor page and what they looked at" report for the founders.
// Served at /investments/visitors. Needs env INVESTOR_ADMIN_KEY. Open once as
// /investments/visitors?key=<INVESTOR_ADMIN_KEY>: that sets an admin cookie for 90 days.
// Investors with the shared page password cannot open it. ?csv=1 downloads the email list.

import { sha256hex, cookieValue, supabaseEnv, sbAll, NOINDEX, SECTIONS, SECTION_LABELS } from './_investor-auth.js';

const PANELS = {
  'p-traction': 'Traction numbers', 'p-collabs': 'Collab examples', 'p-problem': 'Problem sources', 'p-product': 'Product',
  'p-pricing': 'Pricing', 'p-cake': 'Layer cake', 'p-market': 'Market', 'p-comp': 'Competition map',
  'p-expansion': 'City playbook', 'p-funds': 'Use of funds', 'p-why': 'Why now', 'p-exits': 'Exits',
  'p-loop': 'Keep me in the loop',
};
const EVENTS = ['investor.page_view', 'investor.panel_open', 'investor.section_view', 'investor.time', 'investor.subscribe', 'investor.whatsapp_click'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX, ...extra } });
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Helsinki', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function dur(s) {
  s = Math.round(s || 0);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + String(s % 60).padStart(2, '0') + 's';
  return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
}

const panelName = (p) => PANELS[p] || p;

function page(inner) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${NOINDEX}">
<title>Investor page analytics</title><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/fonts.css">
<style>*{box-sizing:border-box;margin:0}body{font-family:'General Sans',system-ui,sans-serif;background:#F6F5FA;color:#13111F;padding:32px 16px}
.w{max-width:1240px;margin:0 auto}h1{font-family:'Clash Display',sans-serif;font-size:36px;font-weight:600;margin-bottom:6px}h2{font-family:'Clash Display',sans-serif;font-size:22px;font-weight:600;margin:36px 0 12px}
.m{color:#5B5770;margin-bottom:24px;max-width:860px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.c{background:#fff;border-radius:16px;padding:18px}.c b{display:block;font-family:'Clash Display',sans-serif;font-size:32px;font-weight:600;color:#E2671F}.c span{color:#5B5770;font-size:14px}
.t{overflow-x:auto;background:#fff;border-radius:16px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #E7E5EE;vertical-align:top}
th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#5B5770;white-space:nowrap}td.nw{white-space:nowrap}
.tag{display:inline-block;background:#FFF4DF;border-radius:20px;padding:2px 10px;font-weight:600}.muted{color:#A7A3B8}
.trail{display:flex;flex-wrap:wrap;gap:4px;min-width:340px}.s{font-size:12px;border-radius:6px;padding:2px 7px;background:#F1F0F5;color:#B5B1C4;white-space:nowrap}
.s.on{background:#FFE7BF;color:#13111F}.s.on b{color:#E2671F;font-weight:600}
.p{display:inline-block;font-size:12px;border-radius:6px;padding:2px 7px;background:#E7F0FF;color:#1D3A6B;margin:0 4px 4px 0;white-space:nowrap}
.bar{height:10px;border-radius:5px;background:#F7A21B;min-width:2px}.bw{background:#F1F0F5;border-radius:5px;width:220px}
code{background:#FFF4DF;padding:2px 6px;border-radius:6px}a{color:#E2671F}</style></head><body><div class="w">${inner}</div></body></html>`;
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
    rows = await sbAll(env, `product_events?select=event_name,anonymous_id,metadata,created_at&event_name=in.(${EVENTS.join(',')})&order=created_at.asc`);
  } catch (e) {
    return html(page('<h1>Database error</h1><p class="m">' + esc(e.message) + '</p>'), 502);
  }

  // ---- per visitor (one browser) ----
  const byVisitor = new Map();
  const list = new Map();
  for (const r of rows) {
    const m = r.metadata || {};
    let v = byVisitor.get(r.anonymous_id);
    if (!v) {
      v = { id: r.anonymous_id, first: r.created_at, last: r.created_at, views: 0, secs: 0, dwell: {}, pdwell: {}, seen: new Set(),
        panels: new Map(), refs: new Set(), place: '', device: '', referrer: '', email: '', wa: false };
      byVisitor.set(r.anonymous_id, v);
    }
    v.last = r.created_at;
    if (m.ref) v.refs.add(m.ref);
    if (m.city || m.country) v.place = [m.city, m.country].filter(Boolean).join(', ');
    if (m.device) v.device = m.device + (m.browser ? ' · ' + m.browser : '');
    if (m.referrer && !v.referrer) v.referrer = m.referrer;
    switch (r.event_name) {
      case 'investor.page_view': v.views++; break;
      case 'investor.panel_open': if (m.panel) v.panels.set(m.panel, (v.panels.get(m.panel) || 0) + 1); break;
      case 'investor.section_view': if (m.section) v.seen.add(m.section); break;
      case 'investor.time':
        v.secs += Number(m.secs) || 0;
        for (const [k, s] of Object.entries(m.dwell || {})) { v.dwell[k] = (v.dwell[k] || 0) + s; if (s >= 2) v.seen.add(k); }
        for (const [k, s] of Object.entries(m.pdwell || {})) v.pdwell[k] = (v.pdwell[k] || 0) + s;
        break;
      case 'investor.subscribe':
        if (m.email) {
          v.email = m.email;
          if (!list.has(m.email)) list.set(m.email, { email: m.email, name: m.name || '', ref: m.ref || '', place: [m.city, m.country].filter(Boolean).join(', '), at: r.created_at });
        }
        break;
      case 'investor.whatsapp_click': v.wa = true; break;
    }
  }
  const visitors = [...byVisitor.values()].filter((v) => v.views || v.secs || v.seen.size).sort((a, b) => (a.last < b.last ? 1 : -1));
  const subscribers = [...list.values()].sort((a, b) => (a.at < b.at ? 1 : -1));

  if (url.searchParams.get('csv') === '1') {
    // neutralise spreadsheet formulas (=, +, -, @, tab, CR at the start of a cell)
    const q = (x) => { let t = String(x || ''); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    const csv = ['email,name,link_tag,where,signed_up_utc'].concat(subscribers.map((x) => [x.email, x.name, x.ref, x.place, x.at].map(q).join(','))).join('\r\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="promobeez-investor-list.csv"', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': NOINDEX } });
  }

  // ---- totals ----
  const now = Date.now();
  const views = visitors.reduce((a, v) => a + v.views, 0);
  const week = visitors.filter((v) => now - Date.parse(v.last) < 7 * 864e5).length;
  const tagged = new Set(visitors.flatMap((v) => [...v.refs]));
  const waClicks = visitors.filter((v) => v.wa).length;
  const timed = visitors.filter((v) => v.secs > 0);
  const avgTime = timed.length ? timed.reduce((a, v) => a + v.secs, 0) / timed.length : 0;
  const reachedEnd = visitors.filter((v) => v.seen.has('round') || v.seen.has('contact')).length;

  // screen funnel: how many visitors reached each screen, how long they stayed
  const funnel = SECTIONS.map((id) => {
    const who = visitors.filter((v) => v.seen.has(id));
    const secs = who.reduce((a, v) => a + (v.dwell[id] || 0), 0);
    return { id, n: who.length, avg: who.length ? secs / who.length : 0 };
  });
  const maxN = Math.max(1, ...funnel.map((f) => f.n));

  // extra materials (panels)
  const panelStats = new Map();
  for (const v of visitors) {
    const ids = new Set([...v.panels.keys(), ...Object.keys(v.pdwell)]);
    for (const p of ids) {
      const x = panelStats.get(p) || { p, opens: 0, people: 0, secs: 0 };
      x.opens += v.panels.get(p) || 0; x.people++; x.secs += v.pdwell[p] || 0;
      panelStats.set(p, x);
    }
  }

  // personal links
  const byRef = new Map();
  for (const v of visitors) for (const ref of v.refs) {
    const x = byRef.get(ref) || { ref, visitors: 0, views: 0, secs: 0, seen: new Set(), panels: new Set(), last: v.last, email: '' };
    x.visitors++; x.views += v.views; x.secs += v.secs; v.seen.forEach((s) => x.seen.add(s)); v.panels.forEach((n, p) => x.panels.add(p));
    if (v.last > x.last) x.last = v.last;
    if (v.email) x.email = v.email;
    byRef.set(ref, x);
  }

  const trail = (v) => '<div class="trail">' + SECTIONS.map((id) => {
    const s = v.dwell[id] || 0;
    return v.seen.has(id) ? `<span class="s on">${esc(SECTION_LABELS[id])}${s ? ' <b>' + dur(s) + '</b>' : ''}</span>` : `<span class="s">${esc(SECTION_LABELS[id])}</span>`;
  }).join('') + '</div>';
  const panelsOf = (v) => {
    const ids = new Set([...v.panels.keys(), ...Object.keys(v.pdwell)]);
    return [...ids].map((p) => `<span class="p">${esc(panelName(p))}${v.pdwell[p] ? ' · ' + dur(v.pdwell[p]) : ''}${(v.panels.get(p) || 0) > 1 ? ' ×' + v.panels.get(p) : ''}</span>`).join('') || '<span class="muted">—</span>';
  };
  const who = (v) => (v.refs.size ? [...v.refs].map((r) => `<span class="tag">${esc(r)}</span>`).join(' ') : `<span class="muted">unknown · ${esc(v.id.slice(0, 6))}</span>`)
    + (v.email ? `<br><small>${esc(v.email)}</small>` : '') + (v.referrer ? `<br><small class="muted">from ${esc(v.referrer)}</small>` : '');

  const inner = `
<h1>Investor page analytics</h1>
<p class="m">Everyone who got past the password on /investments: which screens they actually looked at (2+ seconds), how long, and which extra materials they opened. Time counts only while the tab is visible and the reader is active. Helsinki time. To know who a visitor is, send each investor a personal link like <code>promobeez.com/investments?i=acme-ventures</code>.</p>
<div class="cards">
  <div class="c"><b>${visitors.length}</b><span>unique visitors (browsers)</span></div>
  <div class="c"><b>${views}</b><span>page views</span></div>
  <div class="c"><b>${week}</b><span>visitors in the last 7 days</span></div>
  <div class="c"><b>${dur(avgTime)}</b><span>average active time</span></div>
  <div class="c"><b>${reachedEnd}</b><span>reached the round / contact</span></div>
  <div class="c"><b>${tagged.size}</b><span>personal links opened</span></div>
  <div class="c"><b>${subscribers.length}</b><span>on the email list</span></div>
  <div class="c"><b>${waClicks}</b><span>clicked the WhatsApp group</span></div>
</div>

${byRef.size ? `<h2>Investors (personal links)</h2><div class="t"><table><tr><th>Link tag</th><th>Last seen</th><th>Visits</th><th>Active time</th><th>Screens seen</th><th>Extra materials</th><th>Email</th></tr>
${[...byRef.values()].sort((a, b) => (a.last < b.last ? 1 : -1)).map((x) => `<tr><td><span class="tag">${esc(x.ref)}</span></td><td class="nw">${fmt(x.last)}</td><td>${x.views}</td><td class="nw">${dur(x.secs)}</td><td>${x.seen.size} / ${SECTIONS.length}</td><td>${[...x.panels].map((p) => `<span class="p">${esc(panelName(p))}</span>`).join('') || '<span class="muted">—</span>'}</td><td>${esc(x.email)}</td></tr>`).join('')}</table></div>` : ''}

<h2>Every visitor: screens and materials</h2>
<div class="t"><table><tr><th>Last seen</th><th>Who</th><th>Where · device</th><th>Visits</th><th>Active time</th><th>Screens (time on each)</th><th>Extra materials opened</th><th>Joined</th></tr>
${visitors.map((v) => `<tr><td class="nw">${fmt(v.last)}<br><small class="muted">first ${fmt(v.first)}</small></td><td>${who(v)}</td><td>${esc(v.place)}<br><small class="muted">${esc(v.device)}</small></td><td>${v.views}</td><td class="nw">${dur(v.secs)}</td><td>${trail(v)}</td><td>${panelsOf(v)}</td><td>${[v.email ? 'Email' : '', v.wa ? 'WhatsApp' : ''].filter(Boolean).join('<br>') || '<span class="muted">—</span>'}</td></tr>`).join('') || '<tr><td colspan="8">No visits yet.</td></tr>'}
</table></div>

<h2>Screen funnel</h2>
<div class="t"><table><tr><th>Screen</th><th>Visitors who saw it</th><th></th><th>Avg time there</th></tr>
${funnel.map((f) => `<tr><td>${esc(SECTION_LABELS[f.id])}</td><td>${f.n}${visitors.length ? ' <span class="muted">(' + Math.round((100 * f.n) / visitors.length) + '%)</span>' : ''}</td><td><div class="bw"><div class="bar" style="width:${Math.round((100 * f.n) / maxN)}%"></div></div></td><td>${f.n ? dur(f.avg) : '—'}</td></tr>`).join('')}
</table></div>

<h2>Extra materials</h2>
<div class="t"><table><tr><th>Panel</th><th>People</th><th>Opens</th><th>Total reading time</th></tr>
${[...panelStats.values()].sort((a, b) => b.people - a.people || b.secs - a.secs).map((x) => `<tr><td>${esc(panelName(x.p))}</td><td>${x.people}</td><td>${x.opens}</td><td>${dur(x.secs)}</td></tr>`).join('') || '<tr><td colspan="4">Nothing opened yet.</td></tr>'}
</table></div>

<h2>Email list ${subscribers.length ? '<a href="/investments/visitors?csv=1" style="font-size:15px;margin-left:10px">Download CSV</a>' : ''}</h2>
<div class="t"><table><tr><th>Signed up</th><th>Email</th><th>Name</th><th>Link tag</th><th>Where</th></tr>
${subscribers.map((x) => `<tr><td class="nw">${fmt(x.at)}</td><td>${esc(x.email)}</td><td>${esc(x.name)}</td><td>${x.ref ? '<span class="tag">' + esc(x.ref) + '</span>' : ''}</td><td>${esc(x.place)}</td></tr>`).join('') || '<tr><td colspan="5">Nobody yet.</td></tr>'}
</table></div>`;
  return html(page(inner));
}
