---
title: "Cloudflare Pages 部署博客：把构建和发布这两件事拆开看"
slug: "cloudflare-pages-blog-deploy"
date: 2026-06-16T15:57:01+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 平台
tags:
  - Cloudflare
  - Pages
  - GitHub Actions
  - 静态站点
series:
  - Cloudflare Pages
weight: 1
description: "梳理用 Cloudflare Pages 部署博客时的两种常见路线：全 Cloudflare 托管，以及 GitHub Actions 构建后再交给 Cloudflare 发布，适合静态站点、个人博客和文档站发布场景。"
summary: "梳理用 Cloudflare Pages 部署博客时的两种常见路线：全 Cloudflare 托管，以及 GitHub Actions 构建后再交给 Cloudflare 发布，适合静态站点、个人博客和文档站发布场景。"
keywords:
  - Cloudflare Pages 部署博客
  - GitHub Actions Cloudflare Pages
  - 静态站点部署
cover:
  image: "https://img.marisme.com/avatars/2026/06/16/1781596607660.webp"
  alt: "Cloudflare Pages"
  caption: "用 Cloudflare Pages 托管和发布静态博客"
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
mermaid: true
---

## 先拆开构建与部署

很多人第一次接触 `Cloudflare Pages` 时，会把“构建”和“部署”混成一件事。  
实际上它更像两段流水线：

1. **构建**：把源码变成静态文件
2. **部署**：把静态文件发布到全球边缘网络

所以常见路线大致有两种：

## 方案一：All in Cloudflare

这条路线最省心：

- 代码托管在 GitHub / GitLab
- Cloudflare Pages 直接拉代码
- 在 Cloudflare 上完成构建
- 构建成功后直接发布

适合场景：

- 博客是标准静态站点
- 构建步骤比较简单
- 你希望平台少一点、流程短一点

优点：

- 配置简单
- 平台集中
- 对个人博客和中小项目很友好

注意点：

- 构建环境受平台限制
- 某些复杂自定义步骤灵活度没本地 CI 高

## 方案二：GitHub Actions 构建，Cloudflare Pages 部署

这条路线更适合“想把构建过程完全掌控在自己手里”的场景。

流程大致是：

```mermaid
flowchart LR
  G["Git 仓库"] --> A["GitHub Actions 构建"]
  A --> D["生成静态产物"]
  D --> C["Cloudflare Pages 部署"]
  C --> U["全球边缘访问"]
```

适合场景：

- 需要自定义构建逻辑
- 想在 CI 里加更多校验
- 有多环境、多分支或更细致的发布流程

优点：

- 构建过程更透明
- 更容易插入 lint、测试、产物检查
- 与现有 GitHub CI 流程整合更自然

代价：

- 平台更多一层
- 配置项也会多一点

## 如何做部署选型

如果你是个人博客或小型内容站：

- 优先考虑 `All in Cloudflare`

如果你已经有成熟的 GitHub Actions 流程，或者项目构建逻辑比较复杂：

- 选择 “GitHub 构建，Cloudflare 发布” 会更舒服

简单说：

- 想省事，用 Cloudflare 一条龙
- 想掌控细节，用 GitHub Actions + Cloudflare Pages

## 适合哪些站点

它特别适合：

- Hugo
- Next.js 静态导出
- Astro
- VuePress / VitePress
- 文档站
- Landing Page

也就是说，只要你的站点最终能产出一份静态文件目录，Cloudflare Pages 基本都能接得住。

## 结语

Cloudflare Pages 的优势不只是“能部署”，而是它把全球分发、HTTPS、边缘网络这些原本挺重的事，压缩成了一个非常轻的发布入口。

对博客来说，真正值得先想清楚的不是“按钮在哪”，而是：  
你想把构建交给谁，把发布交给谁。想清楚这件事，整套部署路线就顺了。



## 参考资料

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Framework Presets](https://developers.cloudflare.com/pages/framework-guides/)
- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
