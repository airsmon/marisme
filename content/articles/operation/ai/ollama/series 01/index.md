---
title: "Ollama 入门：在 Docker 中部署本地大模型服务"
slug: "ollama-getting-started-docker"
date: 2026-06-16T14:58:15+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 人工智能
tags:
  - Ollama
  - Docker
  - NVIDIA
  - 大语言模型
series:
  - Ollama
weight: 1
description: "记录 Ollama 的基础部署流程，包括 GPU 运行环境、Docker Compose 配置、可选的 Traefik 反向代理与数据持久化，适合在本地服务器或内网环境中搭建自托管大模型服务。"
summary: "记录 Ollama 的基础部署流程，包括 GPU 运行环境、Docker Compose 配置、可选的 Traefik 反向代理与数据持久化，适合在本地服务器或内网环境中搭建自托管大模型服务。"
keywords:
  - Ollama Docker 部署
  - 本地大模型服务
  - Ollama Traefik
cover:
  image: "https://img.marisme.com/avatars/2026/06/16/cover.webp"
  alt: "小黑把本地模型推进 Docker 盒子，旁边接入 GPU、持久化抽屉与本地服务出口"
  caption: "用 Docker 把 Ollama 变成本地大模型服务入口"
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

{{< github repo="ollama/ollama" />}}

## 基础环境

部署前建议先确认这些依赖：

- Docker
- Docker Compose
- Traefik（可选）
- `NVIDIA-Linux-x86_64-{版本}.run`
- `container-toolkit`

如果没有 GPU 运行环境，Ollama 不是不能跑，只是体验大概率会让你感受到时间的重量。[^ollama-gpu]

## 部署步骤

### 第一步：准备目录和 Compose 文件

```bash
mkdir /usr/local/src/ollama
touch /usr/local/src/ollama/compose.yml
```

### 第二步：编写 Compose

```yaml
services:
  ollama:
    image: ollama/ollama:0.12.9
    container_name: ollama
    restart: unless-stopped
    runtime: nvidia
    environment:
      - TZ=Asia/Shanghai
      - NVIDIA_VISIBLE_DEVICES=all
    ports:
      - "11434:11434"
    volumes:
      - /usr/local/src/ollama/.ollama:/root/.ollama
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

### 第三步：启动容器

```bash
docker compose up -d
```

## 数据持久化不是可选项

这一点需要单独说明。

```yaml
volumes:
  - /usr/local/src/ollama/.ollama:/root/.ollama
```

这行的作用是把模型数据、配置等内容持久化到宿主机目录。  
如果不做这一步，通常会出现下面这些情况：

- 容器重建后数据丢了
- 模型要重新拉
- 你会重新体会一次“下载几十 GB 到底有多漫长”

## Traefik 反向代理：可选，但很常见

如果你想通过域名对外访问，可以加上类似这样的 label：

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=service"
  - "traefik.http.routers.ollama.rule=Host(`ollama.artoio.com`)"
  - "traefik.http.routers.ollama.entrypoints=websecure"
  - "traefik.http.routers.ollama.tls=true"
  - "traefik.http.routers.ollama.tls.certresolver=letsencrypt"
  - "traefik.http.routers.ollama.service=ollama"
  - "traefik.http.services.ollama.loadbalancer.server.port=11434"
  - "traefik.http.routers.ollama.middlewares=chaitin@file"
```

这样配置后：

- 可以通过域名访问服务
- 可以直接接入 HTTPS
- 后续接 Open WebUI 这类前端也更方便

## 结语

Ollama 本身并不复杂，它更像本地大模型世界里的“统一服务入口”。  
只要 GPU 运行环境准备好，Compose 写清楚，再把 `.ollama` 目录持久化，这套服务就会稳定很多。

如果后续还需要浏览器界面，可以继续接入 `Open WebUI`。



[^ollama-gpu]: Ollama 官方文档与 NVIDIA Container Toolkit 文档都建议在有 GPU 加速条件时运行较大的模型，以获得更可接受的推理体验。

## 参考资料

- [Ollama 官方文档](https://docs.ollama.com/)
- [Ollama GitHub 仓库](https://github.com/ollama/ollama)
- [NVIDIA Container Toolkit 文档](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/)
