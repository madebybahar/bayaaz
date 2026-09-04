# Bundled Fonts — Attribution & License

All fonts in this directory are bundled locally (offline, no remote / CDN) and are
licensed under the **SIL Open Font License 1.1** (OFL). 中文版：[README.zh.md](./README.zh.md)。 The full license text is in
[`CJK-OFL-LICENSE.txt`](./CJK-OFL-LICENSE.txt) and [`ZenOldMincho-OFL.txt`](./ZenOldMincho-OFL.txt); each font also carries its own
copyright and Reserved Font Name in its embedded `name` table. Faces with no writing named in brackets are Latin. The two third-party libraries are registered in [Bundled Libraries](../lib/README.md).

| File | Font | Copyright / Author | Source |
|---|---|---|---|
| `CormorantGaramond-VF-latin.woff2`, `…-Italic-…` | Cormorant Garamond | © The Cormorant Project Authors (Christian Thalmann / Catharsis Fonts) | github.com/CatharsisFonts/Cormorant |
| `SourceSerif4-Regular/-Italic/-SemiBold-latin.woff2` | Source Serif 4 | © Adobe (Frank Grießhammer) | github.com/adobe-fonts/source-serif |
| `Cinzel-VF-latin.woff2` | Cinzel | © The Cinzel Project Authors (Natanael Gama) | github.com/NaTml/Cinzel |
| `Caveat-Regular/-Bold.woff2` | Caveat | © The Caveat Project Authors (Impallari Type / Cyreal) | github.com/googlefonts/caveat |
| `PinyonScript-latin.woff2` | Pinyon Script | © The Pinyon Script Project Authors (Nicole Fally) | Google Fonts |
| `Vazirmatn-subset.woff2` | Vazirmatn (Arabic / Persian) | © Saber Rastikerdar | github.com/rastikerdar/vazirmatn |
| `NotoNastaliqUrdu-subset.woff2` | Noto Nastaliq Urdu (Urdu) | © The Noto Project Authors (Google) | github.com/notofonts/nastaliq |
| `NanumMyeongjo-subset.woff2` | Nanum Myeongjo (Korean) | © NAVER Corporation | hangeul.naver.com |
| `NotoSerifDevanagari-subset.woff2` | Noto Serif Devanagari (Devanagari) | © The Noto Project Authors (Google) | github.com/notofonts/devanagari |
| `WenJinMincho-subset.woff2` | WenJin Mincho 文津宋体 | © takushun-wu | github.com/takushun-wu/WenJinMincho |
| `LXGWWenKai-subset.woff2` | LXGW WenKai 霞鹜文楷 | © The LXGW WenKai Project Authors | github.com/lxgw/LxgwWenkai |
| `ZhuqueFangsong-subset.woff2` | Zhuque Fangsong 朱雀仿宋 | © TrionesType | github.com/TrionesType/zhuque |
| `ZenOldMincho-subset.woff2` | Zen Old Mincho (Japanese) | © The Zen Old Mincho Project Authors (Yoshimichi Ohira) | github.com/googlefonts/zen-oldmincho |

## Where they're used
- **Export page** (`export/samplebook-fonts.css` + `export/samplebook.html`): Cormorant,
  Cinzel, Pinyon Script, Source Serif 4, Caveat (Latin personas) + WenJin / LXGW WenKai /
  Zhuque Fangsong (CJK personas) + Vazirmatn / Noto Nastaliq Urdu / Nanum Myeongjo / Zen Old Mincho (multilang;
  Zen Old Mincho is the packaged Japanese mincho for `data-script="ja"` cards — native JA glyphs, no gothic fallback).
- **Side panel** (`sidebar/sidebar.css`): Cormorant Garamond (UI/body serif), plus the
  multilang fonts above for non-Latin cards.

Chinese fonts are subset to ≈ GB2312 ∪ Big5, Japanese to JIS levels 1 and 2, Korean keeps the full Hangul syllabary; Latin / Arabic / Urdu fonts are subset to their
script ranges. Subsetting preserves each font's copyright in the `name` table, as OFL requires.

---

The other notes, specimens and files:

- [*Writing an Old Book in Code*](../docs/design-notes.md)
- [*What a Passage Goes Through Before It Becomes a Card*](../docs/engineering-notes.md)
- [*The Multilingual Specimen Book*](../docs/specimens.md)
- [*The Multilingual Typography Registry*](../docs/typography.md)
- [*The Twelve Papers*](../docs/papers.md)
- [Back to the README](../README.md)
