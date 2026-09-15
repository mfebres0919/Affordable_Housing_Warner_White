/* ==========================================================================
   WW Housing Development LLC — about.js
   About page only. Site-wide behavior lives in global.js.

   Currently: the Mission / Vision / Approach tablist.
   ========================================================================== */

(function () {
  'use strict';

  /* Two independent tablists on this page — mission/vision/approach, and the
     two principals — so each one gets its own closure rather than sharing
     module-level state. */
  function initTabs(tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    if (tabs.length < 2) {
      return;
    }

    function panelFor(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
    }

    function select(tab, moveFocus) {
    var i;

    for (i = 0; i < tabs.length; i += 1) {
      var isCurrent = tabs[i] === tab;
      var panel = panelFor(tabs[i]);

      tabs[i].setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      /* Roving tabindex: one stop for the whole set, arrows move within it */
      tabs[i].setAttribute('tabindex', isCurrent ? '0' : '-1');

      if (panel) {
        panel.hidden = !isCurrent;
      }
    }

    if (moveFocus) {
      tab.focus();
    }
    }

    for (var i = 0; i < tabs.length; i += 1) {
    tabs[i].addEventListener('click', function (event) {
      select(event.currentTarget, false);
    });
    }

    tablist.addEventListener('keydown', function (event) {
    var current = tabs.indexOf(document.activeElement);

    if (current === -1) {
      return;
    }

    var next = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (current + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = tabs.length - 1;
    }

    if (next !== null) {
      event.preventDefault();
      select(tabs[next], true);
    }
    });

    /* A link from elsewhere can name the panel it wants open — the landing
       page's "Learn more" buttons point at #panel-white and #panel-deon. The
       browser cannot scroll to a panel that starts hidden, so this selects the
       tab first and then brings the section into view itself. */
    function openFromHash(scroll) {
      if (!window.location.hash) {
        return null;
      }

      var wanted = window.location.hash.slice(1);
      var match = tabs.filter(function (t) {
        return t.getAttribute('aria-controls') === wanted || t.id === wanted;
      })[0];

      if (!match) {
        return null;
      }

      select(match, false);

      if (scroll) {
        var panel = panelFor(match);

        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      }

      return match;
    }

    /* Normalise whatever the markup shipped with */
    var initial = openFromHash(true) || tabs.filter(function (t) {
      return t.getAttribute('aria-selected') === 'true';
    })[0] || tabs[0];

    select(initial, false);

    /* Following another such link while already on the page */
    window.addEventListener('hashchange', function () {
      openFromHash(true);
    });
  }

  var lists = document.querySelectorAll('[data-tabs]');

  for (var l = 0; l < lists.length; l += 1) {
    initTabs(lists[l]);
  }
})();
