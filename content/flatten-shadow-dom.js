// Runs in MAIN world — has direct access to shadow roots.
// Copies each shadow root's innerHTML into data-shadow-content so the
// isolated content script can read it during Markdown conversion.
// Also watches for dynamically added elements (e.g. Gemini chat responses).

(function () {
  'use strict';

  // MAIN world is shared across extension instances: a copy injected before an
  // extension reload keeps running here. Guard so re-injection (onInstalled)
  // doesn't stack a second MutationObserver doing the same work.
  if (window.__bayaazShadowFlattened) return;
  window.__bayaazShadowFlattened = true;

  function flattenNode(root) {
    root.querySelectorAll('*').forEach(function (el) {
      if (el.shadowRoot) {
        try {
          el.setAttribute('data-shadow-content', el.shadowRoot.innerHTML);
          flattenNode(el.shadowRoot);
        } catch (e) {
          // Cross-origin or closed shadow roots — skip
        }
      }
    });
  }

  // Initial pass
  flattenNode(document);

  // Watch for dynamically added elements (SPAs, chat apps like Gemini)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 /* ELEMENT_NODE */) {
          flattenNode(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}());
