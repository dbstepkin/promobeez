(function () {
  // Italian pages only: Promobeez is not live in Italy yet. A slim bar on top of every /it page
  // says that we open in Milan soon and that signing up now already gives social media analytics.
  var KEY = 'pb_it_launch_bar_closed';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var css =
    '.it-launch{position:fixed;top:0;left:0;right:0;z-index:1200;display:flex;align-items:center;justify-content:center;gap:14px;' +
    'min-height:40px;padding:8px 48px 8px 16px;background:#100D1A;color:#fff;font:500 14px/1.35 inherit;font-family:inherit;text-align:center}' +
    '.it-launch b{color:#FFC93C;font-weight:700}' +
    '.it-launch a.it-launch__cta{flex-shrink:0;color:#100D1A;background:#FFC93C;text-decoration:none;font-weight:700;padding:5px 14px;border-radius:100px;white-space:nowrap}' +
    '.it-launch a.it-launch__cta:hover{opacity:.9}' +
    '.it-launch__x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;color:#fff;opacity:.6;font-size:20px;line-height:1;cursor:pointer;padding:6px}' +
    '.it-launch__x:hover{opacity:1}' +
    '.it-launch__short{display:none}' +
    '@media(max-width:760px){.it-launch{font-size:13px;gap:10px;padding-right:40px}.it-launch__long{display:none}.it-launch__short{display:inline}}';

  var bar = document.createElement('div');
  bar.className = 'it-launch';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Lancio a Milano');
  // The instant social media analysis is a creator feature only: businesses get the waitlist message.
  var path = location.pathname;
  var audience = /per-i-creator|collaborazioni-creator/.test(path) ? 'creator'
    : /per-le-attivita|influencer-marketing-per-|pilota-ristoranti/.test(path) ? 'business' : 'both';
  var COPY = {
    creator: {
      long: '🚀 <b>Apriamo presto a Milano.</b> Tante attività sono già in lista d\'attesa. Intanto iscriviti: ricevi subito l\'analisi del tuo profilo e scopri come vai rispetto agli altri creator.',
      short: '🚀 <b>Presto a Milano.</b> Iscriviti e ricevi l\'analisi del tuo profilo.',
      cta: 'Iscriviti gratis →', href: 'https://my.promobeez.com/auth/register?role=creator'
    },
    business: {
      long: '🚀 <b>Apriamo presto a Milano.</b> Tante attività sono già in lista d\'attesa per il lancio. Entrate anche voi: l\'iscrizione è gratuita.',
      short: '🚀 <b>Presto a Milano.</b> Entrate in lista d\'attesa.',
      cta: 'Entrate in lista →', href: 'https://my.promobeez.com/auth/register?role=brand'
    },
    both: {
      long: '🚀 <b>Apriamo presto a Milano.</b> Tante attività sono già in lista d\'attesa. Sei un creator? Iscriviti ora e ricevi subito l\'analisi del tuo profilo.',
      short: '🚀 <b>Presto a Milano.</b> Entra in lista d\'attesa.',
      cta: 'Iscriviti gratis →', href: 'https://my.promobeez.com/auth/register'
    }
  }[audience];
  bar.innerHTML =
    '<span><span class="it-launch__long">' + COPY.long + '</span>' +
    '<span class="it-launch__short">' + COPY.short + '</span></span>' +
    '<a class="it-launch__cta" href="' + COPY.href + '">' + COPY.cta + '</a>' +
    '<button class="it-launch__x" type="button" aria-label="Chiudi">×</button>';

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertBefore(bar, document.body.firstChild);
    var nav = document.getElementById('nav') || document.querySelector('nav');
    var navTop = nav ? getComputedStyle(nav).position === 'fixed' : false;
    var basePad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    function place() {
      var h = bar.offsetHeight;
      document.body.style.paddingTop = (basePad + h) + 'px';
      if (navTop) nav.style.top = h + 'px';
    }
    place();
    addEventListener('resize', place, { passive: true });
    bar.querySelector('.it-launch__x').addEventListener('click', function () {
      bar.remove();
      document.body.style.paddingTop = basePad ? basePad + 'px' : '';
      if (navTop) nav.style.top = '';
      removeEventListener('resize', place);
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
