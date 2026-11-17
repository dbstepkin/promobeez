(function () {
  // Complimentary Growth plan for new businesses (14-day trial banners + copy).
  // Flip to true to show it everywhere this script is loaded.
  var GROWTH_TRIAL = false;
  // Basic + application packs pricing. Flip together with the app's
  // system param offer_packs_enabled.
  var PACKS = true;

  window.PB_FLAGS = { GROWTH_TRIAL: GROWTH_TRIAL, PACKS: PACKS };

  if (GROWTH_TRIAL) {
    document.documentElement.classList.add('pb-growth-trial');
  }
  if (PACKS) {
    document.documentElement.classList.add('pb-packs');
  }

  var style = document.createElement('style');
  style.setAttribute('data-pb-flags', '');
  style.textContent =
    'html:not(.pb-growth-trial) [data-growth-trial]{display:none!important}' +
    'html.pb-growth-trial [data-growth-trial-off]{display:none!important}' +
    'html:not(.pb-packs) [data-packs]{display:none!important}' +
    'html.pb-packs [data-packs-off]{display:none!important}';
  (document.head || document.documentElement).appendChild(style);

  function patchJsonLd() {
    if (PACKS) {
      document.querySelectorAll('script[type="application/ld+json"][data-packs-from]').forEach(function (el) {
        var from = el.getAttribute('data-packs-from');
        var to = el.getAttribute('data-packs-to');
        if (!from || !to || !el.textContent) return;
        el.textContent = el.textContent.split(from).join(to);
      });
    }
    if (!GROWTH_TRIAL) return;
    document.querySelectorAll('script[type="application/ld+json"][data-growth-trial-from]').forEach(function (el) {
      var from = el.getAttribute('data-growth-trial-from');
      var to = el.getAttribute('data-growth-trial-to');
      if (!from || !to || !el.textContent) return;
      el.textContent = el.textContent.split(from).join(to);
    });
  }

  // Creator minimum: 500 followers in Finland, 1,000 in Italy. Italian pages say
  // 1.000 in their markup; on EN/FI pages a visitor from Italy (country cookie
  // pb_cc, set by middleware.js) sees 1,000 wherever [data-min-f] marks the number.
  function minFollowers() {
    var m = document.cookie.match(/(?:^|;\s*)pb_cc=([A-Z]{2})/);
    if (!m || m[1] !== 'IT') return;
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var sep = lang === 'fi' ? ' ' : lang === 'it' ? '.' : ',';
    document.querySelectorAll('[data-min-f]').forEach(function (el) { el.textContent = '1' + sep + '000'; });
    document.querySelectorAll('[data-min-f-big]').forEach(function (el) { el.textContent = '1' + sep + '240'; });
    document.querySelectorAll('[data-min-f-count]').forEach(function (el) { el.setAttribute('data-count', '1000'); });
  }

  function onReady() {
    patchJsonLd();
    minFollowers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
