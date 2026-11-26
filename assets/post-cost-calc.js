/* "What will one post cost?" for Pay for collabs (D-001e).
   Opens from any [data-mp-calc] button in a <dialog>. Mirrors the app's ResultCostCalculator:
   presets, log sliders, stacked bar with the cap line, receipt. Rates come from /api/ppr-price
   (the default matrix in the database, D-001g); the numbers below are only the fallback. */
(function () {
  var FIXED = 2500; // cents per collab, fixed-price option
  var R = { base: 500, save: 50, share: 25, k: 300, cap: 5000 }; // cents
  var MAX = { views: 200, saves: 1000, shares: 1000 }; // views in thousands
  var PRESETS = [
    ['quiet', 1, 0, 0], ['typical', 2, 2, 1], ['good', 8, 15, 6], ['viral', 120, 400, 600]
  ];
  var I18N = {
    en: { title: 'What will one post cost?', mFixed: 'Fixed price', mFixedS: '{a} per collab', mPerf: 'By performance', mPerfS: 'fee + saves, shares, views', perCollab: 'per collab',
      fixedL: ['Same price whether the post gets 300 views or 300,000', 'All posts by the creator within 7 days count as one collab', 'Charged only after the post is found'],
      quiet: 'Quiet post', typical: 'Typical post', good: 'Good post', viral: 'Viral post',
      views: 'Views', viewsK: 'Views, thousands', saves: 'Saves', shares: 'Shares', per1k: '{r} per 1,000', each: '{r} each', fee: 'Collab fee',
      once: 'once per collab', paid: 'already paid this week', first: 'First post of this collab',
      firstHint: "More posts by the same creator within 7 days don't pay the collab fee again.",
      sum: 'Views, saves and shares add up across every network where the video is posted.',
      free: 'Stories and Threads posts: no fees for views, saves or shares, only the {a} collab fee.', forPost: 'for this post',
      capHit: 'Cap reached: you save {a}', left: '{a} left until the cap', cap: 'Cap {a}', above: 'Above the cap, not charged',
      pay: 'You pay', viewsCalc: '{v}K × {r}', close: 'Close',
      note: 'Your card is charged only after a post is measured, 5 days after it is published.',
      nth1: '1st collab', nth1S: 'full price', nth2: '2nd and every next', nth2S: '−50%', disc: '2nd+ collab −50%', was: 'first collab {a}',
      sep: ',' },
    fi: { title: 'Mitä yksi julkaisu maksaa?', mFixed: 'Kiinteä hinta', mFixedS: '{a} / yhteistyö', mPerf: 'Tulosten mukaan', mPerfS: 'maksu + tallennukset, jaot, katselut', perCollab: 'yhteistyöstä',
      fixedL: ['Sama hinta, sai julkaisu 300 tai 300 000 katselua', 'Tuottajan kaikki julkaisut 7 päivän sisällä ovat yksi yhteistyö', 'Veloitetaan vasta, kun julkaisu on löytynyt'],
      quiet: 'Hiljainen julkaisu', typical: 'Tavallinen julkaisu', good: 'Hyvä julkaisu', viral: 'Viraali julkaisu',
      views: 'Katselut', viewsK: 'Katselut, tuhansina', saves: 'Tallennukset', shares: 'Jaot', per1k: '{r} / 1 000', each: '{r} / kpl', fee: 'Yhteistyömaksu',
      once: 'kerran yhteistyötä kohden', paid: 'maksettu jo tällä viikolla', first: 'Yhteistyön ensimmäinen julkaisu',
      firstHint: 'Saman sisällöntuottajan muista julkaisuista 7 päivän sisällä ei makseta yhteistyömaksua uudelleen.',
      sum: 'Katselut, tallennukset ja jaot lasketaan yhteen kaikista somekanavista, joissa video julkaistiin.',
      free: 'Tarinat ja Threads-julkaisut: ei maksua katseluista, tallennuksista tai jaoista, vain {a} yhteistyömaksu.', forPost: 'tästä julkaisusta',
      capHit: 'Katto täynnä: säästät {a}', left: '{a} jäljellä kattoon', cap: 'Katto {a}', above: 'Katon ylittävä osa, ei veloiteta',
      pay: 'Maksat', viewsCalc: '{v} t. × {r}', close: 'Sulje',
      note: 'Korttia veloitetaan vasta, kun julkaisu on mitattu, 5 päivää julkaisun jälkeen.',
      nth1: '1. yhteistyö', nth1S: 'täysi hinta', nth2: '2. ja jokainen seuraava', nth2S: '−50 %', disc: '2.+ yhteistyö −50 %', was: 'ensimmäinen yhteistyö {a}',
      sep: ' ' },
    it: { title: 'Quanto costa un post?', mFixed: 'Prezzo fisso', mFixedS: '{a} per collab', mPerf: 'In base ai risultati', mPerfS: 'quota + salvataggi, condivisioni, visualizzazioni', perCollab: 'per collab',
      fixedL: ['Stesso prezzo che il post faccia 300 o 300.000 visualizzazioni', 'Tutti i post del creator entro 7 giorni sono una sola collab', 'Addebitato solo dopo che il post è stato trovato'],
      quiet: 'Post tranquillo', typical: 'Post tipico', good: 'Buon post', viral: 'Post virale',
      views: 'Visualizzazioni', viewsK: 'Visualizzazioni, migliaia', saves: 'Salvataggi', shares: 'Condivisioni', per1k: '{r} ogni 1.000', each: '{r} ciascuno', fee: 'Costo collab',
      once: 'una volta per collab', paid: 'già pagato questa settimana', first: 'Primo post di questa collab',
      firstHint: 'Altri post dello stesso creator entro 7 giorni non pagano di nuovo il costo collab.',
      sum: 'Visualizzazioni, salvataggi e condivisioni si sommano su tutti i social in cui è uscito il video.',
      free: 'Storie e post su Threads: niente costi per visualizzazioni, salvataggi o condivisioni, solo il costo collab di {a}.', forPost: 'per questo post',
      capHit: 'Tetto raggiunto: risparmiate {a}', left: '{a} al tetto', cap: 'Tetto {a}', above: 'Sopra il tetto, non addebitato',
      pay: 'Pagate', viewsCalc: '{v}K × {r}', close: 'Chiudi',
      note: 'La carta viene addebitata solo dopo che il post è stato misurato, 5 giorni dopo la pubblicazione.',
      nth1: '1ª collab', nth1S: 'prezzo pieno', nth2: '2ª e successive', nth2S: '−50%', disc: '2ª+ collab −50%', was: 'prima collab {a}',
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
  var loaded = fetch('/api/ppr-price', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var p = d && d.params; if (!p) return;
      var n = function (v, fb) { v = Number(v); return isFinite(v) && v >= 0 ? v : fb; };
      R = { base: n(p.base_per_collab, R.base), save: n(p.per_save, R.save), share: n(p.per_share, R.share), k: n(p.per_1k_views, R.k), cap: n(p.cap_per_post, R.cap) || R.cap };
      FIXED = n(p.fixed_per_collab, FIXED);
      // the card tooltip names the fixed price; keep it in step with the database
      document.querySelectorAll('.mp-opt .pp-term[data-tip]').forEach(function (el) {
        el.setAttribute('data-tip', el.getAttribute('data-tip').replace(/€\s?12[.,]50|12,50 €/g, eur(FIXED / 2)).replace(/€\s?25(?![\d.,])|25 €/g, eur(FIXED)));
      });
    })
    .catch(function () {});
  var dlg, st = { mode: 'fixed', nth: 1, views: 2, saves: 2, shares: 1, first: true };

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'mpc';
    dlg.setAttribute('aria-labelledby', 'mpc-h');
    var sl = function (k, c, hint) {
      return '<div class="mpc-sl">' + ico(k, c) +
        '<label for="mpc-' + k + '">' + (k === 'views' ? t.viewsK : t[k]) + '<small>' + hint + '</small></label>' +
        '<input class="mpc-n" type="number" min="0" data-k="' + k + '" aria-label="' + t[k] + '">' +
        '<input class="mpc-r" id="mpc-' + k + '" type="range" min="0" max="1000" data-k="' + k + '"></div>';
    };
    dlg.innerHTML =
      '<div class="mpc-in"><button type="button" class="mpc-x" aria-label="' + t.close + '">×</button>' +
      '<h3 id="mpc-h">' + t.title + '</h3>' +
      '<div class="mpc-mode" role="tablist">' +
      '<button type="button" role="tab" data-m="fixed"><b>' + t.mFixed + '</b><small>' + f(t.mFixedS, { a: eur(FIXED) }) + '</small></button>' +
      '<button type="button" role="tab" data-m="perf"><b>' + t.mPerf + '</b><small>' + t.mPerfS + '</small></button></div>' +
      // D-001j: the first collab on an offer is full price, every next one is 50% off
      '<div class="mpc-mode mpc-nth" role="tablist">' +
      '<button type="button" role="tab" data-n="1"><b>' + t.nth1 + '</b><small>' + t.nth1S + '</small></button>' +
      '<button type="button" role="tab" data-n="2"><b>' + t.nth2 + '</b><small>' + t.nth2S + '</small></button></div>' +
      '<div class="mpc-fixed"><p class="mpc-total"><b></b> <span>' + t.perCollab + '</span></p><span class="mpc-was"></span>' +
      '<ul class="mpc-fl">' + t.fixedL.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="mpc-grid"><div>' +
      '<div class="mpc-pre">' + PRESETS.map(function (p) { return '<button type="button" data-p="' + p[0] + '">' + t[p[0]] + '</button>'; }).join('') + '</div>' +
      sl('views', '#FF8A3D', f(t.per1k, { r: eur(R.k) })) + sl('saves', '#7C3AED', f(t.each, { r: eur(R.save) })) + sl('shares', '#06b6d4', f(t.each, { r: eur(R.share) })) +
      '<p class="mpc-sum">' + t.sum + '</p>' +
      '<p class="mpc-free">' + f(t.free, { a: eur(R.base) }) + '</p>' +
      '</div><div aria-live="polite">' +
      '<p class="mpc-total"><b></b> <span>' + t.forPost + '</span></p><span class="mpc-badge"></span>' +
      '<div class="mpc-bar"><div class="mpc-track"></div><div class="mpc-over"></div><div class="mpc-cap"><span>' + f(t.cap, { a: eur(R.cap) }) + '</span></div></div>' +
      '<div class="mpc-rc"></div>' +
      '</div></div><p class="mpc-note">' + t.note + '</p></div>';
    document.body.appendChild(dlg);
    dlg.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { st.mode = b.dataset.m; render(); }; });
    dlg.querySelectorAll('[data-n]').forEach(function (b) { b.onclick = function () { st.nth = +b.dataset.n; render(); }; });
    dlg.querySelector('.mpc-x').onclick = function () { dlg.close(); };
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('[data-p]').forEach(function (b) {
      b.onclick = function () { var p = PRESETS.filter(function (x) { return x[0] === b.dataset.p; })[0]; st.views = p[1]; st.saves = p[2]; st.shares = p[3]; render(); };
    });
    dlg.querySelectorAll('.mpc-r').forEach(function (r) { r.oninput = function () { st[r.dataset.k] = toV(r.dataset.k, +r.value); render(); }; });
    dlg.querySelectorAll('.mpc-n').forEach(function (n) { n.oninput = function () { var v = parseInt(n.value, 10); st[n.dataset.k] = isFinite(v) ? Math.max(0, v) : 0; render(true); }; });
  }

  function render(fromNum) {
    dlg.setAttribute('data-mode', st.mode);
    dlg.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.m === st.mode); });
    var parts = { base: st.first ? R.base : 0, saves: st.saves * R.save, shares: st.shares * R.share, views: Math.round(st.views * R.k) };
    var raw = parts.base + parts.saves + parts.shares + parts.views, cut = Math.max(0, raw - R.cap), full = Math.min(raw, R.cap);
    var half = st.nth > 1, disc = half ? Math.round(full / 2) : 0, amt = full - disc;
    dlg.querySelectorAll('[data-n]').forEach(function (b) { b.setAttribute('aria-selected', +b.dataset.n === st.nth); });
    dlg.querySelector('.mpc-fixed .mpc-total b').textContent = eur(half ? FIXED / 2 : FIXED);
    var was = dlg.querySelector('.mpc-was'); was.hidden = !half; was.textContent = half ? f(t.was, { a: eur(FIXED) }) + ' → −50%' : '';
    var scale = R.cap / 0.62, pct = function (c) { return Math.min(c / scale * 100, 100); };
    ['views', 'saves', 'shares'].forEach(function (k) {
      dlg.querySelector('.mpc-r[data-k="' + k + '"]').value = toP(k, st[k]);
      if (!fromNum) dlg.querySelector('.mpc-n[data-k="' + k + '"]').value = st[k];
    });
    dlg.querySelectorAll('[data-p]').forEach(function (b) {
      var p = PRESETS.filter(function (x) { return x[0] === b.dataset.p; })[0];
      b.setAttribute('aria-pressed', p[1] === st.views && p[2] === st.saves && p[3] === st.shares);
    });
    dlg.querySelector('.mpc-grid .mpc-total b').textContent = eur(amt);
    var badge = dlg.querySelector('.mpc-badge');
    badge.className = 'mpc-badge ok';
    badge.hidden = !(cut > 0);
    badge.textContent = cut > 0 ? f(t.capHit, { a: eur(cut) }) : '';
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
      (half ? '<div class="ok"><span></span><span>' + t.disc + '</span><span>−' + eur(disc) + '</span></div>' : '') +
      '<div class="tot"><span></span><span>' + t.pay + '</span><span>' + eur(amt) + '</span></div>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-mp-calc]');
    if (!b) return;
    // wait briefly for the database price so the first view shows it
    Promise.race([loaded, new Promise(function (r) { setTimeout(r, 800); })]).then(function () {
      if (!dlg) build();
      render();
      if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
    });
  });
})();
