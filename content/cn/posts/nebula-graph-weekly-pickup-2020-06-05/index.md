---
title: "Pick of the Week'20 | 第 23 周看点--INSERT 插入语法"
date: 2020-06-05
description: "6 月 DB-Engine 排行榜发布，在特性讲解部分将为你详解 INSERT 用法…"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 23 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [INSERT - 插入语法介绍](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/insert-vertex-syntax/)

该语句是 Nebula Graph 中重要的基础功能，用于数据条目的创建。insert 语句支持插入 vertex 或 edge，在完成 schema 的创建后，即可以使用 insert 的语句来插入数据。insert 语句支持通过列表的方式批量插入数据，对同一点或边多次执行插入操作时，最终结果以最后一次成功执行的语句为准。Nebula Graph 允许插入空内容，但插入语句错误时，则不会写入数据。

插入点示例：
```bash
# 插入 1 个空属性点 
nebula> INSERT VERTEX t1 () VALUES 10:();

(user@nebula) [test]> fetch prop on * 10;
============
| VertexID |
============
| 10       |
------------
Got 1 rows (Time spent: 995/1678 us)

# 插入 2 个点
nebula> INSERT VERTEX t2 (name, age) VALUES 13:("n3", 12), 14:("n4", 8);

(user@nebula) [test]> fetch prop on t2 13,14;
===============================
| VertexID | t2.name | t2.age |
===============================
| 13       | n3      | 12     |
-------------------------------
| 14       | n4      | 8      |
-------------------------------
Got 2 rows (Time spent: 874/1507 us)

# 插入有 2 个 tag 的点
nebula> INSERT VERTEX t1 (i1), t2(s2) VALUES 21: (321, "hello”);

(user@nebula) [test]> fetch prop on * 21;
============================
| VertexID | t1.i1 | t2.s2 |
============================
| 21       | 321   | hello |
----------------------------
Got 1 rows (Time spent: 820/1489 us)
```

插入边示例：
```bash
# 插入 1 条空属性边：
(user@nebula) [test]> CREATE EDGE e1 ();
Execution succeeded (Time spent: 16.544/17.903 ms)

(user@nebula) [test]> INSERT EDGE e1() VALUES 10->11:()
Execution succeeded (Time spent: 1.434/2.161 ms)

(user@nebula) [test]> fetch prop on e1 10->11;
================================
| e1._src | e1._dst | e1._rank |
================================
| 10      | 11      | 0        |
--------------------------------
Got 1 rows (Time spent: 9.65/11.269 ms)

# 插入 2 条边： 
nebula> INSERT EDGE e2 (name, age) VALUES 12->13:("n1", 1), 13->14:("n2", 2);

(user@nebula) [test]> fetch prop on e2 12 -> 13,13 -> 14;
===================================================
| e2._src | e2._dst | e2._rank | e2.name | e2.age |
===================================================
| 13      | 14      | 0        | n2      | 2      |
---------------------------------------------------
| 12      | 13      | 0        | n1      | 1      |
---------------------------------------------------
Got 2 rows (Time spent: 916/1579 us)
```

## 本周大事件

- [DB—Engine 六月排名发榜](https://db-engines.com/en/ranking/graph+dbms)

![DB-Engine](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202301.png)

从排名上来看，排位变化不大，6 月的 Nebula Graph 在分值上有所增加，这和日益活跃的社区分不开。如果你在使用 Nebula Graph 过程中遇到任何问题，欢迎来论坛和我们讨论，论坛传送门：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/)

## 社区问答
Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【GO N STEPS】，由社区用户 xqgzh 提出，Nebula Graph 官方解答。

xqgzh 提问：在官方文档中， 说明 N STEPS 是 N 跳， 但是却没有说明具体是指第 N 跳， 还是从 1-N 的所有跳？所以我参考官方文档写了下面这个语句：
```bash
GO 2 STEPS from 301 OVER friend BIDIRECT YIELD \
    friend._src, friend._dst, friend._type;
```
然后发现返回的结果中，包含了第 1 跳和第 2 跳的所有边（包含正反向），我理解是根据返回的字段，语句内部做了去重处理，由于同时包含了 `_src` 、 ` _dst`、`_type` 三个参数，所以去重的结果就是把所有的边都包含进去了。所以，有个问题比较疑惑，希望官方能够澄清：

- edge 的隐含属性 _type 其实就是 edgeId，如果这个值是正的，表示是正向，如果是负的则表示反向，这样理解正确吗?

**Nebula**：GO N STEPS 返回的是第 N 跳的所有边， GO M TO N STEPS 返回 M-N 跳，可以参考文档：[https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/go-syntax/#m_n](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/go-syntax/#m_n)。回答下问题 1，edge 的隐含属性 `_type` 其实就是 edgetype 的 ID，正值表示出边，负值表示入边，但不适用于 `bidirect` 查询。

## 推荐阅读

- [一文读懂图数据库 Nebula Graph 访问控制实现原理](https://nebula-graph.com.cn/posts/access-control-design-code-nebula-graph/)
   - 推荐理由：数据库权限管理对大家都很熟悉，然而怎么做好数据库权限管理呢？在本文中将详细介绍 Nebula Graph 的用户管理和权限管理。
- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 22 周看点--图遍历实践](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-29/)
   - [Pick of the Week'20 | 第 21 周看点--Nebula Graph 中的管道](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-22/)
   - [Pick of the Week'20 | 第 20 周看点--长耗时任务管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-15/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《猎户座的星际云》

![Nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2023Nebula.png)

猎户座的天体其实远多于腰带三星。因为这个方向的天空，密布着美丽的星云。影像中左方的庞大橙色星云，并非玫瑰星云，而是较大但声名较不显，名为觜宿一环的星云。玫瑰星云其实是那团位在影像下方附近，拥有明亮橙、蓝和白色泽的星云。此外，影像中左下方的橙色亮星是参宿四，影像右上角的泛蓝亮星则是参宿七。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official


![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
