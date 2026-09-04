# 内置库 · 归属与授权

本目录内的两个库随扩展本地打包（离线，无远程 / CDN），与[内置字体](../fonts/README.zh.md)的做法一致。两者均以 **MIT** 授权，许可证全文见 [`turndown-LICENSE.txt`](./turndown-LICENSE.txt) 与 [`html-to-image-LICENSE.txt`](./html-to-image-LICENSE.txt)。

English version: [README.md](./README.md)

| 文件 | 库 | 版权 / 作者 | 来源 |
|---|---|---|---|
| `turndown.js` | Turndown | © 2017 Dom Christie | github.com/mixmark-io/turndown |
| `html-to-image.min.js` | html-to-image | © 2017–2026 W.Y.（bubkoo） | github.com/bubkoo/html-to-image |

> **版本未记录。** 两个文件都是以构建产物的形式取来的，头部没有版本标记——`html-to-image.min.js`
> 的版本横幅被压缩器剥掉了，Turndown 的浏览器 UMD 构建则本来就没有。用哈希比对 npm 上已发布的
> 各版本，两个都没能对上。此后任何新引入的内置依赖，落地当天就在这里记下版本。

## 用在哪里

- **`turndown.js`** —— HTML → Markdown 的转写。与 `content/content.js` 一同注入页面
  （见 `background/service_worker.js`），因此转换发生在选区所在的那个活的 DOM 上，页面自身的
  结构还是完整的。
- **`html-to-image.min.js`** —— 在导出页（`export/samplebook.js`）把排好的卡片渲染成 PNG。
  全程在浏览器内完成，不上传任何东西。

## 为什么是内置而不是安装

这个扩展没有构建步骤，也没有 `node_modules`：克隆下来，加载已解压的文件夹，就能跑。
为两个一年才动一次的文件引入包管理器，等于在读者和一个能用的扩展之间，插进一个锁文件和一次安装。

这个选择的代价就是这份文档——内置的代码得自己带着归属，因为没有 `package.json` 替它做这件事。
