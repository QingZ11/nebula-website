---
title: "Pick of the Week'20 | 第 17 周看点--字符比较运算符 CONTAINS"
date: 2020-04-24
description: "在本周看点中，我们将对 CONTAINTS 这个可实现任意位置的关键字过滤的特性进行讲解，在社区问答方面，本期主题为 #KV Store 数据批量导入#"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。


这是 2020 年第 17 个工作周的周五，周日上班的闹钟可提前定好？ 🌝 来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [字符比较运算符：CONTAINS](https://github.com/vesoft-inc/nebula/pull/2077)

本周新发布了字符比较运算符——CONTAINS。

CONTAINS 可对语句返回的查询结果进行任意位置的关键字过滤，在字符串中执行区分大小写的包含搜索，并可与逻辑运算符一同使用。CONTAINS 的加入使查询过程变得更为灵活，通过关键词和逻辑运算符的参与，更精确进行查询操作。

示例如下，我们从点 107 出发，沿边 serve 边查找队伍名中包含 "riors" 的点，并返回球员名、服役的起点/终点年代和球队名。

```
GO FROM 107 OVER serve WHERE $$.team.name CONTAINS "riors" YIELD $^.player.name, serve.start_year, serve.end_year, $$.team.name;

=====================================================================
| $^.player.name | serve.start_year | serve.end_year | $$.team.name |
=====================================================================
| Aron Baynes    | 2001             | 2009           | Warriors     |
---------------------------------------------------------------------
```

## Nebula 产品动态

Pick of the Week 每周会从 GitHub issue 及 pr 中选取重要的产品动态和大家分享，欢迎阅读本文的你关注我们的 GitHub：[https://github.com/vesoft-inc/nebula](https://0x7.me/zhihu2github) 及时了解产品新动态~

- 数据支持科学计数法表示，标签： `功能` ，示例如下，pr 参见：[https://github.com/vesoft-inc/nebula/pull/2079](https://github.com/vesoft-inc/nebula/pull/2079)
-  Java 客户端升级了依赖的 guava 版本，标签： `客户端` ，pr 参见：[https://github.com/vesoft-inc/nebula-java/pull/86](https://github.com/vesoft-inc/nebula-java/pull/86)
- Nebula Importer 支持导入远程数据文件，标签： `Tools` ，pr 参见：[https://github.com/vesoft-inc/nebula-importer/pull/64](https://github.com/vesoft-inc/nebula-importer/pull/64)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是 `#KV Store 数据批量导入#`，由社区用户 zmh0531 cherry 提出，Nebula Graph 官方解答。

> zmh0531 提问：KV Store现在有 put get 两个接口，如果想导入大量 KV 数据，有没有好的方法，Spark Writer 是否具有这种功能呢?

**Nebula**：目前批量导入方式建议使用 Spark Writer，它支持 HDFS 和 HIVE 格式数据，具体操作可参考文档：[https://github.com/vesoft-inc/nebula-importer](https://github.com/vesoft-inc/nebula-importer)

> cherry 提问：官方文档介绍 Spark Writer 支持 parquet / hive 格式的批量导入，是 SparkClientGenerator （client / server）模式导入，不知道大量点边（千亿级别）的导入需要部署多少 graphd 实例才能保证导入性能（导入时间在 5~6 小时之内）
> 另外，rc4 的 spark-sstfile-generator 源码有 SparkSstFileGenerator，是否现在支持工具生成 sst，然后用 ingest 功能能更快地实现导入（像 HBase 的 bulkload）


**Nebula**：按照单机 20-50 万 TPS 估算，大概 15 台 - 30 台机器。在每台机器都部署 `graphd + storaged` ，另外随便找 3 个机器混布下 meta 就可以。

## 推荐阅读

- [图数据库 Nebula Graph 的代码变更测试覆盖率实践](https://nebula-graph.io/cn/posts/integrate-codecov-test-coverage-with-nebula-graph/)
  - 推荐理由：对于持续开发的大型工程而言，足够的测试是保证软件行为符合预期的有效手段，而不是仅仅依靠 code review 或者开发者自己的技术素质。测试覆盖率就是检验测试覆盖软件行为的情况，通过检查测试覆盖情况可以帮助开发人员发现没有被覆盖到的代码。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 16 周看点--中文论坛上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-17/)
  - [Pick of the Week'20 | 第 15 周看点--Studio v1.0.2-beta 发布](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-10/)
  - [Pick of the Week'20 | 第 14 周看点--RC4 和官网 2.0 齐上线](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-03/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

## 星云·小剧场

为什么给图数据库取名 Nebula ？

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula的发音是：[ˈnɛbjələ]

本文星云图讲解--《大麦哲伦星系的星云》

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2017Nebula.jpeg)

这个名为的 N11 的区域，出现在许多以它母星系─我们银河系近邻的大麦哲伦星系（LMC）─为主题的影像之右上方。在大麦哲伦星系里，大小仅次于蜘蛛星云。在这张影像里，到处可见到内部藏着即将现踪年轻恒星的紧实黝黑尘埃球。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
