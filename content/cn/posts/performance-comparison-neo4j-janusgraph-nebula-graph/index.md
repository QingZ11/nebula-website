---
title: "图数据库对比：Neo4j vs Nebula Graph vs HugeGraph"
date: 2020-08-26
description: "本文中，腾讯安全团队挑选了几款业界较为流行的开源图数据库与 Nebula Graph 进行了多角度的对比。"
author: "腾讯云安全团队"
tags: ["用户实践","社区"]
---

![性能测试对比](https://www-cdn.nebula-graph.com.cn/nebula-blog/performance-comparison.png)

> 本文系腾讯云安全团队李航宇、邓昶博撰写

图数据库在挖掘黑灰团伙以及建立安全知识图谱等安全领域有着天然的优势。为了能更好的服务业务，选择一款高效并且贴合业务发展的图数据库就变得尤为关键。本文挑选了几款业界较为流行的开源图数据库与 [Nebula Graph](https://github.com/vesoft-inc/nebula) 进行了多角度的对比。

## 图数据库介绍

### Neo4j

[Neo4j](https://neo4j.com/) 是目前业界广泛使用的图数据库，包含社区版本和商用版本，本文中使用社区版本。

### HugeGraph

[HugeGraph](https://github.com/hugegraph/hugegraph) 是百度基于 [JanusGraph](https://janusgraph.org/) 改进而来的分布式图数据库，主要应用场景是解决百度安全事业部所面对的反欺诈、威胁情报、黑产打击等业务的图数据存储和图建模分析需求。具有良好的读写性能。

### Nebula Graph

[Nebula Graph](https://github.com/vesoft-inc/nebula) 是一款开源的分布式图数据库，采用 shared-nothing 分布式架构，擅长处理千亿节点万亿条边的超大规模数据集，从而更好地服务企业级应用。

## 测试硬件环境

![硬件测试环境](https://www-cdn.nebula-graph.com.cn/nebula-blog/hardware-environments.png)

## 性能对比

我们使用不同量级的图从入库时间，一度好友查询，二度好友查询，共同好友查询几个方面进行了对比，结果如下：

![测试结果](https://www-cdn.nebula-graph.com.cn/nebula-blog/test-results.jpeg)

可以看到在导入性能上，数据量小的时候 Nebula Graph 的导入效率稍慢于 Neo4j，但在大数据量的时候Nebula Graph 的导入明显优于其他两款图数据库；在 3 种查询场景下， Nebula Graph 的效率都明显高于 Neo4j，与 HugeGraph 相比也有一定的优势。

## 查询语言对比

![查询语言对比](https://www-cdn.nebula-graph.com.cn/nebula-blog/query-language-comparsion.jpeg)

从查询语句的角度出发，Gremlin 比较复杂，nGQL 和 Cypher 比较简练，从可读性角度出发，nGQL 比较类 SQL 化，比较符合大家的使用习惯。

## 可视化对比

![查询语言对比](https://www-cdn.nebula-graph.com.cn/nebula-blog/visualization-comparsion.png)

在可视化方面，所有的平台都还只处于可用状态，Nebula Graph 的选择性扩展在团伙挖掘中是一个加分项，但是在二度结果展示流畅度，展示结果自定义展示方面还有优化空间。

在比较了多款业内主要使用的开源数据库后，我们从性能，学习成本和与业务的贴合程度多个角度考虑，最终选择了性能出众，上手简单，能大幅提高业务效率的 Nebula Graph 图数据库。

**本文首发于** [Nebula Graph 论坛](https://discuss.nebula-graph.com.cn/)，**阅读本文的你有任何疑问，欢迎前往论坛和作者进行讨论，原帖传送门**：[https://discuss.nebula-graph.com.cn/t/topic/1013](https://discuss.nebula-graph.com.cn/t/topic/1013) 