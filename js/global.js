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
