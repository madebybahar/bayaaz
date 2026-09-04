# 内置库 · 归属与授权

本目录内的两个库随扩展本地打包（离线，无远程 / CDN），与[内置字体](../fonts/README.zh.md)的做法一致。两者均以 **MIT** 授权，许可证全文见 [`turndown-LICENSE.txt`](./turndown-LICENSE.txt) 与 [`html-to-image-LICENSE.txt`](./html-to-image-LICENSE.txt)。

English version: [README.md](./README.md)

| 文件 | 库 | 版权 / 作者 | 来源 |
|---|---|---|---|
| `turndown.js` | Turndown | © 2017 Dom Christie | github.com/mixmark-io/turndown |
| `html-to-image.js` | html-to-image | © 2017–2026 W.Y.（bubkoo） | github.com/bubkoo/html-to-image |

> **版本**：`html-to-image` 1.11.13，与官方 `dist/html-to-image.js` 逐字节一致；`turndown` 7.2.4，
> 比对函数清单与代码特征确认，本地这份剥去了注释，故与发布文件不逐字节相同。两个文件头部都不带
> 版本标记，版本是查证得来的。此后新引入的依赖，落地当天就在这里记下版本。

## 用在哪里

- **`turndown.js`** —— HTML → Markdown 的转写。与 `content/content.js` 一同注入页面
  （见 `background/service_worker.js`），因此转换发生在选区所在的那个活的 DOM 上，页面自身的
  结构还是完整的。
- **`html-to-image.js`** —— 在导出页（`export/samplebook.js`）把排好的卡片渲染成 PNG。
  全程在浏览器内完成，不上传任何东西。

## 为什么是内置而不是安装

这个扩展没有构建步骤，也没有 `node_modules`：克隆下来，加载已解压的文件夹，就能跑。
为两个文件引入包管理器，等于在读者和一个能用的扩展之间，插进一个锁文件和一次安装。

代价是归属得手写：没有 `package.json` 替这两个文件记来历，只能靠这份文档。
