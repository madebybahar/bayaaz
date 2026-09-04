<h1 align="center">Bayaaz · بیاض</h1>

<p align="center"><a href="./README.md">English</a> · <b>简体中文</b></p>

<p align="center"><i>一座亲手打理的小图书馆。</i></p>

<p align="center">划下一行，替你收好——忠实的 Markdown，或十二款有来历的摘录笺。<br>多语种排版，完全离线。</p>

<p align="center">
  <img alt="左边是划词的网页与 Bayaaz 侧栏，右边一张摘录笺：SELECT A LINE — IT IS KEPT。" src="assets/readme/select-keep.png" width="760">
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/bayaaz-markdown-web-clipp/beillbnfablabpoponiihpiefhgkphnd"><b>去 Chrome 应用商店安装</b></a>
</p>

<p align="center">
  <a href="#收藏的两种去处">Markdown 与卡片</a> ·
  <a href="#十二种纸样">十二种纸样</a> ·
  <a href="#每种文字按它自己的方式排">排版</a> ·
  <a href="#数据不出你的设备">隐私</a> ·
  <a href="#安装">安装</a><br>
  <a href="docs/design-notes.zh.md">设计手记</a> ·
  <a href="docs/engineering-notes.zh.md">工程手记</a> ·
  <a href="docs/specimens.zh.md">多语种样张册</a>
</p>

---

## 名字的来历

Bayaaz（بیاض），词根是阿拉伯语的 ب-ي-ض（b-y-ḍ），原意是白色、空白，一张等待被书写的白纸。但在波斯和乌尔都语的文学传统中，它渐渐专指一样东西：个人手抄文集，或者叫私人选本。

它是一个人阅读生命的痕迹：日积月累，每一页都是某个时刻被某段文字击中的证据。选了什么、没选什么、以什么顺序排列，这些选择本身，就是一个人精神世界的肖像。

从萨法维到莫卧儿的几百年里，波斯语世界从诗人到王公，常备一册自己的 Bayaaz；如今，这册本子住进了你的浏览器。

## 一分钟上手

1. **打开。** 点工具栏的 Bayaaz 图标，侧边栏就留在页面旁边；也可以先选中一段文字，右键点「Keep in Bayaaz」。
2. **划下。** 侧边栏开着时，你划选的每一段都会自己落进来，标题和正文都还能改。
3. **带走。** 复制，或把整组收进一个 `.md` 文件；想郑重些，把一句送进钤印工作室：挑一张纸，盖一枚印，导出 PNG。

## 收藏的两种去处

一切原样抵达：标题、列表、链接、代码，忠实到最后一个反引号。每段摘录都可再编辑，也都记得自己来自哪个网页。侧边栏是一张工作台：摘录住在里面，关闭前请导出。

**Markdown 管整理。** 一键把摘录收进一个干净的 `.md` 文件：日期起好，文件名起好，每条来源都带着链接。进 Obsidian、Notion 或你自己的写作系统，它会像是原本就写在那里。

<p align="center">
  <img alt="深色底上一份导出的 Markdown 文件：标题、列表、链接与代码原样保留，Faithful to the last backtick。" src="assets/readme/markdown-offline.png" width="760">
</p>

**卡片管珍藏。** 想郑重留下某一句时，钤印工作室把它排上一张有来历的纸。挑一张纸，盖一枚印；打印出来贴进手帐、夹进书里，做你和一句话相遇的凭证。

<p align="center">
  <img alt="钤印工作室：一册翻开的笺谱，左页放大细读选中的纸样，右页十二款排成样品墙。" src="assets/readme/imprint-studio.png" width="760">
</p>

<details>
<summary><b>剪藏是怎么做到的</b></summary>
<br>

- 选区按网页的真实结构整段克隆，再转成 Markdown：标题、列表、代码的层级都还在。
- 复制一次，同时写入纯文本、HTML、Markdown 三种格式；粘贴进哪个软件，它自取能认的那份。
- 开放的 Shadow DOM 先摊平再捕获；相对链接补全为绝对链接，离开网页也不会因路径失效。

整条管线的坑与做法：[工程手记](docs/engineering-notes.zh.md)。

</details>

## 十二种纸样

十二款各有来处：每款都研习自一种真实存在过的传统，一种留住文字的办法；名字保留源头语言的写法，不译。

| 纸样 | 来历 |
|---|---|
| **Illuminated** | 中世纪缮写室的泥金与羊皮纸 |
| **Guilloché** | 钞票与文凭上的车床雕线 |
| **Wax Seal** | 红火漆印下的敕许状 |
| **Cuneiform** | 压进两河泥板的文字 |
| **Papyrus** | 尼罗河的纸草书卷 |
| **Ryōshi** | 平安朝洒金的写歌料纸 |
| **Palm-Leaf** | 南亚棕榈叶上的写本 |
| **Tazhib** | 波斯与奥斯曼写本的泥金扉页，金与青金石；bayāz 也出自这个写本传统 |
| **Stone Rubbing** | 墨拓碑石上的白字 |
| **Ex Libris** | 铜版雕刻的纹章藏书票 |
| **Letterpress** | 铅字压进纸面的凸印 |
| **Clipping** | 从报纸上撕下、随手夹存的一角 |

<p align="center">
  <img alt="同一段文字排在十二款纸样上：泥金、钞券雕线、火漆、泥板、莎草、料纸、贝叶、Tazhib、拓片、藏书票、活版、剪报。" src="assets/readme/twelve-papers.png" width="760">
</p>

考据逐款登记在[十二种纸样考据](docs/papers.zh.md)。
## 每种文字，按它自己的方式排

这里说的多语种，指的是你剪藏内容的排版；界面是英文的。

- **先认出文字是谁**：按整段的字母判定文种，拉丁最后判；判定之后，每种文字各走各的规矩。
- **中文**依 W3C《中文排版需求》：两端对齐、标点不落行首，首字下沉占满两行。假斜体一概不用：中文本来就没有斜体。
- **日文与韩文**各守各的断行与间隙，细到假名与西文之间那一点空。
- **印地语**的天城文不加字距，加了会拆散它的音节和合字；行高放宽，给上下叠加的元音符号留位。
- **阿拉伯文、波斯文**等连笔文字保持连笔：字距一律不加，数字保持自己的方向。
- **乌尔都文**从标题到正文都是真正的纳斯塔利格体：网上的乌尔都语多半被排成纳斯赫体，剪一段进来，卡片把它还给自己的笔迹。
- **拉丁文字**左对齐、不断词，日期用旧体数字；十二款纸样各配自己的拉丁字体。
- **越南语**用拉丁排版，只换掉缺它变音符的花体字体，藏书票那行拉丁标目也让位。
- **日期**按各自的写法，波斯文连历法也换成太阳历；落在卡片上，它读起来是落款。

<p align="center">
  <img alt="中、英、日、韩、印地、阿拉伯与乌尔都文各排各的规矩：Every script, kept like a manuscript。" src="assets/readme/multilingual.png" width="760">
</p>

字体大多随扩展内置，开源授权、做过子集化，每一款的来历见[内置字体 · 归属与授权](fonts/README.zh.md)。中文正文有意沿用系统宋体；没打包字体的文字，退回系统字体。

排版上有意偏离规范之处，连同理由列在[多语种排版清单](docs/typography.zh.md)；七种文字的真卡样张，收在《[多语种样张册](docs/specimens.zh.md)》。

## 数据不出你的设备

没有账号，没有数据统计；剪藏、排版、导出都在本地完成，字体随安装包。断开网络，一切照常。

代码开源，没有构建步骤：你读到的源码就是浏览器里运行的那一份。两个第三方库 Turndown 与 html-to-image 也随仓库本地保存。

<details>
<summary><b>每一项权限，各自的用途</b></summary>
<br>

| 权限 | 用途 |
|---|---|
| `contextMenus` | 右键菜单里那条「Keep in Bayaaz」。 |
| `sidePanel` | 收集摘录的侧边栏。 |
| `storage` | 主题、一次性引导标记，与最近一张送往钤印工作室的卡片交接数据，都在 `chrome.storage.local`，只在本地。摘录本身不进 storage，只住在侧边栏里。 |
| `downloads` | 把 `.md` 文件和卡片图片存到你的硬盘。 |
| `tabs` | 找到你正在读的文章、在同一窗口跨标签收录，并在制笺后带你回到原文，让每段摘录记得出处。 |
| `scripting` | 扩展更新后向已打开的标签页重新注入剪藏脚本，不用刷新页面。 |
| 站点访问（http/https） | 剪藏脚本要在页面里运行，才能读到你的选区。它读你划选的文字，另取页面标题和网址，给摘录记出处。 |
| 远程代码 | **无。** 全部脚本与字体都在安装包内。 |

完整隐私政策：[Privacy Policy](https://visual-story-ai.notion.site/Bayaaz-Privacy-Policy-39e3031c65a180a39023e0e402ccdad9)。

</details>

## 安装

- **[Chrome 应用商店](https://chromewebstore.google.com/detail/bayaaz-markdown-web-clipp/beillbnfablabpoponiihpiefhgkphnd)**：Chrome 116+。
- **手动安装**：从 [Releases](../../releases) 下载 zip → 解压 → 打开 `chrome://extensions` → 开启「开发者模式」→「加载已解压的扩展程序」→ 选中解压出的文件夹

<details>
<summary><b>已知边界</b></summary>
<br>

- 只在普通的 http/https 网页上工作：Chrome 内部页、应用商店、内置 PDF 阅读器与本地 file:// 页面，浏览器不允许扩展进入。
- 剪藏以文字为中心，网页图片不进导出的 Markdown；开放的 Shadow DOM 有专门处理，关闭或跨域的可能被跳过。
- 右起排版只换了文字方向和落款位置，纸样的装饰仍按左起摆放。
- 哪个网页剪得不对，去 [Issues](../../issues) 留一条：页面链接、你选中的内容、复现步骤。私人页面不方便贴的，只描述结构就够。

</details>

## 做法都写下来了

设计手记 **《[用代码写一本旧书](docs/design-notes.zh.md)》**：如何用代码做拟物，如何用子集化做多语种，如何做从右往左的排版，如何选取字体。

工程手记 **《[一段网页文字，进卡片之前经历了什么](docs/engineering-notes.zh.md)》**：从选区到成图，沿途的坑与修法。

**《[多语种样张册](docs/specimens.zh.md)》**：中文、日文、韩文、天城文、阿拉伯文、乌尔都文、拉丁文字，各一张真卡的导出原图，附原文、译文、出处与配纸的理由。

另有三份档案，供查阅：

- [多语种排版清单](docs/typography.zh.md)：每种文字各自的规矩，从右起的方向到三种历法，逐项写明照的是哪份规范、偏离在哪、为什么。
- [十二种纸样考据](docs/papers.zh.md)：每一款背后都有一种真实存在过的传统；记各款的原型实物与批注色。
- [内置字体 · 归属与授权](fonts/README.zh.md)：每一款打包字体的来历、子集与许可。

## 后记

大学时巴基斯坦的外教爷爷帮我们起名字，他问我中文名字是什么意思。我的名字里有一个字，意思是像草一样蔓延，于是我说 spread。外教爷爷就帮我起了 Bahar بہار 这个名字，我很喜欢，是春天的意思。

Bayaaz بیاض 和 Bahar بہار，以同一个字母开头，ب：一册本子，和往里写字的人。

这个软件由一个人做成，献给仍然愿意亲手抄句子的人。

—— Bahar

---

*代码以 [GPL-3.0](LICENSE) 许可发布。*
