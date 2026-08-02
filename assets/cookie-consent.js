(function () {
  var KEY = 'pb_cookie_consent';
  try {
    if (localStorage.getItem(KEY)) return;
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
    'display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;' +
    'padding:14px 20px;background:#FDF9F3;color:#100D1A;' +
    'border-top:1px solid rgba(16,13,26,.1);' +
    'font-family:"General Sans",system-ui,sans-serif;font-size:14px;line-height:1.45;' +
    'box-shadow:0 -8px 28px rgba(16,13,26,.08)}' +
    '#pb-cookie-consent .pb-cc-text{flex:1;min-width:200px;margin:0}' +
    '#pb-cookie-consent a{color:#100D1A;font-weight:600;text-underline-offset:2px}' +
    '#pb-cookie-consent a:hover{color:#FF5A3C}' +
    '#pb-cookie-consent .pb-cc-ok{flex-shrink:0;appearance:none;border:0;cursor:pointer;' +
    'background:#100D1A;color:#fff;font:inherit;font-weight:600;' +
    'padding:10px 22px;border-radius:999px;transition:background .2s}' +
    '#pb-cookie-consent .pb-cc-ok:hover{background:#FF5A3C}' +
    '#pb-cookie-consent .pb-cc-ok:focus-visible{outline:2px solid #FF5A3C;outline-offset:2px}' +
    '@media(max-width:560px){#pb-cookie-consent{flex-direction:column;align-items:stretch}' +
    '#pb-cookie-consent .pb-cc-ok{width:100%;text-align:center}}' +
    '@media(prefers-reduced-motion:no-preference){' +
    '#pb-cookie-consent{animation:pb-cc-in .28s ease-out}' +
    '@keyframes pb-cc-in{from{transform:translateY(100%);opacity:0}' +
    'to{transform:translateY(0);opacity:1}}}';
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
    bar.remove();
    style.remove();
  });

  bar.appendChild(p);
  bar.appendChild(btn);
  document.body.appendChild(bar);
})();
