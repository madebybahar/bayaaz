# Multilingual Typography Registry

> The reasons live in chapters 3–4 of [*Writing an Old Book in Code*](design-notes.md). 中文版：[typography.zh.md](typography.zh.md)。

The values shipped in the cards, script by script, with the specs they follow and the places they deliberately depart. The multilingual specimens have a book of their own: [*The Multilingual Specimen Book*](specimens.md). The registry follows a passage's path: first it is recognized, then its face is set, then the body, and last the colophon.

## 1. Recognise the script

### Sorting scripts: five tiers, four sub-tags

A passage is first sorted into a tier, and the tier sets its face, line height and alignment; a sub-tag only fine-tunes within the tier.

| Tier | Takes | Sub-tag |
|---|---|---|
| `zh` | text that is mostly Han characters | `ja` Japanese (kana present) |
| `en` | Latin script | — |
| `other` | Hangul, Devanagari, Thai and other non-Latin scripts | `ko` Korean, `hi` Devanagari |
| `rtl` | Arabic, Hebrew | — |
| `rtl-ur` | Urdu, Persian | `fa` Persian |
| `vi` | Vietnamese, export card only | — |

- **Latin is judged last**: the order is right-to-left → Chinese and Japanese → other non-Latin → Vietnamese → Latin. That is what keeps a Korean passage containing "PDF" from being read as English.
- **The right-to-left ranges**: Hebrew U+0590–05FF, and Arabic's main, supplement, extended-A and two presentation-form blocks (U+0600–06FF, 0750–077F, 08A0–08FF, FB50–FDFF, FE70–FEFF); dominance compares only these against Latin letters, and Han and Hangul do not count.
- **Sub-tags only fine-tune**: face, line height, and the colophon's calendar and digits (`fa` switches to the solar calendar, `hi` to Devanagari digits); no tier of their own.
- **Persian is inferred by absence**: Persian and Urdu share a tier; any Urdu-only letter `ٹ ڈ ڑ ں ھ ے ہ` means Urdu, otherwise Persian. A lone word built only from shared letters is judged Persian, and `بیاض` is one of them.
- **Entering the tier and being judged Urdu use two different alphabets**: entry into `rtl-ur` looks for 12 letters `ٹ پ چ ڈ ڑ ژ ک گ ں ھ ے ی`, the Urdu test for 7 `ٹ ڈ ڑ ں ھ ے ہ`; text with `گ` or `ژ` but none of the seven (Kurdish, some Persian) enters the tier and is judged Persian, in Vazirmatn.
- **Vietnamese swaps two font slots**: the subhead and the bookplate's source line, because Pinyon and Cinzel lack Vietnamese diacritics. The side panel has no such tier; Vietnamese there is set as English.
- **No language attribute on the page**: both pages are English pages and cards carry only the tier mark, never lang or dir; the browser therefore cannot pick CJK glyph variants by language, and the font stacks and unicode-range locks do that work.

### Judging mixed text

- **Whole passage, non-Latin first**: Korean with "PDF" in it is still Korean.
- **Right-to-left is decided by dominance**: a mostly-Latin passage with a few Arabic letters stays Latin — an English sentence containing بیاض still runs left to right.
- **An Arabic word inside English text**: it is shown in the bundled Naskh, aligned with the Latin around it; Nastaliq is reserved for passages that are Urdu throughout.
- **Which face Latin lands on inside a tier**: Latin letters and digits inside the `other` tier land on the first face in the stack without a unicode-range lock, Zen Old Mincho's own Latin on Japanese cards, LXGW WenKai's Latin on Korean, Devanagari and Thai cards; Latin inside Chinese cards uses Songti's own. Inferred from stack order, not yet checked on every device.
- **Pangu spacing, done two ways**: in the side panel a script inserts real spaces between ASCII letters or digits and Han or kana, leaving Hangul and accented Latin alone; it affects the display only and never enters the exported Markdown. The export card runs no script and relies on the browser's `text-autospace`, so on Chrome 116 to 148 the gap is absent. The gap's width is under Alignment.
- **Between Arabic and Latin**: no synthetic gap, an ordinary space is enough; the quarter-em gap is a creature of the character grid.

## 2. Give it a face

### The three right-to-left scripts

All three run right to left, and differ in face, form and era mark.

| Language | Font | Form | Date |
|---|---|---|---|
| Arabic | Vazirmatn | modern Naskh | Arabic digits with the era mark `م`, Gregorian |
| Persian | Vazirmatn | modern face | extended digits, solar calendar (Gregorian→Jalali, plain arithmetic) |
| Urdu | Noto Nastaliq Urdu | Nastaliq | extended digits with the era mark `ء`, Gregorian |

Persian in a modern face is deliberate: modern Persian prose and newspapers are set in Naskh-style modern faces, and Nastaliq is kept for poetry and calligraphy; the card takes the former.

### System font stacks

Scripts outside the bundle fall back to system fonts. Each script's stack names one system face for Mac, Windows and Linux, with a bundled face at the tail as the backstop. Chinese once lacked the Linux entry; Noto Serif CJK SC and Source Han Serif SC were added, with LXGW WenKai at the tail. Korean runs the other way: the system myeongjo comes first, and the bundled Nanum Myeongjo is only the fallback.
The side panel and the export card start their Chinese stacks differently: Songti TC (traditional forms) in the panel, Songti SC on the card; to be unified.

### Ranges and stack order

- **Each bundled face is locked to its ranges**: Korean to five Hangul blocks (U+1100–11FF, 3130–318F, A960–A97F, AC00–D7AF, D7B0–D7FF); the Japanese local stack to U+3000–30FF, 31F0–31FF, FF00–FFEF, 3400–4DBF, 4E00–9FFF, which includes CJK punctuation and the full-width block, so full-width punctuation on a Korean card is taken over by the Japanese mincho; Devanagari to U+0900–097F, A8E0–A8FF, 1CD0–1CFF.
- **The Japanese stack, in order**: Zen Old Mincho → local mincho (Hiragino Mincho ProN, Toppan Bunkyu, YuMincho, BIZ UDMincho, MS Mincho, Noto Serif CJK JP, IPAexMincho) → Nanum Myeongjo → LXGW WenKai → system-ui. Weights 600 to 700 have a local-only true bold face (Hiragino W6, Toppan Midashi, YuMincho Demibold, Noto Serif CJK JP Bold), and fall back to regular where none exists.
- **Subset sizes**: LXGW WenKai 3.7MB, WenJin Song 3.3MB, Zhuque Fangsong 4.1MB, Zen Old Mincho 1.9MB, Nanum Myeongjo 305KB, Noto Nastaliq Urdu 231KB, Noto Serif Devanagari 50KB, Vazirmatn 32KB. Zhuque Fangsong covers about 59% of traditional characters; missing ones on the letterpress paper fall to the system fangsong, then to WenJin Song.

### The title field and headings

- **The title field changes face by tier**: `rtl` takes Vazirmatn; `rtl-ur` takes Nastaliq at line height 2.2 with 3 px of padding below, so the descenders of `ض ج ے` are not clipped by the field; the Persian sub-tag returns to Vazirmatn at 1.7; `zh` and `vi` use the body face; `other` runs the Japanese, Devanagari and Korean local stacks with synthetic bold off.
- **Headings inside side-panel cards take one of three states**: when a card's first block is an h1 or h2 it becomes the opener, centred, 12 px, weight 500, 1 px of tracking, in the theme red, with a 28 px rule on either side, and such a card gets no drop cap; a heading further down with content after it becomes a section heading, 12 px, italic (true italic for Latin, upright for CJK, synthetic italics off), prefixed with "§ " in the theme red; a heading with nothing after it is hidden.
- **Headings inside right-to-left cards**: Nastaliq or Vazirmatn throughout, line height 2.2, no italics, the theme red; the "§" prefix the theme adds to second-level headings is removed on right-to-left cards.

## 3. Set the body

### Line height

Body size: 16 px on the export card, 14.5 px in the side panel. Line heights are listed for both; in the panel they are set by the tier and beyond the theme's reach.

| Script | Export card | Side panel | Spec | Note |
|---|---|---|---|---|
| Chinese | 1.95 | 1.95 | CLReq (at least half an em between lines) | Han characters fill the box with no ascenders or descenders; all the air between lines comes from line-height |
| Japanese | 2.0 | 2.0 | JLReq body about 1.7 | deliberately loose for display setting; 1.8 looked cramped on real devices |
| Korean | 1.8 | 1.8 | KLReq body about 1.7 | Hangul boxes are open, the most compressible of the CJK three |
| Devanagari | 1.9 | 1.9 | ILReq: markedly more than Latin | matras stack above and below, so vertical room must be generous |
| Arabic | 1.85 | 1.85 | ALReq in practice 1.7–1.9 | tall alifs and deep final strokes, plus dots and vowel marks |
| Persian | 1.85 | 1.85 | ALReq (covers the Arabic script generally) | modern Naskh, no need for Nastaliq's tall leading |
| Urdu | 2.5 | 2.5 | ALReq (covers the Arabic script generally); no set value for Nastaliq, tuned on real devices | sloping, stacked lines that interlock, the largest leading on the card |
| Latin | 1.76 | 1.95 | — | the panel shares the theme's Chinese value |

### Letter spacing & weight

- **Joined scripts (Arabic, Persian, Urdu)**: `letter-spacing` is banned in every slot; spacing cuts the joins, and browsers do not convert it into kashida stretching. Nastaliq suffers worst of all.
- **Devanagari**: zero — spacing would break its syllables and conjuncts (ILReq requires spacing by akshara).
- **Japanese and Korean micro-tracking**: CSS letter-spacing falls between character clusters and leaves CJK glyphs intact; the specs do not forbid it.
- **Side-panel micro-tracking**: 0.02em on Chinese and Latin body text in the panel; zero on Chinese export cards.
- **No synthetic bold**: a browser-synthesised bold flattens the thick-thin contrast of a Mincho face until it reads as a sans; where a real bold family exists it is used, and where none does the regular weight stays.
- **Italics are for Latin only**: in the panel's block quotes and second-level headings, Latin takes EB Garamond's true italic and Chinese stays upright in kai, with synthetic italics off.
- **Old-style figures**: the side panel's body text turns on onum and kern, which only Latin faces honour; on the export card old-style figures live in the date alone.

### Alignment & direction

- **Chinese**: justified (the CLReq character grid) with punctuation prohibitions; the drop cap, two characters wide and two lines tall, is Bayaaz's own form (CLReq has no drop cap).
- **How justification is spread**: by ideograph in the side panel, by character on the export card.
- **Latin**: left-aligned on the card, with no hyphenation; justified in the side panel, hyphenated by the English dictionary. A quarter-em gap between han characters and Latin (pangu spacing), likewise in Japanese (shibuaki); the space-inserting regex skips full-width punctuation, whose glyphs carry their own padding.
- **RTL**: right-aligned. Justification is dropped: CSS justify widens word spaces, while the Arabic tradition justifies by stretching the connecting strokes (kashida, ALReq) — on the web, right alignment is the safer setting, and Nastaliq takes right alignment only.
- **Digits in RTL run left to right**: the Unicode bidi algorithm treats digits as weakly directional; the container declares `direction:rtl`, and digit order is never reversed by hand.
- **Ceremonial centring is Latin-only**: Chinese is justified, other scripts left-aligned, right-to-left scripts right-aligned; the Latin "Ex Libris" label line is hidden for every non-Latin script.
- **Subhead and source**: the subhead stays centred in `rtl` and `rtl-ur`, at weight 500; in `other` the subhead takes 1 px of tracking at weight 500, the source 13 px with .3 px of tracking.
- **Balancing two lines**: `text-wrap:balance` only evens the two lines by length. It pays no attention to punctuation or phrasing; a break that lands on a comma is a coincidence of geometry.
- **Ornament is not mirrored on right-to-left cards**: the side panel's ◆ for unordered lists still hangs on the left, while ordered lists' native markers flip to the right with the direction; on export cards the ornaments of all twelve papers keep their left-to-right positions.

### Punctuation

- **Chinese & Japanese**: full-width punctuation sits in the character grid, with line-start and line-end prohibitions (`。、」` never open a line; `「(` never closes one).
- **Korean**: proportional punctuation with spaces, close to Latin habits (KLReq); the CJK full-width rules do not apply, the prohibition rules still do.
- **Arabic-script**: mirrored marks `،` (U+060C) `؛` (U+061B) `؟` (U+061F) sit tight against the preceding word, followed by a space, never at line start; the full stop is usually the Western `.`, placed by the right-to-left flow.
- **Proportional spacing**: Korean, Devanagari and Thai body text opens `palt`, so punctuation and symbols take proportional widths; Japanese switches it back off to keep its marks in the full-width grid.
- **Hanging punctuation works only in Safari**: the side panel's body declares first and last hanging, which Chrome has not implemented; CJK punctuation trimming is not set explicitly on either page and follows the Chromium default.

### Line breaking and hyphenation

English cards in the side panel hyphenate by the English dictionary at 10/4/4, so words of nine letters or fewer never break; Western words inside Chinese cards at 6/3/3; code, links and dotted or slashed identifiers (tape.systems, v1.2.3, OpenAI/gpt-4) never hyphenate. The export card does not hyphenate.

### Drop caps

On export cards only the first paragraph; the side panel has them too, in both themes. Ten of the twelve papers carry one; the bookplate and letterpress papers are centred and do without. Switchable in the Imprint Studio, and the switch hides itself on cards in joined or conjunct scripts. Chinese takes exactly two lines and sits on the character grid; Latin hangs in the Western manner.

| Where | Script | Size | Line height | Weight | Face and colour |
|---|---|---|---|---|---|
| export card | Chinese | 3.0 × body | 1.3, exactly two lines | regular | face follows the paper's group: WenJin Song for the inscriptional group, LXGW WenKai for the handwritten group, Zhuque Fangsong for the letterpress group; colour is the paper's accent |
| export card | Latin | 3.1 × body | 0.82 | 600 | the paper's display face; colour is the paper's accent, white with a shadow on the rubbing, gold on the illuminated manuscript |
| side panel | Chinese | 42 px | 0.82 | regular | Song face, theme accent |
| side panel | Latin | 48 px | 0.78 | regular | Cormorant Garamond, theme accent |

No drop cap when the paragraph opens with a quotation mark, bracket, title mark, dash or ellipsis; with a digit (chapter numbers, years, statistics, since a giant hanging numeral breaks the old-book look); on code cards (a giant hanging `#` breaks the meaning); or in the `other`／`rtl`／`rtl-ur` tiers, where wrapping the first letter swallows the first character of a joined or conjunct script. The side panel also skips heading cards, cards whose first block is not a paragraph, and all-bold paragraphs (WeChat-style bold used in place of a heading). The first character must be an ideograph or a Latin letter, extended ranges included, so Vietnamese `Đ` counts.
A known edge: the export card's punctuation list is a blacklist that omits `« » ¿ ¡`, so a paragraph opening with one of them still gets its first character wrapped; the side panel uses a whitelist and is unaffected.

### Code cards

Courier at 13.5 px, line height 1.7, left-aligned, line breaks kept, no hyphenation; this overrides every language tier, so a Chinese code card does not use the Song face either. Code blocks in the side panel may soft-wrap anywhere.

### Collapsing and truncation

A card taller than 220 px collapses, the same threshold for every script; a right-to-left card is left open unless at least two lines would be hidden, other scripts 40 px. The fade mask has three settings: by default it starts fading at 55% and is fully transparent at 87%; Arabic 45% and 88%; Nastaliq 30% and 90%, because the default gradient is drawn for Latin line heights and would cut Nastaliq strokes in half.

The cloned cards on the right-hand sample wall show only an opening: 180 characters for Chinese, 400 for other scripts, cut back to whitespace and given an ellipsis.

## 4. Sign off

### Dates

The colophon date follows each script's own form; Japanese and Korean write everyday dates in Arabic numerals too, so they follow the Latin card. In the three right-to-left scripts the date line resets font features so the face's own digits are used. Three digit sets, never mixed: urdu/Persian `۰-۹` (U+06F0), Arabic `٠-٩` (U+0660; the Maghreb often uses Western digits, the Mashriq set is used here), Latin `0-9`.

| Language | Form | Example |
|---|---|---|
| Chinese | year in 〇-style numerals, month and day in counting numerals; the source keeps its line at the left, the date takes its own line at the right | `二〇二六 · 六 · 十四` |
| Hindi (Devanagari) | Devanagari digits with Hindi month names, Gregorian; the digits fall to the system font, not the bundled Devanagari face | `२८ जून २०२६` |
| Arabic | Arabic-Indic digits with the era mark `م`, Gregorian; international month names; word spacing 1 px, line height 1.9 | `٢٨ يونيو ٢٠٢٦ م` |
| Persian | extended digits, solar calendar (Gregorian→Jalali by built-in arithmetic), Persian month names; normal word spacing, line height 1.9 | `۷ تیر ۱۴۰۵` |
| Urdu | extended digits with the era mark `ء`, Gregorian; word spacing 2 px, line height 2.1 | `۲۸ جون ۲۰۲۶ء` |
| Latin | old-style figures, 4 and 6 with descenders | `2026 · 06 · 04` |
| Japanese, Korean and others | as the Latin card | `2026 · 06 · 04` |

### Placement and margins

The card is 400 px wide, with 44 px of margin top and bottom and 42 px at the sides. The colophon sits 22 px below the body, under a 0.5 px rule, with 13 px between rule and text, at 12 px. Source and date are placed one of three ways by script; the date always keeps right and never wraps.

| Script | Layout | Source | Date |
|---|---|---|---|
| Chinese | source on its own line at the left, date on its own line at the right, 5 px below | upright kai, opacity .78 | kai, 12.5 px, tracking 2 |
| Latin | source left, date right, one line, baselines aligned | italic, opacity .62, balanced short lines | display face, old-style figures, 13 px, tracking 1.6, opacity .6 |
| the three right-to-left scripts | the whole block right-aligned, source and date on separate lines | 15 px, opacity .6; body, source and date fade in three steps | right to left, 5 px below |
| other non-Latin | as Latin | as Latin | 12 px, opacity .5, no tracking |

The two centred papers differ: the bookplate centres source and date on one line, the source in a script face at 19 px; letterpress draws no rule, sits 16 px below, in small caps at 11.5 px with tracking 1.4. The clay tablet's date is an italic serif, the clipping's a pen hand at 16 px.
Dark grounds and letterpress are deepened on their own: the date on the clay tablet and the clipping at opacity .78; on letterpress the source at 1.0 and the date at .85; the shared values for non-Latin tiers are source .6 and date .5.

### Filenames

By default "paper-title-YYYYMMDD-bayaaz"; when the title holds right-to-left characters it becomes "paper-date-title-bayaaz", putting the title last to keep it clear of the bidi conflict with ".png". The title is stripped of Chinese, Western and Arabic punctuation (`، ؟ 、。「」《》` included), cut to 64 characters at a word boundary, and lower-cased; the paper is an ASCII slug (tazhib, exlibris, ryoshi and so on).

## Sources

[CLReq](https://www.w3.org/TR/clreq/) · [JLReq](https://www.w3.org/TR/jlreq/) · [KLReq](https://www.w3.org/TR/klreq/) · [ILReq](https://www.w3.org/TR/ilreq/) · [ALReq](https://www.w3.org/TR/alreq/) · [GB/T 15834-2011 (Chinese punctuation usage)](https://people.ubuntu.com/~happyaron/l10n/GB(T)15834-2011.html) · [Typotheque · Typesetting CJK](https://www.typotheque.com/articles/typesetting-cjk-text) · [The Type · 挤进推出避头尾](https://www.thetype.com/2018/05/14501/) · [Unicode Bidirectional Algorithm, UAX #9](https://www.unicode.org/reports/tr9/) · [CSS Text Module Level 4](https://www.w3.org/TR/css-text-4/) · [OpenType feature registry (palt and others)](https://learn.microsoft.com/en-us/typography/opentype/spec/featurelist)

Every bundled font is listed in [Bundled Fonts — Attribution & License](../fonts/README.md).
