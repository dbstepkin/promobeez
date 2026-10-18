!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1367558515342525');
fbq('track', 'PageView');

// Dwell signal for Meta ads when hard conversions are rare.
// Fires once after ~20s of visible time on the page (tab must be visible).
(function trackEngagedDwell() {
  var DWELL_MS = 20000;
  var fired = false;
  var visibleMs = 0;
  var lastVisibleAt = document.visibilityState === 'visible' ? Date.now() : null;
  var tick = null;

  function fire() {
    if (fired || typeof fbq !== 'function') return;
    fired = true;
    if (tick) clearInterval(tick);
    fbq('track', 'ViewContent', {
      content_name: 'engaged_dwell_20s',
      content_category: 'landing_dwell',
    });
    fbq('trackCustom', 'Engage20s');
  }

  function onVisibility() {
    if (document.visibilityState === 'visible') {
      lastVisibleAt = Date.now();
    } else if (lastVisibleAt) {
      visibleMs += Date.now() - lastVisibleAt;
      lastVisibleAt = null;
      if (visibleMs >= DWELL_MS) fire();
    }
  }

  document.addEventListener('visibilitychange', onVisibility);
  tick = setInterval(function () {
    if (fired) return;
    var now = Date.now();
    var accrued = visibleMs;
    if (lastVisibleAt) accrued += now - lastVisibleAt;
    if (accrued >= DWELL_MS) fire();
  }, 1000);
})();
