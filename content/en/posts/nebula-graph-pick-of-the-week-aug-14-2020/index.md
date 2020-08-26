---
title: "Pick of the Week at Nebula Graph - Performance Testing Report Comparing Nebula Graph with Other Graph DBMSs"
date: 2020-08-14
description: "In this weekly issue, we are covering the graph database performance comparison among Neo4j, JanusGraph, and Nebula Graph, which was conducted by the Tencent Cloud Security team."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/87520320-a4e20c00-c637-11ea-8053-7222b9c4f00a.png)

Normally the weekly issue covers Nebula Graph Updates and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

This report was posted on Nebula Graph Forum by the Tencent Cloud Security team. The report gives the testing environment and the test results. For more information, visit this URL: [https://discuss.nebula-graph.io/t/performance-comparison-neo4j-vs-nebula-graph-vs-janusgraph/619](https://discuss.nebula-graph.io/t/performance-comparison-neo4j-vs-nebula-graph-vs-janusgraph/619)

![graph database performance comparison: neo4j vs janusgraph vs nebula graph](https://user-images.githubusercontent.com/57335825/90609906-8ed8e580-e1b9-11ea-9eab-eabae6583f03.png)

## Nebula Graph Updates

The updates of Nebula in the last week:

• Optimizes the `GO` syntax. The query performance of a `GO` statement is optimized by allocating memory in advance, avoiding string copy, and so on. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2268](https://github.com/vesoft-inc/nebula/pull/2268), which is contributed by [@xuguruogu](https://github.com/xuguruogu)

• Fixed the bug that the logs cannot be output because of the second try of starting the meta, storage, or graph service. For more information, check these pull requests:
[https://github.com/vesoft-inc/nebula/pull/2289](https://github.com/vesoft-inc/nebula/pull/2289), [https://github.com/vesoft-inc/nebula/pull/2278](https://github.com/vesoft-inc/nebula/pull/2278)

• Fixed the bug that the validity of the raft lease may be incorrect when replica_factor is set to 1. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2276](https://github.com/vesoft-inc/nebula/pull/2276)

• Fixed the bug during compiling of JNI. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2271](https://github.com/vesoft-inc/nebula/pull/2271)

## Community Q&A

Q: When the execution of a statement is successful, the screen prints "Execution succeeded (Time spent: 24.7027/24.7033 s)". What does "Time spent" here mean?

A: "Time spent" has two time values. The first one indicates the time consumed by the database system for the query process. It starts counting when the query engine receives a query statement sent from the console, and ends when the storage service obtains the data and all the required computing is done. The second one indicates the time consumed for the query process from the client side. It starts counting when the console sends the query, and ends when the console receives and prints the results on the screen.

## Previous Pick of the Week

1. [GO with int Type](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-31-2020/)
2. [FETCH Syntax Goes Further with New Features](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-24-2020/)
3. [SQL vs nGQL & Job Manager in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-17-2020/)
