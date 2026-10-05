(function () {
  // Remembers the language a visitor picks in the language switcher
  // (used by awards?.promobeez.com to route returning visitors).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.lang-switch__menu a[hreflang]');
    if (!a) return;
    var lang = a.getAttribute('hreflang');
    document.cookie = 'pb_lang=' + encodeURIComponent(lang) +
      '; path=/; max-age=31536000; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  });
})();
