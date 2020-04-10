---
title: "Pick of the Week'20 | 第 15 周看点--Studio v1.0.2-beta 发布"
date: 2020-04-10
description: "Nebula Graph Studio 1.0.2-beta 加入了图探索增加边属性显示及点标记配置，功能更丰富，此外，社区小伙伴对 partition 数量和使用的图查询语言有自己的小看法。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由本周大事件、用户问答、Nebula 产品动态和推荐阅读构成。

这是 2020 年第 15 个工作周的周五，放了小长假的你工作状态调整得如何？🌝 和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [Nebula Graph Studio v1.0.2-beta](https://github.com/vesoft-inc/nebula-web-docker)

Nebula Graph Studio 是一款可视化的图数据库 Web 应用，集构图、数据导入、图探索于一体，无缝连接图数据库，给用户带来全新的图数据库使用体验。

本次 Nebula Graph Studio 1.0.2-beta 加入了图探索增加边属性显示及点标记配置，功能更加丰富。

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW201501.png)

- [你在使用什么图查询语言](https://discuss.nebula-graph.io/t/topic/433)

在本周的 Nebula Graph 论坛有个主题贴：你所使用的图查询语言是什么？目前来看 Cypher 领先 Gremlin，如果你想给 Gremlin 投一票或者站队 Cypher 可以前往：[https://discuss.nebula-graph.io/t/topic/433](https://discuss.nebula-graph.io/t/topic/433) 给你使用的图查询语言投个票~

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW201502.png)

## Nebula 产品动态

Pick of the Week 每周会从 GitHub issue 及 pr 中选取重要的产品动态和大家分享，欢迎阅读本文的你关注我们的 GitHub：[https://github.com/vesoft-inc/nebula](https://0x7.me/zhihu2github) 及时了解产品新动态~<br />

- 新增了关键字和保留字，标签： `文档` ，示例如下，pr 参见：[https://github.com/vesoft-inc/nebula/pull/1930](https://github.com/vesoft-inc/nebula/pull/1930)
```
# 非保留关键字无需引用可直接使用，且所有非保留字都会自动转换成小写，所以非保留字是不区分大小写。保留关键字需使用反引号标注方可使用，例如 `AND`。

nebula> CREATE TAG TAG(name string);
[ERROR (-7)]: SyntaxError: syntax error near `TAG'

nebula> CREATE TAG `TAG` (name string); -- 此处 TAG 为保留字
Execution succeeded
```

- 修复了 TTL 在 `FETCH PROP ON` 没生效的问题，标签： `bugfix` ，pr 参见：[https://github.com/vesoft-inc/nebula/pull/1937](https://github.com/vesoft-inc/nebula/pull/1937)
- 修复了针对边的 timestamp 类型的属性，不支持设置默认值的问题，标签： `bugfix` ，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2038](https://github.com/vesoft-inc/nebula/pull/2038)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等技术社区选取 3 - 5 个用户问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。<br />

@RAINBOW：**对于 partition 数量有没有什么指导性建议吗？是应该根据内存大小来配置吗，以后可以更改？我看手册上是 10 个到 100 个，有什么区别吗。**

**Nebula**：partition 数量越多，数据粒度越小，可以更有效的命中热点数据。但也会增加内存使用量，因此建议结合节点数量和内存容量来决定 partition。一般来说，3 台机器，10 个就够用了。

> vnnw 追问：有没有一般性的配置参考策略，类似 XX G 内存，XX 量热点数据，期望热点数据 hit rate，配置多少个 partition 这样的？

**Nebula**：目前还没有具体的配置标准，通常情况下我们建议 partition 在 10-100 之间，单机部署设置 10  partition 足以应对大多数情况。btw，partition 数量不影响 cache hit 的。还是要靠内存多，大力出奇迹。<br />

@李宇明：**请教一下，我看 Nebula 关于 index 有三个系统表，分别为 indexes，index 和 indexstatus，这里为什么需要设计三个系统表？我看其他系统大多是一个系统表。这个 indexs 和 index 系统表有什么区别？麻烦指教**<br />

**Nebula**：索引用到的是 indexes 和 indexstatus，另外那个和索引没关系。而 indexes 对应的是 show tag/edge indexes 指令，indexstatus 主要是为了查询构建索引时的状态(show tag index status)<br />

@thu16kevin：**Nebula Graph 现在都支持什么图算法？未来是否有相关规划，自行实现的图算法怎么嵌入执行？**

**Nebula**：目前支持最短路径和全路径。用户自定义算法将在 Query Engine 2.0 提供支持，Nebula 也会增加其他算法支持。如果你希望在 Query Engine 1.0 上增加，那目前需要直接写 C++ 代码。

## 推荐阅读

- [全站 CDN 部署 Discourse 论坛](https://nebula-graph.io/cn/posts/self-host-discourse-forum-with-global-cdn/)
  - 推荐理由：本文详细地讲述了如何使用 Cloudflare 和 Discourse 服务自建论坛的过程。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 14 周看点--RC4 和官网 2.0 齐上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-03/)
  - [Pick of the Week'20 | 第 13 周看点--GitHub上的 defect-p2 标签](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-27/)
  - [Pick of the Week'20 | 第 12 周看点--csv 数据导入你该知道的事项](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-20/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.io/](https://discuss.nebula-graph.io/) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：NebulaGraphbot 

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《宇宙级玫瑰》

![每周看点](https://nebula-blog.azureedge.net/nebula-blog/PotW2015Nebula.png)


玫瑰星云（NGC 2237；蔷薇星云）并不是宇宙中，唯一会和花产生联想的气体尘埃云，但它却是其中最著名的一个。位在 5,000 光年之外的麒麟座大分子云边缘的这朵宇宙玫瑰，里头的花瓣其实是恒星诞生区。这幅看起来清晰自然的玫瑰星云之望远镜影像，动用了宽与窄波段滤镜，因为玫瑰不尽然都是红色的。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | Astronomy Picture of the Day | 2019 April 03


![关注公众号](https://nebula-blog.azureedge.net/nebula-blog/WeChatOffical.png)
