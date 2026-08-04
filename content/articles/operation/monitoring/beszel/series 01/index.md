---
title: "Beszel 入门：轻量监控平台的部署、主动/被动模式与告警"
slug: "beszel-getting-started"
date: 2026-06-01T09:16:45+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 监控
tags:
  - Beszel
  - Monitoring
  - Docker
  - 告警
series:
  - Beszel
weight: 1
description: "记录 Beszel 的基础部署方式，并梳理 hub / agent 架构、主动与被动接入模式，以及飞书告警配置思路，适合个人和小团队快速搭建轻量监控平台的场景。"
summary: "记录 Beszel 的基础部署方式，并梳理 hub / agent 架构、主动与被动接入模式，以及飞书告警配置思路，适合个人和小团队快速搭建轻量监控平台的场景。"
keywords:
  - Beszel 入门
  - Beszel Docker 部署
  - Beszel 飞书告警
cover:
  image: "https://img.marisme.com/blog/2025/11/20/202511201335226.webp"
  alt: "Beszel 入门"
  caption: "部署轻量级服务器监控平台 Beszel"
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

开源仓库：

{{< github repo="henrygd/beszel" />}}

## Beszel 的两部分结构

Beszel 由两个角色组成：[^beszel-arch]

- `hub`：中心服务，提供 Web 管理界面
- `agent`：部署在被监控主机上，负责上报指标

```mermaid
flowchart LR
  A1["Agent 1"] --> H["Beszel Hub"]
  A2["Agent 2"] --> H
  A3["Agent 3"] --> H
  H --> N["通知 / 告警"]
```

## 部署中心服务

可以直接用 Docker Compose 部署：

```yaml
services:
  beszel:
    image: henrygd/beszel:0.15.2
    container_name: beszel
    restart: unless-stopped
    volumes:
      - /etc/localtime:/etc/localtime
      - ./beszel/beszel_data:/beszel_data
      - ./beszel/beszel_socket:/beszel_socket
    environment:
      TZ: Asia/Shanghai
    networks:
      - service
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.50"

networks:
  service:
    external: true
```

这套配置比较轻量，适合作为基础部署模板。

## 主动模式和被动模式如何选择

### 主动模式

特点：

- Hub 主动访问客户端
- 适合客户端有固定公网 IP
- 服务器能直接访问客户端 `IP:Port`

![Beszel 主动模式](https://img.marisme.com/blog/2025/11/05/202511051606160.png)

### 被动模式

特点：

- 客户端主动把数据送到服务端
- 适合客户端没有固定公网 IP
- 适合客户端处于 NAT 后面

![Beszel 被动模式](https://img.marisme.com/blog/2025/11/05/202511051610442.png)

实际选择时可以按下面方式判断：

- **能被直连**：优先主动
- **藏在 NAT 后面**：优先被动

## 被动模式接入步骤

接入顺序可以按下面操作：

1. 打开设置
2. 进入 `指纹与令牌`
3. 开启 `通用令牌`
4. 复制对应部署模式的安装命令

这种设计把接入步骤集中在界面里，部署时更容易对照完成。

## 告警配置

这里可以先明确一个问题：

“我们为什么要监控？只是为了把数据收集起来摆在那儿看吗？”

监控的价值不只是收集数据，还在于指标异常时能够及时通知。

Beszel 支持：

- 邮件
- Webhook

这里以飞书为例。

### 飞书告警配置

1. 在飞书创建机器人
2. 复制 Webhook 最后一段 ID

例如：

```bash
https://open.feishu.cn/open-apis/bot/v2/hook/409963d1-7927-4259-a152-d8590sds8f3a
```

3. 在 Beszel 设置里拼成：

```bash
lark://open.feishu.cn/409963d1-7927-4259-a152-d8590sds8f3a
```

4. 测试发送
5. 再到告警页配置阈值

![Beszel 告警配置](https://img.marisme.com/blog/2025/11/19/202511191501377.png)

## 反向代理：可选

如果你想通过域名访问，可以挂 Traefik：

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=service"
  - "traefik.http.routers.beszel.rule=Host(`monitor.artoio.com`)"
  - "traefik.http.routers.beszel.entrypoints=websecure"
  - "traefik.http.routers.beszel.tls=true"
  - "traefik.http.routers.beszel.tls.certresolver=letsencrypt"
  - "traefik.http.routers.beszel.service=beszel"
  - "traefik.http.services.beszel.loadbalancer.server.port=8090"
```

## 结语

Beszel 的优势不在于“全家桶式监控大平台”，而在于：

- 部署轻
- 接入快
- 界面直观
- 告警够用

如果你需要的是一套能快速覆盖多台主机、又不想一上来就把监控系统做成一个大型项目的方案，它很值得一试。




[^beszel-arch]: Beszel 官方文档将其核心架构划分为 hub 与 agent 两部分，其中 hub 负责管理界面，agent 负责节点指标采集。

## 参考资料

- [Beszel 官方文档](https://beszel.dev/zh/guide/what-is-beszel)
- [PocketBase 官方文档](https://pocketbase.io/docs/)
- [Beszel GitHub 仓库](https://github.com/henrygd/beszel)
