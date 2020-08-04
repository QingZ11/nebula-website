---
title: "Pick of the Week'20 | 第 31 周看点--图遍历支持 int 类型传入查询"
date: 2020-07-31
description: "在本次的每周看点中你将了解最近的图遍历功能的使用，及 Nebula Graph 中 VID、TAG 等概念。"
tags: ["社区","产品动态"]
author: "乔治, 清蒸"
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 31 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 特性讲解

- [图遍历支持 int 类型传入查询](https://github.com/vesoft-inc/nebula/pull/2225)

本周图遍历（GO）迎来新功能——支持将 int 类型数据传入 GO 语句中查询。这丰富了图遍历的应用场景，通过传入 int 类型数据进行图遍历简化了查询操作也直接的提升了查询性能。

例如：为代表用户 ID 的点创建 timestamp 类型属性，并创建以相同 timestamp 为 vid 的点来记录用户操作。此时通过 `FETCH` 、 `LOOKUP` 等语句查询出一定范围的点，将查询到的点所包含的 timestamp 属性作为 ID 传入 GO 语句即可查询到该时间戳所对应的操作记录。

此处我们创建一个小场景来展示新功能所带来的便利性，首先创建 tag t4 用于描述用户姓名和操作时间，创建 tag t5 用于描述用户操作，在这里我们使用 t4 中的时间戳作为 tag t5 关联的点 ID。

用 Nebula studio 图探索功能展示关系如下：

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203101.png)

- create tag t4(user_name string, action_time timestamp);
- create tag t5(user_action string);

创建边的 schema，用于描述 t4（用户）与 t5（用户操作）的关系为玩游戏。

- create edge play_games ();

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203102.png)

此时插入点 730 关联 tag t4 用于描述用户姓名和操作时间

- insert vertex t4(user_name, action_time) values 730:("xiaowang",1596103557);

插入点 1596103557 用于表示在此时间戳时用户的行为是“play smart phone games”。

- insert vertex t5(user_action) values 1596103557:("play smart phone games");

插入一条边用于关联两个点的关系

- insert edge play_games() values 730->1596103557:();

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203103.png)

由于 GO 语句新功能的加入，我们此时可以通过一条 query 进行查询。

这条 query 表示通过查询点 730 的所有 tag，使查询到的属性 t4.action_time 作为变量 timeid。通过 pipe 传入 GO 语句在边 play_games 上做反向查询，将这条边上的起始点属性 t5.user_action 作为 players_action 标题进行展示。

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW203104.png)

## 社区问答

Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享。

本周分享的主题是【Nebula Graph 中的 VID、TAG】，由社区用户 tmac 提出，Nebula Graph 官方解答。

> tmac 提问：VID 是在整个图空间中唯一，还是在一类 TAG 上唯一呢？edge vid1->vid2 是 vid1 关联的所有tag（可能有多个）都会指向 vid2 关联的所有 tag 是吗？

**Nebula**：Vid 是 Nebula Graph 中一个点的唯一标示，Tag 是对一个点描述的属性集合，点和点之间的关系通过 Edge（边）确定。同时如 Tag 一样，边上也可以附加属性集合，属性集合称作 Edge。

举个例子更容易理解，例如有一个人，我们把他当作一个点，那这个 Vid 就是这个人的唯一标示，例如这个人有两个身份：“学生” 和 “粉丝” 。那么相对应的 Tag 也有两个：

- create tag 学生（系，班级，社团）
- create tag 粉丝（关注对象，关注开始时间，媒介类别）

由上边的例子可知，一个 Vid 可以关联多个 Tag，例如

- Tom(Vid1)_学生(TagId1) : 计算机系_1班_ 篮球
- Tom(Vid1)_粉丝(TagId2) : 老罗_2020-1_B站

再来解释一下点和点之间的关系，点和点之间的关系用 Edge 来描述，例如有两个点 ：

- Tom(Vid1)_学生(TagId1) : 计算机系_1班_ 篮球
- Jack(Vid2)_学生(TagId1) : 财经系_2班_柔道
- Tom(Vid1)_粉丝(TagId2) : 老罗_2020-1_B站
- Jack(Vid2)_粉丝(TagId2) : 老罗_2021-1_B站

这两个人可能是老乡，也可能是同一个人的粉丝，那建立他们的关系如下

- create Edge 关系 (老乡)
- create Edge 关注推荐（关注对象）

关系如下：

- Tom(Vid1) -> 老乡(Edge 关系)-> Jack(Vid2)
- Jack(Vid2) -> 推荐老罗（Edge 关注推荐）-> Tom(Vid1)


由例子可知，Vid1 指向 Vid2 并不是由 Tag 决定，而是由 Edge 决定。所以关于“vid1 关联的所有 tag（可能有多个）都会指向 vid2 关联的所有 tag 是吗”这个问题，可以理解为点通过 Edge 搜索其有关系的目标点，寻找到目标顶点后，可以通过目标顶点的 Vid 再进一步查看其相关的 Tag。

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 30 周看点--属性查询迎来新功能](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-24/)
   - [Pick of the Week'20 | 第 29 周看点-- nGQL vs SQL](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-07-17/)

本期 Pick of the Week 就此完毕，喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
