/**
 * AjaMentor Docs Viewer
 *
 * Click "기획문서 보기" → password gate (SHA-256) → docs/ listing + markdown render.
 *
 * Security note:
 *   This is a soft gate, not real security. The password hash and the docs are
 *   both shipped as static assets — anyone with browser DevTools can bypass it.
 *   The intent is "no casual peeking by visitors", since the same docs are
 *   plain .md in the public mirror repo and reachable by raw URL.
 *
 * Hosting requirement:
 *   The mockups GitHub Pages mirror MUST also include the `docs/` folder at
 *   the repo root (sibling to `mockups/`) so `../docs/<file>.md` fetches
 *   succeed. If only `mockups/` is mirrored, the viewer will show 404s.
 */
(function () {
  var PASSWORD_SHA256 =
    '6aa5159812698f2f579cfe72caa603a9201671c2b335e2683ed8077429a57fc6';
  var STORAGE_KEY = 'aja-mockup-docs-unlocked';
  var MANIFEST_URL_REL = 'system/docs-manifest.json';
  var MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
  var MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';

  var state = {
    manifest: null,
    activeFile: null,
    markedReady: false,
    mermaidReady: false,
    docsRoot: null
  };

  /* ---------------- public API ---------------- */

  window.ajaDocsViewer = {
    open: openViewer,
    reset: function () {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };

  /* ---------------- styles ---------------- */

  var STYLES = [
    '.docs-overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,17,21,0.55);',
    'display:flex;align-items:center;justify-content:center;padding:24px;',
    'backdrop-filter:blur(4px);}',
    '.docs-modal{background:var(--color-surface,#fff);color:var(--color-text,#111);',
    'border-radius:var(--radius-lg,12px);width:100%;max-width:1100px;height:88vh;',
    'display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 20px 60px rgba(0,0,0,0.3);}',
    '.docs-modal-head{display:flex;align-items:center;justify-content:space-between;',
    'padding:14px 20px;border-bottom:1px solid var(--color-border,#e5e7eb);',
    'background:var(--color-surface,#fff);flex-shrink:0;}',
    '.docs-modal-title{font:700 16px/1.2 var(--font-family,system-ui);',
    'color:var(--color-text,#111);margin:0;display:flex;align-items:center;gap:10px;}',
    '.docs-modal-title small{font:500 12px/1.2 var(--font-family,system-ui);',
    'color:var(--color-text-weak,#6b7280);}',
    '.docs-close{appearance:none;border:none;background:transparent;cursor:pointer;',
    'width:32px;height:32px;border-radius:6px;color:var(--color-text-weak,#6b7280);',
    'display:inline-flex;align-items:center;justify-content:center;font-size:22px;}',
    '.docs-close:hover{background:var(--color-surface-subtle,#f3f4f6);',
    'color:var(--color-text,#111);}',
    '.docs-modal-body{display:flex;flex:1;min-height:0;}',
    '.docs-sidebar{width:280px;flex-shrink:0;border-right:1px solid var(--color-border,#e5e7eb);',
    'overflow-y:auto;padding:14px 8px;background:var(--color-surface-subtle,#fafafa);}',
    '.docs-sidebar h4{font:700 11px/1 var(--font-family,system-ui);',
    'color:var(--color-text-weak,#6b7280);text-transform:uppercase;letter-spacing:.6px;',
    'margin:14px 12px 8px;}',
    '.docs-sidebar h4:first-child{margin-top:4px;}',
    '.docs-sidebar a{display:block;padding:8px 12px;border-radius:6px;cursor:pointer;',
    'text-decoration:none;color:var(--color-text,#111);font:500 13px/1.4 var(--font-family,system-ui);',
    'letter-spacing:var(--tracking-tight,-.005em);transition:background 120ms ease;}',
    '.docs-sidebar a:hover{background:var(--color-surface,#fff);}',
    '.docs-sidebar a.is-active{background:var(--color-primary,#ff6b00);',
    'color:var(--color-text-on-primary,#fff);}',
    '.docs-content{flex:1;min-width:0;overflow-y:auto;padding:28px 36px;',
    'background:var(--color-surface,#fff);}',
    '.docs-content.is-empty{display:flex;align-items:center;justify-content:center;',
    'color:var(--color-text-weak,#6b7280);font:500 14px/1.5 var(--font-family,system-ui);}',
    '.docs-content.is-loading{color:var(--color-text-weak,#6b7280);font:500 14px/1.5 var(--font-family,system-ui);}',
    /* markdown content typography (scoped) */
    '.docs-md{max-width:760px;margin:0 auto;font:400 15px/1.7 var(--font-family,system-ui);',
    'color:var(--color-text,#111);}',
    '.docs-md h1{font:800 28px/1.3 var(--font-family,system-ui);margin:0 0 18px;',
    'padding-bottom:12px;border-bottom:1px solid var(--color-border,#e5e7eb);letter-spacing:-.01em;}',
    '.docs-md h2{font:700 22px/1.3 var(--font-family,system-ui);margin:28px 0 12px;letter-spacing:-.01em;}',
    '.docs-md h3{font:700 18px/1.3 var(--font-family,system-ui);margin:24px 0 10px;}',
    '.docs-md h4{font:700 15px/1.3 var(--font-family,system-ui);margin:18px 0 8px;}',
    '.docs-md p{margin:0 0 14px;}',
    '.docs-md ul,.docs-md ol{margin:0 0 14px;padding-left:24px;}',
    '.docs-md li{margin:4px 0;}',
    '.docs-md code{background:var(--color-surface-subtle,#f3f4f6);padding:2px 6px;border-radius:4px;',
    'font:400 13px/1.5 "JetBrains Mono",ui-monospace,monospace;color:var(--color-text,#111);}',
    '.docs-md pre{background:var(--color-surface-subtle,#f3f4f6);padding:14px 16px;border-radius:8px;',
    'overflow-x:auto;margin:0 0 14px;border:1px solid var(--color-border,#e5e7eb);}',
    '.docs-md pre code{background:transparent;padding:0;font-size:13px;line-height:1.6;}',
    '.docs-md table{border-collapse:collapse;margin:0 0 14px;width:100%;font-size:14px;}',
    '.docs-md th,.docs-md td{border:1px solid var(--color-border,#e5e7eb);padding:8px 12px;text-align:left;}',
    '.docs-md th{background:var(--color-surface-subtle,#f3f4f6);font-weight:700;}',
    '.docs-md blockquote{margin:0 0 14px;padding:8px 16px;border-left:3px solid var(--color-primary,#ff6b00);',
    'background:var(--color-surface-subtle,#f3f4f6);color:var(--color-text-weak,#374151);}',
    '.docs-md a{color:var(--color-primary,#ff6b00);text-decoration:underline;}',
    '.docs-md hr{border:none;border-top:1px solid var(--color-border,#e5e7eb);margin:24px 0;}',
    '.docs-md img{max-width:100%;height:auto;}',
    '.docs-md .mermaid{background:var(--color-surface,#fff);padding:12px;border-radius:8px;',
    'border:1px solid var(--color-border,#e5e7eb);margin:0 0 14px;text-align:center;}',
    /* gate */
    '.docs-gate{background:var(--color-surface,#fff);color:var(--color-text,#111);',
    'border-radius:var(--radius-lg,12px);width:100%;max-width:420px;padding:28px;',
    'box-shadow:0 20px 60px rgba(0,0,0,0.3);}',
    '.docs-gate h3{font:700 18px/1.3 var(--font-family,system-ui);margin:0 0 8px;}',
    '.docs-gate p{font:400 13px/1.6 var(--font-family,system-ui);color:var(--color-text-weak,#6b7280);',
    'margin:0 0 18px;}',
    '.docs-gate input{width:100%;padding:12px 14px;border:1px solid var(--color-border,#e5e7eb);',
    'border-radius:8px;font:500 14px/1.4 var(--font-family,system-ui);background:var(--color-surface,#fff);',
    'color:var(--color-text,#111);box-sizing:border-box;outline:none;}',
    '.docs-gate input:focus{border-color:var(--color-primary,#ff6b00);}',
    '.docs-gate-error{color:#dc2626;font:500 12px/1.4 var(--font-family,system-ui);',
    'margin:8px 0 0;min-height:16px;}',
    '.docs-gate-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}',
    '.docs-gate-actions button{appearance:none;border:none;cursor:pointer;',
    'padding:10px 16px;border-radius:8px;font:600 13px/1 var(--font-family,system-ui);}',
    '.docs-gate-cancel{background:transparent;color:var(--color-text-weak,#6b7280);}',
    '.docs-gate-cancel:hover{color:var(--color-text,#111);}',
    '.docs-gate-submit{background:var(--color-primary,#ff6b00);color:var(--color-text-on-primary,#fff);}',
    '.docs-gate-submit:hover{filter:brightness(0.95);}',
    /* responsive */
    '@media (max-width: 720px){',
    '.docs-modal{height:100vh;border-radius:0;}',
    '.docs-modal-body{flex-direction:column;}',
    '.docs-sidebar{width:100%;max-height:160px;border-right:none;',
    'border-bottom:1px solid var(--color-border,#e5e7eb);}',
    '.docs-content{padding:18px 16px;}',
    '}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('aja-docs-viewer-styles')) return;
    var s = document.createElement('style');
    s.id = 'aja-docs-viewer-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  /* ---------------- gate ---------------- */

  function isUnlocked() {
    try { return sessionStorage.getItem(STORAGE_KEY) === '1'; }
    catch (e) { return false; }
  }
  function markUnlocked() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  async function sha256Hex(input) {
    var enc = new TextEncoder().encode(input);
    var hash = await crypto.subtle.digest('SHA-256', enc);
    var bytes = new Uint8Array(hash);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  function showGate(onPass) {
    injectStyles();
    var overlay = document.createElement('div');
    overlay.className = 'docs-overlay';
    overlay.innerHTML =
      '<div class="docs-gate" role="dialog" aria-modal="true" aria-labelledby="docs-gate-title">' +
        '<h3 id="docs-gate-title">기획문서 열람</h3>' +
        '<p>암호를 입력하세요. 마케팅팀과 사전 공유된 암호입니다.</p>' +
        '<input type="password" placeholder="암호" autocomplete="off" autofocus />' +
        '<p class="docs-gate-error" role="alert"></p>' +
        '<div class="docs-gate-actions">' +
          '<button type="button" class="docs-gate-cancel">취소</button>' +
          '<button type="button" class="docs-gate-submit">확인</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = overlay.querySelector('input');
    var err = overlay.querySelector('.docs-gate-error');
    var submit = overlay.querySelector('.docs-gate-submit');
    var cancel = overlay.querySelector('.docs-gate-cancel');

    function close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'Enter') submit.click();
    }
    document.addEventListener('keydown', onKey);

    cancel.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    submit.addEventListener('click', async function () {
      var v = (input.value || '').trim();
      if (!v) { err.textContent = '암호를 입력하세요.'; return; }
      try {
        var hex = await sha256Hex(v);
        if (hex === PASSWORD_SHA256) {
          markUnlocked();
          close();
          onPass();
        } else {
          err.textContent = '암호가 일치하지 않습니다.';
          input.select();
        }
      } catch (e) {
        err.textContent = '브라우저가 SHA-256 을 지원하지 않습니다.';
      }
    });

    setTimeout(function () { input.focus(); }, 30);
  }

  /* ---------------- viewer ---------------- */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = function () { resolve(); };
      el.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(el);
    });
  }

  async function ensureMarked() {
    if (state.markedReady && window.marked) return;
    if (!window.marked) await loadScript(MARKED_CDN);
    window.marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });
    state.markedReady = true;
  }

  async function ensureMermaid() {
    if (state.mermaidReady && window.mermaid) return;
    if (!window.mermaid) {
      try { await loadScript(MERMAID_CDN); } catch (e) { return; /* mermaid optional */ }
    }
    if (window.mermaid && typeof window.mermaid.initialize === 'function') {
      window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
      state.mermaidReady = true;
    }
  }

  function manifestUrl() {
    // resolve relative to the page that loaded this script
    var scriptEl = document.currentScript ||
      Array.prototype.find.call(document.scripts, function (s) {
        return s.src && /docs-viewer\.js/.test(s.src);
      });
    if (scriptEl && scriptEl.src) {
      return new URL(MANIFEST_URL_REL.replace('system/', ''), scriptEl.src).href;
    }
    return MANIFEST_URL_REL; // fallback
  }

  async function loadManifest() {
    if (state.manifest) return state.manifest;
    var url = manifestUrl();
    var res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest fetch failed: ' + res.status);
    state.manifest = await res.json();
    return state.manifest;
  }

  function getScriptUrl() {
    var scriptEl = Array.prototype.find.call(document.scripts, function (s) {
      return s.src && /docs-viewer\.js/.test(s.src);
    });
    return scriptEl ? scriptEl.src : window.location.href;
  }

  // Two valid layouts:
  //   (A) Local dev — aja-mentoring/mockups/system/...  →  docs/ is at ../../docs/
  //   (B) Mirror     — campus-it-mockup/system/...       →  docs/ is at ../docs/
  async function detectDocsRoot() {
    if (state.docsRoot) return state.docsRoot;
    var systemUrl = getScriptUrl();
    var candidates = [
      new URL('../../docs/', systemUrl), // local dev
      new URL('../docs/', systemUrl)     // gh-pages mirror
    ];
    for (var i = 0; i < candidates.length; i++) {
      try {
        var probe = await fetch(candidates[i].href + 'README.md', { cache: 'no-store' });
        if (probe.ok) { state.docsRoot = candidates[i]; return state.docsRoot; }
      } catch (e) { /* try next */ }
    }
    state.docsRoot = candidates[0]; // fallback (will surface 404 in renderDoc)
    return state.docsRoot;
  }

  async function fetchDoc(file) {
    var docsRoot = await detectDocsRoot();
    var url = new URL(file, docsRoot).href;
    var res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('doc fetch failed: ' + res.status + ' (' + url + ')');
    return await res.text();
  }

  function buildSidebar(manifest, container, onSelect) {
    container.innerHTML = '';
    manifest.groups.forEach(function (group) {
      var h = document.createElement('h4');
      h.textContent = group.label;
      container.appendChild(h);
      group.items.forEach(function (item) {
        var a = document.createElement('a');
        a.textContent = item.label;
        a.setAttribute('data-file', item.file);
        a.addEventListener('click', function (e) {
          e.preventDefault();
          onSelect(item);
        });
        container.appendChild(a);
      });
    });
  }

  function highlightActive(sidebar, file) {
    var links = sidebar.querySelectorAll('a');
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-file') === file);
    });
  }

  async function renderDoc(file, contentEl) {
    contentEl.classList.remove('is-empty');
    contentEl.classList.add('is-loading');
    contentEl.innerHTML = '문서를 불러오는 중…';
    try {
      await ensureMarked();
      var raw = await fetchDoc(file);
      var html = window.marked.parse(raw);
      contentEl.classList.remove('is-loading');
      contentEl.innerHTML = '<article class="docs-md">' + html + '</article>';
      // mermaid blocks: marked emits <pre><code class="language-mermaid">...
      var mermaidBlocks = contentEl.querySelectorAll('pre code.language-mermaid');
      if (mermaidBlocks.length) {
        await ensureMermaid();
        if (state.mermaidReady) {
          mermaidBlocks.forEach(function (code, idx) {
            var pre = code.parentElement;
            var div = document.createElement('div');
            div.className = 'mermaid';
            div.id = 'mermaid-' + Date.now() + '-' + idx;
            div.textContent = code.textContent;
            pre.parentElement.replaceChild(div, pre);
          });
          try { await window.mermaid.run({ querySelector: '.docs-md .mermaid' }); }
          catch (e) { /* mermaid render errors stay inline as code */ }
        }
      }
      // anchor links: keep inside the modal scope
      var anchors = contentEl.querySelectorAll('a[href^="./"], a[href^="../"]');
      anchors.forEach(function (a) {
        var href = a.getAttribute('href');
        // intercept ./xx.md and ../docs/xx.md style internal links
        var mdMatch = href.match(/(?:^|\/)([^\/]+\.md)(?:#.*)?$/);
        if (mdMatch) {
          a.addEventListener('click', function (e) {
            e.preventDefault();
            var nextFile = mdMatch[1];
            var sidebar = document.querySelector('.docs-sidebar');
            var link = sidebar && sidebar.querySelector('a[data-file="' + nextFile + '"]');
            if (link) link.click();
          });
        }
      });
      contentEl.scrollTop = 0;
    } catch (e) {
      contentEl.classList.remove('is-loading');
      contentEl.innerHTML =
        '<article class="docs-md"><h2>불러오기 실패</h2><p>' +
        escapeHtml(e.message) +
        '</p><p style="font-size:13px;color:#6b7280;">GitHub Pages 미러에 <code>docs/</code> 폴더가 함께 동기화되어 있는지 확인하세요.</p></article>';
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  async function showViewer() {
    injectStyles();
    var overlay = document.createElement('div');
    overlay.className = 'docs-overlay';
    overlay.innerHTML =
      '<div class="docs-modal" role="dialog" aria-modal="true" aria-labelledby="docs-modal-title">' +
        '<header class="docs-modal-head">' +
          '<h2 class="docs-modal-title" id="docs-modal-title">기획문서 <small>PRD · 마케팅팀 공유용</small></h2>' +
          '<button type="button" class="docs-close" aria-label="닫기">&times;</button>' +
        '</header>' +
        '<div class="docs-modal-body">' +
          '<nav class="docs-sidebar" aria-label="문서 목록"></nav>' +
          '<section class="docs-content is-empty">왼쪽에서 문서를 선택하세요.</section>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.docs-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    var sidebar = overlay.querySelector('.docs-sidebar');
    var content = overlay.querySelector('.docs-content');

    try {
      var m = await loadManifest();
      buildSidebar(m, sidebar, function (item) {
        state.activeFile = item.file;
        highlightActive(sidebar, item.file);
        renderDoc(item.file, content);
      });
      // auto-select first item (README)
      var firstLink = sidebar.querySelector('a');
      if (firstLink) firstLink.click();
    } catch (e) {
      content.classList.remove('is-empty');
      content.innerHTML =
        '<article class="docs-md"><h2>목록을 불러올 수 없습니다</h2><p>' +
        escapeHtml(e.message) + '</p></article>';
    }
  }

  function openViewer() {
    if (isUnlocked()) {
      showViewer();
    } else {
      showGate(showViewer);
    }
  }
})();
