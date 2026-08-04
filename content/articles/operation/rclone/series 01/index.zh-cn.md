---
title: "Rclone 入门：对象存储配置、数据拷贝与后台任务"
slug: "rclone-getting-started"
date: 2026-06-01T12:00:00+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 工具
tags:
  - Rclone
  - S3
  - Qiniu
  - 对象存储
series:
  - Rclone
weight: 1
description: "从安装、交互式配置对象存储，到数据拷贝和 `systemd` 后台运行，梳理一篇够用的 Rclone 入门笔记，适合对象存储同步、备份迁移和云端文件管理场景。"
summary: "从安装、交互式配置对象存储，到数据拷贝和 `systemd` 后台运行，梳理一篇够用的 Rclone 入门笔记，适合对象存储同步、备份迁移和云端文件管理场景。"
keywords:
  - Rclone 入门
  - Rclone S3 配置
  - Rclone 七牛云
cover:
  image: "https://img.marisme.com/blog/2025/11/20/202511201335168.webp"
  alt: "Rclone 入门"
  caption: "使用 Rclone 管理对象存储和数据同步"
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
---

开源仓库：

{{< github repo="rclone/rclone" />}}

## Rclone 能做什么

几类最常见用途：

- 备份本地数据到云端
- 从云端恢复数据
- 在不同云存储之间迁移
- 挂载云盘到本地目录
- 对对象存储做统计、分析和清单查看

## 安装

### 方式一：官方脚本

```bash
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

### 方式二：系统软件包

```bash
sudo apt install rclone
```

如果只是 Debian / Ubuntu 日常环境，直接装包通常就够用了。

## 交互式配置对象存储

进入配置界面：

```bash
rclone config
```

### 第一步：创建新的 remote

```bash
No remotes found, make a new one?
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n
```

### 第二步：命名

例如：

```bash
name> qiniu
```

### 第三步：选择存储类型

如果是兼容 S3 的对象存储，选择：[^rclone-s3]

```bash
Storage> 5
```

### 第四步：选择提供商

以七牛云为例：

```bash
provider> 23
```

### 第五步：选择认证方式

```bash
env_auth> 1
```

接着输入：

- `access_key_id`
- `secret_access_key`

### 第六步：选择区域、Endpoint 和位置约束

例如：

```bash
region> 1
endpoint> 1
location_constraint> 1
bucket_acl> 1
```

其余选项按默认处理即可。

## 配置文件位置

```bash
ls -la ~/.config/rclone/rclone.conf
```

示例：

```bash
-rw------- 1 root root 255 Jan  5 15:21 .config/rclone/rclone.conf
```

这个文件保存了所有 remote 的配置信息，建议保持当前权限设置，避免泄露访问凭据。

## 常用命令

### 查看帮助

```bash
man rclone
```

### 列出所有 bucket

```bash
rclone lsd qiniu:
```

## 拷贝数据到本地

一个很实用的例子：

```bash
rclone copy qiniu:download /mnt/ \
  --transfers=4 \
  --checkers=8 \
  --bwlimit 1M \
  --fast-list \
  --size-only \
  --s3-no-check-bucket \
  --progress
```

这里几个参数比较值得记一下：

- `--transfers`：并发传输数
- `--checkers`：检查并发数
- `--bwlimit`：限速
- `--fast-list`：减少部分场景下的 API 交互
- `--progress`：显示进度

还需要注意一点：  
如果完全按默认参数跑，有时会遇到请求配额类错误。适当控制并发，往往更稳。

## 后台运行

如果复制任务比较长，可以用 `systemd-run` 放到后台执行：

```bash
systemd-run --unit=rclone-download rclone copy qiniu:download /data/download --bwlimit 15M --transfers 4 --checkers 8 --log-level INFO
```

查看状态：

```bash
systemctl status rclone-download
journalctl -u rclone-download -f
```

这套方式适合一次性的大数据同步，也更方便配合 `systemd` 查看运行状态。

## 结语

Rclone 的学习曲线主要来自“选项多”，不是“它难用”。  
只要先把一个 remote 配通，再掌握 `copy`、`sync`、`lsd`、后台运行这些核心动作，后面很多云存储操作都会顺手很多。




[^rclone-s3]: 很多国内对象存储虽然品牌不同，但在 Rclone 侧通常都归入兼容 S3 的存储类型，再根据 provider 和 endpoint 细分。

## 参考资料

- [Rclone 官方文档](https://rclone.org/)
- [Rclone GitHub 仓库](https://github.com/rclone/rclone)
- [Rclone 配置文档](https://rclone.org/docs/)
