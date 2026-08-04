---
title: "Linux Bond 配置实战：用 nmcli 搞定链路冗余与聚合"
slug: "linux-bond-with-nmcli"
date: 2026-06-01T15:02:51+08:00
author:
  - Y'Jie
categories:
  - 运维
  - Linux
tags:
  - Linux
  - Bond
  - nmcli
  - Red Hat
  - Rocky Linux
series:
  - Bond
weight: 1
description: "面向 RHEL、Rocky Linux、CentOS 9 场景，讲清 Bond 的常见模式、`xmit_hash_policy` 以及用 `nmcli` 完成配置与验证的方法，适合服务器双网口冗余和 LACP 聚合部署。"
summary: "面向 RHEL、Rocky Linux、CentOS 9 场景，讲清 Bond 的常见模式、`xmit_hash_policy` 以及用 `nmcli` 完成配置与验证的方法，适合服务器双网口冗余和 LACP 聚合部署。"
keywords:
  - Linux Bond 配置
  - nmcli bond
  - 802.3ad LACP
cover:
  image: "https://img.marisme.com/blog/2025/11/04/202511040921283.png"
  alt: "Linux Bond 配置"
  caption: "使用 nmcli 配置 Linux Bond"
  relative: false
  hiddenInList: true
  hiddenInSingle: true
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

## Bond 是什么

Bond 的作用可以简单分成两类：

- **链路冗余**：一块网卡挂了，另一块顶上
- **带宽聚合**：多块网卡一起分担流量

所以它不是简单的“多网卡捆绑”，而是让多个物理接口表现成一个逻辑接口，同时根据模式决定行为。

## 常见模式

| ID | 模式 | 特性 | 交换机要求 | 适合场景 |
| --- | --- | --- | --- | --- |
| 0 | balance-rr | 轮询分发 | 需要静态聚合 | 追求带宽 |
| 1 | active-backup | 主备冗余 | 无需交换机配置 | 最稳妥的服务器默认选择 |
| 2 | balance-xor | 哈希分流 | 需要静态聚合 | 并发场景 |
| 3 | broadcast | 广播发包 | 一般少用 | 特殊心跳场景 |
| 4 | 802.3ad | LACP 动态聚合 | 交换机必须启用 LACP | 生产环境常见首选 |
| 5 | balance-tlb | TX 负载均衡 | 无要求 | 老场景 |
| 6 | balance-alb | TX/RX 负载均衡 | 无要求 | 无法配置交换机时的折中方案 |

## `xmit_hash_policy` 是什么

这个参数主要和 `mode 2`、`mode 4` 搭配使用。

常见值：

| 值 | 行为 | 特性 |
| --- | --- | --- |
| `layer2` | 基于 MAC | 简单，但容易单链路跑满 |
| `layer3+4` | 基于 IP + 端口 | 更容易实现真正并发 |

如果你在做 `802.3ad` 聚合，`layer3+4` 通常会更实用。

## 用 nmcli 配置 Bond

在 RHEL 9 / Rocky 9 / CentOS 9 里，直接用 `nmcli` 是很自然的方式。

### 1. 创建 bond0

```bash
nmcli connection add type bond ifname bond0 con-name bond0 mode active-backup
```

### 2. 修改 Bond 参数

```bash
nmcli connection modify bond0 bond.options "mode=802.3ad,xmit_hash_policy=layer3+4,miimon=100"
```

### 3. 配置 IP

```bash
nmcli connection modify bond0 ipv4.method manual ipv4.addresses "192.168.10.15/24"
```

### 4. 添加物理接口

```bash
nmcli connection add type ethernet ifname ens146f0 con-name ens146f0 master bond0
nmcli connection add type ethernet ifname ens146f1 con-name ens146f1 master bond0
```

### 5. 启动连接

```bash
nmcli connection up bond0
nmcli connection up ens146f0
nmcli connection up ens146f1
```

这里要写成 `connection`，不要误写成 `connectionc`，否则命令会直接报错。

### 6. 查看状态

```bash
nmcli connection show
```

## 如何验证配置是否生效

### 查看带宽信息

```bash
ethtool bond0
```

![Bond 带宽信息](https://img.marisme.com/blog/2025/11/07/202511071641939.png)

### 查看 Bond 详细状态

```bash
cat /proc/net/bonding/bond0
```

![Bond 详细状态](https://img.marisme.com/blog/2025/11/07/202511071642134.png)

这个文件可以直接反映 Bond 的实际状态，例如：

- 模式不对
- Slave 没都挂上
- LACP 状态没同步

都能在这里暴露出来。

## 结语

Bond 配置并不神秘，真正关键的是：

- 明确你要冗余还是聚合
- 模式和交换机侧配置一致
- 验证别只看“接口起来了”，还要看 `/proc/net/bonding/bond0`

一句话总结：  
把网卡绑起来很容易，把它们绑得既稳定又高效，才是真正的活。



## 参考资料

- [Red Hat nmcli 文档](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/assembly_managing-network-bonding_configuring-and-managing-networking)
- [Linux Bonding Driver HOWTO](https://www.kernel.org/doc/Documentation/networking/bonding.txt)
