---
title: "Pick of the Week'20 | 第 34 周看点--可视化工具 Studio 发布 v1.1.0-beta"
date: 2020-08-21
description: "在本周看点中，你将了解 Nebula Graph 可视化工具 Studio 的  v1.1.0-beta 新特性，以及社区用户 chenxu14 支持动态配置 RocksDB 的 pr。"
tags: ["社区","产品动态"]
author: "清蒸"
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：本周新进 pr、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 34 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [Nebula Graph 可视化工具 Studio v1.1.0-beta 上线](https://github.com/vesoft-inc/nebula-web-docker)

![图数据库 Nebula Graph LOOKUP](https://www-cdn.nebula-graph.com.cn/nebula-blog/Lookup.gif)

本次 Studio v1.1.0-beta 主要新增功能：支持 `LOOKUP` ，此外还有以下更新

- 图探索
   - 支持使用索引查询点
   - 支持先对 VID 进行预处理，再执行查询
- 控制台
   - 支持将点查询结果导入图探索画板
- bug fix
   - 修复节点布尔类型属性返回值显示问题

欢迎阅读本文的你来试用 Studio，试用传送门：[https://github.com/vesoft-inc/nebula-web-docker](https://github.com/vesoft-inc/nebula-web-docker) 有啥建议反馈麻烦多多提 issue 🙇‍♀️🙇‍♂️ 

## 本周新进 pr

本周 Nebula Graph 主要有这些产品动态和新合并的 pr：

- 当 query 语句执行部分成功时，显示 warning 信息告知用户执行并未完全成功，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2290](https://github.com/vesoft-inc/nebula/pull/2290)
- 增加可动态配置 RocksDB 的配置项，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2291](https://github.com/vesoft-inc/nebula/pull/2291) **本 pr 由社区用户 **[@chenxu14](https://github.com/chenxu14)** 贡献** 💐 👏
- 修复了在某些情况下，无法在同一节点启动多个服务的问题，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2289](https://github.com/vesoft-inc/nebula/pull/2289)
- 完善 snapshot 逻辑，避免了不必要的 snapshot 创建，提高了性能，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2287](https://github.com/vesoft-inc/nebula/pull/2287)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【UUID】，温故而知新，本次问题由社区用户 didi 提出，Nebula Graph 官方解答。

> didi 提问：请问 Nebule Graph UUID 函数内部用什么算法保证生成的 ID 全局唯一呢?

**Nebula**：UUID 有两部分组成，前 32 位使用 MurmurHash 函数，后 32 位使用时间戳。具体实现见[代码](https://github.com/vesoft-inc/nebula/blob/master/src/storage/query/GetUUIDProcessor.h#L39-L42)

> 追问：分布式环境下，同一时间戳，使用 MurmurHash 函数返回一致性 hash 值相同，不会重复吗？

**Nebula**：现在执行流程如下所述：

graphd 这边首先将用户传入的字符串计算一个临时的哈希值，然后将该值取余后去对应的 partition 上请求真实的 uuid 的计算，因为 storaged 这边所有的读写请求都是走的 leader，所以即便有不同字符串 hash 值冲突，在 storaged 这里也会将其排队，按照先后顺序（时间不同）生成对应的 uuid，进而保证了全局唯一。

这里有个取巧的地方是因为前 32 位都是用的同一个 murmur hash 函数，所以最终生成的 vid 和上述的临时哈希值取余后会落到同一个 partition 上。

## 推荐阅读

- [用 NetworkX + Gephi + Nebula Graph 分析<权力的游戏>人物关系（上篇）](https://nebula-graph.com.cn/posts/game-of-thrones-relationship-networkx-gephi-nebula-graph/)
   - 推荐理由：本文介绍如何通过 NetworkX 访问开源的分布式图数据库 Nebula Graph，并借助可视化工具—— Gephi 来可视化分析《权力的游戏》中的复杂的人物图谱关系。
- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 33 周看点--多方图数据库测试性能发布](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-14/)
   - [Pick of the Week'20 | 第 32 周看点--多个 pr 提高 Nebula Graph性能和稳定性](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-07/)
   - [Pick of the Week'20 | 第 31 周看点--图遍历支持 int 类型传入查询](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-31/)

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
