(function () {
  var REGISTER_PATH = '/auth/register';

  function getCtaLocation(link) {
    if (link.classList.contains('nav-cta')) return 'nav';
    if (link.closest('.hero')) return 'hero';
    if (link.closest('.pcard')) {
      var plan = link.closest('.pcard').querySelector('.pname');
      return plan ? 'pricing_' + plan.textContent.trim().toLowerCase() : 'pricing';
    }
    if (link.closest('.cta')) return 'bottom_cta';
    return 'other';
  }

  function isRegisterLink(link) {
    try {
      return new URL(link.href, window.location.origin).pathname === REGISTER_PATH;
    } catch (error) {
      return link.href.indexOf(REGISTER_PATH) !== -1;
    }
  }

  function trackSignUpClick(link) {
    if (typeof gtag === 'function') {
      gtag('event', 'sign_up_click', {
        link_text: link.textContent.trim(),
        link_url: link.href,
        cta_location: getCtaLocation(link),
        page_path: window.location.pathname,
        transport_type: 'beacon'
      });
    }

    if (typeof fbq === 'function') {
      fbq('track', 'StartTrial');
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || !isRegisterLink(link)) return;
    trackSignUpClick(link);
  });
})();
