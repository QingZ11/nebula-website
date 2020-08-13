---
title: "D3.js Examples for Advanced Uses - Custom Visualization"
date: 2020-08-13
description: "This article will show you how to take full advantage of the flexiblility of D3.js to realize on-demand functions which are not supported by D3.js itself."
author: "Nico"
tags: ["features", "dev-log"]
---

![D3.js Examples for Advanced Uses - Custom Visualization](https://user-images.githubusercontent.com/57335825/90104877-da8f1900-dcf9-11ea-9e73-b96e3be620c6.png)


In the previous article [D3-Force Directed Graph Layout Optimization in Nebula Graph Studio](https://nebula-graph.io/posts/d3-force-layout-optimization/), we have discussed the advantages that D3.js has over other open source visualization libraries in custom graph  and the flexible operations on the document object model (DOM) with D3 js. Given the customizability of the D3.js, is it possible to achieve whatever I want by using it? In this article, I will show you how to take full advantage of the flexibility of D3.js to realize on-demand functions which are not supported by D3.js itself.

## Building the D3-Force Directed Graph

Here I won't elaborate on the principle of the particle physical movement module of the d3-force. You can refer to our previous [post](https://nebula-graph.io/posts/d3-force-layout-optimization/) if you are interested in this topic. Instead, I will focus on the practice of visualization in this article.

Now let me show you how I developed some new functions with the help of D3.js to better analyze the graph databases. Firstly, let's build a simple relationship network with the [d3-force](https://d3js.org.cn/document/d3-force/#installing) directed graph.

```Shell
this.force = d3
        .forceSimulation()
        // Allocate coordinates for the vertices
        .nodes(data.vertexes)
        // Link
        .force('link', linkForce)
        // For setting the center of gravity of the system
        .force('center', d3.forceCenter(width / 2, height / 2))
        // The gravity
        .force('charge', d3.forceManyBody().strength(-20))
        // The collision force, for preventing the vertices from overlapping
        .force('collide',d3.forceCollide().radius(60).iterations(2));

```

We can get the following vertices and relationships graph with the preceding code.

![Build a sample relationship network](https://user-images.githubusercontent.com/57335825/90103470-6b182a00-dcf7-11ea-9d52-aca261294ba3.png)

The preceding figure is a screenshot of the exploration tab of the graph visualization tool, Nebula Graph Studio. There you can select a certain vertex as the starting point of exploration by finding other vertices that are associated with it. For example, in this figure, vertex 100 and vertex 200 are connected with a single directed follow relation.

The problem is, if I have a super vertex which have thousands of edges, or if I want to display multi-hop query results, then the visual graph needs to display vertices and edges in huge density. It is also difficult to locate a specific vertex. Chances are users want to analyze only part of the data in the graph instead of the whole graph. Deleting the selected data will be a great solution to this scenario. You just delete the unwanted data and keep what you want.

## Deleting the Selected

Before introducing how this function is implemented, let me begin with the native APIs provided by D3.js. Yes, I mean the [enter()](https://github.com/d3/d3-selection/blob/v1.4.1/README.md#selection_enter) mentioned in the previous [post](https://nebula-graph.io/posts/d3-force-layout-optimization/) and [exit()](https://github.com/d3/d3-selection/blob/v1.4.1/README.md#selection_exit) I didn't cover last time. Here are some descriptions from the documentation:

> _When binding data, it's likely that the array has more (or less) elements than the DOM elements. Fortunately D3 can help in adding and removing DOM elements using the `.enter` and `.exit`_.
> _If the array is longer than the selection there’s a shortfall of DOM elements and we need to add elements with `enter`_.
> _If the array is shorter than the selection there’s a surplus of DOM elements and we need to remove elements with `exit`_.
> _There are three cases in data binding_:
> • _A shortfall of DOM elements_
> • _A surplus of DOM elements_
> • _The array is equal with the DOM elements_

According to the documentation, it seems simple to implement the "deleting the selected" function. I was so optimistic that I thought simply operating on the data level was enough. Thus I deleted some vertices directly from the vertices data, then removed the extra element with the `d3.select(this.nodeRef).exit().remove()` API. Now let's check the result of this operation:

![Deleted the selected nodes with d3.js](https://user-images.githubusercontent.com/57335825/90103845-0c06e500-dcf8-11ea-8d38-bff01e285be7.png)

The targeted vertices are deleted as expected. However, other vertices are messed up because the colors and properties of the vertices are inconsistent with the current `DOM` vertices. Why? I checked the documentation more carefully and was inspired by an idea. Why not print the exit().remove() vertices out to see which vertices are removed?

Sure enough my guess has been confirmed. It's the length change of the listening element that triggers the `enter()` and `exit()` function. That is to say, if two elements are taken out, the `exit()` will be triggered. But it won't process the data you want to delete. Instead, it processes the last two vertices of the current data. In another word, `enter()` and `exit()` are triggered by the data length. However, take `exit()` as example, when D3.js detects any data length changes, say N, it will cut all the elements between the last N and the last element. On the contrary, `enter()` will add N pieces of data after the last element in the array.

Therefore, although the vertices are deleted from the previously returned data (apparently they are not the last element in the current array), the `d3.select(this.nodeRef).exit()` will locate the last element in the existing graph. This is totally a mess. So how to deal with this issue?

The D3.js recommends that you solve this problem with the officially provided [merge function](https://www.d3indepth.com/enterexit/). But in our case, since we know the IDs of the vertices to be deleted, we operated directly on the DOM.

Here's my simple yet effective solution. Since the `exit()` API can't meet our requirements, I will process the vertices to be deleted separately. First I need to locate the DOM where the deleting operation is actually performed. To achieve this, I need to bind an ID to each vertex when rendering. Then I traverse. Find the corresponding DOM of the deleted vertices based on their ID. Following is my code:

```shell
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

In fact, I  need to not only locate the actual DOM, but also delete all the associated edges and displaying properties of the deleted vertices. This is because an edge without a start or destination vertex is meaningless. The processing method of edges and properties are similar to deleting vertices. If you have any questions, please bring us an issue on [GitHub](https://github.com/vesoft-inc/nebula-web-docker).

## The Zoom Button

In addition to deleting the selected, zoom is another common function in data visualization. The [d3.zoom()](https://github.com/d3/d3-zoom/blob/v1.8.3/README.md#zoom) API in D3.js is designed to solve such problems. And it performs stably because it has been  battle tested by many users. Then why do I bother reinventing the wheel?

In fact, zoom is purely an interactive function. Of course I can use the scroll wheel to zoom. But users who know little about Nebula Graph Studio can hardly find this hidden function, and the zoom proportion is hard to control with a scroll wheel. For example, the scroll wheel is useless if you want to zoom to a certain ratio, say 30% or 50%. In addition, during the process of implementing zoom by using the scroll wheel, I found that scrolling will affect the position offset of vertices and edges. What is the reason for this?

By checking the `d3.zoom()` code, I found that D3.js first gets the zoom value of the d3.event and then modify the transform value for the entire canvas. But such processing method won't change the x and y coordinates of the vertices and edges. Thus when implementing zoom in with d3.zoom(), the view will shift to the upper left (because compared with the x and y coordinates of the edge elements in the view, the canvas becomes smaller). And when implementing zoom out with `d3.zoom()`, the view will shift to the bottom right.

When zooming the canvas, we will process the vertex and edge location relative to the canvas size according to the zoom value.

We provide the users with a slider to control the zoom ratio of the canvas. Here we use the [Slider](https://ant.design/components/slider/) designed by antd. It can control the zoom ratio based on its slide values. Following is the code:

```Shell
<svg
  width={width}
  viewBox={`0 0 ${width * (1 + scale)}  ${height * (1 + scale)}`}
  height={height}
  >
 {/*****/}
</svg>
```

The scale parameter in the preceding code is generated based on the zoom value for the slider. We need to record the value to zoom in the canvas (svg element) so that a zoom out effect is achieved.

In addition, we also need the scale value when processing the above-mentioned vertex and edge offset. Therefore, we need to set an de-offset value for the vertex and edge. Simply put, if the canvas is enlarged by scale times, the coordinates of the vertices and edges must offset by scale times so that the relative locations of the vertices and edges are not changed in the canvas. Following is the core code of the offset:

```Shell
const { width, height } = this.props;
    const scale = (100 - zoomSize) / 100;
    const offsetX = width * (scale / 2);
    const offsetY = height * (scale / 2);
    // Set the offset for the partent DOM <g/> of the vertices and edges to be operated on 
    d3.select(this.circleRef).attr(
      'transform',
      `translate(${offsetX} ${offsetY})`,
    );
```

## Conclusion

In this article, I shared two practical and frequently used functions in data visualization: deleting the selected data and custom zooming (including optimizing the graph offset). There are still many issues to consider in visualizing a relational graph. D3.js is so highly customizable that we can implement whatever functions we want. Imagination is the only limit.

We will keep on optimizing and sharing our using experience on D3.js in the future. Stay tuned!

> _Hi, I'm Nico, the front-end engineer at Nebula Graph. I'm interested in data visualization and would like to share my experiences in this regard. Hope my post is of help to you. Please let me know if you have any ideas about this. Thanks!_

## You might also like

- [Automating Your Project Processes with Github Actions](https://nebula-graph.io/posts/github-action-automating-project-process/)
- [How to Reduce Docker Image Size](https://nebula-graph.io/posts/how-to-reduce-docker-image-size/)
