---
title: "宝德 S2600WF 配置 MegaRAID：没有图形页时该从 BIOS 哪里进"
slug: "powerleader-s2600wf-megaraid-bios"
date: 2026-06-01T11:55:00+08:00
author:
  - Y'Jie
categories:
  - 运维
  - 硬件
tags:
  - 宝德
  - MegaRAID
  - BIOS
  - RAID
series:
  - 宝德服务器
weight: 1
description: "记录宝德 S2600WF 服务器在 BMC 没有图形化 RAID 配置页时，如何通过 BIOS 进入 AVAGO MegaRAID 配置界面，适合服务器上架初始化和本地 RAID 配置场景。"
summary: "记录宝德 S2600WF 服务器在 BMC 没有图形化 RAID 配置页时，如何通过 BIOS 进入 AVAGO MegaRAID 配置界面，适合服务器上架初始化和本地 RAID 配置场景。"
keywords:
  - 宝德 S2600WF RAID
  - MegaRAID BIOS 配置
  - AVAGO MegaRAID
cover:
  image: "https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_raid.png"
  alt: "宝德 S2600WF BIOS RAID"
  caption: "通过 BIOS 进入 MegaRAID 配置"
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

## 问题背景

这个场景通常有几个明显特征：

- BMC 没有提供图形化 RAID 配置页面
- 不能指望在 Web 管理里顺手点完
- 需要从 BIOS 进入 RAID 配置项

这类情况并不代表机器无法配置 RAID，通常只是配置入口位于 BIOS 的较深层级。

## 进入方式

### 第一步：开机按 `F2`

注意这里不是常见的 `Ctrl + R`，而是：

- 开机
- 按 `F2`
- 进入 BIOS

## BIOS 路径

### 1. BIOS 首页

![宝德 BIOS RAID 页面](https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_raid.png)

### 2. 进入 `Advanced`

在 `Advanced` 页面中，先确认：

- `Mass Storage Controller Configuration`

这里可以配置磁盘模式为：

- `AHCI`
- `RAID`

![Mass Storage Controller Configuration](https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_advanced_202407301608841.png)

### 3. 进入 `PCI Configuration`

然后继续进入：

- `PCI Configuration`

### 4. 进入 `UEFI Option ROM Control`

![UEFI Option ROM Control](https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_pci_config_202407301612637.png)

### 5. 滑到最底部，选择 `AVAGO MegaRAID`

![AVAGO MegaRAID 入口](https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_avago_megariad_202407301612350.png)

### 6. 根据需求配置 RAID

进入后就可以按需求创建阵列。

![AVAGO MegaRAID 主界面](https://images.sysio.cn/gh/sysiocn/images/powerleader_bios_avago_megaraid_main_202407301614735.png)

## 结语

这篇文章的重点不在 RAID 原理，而在于定位配置入口：  
在宝德 `S2600WF` 上，如果 BMC 页面没有提供入口，可以继续到 BIOS 更深层级查找 RAID 配置项。




## 参考资料

- [Intel SASRAID 参考文档](https://www.intel.com/content/www/us/en/support/articles/000005877/server-products/sasraid.html)
- [Broadcom / AVAGO MegaRAID 产品页](https://www.broadcom.com/products/storage/raid-controllers)
