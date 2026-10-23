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
  }
  window.whAnalyticsChoice = setChoice;

  /* ---------- Consent banner (shown only when the head script flagged a likely European visitor) ---------- */
  function showBanner() {
    if (document.getElementById('wh-consent')) return;
    var root = document.documentElement;
    var box = document.createElement('section');
    box.id = 'wh-consent';
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-labelledby', 'wh-consent-title');
    box.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-text"><strong id="wh-consent-title">Analytics cookies?</strong> ' +
        'We&rsquo;d like to use Google Analytics cookies to see, in aggregate, which pages are useful. ' +
        'No ads, no selling data. <a href="' + privacyUrl + '">Privacy</a></p>' +
        '<div class="consent-actions">' +
          '<button type="button" class="consent-btn" data-choice="granted">Accept</button>' +
          '<button type="button" class="consent-btn" data-choice="denied">Decline</button>' +
        '</div>' +
      '</div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-choice]') : null;
      if (!b) return;
      setChoice(b.getAttribute('data-choice'));
      box.parentNode.removeChild(box);
      root.classList.remove('has-consent');
      syncToggle();
    });
    document.body.appendChild(box);
    root.classList.add('has-consent');
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
      if (banner) { banner.parentNode.removeChild(banner); document.documentElement.classList.remove('has-consent'); }
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
      gtagSafe('event', 'youtube_click', { link_url: a.href });
    }
  }, true);

  function init() {
    if (window.whNeedsConsent && !getChoice()) showBanner();
    initToggle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
