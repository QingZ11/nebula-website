---
title: "用 NetworkX + Gephi + Nebula Graph 分析<权力的游戏>人物关系（上篇）"
date: 2020-08-18
description: "本文介绍如何通过 NetworkX 访问开源的分布式图数据库 Nebula Graph，并借助可视化工具—— Gephi 来可视化分析《权力的游戏》中的复杂的人物图谱关系。"
tags: ["开发日志"]
author: 王杰
---

![权力的游戏](https://www-cdn.nebula-graph.com.cn/nebula-blog/game-of-thrones-01.png)

我们都知道《权利的游戏》在全世界都很多忠实的粉丝，除去你永远不知道剧情下一秒谁会挂这种意外“惊喜”，当中复杂交错的人物关系也是它火爆的原因之一，而本文介绍如何通过 [NetworkX](https://networkx.github.io/) 访问开源的分布式图数据库 [Nebula Graph](https://github.com/vesoft-inc/nebula)，并借助可视化工具—— [Gephi](https://gephi.org/) 来可视化分析《权力的游戏》中的复杂的人物图谱关系。

## 数据集

本文的数据集来源：冰与火之歌第一卷(至第五卷)[1]

- 人物集 (点集）：书中每个角色建模为一个点，点只有一个属性：姓名
- 关系集（边集）：如果两个角色在书中发生过直接或间接的交互，则有一条边；边只有一个属性：权重，权重的大小代表交互的强弱。

这样的点集和边集构成一个图网络，这个网络存储在图数据库 [Nebula Graph](https://github.com/vesoft-inc/nebula) [2]中。

## 社区划分——Girvan-Newman 算法

我们使用 NetworkX [3] 内置的社区发现算法 Girvan-Newman 来为我们的图网络划分社区。

以下为「社区发现算法 Girvan-Newman」解释：

> 网络图中，连接较为紧密的部分可以被看成一个社区。每个社区内部节点之间有较为紧密的连接，而在两个社区间连接则较为稀疏。社区发现就是找到给定网络图所包含的一个个社区的过程。
> 

> Girvan-Newman 算法即是一种基于[介数](https://zh.wikipedia.org/wiki/%E4%BB%8B%E6%95%B0%E4%B8%AD%E5%BF%83%E6%80%A7)的社区发现算法，其基本思想是根据边介数中心性（edge betweenness）从大到小的顺序不断地将边从网络中移除直到整个网络分解为各个社区。因此，Girvan-Newman 算法实际上是一种分裂方法。
> 

> Girvan-Newman 算法的基本流程如下：
> （1）计算网络中所有边的边介数；
> （2）找到边介数最高的边并将它从网络中移除；
> （3）重复步骤 2，直到每个节点成为一个独立的社区为止，即网络中没有边存在。

概念解释完毕，下面来实操下。

1. 使用 Girvan-Newman 算法划分社区。NetworkX 示例代码如下

```python
comp = networkx.algorithms.community.girvan_newman(G)
k = 7
limited = itertools.takewhile(lambda c: len(c) <= k, comp)
communities = list(limited)[-1]
```

2. 为图中每个点添加一个 community 属性，该属性值记录该点所在的社区编号

```python
community_dict = {}
community_num = 0
for community in communities:
    for character in community:
        community_dict[character] = community_num
        community_num += 1
        nx.set_node_attributes(G, community_dict, 'community')
```

## 节点样式——Betweenness Centrality 算法

下面我们来调整下节点大小及节点上标注的角色姓名大小，我们使用 NetworkX 的 Betweenness Centrality 算法来决定节点大小及节点上标注的角色姓名的大小。

> 图中各个节点的重要性可以通过节点的中心性（Centrality）来衡量。在不同的网络中往往采用了不同的中心性定义来描述网络中节点的重要性。Betweenness Centrality 根据有多少最短路径经过该节点，来判断一个节点的重要性。

1. 计算每个节点的介数中心性的值
```python
betweenness_dict = nx.betweenness_centrality(G) # Run betweenness centrality
```

2. 为图中每个点再添加一个 betweenness 属性

```python
nx.set_node_attributes(G, betweenness_dict, 'betweenness')
```

## 边的粗细

边的粗细直接由边的权重属性来决定。

通过上面的处理，现在，我们的节点拥有 name、community、betweenness 三个属性，边只有一个权重 weight 属性。

下面显示一下：

```python
import matplotlib.pyplot as plt
color = 0
color_map = ['red', 'blue', 'yellow', 'purple', 'black', 'green', 'pink']
for community in communities:
    nx.draw(G, pos = nx.spring_layout(G, iterations=200), nodelist = community, node_size = 100, node_color = color_map[color])
    color += 1
plt.savefig('./game.png')
```

emmm，有点丑…

![NetworkX 可视化](https://www-cdn.nebula-graph.com.cn/nebula-blog/networkx.png)

虽然 NetworkX 本身有不少可视化功能，但 Gephi [4] 的交互和可视化效果更好。

## 接入可视化工具 Gephi

现在将上面的 NetworkX 数据导出为 game.gephi 文件，并导入 Gephi。

```python
nx.write_gexf(G, 'game.gexf')
```

![Gephi 界面](https://www-cdn.nebula-graph.com.cn/nebula-blog/gephi-01.jpeg)

## Gephi 可视化效果展示

在 Gephi 中打开刚才导出的 `game.gephi` 文件，然后微调 Gephi 中的各项参数，就以得到一张满意的可视化：

1. 将布局设置为 Force Atlas, 斥力强度改为为 500.0， 勾选上 `由尺寸调整` 选项可以尽量避免节点重叠：

Force Atlas 为力引导布局，力引导布局方法能够产生相当优美的网络布局，并充分展现网络的整体结构及其自同构特征。力引导布局即模仿物理世界的引力和斥力，自动布局直到力平衡。

![Gephi 界面](https://www-cdn.nebula-graph.com.cn/nebula-blog/gephi-02.png)

2. 给划分好的各个社区网络画上不同的颜色：

在外观-节点-颜色-Partition 中选择 community（这里的 community 就是我们刚才为每个点添加的社区编号属性）

![Gephi 界面](https://www-cdn.nebula-graph.com.cn/nebula-blog/gephi-03.png)

3. 决定节点及节点上标注的角色姓名的大小：

在外观-节点-大小-Ranking 中选择 betweenness（这里的 betweenness 就是我们刚才为每个点添加的 betweenness 属性)

![Gephi 界面](https://www-cdn.nebula-graph.com.cn/nebula-blog/gephi-04.png)

4. 边的粗细由边的权重属性来决定：

在外观-边-大小-Ranking 中选择边的权重

![Gephi 界面](https://www-cdn.nebula-graph.com.cn/nebula-blog/gephi-05.png)

5. 导出图片再加个头像效果

![权力的游戏](https://www-cdn.nebula-graph.com.cn/nebula-blog/game-of-thrones-02.png)

![权力的游戏](https://www-cdn.nebula-graph.com.cn/nebula-blog/game-of-thrones-03.png)

大功告成，一张权力游戏的关系谱图上线 :) 每个节点可以看到对应的人物信息。

## 下一篇

本篇主要介绍如何使用 NetworkX，并通过 Gephi 做可视化展示。下一篇将介绍如何通过 NetworkX 访问图数据库 [Nebula Graph](https://github.com/vesoft-inc/nebula) 中的数据。

本文的代码可以访问[5]。

**致谢：本文受工作 [6] 的启发**

## Reference

[1] [https://www.kaggle.com/mmmarchetti/game-of-thrones-dataset](https://www.kaggle.com/mmmarchetti/game-of-thrones-dataset)

[2] [https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula)

[3] [https://networkx.github.io/](https://networkx.github.io/)

[4] [https://gephi.org/](https://gephi.org/)

[5] [https://github.com/jievince/nx2gephi](https://github.com/jievince/nx2gephi)

[6] [https://www.lyonwj.com/2016/06/26/graph-of-thrones-neo4j-social-network-analysis/](https://www.lyonwj.com/2016/06/26/graph-of-thrones-neo4j-social-network-analysis/)

喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

> 作者有话说：Hi，我是王杰，是图数据 Nebula Graph 研发工程师，希望本次的经验分享能给大家带来帮助，如有不当之处也希望能帮忙纠正，谢谢~
