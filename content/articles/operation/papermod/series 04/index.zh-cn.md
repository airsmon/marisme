---
title: "Hugo【PaperMod】书影音短代码卡片：手动方式更稳"
slug: "hugo-papermod-media-shortcode-card"
date: 2026-06-05T07:40:49+08:00
author:
  - Y'Jie
categories:
  - 运维
  - Hugo
tags:
  - Hugo
  - PaperMod
  - Shortcode
  - CSS
  - Douban
  - TMDB
series:
  - PaperMod
weight: 4
description: "为 PaperMod 站点做一版适合图书与影视内容的 shortcode card，采用更稳定的手动填写方式组织封面、标题、作者或导演、分类与简介。"
summary: "用一个通用 media shortcode，同时展示图书卡与电影卡，采用纯手动字段的方式保证展示稳定。"
keywords:
  - Hugo 媒体卡片
  - PaperMod shortcode
  - ISBN
  - IMDb
  - TMDB card
  - 书影音展示
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
---

这篇文章现在只保留更稳的手动填写方式，用来展示这套 shortcode card 的推荐写法。

目标很明确：

1. 延续站内 `GitHub card` 的整洁感。
2. 让图书和电影能共用一套结构。
3. 用最少但明确的字段，把封面、标题、作者或导演、分类和简介组织清楚。

当前短代码的调用方式可以先分成两类：

- 图书手动模式
- 影视手动模式

现在这版不再依赖任何构建期远程取数接口，所有展示字段都由 shortcode 显式传入。这样卡片不会受到第三方接口可用性、限流或数据质量波动的影响。

## 图书手动示例

```go-html-template
{{</* media
  type="book"
  url="https://book.douban.com/subject/26797606/"
  title="置身事内"
  cover="https://img9.doubanio.com/view/subject/l/public/s33641135.jpg"
  rating="9.1"
  ratingLabel="Douban"
  meta1="作者：兰小欢"
  tags="中国经济, 财政, 政府, 非虚构"
>}}从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。{{</* /media */>}}
```

{{< media
  type="book"
  url="https://book.douban.com/subject/26797606/"
  title="置身事内"
  cover="https://img.marisme.com/blog/2026/06/04/20260604134228580.webp"
  rating="9.1"
  isbn="9787208171336"
  ratingLabel="Douban"
  meta1="作者：兰小欢"
  tags="中国经济, 财政, 政府, 非虚构"
>}}从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。从地方政府、土地财政与产业发展切入，解释中国经济运行中的很多现实机制。{{< /media >}}

## 影视手动示例

```go-html-template
{{</* media
  type="movie"
  url="https://www.themoviedb.org/movie/4935"
  title="Howl's Moving Castle"
  cover="https://media.themoviedb.org/t/p/w300_and_h450_bestv2/23hUJh7JdO23SpgUB5oiFDQk2wX.jpg"
  meta1="导演：宫崎骏"
  tags="动画, 奇幻, 冒险"
>}}少女苏菲被施下诅咒后闯入哈尔的移动城堡，在战火与魔法交织的旅程里重新理解勇气与爱。{{</* /media */>}}
```

{{< media
  type="movie"
  url="https://www.themoviedb.org/movie/4935"
  title="Howl's Moving Castle"
  cover="https://image.tmdb.org/t/p/original/f0oD8iTikLZPszN3Dp2wRpOY8qd.jpg"
  meta1="导演：宫崎骏"
  tags="动画, 奇幻, 冒险"
>}}少女苏菲被施下诅咒后闯入哈尔的移动城堡，在战火与魔法交织的旅程里重新理解勇气与爱。少女苏菲被施下诅咒后闯入哈尔的移动城堡，在战火与魔法交织的旅程里重新理解勇气与爱。少女苏菲被施下诅咒后闯入哈尔的移动城堡，在战火与魔法交织的旅程里重新理解勇气与爱。少女苏菲被施下诅咒后闯入哈尔的移动城堡，在战火与魔法交织的旅程里重新理解勇气与爱。{{< /media >}}

```go-html-template
{{</* media
  type="movie"
  url="https://www.themoviedb.org/movie/372058"
  title="Your Name."
  cover="https://media.themoviedb.org/t/p/w300_and_h450_bestv2/8cFxeflG3pVRJcy339HwImTOUlc.jpg"
  meta1="导演：新海诚"
  tags="动画, 爱情, 奇幻"
>}}一场跨越时空的身体互换，把两位少年少女的命运悄悄系在一起。{{</* /media */>}}
```

{{< media
  type="movie"
  url="https://www.themoviedb.org/movie/372058"
  title="Your Name."
  cover="https://media.themoviedb.org/t/p/w300_and_h450_bestv2/8cFxeflG3pVRJcy339HwImTOUlc.jpg"
  meta1="导演：新海诚"
  tags="动画, 爱情, 奇幻"
>}}一场跨越时空的身体互换，把两位少年少女的命运悄悄系在一起。一场跨越时空的身体互换，把两位少年少女的命运悄悄系在一起。一场跨越时空的身体互换，把两位少年少女的命运悄悄系在一起。一场跨越时空的身体互换，把两位少年少女的命运悄悄系在一起。{{< /media >}}

## 手动模式说明

当前这版真正展示出来的字段是：

1. `cover`
2. `title`
3. `meta1`
4. `isbn` 或 `imdb`
5. `tags`
6. `desc`
7. 可选的 `rating + ratingLabel`

这种写法的优点是：

1. 数据稳定，不依赖外部接口是否可访问。
2. 你可以自由决定标题语言、简介长度和展示字段。
3. 特别适合电影、剧集、年度片单和带主观短评的内容。

## 推荐写法

如果按现在这版 shortcode 的稳定性来选，我建议：

1. 图书直接传 `url + cover + title + meta1 + isbn + tags + desc`。
2. 电影和剧集优先用 `imdb + cover + title + meta1 + tags + desc`，也可以直接传 `TMDB / 豆瓣` 链接。
3. `meta1` 放作者或导演，`tags` 放分类，`desc` 放一句短简介。
4. 如果需要评分，再补 `rating + ratingLabel`。

## 混排效果

如果文章里既有书也有电影，混排时最重要的不是字段完全一致，而是：

- 封面比例统一；
- 标题层级统一；
- 作者或导演的位置统一；
- 评分 badge 始终处在同一视觉区域。

这样读者在滚动正文时，会自然把它们识别为同一类“媒体卡片”，而不是样式各异的第三方嵌入块。

## 当前建议

这版 shortcode 现在的重点就是稳定展示：

1. 一张卡片支持图书、电影和可扩展的剧集类内容。
2. 不再依赖任何远程接口自动取数。
3. 图书会显示 `ISBN`，影视会显示 `IMDb`。
4. 保持移动端可读性，窄屏下封面会缩小，右侧信息继续成立。

后续如果要继续增强，比较自然的方向有两个：

1. 给卡片补一个双链接区，比如同时放 `TMDB` 与 `Douban / IMDb`。
2. 再做一个 `media-grid` 容器，用于清单页两列展示。
