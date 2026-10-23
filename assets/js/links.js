/* Whole Hum links + pinned header.
   1) One GA4 event per click on any link with data-link-platform (social band, footer Google Site
      and email): select_content. analytics.js skips these links (window.whLinkEvents), so a YouTube
      band click is counted once, not twice. Uses the page's existing gtag() (GA4 + Consent Mode v2
      block in <head>), so consent choices and the "ga-disable" opt-out apply as on every other page.
   2) Shrinks the pinned header + band after ~24px of scroll (IntersectionObserver on a sentinel).
   Sends no data itself, stores nothing, and loads nothing else. */
(function () {
  'use strict';
  window.whLinkEvents = true;
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

  var hdr = document.querySelector('.site-header');
  if (!hdr || !('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  var nav = hdr.querySelector('.nav');
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var compact = false;

  function navEdge() {
    if (!nav) return;
    nav.classList.toggle('has-more', compact && nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
  }
  // Toggle the compact state, keeping the header's total footprint (height + margin) constant,
  // so the page content never moves.
  // Scroll anchoring is paused for the toggle: the in-between measurement layout would otherwise
  // make Chrome "correct" the scroll position and the state would flip back and forth near the top.
  var anchorT;
  function set(on, animate) {
    root.style.overflowAnchor = 'none';
    cancelAnimationFrame(anchorT);
    anchorT = requestAnimationFrame(function () {
      anchorT = requestAnimationFrame(function () { root.style.overflowAnchor = ''; });
    });
    hdr.classList.remove('is-compact');
    hdr.style.marginBottom = '';
    if (on) {
      var full = hdr.getBoundingClientRect().height;
      hdr.classList.add('is-compact');
      var slim = hdr.getBoundingClientRect().height;
      hdr.style.marginBottom = (full - slim).toFixed(2) + 'px';
      root.style.setProperty('--pin-h', Math.ceil(slim) + 'px');
      var cur = nav && nav.querySelector('[aria-current="page"]');
      if (cur && nav.scrollWidth > nav.clientWidth) {
        var l = cur.offsetLeft - nav.offsetLeft;
        if (l + cur.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = l - 8;
      }
    }
    compact = on;
    navEdge();
    if (animate && !reduce.matches) {
      hdr.classList.remove('pin-anim'); void hdr.offsetWidth; hdr.classList.add('pin-anim');
    }
  }
  hdr.addEventListener('animationend', function () { hdr.classList.remove('pin-anim'); });
  if (nav) nav.addEventListener('scroll', navEdge, { passive: true });

  var s = document.createElement('div');
  s.className = 'pin-sentinel';
  s.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(s, document.body.firstChild);
  new IntersectionObserver(function (es) {
    var on = !es[es.length - 1].isIntersecting;
    if (on !== compact) set(on, true);
  }).observe(s);

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { if (compact) set(true, false); }, 120);
  }, { passive: true });
})();
