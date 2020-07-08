---
title: "D3.js 力导向图的显示优化（二）- 自定义功能"
date: 2020-07-08
description: "在本文中，我们将借助 D3.js 的灵活性这一优势，去新增一些 D3.js 本身并不支持但我们想要的一些常见的功能：Nebula Graph 图探索的删除节点和缩放功能"
tags: ["开发日志"]
author: Nico
---

![D3显示优化](https://www-cdn.nebula-graph.com.cn/nebula-blog/D3显示优化.png)

## 前言
在上篇文章中（[D3.js 力导向图的显示优化](https://nebula-graph.com.cn/posts/d3-force-layout-optimization/)），我们说过 [D3.js](https://d3js.org/) 在自定义图形上相较于其他开源可视化库的优势，以及如何对文档对象模型（DOM）进行灵活操作。既然 D3.js 辣么灵活，那是不是实现很多我们想做的事情呢？在本文中，我们将借助 [D3.js](https://d3js.org/) 的灵活性这一优势，去新增一些 D3.js 本身并不支持但我们想要的一些常见的功能。

## 构建 D3.js 力导向图

在这里我们就不再细说 d3-force 粒子物理运动模块原理，感兴趣同学可以看看我们的[上篇](https://nebula-graph.com.cn/posts/d3-force-layout-optimization/#d3-force%E5%8A%9B%E5%AF%BC%E5%90%91%E5%9B%BE)的简单描述, 本次实践我们侧重于可视化操作的功能实现。

好的，进入我们的实践时间，我们还是以 D3.js 力导向图对图数据库的数据关系进行分析为目的，增加一些我们想要功能。

首先，我们用 [d3-force](https://d3js.org.cn/document/d3-force/#installing) 力导向图来构建一个简单的关联网

```javascript
this.force = d3
        .forceSimulation()
        // 为节点分配坐标
        .nodes(data.vertexes)
        // 连接线
        .force('link', linkForce)
        // 整个实例中心
        .force('center', d3.forceCenter(width / 2, height / 2))
        // 引力
        .force('charge', d3.forceManyBody().strength(-20))
        // 碰撞力 防止节点重叠
        .force('collide',d3.forceCollide().radius(60).iterations(2));
```

通过上述代码，我们可以得到下面这样一个可视化的节点和关系图。

![Nebula Graph Studio](https://www-cdn.nebula-graph.com.cn/nebula-blog/Nebula-Graph-Studio.png)

这里我们简单介绍下上图，上图为图数据库 Nebula Graph 可视化工具 Studio 的图探索功能截图，在业务上，图探索支持用户任意选中某个点进行拓展，找寻、显示同它存在某种关系的点，例如上图点 100 和 点 200 存在单向 follow 关系。

上图数据量并不大，如果我们在拓展时返回的数据量较大或多步拓展出来的数据逐步累加显示，则会导致当前视图页节点和边极多，页面需呈现的数据信息量大，且也不好找到想要的某个节点。好的，一个新场景上线了：用户只想分析图中的部分节点数据，不想看到全部的节点信息。删除任意选中这个新功能就可以很好地应对上面场景，删除不需要的节点信息，只留下想探索的部分节点数据。

## 支持删除任意选中功能

在实现这个功能之前，我先开始介绍下 D3.js 自带 API。没错，还是[上篇](https://nebula-graph.com.cn/posts/d3-force-layout-optimization/#%E5%AE%9E%E7%8E%B0%E6%8B%93%E5%B1%95%E6%9F%A5%E8%AF%A2%E6%98%BE%E7%A4%BA%E4%BC%98%E5%8C%96)提及的 D3.js 的 [enter()](https://www.d3js.org.cn/#enter%E5%92%8Cexit%E6%93%8D%E4%BD%9C) 及没提到的 [exit()](https://www.d3js.org.cn/#enter%E5%92%8Cexit%E6%93%8D%E4%BD%9C)

摘自文档的描述：

> 数据绑定的时候可能出现 `DOM` 元素与数据元素个数不匹配的问题， `enter` 和 `exit` 就是用来处理这个问题的。`enter` 操作用来添加新的 `DOM` 元素，`exit` 操作用来移除多余的 `DOM` 元素。
> 如果数据元素多于 `DOM` 个数时用 `enter`，如果数据元素少于 `DOM`元素，则用 `exit`。
> 在数据绑定时候存在三种情形：
> - 数据元素个数多于 `DOM` 元素个数
> - 数据元素与 `DOM` 元素个数一样
> - 数据元素个数少于 `DOM` 元素个数


根据文档描述，想实现删除任意选中功能还是很简单的，乐观的笔者想当然地认为直接在数据层面进行操作就行。于是笔者直接在 nodes 数据里删除选中的节点数据 node，然后根据官方用法 `d3.select(this.nodeRef).exit().remove()` 移除多余的元素，好的，我们现在来看看这样做会带来了什么？

![D3移除元素](https://www-cdn.nebula-graph.com.cn/nebula-blog/D3移除元素.png)

不想选中的节点是删除了，但其他节点的显示也乱了，节点颜色和属性同当前 DOM 节点对不上，为什么会这样呢？笔者又仔仔细细地看了一遍上面的文档描述，灵光一闪，来，先打印下 exit().remove() 的节点，看看到底它 remove 哪些节点？

果然是它，D3.js enter().exit() 的触发其实是在监听元素的个数的变化，也就是说，如果总个数缺少了两个，它确实会触发 exit() 方法，但是它处理的数据不是真正需删除的数据，而是当前 nodes 数据最后两个节点。说白了 enter()、exit() 的触发原理，是 D3.js 监听当前数据的长度变化来触发的。然而 D3.js 在获取数据长度变化之后，以 exit() 为例，对单个数据的处理方法是根据长度的减量 N 截取数据数组位置中最后 N 位到最后一位区间的所有元素，enter() 则相反，会在数组位置中最后一个元素后面增加 N 个数据。

所以，如果选中删除的是之前拓展探索出来的节点（它不是当前数据数组位置的最后一个元素），进行删除操作时，虽然从我们的 nodes 数据里面删除了这个数据，但是在已经存在的视图中，d3.select(this.nodeRef).exit() 方法定位到的操作元素却是最后一个，这样显示就乱套了，那么，我们该如何处理这个问题呢？

这里就直接分享下我的方法，简单粗暴但有效——显然这个 exit() 并不能满足删除选中节点的业务需求，那我们单独地处理需删除的节点。我们定位到真实删除的节点 DOM 进行操作，为此我们需要在渲染时给每个节点绑定一个 ID，然后再进行遍历，根据已删除的节点数据找到这些需要删除的节点对应的 DOM，以下为我们的处理代码：

```javascript
  componentDidUpdate(prevProps) {
    const { nodes } = this.props;
    if (nodes.length < prevProps.nodes.length) {
      const removeNodes = _.differenceBy(
        prevProps.nodes,
        nodes,
        (v: any) => v.name,
      );
      removeNodes.forEach(removeNode => {
        d3.select('#name_' + removeNode.name).remove();
      });
    } else {
      this.labelRender(this.props.nodes);
    }
  }
```

其实在这里需要处理的不仅仅定位到当前真实删除节点的 DOM，还需要将它所关联的边、显示文案一并删除。因为没有起点/终点的边，是没有任何意义的，边、文案的处理方法同点删除的逻辑类似，这里不做赘述，如果你有任何疑问，欢迎前往我们的项目地址：[https://github.com/vesoft-inc/nebula-web-docker](https://github.com/vesoft-inc/nebula-web-docker) 进行交流。

## 支持按钮缩放功能

说完删除选中点，在可视化视图中缩放操作也是比较常见的功能，D3.js 中的 [d3.zoom()](https://www.d3js.org.cn/document/d3-zoom/#api-reference) 就是用来实现缩放功能的，且该方法经过其他厂的业务考验相对来说成熟稳定，那我们还有什么理由要自己做呢？（要啥自行车 😂）。

其实缩放功能纯粹是交互改动层面上的一个功能。采用滚轮控制缩放的方案的话，不了解 Nebula Graph Studio 的用户很难发现这种隐藏操作，而且滚动控制缩放无法控制缩放的明确比例，举个例子，用户想缩放 30% / 50%，对于这种限定的比例，滚动控制缩放就无能为力了。除此之外，笔者在实施滚轮缩放的过程中发现滚动缩放会影响节点和边的位置偏移，这又是什么原因造成的呢？

通过查看 d3.zoom() 代码，我们发现 D3.js 本质是获取事件中 d3.event 的缩放值再针对整个画布修改 transform 属性值，但这样处理 svg 中的节点和边元素 x、y 坐标不发生变化，所以导致 d3.zoom() 实现缩放功能时，放大画布，视图会往坐左上方偏移（因为对画布来说，相较视图中的边元素 x、y 坐标，自己变小了），缩小画布，视图会往右下方偏移。

发现问题形成的原因是解决问题的第一步，下面来解决下问题，在进行缩放时添加一个节点和边相对画布大小偏移量的变化处理逻辑，好的，那开始操作吧。

我们先弄一个滑动条控件提供给用户进行手动控制缩放画布的比例，直接用 antd 的[滑动条](https://ant.design/components/slider-cn/)，根据它滑动的的值来控制整个画布缩放比例，下面直接贴代码了

```javascript
 <svg
  width={width}
  viewBox={`0 0 ${width * (1 + scale)}  ${height * (1 + scale)}`}
  height={height}
  >
 {/*****/}
</svg>
```

上面代码中的 scale 参数是我们根据控件滚动条中缩放值来生成的，我们需要记录这个值来放大画布（svg 元素)，从来造成视图缩小的效果的。

此外，我们处理下上面提到的节点和边偏移问题时也需要 scale 值，因为我们需要给节点和边设置一个反偏移量。简单的说，画布放大 scale 倍，节点和边的 x、y 位置也要相对画布偏移当前的 scale 倍，这样就能保持在缩放过程中，节点和边位置相对画布大小变化而保持不变。下面就是处理节点缩放过程中偏移的关键代码

```javascript
 const { width, height } = this.props;
    const scale = (100 - zoomSize) / 100;
    const offsetX = width * (scale / 2);
    const offsetY = height * (scale / 2);
    // 操作节点边父元素 DOM <g/> 的偏移
    d3.select(this.circleRef).attr(
      'transform',
      `translate(${offsetX} ${offsetY})`,
    );
```

## 结语

好了，以上便是笔者使用 D3.js 力导向图实现关系网的在自定义功能过程中思路和方法。不得不说，D3.js** **的自由度真的高，我们可以尽情地开脑洞实现我们想要的功能。

在这次分享中，笔者分享了图数据库可视化业务中 2 个实用且用户高频使用的功能：任意选中删除节点、自定义缩放并优化视图偏移功能。说到可视化展示一个复杂的关系网，需要考虑的问题还很多，需要优化的交互和显示的地方也很多，我们会持续优化，后续我们会更新 D3.js 优化系列文，[欢迎订阅 Nebula Graph 博客](https://nebula-graph.com.cn/posts/)。

喜欢这篇文章？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

> 作者有话说：Hi，我是 Nico，是 Nebula Graph 的前端工程师，对数据可视化比较感兴趣，分享一些自己的实践心得，希望这次分享能给大家带来帮助，如有不当之处，欢迎帮忙纠正，谢谢~

