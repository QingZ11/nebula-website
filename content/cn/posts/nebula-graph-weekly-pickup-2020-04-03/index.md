---
title: "Pick of the Week'20 | 第 14 周看点--RC4 和官网 2.0 齐上线"
date: 2020-04-03
description: "本周看点，Nebula Graph RC4 发布，全新官网 2.0 上线，而产品部分现支持指定 Nebula 的安装目录，此外社区小伙伴对 index 也提出了一些疑问…"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由本周大事件、用户问答、Nebula 产品动态和推荐阅读构成。

这是 2020 年第 14 个工作周的周五，股票打 2 折的瑞星咖啡今天你有来一杯吗？🌝 下面来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [rc4 发布](https://nebula-graph.io/cn/posts/nebula-graph-rc4-release-note/)

本次 [RC4](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4) 上线 INDEX 功能，`LOOKUP ON` 对建立索引的数据进行查询；RC4 提供了基于 SPACE 层级的权限管理和 ACL 授权模式。在运维方面，新增 `Nebula Stats Exporter` 对接基于 Grafana 和 Prometheus 的监控系统；

- [官网 2.0 上线](https://nebula-graph.io/en/)

本次官网 2.0 中我们重新设计了官网的首页，在首页部分增加了最新博文信息，此外在博客列表页面我们加入了标签系统，方便社区小伙伴快速选择感兴趣的技术主题进行阅读，如果你有感兴趣的技术主题 Nebula 还未分享，官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 向我们提出你的建议反馈~ Thx

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW201401.png)

## Nebula 产品动态

Pick of the Week 每周会从 GitHub issue 及 pr 中选取重要的产品动态和大家分享，欢迎阅读本文的你关注我们的 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 及时了解产品新动态~


- Nebula 的安装支持指定安装目录，标签： `Install` ，pr 参见：[https://github.com/vesoft-inc/nebula/pull/1906](https://github.com/vesoft-inc/nebula/pull/1906)
- 配置了 rocksdb filter policy，减少读盘的次数，提高查询性能，标签： `Storage` ，pr 参见：[https://github.com/vesoft-inc/nebula/pull/1959](https://github.com/vesoft-inc/nebula/pull/1959)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等技术社区选取 3 - 5 个用户问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

- @wadeliuyi 提问
> 为什么 index 编码的时候不用 tlv 格式把每个列都区分开来，这样前缀匹配的时候是不是效率更高？如果把长度和 type 信息直接放到 column1 的前面，这样从 RocksDB 查询的时候就可以只查到 row1 的值，为什么要把 length 放在后面呢？
> ![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW201402.png)

**Nebula**：之所以这样做，是因为 index 结构是基于 prefix scan 的，如果把 length 放到前边的话无法范围查询。举个例子：

```
index (col1 string)
where col1 > “aaa” and col1 < “bb”
```
目前的 range 是 （“aaa3”, “bb2”），如果前置 length 的话，range (“3aaa”, “2bb”)

- @郭彦超 提问
> 请问如何 count 有多少条边或点？

**Nebula**：如果是整个 space 的, 目前没有直接的命令，但是有 dump 工具，在 bin 目录下面有个 db_dump。[https://github.com/vesoft-inc/nebula/blob/master/docs/manual-CN/3.build-develop-and-administration/3.deploy-and-administrations/server-administration/storage-service-administration/data-export/dump-tool.md](https://github.com/vesoft-inc/nebula/blob/master/docs/manual-CN/3.build-develop-and-administration/3.deploy-and-administrations/server-administration/storage-service-administration/data-export/dump-tool.md)

- @Forest 提问
> 想咨询下 csv 写入速率是多少？有一个参考指标吗？

**Nebula**：在内存 128G，48 核，SSD 的机子上面，通过 importer 进行 csv 文件导入，导入速度是每秒 40 多万。

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW201403.png)

还可以通过调整参数使插入更快。importer 的使用说明链接：[https://github.com/vesoft-inc/nebula-importer](https://github.com/vesoft-inc/nebula-importer)。importer 的配置文件里面两个关键参数，服务端的配置需要用安装目录下面后缀名为 production 的配置文件。

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW201404.png)

## 推荐阅读

- [浅谈图数据库](https://nebula-graph.io/cn/posts/review-on-graph-databases/)
  - 推荐理由：本文主要讨论图数据库背后的设计思路、原理还有一些适用的场景，以及在生产环境中使用图数据库的具体案例。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 13 周看点--GitHub上的 defect-p2 标签](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-27/)
  - [Pick of the Week'20 | 第 12 周看点--csv 数据导入你该知道的事项](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-20/)
  - [Pick of the Week'20 | 第 11 周看点--图数据库的蓄水池](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-03-13/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：NebulaGraphbot

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《马头星云周围的云气丝》

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2014Nebula.png)

这张长时间曝光影像显示，中下方这片我们很熟悉的暗色斑块，是一个庞大吸光尘埃和辉光云气复合体的一部份。在影像中清楚呈现亘古以来被恒星风和古超新星造成和雕塑出的云气丝和尘埃带。其中，火焰星云出现在马头星云的左侧，其左上方则有参宿二，这颗位在猎户腰带中心的亮星。马头星云位在北天的猎户座里，离我们约有 1,500 光年远。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | Astronomy Picture of the Day | 2019 April 03

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
