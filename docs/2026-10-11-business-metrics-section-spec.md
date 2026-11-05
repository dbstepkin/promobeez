# Spec: "Numbers" section under the hero of the business page

_Draft 2026-10-11. Owner: Dima. Status: proposed, not approved._

## 1. Goal
Show a business owner, right under the hero, what happens after they publish an offer, in figures they can judge
without marketing knowledge. Every figure must be reproducible from production data by a fixed rule written here.

Pages: `for-businesses.html`, `fi/yrityksille.html`, `it/per-le-attivita.html`. The section goes between the hero
(`<h1>` block) and `<section class="benefits">`. On the Italian page the figures are labelled "Helsinki".

## 2. Sampling rule (the part that keeps us honest)
1. **Unit = one published offer**, not a brand and not a calendar month.
2. **Window = offers published in the 60 days that end 14 days before the snapshot date.** The 14-day gap lets every
   offer collect applications before it is counted. The rolling window drops the early period by date alone.
3. **Only time selects.** Every offer in the window counts: zero-application, paused, expired and deleted ones too.
   Nothing is ever excluded because its result was weak. Excluded: founder test accounts only.
4. **Median, not mean**, for per-offer figures ("a typical offer").
5. **Applications = creator-initiated only** (`applications.is_direct_proposal = false`).
6. **The period and sample size are printed under the tiles** ("Offers published 1 Aug – 27 Sep 2026, 18 offers").
7. **A tile is hidden when its sample is below 10** (offers or brands, whichever the tile is based on).
8. Round down, never up. Changing this rule needs an entry in `0. PB-Management/decisions/log.md`.

Why not "paying brands only" as the base for everything: applications do not depend on the plan (paid brands 14.7 per
offer, all brands 14.2), the paid sample is 5 brands (Starter: 1), and brands that paid are partly the ones that got many
applications. The paid sample is the right base for one tile only: contacts opened (tile 5).

## 3. Tiles
Indicative values were computed on 2026-10-11 for offers published since 2026-08-15 (18 offers, 16 brands). The final
values come from the script in §5, using the window in §2.

| # | Tile (EN copy) | Definition | Indicative |
|---|---|---|---|
| 1 | **13 creators apply** to a typical offer | Median applications per offer | 13 (mean 14.2; 16 of 18 offers got ≥5) |
| 2 | First application **within the hour** | Median time from `published_at` to the first application; sub-line: share of offers with one in 24 h | 20 min; 17 of 18 in 24 h |
| 3 | **60,000 followers** between the creators who apply | Per offer: sum of `social_accounts.follower_count` over its applicants; median over offers | 60,800 |
| 4 | **Last month:** 185 applications · 64 active creators · 30 posts about venues | Calendar month, whole platform: applications created; distinct applying creators; `collab_detections` by `posted_at` | September 2026 |
| 5 | Businesses on paid plans open **16 creator contacts** | `contact_unlocks` per brand with an active Starter/Growth plan | 15.6 (5 brands, 78 unlocks) — **hidden until 10 brands** |

Wording limits:
- Tile 3 says "followers", never "reach" or "views": it sums accounts across Instagram, TikTok and Threads, and people
  who follow two creators are counted twice.
- Tile 4 "posts" is a floor (detection started 2026-09-14 and misses posts). Say "at least" or nothing.
- No "guaranteed", no promise of posts or visits: we sell access to creators.

Plan line under the tiles (facts from `subscription_plans`, no statistics): Free shows the first 5 applicants and 3
contacts, Starter 10 applicants and 10 contacts a month, Growth all of them.

## 4. Figures we do not show (and why)
| Figure | Value 2026-10-11 | Why not |
|---|---|---|
| Posts per application / per opened contact | 41 posts on 432 applications; 25% of contacts ≥45 days old | Small, and a floor: detection is young and incomplete |
| Views per post | median ~800; 60,700 in total over 41 posts | Small per post; only 32 of 41 posts expose views |
| Reviews | 10, all 5★ | Sample too small; bad visits never trigger a review request |
| Registered creators (441) | — | About half never applied or are outside Greater Helsinki. If a base figure is wanted, use creators who applied at least once: 107, 880,000 followers in total |

## 5. Delivery
- **v1 (recommended): static numbers refreshed monthly.** Add `0. PB-Management/scripts/landing_metrics.py` (read-only,
  same access as `metrics.py`) that prints the tiles as JSON with period and sample sizes. On the first working day of
  the month the numbers are pasted into the three pages and committed. A person sees them before they go live.
- v2 (later, only if the monthly step becomes a burden): a Supabase function returning these aggregates only, read by a
  cached Vercel function in `api/`, with the v1 numbers kept in the HTML as the no-JS fallback.

To verify before building: that soft-deleted offers keep `published_at` (today 36 offers have it, 64 are deleted). If
deletion clears it, the sample silently loses deleted offers and rule 3 is broken.

## 6. Design and acceptance
- One row of 4 tiles on desktop, 2×2 on mobile; big number, one short line, one small sub-line. Existing page styles.
- Footnote line with period, sample size and "updated <date>".
- Copy in EN, FI and IT; the Finnish text goes through the same proofreading as the rest of `yrityksille.html`.
- Done when: the script reproduces every number on the page; the footnote matches the script output; tiles below the
  sample threshold are absent; no layout shift at 360 px width.
