/* Whole Hum /links page: one GA4 event per click on a bio link.
   Uses the page's existing gtag() (GA4 + Consent Mode v2 block in <head>), so consent
   choices and the "ga-disable" opt-out apply as on every other page. Sends no data itself,
   stores nothing, and loads nothing else. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-link-platform]') : null;
    if (!a || typeof window.gtag !== 'function') return;
    var platform = a.getAttribute('data-link-platform');
    window.gtag('event', 'select_content', {
      content_type: 'bio_link',
      content_id: platform,
      link_platform: platform,
      link_position: a.getAttribute('data-link-position') || 'main',
      link_url: a.href
    });
  }, true);
})();
