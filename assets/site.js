document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-open');
  var iconClose = document.getElementById('icon-close');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    var willOpen = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('overflow-hidden', willOpen);
    if (iconOpen && iconClose) {
      iconOpen.classList.toggle('hidden', willOpen);
      iconClose.classList.toggle('hidden', !willOpen);
    }
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('is-open');
      document.body.classList.remove('overflow-hidden');
      if (iconOpen && iconClose) {
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
      btn.setAttribute('aria-expanded', 'false');
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });

      // Safety net: guarantee visibility even if the observer never fires
      // for a given element (e.g. zero-height container, engine quirk).
      setTimeout(function () {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }, 1800);
    }
  }

  // Animated counters
  var counters = document.querySelectorAll('[data-counter]');
  function finalCounterText(el) {
    return el.getAttribute('data-counter') + (el.getAttribute('data-counter-suffix') || '');
  }
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-counter-suffix') || '';
    var duration = 1400;
    var start = null;
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.textContent = target + suffix;
    }
    function step(ts) {
      if (done) return;
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
    // Safety net: guarantee the final value lands even if rAF stalls
    // (backgrounded tab, headless rendering, etc.).
    setTimeout(finish, duration + 400);
  }
  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = finalCounterText(el); });
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });

      // Safety net: if the observer never fires for a counter (engine
      // quirk, zero-height container), snap every counter to its final
      // value so nothing is left showing "0".
      setTimeout(function () {
        counters.forEach(function (el) {
          if (el.textContent === finalCounterText(el)) return;
          el.textContent = finalCounterText(el);
        });
      }, 2400);
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var bar = document.getElementById('mobile-cta-bar');
  if (!bar) return;

  var dismissed = false;
  try { dismissed = sessionStorage.getItem('pga_cta_dismissed') === '1'; } catch (e) {}
  if (dismissed) return;

  requestAnimationFrame(function () { bar.classList.add('is-visible'); });

  var dismissBtn = document.getElementById('mobile-cta-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      bar.classList.remove('is-visible');
      try { sessionStorage.setItem('pga_cta_dismissed', '1'); } catch (e) {}
    });
  }
});
