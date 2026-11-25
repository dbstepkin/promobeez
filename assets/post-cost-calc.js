/* "What will one post cost?" for Pay when they post (D-001e).
   Opens from any [data-mp-calc] button in a <dialog>. Mirrors the app's ResultCostCalculator:
   presets, log sliders, stacked bar with the cap line, receipt. Example rates = default matrix
   rpm-2026-11-24-default; real rates are per business and shown in the account. */
(function () {
  var R = { base: 500, save: 50, share: 25, k: 300, cap: 5000 }; // cents
  var MAX = { views: 200000, saves: 1000, shares: 1000 };
  var PRESETS = [
    ['quiet', 300, 0, 0], ['typical', 1000, 2, 1], ['good', 8000, 15, 6], ['viral', 120000, 400, 600]
  ];
  var I18N = {
    en: { title: 'What will one post cost?', quiet: 'Quiet post', typical: 'Typical post', good: 'Good post', viral: 'Viral post',
      views: 'Views', saves: 'Saves', shares: 'Shares', per1k: '{r} per 1,000', each: '{r} each', fee: 'Collab fee',
      once: 'once per creator', paid: 'already paid this week', first: 'First post of this collab',
      firstHint: "More posts by the same creator within 7 days don't pay the collab fee again.",
      free: "Stories and Threads posts are not counted. You don't pay for them.", forPost: 'for this post',
      capHit: 'Cap reached: you save {a}', left: '{a} left until the cap', cap: 'Cap {a}', above: 'Above the cap, not charged',
      pay: 'You pay', viewsCalc: '{v} ÷ 1,000 × {r}', close: 'Close',
      note: 'Example rates. Your own rates are shown in your account before you choose this model. Your card is charged only after a post is measured.',
      sep: ',' },
    fi: { title: 'Mitä yksi julkaisu maksaa?', quiet: 'Hiljainen julkaisu', typical: 'Tavallinen julkaisu', good: 'Hyvä julkaisu', viral: 'Viraali julkaisu',
      views: 'Katselut', saves: 'Tallennukset', shares: 'Jaot', per1k: '{r} / 1 000', each: '{r} / kpl', fee: 'Yhteistyömaksu',
      once: 'kerran sisällöntuottajaa kohden', paid: 'maksettu jo tällä viikolla', first: 'Yhteistyön ensimmäinen julkaisu',
      firstHint: 'Saman sisällöntuottajan muista julkaisuista 7 päivän sisällä ei makseta yhteistyömaksua uudelleen.',
      free: 'Tarinoita ja Threads-julkaisuja ei lasketa. Et maksa niistä.', forPost: 'tästä julkaisusta',
      capHit: 'Katto täynnä: säästät {a}', left: '{a} jäljellä kattoon', cap: 'Katto {a}', above: 'Katon ylittävä osa, ei veloiteta',
      pay: 'Maksat', viewsCalc: '{v} ÷ 1 000 × {r}', close: 'Sulje',
      note: 'Esimerkkihinnat. Omat hintasi näet tililläsi ennen kuin valitset tämän mallin. Korttia veloitetaan vasta, kun julkaisu on mitattu.',
      sep: ' ' },
    it: { title: 'Quanto costa un post?', quiet: 'Post tranquillo', typical: 'Post tipico', good: 'Buon post', viral: 'Post virale',
      views: 'Visualizzazioni', saves: 'Salvataggi', shares: 'Condivisioni', per1k: '{r} ogni 1.000', each: '{r} ciascuno', fee: 'Costo collab',
      once: 'una volta per creator', paid: 'già pagato questa settimana', first: 'Primo post di questa collab',
      firstHint: 'Altri post dello stesso creator entro 7 giorni non pagano di nuovo il costo collab.',
      free: 'Storie e post su Threads non contano. Non li pagate.', forPost: 'per questo post',
      capHit: 'Tetto raggiunto: risparmiate {a}', left: '{a} al tetto', cap: 'Tetto {a}', above: 'Sopra il tetto, non addebitato',
      pay: 'Pagate', viewsCalc: '{v} ÷ 1.000 × {r}', close: 'Chiudi',
      note: 'Tariffe di esempio. Le vostre tariffe sono nel vostro account prima di scegliere questo modello. La carta viene addebitata solo dopo che il post è stato misurato.',
      sep: '.' }
  };
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var t = I18N[lang] || I18N.en;
  var f = function (s, o) { return s.replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); };
  var eur = function (c) { var v = Math.round(c) / 100; var s = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2); return lang === 'fi' ? s.replace('.', ',') + ' €' : '€' + (lang === 'it' ? s.replace('.', ',') : s); };
  var num = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, t.sep); };
  var toV = function (k, p) { return Math.round(Math.pow(10, (p / 1000) * Math.log10(MAX[k] + 1)) - 1); };
  var toP = function (k, v) { return Math.round(Math.log10(Math.min(v, MAX[k]) + 1) / Math.log10(MAX[k] + 1) * 1000); };

  var ICO = {
    views: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    saves: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    shares: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>'
  };
  var ico = function (k, c) { return '<svg class="mpc-ico" viewBox="0 0 24 24" style="stroke:' + c + '" aria-hidden="true">' + ICO[k] + '</svg>'; };
  var dlg, st = { views: 1000, saves: 2, shares: 1, first: true };

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'mpc';
    dlg.setAttribute('aria-labelledby', 'mpc-h');
    var sl = function (k, c, hint) {
      return '<div class="mpc-sl">' + ico(k, c) +
        '<label for="mpc-' + k + '">' + t[k] + '<small>' + hint + '</small></label>' +
        '<input class="mpc-n" type="number" min="0" data-k="' + k + '" aria-label="' + t[k] + '">' +
        '<input class="mpc-r" id="mpc-' + k + '" type="range" min="0" max="1000" data-k="' + k + '"></div>';
    };
    dlg.innerHTML =
      '<div class="mpc-in"><button type="button" class="mpc-x" aria-label="' + t.close + '">×</button>' +
      '<h3 id="mpc-h">' + t.title + '</h3>' +
      '<div class="mpc-grid"><div>' +
      '<div class="mpc-pre">' + PRESETS.map(function (p) { return '<button type="button" data-p="' + p[0] + '">' + t[p[0]] + '</button>'; }).join('') + '</div>' +
      sl('views', '#FF8A3D', f(t.per1k, { r: eur(R.k) })) + sl('saves', '#7C3AED', f(t.each, { r: eur(R.save) })) + sl('shares', '#06b6d4', f(t.each, { r: eur(R.share) })) +
      '<p class="mpc-free">' + t.free + '</p>' +
      '</div><div aria-live="polite">' +
      '<p class="mpc-total"><b></b> <span>' + t.forPost + '</span></p><span class="mpc-badge"></span>' +
      '<div class="mpc-bar"><div class="mpc-track"></div><div class="mpc-over"></div><div class="mpc-cap"><span>' + f(t.cap, { a: eur(R.cap) }) + '</span></div></div>' +
      '<div class="mpc-rc"></div>' +
      '</div></div><p class="mpc-note">' + t.note + '</p></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.mpc-x').onclick = function () { dlg.close(); };
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('[data-p]').forEach(function (b) {
      b.onclick = function () { var p = PRESETS.filter(function (x) { return x[0] === b.dataset.p; })[0]; st.views = p[1]; st.saves = p[2]; st.shares = p[3]; render(); };
    });
    dlg.querySelectorAll('.mpc-r').forEach(function (r) { r.oninput = function () { st[r.dataset.k] = toV(r.dataset.k, +r.value); render(); }; });
    dlg.querySelectorAll('.mpc-n').forEach(function (n) { n.oninput = function () { var v = parseInt(n.value, 10); st[n.dataset.k] = isFinite(v) ? Math.max(0, v) : 0; render(true); }; });
  }

  function render(fromNum) {
    var parts = { base: st.first ? R.base : 0, saves: st.saves * R.save, shares: st.shares * R.share, views: Math.round(Math.floor(st.views) / 1000 * R.k) };
    var raw = parts.base + parts.saves + parts.shares + parts.views, cut = Math.max(0, raw - R.cap), amt = Math.min(raw, R.cap);
    var scale = R.cap / 0.62, pct = function (c) { return Math.min(c / scale * 100, 100); };
    ['views', 'saves', 'shares'].forEach(function (k) {
      dlg.querySelector('.mpc-r[data-k="' + k + '"]').value = toP(k, st[k]);
      if (!fromNum) dlg.querySelector('.mpc-n[data-k="' + k + '"]').value = st[k];
    });
    dlg.querySelectorAll('[data-p]').forEach(function (b) {
      var p = PRESETS.filter(function (x) { return x[0] === b.dataset.p; })[0];
      b.setAttribute('aria-pressed', p[1] === st.views && p[2] === st.saves && p[3] === st.shares);
    });
    dlg.querySelector('.mpc-total b').textContent = eur(amt);
    var badge = dlg.querySelector('.mpc-badge');
    badge.className = 'mpc-badge' + (cut > 0 ? ' ok' : '');
    badge.textContent = cut > 0 ? f(t.capHit, { a: eur(cut) }) : f(t.left, { a: eur(R.cap - amt) });
    var segs = [['base', '#FF5A3C'], ['saves', '#7C3AED'], ['shares', '#06b6d4'], ['views', '#FF8A3D']], left = 0, html = '';
    segs.forEach(function (s) {
      var v = parts[s[0]], paid = Math.max(0, Math.min(v, R.cap - left));
      if (paid > 0) html += '<i style="left:' + pct(left) + '%;width:' + pct(paid) + '%;background:' + s[1] + '"></i>';
      left += v;
    });
    dlg.querySelector('.mpc-track').innerHTML = html;
    var over = dlg.querySelector('.mpc-over');
    over.style.display = cut > 0 ? 'block' : 'none';
    over.style.left = pct(R.cap) + '%'; over.style.width = Math.max(pct(raw) - pct(R.cap), 2) + '%';
    dlg.querySelector('.mpc-cap').style.left = pct(R.cap) + '%';
    var row = function (c, l, d, v, k) { return '<div>' + (k ? ico(k, c) : '<span class="mpc-sw" style="background:' + c + '"></span>') + '<span>' + l + ' <em>' + d + '</em></span><span>' + v + '</span></div>'; };
    dlg.querySelector('.mpc-rc').innerHTML =
      row('#FF5A3C', t.fee, t.once, eur(parts.base)) +
      row('#7C3AED', t.saves, num(st.saves) + ' × ' + eur(R.save), eur(parts.saves), 'saves') +
      row('#06b6d4', t.shares, num(st.shares) + ' × ' + eur(R.share), eur(parts.shares), 'shares') +
      row('#FF8A3D', t.views, f(t.viewsCalc, { v: num(st.views), r: eur(R.k) }), eur(parts.views), 'views') +
      (cut > 0 ? '<div class="ok"><span></span><span>' + t.above + '</span><span>−' + eur(cut) + '</span></div>' : '') +
      '<div class="tot"><span></span><span>' + t.pay + '</span><span>' + eur(amt) + '</span></div>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-mp-calc]');
    if (!b) return;
    if (!dlg) build();
    render();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
})();
