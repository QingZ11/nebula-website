---
title: "Pick of the Week'20 | 第 22 周看点--图遍历实践"
date: 2020-05-29
description: "图遍历新特性——返回指定步数范围的图遍历已上线，在社区的问答部分你将了解到生产、测试环境的配置要求。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 22 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [GO M TO N STEPS 功能讲解](https://github.com/vesoft-inc/nebula/pull/2091)

图遍历是图数据库中的一项重要功能，可以用来遍历具有直接或间接关系的点。在 Nebula Graph 中，我们使用 `GO` 语句实现图遍历操作。

本周新增的 `GO M TO N STEPS` 多步查询功能，在 `GO N STEPS` 的基础上实现了一次遍历 M 到 N 步内所有点的功能，同 `GO N STEPS`  ，`GO M TO N STEPS` 支持反向遍历、双向遍历、沿多个边遍历、从多个点遍历等用法。

当 M 等于 N 时，`GO M TO N STEPS` 等同 `GO N STEPS`。`GO M TO N STEPS` 功能将原本在一定范围内需要多次执行的图遍历操作简化至一条命令，提高了大规模筛选目标点的效率。

下面来实践一下：

- 遍历从点 101 出发沿任意边类型 3 至 5 步的点

```
(user@nebula) [nba]> GO 3 TO 5 STEPS FROM 101 OVER *
================================================
| follow._dst | serve._dst | e1._dst | e2._dst |
================================================
| 100         | 0          | 0       | 0       |
------------------------------------------------
| 101         | 0          | 0       | 0       |
------------------------------------------------
| 105         | 0          | 0       | 0       |
------------------------------------------------
| 0           | 200        | 0       | 0       |
------------------------------------------------
| 0           | 208        | 0       | 0       |
------------------------------------------------
| 0           | 218        | 0       | 0       |
------------------------------------------------
| 0           | 219        | 0       | 0       |
------------------------------------------------
| 0           | 221        | 0       | 0       |
------------------------------------------------
| 0           | 222        | 0       | 0       |
------------------------------------------------
| 0           | 204        | 0       | 0       |
------------------------------------------------

Got 134 rows (Time spent: 4.117/5.452 ms)
```

- 反向遍历从点 100 开始沿 follow 边 2 至 4 步的点，以列的形式返回 follow 边的目标点
 
```
(user@nebula) [nba]> GO 2 TO 4 STEPS FROM 100 OVER follow REVERSELY YIELD DISTINCT follow._dst 
=============== 
| follow._dst | 
=============== 
| 133         | 
--------------- 
| 105         | 
--------------- 
| 140         | 
--------------- 
Got 17 rows (Time spent: 3.27/3.948 ms)
```

- 双向遍历从点 101 出发沿 follow 边 4 至 5 步的点

```
(user@nebula) [nba]> GO 4 TO 5 STEPS FROM 101 OVER follow BIDIRECT YIELD DISTINCT follow._dst
===============
| follow._dst |
===============
| 100         |
---------------
| 102         |
---------------
| 104         |
---------------
| 105         |
---------------
| 107         |
---------------
| 113         |
---------------
| 121         |
---------------
```

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【生产、测试环境的配置要求】，由社区用户 kotexy 提出，Nebula Graph 官方解答。

> kotexy 提问：请问，用 Nebula有什么配置要求？

**Nebula**：这里分为生产、测试环境来讲述配置要求。这里着重讲下生产环境的配置要求：

在生产环境中，需要 **3** 个元数据服务进程 metad、**3+** 个存储服务进程 storaged、**3+** 个查询引擎服务进程 graphd，meted、storaged、graphd 进程不用独占机器。

举个例子，假如现有一个由 5 台机器组成的集群：A、B、C、D、E，可以如下部署：

- A：metad, storaged, graphd
- B：metad, storaged, graphd
- C：metad, storaged, graphd
- D：storaged, graphd
- E：storaged, graphd

部署的时候，同一个集群不要跨机房部署。顺便说下，metad 进程会创建一份元数据存储副本，通常只需 3 个 meted 进程，storaged 进程数量不影响图空间数据的副本数量。

再来说下服务器配置，标准配置）以 AWS EC2 c5d.12xlarge 为例：

- 处理器：48 core
- 内存：96 GB
- 存储：2 * 900 GB, NVMe SSD
- Linux 内核：3.9 或更高版本，通过命令 `uname -r`  查看
- glibc：2.12 或更高版本，通过命令 `ldd --version`  查看

## 推荐阅读

- [Task Manager 的设计简述](https://nebula-graph.com.cn/posts/task-management-design-in-nebula-graph/)
  - 推荐理由：对长耗时的任务怎么进行管理与调度才能提升数据库性能？这些调度策略有哪些权衡与取舍呢？本文将着重讲述如何对长耗时的 Task 进行管理与调度进一步提升数据库性能。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 21 周看点--Nebula Graph 中的管道](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-22/)
  - [Pick of the Week'20 | 第 20 周看点--长耗时任务管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-15/)
  - [Pick of the Week'20 | 第 19 周看点--数据库的角色管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-08/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)<br />

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《有内环的螺旋星系》

![Nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2022Nebula.jpeg)

星系M95，一个大又美丽的棒旋星系。在上面这幅整合哈伯与数部地面望远镜数据的影像里，可见到蔓延的螺旋臂、上头由明亮泛蓝恒星聚成的疏散星团、黝黑的尘埃带、数十亿暗星发出的弥漫辉光、以及横贯星系核心的短短核心棒。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
