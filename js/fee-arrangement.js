/* ==========================================================================
   WW Housing Development LLC — fee-arrangement.js
   Fee Arrangement page only. Site-wide behavior lives in global.js.

   The FAQ disclosure panels. Every panel ships open in the markup, and the
   first thing this does is close all but the first — so with no JavaScript
   the section is a plain readable list of questions and answers rather than a
   column of headings that do nothing. One panel is open at a time, and the
   open one can be closed again.
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
