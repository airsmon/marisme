---
title: "macOS 工具配置（一）：用 Vim 与 Nord 打造顺手的终端编辑环境"
slug: "macos-vim-nord-configuration"
date: 2026-08-04T11:00:00+08:00
author:
  - Y'Jie
categories:
  - 工具
  - macOS
tags:
  - Vim
  - Nord
  - macOS
  - Homebrew
  - vim-plug
  - 终端
series:
  - macOS 工具配置
weight: 1
description: "在 macOS 上安装新版 Vim，以 vim-plug 管理 Nord 主题，并用一份完整的 vimrc 统一行号、搜索、缩进、剪贴板、持久化撤销、状态栏与常用快捷键。"
summary: "在 macOS 上安装新版 Vim，以 vim-plug 管理 Nord 主题，并用一份完整的 vimrc 统一行号、搜索、缩进、剪贴板、持久化撤销、状态栏与常用快捷键。"
keywords:
  - macOS Vim 配置
  - Vim Nord 主题
  - vim-plug 安装
  - Vim 终端配色
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
usageNoticeText: "撤销文件和 Swap 文件可能保留曾编辑过的内容；处理密钥、令牌等敏感数据时，请保护好 ~/.vim 目录并避免将其同步或上传。"
---

Vim 的默认配置并不难用，只是许多行为更照顾历史兼容性，而不是现代终端里的日常编辑体验。

这篇文章是“macOS 工具配置”系列的第一篇：先把 Vim 的编辑行为整理好，再用 Nord 统一配色。后续配置 iTerm2 和 SecureCRT 时，终端的 ANSI 色板、真彩色能力与 Vim 的显示效果也能接上同一套视觉语言。

本文配置侧重三个目标：

- 在 iTerm2、本机终端和 SecureCRT 远程会话中尽量保持一致
- 不依赖大型编辑器插件，也能获得清晰的行号、状态栏、搜索与缩进体验
- 把撤销文件和 Swap 文件集中到 `~/.vim`，避免污染项目目录

开源仓库：

{{< github repo="vim/vim" />}}

{{< github repo="nordtheme/vim" />}}

## 安装新版 Vim

macOS 自带 `/usr/bin/vim`，但 Vim 官方下载页也明确说明，系统版本通常会落后一段时间，并且编译功能有限。终端版建议通过 Homebrew 安装：

```bash
brew install vim
```

如果还没有 Homebrew，先按 [Homebrew 官方安装说明](https://brew.sh/)完成安装，并执行安装器最后给出的 `shellenv` 命令。Homebrew 在 Apple Silicon 和 Intel Mac 上使用不同前缀，不建议手工猜路径。

安装后重新打开终端，确认当前命中的不是系统自带版本：

```bash
type -a vim
command -v vim
vim --version | head -n 3
```

`command -v vim` 应优先显示 Homebrew 下的 `vim`。如果仍然是 `/usr/bin/vim`，检查 Homebrew 的 `bin` 目录是否排在 `PATH` 前面，然后执行：

```bash
rehash
```

也可以直接查看 Homebrew 安装位置：

```bash
brew --prefix vim
```

## 安装 vim-plug 与 Nord

[Nord Vim 官方文档](https://www.nordtheme.com/docs/ports/vim/installation/)推荐使用 vim-plug 管理主题。先按 [vim-plug 官方说明](https://github.com/junegunn/vim-plug)安装单文件插件管理器：

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

本文使用 Nord 当前的官方仓库地址：

```vim
call plug#begin()
Plug 'nordtheme/vim'
call plug#end()
```

不要再照搬旧文章中的 `arcticicestudio/nord-vim`。项目已经迁移到 `nordtheme/vim`，使用新地址更容易核对来源和后续更新。

写好下一节的 `.vimrc` 后启动 Vim，执行：

```vim
:PlugInstall
```

安装完成后退出并重新进入 Vim。以后更新主题可执行：

```vim
:PlugUpdate
```

## 完整 vimrc

如果已经有自己的配置，先备份再合并，不要直接覆盖：

```bash
cp ~/.vimrc ~/.vimrc.backup
vim ~/.vimrc
```

下面是一份可以直接使用的完整配置。它保留了基础 Vim 的轻量特性，只额外安装 Nord 配色。

```vim
" =============================================================================
" 基础设置
" =============================================================================

set nocompatible
scriptencoding utf-8
set encoding=utf-8

" 启用文件类型识别、插件和语言缩进
filetype plugin indent on
syntax enable

" Leader 键：空格
let mapleader = " "


" =============================================================================
" 插件管理
" =============================================================================

call plug#begin()
Plug 'nordtheme/vim'
call plug#end()


" =============================================================================
" Nord 配色
" =============================================================================

set background=dark

" 只有终端明确声明支持真彩色时才开启。
" iTerm2 可使用真彩色；
" SecureCRT 未声明 COLORTERM 时自动使用终端色板，避免颜色异常。
if has('termguicolors')
    if has('gui_running') || $COLORTERM =~? 'truecolor\|24bit'
        set termguicolors
    else
        set notermguicolors
    endif
endif

" Nord 未安装时不阻止 Vim 启动
silent! colorscheme nord


" =============================================================================
" 界面与显示
" =============================================================================

" 当前行显示绝对行号，其他行显示相对行号
set number
set relativenumber

" 高亮当前行
set cursorline

" 光标距离窗口上下、左右边缘的最小距离
set scrolloff=8
set sidescrolloff=8

" 长行按单词换行
set wrap
set linebreak

if exists('+breakindent')
    set breakindent
endif

" 换行提示符
let &showbreak = '> '

" 显示 Tab、尾随空格、不间断空格
set list
set listchars=tab:»·,trail:·,extends:›,precedes:‹,nbsp:␣

" 始终显示状态栏
set laststatus=2

" 显示当前命令和光标位置
set showcmd
set ruler
set showmode

" 命令行补全菜单
set wildmenu
set wildmode=longest:full,full

" 分屏位置
set splitbelow
set splitright

" 插件诊断标记列始终保留，避免文本左右跳动
if exists('+signcolumn')
    set signcolumn=yes
endif


" =============================================================================
" 搜索与替换
" =============================================================================

" 默认忽略大小写；输入大写字母后自动区分大小写
set ignorecase
set smartcase

" 输入搜索内容时实时定位
set incsearch

" 高亮搜索结果
set hlsearch

" 空格+h 清除搜索高亮
nnoremap <silent> <leader>h :nohlsearch<CR>

" inccommand 是 Neovim 功能。
" 使用兼容判断，标准 Vim 中会自动跳过。
if exists('+inccommand')
    set inccommand=split
endif


" =============================================================================
" 基础编辑行为
" =============================================================================

" Insert 模式下允许退格删除缩进、换行和插入点前内容
set backspace=indent,eol,start

" 使用文件类型缩进，不启用容易干扰语言缩进的 smartindent
set autoindent

" 全局默认：4 个空格
set expandtab
set tabstop=4
set shiftwidth=4
set softtabstop=4

" 使用 < 和 > 调整缩进时对齐到 shiftwidth
set shiftround

" 行首按 Tab 时使用 shiftwidth
set smarttab

" 允许切换到其他缓冲区而不强制保存
set hidden

" 文件在外部被修改后自动读取
set autoread

" 未保存退出时询问，而不是直接报错
set confirm

" 更快触发 CursorHold 和部分插件更新
set updatetime=300

" 映射等待时间
set timeoutlen=500


" =============================================================================
" 不同语言的缩进规则
" =============================================================================

augroup filetype_indent
    autocmd!

    " YAML、JSON、前端、Markdown、Terraform：2 空格
    autocmd FileType yaml,json,jsonc,javascript,javascriptreact,typescript,typescriptreact,html,css,scss,markdown,terraform,hcl
                \ setlocal expandtab tabstop=2 shiftwidth=2 softtabstop=2

    " Python：4 空格
    autocmd FileType python
                \ setlocal expandtab tabstop=4 shiftwidth=4 softtabstop=4

    " Shell：4 空格
    autocmd FileType sh,zsh
                \ setlocal expandtab tabstop=4 shiftwidth=4 softtabstop=4

    " Go：使用真实 Tab，由 gofmt 最终格式化
    autocmd FileType go
                \ setlocal noexpandtab tabstop=4 shiftwidth=4 softtabstop=0

    " Makefile 必须使用真实 Tab
    autocmd FileType make
                \ setlocal noexpandtab tabstop=8 shiftwidth=8 softtabstop=0
augroup END


" =============================================================================
" 禁止自动延续注释
" =============================================================================

" c：注释自动换行时延续注释符
" r：在注释行按 Enter 时延续注释符
" o：使用 o/O 新建行时延续注释符
"
" 必须放在 filetype plugin indent on 后面，避免被 ftplugin 覆盖。
augroup no_auto_comment
    autocmd!
    autocmd FileType *
                \ setlocal formatoptions-=c
                \ formatoptions-=r
                \ formatoptions-=o
augroup END


" =============================================================================
" 粘贴设置
" =============================================================================

" F2 切换 Paste 模式。
" MacBook 可能需要按 Fn+F2。
"
" 粘贴大段代码：
"   F2
"   i
"   Command+V
"   Esc
"   F2
set pastetoggle=<F2>


" =============================================================================
" 鼠标和终端复制
" =============================================================================

" 不让 Vim 接管鼠标。
" iTerm2、SecureCRT 可以直接拖动选择，然后 Command+C 复制。
set mouse=

" 当前 Vim 编译时包含系统剪贴板支持，则让 yank/paste 使用系统剪贴板。
if has('clipboard')
    set clipboard=unnamed
endif


" =============================================================================
" 持久化撤销
" =============================================================================

" 关闭 Vim、重启电脑后仍可使用 u 撤销以前的修改。
if has('persistent_undo')
    let s:undo_dir = expand('~/.vim/undo')

    if !isdirectory(s:undo_dir)
        call mkdir(s:undo_dir, 'p')
    endif

    execute 'set undodir=' . fnameescape(s:undo_dir . '//')
    set undofile
    set undolevels=10000
endif


" =============================================================================
" Swap 文件目录
" =============================================================================

" 避免在项目目录中生成 .filename.swp 文件。
let s:swap_dir = expand('~/.vim/swap')

if !isdirectory(s:swap_dir)
    call mkdir(s:swap_dir, 'p')
endif

execute 'set directory=' . fnameescape(s:swap_dir . '//')


" =============================================================================
" 状态栏
" =============================================================================

set statusline=
set statusline+=\ %f
set statusline+=\ %m
set statusline+=\ %r
set statusline+=%=
set statusline+=\ [%{&filetype}]
set statusline+=\ [%{&fileencoding!=''?&fileencoding:&encoding}]
set statusline+=\ [%{&fileformat}]
set statusline+=\ %l/%L:%c
let &statusline .= ' %p%% '


" =============================================================================
" 常用快捷键
" =============================================================================

" 空格+l：显示/隐藏 Tab 和尾随空格
nnoremap <silent> <leader>l :set list!<CR>

" Visual 模式调整缩进后保持选中
vnoremap < <gv
vnoremap > >gv

" 空格+w：保存
nnoremap <silent> <leader>w :write<CR>

" 空格+q：退出
nnoremap <silent> <leader>q :quit<CR>

" 空格+x：保存并退出
nnoremap <silent> <leader>x :xit<CR>
```

附件原配置中的换行提示写成了：

```vim
set showbreak=>\
```

这会把提示符设置成字面值 `>\`，并不会得到预期的 `> `。完整配置已改用 Vim 帮助中的稳妥写法：

```vim
let &showbreak = '> '
```

这样也不依赖行尾空格，避免被格式化工具自动删掉。

## 关键配置说明

### Vim 模式、编码与 Leader 键

`set nocompatible` 启用 Vim 行为，而不是完全模拟传统 Vi。现代 Vim 找到用户 `vimrc` 时本来就会关闭兼容模式，因此这一行更多是明确表达配置意图，保留也没有问题。

`scriptencoding utf-8` 指定配置文件自身的编码，`set encoding=utf-8` 指定 Vim 内部编码。这里的 `listchars` 包含 `»`、`·`、`›`、`‹` 和 `␣`，所以 UTF-8 很重要。

空格被设置为 Leader 键，后面的组合键可以读成：

- `Space h`：清除搜索高亮
- `Space l`：显示或隐藏不可见字符
- `Space w`：保存
- `Space q`：退出
- `Space x`：保存并退出

### Nord、真彩色与终端色板

`termguicolors` 让 Vim 在终端中使用 24 位 RGB 颜色，但前提是 Vim 和整条终端链路都支持真彩色。配置先检查 Vim 是否提供该选项，再检查 `COLORTERM` 是否声明 `truecolor` 或 `24bit`；条件不满足时保守回退到终端色板。

可以在 Shell 和 Vim 中分别检查：

```bash
printf 'TERM=%s\nCOLORTERM=%s\n' "$TERM" "$COLORTERM"
```

```vim
:echo has('termguicolors')
:set termguicolors?
```

这里有一个容易混淆的点：`$TERM=xterm-256color` 只说明 256 色能力，不等于真彩色。经 SSH、tmux 或 SecureCRT 连接远端时，本地终端、复用器、远端环境变量和远端 Vim 都会影响最终结果。

Nord 官方文档还特别提醒：当 Vim 回退到终端 ANSI 颜色时，终端本身也应使用 Nord 色板，否则同一个颜色编号会显示成另一套颜色。这正是后续为 iTerm2 和 SecureCRT 分别配置 Nord 的原因。

### 行号、长行与不可见字符

`number` 与 `relativenumber` 同时开启后，当前行显示绝对行号，其余行显示相对距离。执行 `5j`、`8k` 一类跳转时，不需要心算目标行号。

`wrap` 只改变屏幕显示，不会向文件插入换行；`linebreak` 尽量在单词边界折行；`breakindent` 让折行后的内容保持视觉缩进。`showbreak` 则给续行加上 `> ` 标记。

`listchars` 用来区分 Tab、尾随空格和不间断空格。默认开启 `list` 是为了尽早看到格式问题，不需要时可按 `Space l` 临时隐藏。

### 搜索行为

`ignorecase` 与 `smartcase` 配合后的规则很实用：

- 搜索 `/nord` 时忽略大小写
- 搜索 `/Nord` 时自动区分大小写

`incsearch` 会在输入模式的过程中定位匹配项，`hlsearch` 保留全部结果高亮。搜索完成后按 `Space h` 清除高亮，不会修改搜索历史。

`inccommand` 是 Neovim 的替换预览选项。使用 `exists('+inccommand')` 包裹后，标准 Vim 会直接跳过，所以同一份配置不会因此报错。

### 缩进与文件类型

全局使用 4 个空格，再通过 `FileType` 自动命令覆盖常见格式：

| 文件类型 | 缩进方式 | 显示宽度 |
| --- | --- | ---: |
| YAML、JSON、前端、Markdown、Terraform | 空格 | 2 |
| Python、Shell | 空格 | 4 |
| Go | 真正的 Tab | 4 |
| Makefile | 真正的 Tab | 8 |

Makefile 的命令行必须以真正的 Tab 开头，因此不能继承全局的 `expandtab`。Go 文件也保留 Tab，并把最终格式交给 `gofmt`。

项目如果已经提供 `.editorconfig` 或专用格式化工具，应以项目规则为准；这份配置只负责个人环境的默认值。

### 为什么关闭注释自动延续

不同语言的 `ftplugin` 经常会向 `formatoptions` 加入 `c`、`r`、`o`：

- `c`：注释自动换行时继续插入注释符
- `r`：在注释中按 Enter 时继续插入注释符
- `o`：在注释行使用 `o` 或 `O` 时继续插入注释符

`no_auto_comment` 自动命令在每次识别文件类型后删除这三个标记，避免新行不断冒出 `//`、`#` 或 `*`。

### 粘贴、鼠标与系统剪贴板

现代终端和 Vim 通常可以通过 bracketed paste 自动识别粘贴内容，`pastetoggle=<F2>` 仍保留为远程或兼容性较差环境下的备用开关。若粘贴后缩进失控，可按下面的顺序操作：

1. 按 F2；MacBook 可能需要按 Fn+F2。
2. 按 `i` 进入 Insert 模式。
3. 使用 Command+V 粘贴。
4. 按 Esc，再按 F2 关闭 Paste 模式。

`set mouse=` 不让 Vim 接管终端鼠标，拖动选择会交给 iTerm2 或 SecureCRT。`clipboard=unnamed` 只在 Vim 编译时包含剪贴板功能时启用；在 macOS 本机运行 Vim 时，它能让常规 yank 与系统剪贴板联动。

这里的“系统剪贴板”属于运行 Vim 的那台机器。通过 SecureCRT 登录服务器后，远端 Vim 无法凭这项设置直接访问 Mac 的剪贴板；此时可以让终端接管鼠标选择，或在理解安全边界后单独配置 OSC 52。

### 持久化撤销与 Swap

`undofile` 把撤销历史写入 `~/.vim/undo`。即使关闭 Vim 或重启电脑，重新打开文件后仍可以使用 `u` 和 `Ctrl+r`。Swap 文件则统一写入 `~/.vim/swap`，项目目录里不会再出现 `.filename.swp`。

目录末尾的 `//` 有特殊含义：Vim 会把原文件的完整路径编码进撤销文件或 Swap 文件名，避免两个同名文件互相覆盖。

这些文件可能残留曾经编辑过的内容。编辑密钥、令牌或其他敏感文件时，要把撤销与 Swap 也视为敏感数据，不要随意同步或打包上传 `~/.vim`。

### 状态栏

自定义状态栏从左到右显示：

- 文件路径
- 是否已修改、是否只读
- 文件类型、编码与换行格式
- 当前行、总行数、列号和文件进度

这套状态栏不依赖 airline 或 lightline，主题失效时也不影响基本信息显示。

最后一项使用 `let &statusline .= ' %p%% '`，与附件中依赖行尾转义空格的写法显示效果相同，但不会因为 Markdown 或格式化工具清理行尾空格而丢失末尾留白。

## 验证配置

安装和配置完成后，先检查 vim-plug 与 Nord：

```vim
:PlugStatus
:echo get(g:, 'colors_name', '未加载配色')
```

第二条命令应输出：

```text
nord
```

再检查关键能力：

```vim
:echo $MYVIMRC
:echo has('termguicolors')
:echo has('clipboard')
:echo has('persistent_undo')
:set termguicolors?
:set clipboard?
:set undodir?
:set directory?
```

还可以做一轮实际验证：

1. 打开 Markdown、Python、Go 和 Makefile，分别执行 `:setlocal filetype? expandtab? tabstop? shiftwidth?`。
2. 输入带 Tab 和尾随空格的文本，按 `Space l` 检查显示切换。
3. 修改并保存一个普通测试文件，退出后重新打开，确认 `u` 仍能撤销。
4. 在 macOS 本机 Vim 中使用 `yy` 复制一行，再到其他应用中粘贴，检查系统剪贴板联动；远端 Vim 不做这项测试。
5. 输入一条足够长的文本，检查折行前是否出现 `> `。

## 常见问题

### `E117: Unknown function: plug#begin`

vim-plug 没有安装到 Vim 的 autoload 目录，或者下载失败。检查：

```bash
ls -l ~/.vim/autoload/plug.vim
```

文件不存在时，重新执行本文的 `curl` 安装命令。也要确认当前运行的是 Vim，而不是使用另一套配置目录的 Neovim。

### `E185: Cannot find color scheme 'nord'`

Nord 尚未安装，或者 `:PlugInstall` 没有成功完成。依次执行：

```vim
:PlugInstall
:PlugStatus
:colorscheme nord
```

完整配置用 `silent! colorscheme nord` 保证第一次安装插件前仍能进入 Vim，因此缺少主题时不会主动弹错。排障时手动执行 `:colorscheme nord`，就能看到真实错误。

### Nord 已加载，但颜色和截图不一样

先检查：

```vim
:echo get(g:, 'colors_name', '')
:set background?
:set termguicolors?
```

然后检查 Shell：

```bash
printf 'TERM=%s\nCOLORTERM=%s\n' "$TERM" "$COLORTERM"
```

如果 Vim 没有开启真彩色，就会使用终端色板。此时需要在 iTerm2 中导入 Nord 配色，或按本系列第三篇在 SecureCRT 中手工配置 Nord 色板，而不是只改 Vim。若经过 tmux 或 SSH，还要逐段确认颜色能力有没有被中间层降级。

### `»`、`␣` 等字符显示成方框

当前终端字体缺少相应字形。可以更换覆盖范围更完整的等宽字体，或者把 `listchars` 改成纯 ASCII：

```vim
set listchars=tab:>-,trail:.,extends:>,precedes:<,nbsp:+
```

### 本机 Vim 中 `yy` 后无法粘贴到其他应用

先执行：

```vim
:echo has('clipboard')
:set clipboard?
```

如果第一条返回 `0`，当前 Vim 没有系统剪贴板能力。再次用 `type -a vim` 确认是否误用了 `/usr/bin/vim`，并检查 Homebrew Vim 是否排在 `PATH` 前面。

如果 Vim 运行在 SSH 远端，这两项只反映远端主机的能力，不代表它能访问 macOS 剪贴板。

### F2 无法切换 Paste 模式

macOS 可能把功能键交给亮度、音量等系统功能。尝试 Fn+F2，或在系统键盘设置中启用“将 F1、F2 等键用作标准功能键”。现代 Vim 已能在许多终端中处理 bracketed paste；如果直接粘贴没有缩进问题，也不必手动开启 Paste 模式。

### 启动时报撤销或 Swap 目录不可写

检查目录权限：

```bash
ls -ld ~/.vim ~/.vim/undo ~/.vim/swap
```

必要时创建目录，并限制为仅当前用户可访问：

```bash
mkdir -p ~/.vim/undo ~/.vim/swap
chmod 700 ~/.vim/undo ~/.vim/swap
```

## 结语

这份配置没有试图把 Vim 变成一个塞满插件的 IDE。它只处理每天都会碰到的细节：看清缩进、快速搜索、稳定粘贴、跨会话撤销，以及在不同终端里保持可辨认的 Nord 配色。

Vim 本身配置好以后，下一步是处理承载它的终端。iTerm2 负责 macOS 本机体验，SecureCRT 负责大量远程会话；只有三者的字体、ANSI 色板和真彩色策略相互配合，Nord 才不只是“装上了”，而是真的一致。

## 参考资料

- [Vim 官方下载页](https://www.vim.org/download.php)
- [Vim 官方选项文档](https://vimhelp.org/options.txt.html)
- [Vim 官方终端文档](https://vimhelp.org/term.txt.html)
- [Homebrew Vim Formula](https://formulae.brew.sh/formula/vim)
- [vim-plug 官方仓库](https://github.com/junegunn/vim-plug)
- [Nord Vim 官方仓库](https://github.com/nordtheme/vim)
- [Nord Vim 安装文档](https://www.nordtheme.com/docs/ports/vim/installation/)
