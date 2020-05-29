---
title: "Pick of the Week'20 | 第 19 周看点--数据库的角色管理"
date: 2020-05-08
description: "本周特性讲解部分，讲解员从 Nebula Graph 的 5 种角色切入，讲述了对应相关权限的授予与取消。在大事件中公布了 DB-Engine 5 月排名，而主题问答中你将了解到#查询服务线程的设置#…"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

这是 2020 年第 19 个工作周的周五，明儿上班的闹钟可定好？ 🌝 来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [角色管理介绍](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/alter-user-syntax/)

在图数据库 Nebula Graph 中有 5 类角色身份，权限递减依次为： `God` 、 `Admin` 、 `DBA` 、 `User` 、 `Guest` 。可通过修改 graphd 服务配置中的 `enable_authorize`  字段为 True 开启用户权限管理功能。

使用 `GRANT ROLE` 命令可为某个用户在指定的图空间中授予指定的角色，通常用于权限最小化管理的场景中使用。 `REVOKE ROLE` 则可撤销某个图空间中用户的权限。例如：

```
# 指定角色权限
GRANT ROLE DBA ON space1 TO user1
# 取消角色授权
REVOKE ROLE DBA ON space1 FROM user1
```

目前 Nebula Graph 账号管理功支持创建用户、删除用户、修改密码和用户权限修改等操作。除了删除用户必须由 God 或 Admin 身份的用户执行，拥有相应权限的普通账号均可进行其他操作。BTW，修改密码可通过 `ALTER` 或 `CHANGE PASSWORD` 命令操作，区别在于前者不需要知道被修改账号的旧密码，但需要执行者拥有 ALTER 权限，而 CHANGE PASSWORD 无需授权，知道旧密码即可修改。参考下例：

```
ALTER USER user1 WITH PASSWORD password1
CHANGE PASSWORD user1 FROM password1 TO password2
```

## 本周大事件

- [DB-Engine 5 月排名出炉](https://db-engines.com/en/ranking/graph+dbms)

![db-engine](https://www-cdn.nebula-graph.com.cn/nebula-blog/201901.png)

DB-Engine 5 月排名前十名的变化不大，可以看到排名 Top 5 的 DBMS 在 DB-Engine 得分都有所下降，而 5 月 Nebula Graph 表现不错，排名上升 2 位，而且得分增加了 0.07 分 👏

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【查询服务线程的设置】，由社区用户 tesla 提出，Nebula Graph 官方解答。

> tesla 提问：现在查询是单线程的，如果输入了一个复杂的查询逻辑会导致后面的其他查询一起卡死，那有地方可以设置查询服务的线程数和设置最大查询响应时间之类的，或者部署集群多副本之类的可以解决这个问题吗？

**Nebula**：通过设置 `nebula-graph.conf.default`  配置文件中的 `num_worker_threads`  参数可设置执行线程数。如果是生产环境，建议使用 `nebula-graphd.conf.production` 中推荐的配置，此时可更改 `num_worker_threads`  参数达到相同目的。

> 追问：设置是默认的 0，应该是把所有 cpu 核数用满的才对，但之前测试查询的时候还是卡死了，后续的简单查询命令无法执行，等前面那个复杂的结果出来后，才执行成功…这个多线程是并行还是并发的？感觉更像并发。

**Nebula**：graphd 是可以部署多副本的，client 端需要做个简单的 load balance。graphd 中的任务都是异步的，会同时放在线程池中并行的执行。你说的前面的任务会阻塞后续任务。可以看下 server 上运行复杂查询时的 cpu 负载情况和磁盘的 IO，再来确定是哪里的瓶颈——也许是需要从存储服务那里取 IO 花了比较多的时间，CPU 本身并不需要太多计算。

## 推荐阅读

- [Nebula Graph 使用 GitHub Action 的自动化实践](https://nebula-graph.io/cn/posts/automate-workflows-with-github-action)
  - 推荐理由：本文详细讲述了 Nebula Graph 使用 GitHub Action 实现自动化测试，满足 PM 小姐姐发布需求，搭建一套 CI/CD 系统的过程，涉及自托管安全机制制定、编译加速等内容。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 17 周看点--字符比较运算符 CONTAINS](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-24/)
  - [Pick of the Week'20 | 第 16 周看点--中文论坛上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-17/)
  - [Pick of the Week'20 | 第 15 周看点--Studio v1.0.2-beta 发布](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-10/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《船底座大星云》

![nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/2019Nebula.jpeg)

该处的恒星不停的诞生与死亡，织成了一幅壮观的黝黑尘埃织锦。编录号为 NGC 3372 的船底座大星云，宽度超过 300 光年，位在船底座方向约 8,500 光年远之处。位在这团星云中心的活跃恒星海山二，曾是 1830 年代天空最明亮的恒星之一，不过之后亮度已大幅降低。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official


![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
