---
title: "macOS 工具配置（三）：SecureCRT 的 Nord 配色与 SSH 会话管理"
slug: "macos-securecrt-nord-configuration"
date: 2026-08-04T11:20:00+08:00
author:
  - Y'Jie
categories:
  - 工具
  - macOS
tags:
  - SecureCRT
  - Nord
  - macOS
  - SSH
  - 终端
series:
  - macOS 工具配置
weight: 3
description: "在 macOS 上安装和配置 SecureCRT，基于 Nord 官方 16 色手工建立配色与 ANSI 调色板，并统一默认会话、终端、字体、SSH 安全和会话管理设置。"
summary: "在 macOS 上安装和配置 SecureCRT，基于 Nord 官方 16 色手工建立配色与 ANSI 调色板，并统一默认会话、终端、字体、SSH 安全和会话管理设置。"
keywords:
  - macOS SecureCRT 配置
  - SecureCRT Nord 配色
  - SecureCRT SSH 公钥
  - SecureCRT 会话管理
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
usageNoticeText: "首次连接前应通过可信渠道核对 SSH 主机密钥指纹；私钥必须妥善保管，不要在文章、截图、仓库或会话导出文件中泄露密码和敏感配置。"
---

SecureCRT 的价值不只是“多一个 SSH 客户端”。它能把主机地址、认证方式、终端行为、日志和显示设置保存为会话，再用文件夹管理大量设备。配置完成后，日常操作基本就是在 Session Manager 中找到主机并连接。

本文以 macOS 上的 SecureCRT 9.6.3 为操作背景。SecureCRT 9.x 的设置结构基本一致，但不同小版本的菜单文字可能略有差异。

> Nord 官方端口列表中没有 SecureCRT。本文的 SecureCRT 配色不是 Nord 官方端口，而是依据 [Nord 官方 16 色](https://www.nordtheme.com/docs/colors-and-palettes/)以及官方 [Nord iTerm2](https://github.com/nordtheme/iterm2) 终端映射制作的自定义方案。

## 安装 SecureCRT

先确认 Mac 的处理器架构：

```bash
uname -m
```

- 输出 `arm64`：下载 Apple Silicon / ARM64 版本。
- 输出 `x86_64`：下载 Intel / x64 版本。

从 VanDyke 下载与许可证类型、处理器架构匹配的 DMG，打开后把 `SecureCRT.app` 拖入 `/Applications`，再从“应用程序”目录启动。不要直接在 DMG 中运行应用。

如果安装的是 SecureCRT 与 SecureFX Bundle，应分别把两个应用拖入“应用程序”，不要同时拖动。VanDyke 的 macOS 安装说明指出，同时拖动可能触发异常的隔离状态。

## 先备份，再调整全局设置

开始前选择：

```text
Tools > Export Settings…
```

把当前配置导出为 XML。后续需要恢复时，使用：

```text
Tools > Import Settings…
```

如果只想迁移配色和普通会话设置，不要勾选包含个人配置数据的选项。导出文件可能包含用户名、密码或自动登录信息，不应上传到公开仓库。

## SecureCRT 中的颜色分为两层

SecureCRT 的颜色设置容易混淆，因为它同时使用两套配置：

1. **Color Scheme**：决定普通、粗体、下划线等文本属性的前景色和背景色。
2. **ANSI Color Palette**：决定远端程序发出 ANSI 转义序列时使用的 16 个终端颜色。

颜色方案是全局定义、按会话应用的。也就是说，编辑一个已被多个会话使用的方案，会同时影响这些会话。需要修改时，最好新建名为 `Nord Custom` 的方案，不要直接覆盖内置方案。

### 为什么不直接导入一个 Nord 文件

Nord 官方提供 iTerm2、Terminal.app 等端口，但没有 SecureCRT 端口；SecureCRT 官方文档也没有提供直接导入 `.itermcolors` 的操作路径。

VanDyke 的示例脚本 `ImportAdditionalColorSchemesIntoGlobalConfig.py` 虽然包含一个名为 `Nord` 的方案，但其中的背景色、前景色和 ANSI 色值并不等于 Nord 官方 16 色。例如该脚本的 `Nord` 背景色为 `#353535`，而 Nord 官方深色背景 `nord0` 是 `#2E3440`。如果目标是让 Vim、iTerm2 和 SecureCRT 保持一致，就不应把这个同名方案当作 Nord 官方端口。

本文采用手工创建。完成后，可以通过 SecureCRT 自身的 XML 导出与导入功能迁移到其他 Mac。

## Nord 官方 16 色

macOS 的颜色面板可以输入十六进制色值；如果当前面板只显示 RGB，也可以使用表中的十进制数值。

| 名称 | Hex | RGB | 用途 |
| --- | --- | --- | --- |
| `nord0` | `#2E3440` | `46, 52, 64` | 主背景 |
| `nord1` | `#3B4252` | `59, 66, 82` | 黑色、浮层背景 |
| `nord2` | `#434C5E` | `67, 76, 94` | 选区、活动区域 |
| `nord3` | `#4C566A` | `76, 86, 106` | 亮黑、注释 |
| `nord4` | `#D8DEE9` | `216, 222, 233` | 主前景、光标 |
| `nord5` | `#E5E9F0` | `229, 233, 240` | 白色 |
| `nord6` | `#ECEFF4` | `236, 239, 244` | 亮白、强调文本 |
| `nord7` | `#8FBCBB` | `143, 188, 187` | 亮青 |
| `nord8` | `#88C0D0` | `136, 192, 208` | 青色、主强调色 |
| `nord9` | `#81A1C1` | `129, 161, 193` | 蓝色 |
| `nord10` | `#5E81AC` | `94, 129, 172` | 深蓝 |
| `nord11` | `#BF616A` | `191, 97, 106` | 红色、错误 |
| `nord12` | `#D08770` | `208, 135, 112` | 橙色 |
| `nord13` | `#EBCB8B` | `235, 203, 139` | 黄色、警告 |
| `nord14` | `#A3BE8C` | `163, 190, 140` | 绿色、成功 |
| `nord15` | `#B48EAD` | `180, 142, 173` | 洋红、数字 |

## 创建 Nord ANSI 调色板

打开：

```text
Options > Global Options… > Terminal > Appearance > ANSI Color
```

在 **Palette name** 区域新建调色板，命名为 `Nord Custom`。然后按界面从左到右的顺序设置 Normal colors 和 Bold colors：

| ANSI | Normal | Bold / Bright |
| --- | --- | --- |
| Black | `#3B4252`（`nord1`） | `#4C566A`（`nord3`） |
| Red | `#BF616A`（`nord11`） | `#BF616A`（`nord11`） |
| Green | `#A3BE8C`（`nord14`） | `#A3BE8C`（`nord14`） |
| Yellow | `#EBCB8B`（`nord13`） | `#EBCB8B`（`nord13`） |
| Blue | `#81A1C1`（`nord9`） | `#81A1C1`（`nord9`） |
| Magenta | `#B48EAD`（`nord15`） | `#B48EAD`（`nord15`） |
| Cyan | `#88C0D0`（`nord8`） | `#8FBCBB`（`nord7`） |
| White | `#E5E9F0`（`nord5`） | `#ECEFF4`（`nord6`） |

这里没有把 Normal 和 Bold 简单设置成同一行颜色：亮黑、亮青和亮白使用了 Nord 官方终端端口中的独立亮色映射。

## 创建 Nord Color Scheme

继续打开：

```text
Options > Global Options… > Terminal > Appearance > Advanced
```

部分版本把这个页面显示为 **Color Schemes**。在 **Color schemes** 区域点击 **New…**，命名为 `Nord Custom`，然后设置：

| 属性 | 前景色 | 背景色 |
| --- | --- | --- |
| Normal | `#D8DEE9`（`nord4`） | `#2E3440`（`nord0`） |
| Bold | `#ECEFF4`（`nord6`） | `#2E3440`（`nord0`） |
| Underline | `#D8DEE9`（`nord4`） | `#2E3440`（`nord0`） |
| Bold Underline | `#ECEFF4`（`nord6`） | `#2E3440`（`nord0`） |

在同一对话框中，把 **ANSI color palette** 选择为刚才创建的 `Nord Custom`。建议启用 **Show underline**，关闭 **Enable blink**；其余 Blink 属性即使保留相同前景和背景，也不会参与正常显示。

点击 **OK** 保存。此处只是创建全局方案，还没有决定哪些会话使用它。

## 配置 Default Session

Default Session 是新建会话、Quick Connect 和没有指定会话参数时使用的模板。macOS 9.6.3 可从这里打开：

```text
Options > Edit Default Session…
```

如果当前版本采用合并后的菜单，则路径可能显示为：

```text
Options > Configure > Default Session…
```

### 外观、字体与编码

进入：

```text
Session Options - Default > Terminal > Appearance
```

建议设置：

- **Current color scheme**：`Nord Custom`
- **Normal font**：选择已安装的等宽字体，例如 `Menlo 13`
- **Character encoding**：`UTF-8`
- **Use Unicode graphics characters**：开启
- **Draw lines graphically**：开启；macOS 上可改善框线连接
- **Cursor style**：Block
- **Use color**：开启，颜色设为 `#D8DEE9`
- **Blinking**：关闭

字体和字号属于个人偏好，不是 Nord 规范的一部分。关键是使用等宽字体，并让远端与 SecureCRT 的字符编码保持一致。

### Xterm 与 ANSI 颜色

进入：

```text
Session Options - Default > Terminal > Emulation
```

建议设置：

- **Terminal**：`Xterm`
- **Color Mode**：`ANSI with 256color`
- **Use color scheme**：开启
- **On resize**：`Synchronize view to size`
- **Scrollback buffer**：例如 `50000`

`ANSI with 256color` 会向远端报告 `xterm-256color`，适合 Vim、tmux、htop 等常见终端程序。如果确实运行需要 24 位颜色的程序，可以改为 **True Color**；VanDyke 的说明同时指出，不需要 True Color 时不应开启，因为它会使用更多内存。

不要在 `Terminal > Emulation > Advanced` 中强制填写另一个 **Terminal type**，除非某台旧设备确实需要覆盖自动上报的终端类型。

### macOS 上让 Vim 长按按键连续移动

macOS 可能把长按字母键解释为显示重音符号菜单。完全退出 SecureCRT 后执行：

```bash
defaults write com.vandyke.SecureCRT ApplePressAndHoldEnabled -bool False
```

重新启动 SecureCRT 后，长按 `h`、`j`、`k`、`l` 等按键会恢复连续输入。需要恢复重音符号菜单时，把最后的 `False` 改为 `True`。

### 保存 Default Session

点击 **OK** 后会出现 **Apply default session changes**：

- **Change the Default session only**：只影响以后新建的会话。
- **Change ALL sessions (no undo)**：把本次改动同步到全部现有会话，且没有撤销功能。

第一次配置建议先选择前者，确认显示和连接正常后，再决定是否批量修改现有会话。

## 新建一个安全的 SSH2 会话

从 Session Manager 点击 **New Session**，或者使用：

```text
File > Quick Connect…
```

协议选择 `SSH2`，填写主机、端口和用户名。标准 SSH 端口是 22，但应以服务器实际配置为准。

### 优先使用公钥认证

如果还没有密钥，可以通过：

```text
Tools > Create Public Key…
```

在服务器兼容的前提下可选择 Ed25519，并为私钥设置足够强的 passphrase。SecureCRT 也支持 RSA、ECDSA，以及仅供遗留兼容的 DSA；新建密钥不应选择 DSA，也不要因为自动化方便就把长期使用的私钥保存为无口令文件。

把公钥放到服务器对应账户的 `authorized_keys` 后，打开会话属性：

```text
Session Options > Connection > SSH2
```

在 **Authentication** 列表中：

1. 把 `PublicKey` 移到最上方。
2. 选中 `PublicKey`，点击 **Properties…**。
3. 选择全局公钥设置，或指定当前会话使用的 identity / certificate file。
4. 只在服务器确实需要时保留 `Keyboard Interactive` 或 `Password` 作为后备。
5. 不使用 Kerberos / GSSAPI 的环境可以取消对应认证和密钥交换方式，避免无意义的连接等待。

密码即使通过 SSH 加密传输，也不应直接写进脚本、按钮或公开导出的会话文件。

### 首次连接必须核对主机指纹

第一次连接服务器时，SecureCRT 会显示 **New Host Key**。不要只因为弹窗出现就点击接受：

1. 通过服务器控制台、资产系统或管理员提供的可信渠道取得主机密钥指纹。
2. 与弹窗中的指纹逐字核对。
3. 一致后选择 **Accept & save**。
4. 不一致或无法确认时选择 **Cancel**，先查清原因。

已保存的主机密钥可以在这里查看和管理：

```text
Options > Global Options… > SSH Host Keys
```

服务器重装或轮换密钥后，应先确认变更，再删除旧记录并重新接受。不要用“删除记录再点接受”的方式绕过未知的主机密钥变化。

### 保留安全算法默认值

加密和完整性设置位于：

```text
Session Options > Connection > SSH2 > Advanced
```

通常保留 SecureCRT 当前版本的默认顺序即可，并注意：

- **Cipher** 绝不能选择 `None`，否则数据会以明文传输。
- **MAC** 绝不能选择 `None`，否则无法保证数据完整性。
- 不要为了连接老旧设备而全局启用已经默认关闭的旧算法；只对确实无法升级的单个会话做最小范围兼容。
- `diffie-hellman` 旧式密钥交换默认关闭有安全原因，优先升级服务器，而不是降低所有会话的安全级别。

### 默认关闭 Agent Forwarding

会话级路径是：

```text
Session Options > Connection > SSH2 > Advanced > Enable OpenSSH agent forwarding
```

默认保持关闭。只有必须通过受信任的跳板机继续连接下一台服务器时才开启，并且只对该跳板会话开启。Agent Forwarding 不会把私钥复制到远端，但拥有远端高权限的攻击者仍可能借用转发的 agent 完成身份冒用。

同样建议在这里保持关闭，除非明确需要：

```text
Session Options > Terminal > Emulation > Advanced > Allow OSC 52 to copy text to local clipboard
```

开启 OSC 52 后，远端程序可以修改本机剪贴板。对不完全信任的主机，这不是一个合适的默认值。

## 管理大量会话

Session Manager 支持嵌套文件夹、筛选、复制和批量修改。可以按环境和用途组织，例如：

```text
Sessions/
├── Production/
│   ├── Web/
│   └── Database/
├── Staging/
└── Network/
```

实用做法：

- 用 **New Folder** 建立层级，不要把环境信息全塞进很长的会话名。
- 右键会话选择 **Properties** 修改单个会话。
- 选中多个会话或整个文件夹后打开 **Properties**，只改需要批量同步的字段；SecureCRT 只会把发生变化的字段应用到所选会话。
- 选中文件夹后连接，可以一次打开其中的多个会话。
- 使用 Session Manager 顶部的过滤框按名称查找；输入带 `/` 的条件可以把匹配文件夹及其内容包含在结果中。
- 需要在另一台 Mac 恢复时，使用 `Tools > Export Settings…` 和 `Tools > Import Settings…`，不要直接复制来源不明的配置片段。

配色、字体和通用终端行为适合放进 Default Session；主机、用户名、密钥和跳板关系应该保留在具体会话中。这样既减少重复配置，也不会让一台特殊设备的兼容设置污染其他连接。

## 验证配置

连接一台 Linux 或 macOS 主机后，先检查终端能力：

```bash
printf 'TERM=%s\n' "$TERM"
tput colors
```

使用 `ANSI with 256color` 时，通常应看到：

```text
TERM=xterm-256color
256
```

检查 16 色：

```bash
for i in {0..15}; do
  if (( i < 8 )); then
    code=$((30 + i))
  else
    code=$((90 + i - 8))
  fi
  printf '\033[%sm %2d \033[0m ' "$code" "$i"
done
printf '\n'
```

如果已把当前会话的 **Color Mode** 临时切换为 **True Color**，可再检查 24 位颜色；保持本文推荐的 `ANSI with 256color` 时跳过这一步：

```bash
printf '\033[48;2;46;52;64m\033[38;2;136;192;208m Nord True Color \033[0m\n'
```

最后确认这些行为：

- 普通前景是浅灰，背景是深蓝灰，而不是纯白配纯黑。
- 红、绿、黄、蓝、洋红、青及其亮色与表格一致。
- `vim`、`tmux` 或 `htop` 能正常显示 ANSI 颜色。
- 中文、框线和符号没有乱码或断线。
- 首次连接的主机指纹经过核对，后续连接不再重复询问。
- 公钥认证成功，且私钥仍由 passphrase 保护。

## 常见问题

### 选了 Nord，但 Vim 的颜色仍然不对

依次检查：

1. `Session Options > Terminal > Appearance` 的 **Current color scheme** 是否为 `Nord Custom`。
2. `Session Options > Terminal > Emulation` 的 **Color Mode** 是否不是 `None`。
3. **Use color scheme** 是否开启。
4. `echo "$TERM"` 是否返回 `xterm-256color`。
5. 修改终端类型后是否已经断开并重新连接。

远端应用可以发送自己的 ANSI 或 True Color 色值，所以“终端基础色是 Nord”并不等于所有 Vim 主题都会自动变成 Nord。Vim 仍需单独启用 Nord 主题。

### 修改一个会话后，其他会话也变色了

你编辑的是全局 Color Scheme 本身，而不是仅切换当前会话使用的方案。新建一个独立方案，再在 `Session Options > Terminal > Appearance` 中为目标会话选择它。

### SSH 连接停顿很久

先从 `File > Trace Options` 查看连接过程。如果日志停在 GSSAPI 或 Kerberos，而当前网络并未使用它们，可在 `Connection > SSH2` 中对相关认证和密钥交换项取消选择。不要以“启用所有算法”的方式碰运气。

### 旧服务器提示没有兼容的密钥交换算法

优先升级 SSH 服务端。VanDyke 明确建议保持旧式 Diffie-Hellman 关闭；只有服务器确实无法升级时，才在该服务器对应的单个会话中临时启用所需算法。

## 结语

一套稳定的 SecureCRT 配置应该把三个层次分开：全局 ANSI 调色板负责颜色映射，Default Session 负责通用终端体验，具体会话负责主机和认证信息。

Nord 在 SecureCRT 中需要手工映射，但只需配置一次。之后再配合 Xterm、UTF-8、公钥认证、主机指纹验证和分层会话目录，就能得到一套在 macOS 上统一、可迁移且相对安全的远程终端环境。

## 参考资料

- [VanDyke：在 macOS 上安装 SecureCRT / SecureFX](https://www.vandyke.com/support/tips/install-securecrt-and-securefx-on-a-macos-machine.html)
- [VanDyke：SecureCRT 颜色配置概览](https://www.vandyke.com/support/tips/colorconfig.html)
- [VanDyke：修改 Default Session](https://www.vandyke.com/support/tips/defaultset.html)
- [VanDyke：备份与恢复 SecureCRT 设置](https://www.vandyke.com/support/tips/backupsessions.html)
- [VanDyke：使用公钥认证](https://www.vandyke.com/support/tips/publickeyauth.html)
- [VanDyke：SSH Agent Forwarding](https://www.vandyke.com/support/tips/agent_forwarding.html)
- [VanDyke：macOS 上启用按键连续重复](https://www.vandyke.com/support/tips/allow-key-repeating-in-securecrt-on-macos.html)
- [VanDyke：SecureCRT 颜色方案脚本示例](https://www.vandyke.com/support/scripting/scripting-examples/color-scheme-scripting.html)
- [Nord：Colors and Palettes](https://www.nordtheme.com/docs/colors-and-palettes/)
- [Nord：官方端口列表](https://www.nordtheme.com/ports/)
- [Nord iTerm2 官方仓库](https://github.com/nordtheme/iterm2)
