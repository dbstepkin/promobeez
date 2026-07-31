(function () {
  var LAUNCH_Y = 2026;
  var LAUNCH_M = 7; // August (0-indexed)
  var LAUNCH_D = 3;

  function daysUntilLaunch() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var launch = new Date(LAUNCH_Y, LAUNCH_M, LAUNCH_D);
    return Math.round((launch - today) / 86400000);
  }

  function render(el, days) {
    var num = el.querySelector('.launch-countdown-num');
    var label = el.querySelector('.launch-countdown-label');
    if (!num || !label) return;

    el.classList.remove('is-launch-day', 'is-launched');

    if (days > 0) {
      num.textContent = String(days);
      label.textContent = days === 1 ? 'day to launch' : 'days to launch';
      el.setAttribute('aria-label', days === 1 ? '1 day to launch' : days + ' days to launch');
    } else if (days === 0) {
      el.classList.add('is-launch-day');
      num.textContent = 'Today';
      label.textContent = 'we launch';
      el.setAttribute('aria-label', 'Launch day — today');
    } else {
      el.classList.add('is-launched');
      num.textContent = '';
      label.textContent = 'Launched';
      el.setAttribute('aria-label', 'Launched');
    }

    el.hidden = false;
  }

  var days = daysUntilLaunch();
  document.querySelectorAll('[data-launch-countdown]').forEach(function (el) {
    render(el, days);
  });
})();
