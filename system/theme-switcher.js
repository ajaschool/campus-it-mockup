/**
 * AjaMentor Theme Switcher
 *
 * Reads URL parameter ?theme=<key> and sets <html data-theme="...">
 * Valid themes: mentoring (default) · academic · editorial · seoul-grad · warmth
 *
 * Fallback: localStorage key 'ajamentor-theme'
 */
(function () {
  var VALID_THEMES = ['mentoring', 'academic', 'editorial', 'seoul-grad', 'warmth'];
  var DEFAULT_THEME = 'mentoring';
  var STORAGE_KEY = 'ajamentor-theme';

  function applyTheme(theme) {
    if (!VALID_THEMES.includes(theme)) theme = DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', theme);
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var urlTheme = params.get('theme');

    // Priority: URL param > localStorage > default
    var theme;
    if (urlTheme) {
      theme = urlTheme;
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    } else {
      try { theme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch (e) { theme = DEFAULT_THEME; }
    }

    applyTheme(theme);
  }

  // Run immediately (script should be loaded early)
  init();

  // Expose global helper for programmatic switching
  window.ajaMentorTheme = {
    set: function (theme) {
      applyTheme(theme);
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    },
    get: function () {
      return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    },
    list: VALID_THEMES.slice()
  };
})();
