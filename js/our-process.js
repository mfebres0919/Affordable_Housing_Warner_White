/* ==========================================================================
   WW Housing Development LLC — our-process.js
   Our Process page only. Site-wide behavior lives in global.js.

   Drives the timeline rail. The fill height is a custom property on the list
   rather than a class, because it needs a continuous value; CSS owns how that
   value is drawn. Each step also gets .is-reached as the rail passes it.
   ========================================================================== */

(function () {
  'use strict';

  var steps = document.querySelector('[data-steps]');

  if (!steps) {
    return;
  }

  var items = steps.querySelectorAll('.step');
  var ticking = false;

  function update() {
    ticking = false;

    var rect = steps.getBoundingClientRect();

    /* The rail fills to wherever the list crosses the middle of the viewport */
    var line = window.innerHeight * 0.5;
    var fraction = (line - rect.top) / (rect.height || 1);

    if (fraction < 0) {
      fraction = 0;
    } else if (fraction > 1) {
      fraction = 1;
    }

    steps.style.setProperty('--steps-progress', fraction.toFixed(4));

    var i;

    for (i = 0; i < items.length; i += 1) {
      var marker = items[i].querySelector('.step__marker');
      var reached = marker.getBoundingClientRect().top <= line;

      /* toggle rather than add, so scrolling back up undoes it */
      items[i].classList.toggle('is-reached', reached);
    }
  }

  /* rAF-throttled so scrolling stays cheap */
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
