document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sticky nav shadow on scroll
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  // Highlight today in hours table
  const today = new Date().getDay();
  const map = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
  document.querySelectorAll('.hours-table tr').forEach(function (row) {
    const cell = row.querySelector('td');
    if (cell && cell.textContent.trim() === map[today]) row.classList.add('today');
  });

  // Respect reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-tag reveal targets
  const revealSelectors = [
    '.section-head',
    '.service-card',
    '.testimonial',
    '.trust-item',
    '.value-card',
    '.doctor-card',
    '.about-split',
    '.info-bar',
    '.final-cta',
    '.form-card',
    '.appointment-aside',
    '.map-embed',
    '.emergency-banner'
  ];
  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('reveal');
    });
  });

  // Stagger items within certain containers
  document.querySelectorAll('.services-bento, .testimonial-grid, .values-grid, .trust-strip .container').forEach(function (container) {
    const items = container.querySelectorAll('.reveal');
    items.forEach(function (el, i) {
      if (i < 5) el.classList.add('delay-' + (i + 1));
    });
  });

  if (reduced) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return;
  }

  // IntersectionObserver reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Number counter for trust strip
  const counters = document.querySelectorAll('.trust-item strong');
  if (counters.length && 'IntersectionObserver' in window) {
    const parseCounter = function (text) {
      const m = text.match(/^(\d+[\d,]*)(.*)$/);
      if (!m) return null;
      return { num: parseInt(m[1].replace(/,/g, ''), 10), suffix: m[2], raw: text };
    };
    const animate = function (el, target, suffix, duration) {
      const start = performance.now();
      const step = function (now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(step);
    };
    const countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const parsed = parseCounter(el.textContent.trim());
          if (parsed) {
            el.dataset.final = parsed.raw;
            el.textContent = '0' + parsed.suffix;
            animate(el, parsed.num, parsed.suffix, 1400);
          }
          countIo.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countIo.observe(el); });
  }
});
