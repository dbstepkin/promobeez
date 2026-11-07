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
| `/fi/blogi/vaikuttajamarkkinointi-hinta` | Paljonko vaikuttajamarkkinointi maksaa Suomessa? Hinnat 2026 | Hinnat, BOFU | **Published** 2026-11-07 | `vaikuttajamarkkinointi-hinta.fi.md` |
| `/fi/blogi/vaikuttajamarkkinointialustat-suomessa` | Vaikuttajamarkkinointialustat Suomessa 2026 | Vertailu, BOFU | **Published** 2026-11-07 | `vaikuttajamarkkinointialustat-suomessa.fi.md` |
| `/fi/blogi/vaikuttajamarkkinointitoimisto-vai-alusta` | Vaikuttajamarkkinointitoimisto vai alusta | Valinta, BOFU | **Published** 2026-11-07 | `vaikuttajamarkkinointitoimisto-vai-alusta.fi.md` |
| `/fi/blogi/paikalliset-vaikuttajat-helsinki` | Paikalliset vaikuttajat Helsingissä | Commercial + geo (FI) | **Published** 2026-11-07 | `paikalliset-vaikuttajat-helsinki.fi.md` |
| `/fi/blogi/ugc-vai-vaikuttajayhteistyo` | UGC vai vaikuttajayhteistyö | Valinta, BOFU | **Published** 2026-11-07 | `ugc-vai-vaikuttajayhteistyo.fi.md` |
| `/it/blog/quanto-costa-influencer-marketing` | Quanto costa l'influencer marketing in Italia? Prezzi 2026 | Prezzi, BOFU | **Published** 2026-11-07 | `quanto-costa-influencer-marketing.it.md` |
| `/it/blog/piattaforme-influencer-marketing-italia` | Piattaforme di influencer marketing in Italia 2026 | Confronto, BOFU | **Published** 2026-11-07 | `piattaforme-influencer-marketing-italia.it.md` |
| `/it/blog/agenzia-o-piattaforma-influencer` | Agenzia di influencer marketing o piattaforma | Scelta, BOFU | **Published** 2026-11-07 | `agenzia-o-piattaforma-influencer.it.md` |
| `/it/blog/trovare-influencer-locali-milano` | Come trovare influencer locali a Milano | Commercial + geo (IT) | **Published** 2026-11-07 | `trovare-influencer-locali-milano.it.md` |
| `/it/blog/ugc-o-influencer` | UGC o influencer | Scelta, BOFU | **Published** 2026-11-07 | `ugc-o-influencer.it.md` |

The FI-only and IT-only guides above are built with `node scripts/build-bofu-guides.js [fi|it]` (OG cards: `node scripts/render-bofu-og.js [fi|it]`). They have no counterpart in the other languages, so they emit no hreflang. When a counterpart ships, add reciprocal hreflang in the page head and in `sitemap.xml`. IT guides keep the Milan waiting-list framing: Promobeez is not live in Italy yet.
