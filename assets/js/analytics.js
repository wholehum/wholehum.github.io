/* Whole Hum analytics helpers: consent banner, privacy-page toggle, custom events.
   The Google Analytics tag and Consent Mode defaults are inline in each page's <head>.
   The visitor's choice is kept in localStorage under "wh-analytics-consent"
   ("granted" or "denied"). No other data is stored by this script. */
(function () {
  'use strict';
  var KEY = 'wh-analytics-consent';
  var GA_ID = 'G-04TF991ZRR';
  var me = document.currentScript;
  var privacyUrl = me && me.src ? new URL('../../privacy.html', me.src).href : '/privacy.html';

  function gtagSafe() {
    if (typeof window.gtag === 'function') window.gtag.apply(window, arguments);
  }
  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked: choice lasts for this page only */ }
    window['ga-disable-' + GA_ID] = (value === 'denied');
    gtagSafe('consent', 'update', { analytics_storage: value });
    // EEA/UK/CH (Consent Mode basic): gtag.js loads only now, on Accept. Decline keeps it unloaded.
    if (value === 'granted' && typeof window.whLoadGA === 'function') window.whLoadGA();
    else if (value === 'denied' && window.whNeedsConsent && !window.whGaLoaded) window.whGaHold = true;
  }
  window.whAnalyticsChoice = setChoice;
  // Custom events only after consent: an explicit Accept, or (outside the consent region) no choice and no Decline.
  function analyticsAllowed() {
    var c = getChoice();
    if (c === 'denied') return false;
    if (c === 'granted') return true;
    return !window.whNeedsConsent;
  }

  /* ---------- Consent banner (shown only when the head script flagged a likely European visitor) ----------
     The markup below is a fixed string: no URL, choice or visitor data is ever put into it. The Privacy
     link's href is set afterwards as a property. The banner goes right after the skip link, so it is
     early in the Tab order, and after Accept/Decline keyboard focus moves to <main> (no event is sent). */
  var BANNER_HTML =
    '<div class="consent-inner">' +
      '<p class="consent-text"><strong id="wh-consent-title">Analytics cookies?</strong> ' +
      'We&rsquo;d like to use Google Analytics cookies to see, in aggregate, which pages are useful. ' +
      'No ads, no selling data. <a class="consent-privacy" href="#">Privacy</a></p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="consent-btn" data-choice="granted">Accept</button>' +
        '<button type="button" class="consent-btn" data-choice="denied">Decline</button>' +
      '</div>' +
    '</div>';

  function setBannerHeight() {
    var box = document.getElementById('wh-consent');
    if (box) document.documentElement.style.setProperty('--consent-h', box.offsetHeight + 'px');
  }
  function removeBanner(box) {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    var root = document.documentElement;
    root.classList.remove('has-consent');
    root.style.removeProperty('--consent-h');
    window.removeEventListener('resize', setBannerHeight);
  }
  function focusMain() {
    var main = document.getElementById('main');
    if (!main) return;
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); }
  }

  function showBanner() {
    if (document.getElementById('wh-consent')) return;
    var root = document.documentElement;
    var box = document.createElement('section');
    box.id = 'wh-consent';
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-labelledby', 'wh-consent-title');
    box.innerHTML = BANNER_HTML;
    var privacyLink = box.querySelector('a.consent-privacy');
    if (privacyLink) privacyLink.href = privacyUrl;
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-choice]') : null;
      if (!b) return;
      var choice = b.getAttribute('data-choice') === 'granted' ? 'granted' : 'denied';
      setChoice(choice);
      removeBanner(box);
      syncToggle();
      focusMain();
    });
    var skip = document.querySelector('body > a.skip');
    if (skip) skip.parentNode.insertBefore(box, skip.nextSibling);
    else document.body.insertBefore(box, document.body.firstChild);
    root.classList.add('has-consent');
    setBannerHeight();
    window.addEventListener('resize', setBannerHeight);
  }

  /* ---------- Privacy page toggle ---------- */
  function syncToggle() {
    var t = document.getElementById('ga-toggle');
    if (!t) return;
    var c = getChoice();
    var off = c === 'denied' || (!c && window.whNeedsConsent);
    t.checked = !off;
    var s = document.getElementById('ga-toggle-status');
    if (s) s.textContent = off
      ? 'Google Analytics is off on this site in this browser.'
      : 'Google Analytics is on. Untick the box to turn it off.';
  }
  function initToggle() {
    var t = document.getElementById('ga-toggle');
    if (!t) return;
    t.addEventListener('change', function () {
      setChoice(t.checked ? 'granted' : 'denied');
      var banner = document.getElementById('wh-consent');
      if (banner) removeBanner(banner);
      syncToggle();
    });
    syncToggle();
  }

  /* ---------- Custom event: clicks on YouTube links ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    // Links tagged data-link-platform are counted once by links.js (select_content); don't double-count.
    if (window.whLinkEvents && a.hasAttribute('data-link-platform')) return;
    var host = (a.hostname || '').toLowerCase();
    if (/(^|\.)youtube\.com$/.test(host) || host === 'youtu.be') {
      if (!analyticsAllowed()) return;
      // link_platform / link_position are fixed literals (match links.js select_content). link_url is the
      // link's own address with any query string or fragment removed; no referrer or page data is added.
      gtagSafe('event', 'youtube_click', {
        link_url: a.origin + a.pathname,
        link_platform: 'youtube',
        link_position: 'content'
      });
    }
  }, true);

  function init() {
    if (window.whNeedsConsent && !getChoice()) showBanner();
    initToggle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
