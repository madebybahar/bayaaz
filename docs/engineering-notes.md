# What a Passage Goes Through Before It Becomes a Card

*Engineering notes from the clipping pipeline*

> The design behind it lives in [*Writing an Old Book in Code*](design-notes.md). 中文版：[engineering-notes.zh.md](engineering-notes.zh.md)。

Real web pages are rarely clean documents: what looks like a list is just tags sitting side by side, selections clone back empty, and the browser may kill the extension itself at any moment. The engineering of clipping first restores the author's original structure, then makes the text stand steady on a card. These notes are for people building clippers and browser extensions: eight acts along one passage's journey from selection to image, each entry a pit actually fallen into and a technique that transfers, all traceable to their lines in the source.

---

## 1. Getting the selection back

The selection is the source of the whole pipeline, and the browser's selection cannot be trusted: one that crosses a shadow DOM boundary is silently redirected to the host's edge and `cloneContents()` clones out a blank; the page's own scripts may clear it first; canvas apps have no DOM selection at all.

- **Three capture paths, each with a fallback**: on mouseup the selection is cloned and stored synchronously and read again 50 ms later, since the page's own handlers may have cleared it; keyboard selections come in on keyup; canvas apps like Google Docs have no DOM selection at all, so the copy event's clipboard HTML is taken instead.
- **The copy path runs the same pipeline**: with a real DOM selection, a site's Copy button and ⌘C go through the same extractor, so the result is identical to the letter and absorbed by deduplication; a degraded path would produce a second card in a different format.
- **The context menu's selection text has its line breaks flattened**: the menu delivers plain text only, so the Markdown cached on mouseup is requested from the content script first, and plain text is the fallback when no script is present.
- **An obscure right answer**: `Selection.getComposedRanges({ shadowRoots })` rebuilds a Range that truly lies inside an open shadow root, keeping a code block's highlighting and language label; the candidate elements must include the child at `anchorOffset`, which is exactly where host-level redirection parks the selection. The day MDN wrapped its code blocks in `<mdn-code-example>`, this road brought them back.
- **Language detection must pass through walls too**: climbing up from a code node uses `getRootNode().host` to cross shadow boundaries, so a `language-` class outside a custom element can still be found.

## 2. Straightening dirty structure

The DOM's structure is often not what the eye sees: lists that are not lists, duplicates that do not look alike, a first heading that is not the title. Repairs happen on the clone, scoped per site, so every other website is left alone.

- **Recognise fake lists per site**: some publishing platforms mark list items as `<ul> > <section>`, which Turndown cannot recognize, scattering the list into paragraphs: normalize sections back to `<li>` per `location.hostname` before converting.
- **Gather orphan list items**: when a selection cuts through a list, `cloneContents()` keeps the `<li>` but drops the parent `<ul>`: consecutive orphaned `<li>` are gathered into a new list by a cursor buffer.
- **Deduplicate after normalising**: the same paragraph can arrive twice down two capture paths, looking different (fenced vs plain, whitespace drift): the dedup key strips fence lines and collapses whitespace before comparing.
- **The first h1 is not always the title**: on GitHub it is the site-wide search box, so a clip came out titled "Search code, repositories…" and its filename fell back to a UUID. The search now looks for an h1 inside the body region (`article`, `main`, `[role=main]`) that sits in no search box, nav, header, footer, form or aside, then falls back to `og:title`, and only then to `document.title`.
- **A cut into a blockquote or code block needs its shell back**: the clone yields only the inside and Turndown loses the meaning; only the innermost missing ancestor is restored, by common ancestor, and a code block also gets its code tag back with its language class.

## 3. The rules of transcription

Turning HTML into Markdown has a few rules, most of them learned from particular websites.

- **Every site has its quirks**: Substack's italics emit `_` and leave orphan underscores, so `emDelimiter:'*'` is forced and `<u>` removed; X's images leak as `![]()` noise, so `img` and `figure` are dropped; MDN ships link titles containing parentheses that crash downstream regexes, so the rule always emits `[text](url)` and never a title.
- **Links are absolutized on the way out, and only http and https pass**: relative links are absolutized with `new URL(href, location.href)`, or the exported `.md` is full of dead links in a local notes vault; the inline regex must recognise Turndown's three outputs, the plain link, the angle-bracket form for URLs with parentheses, and the autolink; mailto, javascript and relative paths keep their text and lose the URL, closing an injection surface on the way; in-page anchors degrade to plain text and citation marks are removed whole.
- **Escaping is a round trip**: what Turndown hands a rule is already escaped, so a citation mark `[4]` arrives as `\[4\]` and the regex must match both forms, and ordered lists come out as `1\.`, unescaped before rendering; in the other direction, bare parentheses in URLs are escaped on the way out, and the `\*` Turndown adds is restored before rendering, or bold shows as bare asterisks, the stray backslash in RTL text like `\[ترميم\]` most visibly.
- **A language hint on the pre is invisible to Turndown**: the fenced-code rule reads only the code element's class, so the pre-level language is promoted onto code before conversion, and whole-block and partial selections share one regex.
- **Cleaning happens at the exits**: non-breaking spaces, empty paragraphs and empty links are cleaned once each at render, export and copy, while storage keeps the original for editing; stripping empty-text links uses a negative lookbehind to protect image syntax.
- **Carry the fork all the way down**: code and blockquote blocks hold an array of lines rather than a plain-text field, and feeding them to the line-by-line routine throws. Once the first fenced card landed in the list, every plain-text copy failed with it, and the button looked dead.

## 4. Protect first, then render

The side panel renders Markdown without a library. `marked` and `markdown-it` turn Markdown into HTML in a single pass; here four things have to go in *mid-conversion*: placeholder protection, pangu spacing, the drop-cap decision, and no-break wrapping for technical identifiers — each needs to dictate where escaping happens, and a library seals that step off. So the chain is written by hand: 55 lines of block parsing, 85 inline, 42 to assemble.

Inline Markdown's regexes maul each other: the italics rule eats underscores inside URLs, an `*` inside code reads as a bold marker.

- **Extract, placehold, restore**: code, links, and technical identifiers are pulled out first, each leaving a NUL sentinel (`\x00C`, `\x00L`, `\x00N`), and every dangerous regex runs before they are returned class by class.
- **Nesting needs a second pass**: a code placeholder inside a link's text is restored again when the link is restored, or mojibake leaks onto the card.
- **Ordering is itself protection**: pangu spacing, which slips a space between CJK and Latin, runs after link and code extraction, so a URL never gets a space pushed into it.
- **URLs need placeholders in plain-text copy too**: in the "text (url)" form the italic rule eats the underscores inside a URL and Learn_web_development becomes a dead link; the URL takes a placeholder first and is restored untouched afterwards.

## 5. The side-panel card's layout

Once an excerpt lands in a side-panel card, the layout can still go wrong: the height lies, the fold cuts through a line, and a theme stylesheet loaded later overrides the language rules.

- **Constants follow line height**: the threshold for folding a long card was fixed at 220 pixels, measured against Latin and Chinese line heights, about seven and a half lines. Nastaliq runs at 2.5, so six lines cross it and a short card grows a "Read more" that opens onto nothing. Measuring before the fonts have loaded also comes out too large, and a change in panel width leaves the fold line stale; The card is now measured again once the fonts are ready, and again whenever the width changes.
- **An explicit floor displaces the implicit one**: a card was given a `min-height` so that a one-line card could hold the action column at its right. Every card in the list was pressed flat instead, body text spilling out. An explicit `min-height` replaces the `min-height:auto` a flex item carries by default, and from then on `flex-shrink` is free to compress it. One line of `flex-shrink:0` settles it.
- **The fold lands on a block boundary**: within 220 px the cut is the bottom of the last whole block, falling back to 200 when that is below 160; a cut more than 16 px from the threshold is pulled back to it, avoiding half-cut lines and a "Read more" that reveals one line.
- **A theme stylesheet loaded later overrides language rules**: theme files load after the base sheet, and at equal specificity the later one wins; language and direction rules double the attribute selector to gain a step, and the theme files stay untouched.

## 6. Staying alive in MV3

MV3 has no resident background: the service worker is killed after roughly five idle minutes, a reload orphans the scripts in open pages, and the side panel is a window-level thing. The entries in this act are all about keeping state alive and closing timing gaps inside that lifecycle.

- **Fragments queue until the panel is up**: cold start takes about 200 ms, so the background buffers fragments and flushes them on ready; a failed send goes back to the head of the queue for the next connection.
- **Async storage is not there before first paint**: the one-time onboarding flag is mirrored into synchronous localStorage and the class is set at the top of the script, or the element appears and is then hidden, one frame's flash.
- **Opening the side panel must stay attached to the user gesture**: all three entry points open the panel first and probe the content script after, never awaiting the probe first, or the gesture context is lost and the browser refuses.
- **Disconnect and close are handled apart**: confuse the two and every idle period wrongly kills the clipping state. The split: `onDisconnect` only clears the port reference and never pushes state; a real close is reported explicitly by the sidebar's `pagehide`, carrying its own tabId, because a racing onDisconnect may have already wiped the background's record.
- **Flags go stale, so ask again when it matters**: the content script's "is the panel open" flag drifts after navigation or a background restart, so a false flag on mouseup triggers a fresh query; the background also pushes the state once on page load and once before the panel reports ready, closing the gap.
- **Side-panel state hangs on the window**: Chrome's side panel is window-scoped by nature, windowId is the single source of truth, and tabId only follows the active tab; closing broadcasts per window, or other tabs keep feeding the queue.
- **Re-inject after a reload**: after an extension reload, content scripts in existing tabs become orphans and clipping silently degrades to plain text: on `onInstalled`, send every page a `PING`; only scripts injected by this instance answer, and the silent ones are re-injected in the manifest's original order. Main-world scripts are shared across extension instances: after a reload the old script keeps running and re-injection would stack a second observer, so the idempotence guard has to live inside the script; the isolated world is rebuilt per instance and needs none.
- **Every interception has a matching release**: content-level deduplication blocks re-dressed duplicates, but deleting a card or clearing the panel must broadcast a reset to every page, or "deleted by mistake, clip again" silently jams.

## 7. Set on the export card

The export card in the Imprint Studio is a second typesetting. Once the text is in it, the first letter, the direction and the glyphs were each lost once; the font files, editing mode and the heights of twelve papers each had a pit of their own.

- **Ask the script before wrapping the first letter**: the drop-cap wrapper treats every script alike, while the stylesheets for the Arabic, Devanagari and Hangul tiers set the dropped letter to display nothing. Each rule is sound; together they delete the first character: في is left as ي, 홀로 as 로, एकांत as कांत. The wrapper now checks the script first, and connected and syllabic scripts are never wrapped.
- **Leave direction to the bidi algorithm**: the colophon date on a right-to-left card came out as month-year-day. Neither content nor order was wrong; the container had not declared `direction:rtl`. Once it does, the browser puts the digits and the month name where they belong.
- **A font that fails to load fails silently**: an `@font-face` path missing its `-subset` suffix dropped Nastaliq back to the system Naskh, four finished images went out carrying the wrong forms, and four rounds of automated checks raised nothing. A distinctive script can only be checked by eye, enlarged.
- **Check each face rendered in the style it declares**: Google Fonts' stylesheet lists the italic first, the two files were saved the wrong way round, and every label came out italic.
- **Editing mode must be exempt from global shortcuts**: the guard stopped at inputs and missed contenteditable, so typing in the body switched papers on space and exported on enter; the editable check was added.
- **Twelve cards share one median anchor**: each card is measured hidden at its natural height, the median becomes the reference, tall cards shrink and short ones grow by at most 1.12, so the same passage does not jump when switching papers.

## 8. Exporting the image

The last step turns the card into an image and a filename.

- **Content arrives late, so fit more than once**: storage lands after the first fit and fonts after the content; fonts ready, fonts loaded and a size change each trigger another fit, export waits for fonts once more, and a busy state blocks double clicks.
- **The scale is reset only on the clone**: html-to-image needs the scale reset to measure natural size, but the reset touches only the library's internal clone: zeroed `transform` and stripped shadows happen inside the clone, width and height pinned to fill the canvas; the card in the preview never flickers.
- **Canvas has a ceiling, so the pixel ratio cannot be fixed**: canvas tops out at 16384 pixels, and at a ratio of 3 a very tall card fails silently; a guard that shrank the ratio with size was built once and removed in a wholesale rollback; the ratio is fixed at 3 today and the pit is still open.
- **Measure the cut-off against real titles**: one real exported title came to 63 characters, while the earlier limit of 40 was too cautious and kept cutting sentences in half, and 64 still sits inside the safe range for Finder and path length. The cut lands on a word boundary, so `do-not-w` becomes `do-not`.
- **The export page names its opener to return to the article**: the new tab is opened with the article tab as opener, so closing the export page returns to the text; if the opener is already gone, it retries without one.
- **Local preview runs on built-in sample data, but cannot test CSP**: when `chrome.storage` is out of reach the page falls back to its sample data, so a `file://` double-click is a complete development preview. Extension pages forbid inline scripts, though, so a page that works locally renders blank once installed; scripts moved to files, and the equivalent CSP header reproduces it locally.

---

— Bahar

---

The other notes, specimens and files:

- [*Writing an Old Book in Code*](design-notes.md)
- [*The Multilingual Specimen Book*](specimens.md)
- [*The Multilingual Typography Registry*](typography.md)
- [*The Twelve Papers*](papers.md)
- [*Bundled Fonts — Attribution & License*](../fonts/README.md)
- [Back to the README](../README.md)
