---
title: "Pick of the Week'20 | 第 25 周看点--1.0 基准测试报告出炉"
date: 2020-06-19
description: "在本文中你将看到 1.0 GA 的性能报告、索引的实践，以及恢复快照数据的方法。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 25 个工作周的周五，准备好下周端午回家的票了吗 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件 

- [Nebula Graph 1.0 基准测试发布](https://discuss.nebula-graph.com.cn/t/topic/782/6)

以下为部分性能报告内容，数据源：LDBC Social Network Benchmark Dataset
**1-hop 不返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202501.png)

**2-hop 不返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202502.png)

**3-hop 不返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202503.png)

**1-hop 返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202504.png)

**2-hop 返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202505.png)

**3-hop 返回属性**

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202506.png)

## 特性讲解

- [INDEX 索引功能讲解](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/)

索引是一项常用于加速数据检索速度的功能，Nebula Graph 同样内置了索引功能。不同于关系型数据库以列为单位进行索引，在 Nebula Graph 中对 Tag 和 Edge 下的属性进行索引。
创建索引后写入的数据会自动生成索引信息，若已有数据再创建索引则需要使用 REBUILD 命令对原有数据创建索引。
通常情况下为了为了确保索引的利用率足够高，建议创建单属性索引，相较于符合属性索引使用时更加灵活。在业务场景固定的情况下使用复合索引则有更好的效率。

创建单属性索引
```
(user@nebula) [nba]> CREATE TAG INDEX player_index_0 on player(name);
Execution succeeded (Time spent: 1.00587/1.00693 s)
```

创建复合索引
```
(user@nebula) [nba]> CREATE TAG INDEX player_index_1 on player(name,age);
Execution succeeded (Time spent: 3.085/3.977 ms)
```

列出索引
```
(user@nebula) [nba]> SHOW TAG INDEXES;
=============================
| Index ID | Index Name     |
=============================
| 34       | player_index_0 |
-----------------------------
| 35       | player_index_1 |
-----------------------------
Got 2 rows (Time spent: 868/1704 us)
```

查询索引信息
```
(user@nebula) [nba]> DESCRIBE TAG INDEX player_index_0;
==================
| Field | Type   |
==================
| name  | string |
------------------
Got 1 rows (Time spent: 771/1550 us)
```

删除索引
```
(user@nebula) [nba]> DROP TAG INDEX player_index_1;
Execution succeeded (Time spent: 2.09/2.768 ms)
```

检查一下是否删除
```
(user@nebula) [nba]> SHOW TAG INDEXES;
=============================
| Index ID | Index Name     |
=============================
| 34       | player_index_0 |
-----------------------------
Got 1 rows (Time spent: 575/1279 us)
```

重建索引
```
(user@nebula) [nba]> REBUILD TAG INDEX player_index_0 OFFLINE;
Execution succeeded (Time spent: 3.193/5.055 ms)
```
## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。<br />

本周分享的主题是【恢复快照数据】，由社区用户 caoxiaoyuan7242 提出，Nebula Graph 官方解答。

> caoxiaoyuan7242 提问：请问创建好快照之后，如何在一个新集群里恢复快照数据呢

**Nebula**：创建好快照后，你可以看到快照目录中的文件结构和原始数据目录中的文件结构相同，由此可知，其实可以认为快照就是原始文件的一个备份。如果想要通过所创建的 checkpoint 恢复 nebula 集群，这里有两个建议：
1. 修改原始集群的配置，将 data_path 指向新 checkpoint 的目录；
1. 不改变集群配置，写 shell 脚本，用 checkpoint 的数据替换原始的 data。

如果需要复现集群数据损坏的问题，请保留原始 data。

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 24 周看点--UPSERT 实践](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-06-12/)
   - [Pick of the Week'20 | 第 23 周看点--INSERT 插入语法](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-06-05/)
   - [Pick of the Week'20 | 第 22 周看点--图遍历实践](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-29/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《NGC 4676：老鼠星系》

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2025Nebula.png)

这两个大星系正在把对方撕裂。它们皆拥有长长的尾巴，因此它们合称为「老鼠星系」，此外，这对大螺旋星系很可能都曾穿过对方。编录号为 NGC 4676 的这对星系，位在后发座内，离我们约有 3 亿光年远，而它们可能都是后发座星系团的成员。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
