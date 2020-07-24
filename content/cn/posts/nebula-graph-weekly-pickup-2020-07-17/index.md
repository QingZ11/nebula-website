---
title: "Pick of the Week'20 | 第 29 周看点-- nGQL vs SQL"
date: 2020-07-17
description: "在本周看点中你将了解到长任务管理工具 Job Manager 的使用方法，及社区小伙伴关系的 LOOKUP 查询提速问题。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 29 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [nGQL vs SQL 发布](https://docs.nebula-graph.io/manual-EN/5.appendix/sql-ngql/)

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202901.png)

该文档能速度帮你从 SQL 过渡到 nGQL，了解到 nGQL 的用法。

## 特性讲解

- [Job Manager 长任务管理](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/5.storage-service-administration/job-manager/)

Nebula Graph 中存在一些存储层上的长耗时任务，对于这样的操作，我们提供了管理工具——Job Manager 用于长耗时任务的发布、管理、查询。

任务发布方面，目前我们提供了 Compact 和 Flush 操作。Compact 通常用于从存储层清除已被标记为删除的数据，Flush 则是用来将内存中的memfile回写至硬盘中。

发布 `RocksDB compact` 任务可使用命令 `SUBMIT JOB COMPACT;` 

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202902.png)

发布将 RocksDB memfile 回写到硬盘的任务可用命令 `SUBMIT JOB FLUSH;` 

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202903.png)

在任务查询方面，我们提供了全部任务查询和任务详情查询两种操作。

全部任务查询使用 `SHOW JOBS` ，可以看到所有的 Job ID

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202904.png)

如上图所示，在任务列表中可以看到 Job ID、Task ID 和命令及落地节点等信息。


得到 Job 具体 ID 信息后可使用 `SHOW JOB <JOB ID>` 进行详情查询，在任务详情中，可以获得该任务的 Task ID。通常一个任务视 storaged 服务的节点数量产生对应数量的 Task ID。

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202905.png)

可使用 `STOP JOB <JOB ID>;`  暂停正在进行的某个任务

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202906.png)

也可以使用 `RECOVER JOB;` 恢复已暂停的所有任务

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202907.png)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【提高 lookup 查询速度】，由社区用户 Horizon提出，Nebula Graph 官方解答。

> Horizon 提问：lookup 查询返回慢，有什么优化策略？

**Nebula**：查询速度慢可能和建立索引后，当前的索引数据不是有序有关。索引的优势是在有序数据中进行匹配查询或范围查询，所以无序的数据会导致索引扫描效率降低。当导入大量数据后，建议做一个 compact 用以保证数据有序，这样的话查询效率会提升。

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 28 周看点--运行配置超全解析](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-10/)
   - [Pick of the Week'20 | 第 27 周看点--DB-Engine 7 月榜发布](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-03/)

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《吹出超级星系风的星系》

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2029Nebula.jpeg)

距离超过 1 千 2 百万光年远的雪茄星系，是红外光波段天空最明亮的星系。透过光学小望远镜，就能在北天的大熊座方向见到它。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official


![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
