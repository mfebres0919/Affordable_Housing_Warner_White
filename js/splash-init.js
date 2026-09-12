/* ==========================================================================
   WW Housing Development LLC — splash-init.js

   Loaded WITHOUT defer, from <head>, on purpose. It decides whether the
   splash should appear before the first paint; deferring it would let the
   overlay flash on every page a returning visitor opens.

   Not a handbook §6 violation: that rule is about deferring NONESSENTIAL
   scripts. This one is render-critical by definition, and it is a separate
   file rather than an inline block so §2 still holds.

   Show/hide both live here so a failure in global.js can never leave a
   visitor stuck behind the overlay.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'wwhd-splash-seen';
  var root = document.documentElement;

  /* sessionStorage, not localStorage: the splash belongs to the first arrival
     in a visit, and must not reappear as they move between pages. A new visit
     later gets it again. Swap to localStorage for once-ever instead. */
  var seen;

  try {
    seen = window.sessionStorage.getItem(KEY);
  } catch (error) {
    /* Private mode or blocked storage — skip the splash rather than risk
       showing it on every page */
    seen = '1';
  }

  if (seen) {
    return;
  }

  try {
    window.sessionStorage.setItem(KEY, '1');
  } catch (error) {
    /* Cannot record it; the failsafe below still reveals the page */
  }

  root.classList.add('has-splash');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Long enough for the progress bar to fill, matching the CSS duration.
     No wait at all when motion is not welcome. */
  var FILL_MS = reduced ? 0 : 1400;
  var FAILSAFE_MS = 6000;

  var fillDone = false;
  var pageDone = false;
  var revealed = false;

  function reveal() {
    if (revealed) {
      return;
    }

    revealed = true;
    root.classList.add('splash-done');
    root.classList.remove('has-splash');
  }

  /* Both conditions: the bar has filled AND the page is actually ready.
     That is what makes the bar complete exactly as the site appears. */
  function maybeReveal() {
    if (fillDone && pageDone) {
      reveal();
    }
  }

  window.setTimeout(function () {
    fillDone = true;
    maybeReveal();
  }, FILL_MS);

  if (document.readyState === 'complete') {
    pageDone = true;
  } else {
    window.addEventListener('load', function () {
      pageDone = true;
      maybeReveal();
    });
  }

  /* A hung image or third-party embed must never trap anyone behind it */
  window.setTimeout(reveal, FAILSAFE_MS);

  maybeReveal();
})();
