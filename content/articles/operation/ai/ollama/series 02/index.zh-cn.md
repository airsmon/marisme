---
title: "Open WebUI 部署实战：给 Ollama 配一个顺手的浏览器界面"
slug: "open-webui-for-ollama"
date: 2026-06-01T08:59:26+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 人工智能
tags:
  - Ollama
  - Open WebUI
  - Docker
  - 大语言模型
series:
  - Ollama
weight: 2
description: "记录 Open WebUI 的基础部署方式，并与 Ollama 对接，快速搭建一套可自托管的浏览器 AI 交互界面，适合为本地模型服务补上团队可用的 Web 入口。"
summary: "记录 Open WebUI 的基础部署方式，并与 Ollama 对接，快速搭建一套可自托管的浏览器 AI 交互界面，适合为本地模型服务补上团队可用的 Web 入口。"
keywords:
  - Open WebUI 部署
  - Ollama Web 界面
  - 自托管 AI 平台
cover:
  image: "https://img.marisme.com/avatars/2026/06/16/01-cover-open-webui.webp"
  alt: "小黑用 OLLAMA_BASE_URL 管道把 Ollama 服务接到 Open WebUI 的浏览器入口"
  caption: "给 Ollama 接上顺手的浏览器入口"
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
usageNoticeText: "请同时遵守项目许可证、模型服务条款、账号规范与数据合规要求，避免处理未授权数据。"
---

开源仓库：

{{< github repo="open-webui/open-webui" />}}

## 为什么要接 Open WebUI

纯命令行用 Ollama 没问题，但很多时候我们更需要：

- 浏览器聊天界面
- 多模型切换
- 用户友好的交互体验
- 更适合演示和日常使用的入口

这正是 `Open WebUI` 擅长的部分。

## 基础环境

- Docker
- Docker Compose
- Traefik（可选）

默认前提是：你已经有一个能访问的 `Ollama` 服务。

## 部署步骤

### 第一步：创建目录

```bash
mkdir /usr/local/src/open-webui
touch /usr/local/src/open-webui/compose.yml
```

### 第二步：编写 Compose 文件

```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY='xRHMr/hogOJBfvEm86+fFg=='
    ports:
      - "8080:8080"
    volumes:
      - /usr/local/src/open-webui/data:/app/backend/data
    networks:
      - service
    deploy:
      resources:
        limits:
          memory: 8192m
          cpus: "4.0"

networks:
  service:
    external: true
```

### 第三步：启动

```bash
docker compose up -d
```

## 配置要点

### `OLLAMA_BASE_URL`

```yaml
- OLLAMA_BASE_URL=http://ollama:11434
```

这行决定了 Open WebUI 去哪里找 Ollama。[^openwebui-baseurl]  
如果两个服务不在同一个 Docker 网络，或者容器名解析不通，前端界面可能可以打开，但无法连接模型服务。

### `WEBUI_SECRET_KEY`

```yaml
- WEBUI_SECRET_KEY='xRHMr/hogOJBfvEm86+fFg=='
```

可以用 `openssl rand -base64 16` 生成。  
不建议长期使用默认密钥。

### 数据持久化

```yaml
volumes:
  - /usr/local/src/open-webui/data:/app/backend/data
```

这部分建议保留。  
否则容器重建后，界面层的数据、配置和历史内容可能会丢失。

## 反向代理：优化访问方式

如果你已经在用 Traefik，可以直接配置域名访问：

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=service"
  - "traefik.http.routers.oi.rule=Host(`oi.artoio.com`)"
  - "traefik.http.routers.oi.entrypoints=websecure"
  - "traefik.http.routers.oi.tls=true"
  - "traefik.http.routers.oi.tls.certresolver=letsencrypt"
  - "traefik.http.routers.oi.service=oi"
  - "traefik.http.services.oi.loadbalancer.server.port=8080"
  - "traefik.http.routers.oi.middlewares=chaitin@file"
```

这样做之后，整体体验会从“本地容器页面”升级到“正经可用的内部 AI 门户”。

## 结语

如果你已经部署了 Ollama，那么 `Open WebUI` 基本就是最自然的下一步。  
它不负责跑模型，但非常负责让你更舒服地使用模型。




[^openwebui-baseurl]: 如果 Open WebUI 与 Ollama 不在同一 Docker 网络，`OLLAMA_BASE_URL` 通常需要改成可达的服务名、容器地址或反向代理地址。

## 参考资料

- [Open WebUI 官方文档](https://docs.openwebui.com/)
- [Open WebUI GitHub 仓库](https://github.com/open-webui/open-webui)
- [Ollama 官方文档](https://docs.ollama.com/)
