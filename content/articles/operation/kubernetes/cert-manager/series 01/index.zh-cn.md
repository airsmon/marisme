---
title: "Kubernetes cert-manager：TLS 证书签发与自动续期"
slug: "kubernetes-cert-manager-getting-started"
date: 2026-06-01T11:10:00+08:00
author:
  - Y'Jie
categories:
  - 云原生
  - Kubernetes
tags:
  - Kubernetes
  - cert-manager
  - TLS
  - Let's Encrypt
  - Cloudflare
series:
  - cert-manager
weight: 1
description: "从安装 cert-manager、配置 Cloudflare DNS-01，到签发 Kubernetes 业务证书，梳理一套可直接落地的自动化 TLS 方案，适合 Ingress、Gateway 和集群内服务证书自动化场景。"
summary: "从安装 cert-manager、配置 Cloudflare DNS-01，到签发 Kubernetes 业务证书，梳理一套可直接落地的自动化 TLS 方案，适合 Ingress、Gateway 和集群内服务证书自动化场景。"
keywords:
  - cert-manager 入门
  - Kubernetes 自动签发证书
  - Cloudflare DNS-01
  - Let's Encrypt Kubernetes
cover:
  image: "https://img.marisme.com/blog/2025/11/19/202511192027990.png"
  alt: "Kubernetes cert-manager"
  caption: "在 Kubernetes 中自动签发和续期 TLS 证书"
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
---

开源仓库：

{{< github repo="cert-manager/cert-manager" />}}

## cert-manager 的证书管理流程 {#cert-manager-到底帮我们做了什么}

当你在集群里创建一个 `Certificate` 资源后，`cert-manager` 会自动完成一整套证书申请动作：

1. 在集群里生成私钥
2. 通过 `Issuer` 或 `ClusterIssuer` 向 CA 发起申请
3. 完成域名所有权验证
4. 将证书和私钥写入 `Secret`
5. 在证书到期前自动续期

如果把它类比成流程审批，大概是这样：

- `Certificate`：你的申请表
- `CertificateRequest`：内部审批单
- `Order`：ACME 订单
- `Challenge`：CA 给你的验证题

```mermaid
flowchart LR
  C["Certificate"] --> CR["CertificateRequest"]
  CR --> O["Order"]
  O --> CH["Challenge"]
  CH --> S["Secret"]
```

## 安装 cert-manager {#先安装-cert-manager}

安装命令：

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.19.2/cert-manager.yaml
```

安装后先确认组件都正常：

```bash
kubectl get pods -n cert-manager
```

示例输出：

```bash
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-7b8b89f89d-tt7ng              1/1     Running   0          3h21m
cert-manager-cainjector-7f9fdd5dd5-44drh   1/1     Running   0          3h21m
cert-manager-webhook-769f6b94cb-cdkbk      1/1     Running   0          3h21m
```

三个组件均显示 `Running` 后，再继续检查 Issuer 和业务证书状态。

## HTTP-01 与 DNS-01 验证方式 {#选择验证方式http-01-还是-dns-01}

常见 ACME 验证方式有两种：

- `HTTP-01`：适合入口流量已经通了的 Web 服务
- `DNS-01`：适合做泛域名证书，或者不想依赖入口路径

本文演示 `Cloudflare DNS-01`，因为这套组合非常适合云原生场景，尤其是：[^cm-dns01]

- 有 Cloudflare DNS 托管
- 需要签发多个子域名
- 后续想配合 Ingress / Gateway 自动续期

## 配置 Cloudflare DNS-01 ClusterIssuer {#用-cloudflare-配置-clusterissuer}

### 创建 Cloudflare 凭据 Secret {#第一步创建-cloudflare-凭据-secret}

先准备 `secret.yaml`：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cloudflare-api-key-secret
  namespace: cert-manager
type: Opaque
stringData:
  api-key: {your-api-key}
```

应用：

```bash
kubectl apply -f secret.yaml
```

### 创建 ClusterIssuer {#第二步创建-clusterissuer}

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-cloudflare
spec:
  acme:
    email: {your-email}
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-cloudflare-account-key
    solvers:
      - dns01:
          cloudflare:
            email: {your-email}
            apiKeySecretRef:
              name: cloudflare-api-key-secret
              key: api-key
```

应用：

```bash
kubectl apply -f cluster-issuer.yaml
```

### 检查 Issuer 状态 {#第三步检查-issuer-状态}

```bash
kubectl get secrets -n cert-manager
kubectl get clusterissuers.cert-manager.io
```

示例：

```bash
NAME                                 TYPE     DATA   AGE
cert-manager-webhook-ca              Opaque   3      3h29m
cloudflare-api-key-secret            Opaque   1      3h8m
letsencrypt-cloudflare-account-key   Opaque   1      3h1m

NAME                     READY   AGE
letsencrypt-cloudflare   True    158m
```

看到 `READY=True`，说明这一层已经通了。

## 创建业务 Certificate {#申请一张业务证书}

例如为 `gitlab.artoio.com` 创建证书：

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: gitlab-cert
  namespace: istio-system
spec:
  secretName: gitlab-tls-secret
  issuerRef:
    name: letsencrypt-cloudflare
    kind: ClusterIssuer
  dnsNames:
    - gitlab.artoio.com
```

应用：

```bash
kubectl apply -f certificate.yaml
```

然后验证：

```bash
kubectl get certificate -n istio-system
kubectl get certificaterequests.cert-manager.io -n istio-system
kubectl get orders.acme.cert-manager.io -n istio-system
kubectl logs -f -n cert-manager -l app.kubernetes.io/name=cert-manager
```

示例状态：

```bash
NAME          READY   SECRET              AGE
gitlab-cert   True    gitlab-tls-secret   159m

NAME            APPROVED   DENIED   READY   ISSUER                   REQUESTER                                         AGE
gitlab-cert-1   True                True    letsencrypt-cloudflare   system:serviceaccount:cert-manager:cert-manager   160m

NAME                      STATE   AGE
gitlab-cert-1-298491017   valid   161m
```

## 按证书资源依赖关系排障 {#排障顺序很重要}

证书未签发时，按资源依赖关系逐层检查：

1. 先看 `Certificate`
2. 再看 `CertificateRequest`
3. 然后看 `Order`
4. 最后看 `Challenge`

对应命令：

```bash
kubectl get certificate
kubectl describe certificate <name>

kubectl get certificaterequest
kubectl describe certificaterequest <name>

kubectl get orders.acme.cert-manager.io
kubectl describe order <name>

kubectl get challenges.acme.cert-manager.io
kubectl describe challenge <name>
```

其中最容易暴露真实报错的，往往是 `Challenge`。很多时候问题并不是 cert-manager 本身坏了，而是：

- DNS 记录没生效
- Cloudflare 权限不够
- 域名填错
- Namespace / Secret 名字对不上

## 证书签发与续期要点 {#结语}

`cert-manager` 很适合做 Kubernetes 集群里的证书自动化中枢。你只需要把 `Issuer` 配好，后面的申请、签发、写入 `Secret`、续期，基本都可以交给它。

`cert-manager` 将重复的证书申请和续期步骤自动化，减少手工维护。




[^cm-dns01]: cert-manager 官方文档对 Cloudflare DNS-01 的 Secret、Issuer 与权限要求有更完整说明，实际生产环境建议优先参考官方配置示例。

## 参考资料

- [cert-manager 官方文档](https://cert-manager.io/docs/)
- [cert-manager GitHub 仓库](https://github.com/cert-manager/cert-manager)
- [Cloudflare DNS-01 配置文档](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/)
