---
title: "Performance Comparison: Neo4j vs Nebula Graph vs JanusGraph"
date: 2020-08-14
description: "This article describes how the Tencent Cloud team compares Nebula Graph with two other popular graph databases on the market, i.e. Neo4j and JanusGraph, from several perspectives. "
author: "Tencent Cloud Team"
tags: ["user-review"]
---

![Performance Comparison: Neo4j vs Nebula Graph vs JanusGraph](https://user-images.githubusercontent.com/57335825/90241167-5ca53d80-dddf-11ea-8e28-ca9a6b6b1ad5.png)

## Who Did the Comparison

This article describes how the Tencent Cloud team compares Nebula Graph with two other popular graph databases on the market from several perspectives.

By their nature of dealing with interconnections, graph databases are perfect for fraud detection and building knowledge graphs in the security field. To better serve the Tencent Cloud business scenarios, the Tencent Cloud Security team has to select a highly performant graph database which fits the business development well, which is how this performance comparison comes into play.

## Whom to Compare With

### Neo4j

Neo4j is the most widely adopted graph database in the industrial world. It has a Community edition and an Enterprise edition. For comparison in this article, the team has chosen the Community edition.

### HugeGraph (A fork of JanusGraph)

HugeGraph is a distributed graph database developed by Baidu. It is forked from JanusGraph. HugeGraph is developed to address the needs of anti-fraud, threat intelligence collection, and underground economy attack with graph storage and analysis capabilities. It has pretty good read and write performance.

### Nebula Graph

Nebula Graph is an open source distributed graph database developed by vesoft inc. It features the capability of dealing with super large datasets with hundreds of billions of vertices and trillions of edges.

## Hardware Environments

| Item | Specs |
| --- | --- |
| CPU | Intel Xeon(R) Gold 6133 CPU @ 2.5GHz X86_64 |
| # of Physical CPUs | 2 |
| # of Physical Cores | 20 |
| # of Logical CPUs | 80 |
| Memory | 260 GB |

## Test Results

The Tencent Cloud Security team has used graph data at different orders of magnitudes for testing purpose. The test has been performed against various metrics, including data import efficiency, one-hop query, two-hop query, and shared friends query.

The results are as below:

| Graph Data Size | Platform | Data Import | One-Hop  Query | Two-Hop  Query | Shared Friends Query |
| --- | --- | --- | --- | --- | --- |
| 10 Million Edges | Neo4j | 26s | 6.618s | 6.644s | 6.661s |
|  | HugeGraph | 89s | 16ms | 22ms | 72ms |
|  | Nebula Graph | 32.63s | 1.482ms | 3.095ms | 0.994ms |
| 100 Million Edges | Neo4j | 1min21s | 42.921s | 43.332s | 44.072s |
|  | HugeGraph | 10min | 19ms | 20ms | 5s |
|  | Nebula Graph | 3min52s | 1.971ms | 4.34ms | 4.147ms |
| 1 Billion Edges | Neo4j | 8min34s | 165.397s | 176.272s | 168.256s |
|  | HugeGraph | 65min | 19ms | 651ms | 3.8s |
|  | Nebula Graph | 29min35s | 2.035s | 22.48ms | 1.761ms |
| 8 Billion Edges | Neo4j | 1h23min | 314.34s | 393.18s | 608.27s |
|  | HugeGraph | 16h | 68ms | 24s | 541ms |
|  | Nebula Graph | ~30min | Less than 1s | Less than 5s | Less than 1s |

Seen from the above table, in terms of data import, Nebula Graph is a bit slower than Neo4j when the data size is small. However, when the data size is large, Nebula Graph is much faster than the other two. For the three graph queries, Nebula Graph shows clearly better performance compared to Neo4j and HugeGraph.

Here is a chart overview of the comparison:

![Graph Database Performance Comparison Chart](https://user-images.githubusercontent.com/57335825/90246630-dfcb9100-dde9-11ea-8ddc-3334e6614c8e.png)

### Graph Query Language Comparison

#### Neo4j Cypher

One-Hop Friends Query

```Shell
match ({vid:11111}) -> (u)
return u;
```

Two-Hop Friends Query

```Shell
match ({vid:11111}) -> () -> u
return u;
```

Shared Friends Query

```Shell
match ({vid:11111}) -> (u) <- ({vid:22222})
return u;
```

#### Nebula Graph nGQL

One-Hop Friends Query

```Shell
GO FROM 11111 OVER relation
```

Two-Hop Friends Query

```Shell
GO 2 STEPS FROM 11111 OVER relation
```

Shared Friends Query

```Shell
GO FROM 11111 OVER relation
INTERSECT
GO FROM 22222 OVER relation
```

#### HugeGraph gremlin

One-Hop Friends Query

```Shell
g.V ().has ('vid', 'attr', '11111'). both E ().otherV ().dedup ().count ()
```

Two-Hop Friends Query

```Shell
g.V ().has ('vid', 'attr', '11111'). both E ().otherV ().dedup ().both E ().otherV ().count ()
```

Shared Friends Query

```Shell
g.V ().has ('vid', 'attr', '11111'). both E ().otherV ().aggregate('x').has('vid', 'attr', '22222').bothE().otherV().where(within('x')).dedup().count()
```

From the graph query language point of view, gremlin is complex and nGQL and Cypher are simple and neat. From the readability point of view, nGQL is similar to SQL and the learning curve should be shorter.

## Graph Visualization Comparison

| Platform | Support Layout | Fluency | Support Exploration from a Selected Node | Support  Query in Batch | Support Node Style Customization |
| --- | --- | --- | --- | --- | --- |
| Neo4j | Yes | Fluent for one-hop query | No | Yes | Yes |
| HugeGraph | No | Fluent for one-hop query | No | No | Yes |
| Nebula Graph | Yes | Fluent for one-hop query | Yes | Yes | No |

In terms of graph visualization, it is safe to say that all the mentioned platforms are just available for use. Nebula Graph supports exploration from a selected node, which is a plus. However, there is still room for improvement for the smoothness of two-hop friends query results layout and node style customization.

After comparing multiple widely adopted open source graph databases and taking into consideration of factors such as performance, learning curve, and fitness to the business scenarios, the Tencent Cloud Security team has finally selected Nebula Graph, a highly performant and easy-to-use graph database.

[Get started with Nebula Graph](https://docs.nebula-graph.io/manual-EN/1.overview/2.quick-start/1.get-started/) now!

_This article is written by Li Hangyu and Deng Changbo from the Tencent Cloud Security team._

## You might also like:

1. [Nebula Graph Architecture — A Bird’s Eye View](https://nebula-graph.io/posts/nebula-graph-architecture-overview/)
1. [An Introduction to Nebula Graph's Storage Engine](https://nebula-graph.io/posts/nebula-graph-storage-engine-overview/)
1. [An Introduction to Nebula Graph’s Query Engine](https://nebula-graph.io/posts/nebula-graph-query-engine-overview/)