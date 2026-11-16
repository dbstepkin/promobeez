// "Who's already with us" on the home page: live offer counts and a collage of current offers.
// The numbers in the HTML are a fallback; the feed overwrites them when it answers.
//
// Market switching: the visitor's market is IT or FI.
//   1. ?market=it|fi in the URL (for previews)
//   2. IP country, sent back by /api/creators-carousel as `geo`
//   3. page language (<html lang>)
//   4. otherwise Finland (the only live market today)
// For the chosen market we show that market's open-offer count, its offer cards and a
// "open in <country>" caption. The two totals (businesses / offers since August 2026)
// stay global.
//
// Feed shape for per-market data:
//   { markets: { IT: { activeNow: 3, items: [...] }, FI: { activeNow: 20, items: [...] } } }
// If the feed has no `markets` yet, the all-markets total is shown with the neutral
// "offers open to creators right now" wording, never captioned with a country.
(function () {
  var sec = document.querySelector('.offers-wall');
  if (!sec) return;
  var collage = sec.querySelector('.ow-collage');
  var MAX_CARDS = 6;
  var DEFAULT = 'FI';
  // same-origin proxy first (works on preview deploys), then the API itself (local dev)
  var SOURCES = ['/api/creators-carousel', 'https://my.promobeez.com/api/public/for-creators-carousel'];

  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  if (lang !== 'it' && lang !== 'fi') lang = 'en';

  var NAMES = {
    en: { FI: 'Finland', IT: 'Italy' },
    it: { FI: 'Finlandia', IT: 'Italia' },
    fi: { FI: 'Suomessa', IT: 'Italiassa' }
  };
  var LIVE = {
    en: 'offers open in {c} right now',
    it: 'offerte aperte in {c} in questo momento',
    fi: 'tarjousta auki {c} juuri nyt'
  };
  var COLLAGE = {
    en: 'Offers live on Promobeez in {c} now',
    it: 'Offerte attive ora su Promobeez in {c}',
    fi: 'Promobeezissa nyt avoinna olevat tarjoukset: {c}'
  };

  function marketFromUrl() {
    var m = /[?&]market=([a-z]{2})/i.exec(location.search);
    return m ? m[1].toUpperCase() : '';
  }
  function pickMarket(geo) {
    var forced = marketFromUrl();
    if (forced === 'IT' || forced === 'FI') return forced;
    geo = (geo || '').toUpperCase();
    if (geo === 'IT' || geo === 'FI') return geo;
    if (lang === 'it') return 'IT';
    if (lang === 'fi') return 'FI';
    return DEFAULT;
  }

  function setStat(key, value, allowZero) {
    var el = sec.querySelector('[data-ow-stat="' + key + '"]');
    if (el && typeof value === 'number' && (value > 0 || (allowZero && value === 0))) {
      el.textContent = String(value);
    }
  }

  // returns { activeNow, items } for a market, or null if the feed has nothing for it
  function marketData(data, cc) {
    if (data.markets && data.markets[cc]) return data.markets[cc];
    return null;
  }

  function applyLabels(cc) {
    var name = NAMES[lang][cc];
    var live = sec.querySelector('.ow-stat--live span');
    if (live) {
      var dot = live.querySelector('.ow-live');
      live.textContent = LIVE[lang].replace('{c}', name);
      if (dot) live.insertBefore(dot, live.firstChild);
    }
    sec.querySelectorAll('[data-ow-country]').forEach(function (el) { el.textContent = name; });
    if (collage) collage.setAttribute('aria-label', COLLAGE[lang].replace('{c}', name));
  }

  function render(items) {
    if (!collage || !items || items.length < 3) return;
    var frag = document.createDocumentFragment();
    items.slice(0, MAX_CARDS).forEach(function (item, i) {
      var fig = document.createElement('figure');
      fig.className = 'ow-card';
      fig.style.setProperty('--i', i);
      var img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = item.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      var cap = document.createElement('figcaption');
      cap.textContent = item.title;
      fig.appendChild(img);
      fig.appendChild(cap);
      frag.appendChild(fig);
    });
    collage.classList.remove('is-in');
    collage.replaceChildren(frag);
    collage.hidden = false;
    if (!('IntersectionObserver' in window)) return collage.classList.add('is-in');
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      collage.classList.add('is-in');
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(collage);
  }

  function load(n) {
    if (n >= SOURCES.length) return;
    var url = SOURCES[n];
    // same-origin keeps the Vercel preview login cookie, otherwise the relay call bounces to the login page
    fetch(url, { credentials: n === 0 ? 'same-origin' : 'omit' })
      .then(function (res) { if (!res.ok) throw 0; return res.json(); })
      .then(function (data) {
        if (!data || (!data.visible && !data.stats)) throw 0;
        var cc = pickMarket(data.geo);
        var md = marketData(data, cc);
        if (!md) { cc = DEFAULT; md = marketData(data, cc); }
        // no per-market data in the feed: stats.activeNow is the all-markets total, so show it
        // with the neutral wording already in the HTML instead of naming a country
        if (data.stats) {
          // totals stay global
          setStat('brands', data.stats.brandsSince);
          setStat('published', data.stats.publishedSince);
        }
        if (md) {
          setStat('active', md.activeNow, true);
          applyLabels(cc);
          // too few offers in this market: hide the collage instead of showing another country's cards
          if (md.visible !== false && md.items && md.items.length >= 3) render(md.items);
          else if (collage) collage.hidden = true;
        } else {
          setStat('active', data.stats && data.stats.activeNow);
          if (data.visible) render(data.items);
        }
      })
      .catch(function () { load(n + 1); });
  }

  load(0);
})();
