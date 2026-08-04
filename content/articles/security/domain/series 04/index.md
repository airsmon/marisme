---
title: "Web 站点入门（四）：免费证书和商业证书"
slug: "free-vs-commercial-ssl-certificates-lets-encrypt-zerossl-digicert"
date: 2026-06-02T11:54:02+08:00
author:
  - Y'Jie
categories:
  - 网络
  - 安全
tags:
  - TLS
  - SSL
  - Let's Encrypt
  - ZeroSSL
  - DigiCert
series:
  - Web 站点入门
weight: 4
description: "从个人网站到企业业务系统，把免费证书、商业证书、国产证书和自动化续期的差别讲清楚，帮助非技术读者理解 Web 站点为什么会有不同选型。"
summary: "从个人网站到企业业务系统，把免费证书、商业证书、国产证书和自动化续期的差别讲清楚，帮助非技术读者理解 Web 站点为什么会有不同选型。"
keywords:
  - 免费证书和商业证书区别
  - Let's Encrypt ZeroSSL 对比
  - 商业 CA 怎么选
  - 国产 SSL 证书
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
mermaid: false
---

聊 HTTPS 证书时，一个特别容易聊歪的问题是：

**免费证书和商业证书，到底差在哪？**

很多人一听“免费”，第一反应就是不安全。  
这话放在别的东西上也许还能讨论，但放到今天的 HTTPS 证书上，通常就不太对了。

对绝大多数网站来说，免费证书和商业证书都能把 TLS 跑起来，也都能让浏览器建立安全连接。  
真正拉开差距的，往往不是“能不能加密”，而是：

- 你是什么场景
- 你要不要更强的身份验证
- 你需不需要人兜底
- 你有没有自动化能力
- 你是不是已经进入企业治理阶段

这篇不打算把免费和付费讲成两派宗教，就讲现实一点：什么场景用什么，差别到底落在哪。

## 1. 面向场景：个人网站和企业业务，根本不是同一道题

先把这个前提摆清楚，后面就没那么容易选偏。

### 个人网站、小团队站点、技术自管业务

这类场景通常有几个共同点：

- 目标很明确，先把 HTTPS 正常用起来
- 站点数量不算夸张
- 团队愿意自己管自动续期
- 更在意省事、省钱、别出低级事故

这种情况下，免费证书通常完全能打。

比如：

- 个人博客
- 内容站
- 普通官网
- 中小 SaaS
- 内部平台
- 测试和预发环境

说得直接一点，如果你的网站只是需要一个稳定可信的 HTTPS 入口，免费证书往往已经够了。

### 企业官网、正式业务系统、合规敏感场景

另一类场景就不一样了。

它们关心的往往不是“这张证书能不能点亮小锁”，而是：

- 申请主体能不能被验证
- 供应商能不能签合同
- 到期了谁负责
- 出问题有没有人工支持
- 证书资产能不能统一管理

这时候商业证书的价值才开始变得具体。

尤其是这些场景：

- 企业官网要体现组织身份
- 金融、医疗、政企系统有合规要求
- 业务量大，证书数量多
- 采购、法务、审计都要参与

所以这件事最好别问“免费好还是付费好”，而要问：

**我现在是在解决 HTTPS 可用性问题，还是在解决证书治理问题？**

## 2. 安全对比：差别不只是加密算法，还包括信任链和签发方式

很多人一上来就问：免费证书是不是加密更弱？

通常不是这么看的。

这也是非技术人员最容易先入为主的一点。  
一听“免费”，很容易顺手把它和“底层更弱”“加密没那么安全”画上等号。真放到 HTTPS 证书上，这个判断往往是不准的。

先看一张最容易把误会说清楚的表：

| 常见印象 | 实际情况 |
| --- | --- |
| 免费证书底层加密更弱 | 不成立。免费证书和商业证书都可以使用主流 TLS 算法和浏览器信任链 |
| 付费证书天生更安全 | 不够准确。证书价格不会自动提升 TLS 配置质量，也不会自动解决私钥保管问题 |
| 免费证书只能测试环境用 | 不成立。大量正式网站、内容站、SaaS 和业务入口都在用免费证书 |
| 商业证书的价值主要在“加密更强” | 不准确。更常见的价值在 `OV/EV`、人工支持、采购流程、资产管理和合规配合 |

### 根证书和信任链

不管免费还是商业，只要是公开受信任的 SSL/TLS 证书，本质上都得走浏览器信任链：

- 根证书被主流系统和浏览器信任
- 中间证书负责实际签发
- 终端证书最终装到你的网站上

也就是说，免费证书不是“自己随便签一张”，商业证书也不是“天然就高一档”。  
能不能被浏览器信任，看的还是 CA 体系和证书链。

如果把名字摊开看，会更直观一点：

| 类型 | 常见根证书 / 根体系示例 | 说明 |
| --- | --- | --- |
| Let’s Encrypt | `ISRG Root X1`、`ISRG Root X2` | Let’s Encrypt 自己的根体系。官方链路说明里明确写到，RSA 订户证书链到 `ISRG Root X1`，ECDSA 证书可链到 `ISRG Root X1` 或 `ISRG Root X2` |
| 商业 CA | `DigiCert Global Root CA`、`DigiCert Global Root G2`、`Sectigo Public Server Authentication Root R46`、`Sectigo Public Server Authentication Root E46` | 这些也是公开受信任的商业根体系，主流浏览器和系统信任的逻辑和 Let’s Encrypt 并没有本质区别 |

这也是为什么“免费证书不安全”这个说法站不住。  
只要证书最终能正确链到主流信任库里的公开根证书，它在“浏览器是否信任这条链”这件事上，判断标准和商业证书是一样的。

真正的区别更多在于：

- CA 品牌和生态成熟度
- 中间证书链兼容性处理
- 某些旧设备、旧系统下的兼容经验
- 证书生命周期管理是否更完善

### 加密算法

再说算法。

免费证书和商业证书都可以使用现代 TLS 体系里的主流算法，比如：

- `RSA`
- `ECDSA`
- `AES-GCM`
- `ChaCha20-Poly1305`

所以别把它理解成：

- 免费证书只能用差算法
- 商业证书才能用强算法

实际部署时，真正决定安全性的通常是：

- 你的服务器 TLS 配置
- 是否禁用了过时协议
- 是否启用了合理的 cipher suites
- 证书私钥有没有保管好

证书价格本身，不会自动把 TLS 配置变好。

### 证书签发时间

这一点就很现实了。

先把“签发快慢”和“能用多久”分开看，不然很容易混在一起：

| 对比项 | 免费证书 | 商业证书 |
| --- | --- | --- |
| 常见签发类型 | 多数以 `DV` 为主 | `DV`、`OV`、`EV` 更完整 |
| 常见签发速度 | 自动化后几分钟内 | `DV` 也能很快，`OV/EV` 往往更慢 |
| 影响签发时间的关键 | 域名验证是否通过 | 域名验证 + 组织验证 + 人工审核流程 |

再看证书可用时间：

| 类型 | 当前常见可用时间 | 说明 |
| --- | --- | --- |
| Let’s Encrypt 默认公开证书 | `90 天` | 官方长期说明就是 90 天有效期；截至 `2026-06-02`，Let’s Encrypt 仍在使用 90 天作为默认经典 ACME 证书有效期 |
| 商业 CA 公开 TLS 证书 | `最长 200 天` | 这是行业上限，不是某一家单独规定。根据公开规则调整，`2026-03-15` 起公开 TLS 证书最大有效期降到 200 天，商业 CA 也要跟着执行 |

如果只是 `DV`，免费证书和商业 `DV` 证书在“快”这件事上差距不一定大。  
但一旦进入 `OV` 或 `EV`，签发流程就不再只是证明“你控制这个域名”，而是要证明“你这个组织也是真的”。

而在可用时间上，免费证书和商业证书也不是谁想签多久就签多久。  
Let’s Encrypt 走的是更短周期、强自动化路线；商业 CA 现在在公开 TLS 证书上也要遵守新的行业上限，所以“付费就能拿一年以上公开证书”这类旧印象，也该更新一下了。

所以企业有时候买商业证书，不是为了更快，反而是接受“更慢一点，但验证更完整”。

### 一张够用的安全对比表

| 维度 | 免费证书 | 商业证书 |
| --- | --- | --- |
| 浏览器信任 | 可以 | 可以 |
| TLS 基础加密 | 可以 | 可以 |
| 根证书 / 中间证书体系 | 依赖公开可信 CA | 同样依赖公开可信 CA |
| 主流算法支持 | 有 | 有 |
| `DV` 支持 | 强 | 强 |
| `OV / EV` 支持 | 通常没有或很少 | 更完整 |
| 签发流程 | 更偏自动化 | 更偏标准流程和审核 |

说到这里，其实就很清楚了：

**免费证书和商业证书的基础加密能力，很多时候差得没你想的那么大；真正拉开差距的，是身份验证、流程和管理。**

## 3. 售后支持：这部分往往比“加密强不强”更影响采购

这件事技术人一开始很容易忽略，真接到企业项目时通常就会发现，支持这件事绕不过去。

### 免费证书更像自助模式

免费证书的典型特点是：

- 文档成熟
- 自动化强
- 社区生态好
- 但基本靠自己解决

如果你会看日志、会排 DNS、会查 ACME challenge、会处理续期失败，那这套模式很顺。

但要是你处在下面这种环境里：

- 域名体系复杂
- 多团队协作
- 老系统多
- 网络出口限制多

那“自己搞定”这件事，很容易变成隐形成本。

### 商业证书更像有人兜底

商业 CA 的优势，很多时候不在证书本身，而在这些东西：

- 工单支持
- 人工协助
- 合同和采购流程
- SLA
- 到期提醒
- 控制台和资产管理

这类能力放在单站点上看，确实会显得有点重。  
但一旦证书数量上来，或者组织里开始讲责任边界，这些东西就很值钱。

所以企业买商业证书，很多时候买的不是那张证书，而是：

**有人负责、有人响应、出了问题有人接。**

## 4. Let’s Encrypt、ZeroSSL、商业 CA、国产证书，分别适合什么人

说到这里，差别就可以落到具体选择上了。

### Let’s Encrypt：最适合“先把 HTTPS 正常跑起来”

`Let's Encrypt` 的定位一直很明确：

- 免费
- 自动化
- 普及 HTTPS

截至 `2026-06-02`，其官方 FAQ 仍明确说明只提供 `DV` 证书，不提供 `OV` 或 `EV`。  
参考：[Let's Encrypt FAQ](https://letsencrypt.com/zh-cn/docs/faq/)

它特别适合：

- 个人博客
- 内容站
- 中小网站
- 技术团队自主管理的业务
- 容器、Kubernetes、反向代理自动续期体系

如果你的目标很朴素，就是“把 HTTPS 跑稳，别手工续期”，那 Let’s Encrypt 基本就是最自然的起点。

### ZeroSSL：免费自动化也能用，但平台味更重一点

`ZeroSSL` 也是很多团队会拿来和 Let’s Encrypt 一起比较的选择。

它的特点比较像：

- 也支持 ACME
- 也能做免费证书
- 同时更强调控制台、API 和平台化体验

截至 `2026-06-02`，ZeroSSL 官方文档仍说明其 ACME 可免费签发 `90 天` 证书，并支持多域名和通配符。  
参考：

- [ZeroSSL ACME](https://zerossl.com/features/acme/)
- [ZeroSSL ACME Documentation](https://zerossl.com/documentation/acme/)

它更适合：

- 想保留自动化
- 又想要更明显的控制台体验
- 或者想从“纯命令行”过渡到“带平台管理”的团队

### 商业 CA：更适合组织已经进入治理阶段

商业 CA 不只是一家，常见会看到：

- `DigiCert`
- `Sectigo`
- `GlobalSign`

它们更常见的优势在：

- `OV / EV` 支持更完整
- 企业身份验证流程更成熟
- 支持采购、合同、工单和 SLA
- 生命周期管理能力更强

这种选择更适合：

- 企业官网
- 金融、医疗、政企
- 大型电商
- 证书资产多、责任边界复杂的组织

### 国产证书：更偏本地化服务、合规和中文支持

“国产证书”这几个字，很多人第一反应是“是不是浏览器不认”。  
其实这件事不能这么一刀切。

现实里常见的有几类：

- 本土证书服务平台，比如 `TrustAsia`
- 国内 CA 或本地化能力更强的机构，比如 `CFCA`、`BJCA`

它们更常见的优势在：

- 中文文档和中文支持
- 本地采购流程更顺
- 对国内企业流程更熟
- 某些政企、金融、本地合规场景更容易推进

如果你是个人站长，未必非得优先走这条路。  
但如果你做的是国内企业业务，尤其还要跟采购、法务、合规部门一起走流程，那国产证书或本地服务商往往会比纯海外方案更省沟通成本。

## 5. 扩展：自动化这件事，往往比“免费还是付费”更重要

证书这件事，最怕的不是第一次没装上，而是半年后、一年后，大家都忘了它还要续。

真到线上出事故，很多问题都不是“选错 CA”，而是：

- 续期没人管
- 续期失败没人知道
- 新证书下来了，服务没 reload

### 个人站和中小团队，优先把自动续期跑通

这类场景里，最实用的做法往往不是买更贵的证书，而是先把自动化链路建好。

常见做法有：

- `acme.sh`
- `certbot`
- `Caddy` 自动 HTTPS
- `Traefik` 自动证书
- `cert-manager`

其中 `acme.sh` 特别常见，原因很简单：

- 轻
- 兼容很多 DNS API
- 适合脚本化
- 很适合 VPS、自托管和多域名场景

如果你的网站是自己管，`acme.sh + DNS API + 定时续期` 这套组合，实战里通常已经很够用。

### 企业场景，自动化还得加上“看得见”和“管得住”

企业自动化通常不只是签出来就完了，还要考虑：

- 续期监控
- 权限控制
- 操作审计
- 多团队分工
- 大量证书的集中视图

所以企业场景里的关键问题通常变成：

**能不能自动续，续了以后谁知道，失败了谁处理。**

## 6. 总结

如果一定要把这篇压成一句话，我会这样说：

**免费证书更适合把 HTTPS 快速、低成本地跑起来；商业证书更适合把证书纳入正式业务治理。**

再说得更直白一点：

- 个人网站、小团队业务：优先看免费证书 + 自动续期
- 企业官网、正式业务系统：优先看身份验证、支持服务和管理能力
- 国内企业场景：别忽略国产证书和本地服务能力
- 真正决定长期体验的，很多时候不是证书贵不贵，而是自动化有没有做好

所以最后该问的不是：

- 免费证书安全不安全

而是：

- 我的业务现在需要的是“先用起来”
- 还是“长期稳稳地管起来”

下一篇，我们就继续把这个问题往部署层推进：

**证书申请下来之后，如何部署到 NGINX、Apache、Caddy、Traefik？**

## 参考资料

- [Let's Encrypt Getting Started](https://letsencrypt.org/getting-started/?price=FREE)
- [Let's Encrypt FAQ](https://letsencrypt.com/zh-cn/docs/faq/)
- [Let's Encrypt: Chains of Trust](https://letsencrypt.org/certificates/?lang=en)
- [ZeroSSL ACME](https://zerossl.com/features/acme/)
- [ZeroSSL ACME Documentation](https://zerossl.com/documentation/acme/)
- [DigiCert: What’s the difference between DV, OV & EV SSL certificates?](https://www.digicert.com/difference-between-dv-ov-and-ev-ssl-certificates)
- [DigiCert: TLS/SSL Certificate Validity FAQ](https://www.digicert.com/faq/tls-ssl-certificate-validity)
- [DigiCert Trusted Root Authority Certificates](https://knowledge.digicert.com/general-information/digicert-trusted-root-authority-certificates)
- [Sectigo: 200-day SSL Certificate Expiration Risk](https://www.sectigo.com/blog/200-day-ssl-certificate-expiration-risk/)
- [Sectigo Certificate Authority Root Keys](https://www.sectigo.com/resource-library/sectigo-certificate-authority-root-keys)
- [TrustAsia 官网](https://www.trustasia.com/)
- [CFCA SSL 证书](https://ssl.cfca.com.cn/Web/evSslCert)
