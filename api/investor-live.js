export const config = { runtime: 'edge' };

// Live platform metrics for the investor page. Served at /investments/live (vercel.json rewrite),
// so the browser sends the pb_inv cookie set by the password gate. Without it: 401.
//
// Env: INVESTOR_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//      STRIPE_SECRET_KEY (a restricted read-only key is enough: Charges + Customers read).

import { isInvestor, json, supabaseEnv, sbCount, sbAll } from './_investor-auth.js';

const CACHE_MS = 5 * 60 * 1000;
let cache = null; // per edge isolate; best effort

async function payingVenues() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) return null;
  const brands = new Set();
  let after = '';
  for (let page = 0; page < 20; page++) {
    const q = 'limit=100&expand[]=data.customer' + (after ? '&starting_after=' + after : '');
    const res = await fetch('https://api.stripe.com/v1/charges?' + q, { headers: { Authorization: 'Bearer ' + key } });
    if (!res.ok) throw new Error('stripe ' + res.status);
    const d = await res.json();
    for (const c of d.data) {
      if (!c.paid || c.status !== 'succeeded') continue;
      const id = c.customer && c.customer.metadata && c.customer.metadata.brand_id;
      if (id) brands.add(id);
    }
    if (!d.has_more || !d.data.length) break;
    after = d.data[d.data.length - 1].id;
  }
  return brands.size;
}

async function compute(env) {
  const [creators, venueAccounts, applications, collaborations, detections, offers, tracks, paying] = await Promise.all([
    sbCount(env, 'profiles', 'role=eq.creator'),
    sbCount(env, 'profiles', 'role=eq.brand'),
    sbAll(env, 'applications?select=creator_id,collaboration_id'),
    sbAll(env, 'contact_unlocks?select=brand_id,creator_id'),
    sbAll(env, 'collab_detections?select=brand_id,creator_id'),
    sbAll(env, 'collaborations?select=id,brand_id,published_at'),
    sbAll(env, 'content_tracks?select=canonical_url,platform,latest_metrics,last_scraped_at&status=neq.deleted'),
    payingVenues().catch(() => null),
  ]);

  let views = 0, likes = 0, shares = 0, comments = 0, fresh = '';
  const posts = [];
  for (const t of tracks) {
    const m = t.latest_metrics || {};
    const v = Number(m.views) || 0;
    views += v;
    likes += Number(m.likes) || 0;
    shares += Number(m.shares) || 0;
    comments += Number(m.comments) || 0;
    if (t.last_scraped_at && t.last_scraped_at > fresh) fresh = t.last_scraped_at;
    posts.push({ url: t.canonical_url, platform: t.platform, views: v, likes: Number(m.likes) || 0 });
  }
  posts.sort((a, b) => b.views - a.views);
  const postPairs = new Set(detections.map((r) => r.brand_id + '|' + r.creator_id));
  // published = went live after moderation (published_at), or got applications (older offers predate published_at).
  // Drafts and offers still in moderation ("submitted") never count.
  const appliedOffers = new Set(applications.map((r) => r.collaboration_id));
  const published = offers.filter((r) => r.published_at || appliedOffers.has(r.id));

  return {
    generatedAt: new Date().toISOString(),
    postsUpdatedAt: fresh || null,
    creators,
    venueAccounts,
    venuesWithOffers: new Set(published.map((r) => r.brand_id)).size,
    offersPublished: published.length,
    venuesCollaborated: new Set(collaborations.map((r) => r.brand_id)).size,
    collaborations: collaborations.length,
    applications: applications.length,
    applicants: new Set(applications.map((r) => r.creator_id)).size,
    // a "match" = a venue picked a creator; it has a post when our tracker found one for that venue-creator pair
    matchesWithPost: collaborations.filter((r) => postPairs.has(r.brand_id + '|' + r.creator_id)).length,
    postingCreators: new Set(detections.map((r) => r.creator_id)).size,
    postsTracked: tracks.length,
    postsInstagram: tracks.filter((t) => t.platform === 'instagram').length,
    postsTiktok: tracks.filter((t) => t.platform === 'tiktok').length,
    views,
    likes,
    shares,
    comments,
    payingVenues: paying,
    topPosts: posts.slice(0, 30),
  };
}

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'method' }, 405);
  if (!(await isInvestor(request))) return json({ error: 'unauthorized' }, 401);
  const env = supabaseEnv();
  if (!env) return json({ error: 'not_configured' }, 503);

  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return json(cache.data);
  try {
    const data = await compute(env);
    cache = { at: now, data };
    return json(data);
  } catch (e) {
    console.error('investor-live:', e && e.message);
    if (cache) return json(cache.data);
    return json({ error: 'unavailable' }, 502);
  }
}
