---
title: "Pick of the Week'20 | 第 28 周看点--运行配置超全解析"
date: 2020-07-10
description: "本期每周看点关键词：超全——超全的 TTL 使用指南及生产、测试环境配置及资源估算方法。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 28 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [Nebula Graph v1.0.1 发布](https://nebula-graph.com.cn/posts/nebula-graph-1.0.1-release-note/)

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202801.png)

### 天降问（hong）卷（bao）

Nebula Graph 正式版上线已经 1 个月啦，这个月你用的舒坦吗？

这是 Nebula Graph 的一份问卷（或扫描下方二维码）：[https://wj.qq.com/s2/6684304/45d1](https://wj.qq.com/s2/6684304/45d1) ，来和我们聊聊你的使用心得吧（问卷完了可能会有天降红包哟~)

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202802.png)

## 特性讲解

- [生命周期](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/TTL/)

在 Nebula 中，我们为需要临时记录的 Tag 或 Edge 提供了 TTL 功能，以便于数据能够被自动的过期删除。

TTL 功能需要指定起始时间（ttl_col）和生命周期（ttl_duration）。起始时间（ttl_col）使用 UNIX timestamp 格式并支持 now 函数调用当前时间，数据类型为 int。如果当前时间大于起始时间与生命周期之和时，就会丢弃此 Tag 或 Edge。

Tips：TTL 功能与索引（Index）功能冲突，对于同一 Tag 或 Edge 仅能使用其中一项。

当某个点拥有多个 Tag 时，TTL 功能仅丢弃具有 TTL 属性的 Tag，此时还能查询到该点下的其他属性。

举个例子

```sql
CREATE TAG tag1(a timestamp) ttl_col = "a", ttl_duration = 5;
CREATE TAG tag2(a string);
INSERT VERTEX tag1(a),tag2(a) values 200:(now(), "hello");
fetch prop on * 200;
```

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202803.png)

5 秒后再次查询时，点 200 的 tag1 消失：

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202804.png)

若点仅拥有一个 TTL 属性的 Tag 时，当发生了 TTL 过期时，则返回空结果。

```sql
fetch prop on * 101;
```

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202805.png)

5 秒后点 101 的 tag1 属性消失，没任何结果：

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202806.png)

可以通过设置 ttl_col 为空或删除此字段删除 Tag 或 Edge 的 TTL 属性。设置 ttl_col 为空，数据不过期：

```sql
ALTER TAG tag1 ttl_col = "";
INSERT VERTEX tag1(a),tag2(a) values 202:(now(), "hello");
fetch prop on * 202;
```

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202807.png)

删除 ttl_col 字段，数据不过期：

```sql
ALTER TAG tag1 DROP (a);
INSERT VERTEX tag1(a),tag2(a) values 203:(now(), "hello");
fetch prop on * 203;
```

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202808.png)

设置 ttl_duration 为 0 时，TTL 功能存在，但所有数据都不过期:

```sql
ALTER TAG tag1 ttl_duration = 0;
INSERT VERTEX tag1(a),tag2(a) values 204:(now(), "hello");
fetch prop on * 204;
```

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202809.png)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【Nebula Graph 的运行配置】，由社区用户 重案组李 sir、景焱提出，Nebula Graph 官方解答。

> 作为使用 Nebula Graph 重要一环，在本期社区问答中我们再次翻了配置这个牌，虽然之前有小伙伴可能了解过相关的文档，我们分为【生产环境】、【测试环境】、【资源估算】三块回复。

**生产环境**

**生产环境部署方式**

- 3 个元数据服务进程 `metad`
- 至少 3 个存储服务进程 `storaged`
- 至少 3 个查询引擎服务进程 `graphd`

以上进程都无需独占机器。例如一个由 5 台机器组成的集群：A、B、C、D、E，可以如下部署：

- A：metad, storaged, graphd
- B：metad, storaged, graphd
- C：metad, storaged, graphd
- D：storaged, graphd
- E：storaged, graphd
> 同一个集群不要跨机房部署。 metad 每个进程都会创建一份元数据的存储副本，因此通常只需 3 个进程。storaged 进程数量不影响图空间数据的副本数量。

**服务器配置要求（标准配置）**

以 AWS EC2 c5d.12xlarge 为例：

- 处理器：48 core
- 内存：96 GB
- 存储：2 * 900 GB, NVMe SSD
- Linux 内核：3.9 或更高版本，通过命令 `uname -r` 查看
- glibc：2.12 或更高版本，通过命令 `ldd --version` 查看

操作系统配置见[这里](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/3.configurations/7.kernel-config/)。

**测试环境**

- 1 个元数据服务进程 `metad`
- 至少 1 个存储服务进程 `storaged`
- 至少 1 个查询引擎服务进程 `graphd`

例如一个有 3 台机器的集群：A、B、C 可以如下部署：

- A：metad、storaged、graphd
- B：storaged、graphd
- C：storaged、graphd

**服务器配置要求（最低配置）**

以 AWS EC2 c5d.xlarge 为例：

- 处理器：4 core
- 内存：8 GB
- 存储：100 GB, SSD

**资源估算（3副本标准配置）**

- 存储空间（全集群）：点和边数量 * 平均属性的字节数 * 6
- 内存（全集群）：点边数量 * 5 字节 + RocksDB 实例数量 * (write_buffer_size * max_write_buffer_number + rocksdb_block_cache), 其中 `etc/nebula-storaged.conf` 文件中 `--data_path` 项中的每个目录对应一个 RocksDB 实例
- 图空间 partition 数量：全集群硬盘数量 * （2 至 10 —— 硬盘越好该值越大）
- 内存和硬盘另预留 20% buffer。

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 27 周看点--DB-Engine 7 月榜发布](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-03/)
   - [Pick of the Week'20 | 第 25 周看点--1.0 基准测试报告出炉](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-06-19/)

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《**木魂星云的外晕**》

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2028Nebula.png)

NGC 3242 的特写影像证实，它是个由垂死类太阳恒星抛出的外层气壳，拥有木魂星云的花俏名号。而在这幅远眺长蛇座方向的银河繁星和背景星系的深空大视野望远镜影像里，这团位在左上角的美丽行星状星云，带着罕见的外晕。距离约 4,500 光年远的 NGC 3242，大小约为 1 光年。在影像右侧散发辉光的稀薄物云，极可能是星际间的气体，恰巧漂到 NGC 3242 的白矮星附近，因此受到它辐射的紫外光之激发。

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
