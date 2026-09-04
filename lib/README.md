# Bundled Libraries — Attribution & License

The two libraries in this directory are bundled locally (offline, no remote / CDN), the
same way the fonts are. 中文版：[README.zh.md](./README.zh.md)。 Both are **MIT** licensed;
the full texts are in [`turndown-LICENSE.txt`](./turndown-LICENSE.txt) and
[`html-to-image-LICENSE.txt`](./html-to-image-LICENSE.txt).

| File | Library | Copyright / Author | License | Source |
|---|---|---|---|---|
| `turndown.js` | Turndown | © 2017 Dom Christie | MIT | github.com/mixmark-io/turndown |
| `html-to-image.min.js` | html-to-image | © 2017–2026 W.Y. (bubkoo) | MIT | github.com/bubkoo/html-to-image |

> **Versions are not recorded.** Both files were vendored as build artefacts and carry no
> version banner — the minifier stripped it from `html-to-image.min.js`, and the browser
> UMD build of Turndown never had one. Hash-matching against the published npm releases did
> not identify either file. Any future vendored dependency records its version here on the
> day it lands.

## Where they're used

- **`turndown.js`** — HTML → Markdown transcription. Injected into the page alongside
  `content/content.js` (see `background/service_worker.js`), so the conversion happens on the
  live DOM where the selection was made, with the page's own structure still intact.
- **`html-to-image.min.js`** — renders the finished card to a PNG on the export page
  (`export/samplebook.js`). It runs entirely in the browser; nothing is uploaded.

## Why they are vendored rather than installed

This extension ships with no build step and no `node_modules`: clone it, load the unpacked
folder, and it runs. A package manager would put a lockfile and an install step between the
reader and a working extension, for two files that change once a year.

The cost of that choice is this document — vendored code has to carry its own attribution,
because there is no `package.json` doing it.
