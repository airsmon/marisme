---
title: "macOS 工具配置（二）：iTerm2 的 Nord 配色、字体与常用设置"
slug: "macos-iterm2-nord-configuration"
date: 2026-08-04T11:10:00+08:00
author:
  - Y'Jie
categories:
  - 工具
  - macOS
tags:
  - iTerm2
  - Nord
  - macOS
  - 终端
  - Homebrew
  - JetBrains Mono
  - Shell Integration
series:
  - macOS 工具配置
weight: 2
description: "在 macOS 上安装并配置 iTerm2，导入官方 Nord 配色，设置 Nerd Font、Profile、窗口、标签页、终端兼容选项和 Shell Integration。"
summary: "在 macOS 上安装并配置 iTerm2，导入官方 Nord 配色，设置 Nerd Font、Profile、窗口、标签页、终端兼容选项和 Shell Integration。"
keywords:
  - macOS iTerm2 配置
  - iTerm2 Nord 主题
  - iTerm2 字体与分屏
  - iTerm2 Shell Integration
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
usageNoticeText: "执行配置前请保留现有 Profile 或导出设置；远程主机和共享设备上的 Shell Integration、历史记录持久化应按实际安全要求启用。"
---

iTerm2 的选项很多，但真正影响日常体验的只有几组：配色、字体、Profile、窗口与标签页、终端兼容性，以及可选的 Shell Integration。

本文以 macOS 和 iTerm2 `3.6.11` 为验证环境。后续版本的按钮名称或位置可能略有变化，但 Profile 的配置思路不依赖某个小版本。

开源仓库：

{{< github repo="gnachman/iTerm2" />}}

{{< github repo="nordtheme/iterm2" />}}

## 安装 iTerm2 与字体

使用 Homebrew 安装 iTerm2：

```bash
brew install --cask iterm2
```

如果命令行提示符、Vim 状态栏或其他工具会显示 Powerline、Nerd Font 图标，再安装 JetBrains Mono 的 Nerd Font 版本：

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

JetBrains Mono 本身针对代码阅读设计，并提供连字；Nerd Font 版本则额外补充了终端提示符常用的图标字形。若不使用这些图标，直接保留 macOS 自带的等宽字体也可以，没必要为了主题额外增加字体依赖。

安装后启动 iTerm2，可从 `iTerm2 > About iTerm2` 查看当前版本。

## 创建独立的 Nord Profile

不要直接在唯一的默认 Profile 上反复试配置。先打开 `iTerm2 > Settings…`（`⌘,`），进入 `Profiles`：

1. 选中现有的 `Default` Profile。
2. 点击 Profile 列表下方的 `Other Actions…`，选择 `Duplicate Profile`。
3. 在 `Profiles > General > Name` 中将副本命名为 `Nord`。
4. 保持 `Command` 为 `Login Shell`，让 iTerm2 使用系统为当前账号配置的登录 Shell，不要在这里硬编码 `/bin/zsh`。
5. 确认配置正常后，再通过 `Other Actions… > Set as Default` 将 `Nord` 设为默认 Profile。

Profile 是一组可复用的会话设置。以后如果需要为生产环境、测试环境或专用 SSH 会话使用不同的标题和颜色，可以复制 Profile，而不是把所有差异塞进一份配置。

## 导入官方 Nord 配色

Nord 官方提供的是 `.itermcolors` 配色文件。它会设置终端前景色、背景色、光标色和 ANSI 颜色，但不会修改 iTerm2 的菜单界面，也不会替 Shell 或 Vim 安装主题。

从 Nord 官方仓库下载当前配色文件：

```bash
curl -fsSL \
  https://raw.githubusercontent.com/nordtheme/iterm2/develop/src/xml/Nord.itermcolors \
  -o "$HOME/Downloads/Nord.itermcolors"

plutil -lint "$HOME/Downloads/Nord.itermcolors"
```

`plutil` 返回 `OK` 后，在 iTerm2 中执行：

1. 打开 `Settings > Profiles`，选中刚创建的 `Nord`。
2. 进入 `Colors > Color Presets… > Import…`。
3. 选择 `~/Downloads/Nord.itermcolors`。
4. 再次打开 `Color Presets…`，选择 `Nord` 才会把它应用到当前 Profile。

如果启用了 `Use separate colors for light and dark mode`，还要确认 `Editing` 当前指向准备修改的模式。只导入配色但没有在对应模式中选择 `Nord`，是“导入成功、界面却没变化”最常见的原因。

为了保留 Nord 原本的明暗关系，建议先保持背景不透明。透明背景会让桌面内容参与混色，配色仍然是 Nord，但对比度已经不是主题设计时的效果。

## 设置字体与文本渲染

进入 `Settings > Profiles > Text`：

- `Regular font`：选择字体列表中的 `JetBrainsMono Nerd Font`；若同时出现多个变体，终端中优先选择名称带 `Mono` 的等宽变体。字号可从 `13` 或 `14` 开始，再根据显示器调整。
- `Anti-aliased`：保持开启。
- `Use built-in Powerline glyphs`：可以开启。iTerm2 会自行绘制 Powerline 分隔符，通常比字体内置字形更容易对齐；其他 Nerd Font 图标仍由字体提供。
- `Non-ASCII font`：没有明确的中日韩字体需求时不必单独启用，让系统进行字体回退即可。如果启用，应让 Regular 与 Non-ASCII 字体使用相同字号，避免中英文基线和行高明显错位。
- `Ligatures`：建议先关闭。JetBrains Mono 支持代码连字，但 iTerm2 官方说明连字会改用较慢的渲染路径，并停用 GPU renderer。确实喜欢 `=>`、`!=` 等组合字形时再开启。

终端字体首先要保证字符宽度稳定和图标不缺失。字号、行距和连字属于个人偏好，先让表格、Vim 分栏和提示符对齐，再做视觉微调。

## 窗口、标签页与 Profile 标题

### 窗口

进入 `Settings > Profiles > Window`，可从下面这组保守值开始：

- `Style`：`Normal`。
- `Columns / Rows`：例如 `120 × 34`，只决定新窗口的初始大小。
- `Transparency`：`0`。
- `Blur`：关闭。Blur 只有在背景透明时才有意义，较大的模糊半径还会带来额外的渲染开销。
- `Screen`：多显示器环境可选 `Screen with Cursor`，让新窗口出现在鼠标所在屏幕。

如果更看重氛围感，可少量增加透明度并开启低强度 Blur；如果主要在终端里阅读日志、写 Vim 或长时间使用 SSH，保持不透明通常更清楚。

### 标签页与分栏

在 `Settings > Appearance > Tabs` 中建议开启：

- `Show tab numbers`：标签页会显示对应的 `⌘数字` 快捷键。
- `Show new-output indicator`：后台标签页收到新输出时会有提示。

在 `Settings > Appearance > Panes` 中可开启 `Show per-pane title bar with split panes`；服务器较多时更容易确认当前分栏。`Settings > Appearance > Dimming > Dim inactive split panes` 也能突出当前输入位置，但不宜把暗化程度调得过高，否则会破坏 Nord 的可读性。

回到 `Profiles > General > Title`，可组合 `Profile & Session Name`、`Host` 和 `PWD`。本地单窗口可以简单一些；同时连接多台服务器时，保留 Host 与当前目录更有价值。远程会话中的 Host 和 PWD 要在远端启用 Shell Integration 后才能持续准确更新。

## Terminal 兼容性设置

进入 `Settings > Profiles > Terminal`：

- `Character encoding`：选择 `Unicode (UTF-8)`。
- `Report terminal type`：选择 `xterm-256color`，兼顾 ANSI 256 色与常见远程系统的兼容性。
- `Scrollback lines`：可设为 `50000`，不建议为了省事开启 `Unlimited scrollback`；官方文档明确提醒，无限回滚可能持续占用内存。
- `Save lines to scrollback in alternate screen mode`：使用 Vim 时建议保持关闭，避免交互式全屏程序的内容混入普通回滚记录。
- `Enable mouse reporting`：保持开启；终端程序接管鼠标时，可按住 `Option` 临时绕过鼠标上报。

不要在 `.zshrc` 中无条件写死 `TERM=xterm-256color`。`TERM` 应由当前终端模拟器设置；在 SSH、tmux 或其他终端中强行覆盖它，反而可能让应用误判能力。

## 常用窗口与分屏快捷键

iTerm2 的窗口、标签页和 pane 是三个层级：一个窗口可以有多个标签页，一个标签页又可以拆成多个 pane。

| 操作 | 默认快捷键 |
| --- | --- |
| 新建窗口 | `⌘N` |
| 新建标签页 | `⌘T` |
| 关闭当前 pane、标签页或窗口 | `⌘W` |
| 垂直分屏 | `⌘D` |
| 水平分屏 | `⌘⇧D` |
| 按方向切换 pane | `⌘⌥方向键` |
| 按使用顺序切换 pane | `⌘[` / `⌘]` |
| 最大化或还原当前 pane | `⌘⇧Enter` |
| 切换到第 N 个标签页 | `⌘数字` |
| 切换到第 N 个窗口 | `⌘⌥数字` |
| 前后切换标签页 | `⌘←` / `⌘→` |

这里的 `⌘D` 与 Vim 中的 `Ctrl-D` 不是同一个按键：前者由 iTerm2 拆分 pane，后者仍会发送给终端内的程序。

一套固定布局可以通过 `Window > Arrangements > Save Window Arrangement` 保存，再从同一菜单恢复。只偶尔开两三个会话时，标签页和分屏已经足够，不必一开始就引入复杂的窗口布局。

## Shell Integration：按需开启

Shell Integration 能让 iTerm2 识别提示符、命令边界、退出状态、当前目录、主机名和命令历史。它会带来命令 mark、最近目录、命令历史以及长命令完成提醒等能力，但不是 Nord 配色或分屏的前置条件。

iTerm2 `3.5` 及之后版本可在 `Settings > Profiles > General > Command` 中开启 `Load shell integration automatically`。对本机 `zsh`、`bash` 或 `fish`，这是最省事的方式，也不会要求手工改写 dotfiles。

另一个入口是 `iTerm2 > Install Shell Integration`。安装向导可以修改 Shell 启动文件，并询问是否安装 `imgcat` 等 Utilities。如果 `.zshrc` 由 Git、chezmoi 或其他工具管理，建议在“自动加载”和“手工加载”中只选一种，避免重复 source。

需要完全掌控文件内容时，zsh 可按官方方式手工安装：

```bash
curl -fsSL https://iterm2.com/shell_integration/zsh \
  -o "$HOME/.iterm2_shell_integration.zsh"
```

然后在 `~/.zshrc` 的末尾加载：

```zsh
source "$HOME/.iterm2_shell_integration.zsh"
```

还有几个取舍需要提前知道：

- 普通 `ssh` 连接不会自动让远端 Shell 获得完整集成功能；如需准确的远端 Host、PWD 和 mark，应在远端按需安装。不要为了这项功能批量修改生产主机或 root 的启动文件。
- 常规 tmux 或 screen 会限制 Shell Integration；iTerm2 的 `tmux -CC` 集成是另一种工作方式，不应把两者混为一谈。
- `Settings > General > Magic > Save copy/paste and command history to disk` 会把复制粘贴记录，以及 Shell Integration 获得的命令、目录和远程主机信息持久化。个人设备上可以按需开启，共享或敏感环境建议关闭。

## 验证配置

### 检查 Nord 的 16 个基础色

新建一个使用 `Nord` Profile 的标签页，执行：

```zsh
for color in {0..15}; do
  printf '\e[48;5;%sm  %2s  \e[0m' "$color" "$color"
  (( (color + 1) % 8 == 0 )) && printf '\n'
done
```

应该显示两行色块。重点不是记住每个色值，而是确认 `0–15` 都有输出、前后景清楚，并且新标签页与当前 Profile 的颜色一致。

### 检查编码、终端类型与字体

```bash
printf 'TERM=%s\nCOLORTERM=%s\n' "$TERM" "$COLORTERM"
printf '中文  箭头→  对勾✓  Powerline  Git\n'
```

预期 `TERM` 为 `xterm-256color`；如果 `COLORTERM` 为 `truecolor` 或 `24bit`，本系列第一篇的 Vim 配置会启用真彩色，否则会安全回退到 Nord 的终端色板。中文不应重叠，箭头和对勾应完整，最后两个图标不应显示成空框。如果只有图标缺失，先检查 `Profiles > Text > Regular font` 是否选中了 Nerd Font，而不是继续修改 Nord 配色。

### 检查分屏与 Shell Integration

1. 按 `⌘D` 和 `⌘⇧D`，确认能创建两个方向的 pane。
2. 用 `⌘⌥方向键` 切换焦点，再用 `⌘⇧Enter` 最大化并还原当前 pane。
3. 开启 Shell Integration 后执行 `false`。新的提示符旁应出现失败状态的 mark；可右键 mark 查看退出状态。
4. 使用 `⌘⇧↑` 和 `⌘⇧↓` 在提示符 mark 之间移动，或打开 `Session > Open Command History…` 检查命令历史。

## 常见问题

### Nord 已导入，但颜色没有变化

导入只会把配色加入预设列表，还要在当前 Profile 的 `Colors > Color Presets…` 中再次选择 `Nord`。如果使用独立的明暗模式配色，还要检查正在编辑的是 Light 还是 Dark。

### 新标签页又回到旧配色

当前会话可能临时应用了 Nord，但默认 Profile 仍是旧配置。确认新标签页使用 `Nord`，并在验证完成后将它设为默认 Profile。

### 图标变成方框，中文或表格错位

先确认字体已安装，再重新打开 iTerm2 的字体选择器并新建标签页。Regular 与 Non-ASCII 字体如果分别设置，应使用相同字号；Nerd Font 图标通常要由 Regular font 提供。

### Vim 或 SSH 中的颜色和预期不同

先执行 `printf '%s\n' "$TERM"`，确认没有被 Shell 配置覆盖。Nord 的 iTerm2 文件只定义终端色板；Vim 仍需自己的 colorscheme。远端主机若不认识当前终端类型，也要先处理对应的 terminfo，而不是继续调 iTerm2 色值。

### 开启 Shell Integration 后没有 mark

确认 Profile 使用受支持的 Shell，并检查是否同时启用了自动加载和 `.zshrc` 手工 source。自定义提示符会重写集成所需的 prompt 钩子时，应按 iTerm2 官方文档为该提示符单独配置，而不是重复加载脚本。

## 结语

一套稳定的 iTerm2 配置不需要堆很多插件：用独立 Profile 承载设置，导入官方 Nord 配色，选一款字符完整的等宽字体，保持 UTF-8 与 `xterm-256color`，再熟悉标签页和分屏快捷键，就已经足够应付本地开发与大多数远程运维场景。

Shell Integration 很实用，但它涉及 Shell 启动文件和历史记录。把它当成可选增强，并根据设备和远端环境决定是否启用，会比默认在所有机器上安装更稳妥。

## 参考资料

- [iTerm2 官方下载](https://iterm2.com/downloads.html)
- [Homebrew：iTerm2 Cask](https://formulae.brew.sh/cask/iterm2)
- [iTerm2：Profiles General](https://iterm2.com/documentation-preferences-profiles-general.html)
- [iTerm2：Colors 设置](https://iterm2.com/documentation-preferences-profiles-colors.html)
- [iTerm2：Text 与字体设置](https://iterm2.com/documentation-preferences-profiles-text.html)
- [iTerm2：Window 设置](https://iterm2.com/documentation-preferences-profiles-window.html)
- [iTerm2：Terminal 设置](https://iterm2.com/documentation-preferences-profiles-terminal.html)
- [iTerm2：快捷键与基本用法](https://iterm2.com/documentation-general-usage.html)
- [iTerm2：Shell Integration](https://iterm2.com/documentation-shell-integration.html)
- [Nord iTerm2 官方仓库](https://github.com/nordtheme/iterm2)
- [JetBrains Mono 官方页面](https://www.jetbrains.com/lp/mono/)
- [Homebrew：JetBrains Mono Nerd Font Cask](https://formulae.brew.sh/cask/font-jetbrains-mono-nerd-font)
