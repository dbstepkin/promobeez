# Meta Conversion API (landing) — design

Approved 2026-11-12.

## Goals

- Keep existing browser Facebook Pixel unchanged in behavior.
- Add server-side Conversion API on top, for both Pixel IDs.
- Fail-open: CAPI errors never break page UX or form success.

## Pixel IDs

- `1367558515342525`
- `4625362231124918`

Env: `META_PIXEL_IDS` (comma-separated), `META_CAPI_ACCESS_TOKEN`.

## Architecture

1. Browser Pixel (`assets/facebook-pixel.js`) continues to call `fbq`.
2. Same script also POSTs to `/api/meta-capi` with a shared `event_id` (Pixel `eventID` + CAPI `event_id` for dedup).
3. `/api/meta-capi` hashes optional PII and forwards to Graph API for each Pixel ID.
4. Form APIs (`subscribe`, `pilot-apply`, `awards-check`, `investor-subscribe`) fire server-side `Lead` via shared helper `api/_meta-capi.js`.

## Events

| Event | Source |
| --- | --- |
| PageView | browser (with Pixel) |
| ViewContent (engaged_dwell_20s) | browser dwell |
| Engage20s (custom) | browser dwell |
| Lead | form APIs |

## Safety

- Access token only in Vercel / `.env.local` (never in frontend).
- Empty `em` / `ph` omitted (no `null` arrays).
- CAPI calls are fire-and-forget / non-blocking for forms.
