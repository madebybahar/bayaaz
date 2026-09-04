'use strict';

let sidebarPort = null;
const fragmentQueue = [];

// Track which tab has the sidebar open so we can notify content scripts.
// The panel itself is WINDOW-scoped in Chrome: sidebarWindowId is the source of
// truth for "is the sidebar open here"; sidebarTabId follows the active tab of
// that window (for dedup-reset targeting and the export return-focus handshake).
let sidebarTabId = null;
let sidebarWindowId = null;

// Broadcast sidebar-closed to every http(s) tab of the window. A single-tab
// notify is not enough once auto-clip is window-scoped: other tabs would keep
// capturing into fragmentQueue and flood the next sidebar session.
function broadcastSidebarClosed(windowId) {
  const filter = { url: ['http://*/*', 'https://*/*'] };
  if (windowId != null) filter.windowId = windowId;
  chrome.tabs.query(filter, (tabs) => {
    for (const t of tabs) {
      if (t.id) chrome.tabs.sendMessage(t.id, { type: 'SIDEBAR_STATE', isOpen: false }).catch(() => {});
    }
  });
}

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Context menu — only visible when text is selected
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'bayaaz-clip',
    title: 'Keep in Bayaaz',
    contexts: ['selection'],
  });
  reinjectContentScripts();
});

// ── Re-inject content scripts into tabs opened before install/update ──────────
// After an extension reload, content scripts in already-open tabs are orphaned:
// auto-clip dies silently and the context-menu path degrades to plain
// info.selectionText (no markdown, newlines collapsed). Re-inject so those tabs
// recover full Markdown clipping without a manual page refresh.
// Ensure the content script is live on ONE tab. PING probes liveness; a tab that
// was open before install/update/reload (or holds an orphaned copy) rejects → inject.
// Called on sidebar-open so select-to-clip works without first using the context menu.
async function ensureContentScript(tabId) {
  if (!tabId) return;
  try {
    // Liveness probe: a script from THIS instance answers; an absent/orphaned one rejects.
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  } catch (_) {
    try {
      // Mirror the manifest content_scripts declarations: MAIN-world shadow
      // flattener first, then turndown + content.js in the isolated world.
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/flatten-shadow-dom.js'],
        world: 'MAIN',
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['lib/turndown.js', 'content/content.js'],
      });
    } catch (_) {
      // Restricted page (web store, PDF viewer, discarded tab…) — skip silently.
    }
  }
}

async function reinjectContentScripts() {
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  } catch (err) {
    console.error('[SW] reinject: tabs.query failed:', err);
    return;
  }
  for (const tab of tabs) await ensureContentScript(tab.id);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'bayaaz-clip' || !tab?.id) return;
  const tabId = tab.id;
  const plainText = (info.selectionText || '').trim();
  if (!plainText) return;

  chrome.sidePanel.open({ tabId }).catch(console.error);
  ensureContentScript(tabId);   // inject if this tab pre-dates install/reload, so later select-to-clip works

  // Tell content script the sidebar is now open so auto-clip activates immediately.
  // This fires before SIDEBAR_READY arrives, closing the timing gap.
  chrome.tabs.sendMessage(tabId, { type: 'SIDEBAR_STATE', isOpen: true }).catch(() => {});

  // Ask content script for the Markdown version (preserves bold, links, etc.)
  // Fall back to plain text from info.selectionText if content script doesn't respond
  chrome.tabs.sendMessage(tabId, { type: 'CLIP_CACHED_SELECTION' })
    .catch(() => {
      // Content script unavailable — queue plain text directly
      const payload = { text: plainText, title: tab.title || '', url: tab.url || '' };
      if (sidebarPort) {
        try { sidebarPort.postMessage({ type: 'DELIVER_FRAGMENT', ...payload }); }
        catch (_) { sidebarPort = null; fragmentQueue.push(payload); }
      } else {
        fragmentQueue.push(payload);
      }
    });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  ensureContentScript(tab.id);   // inject if this tab pre-dates install/reload → select-to-clip works without right-click first
  // Notify content script immediately so auto-clip activates without waiting for
  // the SIDEBAR_READY handshake (same pattern as the context-menu path).
  notifyContentScript(tab.id, true);
});

// ── Notify content script of sidebar state ────────────────────────────────────
function notifyContentScript(tabId, isOpen) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { type: 'SIDEBAR_STATE', isOpen })
    .catch(() => {}); // tab may not have content script (e.g. chrome:// pages)
}

// On page navigation in the sidebar's tab, push SIDEBAR_STATE:true to the new
// content script. Prevents the "right-click required on every new page" problem
// caused by the new content script starting with sidebarOpen=false before the
// SW→sidebar handshake completes. Only fires when SW is awake (sidebarPort set).
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' && sidebarPort && tabId === sidebarTabId) {
    notifyContentScript(tabId, true);
  }
});

// The panel is window-scoped: when the user switches tabs in the sidebar's
// window, the binding follows — the newly active tab gets auto-clip enabled
// immediately (no right-click needed on each new article), and the sidebar
// updates its myTabId so dedup-reset and export return-focus point at the
// article actually being read.
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  if (!sidebarPort || windowId !== sidebarWindowId) return;
  sidebarTabId = tabId;
  notifyContentScript(tabId, true);
  try { sidebarPort.postMessage({ type: 'ACTIVE_TAB_CHANGED', tabId }); }
  catch (_) { /* port gone — next SIDEBAR_READY re-syncs */ }
});

// ── Port from sidebar ─────────────────────────────────────────────────────────
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidebar') return;
  sidebarPort = port;

  port.onMessage.addListener((msg) => {
    if (msg.type === 'SIDEBAR_READY') {
      // Sidebar tells us which tab and window it belongs to
      sidebarTabId = msg.tabId ?? null;
      sidebarWindowId = msg.windowId ?? null;
      notifyContentScript(sidebarTabId, true);
      // Now flush queued fragments
      while (fragmentQueue.length > 0) {
        const frag = fragmentQueue.shift();
        try { port.postMessage({ type: 'DELIVER_FRAGMENT', ...frag }); }
        catch (_) { fragmentQueue.unshift(frag); break; }
      }
    }
  });

  port.onDisconnect.addListener(() => {
    // Do NOT send isOpen:false here — this fires on service-worker idle as well as
    // on real sidebar close, and falsely resets content-script auto-clip state.
    // The sidebar sends SIDEBAR_READY on every reconnect, which re-asserts isOpen:true.
    sidebarPort = null;
    sidebarTabId = null;
    sidebarWindowId = null;
  });
});

// ── Messages from content script ──────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id;

  if (message.type === 'GET_SIDEBAR_STATE') {
    // Content script querying on init — reply with current state for this tab
    const isOpen = !!sidebarPort && sidebarTabId === tabId;
    return Promise.resolve({ isOpen });
  }

  if (message.type === 'OPEN_SIDEBAR') {
    if (tabId) {
      chrome.sidePanel.open({ tabId })
        .catch((err) => console.error('[SW] sidePanel.open() FAILED:', err));
      ensureContentScript(tabId);   // keep this tab's content script live for select-to-clip
    }
    return false;
  }

  if (message.type === 'SIDEBAR_CLOSING') {
    // Sidebar document is unloading — a real close (the panel's own port.onDisconnect
    // can't tell this apart from a service-worker idle disconnect, so it stays silent).
    // Auto-clip is window-scoped, so the whole window must hear the close — a
    // single-tab notify would leave other tabs capturing into fragmentQueue.
    // Use the ids the sidebar sent (state may already be nulled by a racing onDisconnect).
    const w = message.windowId ?? sidebarWindowId;
    sidebarPort = null;
    sidebarTabId = null;
    sidebarWindowId = null;
    broadcastSidebarClosed(w);
    return false;
  }

  if (message.type === 'CLOSE_SIDEBAR') {
    const windowId = message.windowId ?? sidebarWindowId;
    // Close via the sidebar's own button — reliably tell all the window's content
    // scripts first (this message always lands, unlike the pagehide path).
    broadcastSidebarClosed(windowId);
    if (windowId) {
      chrome.sidePanel.close({ windowId }).catch(console.error);
    }
    return false;
  }

  if (message.type === 'ADD_FRAGMENT') {
    const payload = { text: message.text, title: message.title, url: message.url };
    if (sidebarPort) {
      try {
        sidebarPort.postMessage({ type: 'DELIVER_FRAGMENT', ...payload });
      } catch (err) {
        sidebarPort = null;
        fragmentQueue.push(payload);
      }
    } else {
      fragmentQueue.push(payload);
    }
    return false;
  }
});
