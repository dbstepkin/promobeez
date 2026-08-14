(function () {
  // Complimentary Growth plan for new businesses (14-day trial banners + copy).
  // Flip to true to show it everywhere this script is loaded.
  var GROWTH_TRIAL = false;

  window.PB_FLAGS = { GROWTH_TRIAL: GROWTH_TRIAL };

  if (GROWTH_TRIAL) {
    document.documentElement.classList.add('pb-growth-trial');
  }

  var style = document.createElement('style');
  style.setAttribute('data-pb-flags', '');
  style.textContent =
    'html:not(.pb-growth-trial) [data-growth-trial]{display:none!important}' +
    'html.pb-growth-trial [data-growth-trial-off]{display:none!important}';
  (document.head || document.documentElement).appendChild(style);

  function patchJsonLd() {
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
