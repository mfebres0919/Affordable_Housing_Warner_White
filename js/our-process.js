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

/* ==========================================================================
   Financing pathways

   Below 64em the panels are a snap carousel. The swipe is the browser's, so
   it works with or without this file; what is added here is the arrows and
   the dots, which are built from the panels rather than written into the
   markup so their count can never drift from the number of routes. The
   section only reveals them once this has run.

   At 64em and up the row opens on hover, which CSS handles alone. The one
   thing it cannot handle is a large touch screen, where there is no hover to
   open a panel with — hence the tap handler at the end.
   ========================================================================== */

(function () {
  'use strict';

  var section = document.querySelector('[data-pathways]');

  if (!section) {
    return;
  }

  var viewport = section.querySelector('[data-pathways-viewport]');

  if (!viewport) {
    return;
  }

  var cards = viewport.querySelectorAll('.pathway');

  if (cards.length < 2) {
    return;
  }

  var prevButton = section.querySelector('[data-pathways-prev]');
  var nextButton = section.querySelector('[data-pathways-next]');
  var dotsBox = section.querySelector('[data-pathways-dots]');
  var rowQuery = window.matchMedia('(min-width: 64em)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dots = [];
  var current = -1;
  var ticking = false;

  /* Whichever panel is nearest the middle of the viewport. Read from scroll
     position rather than tracked in a variable, so a swipe, an arrow and a
     dot all agree about where the carousel is. */
  function activeIndex() {
    var middle = viewport.scrollLeft + viewport.clientWidth / 2;
    var best = 0;
    var bestGap = Infinity;
    var gap;
    var i;

    for (i = 0; i < cards.length; i += 1) {
      gap = Math.abs(cards[i].offsetLeft + cards[i].offsetWidth / 2 - middle);

      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    }

    return best;
  }

  function goTo(index) {
    if (index < 0) {
      index = 0;
    } else if (index > cards.length - 1) {
      index = cards.length - 1;
    }

    /* Centred, to match scroll-snap-align: center — otherwise the snap would
       tug the panel sideways the moment the smooth scroll finished */
    var left = cards[index].offsetLeft
      + cards[index].offsetWidth / 2
      - viewport.clientWidth / 2;

    if (typeof viewport.scrollTo === 'function') {
      viewport.scrollTo({
        left: left,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    } else {
      viewport.scrollLeft = left;
    }
  }

  function buildDots() {
    var dot;
    var i;

    if (!dotsBox) {
      return;
    }

    for (i = 0; i < cards.length; i += 1) {
      dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'pathways__dot';
      dot.setAttribute('aria-label', 'Show route ' + (i + 1) + ' of ' + cards.length);
      dot.addEventListener('click', goTo.bind(null, i));

      dotsBox.appendChild(dot);
      dots.push(dot);
    }
  }

  function paint() {
    ticking = false;

    var index = activeIndex();
    var i;

    if (index === current) {
      return;
    }

    current = index;

    for (i = 0; i < dots.length; i += 1) {
      dots[i].classList.toggle('is-current', i === index);
      dots[i].setAttribute('aria-current', i === index ? 'true' : 'false');
    }

    /* The ends of the track are the only place the arrows have nothing to do */
    if (prevButton) {
      prevButton.disabled = index === 0;
    }

    if (nextButton) {
      nextButton.disabled = index === cards.length - 1;
    }
  }

  /* rAF-throttled so swiping stays cheap */
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(paint);
    }
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      goTo(activeIndex() - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      goTo(activeIndex() + 1);
    });
  }

  /* Large screens without hover. The open panel's link stays clickable
     because CSS only lifts pointer-events on the panel that is open. */
  viewport.addEventListener('click', function (event) {
    if (!rowQuery.matches || typeof event.target.closest !== 'function') {
      return;
    }

    var card = event.target.closest('.pathway');
    var i;

    if (!card) {
      return;
    }

    for (i = 0; i < cards.length; i += 1) {
      cards[i].classList.toggle('is-open', cards[i] === card);
    }

    /* Tells CSS to stand the resting panel down, now that a choice was made */
    viewport.classList.add('has-open');
  });

  buildDots();
  section.classList.add('is-ready');

  viewport.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  paint();
})();
