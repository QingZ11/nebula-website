---
title: "Pick of the Week'20 | 第 35 周看点--支持 Neo4j & JanusGraph 数据导入"
date: 2020-08-28
description: "除 Nebula Graph 支持 Neo4j & JanusGraph 数据导入之外，你在本文可了解到离线安装 Nebula Graph 的方法"
tags: ["社区","产品动态"]
author: "清蒸"
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：本周新进 pr、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 35 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [Nebula Graph 受邀参加 TNP 数据库大会](https://www.nextplatform.com/2020/08/26/the-next-database-platform/)

TheNextPlatform 是一个面向未来的技术平台，向 CIO、高级架构师等技术决策者传递前沿技术。Nebula Graph 作为开源分布式图数据库技术的代表受邀参加该平台主办的 Database Event 线上大会。欧若数网 CEO Sherman 接受 TheNextPlaform 的采访，谈图数据库对企业的价值。同时参会的还有来自 Google，MongoDB，OmniSci 等厂商的数据库专家。

- [支持 Neo4j 和 JanusGraph 数据导入](https://github.com/vesoft-inc/nebula-java)

Nebula Graph Exchange（原 Spark Writer）现支持从 Neo4j 和 JanusGraph 中导入数据，配置完 Neo4j / JanusGraph 连接之后，执行下面 Nebula Graph Exchange 命令即可导入数据

```bash
$SPARK_HOME/bin/spark-submit --class com.vesoft.nebula.tools.importer.Exchange --master "local[10]" target/exchange-1.0.1.jar -c /path/to/conf/neo4j_application.conf
```
具体的连接配置，Nebula Graph 官方将出一篇文章详细描述当中的实现原理及特殊配置。

## 本周新进 pr

本周 Nebula Graph 主要有这些产品动态和新合并的 pr：

- 修复了配置 `enable_multi_versions` 后 StorageClient `scanVertex` 和 `scanEdge` 返回数据为空的问题，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2312](https://github.com/vesoft-inc/nebula/pull/2312)
- 修复了某些情况下， `USE SPACE` 和 `FIND PATH` 不能一起使用的问题，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2303](https://github.com/vesoft-inc/nebula/pull/2303)
- 修复了某些情况下， `snapshot` 会被异常地触发的问题，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2316](https://github.com/vesoft-inc/nebula/pull/2316)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【没有联网的情况下如何安装 Nebula Graph】，温故而知新，本次问题由社区用户 zhaohaifei 提出，Nebula Graph 官方解答。

> zhaohaifei 提问：公司没法连接外网如何安装 Nebula Graph 呢？

**Nebula**：如果在编译源码时无法连接网络，则必须手动下载这些工具和依赖，包括 Nebula Graph 仓库中的 GCC 编译器，第三方库和 CMake。然后，将所有这些复制到你的机器上。以下是快速指南。您仍然需要参考上述步骤以获取更多详细信息。

首先，需要有一台可以连接外网的主机，在主机上面下载下面的文件：

```
# 请注意，尽管我们使用命令行来演示，但是您可以通过浏览器执行所有下载。

# 第一步：下载 GCC

# RedHat 或 CentOS 用户

$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh

# Debian 或 Ubuntu 用户

$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh

# 第二步：下载 CMake

$ wget https://cmake.org/files/v3.15/cmake-3.15.5-Linux-x86_64.sh

# 第三步：下载第三方库

$ wget https://oss-cdn.nebula-graph.com.cn/third-party/vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh

```
然后，将这些软件包复制到你的机器：
```
# 第一步：安装 GCC

# RedHat 或 CentOS 用户

$ sudo bash vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh

# Debian 或 Ubuntu 用户

$ sudo bash vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh

# 第二步：启用 GCC 安装

$ source /opt/vesoft/toolset/gcc/7.5.0/enable

# 第三步：安装 CMake

$ sudo bash cmake-3.15.5-Linux-x86_64.sh --skip-license --prefix=/opt/vesoft/toolset/cmake

# 第四步：将安装好的 CMake 的 bin 目录加到 PATH 里面

$ export PATH=/opt/vesoft/toolset/cmake:$PATH

# 第五步：安装第三方库

$ sudo bash vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh
```

## 推荐阅读

- [图数据库对比：Neo4j vs Nebula Graph vs HugeGraph](https://nebula-graph.com.cn/posts/performance-comparison-neo4j-janusgraph-nebula-graph/)
   - 推荐理由：本文挑选了几款业界较为流行的开源图数据库与 Nebula Graph 进行了多角度的对比。
- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 34 周看点--可视化工具 Studio 发布 v1.1.0-beta](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-21)
   - [Pick of the Week'20 | 第 33 周看点--多方图数据库测试性能发布](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-14/)
   - [Pick of the Week'20 | 第 32 周看点--多个 pr 提高 Nebula Graph性能和稳定性](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-08-07/)


本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
