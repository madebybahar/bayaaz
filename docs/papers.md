# The Twelve Papers

> The narrative lives in [*Writing an Old Book in Code*](design-notes.md). 中文版：[papers.zh.md](papers.zh.md)。

Behind each of the twelve papers stands a tradition that really existed. The table records the original object for each: what it is, and what it looks like. Each card takes two or three features from its source and copies nothing whole. The names stay in their original language, untranslated.

## Where each comes from

| # | Paper | Source | Provenance in one line |
|---|---|---|---|
| 1 | **Illuminated** | Medieval manuscript | parchment, ruled lines, decorated initials in gold leaf and lapis-lazuli ultramarine |
| 2 | **Guilloché** | Banknote engraving | Engraved security work on banknotes and certificates: interlacing lines cut on a geometric lathe, engraved double frames, greenback ink |
| 3 | **Wax Seal** | Sealed letter patent | English royal letters patent: parchment, an opening capital holding the monarch's portrait, a wax seal hung on cords |
| 4 | **Cuneiform** | Mesopotamian clay | Sumerian and Babylonian tablets: unfired dried clay, a reed stylus pressed into the wet surface, wedge-shaped strokes |
| 5 | **Papyrus** | Nile-reed scroll | *Book of the Dead* scrolls: two layers of fibre laid at right angles, red-and-yellow border bands, blue water-lily imagery |
| 6 | **Ryōshi** | Heian-period paper | The Nishi Honganji *Sanjūrokunin-kashū* (1112): joined papers in the yaburitsugi and related techniques, gold and silver leaf and sunago, underdrawing in gold and silver ink |
| 7 | **Palm-Leaf** | Palm-leaf script | Pala-dynasty and Sri Lankan palm-leaf manuscripts: fibre running the length of the leaf, usually two cord holes set symmetrically into the leaf, lines written around them |
| 8 | **Tazhib** | Illuminated Qur'an | Safavid and Ottoman Qur'an illumination: gold and lapis-lazuli ultramarine, an unwan headpiece atop the first text page, a shamsa sun medallion on its own frontispiece |
| 9 | **Stone Rubbing** | Carved-stele rubbing | ink-black ground, incised strokes taking no ink and reading white, mottled stone; some steles carry a ruled grid |
| 10 | **Ex Libris** | Armorial bookplate | 17th–18th-century engraved armorial bookplates: an engraved shading ground, hatching standing in for tinctures on the shield, copperplate signatures |
| 11 | **Letterpress** | Letterpress printing | the laid lines and deckle edge of cotton-and-linen rag paper, a light ink impression (the hand-press era wanted only enough pressure to ink the sheet, what printers now call a "kiss impression"; the deep bite is a modern taste), woodcut decorated initials, head- and tailpieces |
| 12 | **Clipping** | A torn clipping | Old newspaper clippings: woodpulp newsprint gone warm and brittle, column rules, a torn edge |

## The marking colour follows the paper

The highlight behind a selected passage is gold-brown by default. On five papers it disappears, so each takes the colour of its own tradition's marking tool.

| Paper | The mark | Provenance | Shipped value |
|---|---|---|---|
| **Papyrus** | red rubric | Egyptian scribes wrote titles and emphasis in red ochre; Latin called red ochre *rubrica*, and the word *rubric* comes from it | `rgba(158,60,36,.26)` |
| **Palm-Leaf** | inked score | how palm-leaf manuscripts of South India and Sri Lanka take their letters: incised with a stylus, then rubbed with lamp-black, which settles in the cuts and makes the writing visible | `rgba(58,44,20,.22)` |
| **Letterpress** | type picked up | the cool silver-grey of lead-tin-antimony type metal, the line a compositor lifts from the case | `rgba(84,88,96,.28)` |
| **Stone Rubbing** | gold-ink inscription | a convention of mounting rubbings: the title label is often written in gold ink on an indigo strip | `rgba(214,186,126,.30)` |
| **Cuneiform** | wetted clay | a scribe wets a still-damp unfired tablet to smooth it and cut again; wet clay is darker, so the selection darkens, a patch ready to be rewritten | `rgba(74,40,16,.24)` |

Real cards on these papers are collected in [*The Multilingual Specimen Book*](specimens.md).

---

The other notes, specimens and files:

- [*Writing an Old Book in Code*](design-notes.md)
- [*What a Passage Goes Through Before It Becomes a Card*](engineering-notes.md)
- [*The Multilingual Specimen Book*](specimens.md)
- [*The Multilingual Typography Registry*](typography.md)
- [*Bundled Fonts — Attribution & License*](../fonts/README.md)
- [Back to the README](../README.md)
