---
title: "Kubernetes 排障：kubectl 命令与故障定位顺序"
slug: "kubernetes-troubleshooting-kubectl-workflow"
date: 2026-05-27T16:15:38+08:00
author:
  - Y'Jie
categories:
  - 云原生
  - Kubernetes
tags:
  - Kubernetes
  - 故障排查
  - kubectl
  - Pod
  - Service
description: "从 `kubectl` 常用命令、事件、日志、探针到 Service 与 Endpoints 检查，整理一套更符合运维实战的 Kubernetes 故障定位顺序，适合线上排障和日常巡检场景。"
summary: "从 `kubectl` 常用命令、事件、日志、探针到 Service 与 Endpoints 检查，整理一套更符合运维实战的 Kubernetes 故障定位顺序，适合线上排障和日常巡检场景。"
keywords:
  - Kubernetes 排障
  - kubectl 常用命令
  - Pod 故障定位
  - Service Endpoints
series:
  - Kubernetes
weight: 2
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
---

Kubernetes 出问题时，最怕的不是错误本身，而是信息太多。

你打开终端之后，眼前是一片：

- Pod
- Deployment
- ReplicaSet
- Event
- Probe
- Service
- Endpoints

这些信息分布在不同资源中，排障时需要先确定检查顺序。

## 按故障环节组织排查 {#排障思路}

我更推荐按下面这条链路去查：

```mermaid
flowchart LR
  A["现象<br/>服务不可用 / 发布失败 / Pod 异常"] --> B["看 Deployment / StatefulSet"]
  B --> C["看 Pod 状态"]
  C --> D["看 describe 与 Events"]
  D --> E["看 logs"]
  E --> F["看 Service / Endpoints / Ingress"]
  F --> G["再看 Node / CNI / DNS / 存储"]
```

简单说就是：

1. 先确认是不是对象没起来
2. 再确认是不是容器起了但业务没起来
3. 再确认是不是网络转发没打通

这样比一上来就 `kubectl get all` 要更有效。  
`get all` 会汇集多类资源，仍需按故障环节进一步缩小范围。

## 检查资源对象状态 {#第一层先看资源对象状态}

### 检查 Deployment {#看-deployment}

```bash
kubectl get deploy -A
kubectl describe deploy <deployment-name> -n <namespace>
```

重点看这些字段：

- `Replicas`
- `Available`
- `Updated`
- `Conditions`

如果 Deployment 本身就没有达到期望副本数，后面很多排查都可以先暂停。

### 检查 Pod {#看-pod}

```bash
kubectl get pods -A
kubectl get pods -n <namespace> -o wide
```

常见状态及含义：

| 状态 | 含义 | 常见原因 |
| --- | --- | --- |
| `Pending` | 还没调度成功 | 资源不足、节点污点、PVC 未绑定 |
| `Running` | 已运行 | 不代表业务一定可用 |
| `CrashLoopBackOff` | 反复崩溃重启 | 启动命令错、配置错、依赖不可达 |
| `ImagePullBackOff` | 镜像拉取失败 | 镜像地址错、仓库认证问题 |
| `Completed` | 任务已完成 | 常见于 Job |

## 使用 `describe` 查看资源事件 {#第二层describe-是最便宜的情报来源}

很多问题，甚至不用进日志就能发现。

```bash
kubectl describe pod <pod-name> -n <namespace>
```

这里最值得看的是：

- `Events`
- `Containers`
- `State`
- `Last State`
- `Readiness`
- `Liveness`

### 调度失败事件示例 {#一个很典型的事件示例}

```text
Warning  FailedScheduling  2m    default-scheduler  0/3 nodes are available: 3 Insufficient memory.
Warning  Failed            90s   kubelet            Error: ImagePullBackOff
Warning  Unhealthy         20s   kubelet            Readiness probe failed
```

如果事件已写明 `Insufficient memory`，就先检查内存需求和节点可用资源。

## 通过容器日志定位应用问题 {#第三层日志才是真正看业务的地方}

### 查看当前日志

```bash
kubectl logs <pod-name> -n <namespace>
```

### 查看多容器 Pod 指定容器日志

```bash
kubectl logs <pod-name> -c <container-name> -n <namespace>
```

### 查看上一次崩溃前的日志

```bash
kubectl logs <pod-name> --previous -n <namespace>
```

这个 `--previous` 很重要，尤其在 `CrashLoopBackOff` 时。  
不然你看到的可能只是“容器刚重启后还没来得及报错”的安静现场。

## 检查探针与应用启动时间 {#第四层探针问题经常看起来像服务抽风}

很多服务实际上已经启动了，但因为探针配置不合理，被 Kubernetes 持续判定为不健康。

常见探针：

- `livenessProbe`
- `readinessProbe`
- `startupProbe`

### 探针配置示例 {#一个简单示例}

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

排查时重点看：

- 接口路径是否存在
- 端口是否一致
- 启动预热时间是否太短

例如 Java 服务冷启动需要 40 秒，探针却只留出 5 秒，就可能在完成启动前被反复判定失败。

## 检查 Service 与 Endpoints 连通性 {#第五层服务不通时看-service-和-endpoints}

业务说“页面打不开”，很多人第一反应是 Pod 挂了。  
但其实也有不少情况是：

- Pod 在
- 容器也在
- Service 也在
- 就是流量没有转发到正确后端

### 检查 Service {#先看-service}

```bash
kubectl get svc -n <namespace>
kubectl describe svc <service-name> -n <namespace>
```

### 检查 Endpoints {#再看-endpoints}

```bash
kubectl get endpoints -n <namespace>
kubectl describe endpoints <service-name> -n <namespace>
```

### Service 与 Endpoints 常见问题 {#最常见问题}

| 现象 | 原因 |
| --- | --- |
| Service 存在但无 Endpoints | `selector` 与 Pod 标签不匹配 |
| Endpoints 有值但访问失败 | 容器端口、探针、应用监听地址问题 |
| NodePort 打不开 | 节点防火墙、安全组、网络策略限制 |

## 通过 rollout 检查发布状态 {#第六层发布失败时看-rollout}

滚动更新异常时，这组命令很实用：

```bash
kubectl rollout status deploy/<deployment-name> -n <namespace>
kubectl rollout history deploy/<deployment-name> -n <namespace>
kubectl rollout undo deploy/<deployment-name> -n <namespace>
```

在版本发布现场，这基本属于“止血三件套”。

## 检查节点状态与资源不足 {#第七层节点与资源层问题}

如果 Pod 连调度都上不去，通常就要往节点层看了。

```bash
kubectl get nodes
kubectl describe node <node-name>
kubectl top nodes
kubectl top pods -A
```

重点关注：

- CPU / 内存是否不足
- 节点是否 `NotReady`
- 是否有 `taints`
- 磁盘是否打满

## kubectl 常用命令速查 {#一份高频命令备忘}

| 命令 | 用途 |
| --- | --- |
| `kubectl get pods -A` | 看全局 Pod 状态 |
| `kubectl describe pod <pod>` | 看对象详情与事件 |
| `kubectl logs <pod>` | 看业务日志 |
| `kubectl logs <pod> --previous` | 看上一次崩溃日志 |
| `kubectl get svc,endpoints` | 看服务与后端映射 |
| `kubectl rollout status deploy/<name>` | 看滚动发布进度 |
| `kubectl get events --sort-by=.lastTimestamp` | 按时间看事件 |

## 故障定位顺序要点 {#排障结论}

Kubernetes 排障最怕两件事：

1. 一上来就看太多
2. 一上来就猜太多

更稳的方式是：

- 先确认对象状态
- 再确认事件
- 再确认日志
- 最后才深入网络、节点和基础设施

排障时按资源状态、事件和日志逐层检查，用 `kubectl` 将分散的线索对应到具体故障环节。



## 参考资料

- [kubectl 官方文档](https://kubernetes.io/docs/reference/kubectl/)
- [Pod 生命周期文档](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Debug Services 文档](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/)
