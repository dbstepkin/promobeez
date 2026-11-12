!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1367558515342525');
fbq('init', '4625362231124918');

// Meta CAPI mirror (server). Fail-open: never blocks Pixel or page UX.
(function () {
  function cookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) {
      return '';
    }
  }

  function eventId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'pb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function sendCapi(eventName, id, customData) {
    try {
      var payload = JSON.stringify({
        event_name: eventName,
        event_id: id,
        event_source_url: location.href,
        fbp: cookie('_fbp') || undefined,
        fbc: cookie('_fbc') || undefined,
        custom_data: customData || undefined,
      });
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        if (navigator.sendBeacon('/api/meta-capi', blob)) return;
      }
      fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
        credentials: 'same-origin',
      }).catch(function () {});
    } catch (e) {}
  }

  window.pbTrackMeta = function (eventName, params, customEventName) {
    var id = eventId();
    var data = params || {};
    try {
      if (typeof fbq === 'function') {
        fbq('track', eventName, data, { eventID: id });
        if (customEventName) fbq('trackCustom', customEventName, data, { eventID: id + '_c' });
      }
    } catch (e) {}
    sendCapi(eventName, id, Object.keys(data).length ? data : undefined);
    if (customEventName) sendCapi(customEventName, id + '_c', Object.keys(data).length ? data : undefined);
    return id;
  };
})();

(function () {
  var id = (window.pbTrackMeta && window.pbTrackMeta('PageView')) || null;
  if (!id && typeof fbq === 'function') fbq('track', 'PageView');
})();

// Dwell signal for Meta ads when hard conversions are rare.
// Fires once after ~20s of visible time on the page (tab must be visible).
(function trackEngagedDwell() {
  var DWELL_MS = 20000;
  var fired = false;
  var visibleMs = 0;
  var lastVisibleAt = document.visibilityState === 'visible' ? Date.now() : null;
  var tick = null;

  function fire() {
    if (fired) return;
    fired = true;
    if (tick) clearInterval(tick);
    var params = {
      content_name: 'engaged_dwell_20s',
      content_category: 'landing_dwell',
    };
    if (window.pbTrackMeta) {
      window.pbTrackMeta('ViewContent', params, 'Engage20s');
    } else if (typeof fbq === 'function') {
      fbq('track', 'ViewContent', params);
      fbq('trackCustom', 'Engage20s');
    }
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
