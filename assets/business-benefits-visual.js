// Plays the app mockups in .bv while they are on screen: items reveal in
// sequence, hold, reset, repeat. Static final frame for reduced motion.
(function () {
  var stages = document.querySelectorAll('.bv-stage');
  if (!stages.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD = 9000;
  var GAP = 900;

  function fmt(n, el) {
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var s = n.toFixed(dec);
    var sep = el.getAttribute('data-sep');
    if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    if (el.hasAttribute('data-comma')) s = s.replace('.', ',');
    return s + (el.getAttribute('data-suffix') || '');
  }

  function count(stage) {
    stage.querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var delay = parseFloat(el.getAttribute('data-delay') || '0') * 1000;
      if (reduce) { el.textContent = fmt(to, el); return; }
      el.textContent = fmt(0, el);
      setTimeout(function () {
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1100);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(to * e, el);
          if (p < 1 && stage.classList.contains('play')) requestAnimationFrame(step);
          else if (stage.classList.contains('play')) el.textContent = fmt(to, el);
        }
        requestAnimationFrame(step);
      }, delay);
    });
  }

  function start(stage) {
    if (stage._bvOn) return;
    stage._bvOn = true;
    if (reduce) { stage.classList.add('play'); count(stage); return; }
    (function cycle() {
      if (!stage._bvOn) return;
      stage.classList.add('play');
      count(stage);
      stage._bvT = setTimeout(function () {
        stage.classList.remove('play');
        stage._bvT = setTimeout(cycle, GAP);
      }, HOLD);
    })();
  }

  function stop(stage) {
    if (reduce) return;
    stage._bvOn = false;
    clearTimeout(stage._bvT);
    stage.classList.remove('play');
  }

  if (!('IntersectionObserver' in window)) {
    stages.forEach(function (s) { s.classList.add('play'); count(s); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) start(en.target); else stop(en.target);
    });
  }, { threshold: 0.35 });

  stages.forEach(function (s) { io.observe(s); });
})();
