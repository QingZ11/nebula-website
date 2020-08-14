---
title: "Pick of the Week'20 | 第 32 周看点--多个 pr 提高 Nebula Graph性能和稳定性"
date: 2020-08-14
description: "在本周大事件中你将了解到 Nebula Graph 和其他图数据库的性能测试对比，此外在 Go 查询方面研发人员提升了查询性能"
tags: ["社区","产品动态"]
author: "清蒸"
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：本周新进 pr、社区问答、推荐阅读，和随机模块：本周大事件构成。


即将送走的是 2020 年第 33 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [Neo4j、Hugegraph、Nebula Graph 多方图数据库测试性能发布](https://discuss.nebula-graph.com.cn/t/topic/1013)

![图数据库测试结果](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203301.png)

测试结果由腾讯云安全团队提供，具体的测试机器、测试结果图可以上 Nebula Graph 论坛查看帖子：[https://discuss.nebula-graph.com.cn/t/topic/1013](https://discuss.nebula-graph.com.cn/t/topic/1013)

## 本周新进 pr

本周 Nebula Graph 主要有这些产品动态和新合并的 pr：

- 优化 `GO` 查询，通过提前分配内存、减少字符串拷贝等方式提高 `GO` 查询性能 [https://github.com/vesoft-inc/nebula/pull/2268](https://github.com/vesoft-inc/nebula/pull/2268) **本 pr 由社区用户** **[@xuguruogu](https://github.com/xuguruogu) 贡献** 💐 👏
- 修复了 meta，storage 或 graph 再次 start 影响服务日志输出的问题 [https://github.com/vesoft-inc/nebula/pull/2289](https://github.com/vesoft-inc/nebula/pull/2289) [https://github.com/vesoft-inc/nebula/pull/2278](https://github.com/vesoft-inc/nebula/pull/2278)
- 修复了 `replica_factor`  为 1 时，租期有效性判断的问题 [https://github.com/vesoft-inc/nebula/pull/2276](https://github.com/vesoft-inc/nebula/pull/2276)
- 修复了 JNI 编译的问题 [https://github.com/vesoft-inc/nebula/pull/2271](https://github.com/vesoft-inc/nebula/pull/2271)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【升级版本问题】，温故而知新，本次问题由社区用户 alex 提出，Nebula Graph 官方解答。

> alex 提问：Execution succeeded (Time spent: 24.7027/24.7033 s) 这个 spent 是什么意思

**Nebula**：Time spent 中前一个数字 24.7027 为数据库本身所花费的时间，即 query engine 从 console 收到这条查询语句，到存储拿到数据，并进行一系列计算所花的时间；后一个数字 24.7033 是从客户端角度看花费的时间，即 console 从发送请求，到收到响应，并将结果输出到屏幕的时间。

## 推荐阅读

- [Nebula Graph 特性讲解——RocksDB 统计信息的收集和展示](https://nebula-graph.com.cn/posts/rocksdb-stats-in-nebula-graph/)
   - 推荐理由：本文主要讲述社区用户 @chenxu14 在 pr#2243 为 Nebula Graph 贡献的 RocksDB 统计信息收集功能的使用方法
- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 32 周看点--多个 pr 提高 Nebula Graph性能和稳定性](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-07/)
   - [Pick of the Week'20 | 第 31 周看点--图遍历支持 int 类型传入查询](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-31/)
   - [Pick of the Week'20 | 第 30 周看点--属性查询迎来新功能](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-24/)

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
