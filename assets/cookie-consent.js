(function () {
  var KEY = 'pb_cookie_consent';
  var GA_ID = 'G-ZLZE6QNWP6';

  function assetPath(path) {
    return new URL(path, window.location.origin).toString();
  }

  function loadScript(src, options) {
    var script = document.createElement('script');
    script.src = src;
    script.async = options && options.async !== undefined ? options.async : true;
    if (options && options.defer) script.defer = true;
    document.head.appendChild(script);
  }

  function loadMarketing() {
    if (window.pbMarketingLoaded) return;
    window.pbMarketingLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
    loadScript(assetPath('/assets/facebook-pixel.js'));
    loadScript(assetPath('/assets/attribution.js'), { defer: true });
    loadScript(assetPath('/assets/analytics.js'), { defer: true });
  }

  try {
    if (localStorage.getItem(KEY)) {
      loadMarketing();
      return;
    }
  } catch (e) {
    return;
  }

  var COPY = {
    en: {
      text: 'We use cookies for analytics and marketing.',
      privacy: 'Privacy',
      ok: 'OK'
    },
    fi: {
      text: 'Käytämme evästeitä analytiikkaan ja markkinointiin.',
      privacy: 'Tietosuoja',
      ok: 'OK'
    },
    it: {
      text: 'Utilizziamo cookie per analytics e marketing.',
      privacy: 'Privacy',
      ok: 'OK'
    }
  };

  var lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  var t = COPY[lang] || COPY.en;

  var style = document.createElement('style');
  style.textContent =
    '#pb-cookie-consent{position:fixed;left:0;right:0;bottom:0;z-index:10000;' +
    'display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;' +
    'padding:36px 40px;min-height:140px;background:#FDF9F3;color:#100D1A;' +
    'border-top:4px solid #FF5A3C;' +
    'font-family:"General Sans",system-ui,sans-serif;font-size:20px;line-height:1.4;font-weight:500;' +
    'box-shadow:0 -16px 48px rgba(16,13,26,.22)}' +
    '#pb-cookie-consent .pb-cc-text{flex:1;min-width:240px;margin:0;max-width:52rem}' +
    '#pb-cookie-consent a{color:#100D1A;font-weight:700;text-underline-offset:3px}' +
    '#pb-cookie-consent a:hover{color:#FF5A3C}' +
    '#pb-cookie-consent .pb-cc-ok{flex-shrink:0;appearance:none;border:0;cursor:pointer;' +
    'background:#FF5A3C;color:#fff;font:inherit;font-size:22px;font-weight:700;' +
    'padding:18px 48px;min-width:160px;border-radius:999px;transition:background .2s,transform .15s}' +
    '#pb-cookie-consent .pb-cc-ok:hover{background:#100D1A;transform:scale(1.03)}' +
    '#pb-cookie-consent .pb-cc-ok:focus-visible{outline:3px solid #100D1A;outline-offset:3px}' +
    '@media(max-width:720px){#pb-cookie-consent{flex-direction:column;align-items:stretch;' +
    'gap:20px;padding:28px 22px 32px;min-height:180px;font-size:18px}' +
    '#pb-cookie-consent .pb-cc-ok{width:100%;text-align:center;font-size:20px;padding:20px 28px}}' +
    '@media(prefers-reduced-motion:no-preference){' +
    '#pb-cookie-consent{animation:pb-cc-in .32s ease-out}' +
    '@keyframes pb-cc-in{from{transform:translateY(100%);opacity:0}' +
    'to{transform:translateY(0);opacity:1}}}' +
    'html.pb-cc-open body{padding-bottom:var(--pb-cc-h,160px)}';
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'pb-cookie-consent';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', t.text);

  var p = document.createElement('p');
  p.className = 'pb-cc-text';
  p.appendChild(document.createTextNode(t.text + ' '));
  var link = document.createElement('a');
  link.href = '/privacy';
  link.textContent = t.privacy;
  p.appendChild(link);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pb-cc-ok';
  btn.textContent = t.ok;
  btn.addEventListener('click', function () {
    try {
      localStorage.setItem(KEY, '1');
    } catch (e) {}
    loadMarketing();
    bar.remove();
    style.remove();
    document.documentElement.classList.remove('pb-cc-open');
    document.documentElement.style.removeProperty('--pb-cc-h');
  });

  bar.appendChild(p);
  bar.appendChild(btn);
  document.body.appendChild(bar);

  // the bar is fixed, so hold open an equal amount of space under the footer
  var root = document.documentElement;
  function reserve() {
    root.style.setProperty('--pb-cc-h', bar.offsetHeight + 'px');
  }
  root.classList.add('pb-cc-open');
  reserve();
  if (window.ResizeObserver) new ResizeObserver(reserve).observe(bar);
  else addEventListener('resize', reserve, { passive: true });
})();
