// "Who's already with us" on the home page: live offer counts and a collage of current offers.
// The numbers in the HTML are a fallback; the feed overwrites them when it answers.
(function () {
  var sec = document.querySelector('.offers-wall');
  if (!sec) return;
  var collage = sec.querySelector('.ow-collage');
  var MAX_CARDS = 6;
  // same-origin proxy first (works on preview deploys), then the API itself (local dev)
  var SOURCES = ['/api/creators-carousel', 'https://my.promobeez.com/api/public/for-creators-carousel'];

  function setStat(key, value) {
    var el = sec.querySelector('[data-ow-stat="' + key + '"]');
    if (el && typeof value === 'number' && value > 0) el.textContent = String(value);
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
        if (data.stats) {
          setStat('brands', data.stats.brandsSince);
          setStat('published', data.stats.publishedSince);
          setStat('active', data.stats.activeNow);
        }
        if (data.visible) render(data.items);
      })
      .catch(function () { load(n + 1); });
  }

  load(0);
})();
