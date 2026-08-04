---
title: "Markdown 基础语法笔记：标题、列表、表格、代码与 Mermaid 示例"
slug: "markdown-basic-syntax"
date: 2026-05-29T13:36:29+08:00
author:
  - Y'Jie
categories:
  - 写作
  - Markdown
tags:
  - Markdown
  - Mermaid
  - 技术写作
series:
  - Markdown 写作
weight: 1
description: "从标题、列表、链接、图片到代码块、表格、数学公式与 Mermaid，本文用一篇可直接上手的中文笔记梳理 Markdown 基础语法，适合写技术文档、博客和知识笔记时快速查阅。"
summary: "从标题、列表、链接、图片到代码块、表格、数学公式与 Mermaid，本文用一篇可直接上手的中文笔记梳理 Markdown 基础语法，适合写技术文档、博客和知识笔记时快速查阅。"
keywords:
  - Markdown 基础语法
  - Markdown 表格代码块
  - Mermaid 示例
  - 技术写作笔记
cover:
  image: ""
  alt: ""
  caption: ""
  relative: false
  hiddenInList: true
  hiddenInSingle: false
showToc: true
TocOpen: false
ShowBreadCrumbs: true
ShowReadingTime: true
ShowWordCount: true
hidemeta: false
draft: false
comments: true
searchHidden: false
math: true
mermaid: true
---


`Markdown` 最迷人的地方，不是语法少，而是它让人终于可以把注意力放回“内容本身”。

你不用一边写笔记，一边和字号、缩进、段落样式搏斗；也不用像在 Word 里一样，明明只想写一行命令，最后却误触一个神秘按钮，把整段文字送进排版宇宙。`Markdown` 的哲学很朴素：

- 用最少的标记，表达最常见的文档结构
- 让源码可读
- 让写作和发布之间少一点内耗

这篇文章不打算把你训练成“Markdown 语法大祭司”，而是想做一份真正能随手查、拿来就用的中文基础笔记。

## Markdown 为什么这么常用

你会发现，开发文档、技术博客、开源项目 README、知识库、工单说明，甚至很多公众号草稿，背后都能看到 Markdown 的影子。

原因很简单：

| 优势 | 说明 |
| --- | --- |
| 语法简单 | 学习成本低，半小时就能写出像样文档 |
| 可读性好 | 即使不渲染，源码本身也基本能看懂 |
| 易于版本管理 | 和 Git 天生适配，改了哪一行一清二楚 |
| 跨平台 | 编辑器、静态站点、文档平台几乎都支持 |
| 适合技术内容 | 代码块、表格、引用、流程图都很顺手 |

一句话总结：它不是最花哨的写作格式，但它是技术人最不容易写着写着发火的格式。

## 标题

标题用 `#` 开头，`#` 的数量表示层级，最多支持六级。

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

渲染效果如下：

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

### 另一种标题写法

在少数场景里，也会看到这种写法：

```markdown
一级标题
=========

二级标题
---------
```

渲染后效果是：

一级标题
=========

二级标题
---------

如果你只是日常写作，我建议优先使用 `#` 这种方式，更直观，也更适合长文档维护。

## 强调

最常见的强调语法有三种：加粗、斜体、删除线。

```markdown
**加粗**
*斜体*
~~删除线~~
```

效果如下：

**加粗**

*斜体*

~~删除线~~

有时候也会写成：

```markdown
_这也是斜体_
```

如果团队没有特殊约定，统一一种写法就行。文档风格一致，比“我个人习惯这样写”更重要。

## 列表

列表分两种：无序列表和有序列表。

### 无序列表

```markdown
- Linux
- macOS
- Windows
```

效果：

- Linux
- macOS
- Windows

### 有序列表

```markdown
1. 安装编辑器
2. 创建 Markdown 文件
3. 开始写内容
```

效果：

1. 安装编辑器
2. 创建 Markdown 文件
3. 开始写内容

### 任务列表

这个在项目文档和待办清单里特别常见：

```markdown
- [x] 完成文章初稿
- [ ] 补充配图
- [ ] 校对错别字
```

效果：

- [x] 完成文章初稿
- [ ] 补充配图
- [ ] 校对错别字

## 链接

链接语法很简单：

```markdown
[OpenAI](https://openai.com)
```

效果：

[OpenAI](https://openai.com)

如果你想给链接加标题提示，可以这样写：

```markdown
[OpenAI](https://openai.com "OpenAI 官网")
```

还有一种“引用式链接”，适合在长文档里复用：

```markdown
[Markdown Guide][1]

[1]: https://www.markdownguide.org/
```

这种写法的好处是正文更干净，特别是参考资料很多的时候，看起来不会像 URL 仓库。

## 图片

图片语法和链接很像，只是前面多一个 `!`：

```markdown
![图片说明](https://example.com/demo.png)
```

示例：

![Engelbart](https://history-computer.com/ModernComputer/Basis/images/Engelbart.jpg)

写图片时建议顺手补上说明文字，也就是 `alt` 内容。  
一方面更利于可访问性，另一方面图片挂掉时，页面也不至于只剩一片寂寞的空白。

## 代码

技术文档里，代码是 Markdown 的主战场。

### 行内代码

适合标记命令、变量名、路径或参数：

```markdown
使用 `hugo server` 启动本地预览。
```

效果：

使用 `hugo server` 启动本地预览。

### 代码块

三反引号包起来就是代码块：

```markdown
```bash
echo "hello"
```
```

加上语言标识后，很多渲染器会支持语法高亮。

### 更贴近实际的代码示例

很多人学 Markdown 时，只看到 `print("Hello, World!")` 这一类示例。它当然没错，但也确实很像教材在说：

“你先别急着工作，我们先礼貌地 hello 一下宇宙。”

如果你平时写的是技术文档，更常见的代码块往往长这样。

```python
print("Hello, World!")
for i in range(3):
    print(i)
```

```javascript
console.log("Hello, World!");
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

```bash
hugo server -D
git add .
git commit -m "docs: update markdown article"
```

### README 场景示例

比如开源项目里非常常见的安装说明：

```markdown
## Quick Start

```bash
git clone https://github.com/example/demo.git
cd demo
npm install
npm run dev
```
```

渲染时通常会变成这种结构：

```bash
git clone https://github.com/example/demo.git
cd demo
npm install
npm run dev
```

### 配置文件示例

Markdown 也很适合展示配置片段，比如 `.env`：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/app
REDIS_URL=redis://127.0.0.1:6379
APP_ENV=production
```

或者 `YAML`：

```yaml
site:
  title: My Hugo Notes
  author: YJie

build:
  draft: false
  minify: true
```

### API 返回示例

写接口文档时，JSON 代码块也很常用：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1001,
    "title": "Markdown Guide",
    "published": true
  }
}
```

### 日志示例

排障文档里，经常还会放日志片段：

```text
2026-05-29 10:00:21 INFO  server started on :1313
2026-05-29 10:00:24 WARN  draft article detected
2026-05-29 10:00:31 ERROR failed to load config file
```

如果一篇技术文章没有代码块，它当然也能成立；只是工程师看到它时，可能会本能地觉得“这篇文章是不是还没写完”。

## 引用

引用适合拿来放说明、警告、摘录或总结。

```markdown
> Markdown 不是排版工具，
> 它更像是内容结构的轻量表达方式。
```

效果：

> Markdown 不是排版工具，
> 它更像是内容结构的轻量表达方式。

## 分隔线

分隔线常用三个短横线表示：

```markdown
---
```

效果如下：

---

它很适合在长文中切分章节，但也别用太多。分隔线一旦泛滥，读者会有一种自己在刷楼盘宣传册的错觉。

## 表格

Markdown 表格不是世界上最好写的表格，但已经足够应付大部分技术文档。

```markdown
| 编辑器 | 优点 | 适合人群 |
| --- | --- | --- |
| VS Code | 插件多 | 开发者 |
| Typora | 所见即所得 | 日常写作者 |
| Obsidian | 双链与知识管理强 | 笔记重度用户 |
```

效果：

| 编辑器 | 优点 | 适合人群 |
| --- | --- | --- |
| VS Code | 插件多 | 开发者 |
| Typora | 所见即所得 | 日常写作者 |
| Obsidian | 双链与知识管理强 | 笔记重度用户 |

### 对齐方式

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 文本 | 文本 | 文本 |

### 表格和代码一起用

在写技术文档时，很常见的一种方式是“先表格总结，再给代码示例”，例如：

| 命令 | 作用 |
| --- | --- |
| `hugo new content/articles/demo.zh-cn.md` | 新建中文文章 |
| `hugo server -D` | 本地预览 |
| `hugo` | 构建静态站点 |

对应的命令演示可以继续接在下面：

```bash
hugo new content/articles/demo.zh-cn.md
hugo server -D
hugo
```
```

效果：

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 文本 | 文本 | 文本 |

## HTML

很多 Markdown 渲染器支持直接嵌入部分 HTML：

```html
<div style="color: red;">这是一段 HTML 内容</div>
```

示例：

<div style="color: red;">这是一段 HTML 内容</div>

不过这里要注意一件事：Markdown 和 HTML 混写虽然灵活，但也很容易把文档变成“前端试验田”。能用 Markdown 表达的内容，就尽量别急着上 HTML。

## 数学公式

如果你的渲染环境支持 `MathJax` 或 `KaTeX`，Markdown 也可以写数学公式。

行间公式示例：

```markdown
$$
\begin{vmatrix}
a & b \\
c & d
\end{vmatrix}=ad-bc
$$
```

效果：

$$
\begin{vmatrix}
a & b \\\\
c & d
\end{vmatrix}=ad-bc
$$

这类语法在算法笔记、数学推导、机器学习文档里非常常见。  
不会也没关系，大多数人第一次看到时，内心 OS 都差不多是：“我到底是在写文章，还是在重修线性代数？”

## 脚注

脚注很适合补充说明，又不想打断正文阅读节奏时使用。

```markdown
这里有一个脚注示例[^example-footnote]

[^example-footnote]: 这是脚注内容。
```

效果：

这里有一个脚注示例[^example-footnote]

[^example-footnote]: 这是脚注内容。

## 定义列表

有些 Markdown 方言支持定义列表：

```markdown
Markdown
: 一种轻量级标记语言

Hugo
: 一个常见的静态站点生成器
```

效果：

Markdown
: 一种轻量级标记语言

Hugo
: 一个常见的静态站点生成器

## Mermaid 图表

如果站点开启了 Mermaid，Markdown 还能直接写流程图、时序图、看板图。对技术博客来说，这个能力非常香，毕竟不是每个人都想先打开 draw.io 再开始写一张流程图。

### 看板示例

```mermaid
kanban
  column1[待处理]
    task1[整理文章结构]
  column2[进行中]
    task2[补充示例]
  column3[已完成]
    task3[发布到 Hugo]
```

### 时序图示例

```mermaid
sequenceDiagram
    participant U as 用户
    participant E as 编辑器
    participant S as 静态站点

    U->>E: 编写 Markdown
    E->>S: Hugo 构建
    S-->>U: 输出网页
```

## 注释

Markdown 里也能写注释，常见方式是 HTML 注释：

```html
<!-- 这是一段注释，不会显示在最终页面中 -->
```

这个在多人协作或文档维护时挺有用，比如给后续编辑者留一句：“这里先别删，后面还要接 API 文档。”

## 一份更实用的写作建议

学 Markdown，最容易走偏的一件事，就是把注意力全放在“我会不会这个语法”上，却忘了文档最终是给人读的。

所以比起背语法，我更建议优先养成下面几个习惯：

| 建议 | 说明 |
| --- | --- |
| 标题层级别乱跳 | 不要 `##` 后面直接接 `####`，读者和目录都会迷路 |
| 一段别写太长 | 屏幕阅读不是卷轴考试，短段落更友好 |
| 表格别塞太满 | 表格是为了更清楚，不是为了把所有字压成 Excel |
| 代码块标语言 | 让高亮正常工作，读者体验会好很多 |
| 链接写清楚 | 不要整篇都是“点这里”“详情见此” |

Markdown 语法本身很轻，但好文章从来不轻。结构、表达、节奏、信息密度，这些才是决定文章能不能被读完的关键。

## 一段完整示例

如果你想看一个“标题、列表、链接、代码块、表格”混合在一起的实际片段，可以参考下面这个例子。

```markdown
# 项目部署说明

本文档用于说明本地如何启动项目。

## 环境要求

- Node.js 20+
- Git
- PostgreSQL

## 启动步骤

1. 克隆仓库
2. 安装依赖
3. 配置环境变量
4. 启动服务

```bash
git clone https://github.com/example/project.git
cd project
cp .env.example .env
npm install
npm run dev
```

## 环境变量

| 参数 | 说明 |
| --- | --- |
| `DATABASE_URL` | 数据库连接串 |
| `PORT` | 服务监听端口 |

更多信息见：[项目文档](https://example.com/docs)
```

这种写法的好处是，读者不需要在多个文档之间来回跳，常用信息能在一页里说明白。  
技术写作很多时候拼的不是“语法会多少”，而是“能不能让别人少问你两句”。  
如果一篇文档能帮同事少发一句“哥，这个怎么启动”，那它已经很有价值了。

## 参考资料

1. [Markdown Guide](https://www.markdownguide.org/)
2. [CommonMark](https://commonmark.org/)
3. [Hugo Documentation](https://gohugo.io/documentation/)
4. [Mermaid Documentation](https://mermaid.js.org/)

## 延伸阅读

- [CommonMark 规范](https://spec.commonmark.org/)
- [Markdown Guide Basic Syntax](https://www.markdownguide.org/basic-syntax/)
- [Mermaid 官方文档](https://mermaid.js.org/)
- [Hugo 官方文档](https://gohugo.io/)
