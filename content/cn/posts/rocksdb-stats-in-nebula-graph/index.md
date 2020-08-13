---
title: "Nebula Graph 特性讲解——RocksDB 统计信息的收集和展示"
date: 2020-08-13
description: "本文主要讲述社区用户 @chenxu14 在 pr#2243 为 Nebula Graph 贡献的 RocksDB 统计信息收集功能的使用方法"
tags: ["特性讲解"]
author: 乔治
---

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/Feature-Explanation-RocksDB.png)

由于 Nebula Graph 的底层存储使用了 RocksDB，出于运维管理需要，我们的社区用户 [@chenxu14](https://github.com/chenxu14) 在 [pr#2243](https://github.com/vesoft-inc/nebula/pull/2243) 为 Nebula Graph 贡献了 RocksDB 统计信息收集的功能 👏💐

通过在 storage 服务配置文件中修改 `--enable_rocksdb_statistics = true`  即可开启收集 RocksDB 统计信息的功能。开启后，将会定期将统计信息转储到每个 DB 服务的日志文件中。

最近，chenxu14 为此功能带来了新的用法——支持通过 storage 服务自带的 Web 接口获取统计信息。此次 pr 提供了 3 种通过 Web 服务获取统计信息的方法：

1. 获取全部统计信息；
1. 获取指定条目的信息；
1. 支持把结果以 json 格式返回。

下面让我们来体验一下这次的新功能吧~

在 storage 的配置文件中修改：`--enable_rocksdb_statistics = true` 以开启收集 RocksDB 统计信息，修改后重启 storage 服务即可生效

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/enable-rocksdb-statistics.png)

访问 [http://storage_ip:port/rocksdb_stats](http://172.28.2.1:12000/rocksdb_stats) 获取 RocksDB 全部统计信息（部分截图展示）

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/rocksdb-information.png)

访问 [http://storage_ip:port/rocksdb_stats?stats=stats_name](http://172.28.2.1:12000/rocksdb_stats?stats=stats_name) 获取部分 RocksDB 统计信息

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/stats-information.png)

在返回部分结果的查询地址基础上添加 & returnjson 获取部分 RocksDB 统计信息并以 json 格式返回

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/return-json-format.png)

至此，本次特性讲解完毕，遇到问题？上 Nebula Graph 论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/)

喜欢这篇文章？来啦，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励呗~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~
