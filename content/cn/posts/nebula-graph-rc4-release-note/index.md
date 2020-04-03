---
title: "图数据库 Nebula Graph RC4 Release Note"
date: 2020-04-02
description: "本次 RC4 上线 INDEX 功能，提供了基于 SPACE 层级的权限管理和 ACL 授权模式。在运维方面，新增 Nebula Stats Exporter 对接基于 Grafana 和 Prometheus 的监控系统…"
tags: ["Release-Note"]
author: Jude
---

![Release note](https://nebula-blog.azureedge.net/nebula-blog/rc4.png)

本次 [RC4](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4) 上线 INDEX 功能，`LOOKUP ON` 对建立索引的数据进行查询；RC4 提供了基于 SPACE 层级的权限管理和 ACL 授权模式。在运维方面，新增 `Nebula Stats Exporter` 对接基于 Grafana 和 Prometheus 的监控系统；

## 功能

- 支持 INDEX 功能， `CREATE INDEX` 创建索引，`REBUILD INDEX` ，对已有数据重建索引 [#1566](https://github.com/vesoft-inc/nebula/pull/1566)， `DROP INDEX` 删除已建索引 [#1776](https://github.com/vesoft-inc/nebula/pull/1776)
- 新增 `LOOKUP ON` ，对建立索引的数据进行查询 [#1705](https://github.com/vesoft-inc/nebula/pull/1705),  当有索引时， Storage Engine 的插入性能 [#1738](https://github.com/vesoft-inc/nebula/pull/1738)
- 提供基于 SPACE 层级的用户管理和权限控制，`CREATE USER`  创建用户，目前有 `GOD` 、 `ADMIN` 、 `DBA` 、 `USER` 、 `GUEST` 等 5 种角色权限。 `GRANT ROLE`  赋予某用户某权限， `REVOKE ROLE`  撤销已赋予给某用户的权限 [#1842](https://github.com/vesoft-inc/nebula/pull/1842)、[#1873](https://github.com/vesoft-inc/nebula/pull/1873) 角色及其对应操作权限示例 [#1929](https://github.com/vesoft-inc/nebula/pull/1929)、[#1917](https://github.com/vesoft-inc/nebula/pull/1917)，在 nebula-graphd.conf 中 加入 `--enable_authorize=true` 配置项，重启服务，使认证生效。
- 支持 TTL，允许用户指定数据的自动过期时间 [#1584](https://github.com/vesoft-inc/nebula/pull/1584)、[#422](https://github.com/vesoft-inc/nebula/pull/422)、[#1934](https://github.com/vesoft-inc/nebula/pull/1934)
- 增强 `DELETE VERTEX`， 支持批量删除点，删除操作支持 `hash()` ， `uuid()` 函数 [#1317](https://github.com/vesoft-inc/nebula/pull/1317)、 [#1759](https://github.com/vesoft-inc/nebula/pull/1759)
- 新增 Job Manager，管理存储层长时间运行的任务。目前已经支持 `flush`  和 `compact` 。 `SUBMIT JOB`  提交 Job,  `STOP JOB`  暂停任务，SHOW JOB 返回 Job 详情， `RECOVER JOB` 将失败的任务重新添加到执行队列中 [#1424](https://github.com/vesoft-inc/nebula/pull/1424)
- `GO` 查询支持 `BIDIRECT` 关键字，双向遍历  [#1740](https://github.com/vesoft-inc/nebula/pull/1740)、[#1752](https://github.com/vesoft-inc/nebula/pull/1752)
- 支持 Reservoir Sampling,  返回"超级大点"指定数量的边，使用时在 storage 配置文件中设置 `enable_reservoir_sampling` 为 true 打开采样开关， `max_edge_returned_per_vertex` 配置采样数 [#1746](https://github.com/vesoft-inc/nebula/pull/1746)、[#1915](https://github.com/vesoft-inc/nebula/pull/1915)
- 支持更多 CHARSET 和 COLLATION， `SHOW CHARSET` 、 `SHOW COLLATION` 可以查看到所支持的所有 `CHARSET` 和 `COLLATE` 。可在创建 Space 时设置， 默认的 `CHARSET` 为 utf8， 默认 `COLLATE`为 utf8_bin [#1709](https://github.com/vesoft-inc/nebula/pull/1709)


## OLAP Interface

- 新增 Spark 对接 Nebula Graph 的示例，[#56](https://github.com/vesoft-inc/nebula-java/pull/56)


## 运维工具

- 利用 Helm 简化了 Nebula 在 Kubernetes 上的部署，[#1473](https://github.com/vesoft-inc/nebula/pull/1473)
- 新增 `Nebula Stats Exporter` ，采集 Nebula 集群监控和性能指标信息给 Prometheus，使用 Grafana 作为可视化组件 [https://github.com/vesoft-inc/nebula-stats-exporter/pull/2](https://github.com/vesoft-inc/nebula-stats-exporter/pull/2)


## Change

- 由于存储结构的变化，RC4 不兼容 commitID `43453a0` ( 2 月 6 日) 以前版本插入的数据。
- 文档迁移到 repo `vesoft-inc/nebula-doc`  [https://github.com/vesoft-inc/nebula-docs](https://github.com/vesoft-inc/nebula-docs) 
- Nebula Python Client ConnectionPool 的初始化删除了 `is_async` 参数，Python 暂不支持异步客户端


## RC3 升级 RC4

- 首先停止所有机器的 Nebula 服务
    - 在每一台机器执行  scripts/nebula.service stop all
    - 然后通过执行 scripts/nebula.service status  all来确认进程已经退出
- 在每一台机器(根据系统环境)安装新的RPM包
    - 获取 package：[https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4)
    - 安装 package，比如：rpm -Uvh nebula-1.0.0-rc4.el7-5.x86_64.rpm
- 启动 Nebula
    - 所有机器执行 scripts/nebula.service start all
    - 确认进程正常启动 scripts/nebula.service status all
- 重新导入数据

最后是 Nebula 的 GitHub 地址，欢迎大家试用，有什么问题可以向我们提 issue。GitHub 地址：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula)；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：NebulaGraphbot

## 推荐阅读

- [图数据库 Nebula Graph RC1 Release Note](https://nebula-graph.io/cn/posts/nebula-graph-rc1-release-note/)
- [分布式图数据库 Nebula RC2 发布：增强了 CSV Importer 功能](https://nebula-graph.io/cn/posts/nebula-graph-rc2-release-note/)
- [图数据库 Nebula Graph RC3 Release Note](https://nebula-graph.io/cn/posts/nebula-graph-rc3-release-note/)