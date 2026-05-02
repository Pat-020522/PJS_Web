/**
 * Jordan Lee Portfolio — script.js
 * Handles:
 *  1. Theme toggle (dark / light) with localStorage persistence
 *  2. Scroll-based nav shrink / shadow
 *  3. Scroll reveal animations (IntersectionObserver)
 *  4. Hamburger / mobile menu
 *  5. Mobile menu link close on click
 *  6. Resume download feedback
 *  7. Dynamic footer year
 *  8. Hero reveal on page load
 */

'use strict';

/* ── Helpers ───────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ── 1. THEME ──────────────────────────────────────────── */
(function initTheme() {
  const STORAGE_KEY = 'jl-theme';
  const html        = document.documentElement;
  const btn         = qs('#theme-toggle');

  // Load saved preference; fall back to 'dark'
  const saved = localStorage.getItem(STORAGE_KEY);
  const pref  = saved || 'dark';
  html.setAttribute('data-theme', pref);

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // Set initial aria-label
  applyTheme(pref);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();


/* ── 2. NAV SCROLL STATE ───────────────────────────────── */
(function initNavScroll() {
  const header = qs('#site-header');
  let ticking  = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── 3. SCROLL REVEAL (IntersectionObserver) ───────────── */
(function initScrollReveal() {
  const targets = qsa('.reveal-up');

  // If IntersectionObserver isn't supported, just show everything
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  targets.forEach(el => {
    // Hero elements — reveal after short page-load delay instead of scroll
    if (el.closest('#hero')) {
      setTimeout(() => el.classList.add('is-visible'), 100);
    } else {
      observer.observe(el);
    }
  });
})();


/* ── 4. HAMBURGER / MOBILE MENU ────────────────────────── */
(function initMobileMenu() {
  const hamburger  = qs('#nav-hamburger');
  const mobileMenu = qs('#mobile-menu');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // 5. Close mobile menu when a link is clicked
  qsa('.mobile-link').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  // Close if user resizes to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  }, { passive: true });
})();


/* ── 6. RESUME DOWNLOAD FEEDBACK ───────────────────────── */
(function initDownload() {
  const btn = qs('#download-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Toast confirms download started; replace assets/resume.pdf with your real PDF
    showToast('Download started!');
  });

  function showToast(msg) {
    // Remove existing toast if any
    const existing = qs('.jl-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'jl-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = msg;

    // Inline styles so no extra CSS class is needed (self-contained)
    Object.assign(toast.style, {
      position:        'fixed',
      bottom:          '2rem',
      left:            '50%',
      transform:       'translateX(-50%) translateY(20px)',
      background:      'var(--accent)',
      color:           '#000',
      padding:         '0.65rem 1.5rem',
      borderRadius:    '999px',
      fontFamily:      'var(--font-mono)',
      fontSize:        '0.78rem',
      letterSpacing:   '0.06em',
      zIndex:          '9999',
      opacity:         '0',
      transition:      'opacity 300ms ease, transform 300ms ease',
      pointerEvents:   'none',
      whiteSpace:      'nowrap',
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Auto-remove after 3s
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
})();


/* ── 7. FOOTER YEAR ────────────────────────────────────── */
(function initFooterYear() {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ── 8. SMOOTH SCROLL OVERRIDE (for older browsers) ───── */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = qs(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const navH   = parseInt(getComputedStyle(document.documentElement)
                       .getPropertyValue('--nav-h')) || 68;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
