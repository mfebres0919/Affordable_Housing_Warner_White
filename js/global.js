/* ==========================================================================
   WW Housing Development LLC — global.js
   Site-wide behavior. Vanilla JS, no dependencies.

   Currently: mobile navigation panel (open/close, focus handling, Escape,
   backdrop click, scroll lock, reset when resizing up to desktop).
   ========================================================================== */

(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var overlay = document.querySelector('.nav-overlay');
  var closeButton = document.querySelector('.nav-close');

  if (!header || !toggle || !nav) {
    return;
  }

  var OPEN_CLASS = 'nav-is-open';
  var BODY_CLASS = 'has-open-nav';
  var FOCUSABLE = 'a[href], button:not([disabled])';
  /* Must match the navigation row breakpoint in css/global.css */
  var desktopQuery = window.matchMedia('(min-width: 68em)');

  function isOpen() {
    return header.classList.contains(OPEN_CLASS);
  }

  function openNav() {
    header.classList.add(OPEN_CLASS);
    document.body.classList.add(BODY_CLASS);
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');

    var first = nav.querySelector(FOCUSABLE);
    if (first) {
      first.focus();
    }
  }

  function closeNav(returnFocus) {
    header.classList.remove(OPEN_CLASS);
    document.body.classList.remove(BODY_CLASS);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');

    if (returnFocus) {
      toggle.focus();
    }
  }

  /* Keep Tab inside the panel while it is open */
  function trapFocus(event) {
    var items = Array.prototype.filter.call(
      nav.querySelectorAll(FOCUSABLE),
      function (item) {
        return item.offsetParent !== null;
      }
    );

    if (!items.length) {
      return;
    }

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) {
      closeNav(false);
    } else {
      openNav();
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      closeNav(true);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      closeNav(true);
    });
  }

  /* Close after choosing a destination, so returning via the back button
     never lands on an open panel */
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a') && !desktopQuery.matches) {
      closeNav(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      closeNav(true);
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  });

  /* Resizing past the desktop breakpoint turns the panel into a row —
     drop the open state so scroll lock and focus trap do not linger */
  function handleBreakpoint(event) {
    if (event.matches && isOpen()) {
      closeNav(false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpoint);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpoint);
  }
})();

/* ==========================================================================
   Back to top
   Reveals itself past one viewport of scrolling. scrollTo is called without
   a behaviour so it inherits scroll-behavior from CSS — which the
   reduced-motion block already switches to auto, so no branching here.
   ========================================================================== */

(function () {
  'use strict';

  var button = document.querySelector('.to-top');

  if (!button) {
    return;
  }

  var VISIBLE_CLASS = 'is-visible';
  var ticking = false;

  function update() {
    ticking = false;

    if (window.pageYOffset > window.innerHeight * 0.8) {
      button.classList.add(VISIBLE_CLASS);
    } else {
      button.classList.remove(VISIBLE_CLASS);
    }
  }

  /* rAF-throttled so scrolling stays cheap */
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  button.addEventListener('click', function () {
    window.scrollTo({ top: 0 });

    /* The button hides itself once we arrive, so hand focus to the top of the
       tab order rather than letting it fall back to the body */
    var brand = document.querySelector('.site-header .brand');

    if (brand) {
      brand.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

/* ==========================================================================
   Project Experience submenu

   The disclosure button belongs to the mobile panel: on a pointer device the
   row opens on hover and CSS handles it alone, so the button is hidden there.
   This only has to drive the panel, plus tidy up when the layout changes.
   ========================================================================== */

(function () {
  'use strict';

  var items = document.querySelectorAll('[data-nav-menu]');

  if (items.length === 0) {
    return;
  }

  /* Must match the navigation row breakpoint in css/global.css */
  var desktopQuery = window.matchMedia('(min-width: 68em)');
  var OPEN_CLASS = 'is-open';

  function setOpen(item, open) {
    var button = item.querySelector('[data-nav-disclosure]');

    item.classList.toggle(OPEN_CLASS, open);

    if (button) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function handleClick(event) {
    var item = event.currentTarget.closest('[data-nav-menu]');

    if (item) {
      setOpen(item, !item.classList.contains(OPEN_CLASS));
    }
  }

  var i;

  for (i = 0; i < items.length; i += 1) {
    var button = items[i].querySelector('[data-nav-disclosure]');

    if (button) {
      button.addEventListener('click', handleClick);
    }
  }

  /* Crossing into the desktop row hands the job back to :hover, so anything
     left open in the panel is closed rather than stranded open in the row */
  function handleBreakpoint() {
    if (!desktopQuery.matches) {
      return;
    }

    var j;

    for (j = 0; j < items.length; j += 1) {
      setOpen(items[j], false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpoint);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpoint);
  }
})();

/* ==========================================================================
   FAQ disclosure panels

   Shared by the Fee Arrangement and project detail pages; no-ops anywhere
   without a [data-faq] list. Every panel ships open in the markup and the
   first thing this does is close all but the first, so with no JavaScript the
   section reads as a plain list of questions and answers.
   ========================================================================== */

(function () {
  'use strict';

  var list = document.querySelector('[data-faq]');

  if (!list) {
    return;
  }

  var triggers = list.querySelectorAll('.faq__trigger');

  if (triggers.length < 2) {
    return;
  }

  var CLOSED_CLASS = 'is-closed';
  var items = [];

  function setOpen(item, open) {
    item.classList.toggle(CLOSED_CLASS, !open);

    var trigger = item.querySelector('.faq__trigger');

    if (trigger) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  /* button -> h3 -> li, whichever way we get there */
  function itemFor(trigger) {
    return trigger.closest ? trigger.closest('.faq__item')
                           : trigger.parentNode.parentNode;
  }

  function handleClick(event) {
    var item = itemFor(event.currentTarget);
    /* Toggling rather than only opening: a second click on the open question
       closes it, which is what the arrow pointing up implies */
    var open = item.classList.contains(CLOSED_CLASS);
    var i;

    for (i = 0; i < items.length; i += 1) {
      setOpen(items[i], items[i] === item && open);
    }
  }

  var i;

  for (i = 0; i < triggers.length; i += 1) {
    items.push(itemFor(triggers[i]));
    triggers[i].addEventListener('click', handleClick);
  }

  /* The rest state: the first question answered, the others waiting */
  for (i = 0; i < items.length; i += 1) {
    setOpen(items[i], i === 0);
  }
})();

/* ==========================================================================
   Step cards — which one is active

   Shared by the home page's "From Land to Homes" and the /start/ landing page;
   no-ops anywhere without [data-process-item]. One class, .is-active, set two
   ways: pointer devices put it on the card under the cursor, touch devices on
   the card nearest the middle of the viewport. Card one carries it in the
   markup, so the rest state is correct before this runs and without JavaScript
   at all.
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

/* ==========================================================================
   Pathways marquee — pause control
   CSS already pauses on hover and focus-within; this covers keyboard and
   touch, which hover cannot reach.
   ========================================================================== */

(function () {
  'use strict';

  var marquee = document.querySelector('.marquee');
  var toggle = marquee && marquee.querySelector('.marquee__toggle');

  if (!marquee || !toggle) {
    return;
  }

  toggle.addEventListener('click', function () {
    var paused = toggle.getAttribute('aria-pressed') === 'true';

    toggle.setAttribute('aria-pressed', paused ? 'false' : 'true');
    toggle.setAttribute('aria-label', paused
      ? 'Pause the scrolling list'
      : 'Resume the scrolling list');
    marquee.classList.toggle('is-paused', !paused);
  });
})();
