---
title: "Pick of the Week'20 | 第 27 周看点--DB-Engine 7 月榜发布"
date: 2020-07-03
description: "在本期 Pick of the Week 中你将详细了解到 LOOKUP 的用法及如何进行 docker swarm 的部署"
tags: ["社区","产品动态"]
author: 清蒸
---

![每周看点](https://www-cdn.nebula-graph.com.cn/nebula-blog/PotW.png)

> 每周五 Nebula 为你播报每周看点，每周看点由固定模块：特性讲解、Nebula 产品动态、社区问答、推荐阅读，和随机模块：本周大事件构成。

即将送走的是 2020 年第 27 个工作周的周五 🌝 来和 Nebula 一块回顾下本周图数据库和 Nebula 有什么新看点~~

## 本周大事件

- [DB-Engine 7 月榜单发布](https://db-engines.com/en/ranking/graph+dbms)

![DB-Engine](https://www-cdn.nebula-graph.com.cn/nebula-blog/DB-Engine.png)

可以看到 Top10 的排名基本没发生太大变化，Nebula Graph 在 7 月榜上表现不错，上升了一名，和 Nebula Graph 1.0 及开发商欧若数网 Pre-A 融资等利好消息不无关系。

## 特性讲解

- [索引查询](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/)

在创建或重建索引后，即可使用 `LOOKUP` 进行索引查询操作。使用索引查询的最大优势不仅在于速度快，而且无需知道 VID 仅通过属性过滤即可查询目标数据。 
`LOOKUP` 查询结果默认返回点或边的基础信息，通过 `YIELD` 语句可以改变返回的数据类型，如点或边的属性。

使用 `WHERE` 语句在 `LOOKUP` 中过滤时需要注意有 3 类操作暂不支持：
1. 不支持 srcVID 和 dstVID 的表达，即 $-  $^  $$ 不可用；
1. 对两个 field-name 进行判断，如：tagName.column1 > tagName.column2
1. 暂不支持运算表达式和 function 表达式中嵌套 AliasProp 表达式

现在来让我们试试索引查询

```markdown
# 查询球员名字为 Marco Belinelli 的点
(user@nebula) [nba]>  LOOKUP ON player WHERE player.name == "Marco Belinelli";
============
| VertexID |
============
| 104      |
------------
```
```markdown
# 查询球员名字为 Marco Belinelli 或球员年龄大于 40 岁的点
(user@nebula) [nba]>  LOOKUP ON player WHERE player.name == "Marco Belinelli" OR player.age > 40;
============
| VertexID |
============
| 140      |
------------
| 100      |
------------
| 136      |
------------
| 125      |
------------
| 148      |
------------
| 141      |
------------
| 104      |
------------
| 144      |
------------
| 127      |
------------
```
在Nebula Studio中表示这些被被查询的点

![studio](https://www-cdn.nebula-graph.com.cn/nebula-blog/studio.png)

```markdown
# 查询球员名字为 Marco Belinelli 的点，并以此点为起点沿 serve 边查询 Marco Belinelli 的服役经历 
(user@nebula) [nba]>  LOOKUP ON player WHERE player.name == "Marco Belinelli" YIELD player.name AS name | GO FROM $-.VertexID OVER serve YIELD $-.name, serve.start_year, serve.end_year, $$.team.name; 
====================================================================== 
| $-.name         | serve.start_year | serve.end_year | $$.team.name | 
====================================================================== 
| Marco Belinelli | 2007             | 2009           | Warriors     | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2015             | 2016           | Kings        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2009             | 2010           | Raptors      | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2018             | 2018           | 76ers        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2012             | 2013           | Bulls        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2017             | 2018           | Hawks        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2018             | 2019           | Spurs        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2010             | 2012           | Hornets      | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2013             | 2015           | Spurs        | 
---------------------------------------------------------------------- 
| Marco Belinelli | 2016             | 2017           | Hornets      |
---------------------------------------------------------------------- 
```
```markdown
# 查询 follow 边上满足 degree 等于 90 的边有哪些 
(user@nebula) [nba]> LOOKUP ON follow WHERE follow.degree == 90; 
============================= 
| SrcVID | DstVID | Ranking | 
============================= 
| 142    | 117    | 0       | 
----------------------------- 
| 118    | 120    | 0       | 
----------------------------- 
| 128    | 116    | 0       | 
----------------------------- 
| 138    | 115    | 0       | 
----------------------------- 
| 140    | 114    | 0       | 
----------------------------- 
| 133    | 114    | 0       | 
----------------------------- 
| 143    | 150    | 0       | 
----------------------------- 
| 136    | 117    | 0       | 
----------------------------- 
| 129    | 116    | 0       | 
----------------------------- 
| 121    | 116    | 0       | 
----------------------------- 
| 114    | 103    | 0       | 
----------------------------- 
| 127    | 114    | 0       | 
----------------------------- 
| 147    | 136    | 0       |
----------------------------- 
```
## 社区问答
Pick of the Week 每周会从官方论坛、微博、知乎、微信群、微信公众号及 CSDN 等渠道精选问题同你分享，欢迎阅读本文的你通过知乎、微信公众号后台或者添加 Nebula 小助手微信号：NebulaGraphbot 进群交流。

本周分享的主题是【docker swarm 的部署】，由社区用户 henson 提出，Nebula Graph 官方解答。

> henson 提问：docker swarm 的部署正确的方式是？

**Nebula**：swarm 部署的方式可以参见 [nebula-docker-compose#docker-swarm](https://github.com/vesoft-inc/nebula-docker-compose/blob/docker-swarm/docker-stack.yaml) 分支。具体使用方式如下：
0. 准备 docker swarm 集群，通过 `docker swarm init/join` 初始化每个 node，如果后面遇到端口等问题，可以注意一下每个节点的防火墙是否关闭。
0. 将 swarm 集群中的每个 node 根据 ip 设置对应的 hostname（或者其他可以区分的 hostname）
0. clone 上述工程的分支：`git clone --branch docker-swarm --single-branch --depth 1 [https://github.com/vesoft-inc/nebula-docker-compose](https://github.com/vesoft-inc/nebula-docker-compose)`
0. 将上述 docker-stack.yaml 中的 ip 改成你自己的节点 ip，并且 `node.hostname` 的 constraints 改成上述对应的 node 的 hostname
0. 通过 docker stack 部署：`docker stack deploy -c docker-stack.yaml nebula`
0. 查看 nebula 所有的 service： `docker stack services nebula`

上述中的具体思路就是，让每个 container 分别部署到对应的 node 上，同时使用该 node 上的 network，这样 nebula 在配置的时候就直接使用 host 的 ip 即可了。关键点在于 network 的类型。

## 推荐阅读

- 往期 Pick of the Week
   - [Pick of the Week'20 | 第 25 周看点--1.0 基准测试报告出炉](https://nebula-graph.com.cn/posts/nebula-graph-weekly-pickup-2020-06-19/)

本期 Pick of the Week 就此完毕，如果你对本周看点或 Nebula Graph 有任何建议，欢迎前去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) 或者官方论坛：[https://discuss.nebula-graph.com.cn](https://discuss.nebula-graph.com.cn) 向我们提出。若你想加入图数据库交流群，请添加 Nebula 小助手微信：[NebulaGraphbot](https://nebula-blog.azureedge.net/nebula-blog/nbot.png)

## 星云·小剧场

**为什么给图数据库取名 Nebula ？**

Nebula 是星云的意思，很大嘛，也是漫威宇宙里面漂亮的星云小姐姐。对了，Nebula 的发音是：[ˈnɛbjələ]

本文星云图讲解--《侧向的纺锤星系》

![nebula](https://www-cdn.nebula-graph.com.cn/nebula-blog/nebula.jpeg)

许多扁盘状星系其实和此图中的 NGC 5866 一样纤薄。编录号为 M102 及 NGC 5866 的纺锤星系，拥有数量众多、形状复杂、色泽非黑即红的尘埃带，而星系盘上的大量亮星则让此星系的底色偏蓝。纺锤星系位在天龙座内，离我们约有 5 千万光年远。

资料来源 | Robert Nemiroff (MTU) & Jerry Bonnell (UMCP), Phillip Newman (NASA);
图片来源 | NASA Official

![关注公众号](https://www-cdn.nebula-graph.com.cn/nebula-blog/WeChatOffical.png)
