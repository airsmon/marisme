---
title: "企业如何管理模型（三）：模型平台的实际部署与落地方式"
slug: "enterprise-model-platform-implementation-practice"
date: 2026-06-02T17:50:23+08:00
author:
  - Y'Jie
categories:
  - 企业实践
  - 人工智能
tags:
  - AI Gateway
  - LLMOps
  - 模型治理
  - 企业架构
  - 落地实践
series:
  - 企业如何管理模型
weight: 3
description: "企业如何管理模型系列第三篇：聚焦 One API、new-api、Portkey AI Gateway、VoAPI、CoAI 的实际部署方式、依赖组件与落地路径，帮助企业判断应该从轻量试跑、Compose 编排，还是数据库与缓存分离的正式部署开始。"
summary: "企业如何管理模型系列第三篇：聚焦 One API、new-api、Portkey AI Gateway、VoAPI、CoAI 的实际部署方式、依赖组件与落地路径，帮助企业判断应该从轻量试跑、Compose 编排，还是数据库与缓存分离的正式部署开始。"
keywords:
  - 模型平台部署
  - AI Gateway 部署
  - One API 部署
  - New API 部署
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
mermaid: false
usageNoticeText: "请在遵守企业内部权限规范、模型服务条款、数据分级制度与所在地区生成式 AI 合规要求的前提下推进模型平台落地。"
---

第一篇讨论的是“这几类平台有什么差异”，第二篇讨论的是“企业如何统一管理员工模型调用”。  
真正到了第三步，团队最常问的已经不是“哪个更强”，而是更朴素的问题：

- 它到底怎么部署
- 需要哪些组件
- 是不是一定要数据库和 Redis
- 适合先用单机跑，还是直接上 `Docker Compose`
- 哪些平台更像轻量网关，哪些更像完整业务系统

先给结论。

- 如果你要最快试跑，`One API`、`new-api`、`Portkey AI Gateway` 的起步门槛通常更低。
- 如果你要的是前后台更完整的平台，`VoAPI`、`CoAI` 往往需要你同时准备数据库、缓存和配置文件体系。
- 对企业正式环境来说，最值得先确认的不是镜像能不能拉下来，而是这个平台的状态数据、日志、缓存和反向代理应该放在哪里。

## 背景与问题

很多团队第一次看这类项目时，容易把“支持几十家模型”当成最重要的能力。

真正落地以后你会发现，部署形态才是第一个分水岭。

因为不同项目的默认心智差很多：

- 有些项目默认就是单机先跑起来
- 有些项目默认就希望你用 `Docker Compose` 把数据库和缓存一起带上
- 有些项目更像轻量网关，本身几乎不需要重状态组件
- 有些项目更像完整平台，部署时就要考虑 MySQL、Redis、日志、文件目录和前后台资源

所以这一篇不再继续谈“概念对比”，而是直接看部署。

## 这类平台到底在解决什么

真正进入部署阶段时，你最该先看的是下面这张表。

| 类型 | 常见形态 | 典型依赖 |
|------|----------|----------|
| 轻量网关型 | 本地命令启动、Docker 单容器、Node.js 运行 | 反向代理、环境变量、少量本地状态 |
| 管理分发型 | Docker 单容器、Docker Compose、可选面板一键部署 | SQLite / MySQL / PostgreSQL、可选 Redis |
| 完整平台型 | Docker Compose、多容器、外置数据库与缓存 | MySQL / PostgreSQL、Redis、配置文件、文件挂载、反向代理 |

如果你只想先试跑，选轻量形态。  
如果你准备给团队长期使用，最好从一开始就把数据库、缓存和日志位置想清楚。

## 部署方式支持哪些，分别需要什么组件

这一节只讲最实用的部署信息。

| 平台 | 官方常见部署方式 | 默认或常见依赖组件 | 更适合的落地场景 |
|------|------------------|--------------------|------------------|
| `One API` | Docker、Docker Compose、宝塔面板、手动部署 | 默认可用 SQLite；正式环境常接 MySQL；可选 Redis；日志可拆到 MySQL / PostgreSQL | 个人试跑、小团队、企业内部门户起步 |
| `new-api` | Docker Compose、Docker、宝塔面板 | Compose 默认带 PostgreSQL + Redis；也可切 MySQL；单容器可走 SQLite 或外置 MySQL | 小团队到企业平台的过渡形态 |
| `Portkey AI Gateway` | `npx` 本地启动、Docker、Node.js、Cloudflare 等 | 基础网关形态较轻，重点是运行时和配置；公开 Quickstart 没有强依赖独立数据库 | 网关层试跑、研发测试、轻量统一入口 |
| `VoAPI` | Docker Compose、Docker 单容器 | 需要 MySQL 和 Redis；配置文件中还支持 `pg`，日志驱动可到 MySQL / PostgreSQL / ClickHouse | 想直接上完整后台与运营能力的平台 |
| `CoAI` | Docker Compose、Docker | 常见形态会连同 MySQL、Redis、配置目录一起挂载；也支持轻量 Docker + 外置 MySQL / RDS | 想直接上完整前后台和计费能力的平台 |

从部署复杂度看，大致可以这么理解：

- 最轻：`Portkey`
- 轻到中：`One API`、`new-api`
- 中到偏重：`VoAPI`、`CoAI`

## 平台展示图

先看几个平台的公开展示图，能更直观地感受它们的产品形态。

![One API](https://opengraph.githubassets.com/1/songquanpeng/one-api)

`One API` 更像典型的统一入口与管理分发平台，适合先把接口统一起来。

![new-api](https://opengraph.githubassets.com/1/QuantumNous/new-api)

`new-api` 在统一入口之外，更强调协议兼容和平台化扩展。

![Portkey AI Gateway](https://opengraph.githubassets.com/1/Portkey-AI/gateway)

`Portkey AI Gateway` 更像轻量网关和控制层，部署思路也更偏运行时。

![VoAPI](https://opengraph.githubassets.com/1/VoAPI/VoAPI)

`VoAPI` 从公开形态上就更接近完整后台和分发平台。

![CoAI](https://opengraph.githubassets.com/1/coaidev/coai)

`CoAI` 的产品心智明显更完整，更接近一站式平台而不只是转发层。

## 逐个平台看，部署时要关心什么

### `One API`：先跑起来最容易

`One API` 的优势是起步轻。根据项目 README，它可以直接用 Docker 跑，也支持 `Docker Compose`、宝塔面板和手动部署。默认可以先用 SQLite，正式环境再切 MySQL；如果要做更稳定的限流与缓存，还可以接 Redis。日志表也可以拆到单独的 MySQL 或 PostgreSQL。

这意味着它很适合两类起步方式：

- 个人或测试环境：单容器 + 本地数据目录
- 企业起步环境：Docker + MySQL，再加反向代理

如果你现在只是想证明“统一入口这件事能跑通”，它是非常顺手的第一站。

### `new-api`：从轻量入口过渡到正式平台更自然

`new-api` 的默认 `docker-compose.yml` 已经给出了很明确的信号：官方推荐的快速落地形态是 `new-api + Redis + PostgreSQL`。如果你更习惯 MySQL，也可以切过去；单容器模式下还可以先用 SQLite 或外置 MySQL。

它的好处在于，团队可以分两步走：

- 第一阶段：单容器先验证
- 第二阶段：Compose 把 PostgreSQL 和 Redis 补齐

如果你预期后面会走到更正式的平台化治理，`new-api` 的部署路径会比很多轻量项目更平滑。

### `Portkey AI Gateway`：更像运行时网关，而不是完整业务后台

`Portkey` 的公开 Quickstart 很直接：有 `Node.js` 和 `npm` 时，可以直接用 `npx @portkey-ai/gateway` 跑起来，本地还会有一个 Gateway Console。官方还给了 Docker、Node.js、Cloudflare、Replit 等多种部署路径。

这说明它的重点不是“先把数据库和后台搭齐”，而是：

- 先把网关入口跑起来
- 先验证路由、回退、Guardrails、日志控制台
- 再根据环境选择 Node、Docker 或边缘部署

如果你要的是网关层能力，而不是一个完整的运营后台，`Portkey` 的落地路径会更轻。

### `VoAPI`：部署前先把数据库和缓存准备好

`VoAPI` 的 README 很明确：无论是 `Docker Compose` 还是单容器部署，都要先准备好 `MySQL` 和 `Redis`，并正确配置 `config.yml`。配置里数据库驱动支持 `mysql` 或 `pg`，日志驱动还可以走 `mysql`、`pg` 或 `clickhouse`。

这类项目的落地思路通常不是“容器先起来再说”，而是：

1. 先把数据库和缓存准备好
2. 再把配置文件写清楚
3. 最后让应用容器接进去

所以它更适合已经明确要上正式后台、用户体系和分发能力的团队。

### `CoAI`：更像完整平台的 Compose 落地

`CoAI` 的公开部署方式也明显偏完整平台：有标准 `docker-compose` 方案，也有轻量 Docker 方案。项目说明里直接给出了 MySQL、Redis 和配置目录的挂载位置，说明它天然不是“一个无状态网关镜像”。

如果你准备把平台做成更完整的前后台系统，这类部署方式反而更符合预期：

- 应用服务单独跑
- MySQL 单独存状态数据
- Redis 单独承担缓存或会话相关能力
- 配置目录和文件目录单独持久化

它部署不算最轻，但结构更像正式平台。

## 企业实际落地时，怎么选部署方式

比起直接问“哪个平台最好”，更实用的问法是“我现在处在哪个阶段”。

| 当前阶段 | 更合适的部署思路 |
|----------|------------------|
| 个人验证 / 团队试跑 | `Portkey` 本地命令启动，或 `One API` / `new-api` 单容器 |
| 小团队正式使用 | `One API` / `new-api` + MySQL 或 PostgreSQL + 反向代理 |
| 企业平台起步 | `new-api` Compose，或 `One API` + 独立数据库 + Redis |
| 完整前后台平台 | `VoAPI` / `CoAI` 的 Compose 形态，数据库、Redis、配置目录分离 |

这张表最重要的意思不是“谁高级谁低级”，而是不要在试跑阶段就把平台搭成一个过重的系统，也不要在正式阶段还把核心入口建立在一个没有独立数据库和缓存的临时方案上。

## 正式部署前，至少确认这几件事

### 1. 状态数据放哪里

先确认平台的数据到底落在：

- SQLite
- MySQL
- PostgreSQL

如果团队以后要备份、迁移、审计和做高可用，这个问题最好不要留到上线后再补。

### 2. 缓存和限流要不要独立出来

像 `new-api`、`VoAPI`、`CoAI` 这类项目，一旦团队多人使用，Redis 往往就不只是“可选优化”，而是更稳定的正式组件。

### 3. 日志和数据目录怎么持久化

如果只把容器跑起来，不规划：

- 数据目录挂载
- 配置文件挂载
- 日志目录保留

后面排障和升级通常会很痛苦。

### 4. 外层入口怎么做

几乎所有正式部署，最后都绕不开这一层：

- Nginx
- 负载均衡
- HTTPS
- 内网域名或公网域名

平台本身解决的是模型调用，不会自动替你把企业入口治理也做完。

## 总结

这一篇的重点，不是再给平台排一次名，而是把部署现实讲清楚。

- `Portkey` 更像轻量网关，部署最快
- `One API` 和 `new-api` 适合从轻量试跑走向正式平台
- `VoAPI` 和 `CoAI` 更像完整系统，部署时就要把数据库、缓存、配置和目录规划好

如果你准备在企业里真正落地，最稳的做法通常不是先问“这个项目功能够不够多”，而是先问一句：

“我准备把它当成一个轻量入口，还是一个长期运行的平台系统？”

## 参考资料

- [One API GitHub 仓库](https://github.com/songquanpeng/one-api)
- [One API README（English）](https://github.com/songquanpeng/one-api/blob/main/README.en.md)
- [new-api GitHub 仓库](https://github.com/QuantumNous/new-api)
- [new-api Docker Compose](https://github.com/QuantumNous/new-api/blob/main/docker-compose.yml)
- [new-api 部署文档](https://github.com/QuantumNous/new-api-docs-v1/blob/main/content/docs/zh/installation/deployment-methods/local-development.mdx)
- [Portkey AI Gateway GitHub 仓库](https://github.com/Portkey-AI/gateway)
- [Portkey 部署文档](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md)
- [CoAI GitHub 仓库](https://github.com/coaidev/coai)
- [VoAPI GitHub 仓库](https://github.com/VoAPI/VoAPI)
