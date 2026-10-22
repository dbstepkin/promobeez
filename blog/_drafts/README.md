# Blog cluster stubs (drafts — do not publish)

These files are outlines only. Keep them under `blog/_drafts/` until written.
When published: remove `noindex`, add Vercel rewrite + sitemap entry, and add reciprocal `hreflang` if a Finnish counterpart exists.

## URL pattern for Finnish content

Agreed pattern: `/fi/{{path}}` subdirectory (inherits domain authority).

For any page that exists in both languages, emit reciprocal:

```html
<link rel="alternate" hreflang="en" href="https://www.promobeez.com/{{path}}" />
<link rel="alternate" hreflang="fi" href="https://www.promobeez.com/fi/{{path}}" />
<link rel="alternate" hreflang="x-default" href="https://www.promobeez.com/{{path}}" />
```

Only emit hreflang when a real counterpart exists. Do not point Finnish URLs at the English homepage.

## Taxonomy

Decision: remove `article:tag` meta until there are 8+ posts. No thin category pages yet.

---

## Stub index

| Slug | Working title | Intent | Priority | Draft file |
|---|---|---|---|---|
| `/blog/local-creator-marketing` | Local creator marketing: the complete guide | Pillar hub | P1 | `local-creator-marketing.md` |
| `/blog/influencer-marketing-cost-small-business` | What influencer marketing actually costs a small business in Finland | Commercial | P1 | `influencer-marketing-cost-small-business.md` |
| `/blog/barter-collaboration-what-to-agree` | Barter collaboration with a creator: what to agree before anything is posted | BOFU | P2 | `barter-collaboration-what-to-agree.md` |
| `/blog/find-local-creators-helsinki` | How to find local creators in Helsinki | Commercial + geo | P2 | `find-local-creators-helsinki.md` |
| `/blog/instagram-markkinointi-ravintolalle` | Instagram-markkinointi ravintolalle: mistä aloittaa | Finnish, local | P1 | `instagram-markkinointi-ravintolalle.md` |
| `/fi/blogi/vaikuttajamarkkinoinnin-merkinta` | Vaikuttajamarkkinoinnin merkintä: KKV:n ohjeet | Finnish, regulatory | **Published** | `vaikuttajamarkkinoinnin-merkinta.md` |
| `/blog/promobeez-vs-invited-agency` | Promobeez vs Invited Agency | Comparison, BOFU, brand query | P1 | `promobeez-vs-invited-agency.md` (written 2026-10-21) |
| `/blog/promobeez-vs-vaiku` | Promobeez vs Vaiku | Comparison, BOFU, "Vaiku alternative" | P1 | `promobeez-vs-vaiku.md` (written 2026-10-21) |
| `/fi/blogi/promobeez-vs-invited` | Promobeez vs Invited Agency (FI) | Vertailu, BOFU | P1 | `promobeez-vs-invited.fi.md` (written 2026-10-22) |
| `/fi/blogi/promobeez-vs-vaiku` | Promobeez vs Vaiku (FI) | Vertailu, "Vaiku vaihtoehto" | P1 | `promobeez-vs-vaiku.fi.md` (written 2026-10-22) |
| `/blog/promobeez-vs-castersapp` | Promobeez vs CastersApp | Comparison, BOFU | P1 | `promobeez-vs-castersapp.md` (written 2026-10-22) |
| `/fi/blogi/promobeez-vs-castersapp` | Promobeez vs CastersApp (FI) | Vertailu, BOFU | P1 | `promobeez-vs-castersapp.fi.md` (written 2026-10-22) |
