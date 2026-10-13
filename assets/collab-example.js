// Shows one collab example at random; the "next" button cycles through the rest.
(function () {
  document.querySelectorAll('.collab-ex').forEach(function (sec) {
    var cards = sec.querySelectorAll('.cx-card');
    if (cards.length < 2) return;
    var current = Math.floor(Math.random() * cards.length);
    function show(i) {
      current = i;
      cards.forEach(function (card, n) { card.hidden = n !== i; });
    }
    show(current);
    sec.querySelectorAll('.cx-next').forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () { show((current + 1) % cards.length); });
    });
  });
})();
