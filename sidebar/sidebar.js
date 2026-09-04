'use strict';

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'parchment', label: 'Parchment',
    swatches: ['#ece0c2', '#f4e8c8', '#8b2929'],
  },
  {
    id: 'ink-black', label: 'Ink Black',
    swatches: ['#1c1612', '#2a241c', '#d8704e'],
  },
];
let currentThemeIdx = 0;

// ── Flyleaf 防闪(openspec: flyleaf-self-highlight)──────────────────────────
// 毕业与否必须在首绘前同步可知,否则 hint 会"先现身再被藏起"闪一下。
// chrome.storage 异步来不及 → 用 localStorage 同步镜像(首演即记时写入)。
// 已毕业:不挂类,老用户扉页瞬时完整,零回归。
try {
  if (!localStorage.getItem('bayaaz_imprint_hint_shown')) {
    document.documentElement.classList.add('flyleaf-pending');
  }
} catch (_) {}

// ── State ─────────────────────────────────────────────────────────────────────
let articleTitle = '';
let articleUrl   = '';
let isFirstFragment = true;
let myTabId = null;  // the web-page tab this sidebar is attached to (for the close handshake)
let myWindowId = null; // the window this panel lives in (panel scope is per-window)

// ── DOM ───────────────────────────────────────────────────────────────────────
const titleInput      = document.getElementById('titleInput');
const paletteBtn      = document.getElementById('paletteBtn');
const themePopover    = document.getElementById('themePopover');
const fragmentList    = document.getElementById('fragmentList');
const emptyState      = document.getElementById('emptyState');
const copyBtn         = document.getElementById('copyBtn');
const copyMenu        = document.getElementById('copyMenu');
const exportBtn       = document.getElementById('exportBtn');
const clearBtn        = document.getElementById('clearBtn');
const excerptCount    = document.getElementById('excerptCount');


// ── Language detection (mirrors export/samplebook.js detectLang) ─────────────
// Four tiers: zh | en | other | rtl. See openspec/changes/multilang-fallback-l2/.
// Order: rtl → cjk(+kana → other, plain → zh) → non-Latin scripts → latin → other.
// Non-Latin scripts (Hangul, Devanagari, Thai, Greek, Cyrillic, kana-only,
// Bengali, Tamil, etc.) MUST be checked BEFORE Latin, because Korean/Hindi/etc.
// text often contains Latin loan-words like "PDF" — letting Latin win would
// misroute the whole paragraph to 'en' and break dropcap/typography.
function detectLang(text) {
  if (!text) return 'en';
  // RTL: Arabic + Hebrew + Arabic Supplement/Extended + Presentation Forms A/B
  if (/[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text)) {
    // Route to RTL only when the RTL script DOMINATES. A single foreign word in
    // otherwise-Latin text (e.g. the product name بیاض inside English copy) must
    // NOT flip the whole passage to right-to-left + Nastaliq. Mostly-Arabic with a
    // Latin loanword still dominates → stays RTL. Strictly better than "any Arabic
    // char → RTL": only mis-flipped Latin-dominant text changes.
    const _ar = (text.match(/[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) || []).length;
    const _la = (text.match(/[A-Za-zÀ-ɏ]/g) || []).length;
    if (_ar >= _la) {
      // Urdu/Persian-specific characters (not in standard Arabic alphabet):
      // ٹ U+0679 … ی U+06CC (Farsi yeh, distinct from Arabic ي U+064A — used for
      // short Urdu titles like بیاض). Triggers Nastaliq for Urdu/Persian/Kurdish.
      if (/[ٹپچڈڑژکگںھےی]/.test(text)) return 'rtl-ur';
      return 'rtl';
    }
    // Latin-dominant → fall through to the en/other checks below.
  }
  // CJK ideographs (Chinese/Japanese/Korean han)
  if (/[一-鿿㐀-䶿]/.test(text)) {
    // Co-occurring kana → Japanese, route to other
    if (/[぀-ゟ゠-ヿㇰ-ㇿ]/.test(text)) return 'other';
    return 'zh';
  }
  // Non-Latin scripts (check BEFORE Latin so Korean/Hindi with "PDF" still routes to other):
  // Hangul, Hangul-compat-jamo, kana-only, Devanagari, Bengali, Gurmukhi,
  // Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam, Thai, Greek, Cyrillic.
  if (/[가-힯㄰-㆏぀-ゟ゠-ヿㇰ-ㇿऀ-ॿঀ-৿਀-੿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ฀-๿Ͱ-ϿЀ-ӿ]/.test(text)) return 'other';
  // Latin (Basic + Extended A/B, covers EN, FR, DE, ES, PT, IT, VI with diacritics)
  if (/[A-zÀ-ɏ]/.test(text)) return 'en';
  return 'other';
}

// Sub-tag within the 'other' tier, used ONLY for per-script line-height tuning
// (ja 2.0 / ko 1.8 / others e.g. Hindi·Thai default 1.9). Kana → ja, Hangul → ko;
// otherwise '' (uses default). Does not affect detectLang's tier routing.
function otherScript(text) {
  if (!text) return '';
  if (/[぀-ゟ゠-ヿㇰ-ㇿ]/.test(text)) return 'ja';
  if (/[가-힣ㄱ-ㆎ가-힯ᄀ-ᇿ]/.test(text)) return 'ko';
  if (/[ऀ-ॿ]/.test(text)) return 'hi'; // Devanagari: for ILREQ letter-spacing reset
  return '';
}

// Title input language tagging — only used to flip direction for RTL scripts
// (Arabic/Urdu). Font stays as system default; cf. design.md note on small-size
// Nastaliq legibility.
function applyTitleLang(v) {
  if (!v) { titleInput.removeAttribute('data-lang'); titleInput.removeAttribute('data-script'); return; }
  const lang = detectLang(v);
  titleInput.dataset.lang = lang;
  // Persian title (rtl-ur, no Urdu-only letters incl. heh-goal ہ) → modern Naskh,
  // matching the card body; Urdu keeps Nastaliq.
  if (lang === 'rtl-ur' && !/[ٹڈڑںھےہ]/.test(v)) titleInput.dataset.script = 'fa';
  else titleInput.removeAttribute('data-script');
}


// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const stored = await chrome.storage.local.get('theme');
  const savedId = stored.theme || 'parchment';
  currentThemeIdx = THEMES.findIndex(t => t.id === savedId);
  if (currentThemeIdx < 0) currentThemeIdx = 0;
  applyTheme(THEMES[currentThemeIdx]);

  paletteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themePopover.classList.contains('open') ? closePopover() : openPopover(paletteBtn);
  });
  document.addEventListener('click', (e) => {
    closePopover();
    if (!copyMenu.hidden && !copyMenu.contains(e.target) && e.target !== copyBtn) {
      copyMenu.hidden = true;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopover();
      copyMenu.hidden = true;
    }
  });

  copyBtn.addEventListener('click', copySmart);
  copyBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    copyMenu.hidden = false;
    copyMenu.querySelector('.copy-menu-item')?.focus();
  });

  copyMenu.addEventListener('click', async (e) => {
    const item = e.target.closest('.copy-menu-item');
    if (!item) return;
    copyMenu.hidden = true;
    try {
      switch (item.dataset.mode) {
        case 'plain':      await navigator.clipboard.writeText(buildPlainText());    break;
        case 'markdown':   await navigator.clipboard.writeText(buildMarkdownCopy()); break;
        case 'quote-only': await navigator.clipboard.writeText(buildQuoteOnly());    break;
      }
      flashSuccess(copyBtn);
    } catch (err) {
      console.warn('[Bayaaz] clipboard write failed:', err);
    }
  });

  exportBtn.addEventListener('click', exportMarkdown);
  clearBtn.addEventListener('click', handleClear);
  titleInput.addEventListener('input', () => applyTitleLang(titleInput.value));

  connectToBackground();

  // Real close: the side-panel document unloads → pagehide fires. The SW's port
  // onDisconnect can't distinguish this from a service-worker idle disconnect, so we
  // signal explicitly here. Carry our tabId (sidebarTabId in the SW may already be
  // nulled by a racing disconnect). Lets the content script disable auto-clip + reset
  // its clip-dedup so the same passage can be re-clipped into a fresh sidebar.
  window.addEventListener('pagehide', () => {
    try { chrome.runtime.sendMessage({ type: 'SIDEBAR_CLOSING', tabId: myTabId, windowId: myWindowId }).catch(() => {}); }
    catch (_) {}
  });
}

// ── Background port (with auto-reconnect) ─────────────────────────────────────
function connectToBackground() {
  const port = chrome.runtime.connect({ name: 'sidebar' });

  port.onMessage.addListener((message) => {
    if (message.type === 'DELIVER_FRAGMENT') {
      handleDeliverFragment(message);
    }
    // Panel is window-scoped: the SW moves the binding to whichever tab the user
    // activates, so export return-focus and dedup targeting follow the reading.
    if (message.type === 'ACTIVE_TAB_CHANGED') {
      myTabId = message.tabId ?? myTabId;
    }
  });

  // Service worker can be killed after ~5 min of inactivity.
  // When it restarts the port disconnects — reconnect so it regains
  // sidebarTabId and can resume notifying the content script.
  port.onDisconnect.addListener(() => {
    setTimeout(connectToBackground, 1000);
  });

  // Tell the service worker which tab and window we belong to
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    myTabId = tabs[0]?.id ?? null;
    myWindowId = tabs[0]?.windowId ?? null;
    port.postMessage({ type: 'SIDEBAR_READY', tabId: myTabId, windowId: myWindowId });
  });
}

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme({ id }) {
  document.documentElement.dataset.theme = id;
  chrome.storage.local.set({ theme: id });
}

// ── Theme popover ─────────────────────────────────────────────────────────────
function buildPopover() {
  themePopover.innerHTML = `
    <div class="theme-popover-h">Themes</div>
    <div class="theme-popover-rule"></div>
  `;
  THEMES.forEach((theme, idx) => {
    const btn = document.createElement('button');
    btn.className = 'theme-item' + (idx === currentThemeIdx ? ' theme-item--active' : '');
    btn.setAttribute('role', 'menuitem');
    const swatchSpans = theme.swatches
      .map(c => `<span style="background:${c}"></span>`)
      .join('');
    btn.innerHTML = `
      <div class="theme-swatch">${swatchSpans}</div>
      <span class="theme-name">${theme.label}</span>
      <span class="theme-check">&#x25C6;</span>
    `;
    btn.addEventListener('mouseenter', () => {
      document.documentElement.dataset.theme = theme.id;
    });
    btn.addEventListener('mouseleave', () => {
      document.documentElement.dataset.theme = THEMES[currentThemeIdx].id;
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentThemeIdx = idx;
      applyTheme(theme);
      closePopover();
    });
    themePopover.appendChild(btn);
  });
}

function positionPopover(triggerBtn) {
  const r = triggerBtn.getBoundingClientRect();
  // Anchor the popover's top-right corner 8px below the trigger
  themePopover.style.top   = (r.bottom + 8) + 'px';
  themePopover.style.right = (window.innerWidth - r.right) + 'px';
  themePopover.style.left  = '';
}

let _activePopoverBtn = null;

function openPopover(triggerBtn) {
  _activePopoverBtn = triggerBtn;
  buildPopover();
  positionPopover(triggerBtn);
  themePopover.classList.add('open');
  triggerBtn.setAttribute('aria-expanded', 'true');
}

function closePopover() {
  if (!themePopover.classList.contains('open')) return;
  themePopover.classList.remove('open');
  if (_activePopoverBtn) {
    _activePopoverBtn.setAttribute('aria-expanded', 'false');
    _activePopoverBtn = null;
  }
  // Restore confirmed theme in case hover-preview was mid-flight
  document.documentElement.dataset.theme = THEMES[currentThemeIdx].id;
}

// ── Fragment delivery ─────────────────────────────────────────────────────────
function handleDeliverFragment({ text, title, url }) {
  if (isFirstFragment) {
    isFirstFragment = false;
    articleTitle = (title || '').trim() || 'Untitled';
    articleUrl   = url || '';
    titleInput.value = articleTitle;
    applyTitleLang(articleTitle);
  }
  // Every fragment keeps its own source — cross-article collections must not
  // inherit the first article's title/url (multi-source-export).
  addFragment(text, (title || '').trim(), url || '');
}

// ── Fragment management ───────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Pangu spacing (盘古之白) ──────────────────────────────────────────────────
// Inserts a space between CJK characters and Latin/numeric characters.
// Full-width forms (\uff01-\uff60: fullwidth parens/punctuation) excluded from CJK_RE \u2014
// those glyphs carry internal half-width padding, so a Pangu space on top
// produces a visually doubled gap (e.g. English text + \uff09).
const CJK_RE = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff' +
               '\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff' +
               '\uf900-\ufaff\ufe30-\ufe4f';
const ANS_RE = 'A-Za-z0-9';
const PANGU_CJK_ANS = new RegExp(`([${CJK_RE}])([${ANS_RE}])`, 'gu');
const PANGU_ANS_CJK = new RegExp(`([${ANS_RE}])([${CJK_RE}])`, 'gu');

function panguSpacing(str) {
  return str
    .replace(PANGU_CJK_ANS, '$1 $2')
    .replace(PANGU_ANS_CJK, '$1 $2');
}

// Returns a fresh global regex that matches Markdown links [text](url).
// Must be recreated each use — global regexes are stateful.
function newLinkRe() {
  return /\[([^\]\n]+)\]\((https?:\/\/[^\s()]*(?:\([^\s()]*\))*[^\s()]*)\)/g;
}

// ── Block parser ──────────────────────────────────────────────────────────────
// Splits markdown text into typed blocks for both display and clipboard builders.
// Returns: Array<
//   { type:'line',      text }
//   { type:'heading',   level:1-6, text }
//   { type:'list',      ordered, items:[{indent,text}] }
//   { type:'blockquote', lines:string[] }
// >
function parseMarkdownBlocks(text) {
  const blocks  = [];
  let   listBuf = null;  // current list accumulator
  let   bqBuf   = null;  // current blockquote accumulator
  let   codeBuf = null;  // fenced code accumulator { type:'code', lang, lines }

  function flushList() {
    if (listBuf) { blocks.push(listBuf); listBuf = null; }
  }
  function flushBq() {
    if (bqBuf) { blocks.push(bqBuf); bqBuf = null; }
  }
  function flushAll() { flushList(); flushBq(); }

  for (const raw of text.split('\n')) {
    // Fenced code blocks (``` / ~~~) — fence lines themselves are never shown.
    if (codeBuf) {
      if (/^\s*(```|~~~)\s*$/.test(raw)) { blocks.push(codeBuf); codeBuf = null; }
      else codeBuf.lines.push(raw);
      continue;
    }
    const fenceM = raw.match(/^\s*(```|~~~)([\w-]*)\s*$/);
    if (fenceM) { flushAll(); codeBuf = { type: 'code', lang: fenceM[2] || '', lines: [] }; continue; }

    const hM  = raw.match(/^(#{1,6})\s+(.+)/);
    const ulM = !hM && raw.match(/^(\s*)[*\-+]\s+(.+)/);
    const olM = !hM && !ulM && raw.match(/^(\s*)\d+\.\s+(.+)/);
    const bqM = !hM && !ulM && !olM && raw.match(/^>\s?(.*)/);

    if (hM) {
      flushAll();
      blocks.push({ type: 'heading', level: hM[1].length, text: hM[2] });
    } else if (ulM) {
      flushBq();
      const [, indent, txt] = ulM;
      if (!listBuf || listBuf.ordered) { flushList(); listBuf = { type: 'list', ordered: false, items: [] }; }
      listBuf.items.push({ indent: indent.length, text: txt });
    } else if (olM) {
      flushBq();
      const [, indent, txt] = olM;
      if (!listBuf || !listBuf.ordered) { flushList(); listBuf = { type: 'list', ordered: true, items: [] }; }
      listBuf.items.push({ indent: indent.length, text: txt });
    } else if (bqM) {
      flushList();
      if (!bqBuf) bqBuf = { type: 'blockquote', lines: [] };
      bqBuf.lines.push(bqM[1]);
    } else {
      flushAll();
      blocks.push({ type: 'line', text: raw });
    }
  }
  if (codeBuf) blocks.push(codeBuf);  // unterminated fence — code to the end
  flushAll();
  return blocks;
}

// Render inline Markdown to safe HTML.
// Handles: links, bold, italic, inline code, strikethrough, no-break identifiers.
function renderInline(str) {
  const codeSpans = [];
  const links     = [];
  const noBreaks  = [];

  // 0. Unescape Markdown backslash escapes — Turndown escapes * _ etc. in plain
  //    text nodes to prevent accidental Markdown interpretation.  We must undo
  //    that before our own inline patterns run, or **bold** shows as raw \*\*.
  str = str.replace(/\\([*_`~[\]()#+\-.!|\\])/g, '$1');

  // 1. Extract code spans so they're immune to other patterns
  str = str.replace(/`([^`\n]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `\x00C${codeSpans.length - 1}\x00`;
  });

  // 2. Strip anchor-only links [text](#...) — Turndown artifact from heading anchors.
  str = str.replace(/\[([^\]\n]*)\]\(#[^\s)]*\)/g, (_, text) => {
    const t = text.trim();
    if (!t || /^[#¶§]$/.test(t) || t.toLowerCase() === 'link') return '';
    return t;
  });

  // 2b. Extract http(s) links — three Turndown output forms:
  //   [text](url)          standard
  //   [text](<url>)        angle-bracket URL (Turndown uses this for parens in URL)
  //   <http://url>         autolink
  str = str.replace(/\[([^\]\n]+)\]\(<(https?:\/\/[^\s>]+)>\)/g, (_, text, url) => {
    links.push({ text, url });
    return `\x00L${links.length - 1}\x00`;
  });
  str = str.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s()]*(?:\([^\s()]*\))*[^\s()]*)\)/g, (_, text, url) => {
    links.push({ text, url });
    return `\x00L${links.length - 1}\x00`;
  });
  str = str.replace(/<(https?:\/\/[^\s>]+)>/g, (_, url) => {
    links.push({ text: url, url });
    return `\x00L${links.length - 1}\x00`;
  });

  // 2b-post: Remaining [text](url) that didn't match https? (relative paths, mailto:, etc.)
  // Keep the link text, drop the URL — prevents raw markdown syntax from leaking into render.
  str = str.replace(/\[([^\]\n]+)\]\([^)]*\)/g, '$1');

  // 2c. Extract dotted/slashed technical identifiers (tape.systems, v1.2.3, OpenAI/gpt-4)
  // so hyphens: auto never breaks them mid-identifier.
  str = str.replace(/\b[\w][\w-]*(?:[./][\w-]+)+\b/g, (match) => {
    noBreaks.push(match);
    return `\x00N${noBreaks.length - 1}\x00`;
  });

  // 2.5. Pangu spacing — runs after link/code extraction so URLs are never touched
  str = panguSpacing(str);

  // 3. Escape remaining HTML
  str = escapeHtml(str);

  // 4. Bold, italic, strikethrough (*, _ not HTML-special so survive escaping)
  str = str.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  str = str.replace(/\*([^*\n]+)\*/g,     '<em>$1</em>');
  str = str.replace(/_([^_\n]+)_/g,       '<em>$1</em>');
  str = str.replace(/~~([^~\n]+)~~/g,     '<s>$1</s>');

  // 5. Restore code spans
  str = str.replace(/\x00C(\d+)\x00/g, (_, i) =>
    `<code class="md-code">${escapeHtml(codeSpans[+i])}</code>`);

  // 5b. Restore no-break identifiers
  str = str.replace(/\x00N(\d+)\x00/g, (_, i) =>
    `<span class="no-break">${escapeHtml(noBreaks[+i])}</span>`);

  // 6. Restore links
  str = str.replace(/\x00L(\d+)\x00/g, (_, i) => {
    const { text, url } = links[+i];
    // Link text may itself hold code-span placeholders (MDN-style [`Code`](url)):
    // code spans are extracted BEFORE links, so the placeholder travels inside the
    // links[] entry and step 5 never sees it. Restore nested code here, or raw
    // \x00C…\x00 bytes leak into the card as "C0"/"C1" gibberish.
    const inner = escapeHtml(text).replace(/\x00C(\d+)\x00/g, (_m, j) =>
      `<code class="md-code">${escapeHtml(codeSpans[+j])}</code>`);
    return `<a class="md-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  });

  return str;
}

// Strip WeChat-style layout junk from clipped markdown: empty spacer paragraphs
// (lines that are only spaces / nbsp / full-width spaces, used purely for vertical
// rhythm in the source) and the runs of blank lines they leave behind. Applied at
// every consumer (render + export + copy); the raw dataset.fullText is left intact
// so inline editing still sees the original.
function sanitizeClipMarkdown(md) {
  return md
    .replace(/[  　]/g, ' ')                       // nbsp / em-space / ideographic space → normal space
    .replace(/(?<!!)\[\s*\]\([^)]*\)/g, '')        // empty-text link [](url) → drop (keep images, hence (?<!!))
    .replace(/(?<!!)\[([^\]]+)\]\(\s*\)/g, '$1')   // empty-URL link [text]() → keep text only
    .split('\n').map(l => /^\s*$/.test(l) ? '' : l.replace(/\s+$/, '')).join('\n')  // blank whitespace-only lines, trim trailing
    .replace(/\n{3,}/g, '\n\n')                                  // collapse runs of blank lines
    .trim();
}

function renderMarkdown(text) {
  // Normalise: strip WeChat empty-paragraph junk, then collapse + strip marker-only lines
  text = sanitizeClipMarkdown(text);
  text = text.replace(/^[*_]{1,3}\s*$/gm, '');
  // Unescape ordered-list markers: Turndown writes "1\." to avoid MD conflicts,
  // but our parser needs "1." to recognise ordered lists (WeChat fix).
  text = text.replace(/^(\s*)(\d+)\\\./gm, '$1$2.');
  const blocks  = parseMarkdownBlocks(text);
  const parts   = [];
  let   lineBuf = [];

  function flushLines() {
    const filtered = lineBuf.filter(l => l !== '');
    if (filtered.length) parts.push(`<p>${filtered.join('<br>')}</p>`);
    lineBuf = [];
  }

  for (const block of blocks) {
    if (block.type === 'heading') {
      flushLines();
      const tag = `h${block.level}`;
      parts.push(`<${tag}>${renderInline(block.text)}</${tag}>`);
    } else if (block.type === 'list') {
      flushLines();
      const tag      = block.ordered ? 'ol' : 'ul';
      const longAttr = (block.ordered && block.items.length >= 8) ? ' data-long="true"' : '';
      const items    = block.items.map(item => `<li>${renderInline(item.text)}</li>`).join('');
      parts.push(`<${tag} class="md-list"${longAttr}>${items}</${tag}>`);
    } else if (block.type === 'blockquote') {
      flushLines();
      const inner = block.lines.map(l => renderInline(l)).join('<br>');
      parts.push(`<blockquote>${inner}</blockquote>`);
    } else if (block.type === 'code') {
      flushLines();
      parts.push(`<pre class="md-codeblock" data-lang="${escapeHtml(block.lang || '')}">${escapeHtml(block.lines.join('\n'))}</pre>`);
    } else {
      lineBuf.push(renderInline(block.text));
    }
  }
  flushLines();
  return parts.join('');
}

// ── Card heading classification ───────────────────────────────────────────────
// Three card states based on the first visible block element:
//   heading card  — first block is <h1>–<h6> → add .heading-leading (shown as label)
//   prose card    — first block is <p>        → drop cap applied separately
//   structure card— first block is list/etc   → no opener
// Collateral headings (not first block) are hidden via CSS default + .heading-hidden.
const BLOCK_SEL = 'h1,h2,h3,h4,h5,h6,p,ul,ol,blockquote,pre,table';

// Returns the next sibling element that has visible text content, or null.
function nextContentSibling(el) {
  let s = el.nextElementSibling;
  while (s) { if (s.textContent.trim()) return s; s = s.nextElementSibling; }
  return null;
}

// Returns true if heading text looks like a numbered list item (e.g. "1. Item", "2) Item").
// WeChat and some CMSes mark numbered sections as <h3>1. Text</h3> — these should
// not get section-heading treatment.
function isNumberedListHeading(el) {
  return /^\d+[.)]\s/.test(el.textContent.trim());
}

function processCardHeadings(cardEl) {
  const textEl = cardEl.querySelector('.card-text');
  if (!textEl) return;

  let firstBlock = null;
  for (const el of textEl.querySelectorAll(BLOCK_SEL)) {
    if (el.textContent.trim()) { firstBlock = el; break; }
  }

  const headings = [...textEl.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  if (headings.length === 0) return;

  // Collateral headings: section markers if they introduce content, hidden otherwise.
  // Numbered list items mis-tagged as headings (WeChat <h3>1. text</h3>): always hidden.
  function classifyCollateral(h) {
    if (isNumberedListHeading(h)) { h.classList.add('heading-hidden'); return; }
    h.classList.add(nextContentSibling(h) ? 'heading-section' : 'heading-hidden');
  }

  // Absolute-level rule (stateless, no cross-card context needed):
  //   First block H1/H2 → heading-leading (centered + flanking lines)
  //   First block H3–H6 → treat same as collateral (§ prefix if content follows)
  //   Non-first headings → always collateral
  headings.forEach(h => {
    if (h === firstBlock) {
      const level = parseInt(h.tagName[1], 10);
      if (level <= 2) {
        h.classList.add('heading-leading');
      } else {
        classifyCollateral(h);
      }
    } else {
      classifyCollateral(h);
    }
  });
}

// ── Drop cap injection ────────────────────────────────────────────────────────
// Only runs on prose cards (first block = <p>). Skipped for heading and structure cards.
function injectDropCap(textEl) {
  // Skip: heading card — the label is the opener, no drop cap needed
  const card = textEl.closest('.fragment-card');
  if (card && card.querySelector('.heading-leading')) return;

  // Skip: multilang fallback — other/rtl/rtl-ur tiers (Japanese, Korean, Arabic,
  // Urdu, Hindi, Thai, etc.) have no drop cap. Otherwise the regex below would
  // pick up a stray CJK han in Japanese or a Latin letter ("PDF") in Korean
  // text — and Nastaliq connected scripts get visually broken by ::first-letter.
  // See openspec/changes/multilang-fallback-l2/design.md D2/D3.
  const lang = card && card.dataset.lang;
  if (lang === 'other' || lang === 'rtl' || lang === 'rtl-ur') return;

  // Skip: structure card — first block is not <p>
  const firstBlock = textEl.querySelector(BLOCK_SEL);
  if (!firstBlock || firstBlock.tagName !== 'P') return;

  // Skip: all-bold paragraph — entire visible text is wrapped in <strong>.
  // WeChat and similar CMSes use <p><strong>heading</strong></p> instead of <hN>.
  // Bold is already the visual signal; drop cap on top is redundant and looks odd.
  const strong = firstBlock.querySelector('strong');
  if (strong && strong.textContent.trim() === firstBlock.textContent.trim()) return;

  // Walk text nodes within the first <p> only
  const walker = document.createTreeWalker(firstBlock, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.parentElement.closest('li')) return NodeFilter.FILTER_REJECT;
      return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const firstNode = walker.nextNode();
  if (!firstNode || !firstNode.textContent) return;
  const content = firstNode.textContent;
  if (!content.trim()) return;

  // Drop cap ONLY when the paragraph begins with a letter or CJK ideograph. If the first
  // visible character is punctuation (《「（"… — capping the char inside a 《书名》 or after a
  // quote reads as broken) or any non-letter symbol, skip the drop cap entirely rather
  // than capping whatever follows the mark. (Digits are also excluded, just below.)
  if (!/^[一-鿿㐀-䶿a-zA-ZÀ-ɏ0-9]/.test(content.trim())) return;

  // Skip leading punctuation (book marks, quotes, brackets, dashes).
  // Drop cap must start on a CJK character or Latin letter (basic + extended,
  // covers French/German/Spanish/Portuguese/Italian/Vietnamese diacritics).
  // Vietnamese "\u0110" (U+0110, Latin Extended-A) was previously skipped, leading
  // dropcap to attach to the second letter "i" instead of "\u0110".
  // Digits are matched here only to detect a number-led paragraph and bail below.
  const dropMatch = content.match(/[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z\u00c0-\u024f0-9]/);
  if (!dropMatch) return;
  const dropIdx   = dropMatch.index;
  const firstChar = dropMatch[0];
  // Skip: number-led paragraph \u2014 section numbers ("2.2.3" mis-tagged as prose by
  // WeChat-style sources), years ("2018\u5e74"), stats ("10.82\u4ebf"). A giant floating
  // numeral reads as broken in the woodblock aesthetic, so no drop cap at all.
  if (/[0-9]/.test(firstChar)) return;

  const span = document.createElement('span');
  // Latin (Basic Latin + Latin Extended) → larger Cormorant Garamond
  span.className = /[\u0041-\u007A\u00C0-\u024F]/.test(firstChar)
    ? 'drop-cap drop-cap--latin'
    : 'drop-cap';
  span.textContent = firstChar;
  // Preserve any leading punctuation in firstNode; insert span after it.
  firstNode.textContent = content.slice(0, dropIdx);
  const restNode = document.createTextNode(content.slice(dropIdx + 1));
  firstNode.parentNode.insertBefore(restNode, firstNode.nextSibling);
  firstNode.parentNode.insertBefore(span, restNode);
}

// ── Plain-text & clipboard helpers ───────────────────────────────────────────

// Unicode superscript digits for footnote markers
function superscript(n) {
  return String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
}

// Strip inline MD markup, leaving plain text (links already replaced before call)
function stripInlineMd(str) {
  return str
    // Anchor links leak raw [text](#anchor) into plain text (heading anchors
    // from Turndown) — keep the text, drop decorative-only ones (# ¶ § / empty).
    .replace(/\[([^\]\n]*)\]\(#[^\s)]*\)/g, (_, t) => {
      const x = t.trim();
      return (!x || /^[#¶§]$/.test(x) || x.toLowerCase() === 'link') ? '' : x;
    })
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g,     '$1')
    .replace(/_([^_]+)_/g,       '$1')
    .replace(/~~([^~]+)~~/g,     '$1')
    .replace(/`([^`]+)`/g,       '$1');
}

// Convert markdown to readable plain text.
// ≤2 links → inline "text (url)"; ≥3 links → footnote superscript style.
function mdToPlain(md) {
  md = sanitizeClipMarkdown(md);  // drop WeChat empty-paragraph spacers before flattening
  const BULLETS = ['•', '◦', '▪'];

  // Collect unique links to decide rendering strategy
  const allLinks = [];
  const seen     = new Set();
  for (const m of md.matchAll(newLinkRe())) {
    if (!seen.has(m[2])) { seen.add(m[2]); allLinks.push({ text: m[1], url: m[2] }); }
  }
  const useFootnotes = allLinks.length > 2;

  function processLine(str) {
    const urls = [];
    if (useFootnotes) {
      str = str.replace(newLinkRe(), (_, text, url) => {
        const idx = allLinks.findIndex(l => l.url === url);
        return `${text}${superscript(idx + 1)}`;
      });
    } else {
      // Placeholder the URL before stripInlineMd — its _italic_ rule eats
      // underscores inside inline URLs (Learn_web_development → Learnwebdevelopment,
      // a dead link). Restored verbatim after stripping.
      str = str.replace(newLinkRe(), (_, text, url) => {
        urls.push(url);
        return `${text} (\x00U${urls.length - 1}\x00)`;
      });
    }
    str = stripInlineMd(str);
    return str.replace(/\x00U(\d+)\x00/g, (_, i) => urls[+i]);
  }

  const blocks = parseMarkdownBlocks(md);
  const output = [];

  for (const block of blocks) {
    if (block.type === 'heading') {
      output.push(processLine(block.text));  // strip # prefix, keep text
    } else if (block.type === 'list') {
      let counter = 1;
      for (const item of block.items) {
        const level  = Math.min(Math.floor(item.indent / 2), BULLETS.length - 1);
        const indent = '  '.repeat(level);
        const marker = block.ordered ? `${counter++}.` : BULLETS[level];
        output.push(`${indent}${marker} ${processLine(item.text)}`);
      }
    } else if (block.type === 'code') {
      // Verbatim, indentation intact — code/blockquote blocks carry {lines},
      // not .text; feeding them to processLine crashed every plain-text copy
      // once the first fenced card landed (COPY button looked dead).
      block.lines.forEach(l => output.push(l));
    } else if (block.type === 'blockquote') {
      block.lines.forEach(l => output.push(processLine(l)));
    } else {
      output.push(processLine(block.text || ''));
    }
  }

  if (useFootnotes && allLinks.length) {
    output.push('');
    allLinks.forEach((link, i) => output.push(`${superscript(i + 1)} ${link.url}`));
  }

  return output.join('\n');
}

// Group cards by their source URL, preserving first-appearance order.
// Cross-article collections export one group per article (multi-source-export);
// per-card dataset falls back to the first-article globals for older cards.
function groupCardsBySource() {
  const cards  = [...fragmentList.querySelectorAll('.fragment-card')];
  const groups = [];
  const byUrl  = new Map();
  for (const c of cards) {
    // Same article clipped at different scroll anchors carries different
    // #fragments — strip plain fragment identifiers so it stays one group.
    // Hashbang/hash-routing SPAs (#/route, #!route) keep theirs: those hashes
    // really are different pages.
    const url = (c.dataset.sourceUrl || articleUrl || '').replace(/#(?![/!]).*$/, '');
    let g = byUrl.get(url);
    if (!g) {
      g = { url, title: c.dataset.sourceTitle || articleTitle || 'Untitled', cards: [] };
      byUrl.set(url, g);
      groups.push(g);
    }
    g.cards.push(c);
  }
  return groups;
}

// Build plain-text version of all cards (for clipboard text/plain)
function buildPlainText() {
  const groups = groupCardsBySource();
  if (groups.length <= 1) {
    const g     = groups[0] || { cards: [], url: articleUrl };
    const title = titleInput.value.trim() || articleTitle || 'Untitled';
    const parts = g.cards.map(c => mdToPlain(c.dataset.fullText).trim());
    return parts.join('\n\n') + `\n\n— from “${title}”\n   ${g.url}`;
  }
  return groups.map(g => {
    const parts = g.cards.map(c => mdToPlain(c.dataset.fullText).trim());
    return parts.join('\n\n') + `\n\n— from “${g.title}”\n   ${g.url}`;
  }).join('\n\n');
}

// Build markdown version for clipboard (separate from export buildMarkdown)
function buildMarkdownCopy() {
  const groups = groupCardsBySource();
  if (groups.length <= 1) {
    const g     = groups[0] || { cards: [], url: articleUrl };
    const title = titleInput.value.trim() || articleTitle || 'Untitled';
    const parts = g.cards.map(c => sanitizeClipMarkdown(c.dataset.fullText));
    return parts.join('\n\n') + `\n\n— from [${title}](${g.url})`;
  }
  return groups.map(g => {
    const parts = g.cards.map(c => sanitizeClipMarkdown(c.dataset.fullText));
    return parts.join('\n\n') + `\n\n— from [${g.title}](${g.url})`;
  }).join('\n\n');
}

// Build excerpt text only — no source attribution
function buildQuoteOnly() {
  const cards = [...fragmentList.querySelectorAll('.fragment-card')];
  return cards.map(c => mdToPlain(c.dataset.fullText).trim()).join('\n\n');
}

// Build HTML version of all cards (for clipboard text/html)
function buildHtmlClipboard() {
  const cards = [...fragmentList.querySelectorAll('.fragment-card')];
  const title = titleInput.value.trim() || articleTitle || 'Untitled';

  function mdToHtmlBlocks(md) {
    return parseMarkdownBlocks(md).map(block => {
      if (block.type === 'heading') {
        const tag = `h${block.level}`;
        return `<${tag}>${renderInline(block.text)}</${tag}>`;
      }
      if (block.type === 'list') {
        const tag   = block.ordered ? 'ol' : 'ul';
        const items = block.items.map(item => `<li>${renderInline(item.text)}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;
      }
      if (block.type === 'blockquote') {
        const inner = block.lines.map(l => renderInline(l)).join('<br>');
        return `<blockquote>${inner}</blockquote>`;
      }
      if (block.type === 'code') {
        // {lines} carrier, same crash class as mdToPlain — emit a real <pre>.
        return `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:0.9em;">`
             + `${escapeHtml(block.lines.join('\n'))}</pre>`;
      }
      const html = renderInline(block.text || '');
      return html ? `<p>${html}</p>` : '<br>';
    }).join('');
  }

  const attribution = (t, u) =>
    `<p style="font-size:0.88em;font-style:italic;color:#999;margin-top:1.2em;">`
    + `— from <a href="${escapeHtml(u)}">${escapeHtml(t)}</a></p>`;
  const groups = groupCardsBySource();
  let inner;
  if (groups.length <= 1) {
    const g = groups[0] || { cards: [], url: articleUrl };
    const body = g.cards.map(c => `<div>${mdToHtmlBlocks(c.dataset.fullText)}</div>`).join('');
    inner = body + attribution(title, g.url);
  } else {
    inner = groups.map(g =>
      g.cards.map(c => `<div>${mdToHtmlBlocks(c.dataset.fullText)}</div>`).join('')
      + attribution(g.title, g.url)
    ).join('');
  }
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>',
    `<div class="bayaaz-excerpt">${inner}</div>`,
    '</body></html>',
  ].join('');
}

// Cards taller than this (px) after render are collapsed.
// ~7.5 lines at 14.5px × 1.95 line-height ≈ 220px.
const COLLAPSE_THRESHOLD_PX = 220;
// Minimum cut height — prevents very short semantic cuts.
// If no block boundary falls above this, use COLLAPSE_FALLBACK_PX instead.
const COLLAPSE_MIN_PX      = 160;
const COLLAPSE_FALLBACK_PX = 200;
// Empty padding zone (px) added below the last content line inside card-text.
// With mask-image, this zone is fully transparent — the button floats here
// with no content behind it. Must be >= expand-btn offset (base: 20px, parchment: 24px).
const COLLAPSE_PADDING_PX = 32;

// Block selector for semantic truncation boundary detection.
const COLLAPSE_BLOCK_SEL = 'h1,h2,h3,h4,h5,h6,p,ul,ol,blockquote,pre';

// Panel width changes (opening animation, user drag-resize, queue-flush during
// mount) invalidate collapse measurements — a 3-line card measured at a narrower
// transient width gets a false "Read more" that never re-evaluates (her viwiki
// short-card report, 2026-07-27; same family as the RTL and webfont false-collapse
// cases). Re-measure every card once layout settles; cards the user expanded by
// hand are left alone.
let _lastListWidth = 0;
const collapseReflow = new ResizeObserver((entries) => {
  const w = Math.round(entries[0].contentRect.width);
  if (w === 0 || w === _lastListWidth) return;
  _lastListWidth = w;
  requestAnimationFrame(() => {
    fragmentList.querySelectorAll('.fragment-card').forEach((c) => {
      if (c.classList.contains('is-editing')) return;
      const btn = c.querySelector('.expand-btn');
      if (btn && btn.ariaExpanded === 'true') return; /* user chose expanded — respect it */
      tryCollapseCard(c);
    });
  });
});
collapseReflow.observe(fragmentList);

function tryCollapseCard(card) {
  const textEl = card.querySelector('.card-text');
  const existingBtn = card.querySelector('.expand-btn');
  if (existingBtn) existingBtn.remove();
  textEl.style.maxHeight     = '';
  textEl.style.paddingBottom = '';
  textEl.classList.remove('card-text--collapsed');

  // Keep the original 220px budget for ALL scripts so the collapsed *preview* stays short
  // regardless of language (a line-count-scaled threshold made Nastaliq previews ~13 lines
  // tall — far too long). The only RTL-specific tweak is the "barely overflowing" guard
  // below: RTL line-heights are tall (Arabic 1.85, Nastaliq 2.5) so hiding 1 line is a lot
  // of pixels, and a short excerpt was getting a "Read more" it didn't need.
  const lineH = parseFloat(getComputedStyle(textEl).lineHeight) || 28;
  const isRTL = card.dataset.lang === 'rtl' || card.dataset.lang === 'rtl-ur';
  const threshold = COLLAPSE_THRESHOLD_PX;

  if (textEl.scrollHeight <= threshold) return;

  let cutHeight = null;
  for (const block of textEl.querySelectorAll(COLLAPSE_BLOCK_SEL)) {
    if (block.offsetHeight === 0) continue;
    const blockBottom = block.offsetTop + block.offsetHeight;
    if (blockBottom <= threshold) { cutHeight = blockBottom; } else { break; }
  }
  if (!cutHeight || cutHeight < COLLAPSE_MIN_PX) cutHeight = COLLAPSE_FALLBACK_PX;

  const SNAP_TOLERANCE_PX = 16;
  if (threshold - cutHeight > SNAP_TOLERANCE_PX) {
    cutHeight = threshold - SNAP_TOLERANCE_PX;
  }

  const maxHeight = cutHeight + COLLAPSE_PADDING_PX;
  // Don't collapse when little is actually hidden. zh/en/other keep the original 40px; RTL
  // gets ~2 of its taller lines so a near-complete short card isn't collapsed needlessly.
  const minHidden = isRTL ? Math.round(lineH * 2) : 40;
  if (textEl.scrollHeight - maxHeight <= minHidden) return;

  textEl.style.maxHeight     = maxHeight + 'px';
  textEl.style.paddingBottom = COLLAPSE_PADDING_PX + 'px';
  textEl.classList.add('card-text--collapsed');

  const expandBtn = document.createElement('button');
  expandBtn.className    = 'expand-btn';
  expandBtn.ariaExpanded = 'false';
  expandBtn.textContent  = 'Show more';
  expandBtn.addEventListener('click', () => {
    const expanding = expandBtn.ariaExpanded !== 'true';
    if (expanding) {
      textEl.style.maxHeight     = '';
      textEl.style.paddingBottom = '';
      textEl.classList.remove('card-text--collapsed');
    } else {
      textEl.style.maxHeight     = maxHeight + 'px';
      textEl.style.paddingBottom = COLLAPSE_PADDING_PX + 'px';
      textEl.classList.add('card-text--collapsed');
    }
    expandBtn.textContent  = expanding ? 'Show less' : 'Show more';
    expandBtn.ariaExpanded = expanding;
  });
  card.appendChild(expandBtn);
}

function leaveEmptyState() {
  // If already hidden, nothing to do
  if (emptyState.style.display === 'none') return;
  emptyState.classList.add('is-leaving');
  setTimeout(() => {
    emptyState.style.display = 'none';
    emptyState.classList.remove('is-leaving');
  }, 200);
}

function addFragment(text, sourceTitle, sourceUrl) {
  leaveEmptyState();
  document.body.dataset.state = 'populated';
  // 自然滚动：记录追加前用户是否在底部附近。只有在用户没往上翻看旧摘录时，
  // 才让新卡自动跟随入视野；否则不打断他的阅读。
  const wasNearBottom =
    fragmentList.scrollHeight - fragmentList.scrollTop - fragmentList.clientHeight < 140;
  const card = createCard(text);
  card.dataset.sourceTitle = sourceTitle || articleTitle;
  card.dataset.sourceUrl   = sourceUrl   || articleUrl;
  card.dataset.savedAt     = new Date().toISOString();
  fragmentList.appendChild(card);

  // Post-insert: degrade multi-line heading-leading to § style.
  // Flanking rules only look right on a single line; wrapping text looks broken.
  const hl = card.querySelector('.heading-leading');
  if (hl) {
    const lh = parseFloat(getComputedStyle(hl).lineHeight) || 20;
    if (hl.offsetHeight > lh * 1.5) {
      hl.classList.remove('heading-leading');
      hl.classList.add(nextContentSibling(hl) ? 'heading-section' : 'heading-hidden');
    }
  }

  // Measure rendered height — only possible after the card is in the DOM.
  tryCollapseCard(card);
  // Re-measure once webfonts finish loading: the first pass can run with fallback
  // metrics (taller), producing a "Read more" the loaded serif no longer needs.
  // document.fonts.ready resolves immediately if fonts are already cached.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (card.isConnected) tryCollapseCard(card); });
  }

  updateButtons();

  // 扉页自划中途离场即清(openspec: flyleaf-self-highlight)
  if (flyleafCleanup) flyleafCleanup();
  // 首条摘录·钤印初引(openspec: first-keep-imprint-hint):
  // 历史第一条 && 未演过 → 全礼;若在演且新卡到来 → 前场无声让位。
  maybePlayImprintHint(card);

  // 新摘录可能落在一屏之外（超出后看不见）→ 平滑滚动进视野。
  // 等折叠测高后的下一帧再滚，拿到的是稳定高度。
  if (wasNearBottom) {
    requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}

function createCard(text) {
  const card = document.createElement('div');
  card.className = 'fragment-card';
  card.dataset.fullText = text;
  card.dataset.lang = detectLang(text);  // multilang-fallback-l2: 4-tier routing
  if (card.dataset.lang === 'other') {   // per-script line-height tuning (ja/ko)
    const sc = otherScript(text);
    if (sc) card.dataset.script = sc;
  } else if (card.dataset.lang === 'rtl-ur' && !/[ٹڈڑںھےہ]/.test(text)) {
    // Persian (no Urdu-only letters incl. heh-goal ہ) → modern Naskh (Vazirmatn),
    // not Nastaliq, which suits modern Persian prose/news. Urdu keeps Nastaliq.
    card.dataset.script = 'fa';
  }

  // Render full Markdown — no pre-collapse; addFragment measures height after append.
  card.innerHTML = `
    <div class="card-actions">
      <button class="card-action-btn export-btn" title="Pick a paper" aria-label="Pick a paper">
        <svg width="11" height="13" viewBox="0 0 11 14" fill="none">
          <path d="M 2.5 2.3 Q 2.5 1.4 3.3 1.4
                   L 7.7 1.4 Q 8.5 1.4 8.5 2.3
                   Q 8.7 6.8 8.4 12.6
                   L 5.4 10.4
                   L 2.6 12.7
                   Q 2.3 7.2 2.5 2.3 Z"
                stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="5.4" cy="3.4" r="0.82" stroke="currentColor" stroke-width="0.72"/>
        </svg>
      </button>
      <button class="card-action-btn delete-btn" title="Let it go" aria-label="Let it go">
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
          <path d="M 8.6 2.4 Q 6.8 5.5 2.4 8.8" stroke="currentColor" stroke-width="1.05" stroke-linecap="square"/>
          <path d="M 2.4 2.4 Q 5.2 5.5 8.8 9"   stroke="currentColor" stroke-width="1.05" stroke-linecap="square"/>
        </svg>
      </button>
    </div>
    <div class="card-text">${renderMarkdown(text)}</div>
  `;

  processCardHeadings(card);
  injectDropCap(card.querySelector('.card-text'));

  card.querySelector('.delete-btn').addEventListener('click', () => {
    card.remove();
    updateEmptyState();
    updateButtons();
    resetClipDedup();  // deleted passage must be re-clippable immediately
  });

  card.querySelector('.export-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openExportOverlay(card);
  });

  card.querySelector('.card-text').addEventListener('dblclick', (e) => {
    const sel  = window.getSelection();
    const word = sel?.toString().trim() || '';
    sel?.removeAllRanges();
    enterEditMode(card, word);
  });

  return card;
}


// ── Card inline editing ───────────────────────────────────────────────────────
function enterEditMode(card, selectedWord = '') {
  if (card.classList.contains('is-editing')) return;
  card.classList.add('is-editing');

  const textEl       = card.querySelector('.card-text');
  const originalText = card.dataset.fullText;

  // Record collapsed state before expanding, so we can restore the button after save.
  let wasCollapsed   = false;
  let savedMaxHeight = '';
  if (textEl.classList.contains('card-text--collapsed')) {
    wasCollapsed       = true;
    savedMaxHeight     = textEl.style.maxHeight;
    textEl.style.maxHeight     = '';
    textEl.style.paddingBottom = '';
    textEl.classList.remove('card-text--collapsed');
    const existingBtn = card.querySelector('.expand-btn');
    if (existingBtn) existingBtn.remove();
  }

  const ta = document.createElement('textarea');
  ta.className   = 'card-edit-ta';
  ta.value       = originalText;
  ta.spellcheck  = false;
  ta.setAttribute('aria-label', 'Edit excerpt');

  textEl.style.display = 'none';
  card.insertBefore(ta, textEl);

  function resizeTa() {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }
  resizeTa();
  ta.addEventListener('input', resizeTa);

  ta.focus({ preventScroll: true });
  // Position cursor at the double-clicked word in the raw markdown.
  if (selectedWord) {
    const idx = ta.value.indexOf(selectedWord);
    if (idx !== -1) ta.setSelectionRange(idx, idx);
  }

  fragmentList.classList.add('has-editing');

  let committed = false;
  function commit(save) {
    if (committed) return;
    committed = true;
    const newText = ta.value.trim();
    ta.remove();
    textEl.style.display = '';
    card.classList.remove('is-editing');
    fragmentList.classList.remove('has-editing');
    if (save && newText && newText !== originalText) {
      card.dataset.fullText = newText;
      textEl.innerHTML = renderMarkdown(newText);
      processCardHeadings(card);
      injectDropCap(textEl);
    }
    if (wasCollapsed) tryCollapseCard(card);
  }

  ta.addEventListener('blur', () => commit(true));
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); commit(false); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(true); }
  });
}

// ── Markdown builder ──────────────────────────────────────────────────────────
function buildMarkdown() {
  const groups = groupCardsBySource();
  const title  = titleInput.value.trim() || articleTitle || 'Untitled';
  const lines  = [`# ${title}`, ''];
  if (groups.length <= 1) {
    // Single source — byte-identical to the historical format.
    const g = groups[0] || { cards: [], url: articleUrl };
    // Trim each fragment to prevent trailing newlines from creating double blank lines.
    g.cards.forEach(c => lines.push(sanitizeClipMarkdown(c.dataset.fullText).trim(), ''));
    lines.push('---', '', `> Source: ${g.url}`);
    return lines.join('\n');
  }
  // Multi-source collection — no per-article headings (user's call, 2026-07-07):
  // fragments flow under the one big title; each group closes with a titled
  // source link ("what it is" + "where it lives" in one line).
  groups.forEach(g => {
    g.cards.forEach(c => lines.push(sanitizeClipMarkdown(c.dataset.fullText).trim(), ''));
    lines.push(`> Source: [${g.title.replace(/([[\]])/g, '\\$1')}](${g.url})`, '');
  });
  return lines.join('\n').trimEnd();
}

// ── Filename generator ────────────────────────────────────────────────────────
function generateFilename() {
  const d    = new Date();
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('_');

  const raw   = titleInput.value.trim() || articleTitle || 'untitled';
  // English: lowercase + underscores. Chinese/other: keep as-is.
  // Determine if predominantly Latin
  const latinChars = (raw.match(/[a-zA-Z0-9]/g) || []).length;
  const totalChars = raw.replace(/\s/g, '').length;
  let slug;
  if (totalChars > 0 && latinChars / totalChars > 0.6) {
    // Mostly Latin — slugify
    slug = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      || 'untitled';
  } else {
    // Mostly CJK — preserve, strip only filesystem-unsafe chars
    slug = raw.replace(/[/\\:*?"<>|]/g, '').trim() || 'untitled';
  }

  return `${date}_${slug}`;
}

// ── Copy ──────────────────────────────────────────────────────────────────────
function flashSuccess(btn) {
  const original = btn.textContent;
  btn.textContent = '✓ Copied';
  btn.classList.add('btn--success');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('btn--success');
  }, 1500);
}

async function copySmart() {
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/plain': new Blob([buildPlainText()],    { type: 'text/plain' }),
      'text/html':  new Blob([buildHtmlClipboard()], { type: 'text/html' }),
    })]);
    flashSuccess(copyBtn);
  } catch (err) {
    console.warn('[Bayaaz] multi-format clipboard failed, trying plain text:', err);
    try {
      await navigator.clipboard.writeText(buildPlainText());
      flashSuccess(copyBtn);
    } catch (err2) {
      console.warn('[Bayaaz] clipboard write failed:', err2);
    }
  }
}

// ── Close sidebar ─────────────────────────────────────────────────────────────
function closeSidebar() {
  chrome.windows.getCurrent((win) => {
    chrome.runtime.sendMessage({ type: 'CLOSE_SIDEBAR', windowId: win.id });
  });
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportMarkdown() {
  const md       = buildMarkdown();
  const filename = generateFilename() + '.md';
  const blob     = new Blob([md], { type: 'text/markdown; charset=utf-8' });
  const blobUrl  = URL.createObjectURL(blob);

  chrome.downloads.download(
    { url: blobUrl, filename, saveAs: true },
    () => {
      URL.revokeObjectURL(blobUrl);
      // Flash feedback — text change only (button is already primary red)
      const original = exportBtn.textContent;
      exportBtn.textContent = '✓ Exported';
      setTimeout(() => { exportBtn.textContent = original; }, 1500);
    }
  );
}

// ── State helpers ─────────────────────────────────────────────────────────────
function updateEmptyState() {
  const hasCards = fragmentList.querySelector('.fragment-card') !== null;
  emptyState.style.display = hasCards ? 'none' : 'flex';
  document.body.dataset.state = hasCards ? 'populated' : 'empty';
  if (!hasCards) {
    isFirstFragment  = true;
    articleTitle     = '';
    articleUrl       = '';
    titleInput.value = '';
    applyTitleLang('');
  }
}

// ── Clear ─────────────────────────────────────────────────────────────────────
let clearPending = false;
let clearTimer   = null;

function handleClear() {
  if (!clearPending) {
    clearPending = true;
    clearBtn.textContent = 'Confirm clear?';
    clearBtn.classList.add('meta-action--pending');
    clearTimer = setTimeout(() => {
      clearPending = false;
      clearBtn.textContent = '❦ Clear';
      clearBtn.classList.remove('meta-action--pending');
    }, 3000);
  } else {
    clearTimeout(clearTimer);
    clearPending = false;
    clearBtn.textContent = '❦ Clear';
    clearBtn.classList.remove('meta-action--pending');
    // Remove all cards
    fragmentList.querySelectorAll('.fragment-card').forEach(c => c.remove());
    updateEmptyState();
    updateButtons();
    resetClipDedup();
  }
}

// Deleting a card (or clearing) must free its passage for re-clipping —
// the content script's dedup guard otherwise blocks the re-clip silently
// (it only resets on sidebar close).
function resetClipDedup() {
  // Broadcast: the deleted card may have come from any article in any tab (the
  // panel is window-scoped and collects across pages) — the reset is idempotent,
  // so every http(s) tab gets it rather than guessing the card's home tab.
  chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
    for (const t of tabs) {
      if (t.id != null) chrome.tabs.sendMessage(t.id, { type: 'RESET_CLIP_DEDUP' }).catch(() => {});
    }
  });
}

function updateButtons() {
  const cards    = [...fragmentList.querySelectorAll('.fragment-card')];
  const hasCards = cards.length > 0;
  copyBtn.disabled   = !hasCards;
  exportBtn.disabled = !hasCards;
  clearBtn.disabled  = !hasCards;
  if (excerptCount) {
    const n = cards.length;
    excerptCount.textContent = n === 0 ? '' : n === 1 ? '1 excerpt' : `${n} excerpts`;
  }
}

// ── Scrollbar visibility ──────────────────────────────────────────────────────
// .has-scrolled: set on first scroll — gates the fadeout animation so the
// scrollbar doesn't flash on page load before any interaction.
let scrollbarTimer = null;
fragmentList.addEventListener('scroll', () => {
  fragmentList.classList.add('has-scrolled', 'is-scrolling');
  clearTimeout(scrollbarTimer);
  scrollbarTimer = setTimeout(() => fragmentList.classList.remove('is-scrolling'), 1500);
});


// ── Export studio ─────────────────────────────────────────────────────────────
function openExportOverlay(card) {
  const data = {
    text:        card.dataset.fullText,
    sourceTitle: card.dataset.sourceTitle || articleTitle || '',
    sourceUrl:   card.dataset.sourceUrl   || articleUrl   || '',
    savedAt:     card.dataset.savedAt     || new Date().toISOString(),
  };
  chrome.storage.local.set({ bayaaz_export: data }, () => {
    const url = chrome.runtime.getURL('export/samplebook.html');
    // Return-to-reading: register the article tab as opener — Chrome focuses
    // the opener when the export studio closes, instead of the neighbor tab.
    // Also places the studio right next to the article tab.
    const props = { url };
    if (myTabId != null) props.openerTabId = myTabId;
    chrome.tabs.create(props, () => {
      // Stale/closed opener makes tabs.create fail — retry without it.
      if (chrome.runtime.lastError) chrome.tabs.create({ url });
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

/* ── First-keep imprint hint(openspec: first-keep-imprint-hint)─────────────
   首条摘录·钤印初引:历史第一条摘录落架时,导出钮被"盖"成一方圆章。
   纸的视角四拍:接触(受力点洇斑)→ 碾匀两拍(补斑+微挪)→ 墨定(线稿隐)→ 边款。
   阈限只有一次:首演即记 flag;退场只走事件(点钮/删卡/第二条摘录),不设倒计时。
   形制与全部裁决:_cowork-output/onboarding-方案集-2026-07-24.md §五。 */

const IMPRINT_HINT_KEY = 'bayaaz_imprint_hint_shown';
let imprintHint = null;   // 在演现场 { card, eb, wrap, note, timers } ;null=无

async function maybePlayImprintHint(card) {
  if (imprintHint) { retireImprintHint(); return; }   // 第二条摘录到来:前场无声让位
  if (fragmentList.querySelectorAll('.fragment-card').length !== 1) return;
  const stored = await chrome.storage.local.get(IMPRINT_HINT_KEY);
  if (stored[IMPRINT_HINT_KEY] || !card.isConnected) return;
  chrome.storage.local.set({ [IMPRINT_HINT_KEY]: true });  // 阈限只有一次:首演即记
  try { localStorage.setItem(IMPRINT_HINT_KEY, '1'); } catch (_) {}  // flyleaf 防闪镜像
  playImprintHint(card);
}

function playImprintHint(card) {
  const eb = card.querySelector('.export-btn');
  if (!eb) return;
  card.classList.add('hinting');

  /* 印面矢量(与氛围预览定稿逐字):
     圆章崩石缘(右上楔形崩口+左下双阶残缺)/ 印文=原书签形刀刻化 / 八面孔 /
     飞白=缘崩两处+红地干笔断白两道+失着散点 */
  const STONE = 'M 50 11 C 63 9.8, 76 17, 83 28 L 79 31 L 84.5 34 ' +
    'C 89 43, 89.5 55, 84 66 C 78 77.5, 66 86.5, 52 88.5 ' +
    'L 47 86.8 L 44.5 89.5 C 31 88, 18.5 79, 13.5 66 ' +
    'C 9 55, 10 40, 17.5 28.5 C 24 19, 36 12.2, 50 11 Z';
  const BKM = 'M 37 30 L 49.5 28.9 L 61.8 29.5 L 63.2 31.2 L 63.8 45.5 L 62.9 58 ' +
    'L 63.5 71.5 L 50.4 60.4 L 36.8 72.8 L 36 56.5 L 36.7 42.5 Z';
  const HOLE = 'M 46 35 L 49.3 33.3 L 53.1 33.8 L 54.9 36.6 L 54.1 39.8 ' +
    'L 50.8 41.2 L 47 40.5 L 45.2 37.5 Z';
  const FEIBAI =
    '<path d="M 76 20 L 83 24 L 77 29 Z" fill="black"/>' +
    '<path d="M 12 55 L 19 57.5 L 13.5 61 Z" fill="black"/>' +
    '<path d="M 24 40 q 11 -2.2 20 -0.6 l .4 2 q -9.6 -1.8 -20 .5 Z" fill="black"/>' +
    '<path d="M 58 70 q 8.5 1.2 15 -.8 l .5 1.9 q -7 2.2 -15.8 .8 Z" fill="black"/>' +
    '<circle cx="70" cy="44" r="1.3" fill="black"/>' +
    '<circle cx="30" cy="68" r="1.1" fill="black"/>' +
    '<circle cx="61" cy="16.5" r="1" fill="black"/>' +
    '<circle cx="41" cy="86" r=".9" fill="black"/>';
  const mk = (i) =>
    '<svg class="ic-stamp s' + i + '" viewBox="0 0 100 100" aria-hidden="true">' +
    '<defs><mask id="imprint-fb' + i + '"><rect width="100" height="100" fill="white"/>' +
    FEIBAI + '</mask></defs>' +
    '<path fill-rule="evenodd" mask="url(#imprint-fb' + i + ')" d="' +
    STONE + ' ' + BKM + ' ' + HOLE + '"/></svg>';

  const wrap = document.createElement('span');
  wrap.className = 'stamp-wrap';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = mk(1) + mk(2) + mk(3) + mk(4);
  eb.appendChild(wrap);

  /* 边款:印不离款;独立兄弟节点,永不进导出/复制(收集皆按 .fragment-card) */
  const note = document.createElement('div');
  note.className = 'first-hint';
  note.innerHTML = 'It is kept &mdash; press the seal to pick its paper<span class="dm"></span>';
  card.insertAdjacentElement('afterend', note);

  const timers = [];
  requestAnimationFrame(() => {
    /* 满框而盖:印面=按钮实测选框 */
    const r = eb.getBoundingClientRect();
    const S = Math.max(14, Math.round(Math.min(r.width, r.height)));
    wrap.querySelectorAll('.ic-stamp').forEach((svg) => {
      svg.setAttribute('width', S); svg.setAttribute('height', S);
      svg.style.margin = (-S / 2) + 'px 0 0 ' + (-S / 2) + 'px';
    });
    const s = (n) => wrap.querySelector('.s' + n);

    /* 四拍(她逐轮验收的节奏):1.5 接触 / 2.1 碾一 / 2.7 碾二 / 3.3 墨定 / 3.9 款 */
    timers.push(setTimeout(() => { card.classList.add('imprint-pressed'); s(1).classList.add('on'); }, 1500));
    timers.push(setTimeout(() => { s(2).classList.add('on'); wrap.style.transform = 'translateX(.4px)'; }, 2100));
    timers.push(setTimeout(() => { s(3).classList.add('on'); wrap.style.transform = 'translateX(-.3px)'; }, 2700));
    timers.push(setTimeout(() => {
      card.classList.remove('imprint-pressed'); wrap.style.transform = '';
      s(4).classList.add('on'); eb.classList.add('stamped');
    }, 3300));
    timers.push(setTimeout(() => { note.classList.add('shown'); }, 3900));
  });

  /* 退场三路之二:点钮(使命达成)/ 删卡;第三路(第二条摘录)在 maybePlay 入口 */
  eb.addEventListener('click', retireImprintHint, { once: true });
  const del = card.querySelector('.delete-btn');
  if (del) del.addEventListener('click', retireImprintHint, { once: true });

  imprintHint = { card, eb, wrap, note, timers };
}

function retireImprintHint() {
  const h = imprintHint;
  if (!h) return;
  imprintHint = null;
  h.timers.forEach(clearTimeout);
  if (h.note) { h.note.classList.remove('shown'); h.note.classList.add('bye');
    setTimeout(() => { if (h.note.parentNode) h.note.remove(); }, 600); }
  h.card.classList.remove('hinting', 'imprint-pressed');   // 恢复悬停门禁
  h.eb.classList.remove('stamped');                        // 线稿归位
  if (h.wrap) { h.wrap.style.opacity = '0';
    setTimeout(() => { if (h.wrap.parentNode) h.wrap.remove(); }, 500); }
}

/* ── Flyleaf self-highlight(openspec: flyleaf-self-highlight)───────────────
   扉页·句子自划:毕业前(bayaaz_imprint_hint_shown 未设)的空面上,
   一道荧光笔痕划过 "Highlight a passage",湿亮一拍后干成 56% 常驻笔痕。
   入场编排 0.6/1.3/4.2s;中途离场即清;每页面生命周期至多一次。 */

let flyleafPlayed = false;
let flyleafCleanup = null;

async function maybePlayFlyleafSweep() {
  const unveil = () =>
    document.documentElement.classList.remove('flyleaf-pending');
  if (flyleafPlayed) return;
  if (document.body.dataset.state !== 'empty') { unveil(); return; }
  const target = document.getElementById('hlSweepTarget');
  const hintEl = target ? target.closest('.empty-hint') : null;
  if (!target || !hintEl) { unveil(); return; }
  const stored = await chrome.storage.local.get(IMPRINT_HINT_KEY);
  if (stored[IMPRINT_HINT_KEY]) {
    // 已毕业但镜像缺失(如仅清了 localStorage):补镜像、立即揭幕,自愈
    try { localStorage.setItem(IMPRINT_HINT_KEY, '1'); } catch (_) {}
    unveil(); return;
  }
  if (document.body.dataset.state !== 'empty') { unveil(); return; } // await 间隙已剪藏
  flyleafPlayed = true;

  const win = document.createElement('span'); win.className = 'flyleaf-sweepwin';
  const ink = document.createElement('span'); ink.className = 'flyleaf-sweepink';
  win.appendChild(ink);
  target.insertBefore(win, target.firstChild);
  const W = target.offsetWidth + 8;
  ink.style.width = W + 'px';

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = [];
  if (reduce) {
    win.style.width = W + 'px'; ink.classList.add('dry');   // 免动效:直呈干痕
    unveil();
  } else {
    timers.push(setTimeout(unveil, 600));                   // 揭幕:hint 首次登场
    timers.push(setTimeout(() => { win.style.width = W + 'px'; }, 1300));
    timers.push(setTimeout(() => ink.classList.add('dry'), 4200));
  }
  flyleafCleanup = () => {
    timers.forEach(clearTimeout);
    unveil();
    if (win.parentNode) win.remove();
    flyleafCleanup = null;
  };
}

window.addEventListener('load', () => setTimeout(maybePlayFlyleafSweep, 250));
