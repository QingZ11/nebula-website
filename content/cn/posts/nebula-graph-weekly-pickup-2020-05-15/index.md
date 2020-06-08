---
title: "Pick of the Week'20 | 第 20 周看点--长耗时任务管理"
date: 2020-05-15
description: "在本期 Pick of the Week 中你将了解到 Nebula Graph 长耗时任务的管理方法，及导入数据集对硬件的配置建议。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

这是 2020 年第 20 个工作周的周五 🌝 来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [长耗时任务管理](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/5.storage-service-administration/job-manager/)

Job Manager 可管理作用于存储层上的长任务，如 compact 和 flush 等。Job Manager 具备按队列执行、暂停作业、恢复作业和查看作业状态的功能。通过查询作业状态，可以按需启停作业能有效的提升作业效率、避免业务高峰时大型作业的资源占用，统计过往作业信息从而帮助用户更合理的进行 storage 的相关操作。

```sql
# 发布任务
# 发布 compact 任务
nebula> SUBMIT JOB COMPACT;
==============
| New Job Id |
==============
| 40         |
--------------

# 发布 flush 任务
nebula> SUBMIT JOB FLUSH;               
==============
| New Job Id |
==============
| 2          |
-------------- 
```
如果遇到不能顺利发布任务的情况，请检查 storage 的 HTTP 服务是否可达 `curl "http://{storaged-ip}:12000/admin?space={test}&op=compact"` 
```sql
# 管理任务
# 查看所有任务信息
nebula> SHOW JOBS;
=============================================================================
| Job Id | Command       | Status   | Start Time        | Stop Time         |
=============================================================================
| 22     | flush test2   | failed   | 12/06/19 14:46:22 | 12/06/19 14:46:22 |
-----------------------------------------------------------------------------
| 23     | compact test2 | stopped  | 12/06/19 15:07:09 | 12/06/19 15:07:33 |
-----------------------------------------------------------------------------
| 24     | compact test2 | stopped  | 12/06/19 15:07:11 | 12/06/19 15:07:20 |
-----------------------------------------------------------------------------
| 25     | compact test2 | stopped  | 12/06/19 15:07:13 | 12/06/19 15:07:24 |
-----------------------------------------------------------------------------
```

```sql
# 查看单个任务信息
nebula> SHOW JOB 40;
=====================================================================================
| Job Id(TaskId) | Command(Dest) | Status   | Start Time        | Stop Time         |
=====================================================================================
| 40             | flush nba     | finished | 12/17/19 17:21:30 | 12/17/19 17:21:30 |
-------------------------------------------------------------------------------------
| 40-0           | 192.168.8.5   | finished | 12/17/19 17:21:30 | 12/17/19 17:21:30 |
-------------------------------------------------------------------------------------
```

```sql
# 停止某个任务
nebula> STOP JOB 22;
=========================
| STOP Result         |
=========================
| stop 1 jobs 2 tasks |
-------------------------
```


```sql
# 重新执行失败的作业：
nebula> RECOVER JOB;
=====================
| Recovered job num |
=====================
| 5 job recovered   |
---------------------
```

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【对数据集的硬件建议配置】，由社区用户 zzl22100048 提出，Nebula Graph 官方解答。

> zzl22100048 提问：使用 Nebula Graph 部署 10 亿节点，100 亿边需要用什么配置？（假设点和边的属性长度 1KB）

**Nebula**：

1. 参考文档 [https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/3.configurations/0.system-requirement/](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/3.configurations/0.system-requirement/)
1. 先说结论：硬盘方面，全集群硬盘建议 128TB，最小为 64TB。日常占用预计为 32 ~ 64TB。内存方面，整个集群总内存需求建议为 256GB，最小为 128GB。

具体计算方法：

- **硬盘方面**
  - 点的数据量: 10 亿个点，每个点的属性为 1KB，需要 1TB 存储数据空间；
  - 边的数据量:  100 亿条边，每条边的属性为 1KB，需要 10TB 存储数据空间。 如果需要反向查询性能，则会在插入的时候正反向都带属性插入，那就是 20TB（根据性能需求选择配置）；
  - 副本数量为 3 ：每副本需要的硬盘空间为 11TB ~ 21TB *3；
  - 其他，包括 RocksDB 自身的存储放大和 wal 文件。因此预留 buffer 50%；
  - 这里没有考虑压缩；
- **CPU 配置方面**
  - 目前 query engine 是会将所在机器的所有线程使用上，storage 用的 cpu 数最大是 16 个， 参数是 `num_io_threads` ， 每个线程的 work 数为 `num_worker_threads` 
- **内存方面**
  - storage
    - RocksDB：一个 RocksDB 实例需要 1.25 GB（一个 RocksDB 实例 rocksdb_block_cache 为 1GB，write_buffer_size 256 MB）。如果使用多个硬盘，每个硬盘是个 RocksDB 实例，所以（全集群的）硬盘数 * 1.25GB；
    - bloomfilter：默认需要 bloomfilter，按照每个 Key 2.5 字节估算 210 亿个 Key 需要 52GB;
    - vertex cache（ vertex_cache_num ）： 缓存节点属性，这里缓存 16GB。
    - wal_buffer_size：每个 partition 要 16MB，再乘以 partition 数量 3*100，为 4.8GB；
    所以一个集群最少需要 70GB，加上程序运行需要的其他内存，用户根据自己的业务应用进行预留，保守估计 128GB，建议 256GB。（可关闭 bloomfilter， vertex_cache 等以减少内存使用）

  - graph：根据业务配置，假如会查询大量的数据，需要配置大点的内存

最后，1KB 的属性已经略微有些长了，特别是 100 亿条边通常不会每个都有那么长的属性字段。

## 推荐阅读

- [图数据库 Nebula Graph 是什么](https://nebula-graph.com.cn/posts/what-is-nebula-graph/)
  - 推荐理由：图数据库 Nebula Graph 是什么？本文将带你了解它的特性和功能，并提前揭秘部分 Nebula Graph 1.0 功能。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 19 周看点--数据库的角色管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-08/)
  - [Pick of the Week'20 | 第 17 周看点--字符比较运算符 CONTAINS](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-24/)
  - [Pick of the Week'20 | 第 16 周看点--中文论坛上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-17/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《苍白的螺旋星系 NGC 492》

![nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/2020Nebula.jpeg)

壮丽的星系 NGC 4921，因其低恒星产生速率和低表面亮度，被戏称是贫血苍白的星系。在上面这张主题影像里，从中心往外看，依序有可见到星系明亮的核心、明亮的核心棒、鲜明的暗尘埃环、数团刚诞生的蓝色恒星、数个小型伴星系、不相干宇宙深处的星系、与及位在我们银河系内的前景恒星。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
