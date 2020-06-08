---
title: "Pick of the Week'20 | 第 21 周看点--Nebula Graph 中的管道"
date: 2020-05-22
description: "在本周的特性讲解中详细讲述了 Nebula Graph 的管道用法，以及摘录了部分数据导入需要知道的事项。"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

这是 2020 年第 21 个工作周的周五 🌝 来和 Nebula 看看本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [管道 Pipe 讲解](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/3.language-structure/pipe-syntax/)

Nebula Graph 支持管道操作，使用 `|`  组合查询，这也是 nGQL（Nebula Graph Query Language）与 SQL 的重要区别之一。`|` 左边 query 的输出，是右边 query 的输入，配合 `YIELD`  关键字，用户可以自定义返回的字段。

```
nebula> GO FROM 100 OVER follow YIELD follow._dst AS dstid, \
        $$.player.name AS name | GO FROM $-.dstid OVER follow \
        YIELD follow._dst, follow.degree, $-.name;
```

`$-` 表示输入流。上一个查询的输出（此示例中 `dstid` , `name` ）作为下一个查询的输入（ `$-.dstid` ）。 其中， `$-. ` 后的别名必须为前一个子句 `YIELD`  定义的值，如本例中的 `dstid`  和 `name` 。

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【Nebula Importer 数据导入】，由社区用户 小辉 提出，Nebula Graph 官方解答，由于篇幅原因本文暂时只摘录部分的问题，全部问题见：[https://discuss.nebula-graph.com.cn/t/topic/361](https://discuss.nebula-graph.com.cn/t/topic/361)。

> 小辉 提问：导入点边数据有先后顺序吗，还是随机的？

**Nebula**：[Nebula Importer](https://github.com/vesoft-inc/nebula-importer) 实现上是每个文件起一个线程顺序读取，然后分给多个线程并行的插入 Nebula，所以不一定按照文件中数据的顺序插入，在导入多文件的情况下每个插入线程可能同时插入不同文件的数据。

> 小辉 提问：如何查看导入进度，怎么能知道导入到哪一步了，导入文件完成多少？

**Nebula**：数据导入的时候有 Finished 字段，可查看到已经写入信息，包括成功和失败条数。

> 小辉 提问：导入工具支持断点续传吗？

**Nebula**：不支持，欢迎社区给我们 contribute 代码，[Contributor Reward Plan](https://github.com/vesoft-inc/nebula/wiki/%E5%A6%82%E4%BD%95%E4%B8%BA-Nebula-Graph-%E5%81%9A%E8%B4%A1%E7%8C%AE) :)

## 推荐阅读

- [CPack 入门指南](https://nebula-graph.com.cn/posts/what-is-nebula-graph/)
  - 推荐理由：本文从一个简单的例子入手，讲述 Nebula Graph 打包工具 CPack 的使用。
- 往期 Pick of the Week
  - [Pick of the Week'20 | 第 20 周看点--长耗时任务管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-15/)
  - [Pick of the Week'20 | 第 19 周看点--数据库的角色管理](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-05-08/)
  - [Pick of the Week'20 | 第 17 周看点--字符比较运算符 CONTAINS](https://nebula-graph.io/cn/posts/nebula-graph-weekly-pickup-2020-04-24/)


本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《NGC 3572 附近的恒星、尘埃和云气》

![Nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW2021Nebula.png)

在影像里，NGC 3572 的成员星位在下缘附近，而它们上方的广袤气体云，可能是孕育它们的星云之孑遗。这幅影像醒目的色泽，源自氢、氧和硫发出的特定颜色辐射，以及融合了透过宽波段红、绿和蓝光滤镜拍摄的数据。位在南天船底座方向，NGC 3572 附近的这团星云，距离约有 9,000 光年，宽度则在 100 光年左右。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
