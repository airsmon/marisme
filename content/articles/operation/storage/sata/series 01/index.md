---
title: "存储接口与协议入门：SATA、M.2、U.2、AHCI、NVMe 一次讲清"
slug: "storage-interface-and-protocol-introduction"
date: 2026-06-01T12:05:00+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 存储
tags:
  - SATA
  - M.2
  - U.2
  - AHCI
  - NVMe
  - PCIe
series:
  - 存储接口与协议
weight: 1
description: "梳理存储领域里最容易混淆的三层概念：物理接口、传输协议和上层逻辑协议，并结合 SATA、PCIe、AHCI、NVMe 做整体说明，适合选型、装机和存储基础知识入门场景。"
summary: "梳理存储领域里最容易混淆的三层概念：物理接口、传输协议和上层逻辑协议，并结合 SATA、PCIe、AHCI、NVMe 做整体说明，适合选型、装机和存储基础知识入门场景。"
keywords:
  - SATA M.2 U.2 区别
  - AHCI NVMe 区别
  - PCIe 存储协议
cover:
  image: "https://img.marisme.com/blog/2025/11/21/202511210912247.webp"
  alt: "存储接口与协议"
  caption: "从接口形态到协议栈理解现代存储"
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

![存储接口与协议示意](https://img.marisme.com/blog/2025/11/20/202511201640565.webp)

## 先分清三层概念

理解存储设备时，最好先拆成三层：

1. **物理接口**：设备长什么样、怎么插
2. **传输协议**：数据在线路上怎么传
3. **上层协议**：主机和控制器怎么协作

如果这三层没分开，讨论 `M.2`、`NVMe`、`SATA` 时就特别容易鸡同鸭讲。

## 物理接口：先看“怎么接”

常见接口形态：

| 接口名称 | 描述 |
| --- | --- |
| SATA | 经典 L 形接口，7 针数据 + 15 针供电 |
| mSATA | 更小型化，类似 Mini PCIe 形态 |
| M.2 | 扁平卡式接口，常见于笔记本和主板 |
| U.2 | 2.5 英寸企业盘常见，支持 NVMe |
| PCIe 插槽卡 | 直接插主板 PCIe 槽，常见于高性能卡式 SSD |

这里要特别注意：  
**接口形态不等于协议本身。**

比如 `M.2` 只是长得像一张小板卡，不代表它一定就是 NVMe；它也可能跑 SATA。

## 传输协议：再看“数据怎么走”

### SATA

`SATA` 历史很久，稳定、成熟、兼容性好。  
它常见于：

- 传统 HDD
- 早期 SSD
- 一些仍然追求兼容性的场景

典型上限通常是：

- `SATA 3.0` 约 `600 MB/s`

### PCIe

`PCIe` 本身是高速通道标准，负责定义数据如何在主板总线上传输。  
它不只是给存储用，还广泛用于：

- GPU
- 高速网卡
- USB 控制器

在存储里，PCIe 的意义是：  
它给 NVMe 这种更高性能的协议提供了更宽的路。

### Linux 怎么看 PCIe 链路速率

```bash
lspci -s 9b:00.0 -vvv | grep LnkSta
```

示例：

```bash
LnkSta: Speed 16GT/s (ok), Width x16 (ok)
LnkSta2: Current De-emphasis Level: -6dB, EqualizationComplete+ EqualizationPhase1+
```

这里的 `Width` 和 `Speed` 很关键，很多性能预期其实就是被这些参数悄悄限制住了。

## 上层协议：最后看“主机怎么跟盘说话”

### AHCI

`AHCI` 是面向 SATA 时代的主机控制器接口标准。它的优势包括：

- 兼容性好
- 支持 NCQ
- 支持热插拔

对机械盘时代来说，它已经很优秀了。  
但到了 SSD 尤其是高性能 SSD 时代，它开始显得有点跟不上节奏。

### NVMe

`NVMe` 是专门为闪存和非易失性存储设计的协议。它的核心优势：

- 延迟更低
- 并发能力更强
- 队列数远高于 AHCI
- 能更充分利用 PCIe 带宽

简单说：

- `AHCI` 更像旧时代高速路
- `NVMe` 则是给现代 SSD 单独修了一条更宽更顺的专线

## NVMe-oF：把 NVMe 延伸到网络

当本地 NVMe 性能越来越高，大家自然会问：

“那能不能把这种低延迟高吞吐能力，跨网络也带出去？”

于是有了 `NVMe-oF`（NVMe over Fabrics）。

常见实现方向包括：

- `NVMe over RDMA`
- `FC-NVMe`

它的价值在于：  
把计算和存储分离之后，仍然尽量保留接近本地 NVMe 的访问体验。

## 结语

记住这三个层次，很多存储问题就容易想明白了：

- **接口**：设备怎么插
- **通道**：数据怎么传
- **协议**：主机怎么跟设备对话

真正决定性能和兼容性的，往往不是某一个单独名词，而是它们三层组合起来的结果。




## 参考资料

- [NVMe 官方规范概览](https://nvmexpress.org/specifications/)
- [PCI Express 技术资源](https://pcisig.com/specifications)
- [SATA-IO 官方站点](https://sata-io.org/)
