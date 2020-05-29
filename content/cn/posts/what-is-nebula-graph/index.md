---
title: "图数据库 Nebula Graph 是什么"
date: 2020-05-12
description: "图数据库 Nebula Graph 是什么？本文将带你了解它的特性和功能，并提前揭秘部分 Nebula Graph 1.0 功能"
tags: ["产品讲解"]
author: Nebula
---

![nebula-graph](https://www-cdn.nebula-graph.com.cn/nebula-blog/Nebula01.jpeg)

图数据库（英语：Graph Database）是一个使用图结构进行语义查询的数据库。该系统的关键概念是图，形式上是点 (Node 或者 Vertex) 和边 (Edge 或者 Relationship) 的集合。一个顶点代表一个实体，比如，某个人，边则表示两个实体间的关联关系，比如 “你关注 Nebula Graph”的关注关系。图广泛存在于现实世界中，从社交网络到风控场景、从知识图谱到智能推荐。

## Nebula Graph 是什么

Nebula Graph 是一款开源的分布式图数据库，擅长处理千亿个顶点和万亿条边的超大规模数据集。提供高吞吐量、低延时的读写能力，内置 ACL 机制和用户鉴权，为用户提供安全的数据库访问方式。

作为一款高性能高可靠的图数据库，Nebula Graph 提供了线性扩容的能力，支持快照方式实现数据恢复功能。在查询语言方面，开发团队完全自研开发查询语言——nGQL，并且后续会兼容 OpenCypher 接口，让 Neo4j 的用户可无缝衔接使用 Nebula Graph。

## Nebula Graph 特性


- **开源**：Nebula Graph 代码开源，采用 Apache 2.0 License，用户可以从 GitHub 下载源码自己编译，部署。欢迎提交 pr，成为 Contributor。
- **可扩展性**：存储计算相分离的架构，当存储空间或计算资源不足时，支持对两者独立进行扩容，避免了传统架构需要同时扩容导致的经济效率低问题。云计算场景下，能实现真正的弹性计算。提供线性扩展的能力。
- **高可用**：全对称分布式集群，无单点故障。并且支持多种类型快照方式实现数据恢复，保证在局部失败的情况下服务的高可用性。
- **HTAP**: 支持 OLTP 实时查询的同时提供了 OLAP 的接口，真正在同一份数据上提供实时在线更新的前提下，也提供复杂分析和挖掘的能力。
- **安全性**：内置授权登录与 ACL 机制，提供用户安全的数据库访问方式，也可接入 LDAP 认证。
- **类 SQL 查询语言 nGQL**：类 SQL 的风格减少了程序员迁移的成本，同时具有表达能力强的优点。

## Nebula Graph 架构

![architecture](https://www-cdn.nebula-graph.com.cn/nebula-blog/Nebula02.png)


## Nebula Graph 1.0 功能

### 基础功能

- **多图空间**：支持多图空间，不同的图空间的数据物理隔离，并且可设置不同的副本数，以应对不同的可用性要求。
- **顶点**：支持基本增删改查操作，支持多种顶点类型，也支持同一顶点有多种类型。
- **边**：支持基本增删改查操作，支持有向图，支持节点间存在同一种类型或者不同类型的多条边。
- **Schema**：Tag / EdgeType 支持多种数据类型，支持对属性设置默认值。一个点可以设置多个 Tag。
- **聚合操作**：聚合函数 GROUP BY、排序函数 ORDER BY、限定函数 LIMIT 自由组合返回所需数据。
- **组合查询**：UNION，UNION DISTINCT，INTERSECT，MINUS 对数据集进行组合查询。
- **条件查询/更新**：IF...RETURN 和 UPDATE ... WHEN 根据指定条件查询/更新数据。
- **Partition**: 支持查看数据分片信息，以及 Partition 对应的 leader 信息。
- **顶点 ID 策略**：支持用户自定义 int64 ID, 内置 hash() 和 uuid() 函数生成顶点 ID。
- **索引**：支持索引、联合索引，对已建立索引的数据，按条件查找快速查找数据。
- **管道查询**: 管道符前面查询语句的输出可作为管道符后面命令的输入。
- **用户定义变量**：用户自定义变量可暂时将查询结果存储在自定义的变量中，并在随后查询语句中使用。
- **多种字符集**、**字符编码**

### 高级功能

- **权限管理**: 支持用户权限认证，支持用户角色访问控制。可轻松对接现有用户认证系统。 Nebula Graph 提供五种角色权限：GOD、ADMIN、DBA、USER 和 GUEST。
- **稠密点**：对于超级顶点支持蓄水池采样, 在只遍历一遍数据（O(N)）的情况下，随机的抽取k个元素。
- **集群快照**：支持以集群维度创建快照，提供在线的数据备份功能，快速恢复。
- **TTL**：支持设置数据的有效期，快速清理过期数据释放资源。
- **Job Manager**：Job 管理调度工具，目前支持 Compaction / Flush 操作。
- **支持在线扩缩容以及负载均衡**
- **图算法**：支持全路径 / 最短路径算法。
- **提供 OLAP 接口，对接图计算平台**。
- **监控接口**：支持系统状态监控、API 访问时间监控、性能数据监控等操作。

### 客户端

- [Java 客户端](https://github.com/vesoft-inc/nebula-java)：可自行编译或者从 mvn 仓库进行下载。
- [Python 客户端](https://github.com/vesoft-inc/nebula-python)：可通过源码安装或者 pip 进行安装。
- [Go 客户端](https://github.com/vesoft-inc/nebula-go)：可通过 `go get -u -v github.com/vesoft-inc/nebula-go` 安装使用。

### 周边工具

- **Nebula Graph Studio**：基于 Web 的可视化环境，提供图操作界面、图数据展示与分析。见 [Nebula Graph Studio](https://github.com/vesoft-inc/nebula-web-docker)
- **导入工具**
  - Nebula Importer，提供高性能的 CSV 文件导入工具，支持导入本地和远程文件。见 [Nebula-Importer](https://github.com/vesoft-inc/nebula-importer)
  - Spark Writer 基于 Spark 的分布式数据导入工具。见[ Spark Writer](https://github.com/vesoft-inc/nebula/blob/master/docs/manual-CN/3.build-develop-and-administration/3.deploy-and-administrations/server-administration/storage-service-administration/data-import/spark-writer.md)
- **导出工具**
  - Dump Tool，单机离线数据导出工具，可以用于导出或统计指定条件的数据。
- **第三方支持**
  - 对接 Prometheus 系统以及 Grafana 可视化组件，支持 Ansible 和 Kubernetes 部署，可实时监控集群的状态。


Nebula Graph 一个开源的分布式图数据库，如果你在使用过程中遇到问题，你可以在论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 和 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 得到帮助 :)