# 内置字体 · 归属与授权

本目录内全部字体随扩展本地打包（离线，无远程 / CDN），均以 **SIL Open Font License 1.1**（OFL）授权。许可证全文见 [`CJK-OFL-LICENSE.txt`](./CJK-OFL-LICENSE.txt) 与 [`ZenOldMincho-OFL.txt`](./ZenOldMincho-OFL.txt)；各字体的版权与保留字体名（Reserved Font Name）均保留在其内嵌 `name` 表中。未注明所管文字的，均为拉丁文字。两个第三方库的归属见[内置库](../lib/README.zh.md)。

English version: [README.md](./README.md)

| 文件 | 字体 | 版权 / 作者 | 来源 |
|---|---|---|---|
| `CormorantGaramond-VF-latin.woff2`、`…-Italic-…` | Cormorant Garamond | © The Cormorant Project Authors（Christian Thalmann / Catharsis Fonts） | github.com/CatharsisFonts/Cormorant |
| `SourceSerif4-Regular/-Italic/-SemiBold-latin.woff2` | Source Serif 4 | © Adobe（Frank Grießhammer） | github.com/adobe-fonts/source-serif |
| `Cinzel-VF-latin.woff2` | Cinzel | © The Cinzel Project Authors（Natanael Gama） | github.com/NaTml/Cinzel |
| `Caveat-Regular/-Bold.woff2` | Caveat | © The Caveat Project Authors（Impallari Type / Cyreal） | github.com/googlefonts/caveat |
| `PinyonScript-latin.woff2` | Pinyon Script | © The Pinyon Script Project Authors（Nicole Fally） | Google Fonts |
| `Vazirmatn-subset.woff2` | Vazirmatn（阿拉伯文／波斯文） | © Saber Rastikerdar | github.com/rastikerdar/vazirmatn |
| `NotoNastaliqUrdu-subset.woff2` | Noto Nastaliq Urdu（乌尔都文） | © The Noto Project Authors（Google） | github.com/notofonts/nastaliq |
| `NanumMyeongjo-subset.woff2` | Nanum Myeongjo（韩文） | © NAVER Corporation | hangeul.naver.com |
| `NotoSerifDevanagari-subset.woff2` | Noto Serif Devanagari（天城文） | © The Noto Project Authors（Google） | github.com/notofonts/devanagari |
| `WenJinMincho-subset.woff2` | 文津宋体 WenJin Mincho | © takushun-wu | github.com/takushun-wu/WenJinMincho |
| `LXGWWenKai-subset.woff2` | 霞鹜文楷 LXGW WenKai | © The LXGW WenKai Project Authors | github.com/lxgw/LxgwWenkai |
| `ZhuqueFangsong-subset.woff2` | 朱雀仿宋 Zhuque Fangsong | © TrionesType | github.com/TrionesType/zhuque |
| `ZenOldMincho-subset.woff2` | Zen Old Mincho（日文） | © The Zen Old Mincho Project Authors（Yoshimichi Ohira） | github.com/googlefonts/zen-oldmincho |

## 用在哪里

- **导出页**（`export/samplebook-fonts.css` + `export/samplebook.html`）：Cormorant、Cinzel、Pinyon Script、Source Serif 4、Caveat（拉丁人格字体）＋文津宋／霞鹜文楷／朱雀仿宋（中文人格字体）＋ Vazirmatn／Noto Nastaliq Urdu／Nanum Myeongjo／Zen Old Mincho（多语种；Zen Old Mincho 为 `data-script="ja"` 卡打包的日文明朝——原生假名字形，不退黑体）。
- **侧边栏**（`sidebar/sidebar.css`）：Cormorant Garamond（界面与正文衬线），非拉丁卡另用上述多语种字体。

中文字体按 ≈ GB2312 ∪ Big5 子集化，日文按 JIS 第一、二水准，韩文保留全部谚文；拉丁／阿拉伯／乌尔都字体按各自文字区段子集化。子集化保留 `name` 表中的版权信息，OFL 要求如此。

---

其余的手记、样张与档案：

- 《[用代码写一本旧书](../docs/design-notes.zh.md)》
- 《[一段网页文字，进卡片之前经历了什么](../docs/engineering-notes.zh.md)》
- 《[多语种样张册](../docs/specimens.zh.md)》
- 《[多语种排版清单](../docs/typography.zh.md)》
- 《[十二种纸样考据](../docs/papers.zh.md)》
- [回到首页](../README.zh.md)
