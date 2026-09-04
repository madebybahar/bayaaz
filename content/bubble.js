'use strict';

// ── Bayaaz Bubble ──────────────────────────────────────────────────────────────
// All interaction is handled via document-level capture listeners to bypass
// page event systems (React delegation, Twitter, Claude, etc.)

(function () {
  let bubble = null;
  let pendingDispatch = null;
  let mousedownOnBubble = false;

  function createBubble() {
    if (bubble) return;
    bubble = document.createElement('div');
    bubble.id = 'bayaaz-bubble';
    document.documentElement.appendChild(bubble);
  }

  function showBubble(x, y, dispatchFn) {
    createBubble();
    pendingDispatch = dispatchFn;
    mousedownOnBubble = false;

    bubble.style.left = x + 'px';
    bubble.style.top  = y + 'px';

    bubble.classList.remove('visible');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (bubble) bubble.classList.add('visible');
      });
    });
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('visible');
    mousedownOnBubble = false;
  }

  // ── mousedown capture ─────────────────────────────────────────────────────
  // Fires before React's container listeners and before content.js's mouseup.
  document.addEventListener('mousedown', (e) => {
    if (!bubble) return;

    if (e.target === bubble) {
      // Click on bubble:
      // • preventDefault keeps the text selection alive
      // • stopPropagation prevents the event from reaching React / page handlers
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // also stops other document-level listeners
      mousedownOnBubble = true;
      return;
    }

    // Click elsewhere — hide bubble
    hideBubble();
    pendingDispatch = null;
  }, { capture: true });

  // ── mouseup capture ───────────────────────────────────────────────────────
  // Trigger dispatch when mouse is released after pressing the bubble.
  // Using mouseup instead of click avoids React synthetic click interference.
  document.addEventListener('mouseup', (e) => {
    if (!mousedownOnBubble) return;
    mousedownOnBubble = false;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    hideBubble();
    if (pendingDispatch) {
      const fn = pendingDispatch;
      pendingDispatch = null;
      fn();
    }
  }, { capture: true });

  window.__bayaazBubble = { show: showBubble, hide: hideBubble };
}());
