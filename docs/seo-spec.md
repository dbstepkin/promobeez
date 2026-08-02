# Promobeez Blog — SEO/AEO Audit + Finnish & Italian Localisation Spec

**Prepared for:** Dima Stepkin
**Domain:** `www.promobeez.com`
**Audit date:** 2 August 2026
**Scope:** `/blog`, `/blog/*`, `/about/*`, plus the i18n architecture needed to add `fi` and `it`.

---

## PART 0 — What was actually checked

Everything below marked **[verified]** was confirmed by fetching the live page. Everything marked **[unverified — check]** could not be read through the rendered-HTML fetch (JSON-LD `<script>` blocks, `robots.txt`, `sitemap.xml`, response headers, CWV). Those are listed as *required end state*, not as defects. Run them through Screaming Frog + Google Rich Results Test before you touch anything.

Pages inspected:

| URL | Status |
|---|---|
| `/` | live |
| `/blog` | live, lists **2** articles |
| `/blog/why-audiences-trust-small-creators-more-than-brands` | live, in index |
| `/blog/how-to-choose-a-local-creator` | live, in index |
| `/blog/why-local-creators-beat-famous-influencers` | live, **NOT in index** |
| `/about/andrey-shepelev` | live, lists **2** articles |

---

## PART 1 — Findings

### 1.1 P0 — Orphaned near-duplicate article (fix before anything else)

`/blog/why-local-creators-beat-famous-influencers` is live, indexable, and reachable — the footer of `/blog/why-audiences-trust-small-creators-more-than-brands` links to it as *"Related: local creators vs fame"*. But it appears in neither `/blog` nor the author page. **[verified]**

It also duplicates `/blog/how-to-choose-a-local-creator` at the paragraph level. Verbatim or near-verbatim overlap:

- the "Commercially relevant reach" formula box — identical wording
- the 10-factor selection checklist — identical, all ten items, same order
- "Recommended review sequence" paragraph — identical
- "Do not use engagement rate as the only metric" paragraph — identical
- the Finland/KKV disclosure section — identical bullets
- the 2026 restaurant study (`Tourism and Hospitality` 7(3), 83) paragraph — near-identical
- overlapping FAQ intent ("how many followers", "is a gifted meal advertising in Finland")

Two URLs on the same domain competing for the same intent cluster. Google picks one and suppresses the other; an AI assistant asked "how do I pick a local influencer" sees two conflicting canonical answers from one publisher and trusts the site less. This is the single biggest thing holding the blog back — not markup.

**Decision required from Francesco before implementation.** Two options:

| Option | Action | When to pick it |
|---|---|---|
| **A — Consolidate (recommended)** | 301 `/blog/why-local-creators-beat-famous-influencers` → `/blog/how-to-choose-a-local-creator`. Port the unique Beichert ROI table (revenue per follower / ROIS by tier) and the Goldilocks inverted-U study into the surviving article. Remove the "Related: local creators vs fame" link from article 1. | Default. Merges link equity, kills cannibalisation, produces one stronger page. |
| **B — Differentiate** | Keep both, but strip the duplicated blocks out of the "beat-famous-influencers" page and re-point it at a genuinely different query ("micro vs macro influencer ROI"). Add it to `/blog` and the author page. Rewrite ~40% of it. | Only if you want a separate ROI/economics pillar. More work, more maintenance. |

Do **not** translate this URL into FI or IT until this is resolved. The localisation spec below assumes Option A.

### 1.2 P1 — Author attribution is inconsistent (E-E-A-T leak)

**[verified]**

| Page | `meta-author` | `article:author` | Byline in body | Links to author page |
|---|---|---|---|---|
| `why-audiences-trust-small-creators…` | `Promobeez` | absent | "By Promobeez" | no |
| `how-to-choose-a-local-creator` | `Andrey Shepelev` | present | "By Andrey Shepelev" | yes |
| `why-local-creators-beat-famous…` | `Promobeez` | absent | "By Promobeez" | no |
| `/blog` index | — | — | credits **both** to Andrey Shepelev | no |

The index says Shepelev wrote it; the article says Promobeez wrote it. That contradiction is visible to a crawler. The author page is genuinely good (real name, real prior brands, LinkedIn link) — it's an asset that two of three articles fail to use.

**Fix:** every article gets `meta-author: Andrey Shepelev`, `article:author: https://www.promobeez.com/about/andrey-shepelev`, a linked byline, and a 2–3 sentence author box above the references.

### 1.3 P1 — One image serves three URLs

`local-creators-vs-famous.png` is the `og:image` for `/blog`, `/blog/how-to-choose-a-local-creator`, and `/blog/why-local-creators-beat-famous-influencers`. **[verified]** Shared social cards suppress share CTR and reinforce the duplicate-content signal. One unique OG image per URL, per language.

### 1.4 P1 — Missing robots directives on one article

`/blog/why-local-creators-beat-famous-influencers` has **no** `meta-robots` tag; the other two carry `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`. **[verified]** Without `max-snippet:-1`, Google truncates the snippet, which directly costs you AI Overview and featured-snippet real estate. Apply the same directive site-wide.

### 1.5 P2 — Metadata gaps

**[verified]**

- `/blog` index: no `og:image:width` / `og:image:height` (present on articles).
- Articles 1 and 3: `published_time` / `modified_time` are date-only (`2026-07-30`). Article 2 uses full ISO with offset (`2026-07-30T09:00:00+03:00`). Standardise on full ISO 8601 + `+03:00`.
- Only article 2 shows a visible "Last reviewed" date. Add to all — it's a freshness signal both Google and AI crawlers read.
- Blog nav drops "Pricing" (present on `/`). Minor, but the blog is the top-of-funnel page that most needs a route to pricing.

### 1.6 What is already right — do not break it

Genuinely above average for a pre-launch site. **[verified]**

- Absolute self-referencing canonicals on every page.
- Unique, human-written title + description per URL, all within length limits.
- Complete OG + Twitter card sets.
- Visible breadcrumb trail (`Home / Blog / …`).
- Numbered table of contents with in-page anchors — this is *the* structure AI extractors like.
- Explicit FAQ blocks with question-shaped H-level headings.
- Named references with DOIs and publication dates.
- Explicit counter-evidence sections ("when the small-creator trust premium breaks"). Balanced sources get cited disproportionately by LLMs; keep this pattern in every future article.
- Vendor statistics labelled as vendor statistics. Rare and valuable.
- Descriptive alt text on hero images.
- Contextual internal links to `/for-businesses` inside the body, not just the CTA.

### 1.7 [unverified — check before build]

Confirm each of these yourself; the fetch could not read them.

1. `robots.txt` — exists? Does it reference the sitemap? Does it allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Bingbot`, `CCBot`?
2. `sitemap.xml` — exists? Contains all three article URLs and the author page? Has `<lastmod>`?
3. JSON-LD — is there any `Article`, `FAQPage`, `BreadcrumbList`, `Organization`, `Person` markup? The visible breadcrumbs and FAQ blocks suggest a good structure; confirm the machine-readable layer exists.
4. `<html lang="en">` — set correctly?
5. Image format — are the `.png` heroes served as WebP/AVIF with `width`/`height` attributes and `loading="lazy"` below the fold? PNG hero images at 1200×675 are a LCP risk.
6. Core Web Vitals — LCP/INP/CLS on mobile for `/blog/*`.
7. Does the article `#ref-N` anchor system have matching `id` attributes on the reference list items? The TOC anchors resolve; verify the citation anchors do too.

---

## PART 2 — AEO requirements (2026)

Search for this business is not mostly Google anymore. BrightLocal 2026 — quoted in your own article — puts AI-tool use for local business discovery at 45%, up from 6%, with Google's share down to 71%. The blog's job is to be the source an assistant quotes when a Helsinki café owner asks ChatGPT "how do I find an Instagram creator for my café".

### 2.1 Required structured data

Ship all five types on every article, in a single `<script type="application/ld+json">` with `@graph`.

```
Article (or BlogPosting)
  headline            ≤110 chars, matches H1
  description
  image               absolute URL, 1200×675
  datePublished       ISO 8601 with +03:00
  dateModified        ISO 8601 with +03:00
  author              → Person @id https://www.promobeez.com/about/andrey-shepelev#person
  publisher           → Organization @id https://www.promobeez.com/#organization
  inLanguage          en | fi | it
  mainEntityOfPage    canonical URL
  citation            [] — array of CreativeWork with name, author, datePublished, url/DOI
  about               [] — Thing
  wordCount
  isPartOf            → Blog

Person   @id .../about/andrey-shepelev#person
  name, jobTitle, description, image, url
  sameAs              [LinkedIn URL]
  knowsAbout          ["influencer marketing", "media planning", "local marketing"]
  worksFor            → Organization

Organization @id https://www.promobeez.com/#organization
  name "Promobeez", legalName "Daring Spirit Oy"
  url, logo, foundingLocation Helsinki, areaServed FI
  sameAs              [Instagram, Facebook, LinkedIn]

BreadcrumbList
  Home → Blog → article

FAQPage
  mainEntity[]        Question / acceptedAnswer, verbatim from the visible FAQ block
```

`citation` is the one most sites skip and the one that matters most here. These articles cite *Journal of Marketing*, *JAMS*, Nielsen and Edelman with DOIs. Making that machine-readable is the strongest differentiation signal available to a 6-week-old domain.

On `/blog` (all languages): `Blog` + `ItemList` with `ListItem` → each `BlogPosting`.

### 2.2 Answer-first rewriting

AI extractors lift the first 40–70 words after a heading. Right now several H2s open with context and reach the answer in paragraph two.

**Rule:** every H2 opens with a self-contained answer of 40–70 words that survives being read with no surrounding page. Context, nuance and evidence go after it.

- Weak: *"Local discovery is shifting faster than most neighbourhood businesses update their marketing habits. BrightLocal's Local Consumer Review Survey 2026…"*
- Strong: *"Choose the outcome before the creator. A café chasing Tuesday covers, a salon chasing bookings and a gym chasing trials are three different campaigns even when each trades a service for a reel. Define one primary outcome in one sentence, then score creators against it."*

Apply to all H2s. Keep every existing table — tables are the single most-extracted element type.

### 2.3 `llms.txt`

Add `https://www.promobeez.com/llms.txt` — a markdown map of the site for AI crawlers. Add `/llms-full.txt` with the concatenated article bodies once you have 6+ articles.

```
# Promobeez

> Barter marketplace connecting local businesses with nano and micro creators
> (500+ followers) in Helsinki. Businesses post an offer — a meal, a service —
> creators with local audiences apply. The business pays only to unlock contact
> details. Promobeez takes no commission on the barter itself.

Operated by Daring Spirit Oy, Helsinki, Finland.

## Research
- [Why audiences trust small creators more than brand ads](https://www.promobeez.com/blog/why-audiences-trust-small-creators-more-than-brands): Evidence review — Nielsen, Edelman 2026, persuasion knowledge, peer-reviewed micro-influencer studies.
- [How to choose a local creator](https://www.promobeez.com/blog/how-to-choose-a-local-creator): Playbook — commercially relevant reach, 10-factor checklist, barter sizing, KKV disclosure, measurement.

## Suomeksi
- [Miksi yleisö luottaa pieniin sisällöntuottajiin](https://www.promobeez.com/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin)
- [Miten valita paikallinen sisällöntuottaja](https://www.promobeez.com/fi/blogi/miten-valita-paikallinen-sisallontuottaja)

## Italiano
- [Perché il pubblico si fida dei piccoli creator](https://www.promobeez.com/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator)
- [Come scegliere un creator locale](https://www.promobeez.com/it/blog/come-scegliere-un-creator-locale)

## Product
- [For businesses](https://www.promobeez.com/for-businesses)
- [For creators](https://www.promobeez.com/for-creators)

## Author
- [Andrey Shepelev](https://www.promobeez.com/about/andrey-shepelev): Marketing researcher, 10+ years media planning (Huggies, Dyson, Volkswagen, Jaguar Land Rover).
```

### 2.4 robots.txt

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://www.promobeez.com/sitemap.xml
```

Allowing training crawlers is a deliberate trade: you give up content control in exchange for being the source an assistant repeats. For a brand nobody has heard of, that trade is worth taking. If Francesco disagrees, `Google-Extended` and `CCBot` are the two to disallow first — they cost the least visibility.

### 2.5 RSS

Add `/feed.xml` (and `/fi/feed.xml`, `/it/feed.xml`) with `<link rel="alternate" type="application/rss+xml">` in `<head>`. Cheap, and several AI crawlers use feeds for discovery.

---

## PART 3 — Localisation architecture

### 3.1 URL strategy

**Subdirectories on the existing domain.** English stays at root with no prefix; new languages get a prefix.

```
https://www.promobeez.com/blog/{slug}          → en   (x-default)
https://www.promobeez.com/fi/blogi/{slug-fi}   → fi-FI
https://www.promobeez.com/it/blog/{slug-it}    → it-IT
```

Rejected alternatives:

- `promobeez.fi` / `promobeez.it` — three domains to build authority on separately. Fatal for a domain with no backlinks yet.
- `fi.promobeez.com` — Google treats subdomains as semi-separate; no upside over subdirectories.
- `?lang=fi` — never.

Do **not** move English to `/en/`. That would 301 the only URLs you have that are already crawled, on the eve of pilot launch.

**Localise the slugs.** Slug keywords still carry weight, and a Finnish user seeing `/fi/blogi/how-to-choose-a-local-creator` reads it as a machine-translated page. Path segment too: `blogi` in FI, `blog` in IT.

### 3.2 hreflang

On every page, in `<head>`, all versions listed including self. Absolute URLs. Bidirectional — if the FI page points at the EN page, the EN page must point back or the whole cluster is ignored.

```html
<link rel="alternate" hreflang="en" href="https://www.promobeez.com/blog/how-to-choose-a-local-creator">
<link rel="alternate" hreflang="fi-FI" href="https://www.promobeez.com/fi/blogi/miten-valita-paikallinen-sisallontuottaja">
<link rel="alternate" hreflang="it-IT" href="https://www.promobeez.com/it/blog/come-scegliere-un-creator-locale">
<link rel="alternate" hreflang="x-default" href="https://www.promobeez.com/blog/how-to-choose-a-local-creator">
```

Rules:

1. `hreflang="en"` without a region — English serves everyone, not just Finland.
2. `x-default` → the English URL.
3. Each page's canonical points at **itself**, never at the English original. A cross-language canonical deletes the translated page from the index. This is the single most common way i18n rollouts fail.
4. Mirror the same cluster in `sitemap.xml` using `xhtml:link` (belt and braces — do both, head tags and sitemap).
5. `<html lang="fi">` / `<html lang="it">` on the respective pages.
6. `og:locale` becomes `fi_FI` / `it_IT`, with `og:locale:alternate` listing the others.

### 3.3 Sitemap

One `sitemap.xml`, all languages, `xhtml:link` alternates on every `<url>`:

```xml
<url>
  <loc>https://www.promobeez.com/blog/how-to-choose-a-local-creator</loc>
  <lastmod>2026-08-02T14:00:00+03:00</lastmod>
  <xhtml:link rel="alternate" hreflang="en" href="https://www.promobeez.com/blog/how-to-choose-a-local-creator"/>
  <xhtml:link rel="alternate" hreflang="fi-FI" href="https://www.promobeez.com/fi/blogi/miten-valita-paikallinen-sisallontuottaja"/>
  <xhtml:link rel="alternate" hreflang="it-IT" href="https://www.promobeez.com/it/blog/come-scegliere-un-creator-locale"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.promobeez.com/blog/how-to-choose-a-local-creator"/>
</url>
```

Requires `xmlns:xhtml="http://www.w3.org/1999/xhtml"` on `<urlset>`.

### 3.4 Language switcher

- Visible in header and footer on every page.
- Real `<a href>` elements. Not JS-only, not a `<select>` with an onchange handler — crawlers must follow it.
- Points to the **equivalent page**, never the language homepage. If an article has no translation, hide the option; don't link to `/fi/`.
- Never auto-redirect by IP or `Accept-Language`. Serve the requested URL, show a dismissible banner offering the other language. Auto-redirect breaks crawling and traps Finnish users who want the English page.
- Label in the target language, not the source: `Suomeksi`, `Italiano`, `English`.

### 3.5 Full URL map

| EN | FI | IT |
|---|---|---|
| `/blog` | `/fi/blogi` | `/it/blog` |
| `/blog/why-audiences-trust-small-creators-more-than-brands` | `/fi/blogi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin` | `/it/blog/perche-il-pubblico-si-fida-dei-piccoli-creator` |
| `/blog/how-to-choose-a-local-creator` | `/fi/blogi/miten-valita-paikallinen-sisallontuottaja` | `/it/blog/come-scegliere-un-creator-locale` |
| `/about/andrey-shepelev` | `/fi/tietoa/andrey-shepelev` | `/it/chi-siamo/andrey-shepelev` |
| `/for-businesses` | `/fi/yrityksille` | `/it/per-le-attivita` |
| `/for-creators` | `/fi/sisallontuottajille` | `/it/per-i-creator` |
| `/` | `/fi` | `/it` |

Slugs are ASCII-only: `miksi-yleiso-…` not `miksi-yleisö-…`. Finnish ä/ö in URLs still cause encoding problems in analytics and email clients.

**Phase 1 = blog only.** Do not ship `/fi/blogi/*` while `/for-businesses` has no Finnish version — a Finnish reader clicks the in-body CTA and lands on English. Either translate the two landing pages in the same release, or point the FI/IT article CTAs at the English landing pages and accept the drop. Recommendation: ship the two landing pages with the blog. They are short.

### 3.6 Priority and sequencing

You are targeting a 4–6 month payback window. That means the order matters more than the volume.

**Release 1 (this week)** — English fixes only. No new languages.
Consolidate the duplicate, fix author metadata, ship JSON-LD, robots.txt, sitemap, llms.txt. Fixing the cannibalisation is worth more than either translation.

**Release 2 (week 2–3)** — Finnish.
Two articles + `/fi/yrityksille` + `/fi/sisallontuottajille` + `/fi` home + hreflang cluster + Finnish `/fi/blogi`. Finnish is the actual pilot market. Every Finnish page has a live product behind it.

**Release 3 (week 4–6)** — Italian.
Same set. Note the honest trade-off: there is no Italian product yet. Italian pages will attract Italian readers who cannot use Promobeez, so expect a high bounce rate that Google will read as a quality signal. Two mitigations, pick one:
- (a) Ship Italian with an explicit "Milano waiting list" capture instead of the standard sign-up CTA, so the page has a completable action; or
- (b) Delay Italian until an Italian city is actually on the roadmap.
If the Italian team member is genuinely opening Milan inside 6 months, (a) is fine and the 4–6 month indexing lead time argues for shipping now. If Milan is speculative, (b) saves you from maintaining a third language for nothing.

### 3.7 Post-launch checks

1. GSC — add `fi` and `it` as separate properties? No: one property, but check **Indexing → Pages** for `/fi/` and `/it/` separately, and **International Targeting** for hreflang errors.
2. Bing Webmaster Tools — submit the sitemap. Bing feeds ChatGPT search. Not optional in 2026.
3. Validate hreflang with a crawl (Screaming Frog → Reports → Hreflang) after every release. Return-tag errors are silent.
4. Rich Results Test on one URL per language per template.
5. GA4 — content grouping by language. Add a `page_language` dimension so the FI/IT bounce and conversion data is separable from EN. Without this you will not be able to tell whether Italian is working.
6. Set a checkpoint at **week 12** and **week 20**: if `/it/` has < 50 impressions/month in GSC at week 20, kill it rather than keep translating into it.

---

## PART 4 — Keyword targets

Hypotheses from market knowledge, **not validated volume data**. Run them through Semrush/Ahrefs for `fi` and `it` before finalising H1s and titles — half of these will have near-zero volume and one or two will have more than you expect.

### Finnish

Note the vocabulary split: **`vaikuttajamarkkinointi`** (influencer marketing) is the dominant commercial term and what businesses search. **`sisällöntuottaja`** (content creator) is what creators call themselves. Use `vaikuttaja*` in business-facing titles and metas; use `sisällöntuottaja` in creator-facing copy and in body text where you're describing the person rather than the discipline.

| Target | Page | Intent |
|---|---|---|
| vaikuttajamarkkinointi pienyritykselle | how-to-choose | commercial |
| miten valita vaikuttaja | how-to-choose | informational |
| paikallinen vaikuttaja / paikalliset sisällöntuottajat | how-to-choose | commercial |
| mikrovaikuttaja / nanovaikuttaja | trust article | informational |
| kaupallinen yhteistyö merkintä | disclosure section | informational, high volume |
| mainos merkintä somessa KKV | disclosure section | informational |
| vaikuttajamarkkinointi ravintola / kahvila | how-to-choose | commercial |
| barter-yhteistyö vaikuttaja | how-to-choose | commercial, low volume |
| vaikuttajamarkkinoinnin hinta | future article | commercial |

The KKV disclosure section is the strongest single Finnish opportunity here. `kaupallinen yhteistyö` is a term Finnish creators and business owners search constantly, the regulatory guidance changed in 2025, and you already have a correct, sourced section on it. Consider splitting it into its own Finnish-first article in a later release.

### Italian

| Target | Page | Intent |
|---|---|---|
| micro influencer per piccole imprese | come-scegliere | commercial |
| come scegliere un influencer | come-scegliere | informational |
| nano influencer cosa sono | perche-si-fida | informational |
| influencer marketing locale | both | commercial |
| collaborazione in barter influencer | come-scegliere | commercial |
| influencer per ristoranti | come-scegliere | commercial |
| #adv quando è obbligatorio | disclosure section | informational, high volume |
| Digital Chart IAP influencer | disclosure section | informational |
| micro influencer ROI | ROI content | commercial |

`#adv quando è obbligatorio` and the AGCOM/IAP compliance cluster is the Italian equivalent of the KKV opportunity — high search interest, genuinely confusing regulation, and 2026 is the first year the AGCOM register is actually operating.

---

## PART 5 — Translation delivery notes

Translated files supplied alongside this spec:

```
/fi/blog-index.fi.md
/fi/miksi-yleiso-luottaa-pieniin-sisallontuottajiin.fi.md
/fi/miten-valita-paikallinen-sisallontuottaja.fi.md
/it/blog-index.it.md
/it/perche-il-pubblico-si-fida-dei-piccoli-creator.it.md
/it/come-scegliere-un-creator-locale.it.md
```

Each file carries a YAML front-matter block with the exact `title`, `meta description`, OG/Twitter fields, canonical, hreflang set, and slug to use. Copy those values directly; do not re-derive them.

### 5.1 Where the translation is deliberately not literal

Three categories were adapted rather than translated. Flag these to a human reviewer specifically.

**Regulatory sections.** A machine translation of the Finnish KKV section into Italian would be wrong and potentially harmful — it would tell an Italian creator to follow Finnish rules. The Italian files replace §7/§8 entirely with the Italian framework: IAP Digital Chart (art. 1 *Riconoscibilità*, art. 2 *Endorsement*, art. 4 discount codes/affiliate), AGCOM Linee guida + Codice di condotta (delibera 197/25/CONS, published 5 Aug 2025, first-application deadline 5 Feb 2026), the *elenco degli influencer rilevanti* (≥500k followers or 1M average monthly views, updated 15 April and 15 October), and AGCM as the enforcement body for *pubblicità occulta*. Disclosure labels become `#adv` / `#sponsorizzato` / `#pubblicità`, and for gifting `#prodottofornitoda [Brand]`.
**This section needs a real Italian legal review before publication**, not just a language review. The "not legal advice" disclaimer is carried over and must stay.

**Geography.** Helsinki / Kallio / Capital Region → Milano / Navigli / Città Metropolitana in the Italian files. An Italian-language article using Helsinki districts as its worked example reads as a translation and matches no local query. The Finnish files keep Helsinki and add Kallio, Punavuori, Kamppi.

**Terminology.**
- FI: `creator` → `sisällöntuottaja`; `influencer` → `vaikuttaja`; `influencer marketing` → `vaikuttajamarkkinointi`; `barter` → `vaihtokauppa` / `barter-yhteistyö` (both kept, `barter` is understood); `commercially relevant reach` → `kaupallisesti relevantti tavoittavuus`.
- IT: `creator` stays `creator` (standard in Italian marketing usage — do not translate to `creatore`); `influencer` stays; `barter` → `barter` / `scambio in natura`; `commercially relevant reach` → `reach commercialmente rilevante`.

**Citations, DOIs, author names, journal titles and numeric values are untouched in all languages.** Do not let a reviewer "localise" a DOI or convert a euro figure.

### 5.2 Editorial state

These are machine translations produced without a native reviewer, as requested. Quality is good enough to index and iterate on; it is not good enough to represent the brand indefinitely. Two things to schedule:

1. A native Finnish read-through before the pilot launch — Finnish readers are unusually sensitive to translated-sounding Finnish, and this is your actual market.
2. The Italian regulatory section reviewed by someone who knows AGCOM/IAP, before it is public.

Until then, set `dateModified` honestly and do not add a "reviewed by" credit to pages nobody has reviewed.
