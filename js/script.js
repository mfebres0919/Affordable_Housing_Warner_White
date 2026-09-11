/* ==========================================================================
   WW Housing Development LLC — script.js
   Homepage-only behavior. Site-wide behavior lives in global.js.

   Currently: hero photo carousel (crossfade, auto-advance, arrow controls).
   ========================================================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.hero');

  if (!hero) {
    return;
  }

  var slides = hero.querySelectorAll('.hero__slide');
  var prevButton = hero.querySelector('[data-hero-prev]');
  var nextButton = hero.querySelector('[data-hero-next]');

  /* Nothing to cycle through */
  if (slides.length < 2) {
    return;
  }

  var ACTIVE_CLASS = 'is-active';
  var INTERVAL = 6000;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    slides[index].classList.remove(ACTIVE_CLASS);
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add(ACTIVE_CLASS);
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    /* Hold a single still photograph when motion is not welcome */
    if (reducedMotion.matches) {
      return;
    }

    stop();

    timer = window.setInterval(function () {
      show(index + 1);
    }, INTERVAL);
  }

  /* Manual navigation restarts the clock, so a chosen photo gets a full turn */
  function goTo(nextIndex) {
    show(nextIndex);
    start();
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      goTo(index - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      goTo(index + 1);
    });
  }

  /* Pause while the visitor is reading or tabbing through the hero */
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);

  /* No point cycling in a backgrounded tab */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  function handleMotionPreference() {
    if (reducedMotion.matches) {
      stop();
    } else {
      start();
    }
  }

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionPreference);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionPreference);
  }

  start();
})();

/* ==========================================================================
   Our Process — which step card is active
   One class, .is-active, set two ways:
     pointer devices  -> the card under the cursor
     touch devices    -> the card nearest the middle of the viewport
   Card one carries the class in the markup, so the rest state is correct
   before this runs and without JavaScript at all.
   ========================================================================== */

(function () {
  'use strict';

  var items = document.querySelectorAll('[data-process-item]');

  if (items.length < 2) {
    return;
  }

  var ACTIVE_CLASS = 'is-active';
  var pointerQuery = window.matchMedia('(hover: hover)');
  var observer = null;

  function setActive(target) {
    var i;

    for (i = 0; i < items.length; i += 1) {
      if (items[i] === target) {
        items[i].classList.add(ACTIVE_CLASS);
      } else {
        items[i].classList.remove(ACTIVE_CLASS);
      }
    }
  }

  /* ---- Pointer devices: follow the cursor, resting on the first card ---- */
  function handleEnter(event) {
    setActive(event.currentTarget);
  }

  function handleLeave() {
    setActive(items[0]);
  }

  function bindPointer() {
    var i;

    for (i = 0; i < items.length; i += 1) {
      items[i].addEventListener('mouseenter', handleEnter);
    }

    items[0].parentNode.addEventListener('mouseleave', handleLeave);
  }

  function unbindPointer() {
    var i;

    for (i = 0; i < items.length; i += 1) {
      items[i].removeEventListener('mouseenter', handleEnter);
    }

    items[0].parentNode.removeEventListener('mouseleave', handleLeave);
  }

  /* ---- Touch devices: follow the scroll ----
     The negative margins shrink the observed area to a band across the middle
     of the viewport, so a card activates as it arrives at centre screen. */
  function startObserver() {
    var i;

    if (observer !== null || typeof window.IntersectionObserver !== 'function') {
      return;
    }

    observer = new window.IntersectionObserver(
      function (entries) {
        var j;

        for (j = 0; j < entries.length; j += 1) {
          if (entries[j].isIntersecting) {
            setActive(entries[j].target);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    for (i = 0; i < items.length; i += 1) {
      observer.observe(items[i]);
    }
  }

  function stopObserver() {
    if (observer !== null) {
      observer.disconnect();
      observer = null;
    }
  }

  function sync() {
    if (pointerQuery.matches) {
      stopObserver();
      bindPointer();
      setActive(items[0]);
    } else {
      unbindPointer();
      startObserver();
    }
  }

  if (typeof pointerQuery.addEventListener === 'function') {
    pointerQuery.addEventListener('change', sync);
  } else if (typeof pointerQuery.addListener === 'function') {
    pointerQuery.addListener(sync);
  }

  sync();
})();
