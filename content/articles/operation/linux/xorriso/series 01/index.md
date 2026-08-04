---
title: "30 分钟定制 Ubuntu 安装镜像：从 squashfs 解压到 xorriso 构建可引导 ISO 的全流程"
slug: "custom-ubuntu-iso-with-xorriso"
date: 2026-05-27T16:15:48+08:00
author:
  - Y'Jie
categories:
  - 运维
  - Linux
tags:
  - Ubuntu
  - ISO
  - 镜像构建
  - squashfs
  - xorriso
series:
  - Linux 运维
weight: 1
description: "详解 Ubuntu Server ISO 镜像的完整定制流程，包括 `squashfs` 解压、`chroot` 环境配置、驱动集成、GRUB/EFI 引导构建与签名验证，适合需要制作定制安装镜像和批量部署介质的场景。"
summary: "详解 Ubuntu Server ISO 镜像的完整定制流程，包括 `squashfs` 解压、`chroot` 环境配置、驱动集成、GRUB/EFI 引导构建与签名验证，适合需要制作定制安装镜像和批量部署介质的场景。"
keywords:
  - Ubuntu ISO 定制
  - squashfs 解包打包
  - chroot 环境
  - Mellanox 驱动
  - xorriso 镜像构建
  - EFI/MBR 引导
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
usageNoticeText: "请确认系统镜像、预装软件和分发方式符合对应许可证、订阅条款与再分发限制。"
---

---

## 为什么要自定义 ISO

在生产环境中，标准化的 Ubuntu 官方镜像往往无法满足特定需求：

- **驱动预装**：特定硬件（如 Mellanox 网卡）需要提前集成驱动
- **内核锁定**：防止自动更新导致驱动兼容性问题
- **软件预置**：常用工具、配置、安全策略统一部署
- **自动化安装**：配合 kickstart/preseed 实现无人值守

> The Linux Virtual Server is a highly scalable and highly available server built on a cluster of real servers, with the load balancer running on the Linux operating system.

---

## 镜像架构与原理

### ISO 分区结构

```bash
LBA: 0                           64                6345803        6345804           6355875        6355876         6356475
     |---------------------------|-----------------|----------------|-----------------|----------------|-----------------|
     System Area / MBR / GPT      Primary FS       EFI System      ???              BIOS GRUB img   End
     Protective MBR & GPT hybrid  (ISO 9660/FAT)  (hidden ESP)    (reserved?)       (BIOS boot)     
```

| 分区 | 起始扇区 | 大小 | 作用 |
|------|---------|------|------|
| ISO 9660 主文件系统 | 64 | ~2-3G | 包含 `/casper` Live 系统、`/pool` deb 包、`/boot/grub` 引导配置 |
| EFI System (ESP) | 动态计算 | 4.9M | UEFI 引导分区，含 `bootx64.efi`、`grubx64.efi` |
| BIOS Boot | 末尾 | 300K | Legacy BIOS 引导镜像 (`eltorito.img`) |

### 核心组件说明

| 文件名 | 描述 |
|--------|------|
| `ubuntu-server-minimal.squashfs` | 基础 Ubuntu Server rootfs 镜像（压缩只读文件系统） |
| `ubuntu-server-minimal.squashfs.gpg` | squashfs 文件的 GPG 签名，确保完整性 |
| `ubuntu-server-minimal.manifest` | 系统软件包清单 |
| `ubuntu-server-minimal.size` | 文件系统大小记录 |

> **注意**：squashfs 是一种压缩只读文件系统，用来减少 ISO 体积并在安装时按需解压到目标系统。

---

## 环境准备

### 1. 安装依赖包

```bash
apt update
apt install -y squashfs-tools gnupg xorriso rsync
```

### 2. 创建工作目录

```bash
mkdir -p /opt/live
```

---

## 基础镜像处理

### 1. 挂载并复制官方镜像

```bash
# 挂载官方 ISO
mount -o loop ubuntu-22.04.5-live-server-amd64.iso /mnt

# 复制到工作目录
rsync -av /mnt/ /opt/live/
umount /mnt
```

### 2. 解压 squashfs 根文件系统

```bash
cd /opt/live/casper/
unsquashfs ubuntu-server-minimal.squashfs
```

输出示例：
```
Parallel unsquashfs: Using 32 processors
18582 inodes (19619 blocks) to write
[==================================================================|] 38201/38201 100%
created 16803 files
created 2753 directories
created 1652 symlinks
created 8 devices
```

---

## chroot 环境配置

### 1. 挂载虚拟文件系统

```bash
cd /opt/live/casper/
mount -t proc proc squashfs-root/proc
mount -t sysfs sys squashfs-root/sys
mount -o bind /dev squashfs-root/dev
mount -t devpts devpts squashfs-root/dev/pts
mount -o bind /run squashfs-root/run
```

### 2. 配置 DNS 解析

```bash
rm -rf squashfs-root/etc/resolv.conf
cp /etc/resolv.conf squashfs-root/etc/resolv.conf
```

### 3. 进入 chroot 环境

```bash
chroot squashfs-root
```

> ⚠️ **注意**：chroot 环境中最具欺骗性的地方：`uname -r` 显示的是宿主机的内核版本，而不是 chroot 镜像内部的内核。

---

## 系统定制

### 方案一：预拷贝安装（推荐离线环境）

```bash
# 在 chroot 之前，将 .deb 包拷贝到 squashfs-root 目录
dpkg -i /path/to/package.deb
```

### 方案二：在线安装（需要网络访问）

```bash
# 测试仓库连通性
apt-get update

# 安装软件
apt install htop
```

### 完整示例：Mellanox 网卡驱动集成

```bash
# 步骤 1：安装指定版本内核及相关组件
apt install linux-image-5.15.0-119-generic \
            linux-headers-5.15.0-119-generic \
            linux-modules-5.15.0-119-generic

# 步骤 2：锁定内核版本（防止后续安装驱动时被升级）
apt-mark hold linux-image-5.15.0-119-generic \
              linux-headers-5.15.0-119-generic \
              linux-image-generic \
              linux-headers-generic

# 验证锁定状态
apt-mark showhold

# 步骤 3：安装 Mellanox 驱动（根据实际情况执行）
# dpkg -i /mnt/drivers/mellanox/*.deb

# 步骤 4：更新 initramfs
update-initramfs -u -k all
```

### 清理环境（减小镜像体积）

```bash
apt-get clean
rm -rf /tmp/*
rm -rf /var/log/*
rm -rf ~/.bash_history
```

### 退出 chroot

```bash
# 按顺序卸载挂载点
umount /run /dev/pts /dev /sys /proc

# 退出 chroot
exit
```

---

## squashfs 重新打包

### 1. 删除旧 squashfs 文件

```bash
cd /opt/live/casper/
rm -rf ubuntu-server-minimal.squashfs
```

### 2. 重新打包

```bash
mksquashfs squashfs-root/ ubuntu-server-minimal.squashfs \
  -comp gzip \
  -processors $(nproc)
```

---

## 签名与清单更新

### 1. 生成 GPG 密钥（首次需要）

```bash
gpg --gen-key
```

配置示例：
- Real name: `MairsJie`
- Email address: `it@artoio.com`
- 密码：手动输入 2 次

### 2. 签名 squashfs 文件

```bash
gpg --armor --detach-sign \
  -o ubuntu-server-minimal.squashfs.gpg \
  ubuntu-server-minimal.squashfs
```

### 3. 更新软件包清单

```bash
chroot squashfs-root/ dpkg-query -W > ubuntu-server-minimal.manifest
```

### 4. 更新大小记录

```bash
printf "$(du -sx --block-size=1 squashfs-root | cut -f1)\n" \
  > ubuntu-server-minimal.size
```

### 5. 清理工作目录

```bash
rm -rf squashfs-root
```

---

## ISO 镜像构建

### 获取官方镜像构建参数

```bash
xorriso -indev ubuntu-22.04.5-live-server-amd64.iso \
  -report_el_torito as_mkisofs
```

### 构建方式一：使用官方镜像提取引导文件（推荐）

```bash
cd /opt/live

xorriso -as mkisofs \
  -r -V 'Ubuntu-Server 22.04.5 LTS amd64' \
  -o /root/ubuntu-22.04.5-live-server-oem-amd64.iso \
  --grub2-mbr --interval:local_fs:0s-15s:zero_mbrpt,zero_gpt:'/root/ubuntu-22.04.5-live-server-amd64.iso' \
  --protective-msdos-label \
  -partition_cyl_align off \
  -partition_offset 16 \
  --mbr-force-bootable \
  -append_partition 2 28732ac11ff8d211ba4b00a0c93ec93b --interval:local_fs:4162948d-4173019d::'/root/ubuntu-22.04.5-live-server-amd64.iso' \
  -appended_part_as_gpt \
  -iso_mbr_part_type a2a0d0ebe5b9334487c068b6b72699c7 \
  -c boot.catalog \
  -b boot/grub/i386-pc/eltorito.img \
  -no-emul-boot -boot-load-size 4 -boot-info-table \
  --grub2-boot-info \
  -eltorito-alt-boot \
  -e '--interval:appended_partition_2:all::' \
  -no-emul-boot \
  -boot-load-size 10072 \
  -J -joliet-long \
  /opt/live
```

### 构建方式二：手动指定 MBR 和 EFI 文件

如需手动提取引导文件：

```bash
# 提取 MBR（前 32KB）
dd if=ubuntu-22.04.5-live-server-amd64.iso bs=1 count=32768 of=/tmp/mbr.bin

# 提取 EFI 分区（根据 fdisk -l 获取 skip 和 count）
dd if=ubuntu-22.04.5-live-server-amd64.iso bs=512 skip=4162948 count=10072 of=/tmp/efi.img
```

然后使用 `--grub2-mbr /tmp/mbr.bin` 和 `-append_partition 2 0xef /tmp/efi.img` 参数构建。

---

## 验证

### 1. 镜像引导参数对比

```bash
xorriso -indev ubuntu-22.04.5-live-server-oem-amd64.iso \
  -report_el_torito as_mkisofs
```

对比源镜像和输出镜像的关键参数是否一致：
- Volume id
- grub2-mbr 参数
- partition_offset
- iso_mbr_part_type

### 2. 分区结构验证

```bash
fdisk -l ubuntu-22.04.5-live-server-oem-amd64.iso
```

检查输出是否与官方镜像的分区结构一致（分区偏移不必完全一致，但扇区大小、类型应对应）。

---

## 最佳实践

### 版本控制建议

| 场景 | 建议 |
|------|------|
| 内核版本 | 记录使用的内核版本，与驱动兼容性绑定 |
| 软件清单 | 保留 `.manifest` 文件，便于审计 |
| 构建脚本 | 将上述命令整理为可重复执行的脚本 |
| 版本命名 | ISO 文件名包含构建日期和版本号，如 `ubuntu-22.04.5-oem-20260312-amd64.iso` |

### 镜像优化技巧

1. **精简软件包**：`apt-get clean` + 删除 `/var/cache/apt/archives`
2. **日志清理**：`rm -rf /var/log/*` 但保留目录结构
3. **禁用不必要的服务**：在 chroot 中使用 `systemctl disable`

### 安全注意事项

- GPG 密钥妥善保管，私钥用于签名、公钥分发给客户端验证
- chroot 环境中 `resolv.conf` 指向宿主机 DNS，注意内网安全
- 敏感配置文件（如 preseed）不要硬编码密码

---

## 常见问题

| 问题现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| ISO 无法引导 | xorriso 参数错误 | 使用 `-report_el_torito` 对比官方镜像参数 |
| chroot 中无法解析域名 | resolv.conf 缺失 | 正确挂载宿主机的 `/etc/resolv.conf` |
| 驱动加载失败 | 内核版本不匹配 | 锁定内核版本，确保驱动与内核版本一致 |
| squashfs 签名验证失败 | 未重新签名或密钥错误 | 执行 `gpg --detach-sign` 重新签名 |
| 镜像体积过大 | 未清理缓存 | 执行 `apt-get clean` 并删除 `/tmp/*` |
| 安装程序报错 filesystem.squashfs 不存在 | 文件名不匹配 | 检查 `casper` 目录下的 squashfs 文件名是否为预期值 |

---

## 总结

Ubuntu ISO 自定义构建是运维自动化的重要环节，核心流程可归纳为：

1. **标准提取**：挂载官方 ISO，复制到工作目录
2. **根系统定制**：解压 squashfs → chroot 环境 → 安装驱动/软件 → 清理 → 重新打包
3. **元数据更新**：签名、清单、大小记录同步更新
4. **镜像构建**：使用 xorriso 基于官方参数构建可引导 ISO
5. **严格验证**：对比分区结构和引导参数，确保与官方镜像一致

> **关键原则**：引导扇区和 EFI 分区尽量直接引用官方镜像，避免手动提取带来的参数偏差；所有内核和驱动版本必须锁定，防止后续兼容性问题。



## 参考资料

- [xorriso 官方文档](https://www.gnu.org/software/xorriso/)
- [squashfs-tools 项目页](https://github.com/plougher/squashfs-tools)
- [Ubuntu LiveCD Customization](https://help.ubuntu.com/community/LiveCDCustomization)
