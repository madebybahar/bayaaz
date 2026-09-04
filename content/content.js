'use strict';

// Shared Turndown instance
const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',   // use * not _ — prevents orphaned _ artifacts (Substack bug)
});
td.remove(['script', 'style', 'noscript', 'iframe', 'button', 'nav', 'aside',
           'img', 'figure', 'picture',  // strip images — prevents ![]() link clutter (X bug)
           'u']);                        // strip underline — prevents _ artifacts

// ── Links: drop the title attribute at the source ─────────────────────────────
// Turndown's default anchor rule emits [text](url "title"). A title containing
// parentheses (e.g. MDN's WCAG links) derails the sidebar's inline-link regexes:
// the link is lost and a stray `")` leaks into the card. Titles carry no value
// for clips — always emit plain [text](url). Icon-only/empty anchors → dropped.
td.addRule('linkNoTitle', {
  filter: (node) => node.nodeName === 'A' && node.getAttribute('href'),
  replacement: (content, node) => {
    if (!content.trim()) return '';
    let href = node.getAttribute('href');
    // Resolve relative hrefs (/en-US/docs/…, ../page, //host/path) against the
    // page URL — stored clips must carry absolute links, or the sidebar renderer
    // drops them to plain text and exported .md links are dead in Obsidian.
    // In-page #anchors never become links — they are dead outside the page
    // (openspec: strip-citation-anchors, her find on viwiki 2026-07-27):
    //  · citation markers ([4]-style bracketed text, or any <sup> ref) vanish whole;
    //  · other in-page anchors (heading/TOC links) unwrap to plain text.
    // Note: Turndown has already escaped brackets in `content` (\[4\]) — match both forms.
    if (href[0] === '#') {
      const t = content.trim();
      const bracketed = /^\\?\[[^\[\]]{1,20}\\?\]$/.test(t);
      const inSup = typeof node.closest === 'function' && node.closest('sup');
      if (bracketed || inSup) return '';
      return content;
    }
    try { href = new URL(href, location.href).href; } catch (_) { /* malformed → keep raw */ }
    return `[${content}](${href.replace(/([()])/g, '\\$1')})`;
  },
});


let sidebarOpen = false;
let lastSentText = '';
let cachedMd = ''; // last extracted Markdown, used by right-click context menu

// ── Sidebar state sync ────────────────────────────────────────────────────────
chrome.runtime.sendMessage({ type: 'GET_SIDEBAR_STATE' })
  .then((res) => { if (res) sidebarOpen = res.isOpen; })
  .catch(() => {});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Liveness probe from the service worker before re-injection (onInstalled).
  // Orphaned copies from a previous extension instance can't answer — only a
  // live script replies, which tells the worker to skip injecting this tab.
  if (message.type === 'PING') {
    sendResponse({ pong: true });
    return;
  }

  // Sidebar deleted a card / cleared — free the passage for immediate re-clip.
  if (message.type === 'RESET_CLIP_DEDUP') {
    lastSentText = '';
    return;
  }

  if (message.type === 'SIDEBAR_STATE') {
    sidebarOpen = message.isOpen;
    // Sidebar closed → its in-memory fragment list is gone. Clear the dedup guard so the
    // same passage can be clipped again into a fresh sidebar (otherwise dispatch() would
    // silently drop the re-clip because text === lastSentText, leaving an empty sidebar).
    if (!message.isOpen) lastSentText = '';
  }

  if (message.type === 'CLIP_CACHED_SELECTION') {
    // Sidebar is definitely opening — enable auto-clip regardless of whether
    // we find text to dispatch right now.
    sidebarOpen = true;
    // Try live selection markdown first (right-click preserves selection on most pages)
    const sel = window.getSelection();
    let text = '';
    if (sel && sel.rangeCount > 0) {
      try { const r = sel.getRangeAt(0); text = fragmentToMarkdown(r.cloneContents(), r); } catch (_) {}
    }
    // Shadow-recovered range (MDN-style shadow code blocks) before degrading.
    if (!text && sel) {
      const sr = composedShadowRange(sel);
      if (sr) { try { text = fragmentToMarkdown(sr.cloneContents(), sr); } catch (_) {} }
    }
    // cachedMd was set by the mouseup handler via fragmentToMarkdown — prefer it
    // over sel.toString() (plain text) so that markdown formatting is preserved.
    if (!text) text = cachedMd;
    // Last resort: plain text from live selection (fenced if it's code)
    if (!text && sel && sel.rangeCount > 0) {
      const t = sel.toString();
      if (t.trim()) {
        const ctx = codeContextOf(sel);
        text = ctx.code ? fencePlainCode(t, ctx.lang) : t.trim();
      }
    }
    if (text) {
      dispatch(text);
    }
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function getArticleMeta() {
  // Title = the page's main content heading. On app-shell sites the FIRST DOM
  // <h1> is page chrome, not content: GitHub's global search box renders
  // <h1>Search code, repositories, users, issues, pull requests…</h1>, and news
  // sites often lead with a section/nav heading. So: prefer an <h1> inside the
  // content region (article/main/[role=main]) that is NOT inside chrome
  // (search/nav/header/footer/form/aside); then fall back to og:title, then
  // document.title. (Prior code took document.querySelector('h1') outright.)
  const scope = document.querySelector('article, main, [role="main"]') || document;
  let title = '';
  for (const h of scope.querySelectorAll('h1')) {
    if (h.closest('[role="search"], nav, header, footer, form, aside')) continue;
    const t = h.textContent.trim().replace(/^#+\s*/, '');
    if (t) { title = t; break; }
  }
  if (!title) {
    const meta = document.querySelector(
      'meta[property="og:title"], meta[name="twitter:title"]');
    title = (meta && meta.content || '').trim();
  }
  if (!title) title = (document.title || '').trim();
  return {
    title: title.replace(/^#+\s*/, ''),  // strip accidental leading # (X/Twitter bug)
    url: location.href,
  };
}

// Remove decorative heading anchors added by CMSs (Ghost, Notion, GitHub, etc.)
// Matches <a href="#..."> whose text is #  ¶  §  link  or empty — pure decoration.
function stripAnchorLinks(el) {
  el.querySelectorAll('a[href^="#"]').forEach(function (a) {
    const text = a.textContent.trim();
    if (!text || /^[#¶§]$/.test(text) || text.toLowerCase() === 'link') {
      a.remove();
    }
  });
}

// ── Platform-specific DOM normalisation ───────────────────────────────────────
// Runs on the cloned wrapper BEFORE Turndown, so fixes are scoped and don't
// affect other sites.
function preprocessForPlatform(wrapper) {
  const host = location.hostname;

  // ── Twitter / X ───────────────────────────────────────────────────────────
  if (host.includes('twitter.com') || host.includes('x.com')) {
    // Remove visually-hidden spans used for image alt text & accessibility labels
    // e.g. <span aria-hidden="true"> duplicates visible text; causes phantom lines
    wrapper.querySelectorAll('span[aria-hidden="true"]').forEach(el => el.remove());
    // Remove media containers (photos, cards) — their alt text leaks as text nodes
    wrapper.querySelectorAll([
      '[data-testid="tweetPhoto"]',
      '[data-testid="card.layoutSmall.media"]',
      '[data-testid="card.layoutLarge.media"]',
    ].join(',')).forEach(el => el.remove());
    // Remove empty block elements that cause extra blank lines
    wrapper.querySelectorAll('div:empty, p:empty').forEach(el => el.remove());
  }

  // ── WeChat (mp.weixin.qq.com) ─────────────────────────────────────────────
  if (host.includes('mp.weixin.qq.com')) {
    // WeChat uses <ul>/<ol> + <section> instead of <li>.
    // Normalise to standard <li> so Turndown produces correct list Markdown.
    ['ul', 'ol'].forEach(tag => {
      wrapper.querySelectorAll(`${tag} > section`).forEach(section => {
        const li = document.createElement('li');
        li.innerHTML = section.innerHTML;
        section.replaceWith(li);
      });
    });
    // Remove WeChat's decorative rich-media wrappers that add noise
    wrapper.querySelectorAll('mpvoice, mp-common-profile').forEach(el => el.remove());
  }
}

// ancestorTags: list of block element tag names whose ancestor context should be
// restored when cloneContents() strips the wrapper (e.g. selecting inside <blockquote>
// or <pre> gives a fragment without the outer block, so Turndown loses the semantics).
const RESTORE_ANCESTORS = ['BLOCKQUOTE', 'PRE'];

function fragmentToMarkdown(fragment, range) {
  try {
    const wrapper = document.createElement('div');
    wrapper.appendChild(fragment.cloneNode(true));

    // If the selection sits entirely within a semantic block ancestor that
    // cloneContents() strips, re-wrap the fragment so Turndown sees the correct tag.
    // Only restore the innermost missing ancestor to avoid double-wrapping.
    if (range) {
      let anc = range.commonAncestorContainer;
      if (anc.nodeType === Node.TEXT_NODE) anc = anc.parentElement;
      for (const tag of RESTORE_ANCESTORS) {
        const ancestor = anc && anc.closest && anc.closest(tag.toLowerCase());
        if (ancestor && !wrapper.querySelector(tag.toLowerCase())) {
          const el = document.createElement(tag.toLowerCase());
          let host = el;
          if (tag === 'PRE') {
            // Turndown only emits a fenced block for <pre><code> — restore the
            // inner <code> too, and carry the language hint (language-x / brush: x)
            // so the fence reads ```css and the card can show its corner tag.
            host = document.createElement('code');
            const langSrc = ancestor.querySelector('code') || ancestor;
            const m = (langSrc.className || '').match(/(?:language|lang|brush)[-\s:]+([\w-]+)/i);
            if (m) host.className = 'language-' + m[1].toLowerCase();
            el.appendChild(host);
          }
          while (wrapper.firstChild) host.appendChild(wrapper.firstChild);
          wrapper.appendChild(el);
          break;
        }
      }
    }

    // Orphaned <li> elements — happen when selection boundary cuts through a <ul>/<ol>.
    // cloneContents() keeps the <li>s but drops the parent list tag.
    // Group consecutive orphaned <li>s into a single <ul> so Turndown renders them as a list.
    let orphanBuf = null;
    Array.from(wrapper.childNodes).forEach(function (node) {
      if (node.nodeName === 'LI') {
        if (!orphanBuf) {
          orphanBuf = document.createElement('ul');
          wrapper.insertBefore(orphanBuf, node);
        }
        orphanBuf.appendChild(node);
      } else {
        orphanBuf = null;
      }
    });
    // Promote pre-level language hints onto <code> — Turndown's fenced rule reads
    // only code.className, so MDN-style <pre class="brush: css"><code> otherwise
    // yields a bare ``` fence (no corner tag, no highlight hint). Mirrors the
    // RESTORE_ANCESTORS regex so both capture paths agree (promote-pre-language-hint).
    // Shadow hosts often carry the language while the shadow's pre is bare
    // (<mdn-code-example class="brush: css"> wrapping <pre><code>) — probe the
    // selection's composed host as a fallback source (shadow-code-clip).
    let hostLang = '';
    if (range) {
      let rn = range.commonAncestorContainer;
      if (rn && rn.nodeType === 3) rn = rn.parentElement;
      const rroot = rn && rn.getRootNode && rn.getRootNode();
      if (rroot && rroot.host) {
        const hm = String(rroot.host.className || '').match(/(?:language|lang|brush)[-\s:]+([\w-]+)/i);
        if (hm) hostLang = hm[1].toLowerCase();
      }
    }
    wrapper.querySelectorAll('pre').forEach(function (pre) {
      const code = pre.querySelector('code');
      if (!code || /(?:^|\s)language-[\w-]/.test(code.className || '')) return;
      const m = ((pre.className || '') + ' ' + (code.className || ''))
        .match(/(?:language|lang|brush)[-\s:]+([\w-]+)/i);
      const lang = m ? m[1].toLowerCase() : hostLang;
      if (lang) code.className = ((code.className || '') + ' language-' + lang).trim();
    });

    stripAnchorLinks(wrapper);
    preprocessForPlatform(wrapper);                    // ← platform-specific fixes
    wrapper.querySelectorAll('[data-shadow-content]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-shadow-content');
    });
    let md = td.turndown(wrapper.innerHTML).trim();
    // Collapse 3+ consecutive newlines (Twitter/X excessive spacing)
    md = md.replace(/\n{3,}/g, '\n\n');
    // Remove lines containing only markdown markers (orphaned * _ from empty em/strong)
    md = md.replace(/^[*_]{1,3}\s*$/gm, '');
    return md || wrapper.textContent.trim();
  } catch (e) {
    const tmp = document.createElement('div');
    tmp.appendChild(fragment.cloneNode(true));
    return tmp.textContent.trim();
  }
}

// Content-level dedup key: two capture paths can emit the same passage in
// different dress (fenced vs plain, whitespace variance) — strip fence lines
// and collapse whitespace so format differences can't duplicate a card.
function dedupKey(t) {
  return (t || '').replace(/^\s*(?:```|~~~)[\w-]*\s*$/gm, '').replace(/\s+/g, ' ').trim();
}

function dispatch(text) {
  if (!text || text === lastSentText) return;
  if (lastSentText && dedupKey(text) === dedupKey(lastSentText)) return;
  lastSentText = text;

  const { title, url } = getArticleMeta();

  if (!sidebarOpen) {
    sidebarOpen = true;
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR' }).catch(() => {});
  }

  chrome.runtime.sendMessage({ type: 'ADD_FRAGMENT', text, title, url }).catch(() => {});
}

// ── Shadow-DOM selection recovery (shadow-code-clip) ─────────────────────────
// Chrome re-targets mouse selections living inside shadow DOM to the host
// boundary: getRangeAt() clones empty and the pipeline degrades to plain text.
// (MDN 2026 hydrates code blocks into <mdn-code-example> shadow roots.)

// Candidate elements around the selection endpoints — includes the child at
// anchorOffset, which is where a host-level re-target parks the shadow host.
function selectionCandidates(sel) {
  const cands = [];
  [[sel.anchorNode, sel.anchorOffset], [sel.focusNode, sel.focusOffset]].forEach(function (pair) {
    const n = pair[0], off = pair[1];
    if (!n) return;
    if (n.nodeType === 1) {
      cands.push(n);
      if (n.childNodes[off]) cands.push(n.childNodes[off]);
      if (off > 0 && n.childNodes[off - 1]) cands.push(n.childNodes[off - 1]);
    } else if (n.parentElement) cands.push(n.parentElement);
  });
  return cands.filter(function (c) { return c && c.nodeType === 1; });
}

// Rebuild a real Range inside an open shadow root via getComposedRanges —
// restores partial-selection fidelity for the markdown pipeline.
function composedShadowRange(sel) {
  if (!sel || sel.rangeCount === 0 || typeof sel.getComposedRanges !== 'function') return null;
  for (const el of selectionCandidates(sel)) {
    const sr = el.shadowRoot;
    if (!sr) continue;
    try {
      const crs = sel.getComposedRanges({ shadowRoots: [sr] });
      for (const cr of crs) {
        if (cr.startContainer.getRootNode() !== sr && cr.endContainer.getRootNode() !== sr) continue;
        const r = new Range();
        r.setStart(cr.startContainer, cr.startOffset);
        r.setEnd(cr.endContainer, cr.endOffset);
        if (!r.collapsed) return r;
      }
    } catch (_) { /* closed root or older signature — plain-text fence below */ }
  }
  return null;
}

// Is the selection anchored in a code context? Walks up (piercing shadow
// boundaries via getRootNode().host) looking for pre/code ancestors, code-ish
// custom-element hosts (mdn-code-example), or highlighter containers.
function codeContextOf(sel) {
  const langRe = /(?:language|lang|brush)[-\s:]+([\w-]+)/i;
  for (const start of selectionCandidates(sel)) {
    let cur = start, hops = 0, lang = '', matched = false;
    while (cur && cur.nodeType === 1 && hops++ < 12) {
      const tag = (cur.tagName || '').toLowerCase();
      const cls = typeof cur.className === 'string' ? cur.className : '';
      if (!lang) { const m = cls.match(langRe); if (m) lang = m[1].toLowerCase(); }
      if (!matched && (tag === 'pre' || tag === 'code' || /(^|-)code(-|$)/.test(tag) ||
          /\b(?:highlight|codemirror|shiki|hljs)\b/i.test(cls))) {
        matched = true;
      }
      // Matched but no language yet — keep climbing (e.g. anchor in <code>,
      // language class up on <pre class="brush: css"> or the shadow host).
      if (matched && lang) return { code: true, lang: lang };
      const root = cur.getRootNode && cur.getRootNode();
      cur = cur.parentElement || (root && root.host) || null;
    }
    if (matched) return { code: true, lang: lang };
  }
  return { code: false, lang: '' };
}

// Fence plain text captured from a code context — keeps newlines/indentation.
function fencePlainCode(text, lang) {
  return '```' + (lang || '') + '\n' + text.replace(/^\n+/, '').replace(/\s+$/, '') + '\n```';
}

// ── Selection extraction ──────────────────────────────────────────────────────
function extractSelection(sel, savedRange, savedText) {
  // Try markdown conversion in order: live range → saved range → shadow-recovered
  // range → plain text fallback (fenced when the anchor sits in a code context).
  // Never short-circuit to plain text while a markdown path is still available.
  if (sel && sel.rangeCount > 0) {
    const r = sel.getRangeAt(0);
    const md = fragmentToMarkdown(r.cloneContents(), r);
    if (md) return md;
  }
  if (savedRange) {
    const md = fragmentToMarkdown(savedRange.cloneContents(), savedRange);
    if (md) return md;
  }
  const sr = composedShadowRange(sel);
  if (sr) {
    const md = fragmentToMarkdown(sr.cloneContents(), sr);
    if (md) return md;
  }
  // Plain text only when markdown conversion yielded nothing.
  if (sel && sel.rangeCount > 0) {
    const liveText = sel.toString();
    if (liveText.trim()) {
      const ctx = codeContextOf(sel);
      return ctx.code ? fencePlainCode(liveText, ctx.lang) : liveText.trim();
    }
  }
  return savedText || '';
}

// ── 1. Mouse selection ────────────────────────────────────────────────────────
document.addEventListener('mouseup', function (e) {
  let savedRange = null;
  let savedText = '';
  const selNow = window.getSelection();
  if (selNow && selNow.rangeCount > 0) {
    try { savedRange = selNow.getRangeAt(0).cloneRange(); } catch (_) {}
    savedText = selNow.toString().trim();
  }

  setTimeout(function () {
    const sel = window.getSelection();
    const text = extractSelection(sel, savedRange, savedText);
    if (!text) return;

    cachedMd = text; // always cache for context menu

    if (sidebarOpen) {
      dispatch(text);
    } else {
      // sidebarOpen flag may be stale (e.g. after page navigation or SW restart).
      // Re-query actual state before giving up on auto-clip.
      chrome.runtime.sendMessage({ type: 'GET_SIDEBAR_STATE' })
        .then((res) => {
          if (res && res.isOpen) {
            sidebarOpen = true;
            dispatch(text);
          }
        })
        .catch(() => {});
    }
  }, 50);
}, { capture: true });

// ── 2. Keyboard selection ─────────────────────────────────────────────────────
document.addEventListener('keyup', function (e) {
  if (e.shiftKey || ((e.ctrlKey || e.metaKey) && e.key === 'a')) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    const text = fragmentToMarkdown(r.cloneContents(), r);
    if (!text) return;
    cachedMd = text;
    if (sidebarOpen) {
      dispatch(text);
    } else {
      chrome.runtime.sendMessage({ type: 'GET_SIDEBAR_STATE' })
        .then((res) => { if (res && res.isOpen) { sidebarOpen = true; dispatch(text); } })
        .catch(() => {});
    }
  }
}, { capture: true });

// ── 3. Copy event (Google Docs / canvas apps) ─────────────────────────────────
document.addEventListener('copy', function (e) {
  if (!sidebarOpen) return;
  // A real DOM selection goes through the same pipeline as auto-clip — full
  // markdown fidelity (shadow recovery, code fencing), and an identical result
  // hits dispatch's dedup guard so ⌘C / site Copy buttons don't duplicate the
  // card in a degraded format (MDN double-card bug, 2026-07-10).
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && sel.toString().trim()) {
    const text = extractSelection(sel, null, '');
    if (text) { dispatch(text); return; }
  }
  // Canvas apps expose no readable DOM selection — parse the clipboard payload.
  const html = e.clipboardData && e.clipboardData.getData('text/html');
  if (html && html.trim()) {
    try {
      const md = td.turndown(html).trim();
      dispatch(md || e.clipboardData.getData('text/plain').trim());
      return;
    } catch (_) {}
  }
  const plain = (e.clipboardData && e.clipboardData.getData('text/plain') || '').trim();
  dispatch(plain);
});
