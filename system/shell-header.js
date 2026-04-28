/**
 * AjaMentor Mockup Shell Header
 *
 * Two automatic transforms on DOMContentLoaded:
 *
 *  (a) Desktop global shell header
 *      Prepends a sticky theme dock (AjaMentor brand · 5 theme chips · URL hint)
 *      as the first child of <body>, mirroring the global header used in
 *      mockups/index.html. Markup is inline (no fetch) so it works on file://.
 *
 *  (b) App bar home button
 *      Inside any <header class="app-bar"> on the page, replaces the
 *      36px-wide spacer (e.g. <span style="width:36px;"></span>) on the right
 *      side with a home <a class="icon-btn home-btn"> that navigates back to
 *      mockups/index.html, preserving the current ?theme= query.
 *
 * Skip rules:
 *   - Page is mockups/index.html (it already owns the global header).
 *   - <body data-shell="off"> opt-out.
 *
 * Vanilla JS, no dependencies. Works alongside theme-switcher.js (load order
 * irrelevant: this script reads/writes the same `data-theme` attribute and
 * delegates persistence to window.ajaMentorTheme when available).
 */
(function () {
  var THEMES = [
    { key: 'mentoring',  label: 'Mentoring DS', swatch: '#ff6b00' },
    { key: 'academic',   label: 'Academic',     swatch: '#2e4057' },
    { key: 'editorial',  label: 'Editorial',    swatch: '#5b3a8c' },
    { key: 'seoul-grad', label: 'Seoul Grad',   swatch: '#0b4d3a' },
    { key: 'warmth',     label: 'Warmth',       swatch: '#8b4513' }
  ];
  var DEFAULT_THEME = 'mentoring';

  function currentTheme() {
    if (window.ajaMentorTheme && typeof window.ajaMentorTheme.get === 'function') {
      return window.ajaMentorTheme.get();
    }
    var attr = document.documentElement.getAttribute('data-theme');
    return attr || DEFAULT_THEME;
  }

  function withTheme(href, theme) {
    if (!href) return href;
    if (!theme) theme = currentTheme();
    if (!theme) return href;
    if (href.indexOf('theme=') !== -1) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    return href + sep + 'theme=' + encodeURIComponent(theme);
  }

  function isIndexPage() {
    var path = window.location.pathname || '';
    if (/\/index\.html$/.test(path)) return true;
    // Treat the mockups directory root (e.g. /mockups/ or /mockups) as index
    // when served by a static server. file:// always exposes index.html so
    // the regex above usually wins; this is a cheap fallback.
    if (/\/mockups\/?$/.test(path)) return true;
    return false;
  }

  /* ---------------- (a) shell header ---------------- */

  // Inline style fallback — shell-header.js works on any HTML file even if
  // components.css is not linked. The selector names match components.css
  // so the canonical SoT remains in that file; this block just guarantees
  // a baseline rendering on pages that omit components.css (e.g. admin/*).
  var SHELL_CSS = [
    '.mockup-shell-header{position:sticky;top:0;left:0;right:0;z-index:50;',
    'background:var(--color-surface);border-bottom:1px solid var(--color-border);',
    'padding:14px 32px;display:flex;align-items:center;gap:24px;',
    'backdrop-filter:blur(12px);overflow-x:auto;scrollbar-width:thin;white-space:nowrap;}',
    '.mockup-shell-brand{font:700 15px/1 var(--font-family);color:var(--color-text);',
    'letter-spacing:var(--tracking-normal);padding-right:16px;',
    'border-right:1px solid var(--color-border);text-decoration:none;',
    'display:inline-flex;align-items:center;flex-shrink:0;}',
    '.mockup-shell-brand:hover{opacity:.9;}',
    '.mockup-shell-mark{display:inline-block;width:22px;height:22px;',
    'border-radius:var(--radius-sm);background:var(--color-primary);',
    'color:var(--color-text-on-primary);text-align:center;line-height:22px;',
    'font-weight:900;margin-right:8px;vertical-align:middle;}',
    '.mockup-shell-label{font:600 11px/1 var(--font-family);',
    'color:var(--color-text-weak);text-transform:uppercase;letter-spacing:.4px;flex-shrink:0;}',
    '.mockup-shell-options{display:flex;gap:8px;flex:1;min-width:0;}',
    '.mockup-shell-btn{display:inline-flex;align-items:center;gap:8px;',
    'padding:6px 12px 6px 8px;border-radius:var(--radius-full);',
    'border:1px solid var(--color-border);background:var(--color-surface);',
    'font:500 13px/1 var(--font-family);color:var(--color-text);',
    'letter-spacing:var(--tracking-tight);cursor:pointer;transition:all 120ms ease;flex-shrink:0;}',
    '.mockup-shell-btn:hover{border-color:var(--color-text);transform:translateY(-1px);}',
    '.mockup-shell-btn.is-active{background:var(--color-text);',
    'border-color:var(--color-text);color:var(--color-surface);}',
    '.mockup-shell-swatch{display:inline-block;width:18px;height:18px;border-radius:50%;}',
    '.mockup-shell-url-hint{font:var(--font-caption);color:var(--color-text-weak);',
    'letter-spacing:var(--tracking-tight);white-space:nowrap;flex-shrink:0;}',
    '.mockup-shell-url-hint code{background:var(--color-surface-subtle);',
    'padding:2px 6px;border-radius:3px;font-family:"JetBrains Mono",ui-monospace,monospace;',
    'font-size:11px;}'
  ].join('');

  function injectShellStyles() {
    if (document.getElementById('mockup-shell-header-styles')) return;
    var style = document.createElement('style');
    style.id = 'mockup-shell-header-styles';
    style.textContent = SHELL_CSS;
    document.head.appendChild(style);
  }

  function buildShellHeader(theme) {
    var header = document.createElement('div');
    header.className = 'mockup-shell-header';
    header.setAttribute('role', 'banner');

    var brand = document.createElement('a');
    brand.className = 'mockup-shell-brand';
    brand.href = withTheme('./index.html', theme);
    brand.innerHTML = '<span class="mockup-shell-mark">A</span>AjaMentor';
    header.appendChild(brand);

    var label = document.createElement('span');
    label.className = 'mockup-shell-label';
    label.textContent = 'Theme';
    header.appendChild(label);

    var options = document.createElement('div');
    options.className = 'mockup-shell-options';

    THEMES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mockup-shell-btn';
      btn.setAttribute('data-theme-key', t.key);
      if (t.key === theme) btn.classList.add('is-active');
      btn.innerHTML =
        '<span class="mockup-shell-swatch" style="background:' + t.swatch + ';"></span>' +
        t.label;
      btn.addEventListener('click', function () {
        switchTheme(t.key);
      });
      options.appendChild(btn);
    });
    header.appendChild(options);

    var hint = document.createElement('span');
    hint.className = 'mockup-shell-url-hint';
    hint.innerHTML = 'URL: <code>?theme=' + escapeHtml(theme) + '</code>';
    header.appendChild(hint);

    return header;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Brand link — also keep theme up to date when href is constructed at click time.
  function bindBrandThemeOnClick(brand) {
    brand.addEventListener('click', function (e) {
      // Allow modifier-clicks / middle-click default behavior.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      // Always use the current theme at click time to avoid stale hrefs.
      var t = currentTheme();
      brand.setAttribute('href', withTheme('./index.html', t));
    });
  }

  function switchTheme(theme) {
    // Rewrite the URL query so a reload preserves the choice and behaves
    // exactly like clicking the dock chips on index.html. theme-switcher.js
    // will pick it back up on the next load via URLSearchParams.
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('theme', theme);
      window.location.href = url.toString();
    } catch (e) {
      // Fallback: simple string append.
      var sep = window.location.search ? '&' : '?';
      var clean = window.location.search.replace(/([?&])theme=[^&]*/g, '').replace(/^&/, '?');
      window.location.search = (clean ? clean + sep : '?') + 'theme=' + encodeURIComponent(theme);
    }
  }

  function injectShellHeader() {
    if (document.querySelector('.mockup-shell-header')) return; // already injected
    injectShellStyles();
    var theme = currentTheme();
    var header = buildShellHeader(theme);
    document.body.insertBefore(header, document.body.firstChild);
    var brand = header.querySelector('.mockup-shell-brand');
    if (brand) bindBrandThemeOnClick(brand);
  }

  /* ---------------- (b) app-bar home button ---------------- */

  function homeButton(theme) {
    var a = document.createElement('a');
    a.className = 'icon-btn home-btn';
    a.setAttribute('aria-label', '홈');
    a.href = withTheme('../index.html', theme);
    a.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 12 L12 3 L21 12"/>' +
      '<path d="M5 10v10h14V10"/>' +
      '</svg>';
    a.style.cursor = 'pointer';
    // Re-resolve theme at click time so chip switches inside the page are honored.
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      a.setAttribute('href', withTheme('../index.html', currentTheme()));
    });
    return a;
  }

  function isSpacer36(el) {
    if (!el || el.tagName !== 'SPAN') return false;
    // Must be empty (no children, no text). Spacers in this codebase are
    // always <span style="width:36px;"></span>, never carry content.
    if (el.children.length || el.textContent.trim()) return false;
    // Inline style width:36px (whitespace-tolerant). This is the only
    // signal we trust — class-based / computed width matching risks
    // hijacking unrelated 36px spans (e.g. .icon-btn placeholders).
    var style = (el.getAttribute('style') || '').replace(/\s+/g, '');
    return /(^|;)width:36px/.test(style);
  }

  function transformAppBars() {
    var bars = document.querySelectorAll('.app-bar');
    bars.forEach(function (bar) {
      // Look for the 36px spacer that balances the back button (last child by convention).
      var candidates = bar.querySelectorAll('span');
      var replaced = false;
      candidates.forEach(function (sp) {
        if (replaced) return;
        if (isSpacer36(sp)) {
          var btn = homeButton(currentTheme());
          sp.parentNode.replaceChild(btn, sp);
          replaced = true;
        }
      });
    });
  }

  /* ---------------- init ---------------- */

  function init() {
    if (isIndexPage()) return;
    if (document.body && document.body.getAttribute('data-shell') === 'off') return;
    if (!document.body) return;

    injectShellHeader();
    transformAppBars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
