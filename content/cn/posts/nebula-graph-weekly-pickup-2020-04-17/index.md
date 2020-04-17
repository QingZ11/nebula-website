---
title: "Pick of the Week'20 | 第 16 周看点--中文论坛上线"
date: 2020-04-17
description: "Nebula Graph 启用了中文论坛，并在中英文站点上线全新分类、标签系统。而在产品方面，Github 上的文档迁移到独立的 repo，社区小伙伴也问及了如何进行 rc4 升级的事项。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由本周大事件、用户问答、Nebula 产品动态和推荐阅读构成。

这是 2020 年第 16 个工作周的周五 🌝 来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [中文论坛上线](https://discuss.nebula-graph.com.cn/)

Nebula Graph 启用了中文论坛，而原先的 [https://discuss.nebula-graph.io](https://discuss.nebula-graph.io) 域名对应的论坛为英文论坛。此外，中英文论坛都启用了全新的分类和标签系统，方便社区用户更好地找到他们所需的帖子。

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW201601.png)

如果你对论坛的分类、标签有任何建议，欢迎前往论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 的 `建议反馈` 提建议，以便更好地服务社区的其他小伙伴。<br />

## Nebula 产品动态

Pick of the Week 每周会从 GitHub issue 及 pr 中选取重要的产品动态和大家分享，欢迎阅读本文的你关注我们的 GitHub：[https://github.com/vesoft-inc/nebula](https://0x7.me/zhihu2github) 及时了解产品新动态~<br />

- 创建 TAG/EdgeType 时增加 ttl 示例，标签： `文档` ，示例如下，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2015](https://github.com/vesoft-inc/nebula/pull/2015)
```
CREATE EDGE marriage(location string, since timestamp)
	  TTL_DURATION = 0, TTL_COL = "since" -- 负值或 0 数据不会失效

CREATE TAG icecream(made timestamp, temperature int)
    TTL_DURATION = 100, TTL_COL = made;
   --  超过 TTL_DURATION 数据即失效
```

-  Nebula Graph Github 上的文档迁移到独立的 repo，标签： `文档` ，迁移后访问链接参见：[https://github.com/vesoft-inc/nebula-docs](https://github.com/vesoft-inc/nebula-docs)

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW201602.png)

- fix 对某个 tag（已有该类型的点），新增属性对属性创建索引，插入数据 storaged coredump 的 bug，标签： `storage` ，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2073](https://github.com/vesoft-inc/nebula/pull/2073)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等技术社区选取 3 - 5 个用户问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。<br />

> mike 提问：看了下论坛，有些问题没有，比如故障自动恢复， 扩容缩容， 读写流程方面， 有现成的帖子或文档吗?

**Nebula**：故障恢复这块的内容你可以参考我们之前的文章[《分布式图数据库 Nebula Graph 中的集群快照实践》](https://nebula-graph.io/cn/posts/introduction-to-snapshot-in-nebula-graph/)以备发生灾难性问题时用历史 snapshot 便捷地将集群恢复到一个可用状态。至于扩缩容这块内容，可以阅读下[《图数据库设计实践 | 存储服务的负载均衡和数据迁移》](https://nebula-graph.io/cn/posts/nebula-graph-storage-banlancing-data-migration/)里面有提到如何增加机器及批量缩容。

> vegetable 提问：麻烦问一下，整个存储层中，边是不是存了两份呢？（不算副本），Partition 之间的交互会涉及到网络开销么？

**Nebula**：一条图中的逻辑意义上的边，对应内部两个物理上的 key-value，分别叫 out-edge 和 in-edge，所以 key 是存储了两份，但 value 储存了一份。out-edge 存储 property values，in-edge 不存储 property，是一种是用空间来换时间的方式。如果用了索引，那索引是另外的一些存储空间了。

Partition 之间的交互主要是看 partition 的分布，如果不在一台机器上一定会有网络开销的，主要原因是 Partition 分为 leader 角色和 follower 角色，并通过 raft 协议保证其一致性，为了提高数据的安全性，leader 和 follower 往往会被分配到不同的 host 上，所以会涉及到网络开销。

> Qubutol 提问：rc3 到 rc4 如何做升级？

**Nebula**：升级方式可以参考以下方法

- 首先停止所有机器的 Nebula 服务
  - 在每一台机器执行 `scripts/nebula.service stop all` 命令
  - 然后执行 `scripts/nebula.service status all` 命令确认进程已经退出
- 在每一台机器（根据系统环境）安装新的`rpm`包
  - 下载安装包：`https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4`
  - 安装 Nebula：`rpm -Uvh nebula-1.0.0-rc4.el7-5.x86_64.rpm`
- 启动 Nebula 服务
  - 在所有机器执行 `scripts/nebula.service start all` 命令
  - 然后执行 `scripts/nebula.service status all` 确认进程正常启动
- 重新导入数据

## 推荐阅读

- [基于 Jepsen 来发现几个 Raft 实现中的一致性问题(2)](https://nebula-graph.io/cn/posts/detect-data-consistency-issues-in-raft-implementing-with-jepsen/)
  - 推荐理由：在这篇文章中将着重介绍如何通过 Jepsen 来对 Nebula Graph 的分布式 kv 进行一致性验证。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 15 周看点--Studio v1.0.2-beta 发布](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-10/)
  - [Pick of the Week'20 | 第 14 周看点--RC4 和官网 2.0 齐上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-03/)
  - [Pick of the Week'20 | 第 13 周看点--GitHub上的 defect-p2 标签](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-27/)


本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《M81》

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW2016Nebula.jpeg)

M81 大小和我们的银河系相近，同时也是地球天空中最明亮的星系之一。这个位在北天大熊座方向的宏伟螺旋星系，亦名为 NGC 3031，另外也因它的 18 世纪发现者而有波德星系的称号。在影像的中左方，可见到有些尘埃带与其他旋臂结构反向而行，穿过了星系盘。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | Paolo De Salvatore (Zenit Observatory)

![关注公众号](https://nebula-blog.azureedge.net/nebula-blog/WeChatOffical.png)
