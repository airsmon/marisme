---
title: "Hugo【PaperMod】广告卡片 Shortcode：在正文里放一张轻量推荐卡"
slug: "hugo-papermod-ad-shortcode-card"
date: 2026-06-09T16:50:53+08:00
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
  - 广告卡片
series:
  - PaperMod
weight: 5
description: "为 PaperMod 站点增加一版适合正文使用的广告卡片 shortcode，借鉴微信公众号广告卡片的信息层级，并延续站内 GitHub card 的视觉语言。"
summary: "用一个轻量 ad shortcode，在文章正文中展示赞助推荐、合作资源或工具入口，保持广告标识清晰，同时不打断阅读体验。"
keywords:
  - Hugo 广告卡片
  - PaperMod shortcode
  - 赞助推荐
  - 微信公众号广告卡片
  - GitHub card
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

有些文章里会需要放一个外部入口：可能是赞助推荐，也可能是工具、服务、课程、资料包或合作资源。

如果直接放一段纯文本链接，存在感太弱；如果放一张大图，又很容易打断阅读。更合适的方式，是做一张轻量广告卡片：明确标识它是推荐内容，但视觉上仍然属于文章的一部分。

这版 `ad` shortcode 的设计思路是：

1. 信息层级参考微信公众号广告卡片。
2. 视觉语言延续站内已有的 `GitHub card`。
3. 字段全部手动填写，不依赖构建期远程接口。
4. 带有推广性质的卡片在顶部显示 `推广内容`、`广告` 或 `赞助` 这类标识。
5. 明暗主题和移动端都交给 PaperMod 的变量体系适配。

## 适合放什么内容

这张卡片适合放在正文段落之间，用于承载一个明确的行动入口。

常见场景包括：

- 赞助商或合作伙伴；
- 工具、服务、云产品推荐；
- 文章相关的项目、模板、资料；
- 课程、电子书、咨询服务；
- 微信公众号、社群或订阅入口。

它不适合做成全站横幅，也不适合承载太长的营销文案。卡片里的文字越像一条清楚的内容推荐，读者越容易接受。

## 基础示例

最简单的写法只需要标题、说明、链接和几个标签。

```go-html-template
{{</* ad
  title="Cloudflare Workers 部署助手"
  label="赞助推荐"
  url="https://example.com"
  mark="CF"
  disclosure="推广内容"
  tags="免费额度,开发工具,边缘部署"
  cta="了解详情"
  accent="#f59e0b"
*/>}}
把静态站点、API 和定时任务放到边缘节点运行，适合个人项目和轻量服务。
{{</* /ad */>}}
```

{{< ad
  title="Cloudflare Workers 部署助手"
  label="赞助推荐"
  url="https://example.com"
  mark="CF"
  disclosure="推广内容"
  tags="免费额度,开发工具,边缘部署"
  cta="了解详情"
  accent="#f59e0b"
>}}
把静态站点、API 和定时任务放到边缘节点运行，适合个人项目和轻量服务。
{{< /ad >}}

这一类卡片的重点不是“看起来很像广告”，而是让读者在不离开阅读节奏的前提下，快速判断这个入口是否和当前内容有关。

## RackNerd 推广示例

如果是带有 affiliate 链接的推广内容，可以把 `disclosure` 明确写成 `推广内容`，把 `label` 写成具体推广类型。

```go-html-template
{{</* ad
  title="RackNerd VPS 优惠"
  label="VPS 推广"
  url="https://my.racknerd.com/aff.php?aff=10917"
  mark="RN"
  disclosure="推广内容"
  preview="https://img.marisme.com/avatars/2026/06/09/20260609165025485.webp"
  previewAlt="RackNerd"
  previewMode="background"
  tags="VPS,海外主机,独立服务器,优惠活动"
  cta="查看优惠"
  accent="#d9232e"
*/>}}
适合需要海外 VPS、轻量服务部署或测试环境的读者，购买前建议按实际需求确认配置、线路和续费价格。卡片描述会固定显示两行，超出部分自动隐藏。
{{</* /ad */>}}
```

{{< ad
  title="RackNerd VPS 优惠"
  label="VPS 推广"
  url="https://my.racknerd.com/aff.php?aff=10917"
  mark="RN"
  disclosure="推广内容"
  preview="https://img.marisme.com/avatars/2026/06/09/20260609165025485.webp"
  previewAlt="RackNerd"
  previewMode="background"
  tags="VPS,海外主机,独立服务器,优惠活动"
  cta="查看优惠"
  accent="#d9232e"
>}}
适合需要海外 VPS、轻量服务部署或测试环境的读者，购买前建议按实际需求确认配置、线路和续费价格。卡片描述会固定显示两行，超出部分自动隐藏。
{{< /ad >}}

## 字段说明

当前支持的字段如下：

| 字段 | 作用 | 是否必填 |
| --- | --- | --- |
| `title` | 卡片主标题，也可以用 `name` | 建议填写 |
| `label` | 顶部小标签，默认是 `赞助推荐` | 可选 |
| `desc` | 描述文字，也可以用 shortcode 正文传入 | 可选 |
| `url` | 跳转链接，也可以用 `href` | 可选 |
| `logo` | 左侧图片或 Logo，也可以用 `image` | 可选 |
| `alt` | Logo 替代文本 | 可选 |
| `preview` | 卡片中的横向展示图，也可以用 `cover` 或 `banner` | 可选 |
| `previewAlt` | 横向展示图替代文本，也可以用 `coverAlt` 或 `bannerAlt` | 可选 |
| `previewMode` | 展示图模式，默认 `inline`，可设为 `background` 作为右侧视觉面板 | 可选 |
| `mark` | 无 Logo 时显示的短字母标识，默认是 `AD` | 可选 |
| `disclosure` | 推广性质标识，默认是 `推广内容`，也可以写成 `广告`、`赞助`、`合作` | 建议保留 |
| `tags` | 逗号分隔的底部标签 | 可选 |
| `cta` | 右侧按钮文字，默认是 `了解详情` | 可选 |
| `accent` | 卡片强调色，例如 `#5f7cff` | 可选 |

如果没有传 `url`，卡片会渲染成普通 `div`，不会带外链行为。这样也可以把它当作站内提示卡或合作说明使用。

如果卡片有推广或合作性质，建议保留 `disclosure`。`disclosure` 会和 `label` 组成顶部推广条，比如 `推广内容 · 赞助推荐`，前者说明性质，后者说明内容类型。

## Logo 示例

如果有品牌 Logo，可以传入 `logo`。图片会被限制在左侧图标容器里，避免影响正文排版。

```go-html-template
{{</* ad
  title="Marisme Newsletter"
  label="订阅推荐"
  url="https://example.com/newsletter"
  logo="/android-chrome-192x192.png"
  alt="Marisme"
  disclosure="推广内容"
  tags="每周更新,技术文章,个人观察"
  cta="去订阅"
*/>}}
把博客里的长文、工具记录和近期折腾整理成一封更容易追踪的邮件。
{{</* /ad */>}}
```

{{< ad
  title="Marisme Newsletter"
  label="订阅推荐"
  url="https://example.com/newsletter"
  logo="/android-chrome-192x192.png"
  alt="Marisme"
  disclosure="推广内容"
  tags="每周更新,技术文章,个人观察"
  cta="去订阅"
>}}
把博客里的长文、工具记录和近期折腾整理成一封更容易追踪的邮件。
{{< /ad >}}

这里的 Logo 不是主视觉，只是识别锚点。真正承担信息表达的，仍然是标题、描述和标签。

## 无链接示例

有时只是需要在文章中声明合作关系，或者给读者一个轻量提示，不一定要跳转。

```go-html-template
{{</* ad
  title="本文包含合作资源推荐"
  label="内容说明"
  mark="i"
  disclosure="说明"
  tags="透明标识,不影响正文,手动维护"
  accent="#64748b"
*/>}}
推荐内容会使用相同的广告卡片样式标识，正文判断和技术说明仍按实际体验整理。
{{</* /ad */>}}
```

{{< ad
  title="本文包含合作资源推荐"
  label="内容说明"
  mark="i"
  disclosure="说明"
  tags="透明标识,不影响正文,手动维护"
  accent="#64748b"
>}}
推荐内容会使用相同的广告卡片样式标识，正文判断和技术说明仍按实际体验整理。
{{< /ad >}}

这个分支会生成普通卡片，不会出现右侧 CTA，也不会设置外链属性。

## 为什么参考 GitHub Card

站内原本已经有一套 `github` shortcode，用来展示开源仓库。它的优点是克制、信息密度合适，而且能自然插入技术文章正文。

广告卡片复用了这套结构感：

1. 左侧一个小图标区域；
2. 中间是标签、标题和描述；
3. 右侧是轻量 CTA；
4. 底部用 pill 标签补充场景信息。

区别在于，广告卡片不展示仓库元数据，而是展示商业或合作内容需要的字段。这样既能保持视觉一致，也能让读者清楚知道这不是普通仓库卡。

## 实现位置

当前实现拆成两个文件：

```text
layouts/_shortcodes/ad.html
assets/css/extended/20-shortcode-ad.css
```

模板只做字段读取和结构输出；样式放在 PaperMod 的 `assets/css/extended/` 下，由主题扩展机制自动加载。

这样做的好处是：

1. 不需要修改 PaperMod 主题源码；
2. 不影响已有 `github-card`；
3. 后续要调整广告卡片，只需要改 `ad-card` 这一组类名；
4. Hugo 构建时不需要访问外部接口。

## 推荐写法

实际使用时，建议控制三个长度：

1. `title` 控制在一行内。
2. 描述控制在一到两行。
3. `tags` 控制在三到四个。

如果是广告或合作内容，`label` 不建议写得过于模糊。可以直接使用：

- `赞助推荐`
- `合作资源`
- `广告`
- `内容说明`

透明标识比伪装成普通内容更重要。读者知道它是推荐内容，但不觉得阅读被粗暴打断，这张卡片的目标就达到了。
