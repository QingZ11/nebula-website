---
title: "Nebula Graph 1.0 Release Note"
date: 2020-06-10
description: "Nebula Graph 1.0 发布了。作为一款开源分布式图数据库，Nebula Graph 1.0 版本旨在提供一个安全、高可用、高性能、具有强表达能力的查询语言的图数据库。"
tags: ["Release-Note"]
author: Jude
---

![Release note](https://www-cdn.nebula-graph.com.cn/nebula-blog/NebulaGraph1.0.png)

[Nebula Graph 1.0](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0) 发布了。作为一款开源分布式图数据库，Nebula Graph 1.0 版本旨在提供一个安全、高可用、高性能、具有强表达能力的查询语言的图数据库。

## 基本功能

- **DDL & DML**：支持在线的数据定义语言（DDL）及数据操纵语言（DML）。
- **图探索**：支持正/反向、双向图探索，`GO minHops TO maxHops` 获取指定步数区间的关系。
- **聚合操作**：聚合函数 `GROUP BY` 、排序函数 `ORDER BY` 、限定函数 `LIMIT` 自由组合返回所需数据。
- **组合查询**：`UNION`， `UNION DISTINCT` ， `INTERSECT` ， `MINUS` 对数据集进行组合查询。
- **管道操作**: 管道操作符 `|` 前面查询语句的输出可作为管道符后面语句的输入。
- **用户定义变量**：支持将可将查询结果暂时存储在用户自定义的变量中，并在随后查询语句中使用。
- **索引**: 支持索引、联合索引，以及对已存在的数据建立索引。 `LOOKUP ON` 用于对建立索引的属性进行快速查找。

## 高级功能

- **权限管理**: 支持用户权限认证，支持用户角色访问控制。可轻松对接现有用户认证系统。 Nebula Graph 提供五种角色权限： `GOD` 、 `ADMIN` 、 `DBA` 、 `USER`  和 `GUEST` 。
- **采样**：对于超级顶点支持蓄水池采样, 在只遍历一遍数据 `O(n)` 的情况下，随机的抽取 k 个元素。
- **集群快照**：支持以集群维度创建快照，提供在线的数据备份功能，快速恢复。
- **TTL**：支持设置数据的有效期，清理过期数据、释放资源。
- **Job Manager**：Job 管理调度工具，目前支持 `COMPACT` 和 `FLUSH` 操作。
- **运维操作**
   - 支持在线扩缩容、负载均衡
   - `HOSTS` 管理 Storage 服务器
   - `CONFIGS` 管理配置项
- **图算法**：支持全路径 / 最短路径算法。
- **提供 OLAP 接口，对接图计算平台**。
- **支持多种字符集**、**字符编码**。

## 客户端

- Java 客户端：可自行编译或者从 mvn 仓库进行下载。changelog 请参见 [https://github.com/vesoft-inc/nebula-java/releases](https://github.com/vesoft-inc/nebula-java/releases)
- Python 客户端：可通过源码安装或者 pip 进行安装，changelog 请参见 [https://github.com/vesoft-inc/nebula-python/blob/master/CHANGELOG.md](https://github.com/vesoft-inc/nebula-python/blob/master/CHANGELOG.md)
- Golang 客户端，changelog 请参见 [https://github.com/vesoft-inc/nebula-go/releases](https://github.com/vesoft-inc/nebula-go/releases)

## Nebula Graph Studio

基于 Web 的可视化工具，支持图探索、图查询以及数据导入等功能。见 [Nebula Graph Studio](https://github.com/vesoft-inc/nebula-web-docker)

## 周边工具

- **导入工具**
   - Nebula Importer，提供高性能的 CSV 文件导入工具，支持导入本地和远程文件。见 [Nebula-Importer](https://github.com/vesoft-inc/nebula-importer)
   - Spark Writer 基于 Spark 的分布式数据导入工具，目前支持的数据源有 HDFS 和 HIVE 等。见[ Spark Writer](https://github.com/vesoft-inc/nebula/blob/master/docs/manual-CN/3.build-develop-and-administration/3.deploy-and-administrations/server-administration/storage-service-administration/data-import/spark-writer.md)
- **导出工具**
   - Dump Tool，单机离线数据导出工具，可以用于导出或统计指定条件的数据。
- **监控**
   - 对接 Prometheus 系统以及 Grafana 可视化组件，可实时监控集群的状态。

## 升级步骤

RC4 升级 v1.0.0

- 首先停止所有机器的 Nebula 服务
   - 在每一台机器执行  scripts/nebula.service stop all
   - 然后通过执行 scripts/nebula.service status all 来确认进程已经退出
- 在每一台机器（根据系统环境）安装新的 RPM 包
   - 获取 package：[https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0)
   - 安装 package
- 启动 Nebula
   - 所有机器执行 scripts/nebula.service start all
   - 确认进程正常启动 scripts/nebula.service status all



> 注意：如从 RC3 或之前版本升至 v1.0.0，请按照以上步骤升级完后重新导入数据。

本文中如有任何错误或疏漏，欢迎去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) issue 区向我们提 issue 或者前往官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

## 推荐阅读

- [图数据库 Nebula Graph RC4 Release Note](https://nebula-graph.com.cn/posts/nebula-graph-rc4-release-note/)
- [图数据库 Nebula Graph RC3 Release Note](https://nebula-graph.io/cn/posts/nebula-graph-rc3-release-note/)
- [分布式图数据库 Nebula RC2 发布：增强了 CSV Importer 功能](https://nebula-graph.io/cn/posts/nebula-graph-rc2-release-note/)