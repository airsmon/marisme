---
title: "Hugo【PaperMod】部署方案：GitHub Pages、Vercel、Cloudflare 与自托管对比"
slug: "hugo-papermod-hosting-options"
date: 2026-06-01T16:53:04+08:00
author:
  - Y'Jie
categories:
  - 运维
  - Hugo
tags:
  - Hugo
  - PaperMod
  - GitHub Pages
  - Vercel
  - Cloudflare Pages
  - Nginx
series:
  - PaperMod
weight: 2
description: "对比 Hugo PaperMod 站点常见部署方式，涵盖 GitHub Pages、Vercel、Cloudflare Pages 与自托管服务器，适合在成本、控制力与维护难度之间做选型时快速参考。"
summary: "对比 Hugo PaperMod 站点常见部署方式，涵盖 GitHub Pages、Vercel、Cloudflare Pages 与自托管服务器，适合在成本、控制力与维护难度之间做选型时快速参考。"
keywords:
  - Hugo 部署
  - PaperMod 部署
  - GitHub Pages
  - Vercel
  - Cloudflare Pages
  - 自托管
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
mermaid: true
---

把 Hugo 站点跑起来以后，真正决定长期体验的，往往不是主题本身，而是部署方式。平台选得合适，发布会变成稳定的日常动作；平台选得别扭，后续每次更新都会多出一些重复摩擦。

这篇文章不追求“最全平台测评”，而是从个人博客和知识站点的实际维护角度，帮你判断哪种方案更适合现在的自己。

项目地址：

{{< github repo="adityatelange/hugo-PaperMod" />}}

## 先说结论

- 想最快上线，优先考虑 `GitHub Pages` 或 `Vercel`。
- 更看重全球分发和 CDN 体验，`Cloudflare Pages` 很稳。
- 需要完全控制访问策略、服务架构或内网环境，再考虑 `Nginx` 自托管。

如果你还没有明确的特殊需求，先选一个维护成本最低的方案，比一开始追求“最强控制力”更实际。

## 选型时应该看哪几个维度

部署方式表面看是“发到哪里”，本质上是下面几件事的组合：

- 构建是否稳定：Hugo 版本、主题依赖和构建命令是否容易统一。
- 发布是否顺手：内容更新后能不能自动上线，有没有预览环境。
- 运维是否可控：证书、缓存、回滚、日志、权限要不要自己管。
- 成本是否匹配：时间成本往往比机器成本更容易被低估。

带着这几个维度去看，选择会清晰很多。

## 整体对比

| 方案 | 上手难度 | 控制力 | 成本 | 更适合的场景 |
| --- | --- | --- | --- | --- |
| `GitHub Pages` | 低 | 中 | 低 | 个人博客、公开仓库、轻量知识站 |
| `Vercel` | 低 | 中 | 低到中 | 快速发布、预览分支、体验优先 |
| `Cloudflare Pages` | 低到中 | 中 | 低 | 静态站点、全球访问、CDN 优先 |
| `Nginx` 自托管 | 中到高 | 高 | 视资源而定 | 内网、自定义策略多、完全自主可控 |

## GitHub Pages：最适合多数人的起点

如果你的站点以公开内容为主，并且本来就打算用 Git 管理文章，那 `GitHub Pages` 往往是最低心智负担的起点。

### 适合场景

- 个人博客或文档站
- 仓库本身就是内容管理入口
- 团队规模小，发布流程不复杂

### 基本流程

```bash
git init
git remote add origin https://github.com/yourname/your-site.git
git add .
git commit -m "init site"
git push -u origin main
```

### GitHub Actions 工作流示例

```yaml
name: Deploy Hugo

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.157.0"
          extended: true

      - name: Build
        run: hugo --minify
```

### 优点

- 和代码仓库天然绑定，内容更新与发布动作一致。
- 非常适合静态博客，不需要单独维护服务器。
- 借助 GitHub Actions，可以很快形成自动发布流程。

### 需要注意

- 自定义构建链路没有自托管那么灵活。
- 如果你依赖大量私有资源、特殊网络策略或复杂缓存控制，平台边界会比较明显。

## Vercel：发布体验最顺滑

如果你很在意“提交后马上可预览、回滚简单、环境配置尽量少”，`Vercel` 的体验通常会更好。

### 适合场景

- 想要更完善的预览分支能力
- 需要更流畅的团队协作演示
- 希望少碰服务器和证书配置

### 基本配置

| 配置项 | 值 |
| --- | --- |
| Framework Preset | `Other` |
| Build Command | `hugo --minify` |
| Output Directory | `public` |

### CLI 部署

```bash
npm i -g vercel
vercel
```

### 优点

- 接入 Git 仓库后几乎可以直接用。
- 预览环境很适合写作者和协作者确认改动。
- 对“频繁小迭代”的内容站点尤其友好。

### 需要注意

- 如果你只是纯静态博客，平台体验虽好，但不一定比 GitHub Pages 必要很多。
- 部分高级能力和额度策略需要按自己的用量评估。

## Cloudflare Pages：更偏向分发能力和全球访问

当你的关注点开始从“能不能上线”转向“访问是不是更稳、更快”，`Cloudflare Pages` 就会更有吸引力。

### 适合场景

- 读者分布更广，希望静态资源分发更稳定
- 已经在使用 Cloudflare 域名解析、CDN 或其他边缘能力
- 想把站点托管和边缘网络策略放在同一生态里管理

### 基本配置

| 配置项 | 值 |
| --- | --- |
| Build Command | `hugo --minify` |
| Build Output Directory | `public` |
| 环境变量 | `HUGO_VERSION=0.157.0` |

### CLI 方式

```bash
npm i -g wrangler
wrangler login
hugo --minify
wrangler pages deploy public --project-name=my-blog --commit-dirty=true
```

### 优点

- 静态资源分发和全球访问体验通常比较稳。
- 与 Cloudflare 生态整合时，域名、缓存和安全配置更顺手。

### 需要注意

- 相比最基础的 Pages 托管，认知门槛会略高一点。
- 如果你根本不需要边缘能力，它的优势不一定能完全发挥出来。

## Nginx 自托管：控制力最高，也最需要你自己负责

自托管的核心吸引力是“边界由你决定”。但边界越大，责任也越多。

### 适合场景

- 内网站点或受限网络环境
- 需要自定义认证、反向代理、WAF 或访问策略
- 需要和现有服务器体系深度整合

### 基本构建与同步

```bash
hugo --minify
rsync -avz public/ user@server:/var/www/blog/
```

### Nginx 静态托管示例

```nginx
server {
    listen 80;
    server_name blog.example.com;

    root /var/www/blog;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker 方式

```bash
docker run -d \
  --name blog \
  -p 8080:80 \
  -v $(pwd)/public:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 优点

- 路由、缓存、访问控制和发布流程都可以完全按自己的规则定义。
- 很适合纳入已有服务器或内网基础设施。

### 需要注意

- 证书、日志、备份、监控、权限和故障处理都要自己承担。
- 对个人站点来说，很多时候不是做不到，而是不值得一开始就做这么重。

## 用需求倒推选择

如果不想在平台之间反复比较参数，可以直接按问题判断：

| 你的真实需求 | 更推荐的方案 |
| --- | --- |
| 先把博客稳定发出去 | `GitHub Pages` |
| 想要更好的预览和发布体验 | `Vercel` |
| 更看重 CDN 和全球分发 | `Cloudflare Pages` |
| 必须自己掌控部署与访问策略 | `Nginx` 自托管 |

## 一个更务实的判断标准

很多站点后续出问题，并不是因为平台选错，而是因为这几件事没做好：

- 没有自动发布；
- 本地和线上 Hugo 版本不一致；
- 主题更新后没有回归验证；
- 内容改了，但发布流程没人维护。

所以真正好的部署方案，通常不是“理论上最强”的那个，而是你能稳定维护一年的那个。

## 下一步建议

当部署方式确定下来以后，下一步就该进入“定制而不失控”的阶段，例如 Mermaid、搜索、代码高亮和页脚扩展。这些能力会直接影响文章可读性和站点长期维护体验。

可以继续阅读：

- [Hugo【PaperMod】细化配置：Mermaid、搜索、高亮与页脚定制](/articles/ops/papermod/series%2003/)

## 参考资料

- [Hugo 部署文档](https://gohugo.io/hosting-and-deployment/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vercel 文档](https://vercel.com/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
