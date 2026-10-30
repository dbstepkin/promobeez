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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchJsonLd);
  } else {
    patchJsonLd();
  }
})();
