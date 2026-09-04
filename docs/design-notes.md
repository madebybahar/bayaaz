# Writing an Old Book in Code

*Translating the feel of paper, the provenance of the papers, and every script's own composition into CSS variables*

> I wanted to see whether code could bring back what paper carries — the petals and gold flecks, the grain, the ink marks, the touch.

These notes are for people building, or wanting to build, something like this: how to make skeuomorphs in code, how subsetting carries many scripts, how to set text that runs right to left, how to choose a typeface… Every decision comes with its reasoning; every value traces to its line in the source.

**Contents**

- [1. Translating the feel of paper into interface variables](#1-translating-the-feel-of-paper-into-interface-variables)
- [2. A museum you can download](#2-a-museum-you-can-download)
- [3. Every script, by its own rules](#3-every-script-by-its-own-rules)
- [4. A card, set to publishing standards](#4-a-card-set-to-publishing-standards)
- [5. Outside software](#5-outside-software)

---

## 1. Translating the feel of paper into interface variables

First find the element's original in the world of paper, then work out the causes (where the light falls, how ink bleeds, how paper ages), and translate them into controllable CSS variables. The bearing is not smooth or modern but a little unpolished, cut as if by a knife, keeping the imperfection of the hand.

### The empty state: a flyleaf in the manner of a bookplate

When the panel is empty, the whole page is set as a flyleaf, like a book just opened.

- The ground is three layers of aged paper: brighter at the center than the edges (a well-handled page, smoothed by fingers), a fibre tile, five untidy foxing spots.
- The composition follows the Renaissance printers' habit: title and ornament in the upper-middle, the lower half left empty.
- The hand-made feel comes from deliberate imperfection: leaves sit unevenly, a thin twin line runs slightly off the main stroke, like the ghost of a misregistered woodblock print; and the two vines each draw their own curve.

### First-run guidance: one highlighter stroke, one seal

Guidance has two scenes: a highlighter streak demonstrates highlighting, and a stone seal points out the imprint.

- The prologue is a highlighter streak: it sweeps across *Highlight a passage* in the hint.
- The seal face is a craggy round stone chop: dry-brush gaps in the carving, ink blots blurring at their edges.
- The seal's animation replays the physics of stamping, in three beats: the card dipping is the touch, the seal's tiny shifts are the settling, the ink filling in is the set.

### Links: a weightless pencil trace

Links keep the body ink, marked only by a 0.5px dotted underline; on hover the dots turn solid and crimson.

- In old books, dotted rules live in margin notes and index pages, already the traditional signal for *there is a reference here*; no extra color is needed.
- The red lights only under the pointer: like the manicule ☞ in old margins, it asks you to look exactly where it points.
- The line yields to the letters: dropped 5px for an airway, steered around the descenders of p and y, the courtesy of classical printing.

### Code blocks: a small slip pasted on the paper

Inline code and code blocks become pale little labels resting on the page.

- The background is a nearly transparent warm brown, its color taken from the paper itself: thin as a watercolor wash, with the grain showing through from beneath.
- A hairline draws the outline: 0.5px, barely darker than the background; a slight rounding adds warmth.

### List markers: ◆ in the margin, roman numerals from the contents page

Unordered lists hang a diamond ◆ outside the text block; ordered lists count in lower-roman.

- ◆ hangs outside the block, after the marginalia of old books: the text keeps a clean left edge; it aligns to the first line's optical midline, since mathematical centering looks tilted.
- i. ii. iii. reads like the contents page of an old book; viii grows crowded, so from the eighth item the list switches back to decimals.

### Editing is a red annotation

Double-click an export card to edit, and a willow-leaf stroke of aged red appears on it.

- Correcting has always been done with a cinnabar brush, and old annotations oxidize into aged vermilion; this red stroke as the editing mark means you are annotating your own excerpt.
- The stroke takes the willow-leaf line of the eighteen classical methods: light entry, pressed middle, lifted exit. The ink follows the paper: on the black stone rubbing, the willow brush dips in gold.
- The sidebar edits on double-click too, but far more quietly: no red stroke, the card lifts slightly, the others dim, and the textarea melts into the paper in the card's own serif, the caret landing on the double-clicked word.
- The two places edit different things: the sidebar edits the saved Markdown source, while the export page edits the flattened display text, affecting only that one export.

### Buttons: the cord hole and the oracle-bone knife

The export button takes the shape of a silk-cord bookmark; the delete button's cross takes the hand of oracle-bone script.

- The bookmark outline: rounded top, V-shaped foot, a small cord hole at the head — the ornament is the provenance.
- The cross's strokes taper at both ends and run nearly straight: round ends read as brush, square ends read as knife, and one change of endpoint brings out the epigraphic air.
- At rest they all but sink into the paper; only under the pointer do they take the theme color and float slightly.

### Two scrollbars: a ghost in the sidebar, a red silk bookmark on the export page

One for the workspace, one for the stage; the same control, dressed for its room.

- The side panel gets a ghost: fully transparent until you scroll or hover, colored by the theme. The place where excerpts gather should be quiet.
- The export page gets a red silk thread: one line of vermilion, deep at the middle and fading at both ends, after the silk ribbons that guide the eye in old books.

### The ink-black theme: change the paper, change the inks

The themes come as two moods: Parchment for daylight, Ink-Black for late nights. Ink-black is built as a new sheet of paper, and the ink follows the paper.

- Dark paper takes gold ink, after the sutra tradition of gold on indigo: drafting turns sand-gold, the seal's paste goes from cinnabar to gold, foxing brightens into gold dust.
- Only one set of shapes is kept: vines and ribbons pick up the current theme's color on their own, shared by both moods untouched.
- The theme switch is an ink bottle: change the paper, and the ink in the bottle changes with it.

---

## 2. A museum you can download

> Software has existed for barely eighty years, and art has been accumulating for millennia. Draw from that.

Making them was also an act of collecting and curating, a miniature museum exhibition: writing surfaces from many places and periods, remade into papers you can interact with, download, print, and paste into a notebook.

### The exhibits: twelve papers with provenance

Most of the twelve papers are studied from a real source: the gilt of medieval manuscripts, the clay tablets of Mesopotamia, the gold-flecked papers of the Nishi Honganji anthology, the ink rubbings of carved steles… Full provenance lives in [The Twelve Papers](papers.md).

- Each paper translates two or three physical features: the Ryōshi scatters gold and silver sand with noge gold strands (dots, foil squares, and thin bars in one SVG tile), the papyrus weaves two crossed layers of fibre, the clay tablet carries pressed-in wedge marks. The features chosen are the ones that can be translated into CSS.
- Selection color follows the civilization: on several papers the selection color is drawn from that culture's own practice. Papyrus takes red-ochre, clay darkens like wetted mud (scribes smoothed wet clay to erase and recarve), letterpress takes type-metal grey (selecting is picking a line of type from the case), and the rubbing takes the gilt of mounted title slips.
- Names are proper nouns: Tazhib, Ex Libris, Ryōshi keep their originals; the name carries its origin, and a short local note carries the meaning.

### The gallery: the export page as an open album

The page for choosing a paper is built as an open book: the left leaf shows the chosen paper at reading size, the right leaf sets all twelve into a sample wall; switching papers turns the page.

- Chinese literati chose their letter papers from sample albums like the *Ten Bamboo Studio Collection of Letter Papers*, so an interface for picking papers is built as one.
- The skins split one tight, one loose: the main panel stays restrained, the export skins run free.
- The album lies on a late-night desk: the wood grain is noise combed sideways into streaks; one warm lamp glows from above and the edges stay dark.
- The album is bound in vegetable-tanned leather, napped and matte; corners pressed dark, a gutter shadow down the spine — a book that has been used.
- The save key is a dot of sealing wax: it lifts on hover, sinks and rebounds when pressed. Pick a paper, press a seal.

---

## 3. Every script, by its own rules

> I wrote my university thesis in Urdu, typing it in Pages on an iPad: it came out beautifully set in Nastaliq, and I felt how seriously Apple had taken each language. I still remember how it felt to see the words I wrote treated with care. And I thought: someone else will feel this too. I want to make software like that.
>
> Software should see the users at the margins too; technology was never meant to serve only those already standing at the centre. I'm grateful my education gave me this different vantage point.

This chapter follows a passage's journey: first it is recognized, then its direction is set, then it settles into an export card, from body text down to the colophon.

### Know the script first, then set the type

When identifying a language, non-Latin scripts are checked before Latin.

- **Whatever is checked first gets the verdict**: Korean and Hindi routinely carry Latin loan-words like "PDF", and checking Latin first misjudges the whole paragraph as English, the typography failing with it.
- **Right-to-left: cast the net wide**: Arabic's various forms and older encodings are gathered by one net, while Hebrew enters through its own range into the same right-to-left flow; miss once, and the whole passage is set as Latin.
- **Tiers follow typesetting needs**: Vietnamese has a tier of its own only to swap away the decorative fonts that lack its diacritics; filed under English before, it had been dressed in the Western bookplate's centring, script face and Latin label. Urdu has a tier of its own for the full Nastaliq treatment.
- **Presence, and dominance**: the test once asked only whether an Arabic letter was there, so an English sentence carrying the name بیاض ran right to left, full stop on the wrong side. Judged by proportion, English with a few Arabic letters in it runs left to right as before.

### Typesetting right to left: flipping the direction is the smallest step

Every layer of an interface carries assumptions written for Latin text, invisible until a right-to-left passage walks in and exposes them one by one; the real work of RTL support is hunting them down, layer by layer.

- **Installing the font is only the start**: the choice still answers three questions of license, file size, and numerals. Vazirmatn passes all three.
- **Glyphs do not all live inside the line box**: ض ج ے drop deeper, so the title input takes taller leading and extra padding.
- **Visual effects are not neutral**: a fade drawn for Latin line-heights cuts calligraphy mid-stroke, so the mask is redrawn in three grades.
- **Ornament is not universal either**: the colophon changes sides, the Latin label is hidden, centring stays with Latin alone. Flipping the direction itself turns out to be the easiest step of all.

### Nastaliq: real support begins beyond the font

On the web, Urdu is almost always shown in Arabic-style Naskh; getting it back into its own Nastaliq, installing the font is only the first step.

- **Hard because it stacks and joins**: glyphs cascade along a diagonal, joins mutate with context, and rendering differs across platforms, so Urdu on the web mostly falls back to the easier Naskh. An offline package sidesteps those worries: Noto Nastaliq Urdu, subset to 231KB, travels with the extension.
- **Recognition passes two gates**: at the first, a set of letters absent from Arabic (ٹ پ چ ژ گ ی among them) separates Urdu and Persian from Arabic; at the second, letters only Urdu writes tell Urdu apart from Persian: Urdu gets Nastaliq, Persian gets Vazirmatn. That gate once omitted ی — the Persian yeh, a different codepoint from Arabic's ي — and the other three letters of بیاض all exist in Arabic, so the product's own name dropped into the Arabic tier and was set in Naskh; adding that one codepoint brought it back. بیاض on its own is still read as Persian: a lone word of shared letters cannot be told from Urdu.
- **The whole card follows**: title, headings, body, and even the date's numerals use Nastaliq's own glyphs; those digits once leaked as a Latin serif, jarring against a page of joined script. Made whole, the card reads as an Urdu book.

> Claude talked me out of it several times. I kept insisting on Nastaliq, in the body, the title and the subheadings, and in the end I got my way.

### Hard rules of body text: spacing, digits, punctuation

Each script's body text carries a few rules that cannot be touched.

- **Joined scripts cannot take letter-spacing**: spacing cuts the joins, Nastaliq worst of all; justification stretches the connecting strokes (kashida) rather than widening spaces, and ragged-right is the safer web setting.
- **Digit order belongs to the browser**: in right-to-left text the digits still run left to right; declare the direction and the browser places them, while reversing by hand always fails.
- **Korean punctuation stays out of the fullwidth cell**: hangul uses proportional punctuation with a following space, close to the Latin habit; carry the Chinese-Japanese fullwidth rules over and they fail.
- **How far to localise is a choice**: the colophon once went all the way to native digits and the Islamic calendar, until an Urdu book from 2011 turned up with a Western 2011 on its copyright page. Modern Urdu and Arabic printing uses Western digits as a matter of course, so the calendar went back to Gregorian and the native digits stayed as a touch of old-book style.

### Writing the date as a colophon: each language keeps its own hand

Source and date join into one line of colophon at the foot of the card. On Chinese cards the twelve papers set their body in different faces, but the sign-off is always kai, the old books' tradition; other scripts sign off in the face of their own tier.

- **Chinese in Chinese numerals**: 「二〇二六 · 六 · 十四」, on its own line at the right, where a signature sits.
- **One day, three ways of writing it**: Urdu dates take their own digits and the era letter ء (۲۸ جون ۲۰۲۶ء); Arabic takes م; Persian switches the whole calendar to solar month names: same day, different year.
- **Latin uses old-style figures**: the 4s and 6s carry descenders, like sorts picked from the type case; `2026 · 06 · 04` finds its rhythm in interpuncts and opened tracking.
- **The date takes the weakest step of the scale**: the color takes the weakest step of that paper's text scale, and the date settles into a small note. On dark grounds that faintness turns to mud, so the clay and clipping papers get a stronger tone of their own.

---

## 4. A card, set to publishing standards

This chapter follows a card's path to press: set the standards, refine the page, choose the type, and stamp it on its way.

### The standards, from two sources

Modern rules come from documents; the older ones are measured out of old books; every departure is filed with its reason.

- **Each script has its own standard**: Chinese follows the W3C CLReq for justification and punctuation rules; the drop cap, two characters wide and two lines tall, is Bayaaz's own form (Chinese has no native drop cap, and CLReq does not cover it). A quarter-em gap separates han characters from Latin (and kana from Latin, JLReq's 四分アキ); Japanese, Korean, Indic and Arabic each follow their own requirements (JLReq, KLReq, ILReq, ALReq). Devanagari spacing must be handled per syllable (akshara) rather than forced across a whole run, or the conjuncts fall apart; bidi and joining follow ALReq.
- **Three disciplines from old books**: red, always a rare guest; whitespace, since Song imprints and Aldine editions carry far more of it than you expect, so tune spacing toward "20% more room"; page proportions, the bottom margin larger than the top.
- **Deviations are filed with reasons**: card line heights run above each REQ's body-text recommendation, because the specs describe continuous prose and a card is a single literary excerpt on display, where a looser setting is a legitimate choice; every value was compared offscreen and settled by eye on real devices. The full table of values and reasons is in the [Multilingual Typography Registry](typography.md).

### The fine points of the page: drop caps and bold

- **Four cases bar the drop cap**: an excerpt opening with punctuation, one opening with a digit (chapter numbers, years, statistics, where a giant hanging numeral breaks the old-book look), code cards (a giant hanging `#` breaks the meaning), and joined scripts (wrapping the first letter swallows it whole). The first character must also be an ideograph or a Latin letter, with the extended ranges included, since Vietnamese Đ was once missed and the cap landed on the second letter.
- **Bold is never synthesised**: a Mincho face is built on the contrast between thin horizontals and thick verticals, and the browser's synthetic bold flattens it until a passage reads as a sans, the old-book air gone. Where a real bold family exists it is used, and where none does the regular weight stays.

### Fonts: three hurdles, then the choosing

Engineering first, then selection and temperament.

- **Size, licence, offline**: size (a CJK font runs 3 to 10MB), licensing (commercial faces can't be shipped, the system Kaiti included), and the platform's ban on remote loading. The way through is OFL fonts plus subsetting: a few thousand common characters bring 10MB down to 2 to 4MB. Devanagari's small glyph set fits a whole script in 51KB. Each bundled font is locked to its own Unicode range: the Korean face declares the hangul blocks only, and never rewrites a Chinese or Japanese glyph.
- **One face per script, each with a pedigree**: Chinese body text keeps the system Song face on most papers, deliberately; the three bundled Chinese faces each carry a pedigree and take over only the captions, the drop caps, and the body of the four papers that match their temper. LXGW WenKai for the kai group (a Klee One descendant with handwritten warmth), Zhuque Fangsong for the letterpress group (a revival of Republican-era "Nansong" type, semantically locked to letterpress), Wenjin Song for the inscriptional group (of three candidates, the only one that speaks the language of old books). Japanese ships Zen Old Mincho for native kana and old-style mincho bones; Devanagari ships Noto Serif Devanagari, even-stroked and clear, its headline (शिरोरेखा) unbroken. The Arabic tier tried Amiri, a revival of classical Naskh, whose strokes thinned in the 13-point side panel, and went back to Vazirmatn; Vazirmatn and Nastaliq are chosen in chapter three.
- **Faces follow the paper**: Latin cards each have a personality, captions on inscriptional cards set in Cinzel's Roman capitals, the Ex Libris source line in Pinyon script, the clipping in Caveat's pen hand; the three Chinese groups are assigned by the same logic, and when Zhuque misses a glyph it steps down to the system fangsong, then Wenjin.
### The filename is a colophon too

exports are named `paper-title-date-bayaaz`, date before the signing name, the word order of a colophon; an RTL title moves to the end, doubling as a bidi buffer before `.png`; truncation retreats to a word boundary, and the Persian solar-calendar conversion is a dozen lines of built-in arithmetic.

---

## 5. Outside software

The design of this software carries the road I walked before it: years spent working with old books, old books held in the hand, museums visited, journals kept, paintings made, languages studied, and a childhood obsession with stationery…

At first I was afraid, since I had zero background in UI design. But design predates the web by a very long way. The digital and the physical can read each other.

And I had always been interested in writing, typography and outfits; that experience could be reused in this design, like beads strung into a bracelet. And why wouldn't UI design count as a kind of painting?

I have no formal training in this; my studies and my past work had nothing to do with programming. Before I had built anything at all, a friend told me with complete certainty: you will do real work in software. He was the first to see that potential in me. In countless moments of self-doubt since, I have leaned on that sentence. He also set up my environment, recommended the tools, and shared his own working architecture and thinking, so that the engineering side was never a worry.

I often imagined what it would look like to be an independent developer, and I assumed that day was many years off: I would need enough work experience first, enough skill and money, the right developer to build with. Back then I followed blogs I loved and set things up step by step, and the jump of a hyperlink felt like opening one door after another; I envied the people who could write a blog and share what they knew, and admired that open-source, hacker spirit.

Now I can write my own development log, line by line. Without quite noticing, I have come a long way toward what I wanted then. What I am making now is what I wanted to make before the wave of AI arrived; the arrival only let me start sooner. It is like the year I put a foreign-language school down for every choice, and the year after graduation when every résumé I sent went to the cultural sector: I have been living out my dream all along.

— Bahar

---

The other notes, specimens and files:

- [*What a Passage Goes Through Before It Becomes a Card*](engineering-notes.md)
- [*The Multilingual Specimen Book*](specimens.md)
- [*The Multilingual Typography Registry*](typography.md)
- [*The Twelve Papers*](papers.md)
- [*Bundled Fonts — Attribution & License*](../fonts/README.md)
- [Back to the README](../README.md)
