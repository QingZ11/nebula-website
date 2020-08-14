---
title: "Pick of the Week'20 | 第 32 周看点--多个 pr 提高 Nebula Graph性能和稳定性"
date: 2020-08-07
description: "本周新进 pr 基本上提高性能和稳定性，也有 FETCH PROP ON 的新特性，在问答方面，你将了解到如何进行 Nebula Graph 的版本升级"
tags: ["社区","产品动态"]
author: "清蒸"
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 32 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [DB-Engine 八月排名上线](https://db-engines.com/en/ranking/graph+dbms)

![八月 DB-Engine 排名](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203201.png)

可以看到 Top10 变化不大，Nebula Graph 在八月排名中也是稳步前进，上升了一名 👏

## 产品动态

本周 Nebula Graph 主要有这些产品动态：

- `FETCH PROP ON` 支持获取多个点的多个 tags 的属性值，支持管道的输出作为 `FETCH PROP ON` 的输入， `FETCH PROP ON *` 支持获取多个点的属性，具体 pr 参见：[https://github.com/vesoft-inc/nebula/pull/2222](https://github.com/vesoft-inc/nebula/pull/2222)  [https://github.com/vesoft-inc/nebula-docs/pull/117](https://github.com/vesoft-inc/nebula-docs/pull/117)
- 支持 Webservice 获取 RocksDB 统计信息，具体 pr 参见：[https://github.com/vesoft-inc/nebula/pull/2262](https://github.com/vesoft-inc/nebula/pull/2262)
- 删除 `FunctionManager` 中的锁，提高了多线程频繁调用函数时的性能，具体 pr 参见：[https://github.com/vesoft-inc/nebula/pull/2273](https://github.com/vesoft-inc/nebula/pull/2273)
- 修复在 Balance 数据过程中可能出现的 Leader 选举失败的问题，具体 pr 参见：[https://github.com/vesoft-inc/nebula/pull/2232](https://github.com/vesoft-inc/nebula/pull/2232)
- 重构了 `VertexHolder::getDefaultProp` ，提高了获取属性默认值的性能，具体 pr 参见：[https://github.com/vesoft-inc/nebula/pull/2249](https://github.com/vesoft-inc/nebula/pull/2249)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【升级版本问题】，由社区用户 datian9966 提出，Nebula Graph 官方解答。

> datian9966 提问：因为 nebula 处于快速发展期，所以偶尔会有一些 bug 修复，所以想麻烦问一下 nebula 集群如何正确的进行升级，有哪些需要注意的点，比如要保留什么之类的？
> 我现在是通过 rpm 包安装的，可否有一个专门的文档介绍一下嘛？谢谢！

**Nebula**：你是通过 rpm 安装的，那么升级的时候，首先需要确定升级的版本数据是否兼容的（比较旧的版本升到最新版本可能数据不兼，需要重新导数据），版本 release 的时候有说明。兼容的前提下做以下操作：
- 第一步：先停止服务
- 第二步：卸载之前安装的 rpm 包
- 第三步：安装新的 rpm 包
- 第四步：确认版本说明是否有更新配置，有更新的话需要更新配置文件然后启动服务；不需要的话，直接启动服务即可升级完成。

## 推荐阅读

- [新手阅读 Nebula Graph 源码的姿势](https://nebula-graph.com.cn/posts/how-to-read-nebula-graph-source-code/)
   - 推荐理由：在本文中，我们将通过数据流快速学习 Nebula Graph，以用户在客户端输入一条 nGQL 语句 SHOW SPACES 为例，使用 GDB 追踪语句输入时 Nebula Graph 是怎么调用和运行的。
- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 31 周看点--图遍历支持 int 类型传入查询](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-31/)
   - [Pick of the Week'20 | 第 30 周看点--属性查询迎来新功能](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-24/)
   - [Pick of the Week'20 | 第 29 周看点-- nGQL vs SQL](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-17/)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《M16 特写》

![星云](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2032Nebula.jpeg)

包裹在尘埃与辉光云气胎衣云内的 M16，又名为老鹰星云，是个年龄约 2 百万年的年轻星团。从影像中左方的明亮云气脊伸出的一根恒星诞生尘埃柱，则拥有老鹰星云仙女之令名。位在长蛇座星云群集尾部区的 M16，距离我们约 7,000 光年远，是用双筒或小望远镜即轻易可见的天体。

影像提供与版权 : Ignacio Diaz Bobillo
作者与编辑： Robert Nemiroff ( MTU ) & Jerry Bonnell ( UMCP )

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
