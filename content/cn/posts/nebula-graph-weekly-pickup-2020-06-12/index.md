---
title: "Pick of the Week'20 | 第 24 周看点--UPSERT 实践"
date: 2020-06-12
description: "在本周每周看点中你将了解到如何在无法连接外网情况下安装 Nebula Graph，以及 UPSERT 语法的讲解。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 24 个工作周的周五，转眼大半年快过去了 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [UPSERT 功能讲解](https://github.com/vesoft-inc/nebula/pull/2156)


`UPSERT`  是一项结合了 `INSERT`  和 `UPDATE`  功能的语法。

- 如果顶点或边不存在，则会新建该顶点或边，未 `SET` 的属性字段使用该字段 Schema 的默认值，如果未设置默认值不存在时则报错；
- 如果该顶点或者边存在，且满足 WHEN 条件，则会执行更新；
- 如果该顶点或者边存在，且不满足 WHEN 条件，则不会进行任何操作。

`UPSERT` 在语法上简化了插入新数据前先判断点或边是否存在这一操作，插入性能低于 `INSERT` ，因此不适合大量数据写入的场景。

下面来实践一下：

- 本次所用到的 tag 是 player，未指定 name 和 age 属性的默认值

```
(user@nebula) [test]> show create tag player
==========================================================================================
| Tag    | Create Tag                                                                    |
==========================================================================================
| player | CREATE TAG player (
  name string,
  age int
) ttl_duration = 0, ttl_col = "" |
------------------------------------------------------------------------------------------
Got 1 rows (Time spent: 1.024/1.973 ms)
```

- 插入点 100，然后更新点 100 的 name、age 属性

```
(user@nebula) [test]> INSERT VERTEX player(name, age) VALUES 100:("Ben Simmons", 22);
Execution succeeded (Time spent: 1.039/1.711 ms)

(user@nebula) [test]> UPSERT VERTEX 100 SET player.name = "Dwight Howard", player.age = $^.player.age + 11 WHEN $^.player.name == "Ben Simmons" && $^.player.age > 20 YIELD $^.player.name AS Name, $^.player.age AS Age;
=======================
| Name          | Age |
=======================
| Dwight Howard | 33  |
-----------------------
Got 1 rows (Time spent: 2.834/3.612 ms)
```

- 为不存在的点 400，执行插入属性 age + 1 操作时，因 age 属性无默认值而执行失败。

```
(user@nebula) [test]> fetch prop on * 400
Execution succeeded (Time spent: 5.038/5.875 ms)

(user@nebula) [test]> UPSERT VERTEX 400 SET player.age = $^.player.age + 1;
[ERROR (-8)]: Maybe vertex does not exist, part: 1, error code: -100!
```

## 本周大事件

- [Nebula Graph 1.0-GA 发布](https://nebula-graph.com.cn/posts/nebula-graph-1.0-release-note/)

Nebula Graph 1.0 发布了。作为一款开源分布式图数据库，Nebula Graph 1.0 版本旨在提供一个安全、高可用、高性能、具有强表达能力的查询语言的图数据库。

![Nebula Graph 1.0 Release Note](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW202401.png)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【无法连接外网情况下安装 Nebula Graph】，由社区用户 zhaohaifei 提出，Nebula Graph 官方解答。

> zhaohaifei 提问：没有办法连接外网，就无法自动下载 Nebula Graph 所需的依赖文件，此时应如何安装？能否提供一个所有依赖均已下载好，并放入源码目录下的版本，使得安装时不需要再下载。

**Nebula**：如果在编译源码时无法连接网络，则必须手动下载这些工具和依赖，包括 Nebula Graph 仓库中的 GCC 编译器，第三方库和 CMake。然后，将所有这些复制到你的机器上。以下是快速指南。您仍然需要参考上述步骤以获取更多详细信息。

首先，需要有一台可以连接外网的主机，在主机上面下载下面的文件：

```
# 请注意，尽管我们使用命令行来演示，但是您可以通过浏览器执行所有下载。

# 下载 GCC

# RedHat 或 CentOS 用户

$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh

# Debian 或 Ubuntu 用户

$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh

# 下载 CMake

$ wget https://cmake.org/files/v3.15/cmake-3.15.5-Linux-x86_64.sh

# 下载第三方库

$ wget https://oss-cdn.nebula-graph.com.cn/third-party/vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh
```

然后，将这些软件包复制到你的机器：

```
# 安装 GCC

# RedHat 或 CentOS 用户

$ sudo bash vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh

# Debian 或 Ubuntu 用户

$ sudo bash vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh

# 启用 GCC 安装

$ source /opt/vesoft/toolset/gcc/7.5.0/enable

# 安装 CMake

$ sudo bash cmake-3.15.5-Linux-x86_64.sh --skip-license --prefix=/opt/vesoft/toolset/cmake

# 将安装好的 CMake 的 bin 目录加到 PATH 里面

$ export PATH=/opt/vesoft/toolset/cmake:$PATH

# 安装第三方库

$ sudo bash vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh
```

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 23 周看点--INSERT 插入语法](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-06-05/)
   - [Pick of the Week'20 | 第 22 周看点--图遍历实践](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-29/)
   - [Pick of the Week'20 | 第 21 周看点--Nebula Graph 中的管道](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-22/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)<br />

## 星云·小剧场
**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《螺旋星系 M96》

![星云](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2024Nebula.jpeg)

在这张美丽宇宙岛的彩色细致影像里，尘埃带看似绕着 M96 中心打转。显然 M96 是一个螺旋星系，它的跨幅大约是 10 万光年，大小约莫和我们的银河系相当。M96 亦名为 NGC 3368，其距离约为 3 千 5 百万光年远，是狮子座 I 星系群的大型成员。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
