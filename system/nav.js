/**
 * AjaMentor Mockup Navigation
 *
 * Wires up:
 *   1. Header back buttons (`.icon-btn[aria-label="뒤로"]`)
 *      - Uses `data-back` (on the button or its `<header>`) if present
 *      - Otherwise falls back to `history.back()`
 *   2. Step-flow CTAs (`[data-next]`)
 *      - Click navigates to the relative URL in `data-next`
 *
 * Both navigations preserve the current `?theme=` query parameter
 * so the 5-theme switcher stays consistent across pages.
 *
 * Vanilla JS, no dependencies. Loaded after theme-switcher.js.
 */
(function () {
  function withTheme(href) {
    if (!href) return href;
    var theme;
    try {
      theme = new URLSearchParams(window.location.search).get('theme');
    } catch (e) {
      theme = null;
    }
    if (!theme) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    // Avoid double-appending if href already carries the theme
    if (href.indexOf('theme=') !== -1) return href;
    return href + sep + 'theme=' + theme;
  }

  function bindBack() {
    var buttons = document.querySelectorAll('.icon-btn[aria-label="뒤로"]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var headerEl = btn.closest('header');
        var back = btn.dataset.back || (headerEl && headerEl.dataset ? headerEl.dataset.back : null);
        if (back) {
          window.location.href = withTheme(back);
        } else if (window.history.length > 1) {
          window.history.back();
        }
      });
      btn.style.cursor = 'pointer';
    });
  }

  function bindNext() {
    var nodes = document.querySelectorAll('[data-next]');
    nodes.forEach(function (el) {
      el.addEventListener('click', function (e) {
        var next = el.dataset.next;
        if (!next) return;
        e.preventDefault();
        window.location.href = withTheme(next);
      });
      el.style.cursor = 'pointer';
    });
  }

  function init() {
    bindBack();
    bindNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
