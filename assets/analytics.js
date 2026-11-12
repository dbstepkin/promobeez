(function () {
  var REGISTER_PATH = '/auth/register';
  // Entry price when CTA is not on a pricing card. Meta requires value > 0.
  var DEFAULT_TRIAL_VALUE = 15;
  var CURRENCY = 'EUR';

  function getCtaLocation(link) {
    if (link.classList.contains('nav-cta')) return 'nav';
    if (link.closest('.hero')) return 'hero';
    if (link.closest('.pcard')) {
      var plan = link.closest('.pcard').querySelector('.pname');
      return plan ? 'pricing_' + plan.textContent.trim().toLowerCase() : 'pricing';
    }
    if (link.closest('.pp-basic')) return 'pricing_basic';
    if (link.closest('.cta')) return 'bottom_cta';
    return 'other';
  }

  function parseEuroAmount(text) {
    if (!text) return null;
    var m = String(text).replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return null;
    var n = parseFloat(m[1].replace(',', '.'));
    return n > 0 ? n : null;
  }

  function getTrialValue(link) {
    var card = link.closest('.pcard');
    if (card) {
      var fromCard = parseEuroAmount((card.querySelector('.pprice') || {}).textContent);
      if (fromCard) return fromCard;
    }
    var basic = link.closest('.pp-basic');
    if (basic) {
      var fromBasic = parseEuroAmount((basic.querySelector('.pp-basic-price') || {}).textContent);
      if (fromBasic) return fromBasic;
    }
    return DEFAULT_TRIAL_VALUE;
  }

  function isRegisterLink(link) {
    try {
      return new URL(link.href, window.location.origin).pathname === REGISTER_PATH;
    } catch (error) {
      return link.href.indexOf(REGISTER_PATH) !== -1;
    }
  }

  function trackSignUpClick(link) {
    var value = getTrialValue(link);
    var params = {
      value: value,
      currency: CURRENCY,
      content_name: getCtaLocation(link),
    };

    if (typeof gtag === 'function') {
      gtag('event', 'sign_up_click', {
        link_text: link.textContent.trim(),
        link_url: link.href,
        cta_location: params.content_name,
        page_path: window.location.pathname,
        value: value,
        currency: CURRENCY,
        transport_type: 'beacon'
      });
    }

    if (window.pbTrackMeta) {
      window.pbTrackMeta('StartTrial', params);
    } else if (typeof fbq === 'function') {
      fbq('track', 'StartTrial', params);
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || !isRegisterLink(link)) return;
    trackSignUpClick(link);
  });
})();
