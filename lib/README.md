# Bundled Libraries — Attribution & License

The two libraries in this directory are bundled locally (offline, no remote / CDN), the same way the [bundled fonts](../fonts/README.md) are. Both are **MIT** licensed; the full texts are in [`turndown-LICENSE.txt`](./turndown-LICENSE.txt) and [`html-to-image-LICENSE.txt`](./html-to-image-LICENSE.txt).

中文版：[README.zh.md](./README.zh.md)

| File | Library | Copyright / Author | Source |
|---|---|---|---|
| `turndown.js` | Turndown | © 2017 Dom Christie | github.com/mixmark-io/turndown |
| `html-to-image.js` | html-to-image | © 2017–2026 W.Y. (bubkoo) | github.com/bubkoo/html-to-image |

> **Versions**: `html-to-image` 1.11.13, byte-identical to the official `dist/html-to-image.js`;
> `turndown` 7.2.4, identified by its function inventory and code fingerprints — the local copy
> has its comments stripped, so it is not byte-identical to the published file. Neither file
> carries a version banner; both versions were established by comparison. Any future vendored
> dependency records its version here on the day it lands.

## Where they're used

- **`turndown.js`** — HTML → Markdown transcription. Injected into the page alongside
  `content/content.js` (see `background/service_worker.js`), so the conversion happens on the
  live DOM where the selection was made, with the page's own structure still intact.
- **`html-to-image.js`** — renders the finished card to a PNG on the export page
  (`export/samplebook.js`). It runs entirely in the browser; nothing is uploaded.

## Why they are vendored rather than installed

This extension ships with no build step and no `node_modules`: clone it, load the unpacked
folder, and it runs. A package manager would put a lockfile and an install step between the
reader and a working extension, for the sake of two files.

The cost is attribution by hand: no `package.json` records where these two files came from,
so this document does.
