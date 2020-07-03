---
title: "Nebula Graph for Large Social Network: Practices at WeChat"
date: 2020-07-02
description: "This article describes the problems the WeChat team has encountered when implementing Nebula Graph and how they solve them by deep customization."
author: "Li Benli"
tags: ["use-cases"]
---

![Nebula Graph for Large Social Network: Practices at WeChat](https://user-images.githubusercontent.com/57335825/86352100-25f1da00-bc1a-11ea-9aa0-598156db1749.png)

Graph data is widely used in fields like social networking, real-time computation, fraud detection, data privacy, risk and compliance. It is a huge challenge to store and query large scale Heterogeneous Graph in a graph database.

This article describes the problems the WeChat team has encountered when implementing [Nebula Graph](https://github.com/vesoft-inc/nebula), an open source distributed graph database. Through deep customization, the team has realized some on-demand features such as big data storage, data import for large data sets with a fast performance, version control, rollback at second level, access to database at millisecond level.

## The Challenges Facing Internet Companies in China
Most well-known graph databases are not capable enough in dealing with big data. For example, the community version of [Neo4j](https://neo4j.com/) provides single-host service and is widely adopted in the knowledge graph area. However, when it comes to the large dataset, which is quite common in today's business world, this solution misses the mark.. Plus there are issues like data consistency and disaster recovery to  consider if you choose a multi-copy implementation. [Janus Graph](https://janusgraph.org/) has solved the big data storage problem by external metadata management, kv storage and indexes. Yet the performance issue has been widely criticized. No wonder most graph database solutions that we have evaluated are dozens of times better than Janus Graph in terms of performance.

To cope with the rapidly growing datasets, some Internet companies build their own databases. These self-developed solutions are catering to their own business requirements, rather than for general graph scenarios, thus they support only a limited proportion of query syntaxes.

### GeaBase from Ant Financial
[GeaBase](https://tech.antfin.com/products/GEABASE) is mainly used in the finance industry, featuring self-developed query language, pushdown computation and millisecond latency. The main scenarios include:

- **Risk management in financial organizations**: Transaction network with trillions of edges/relationships, storing real-time transaction data, real-time fraud detection.
- Recommendation engines: For stocks and securities recommendation purpose.
- Ant forest: Capability to store trillions of nodes, strong data consistency, and low latency querying.
- GNN: For Dynamic Graph CNN, attemping for online inference based on dynamic graphs.[7]

### iGraph from Alibaba
iGraph [2] is a graph indexing and query system. It stores user behavior information and serves as one of the four backbone middle platforms in Alibaba. iGraph adopts Gremlin as its graph query language for real-time queries of e-commerce relationships.

### ByteGraph from ByteDance
By adding a cache layer to the kv layer, ByteGraph [3] splits the relationships into B+ trees for efficient access to edges and data sampling. The structure is similar to TAO [6] of Facebook.

## Architecture of the WeChat Big Data Solution
The WeChat team has come up with the following architecture to solve the big data storage and processing problem.

![Architecture of the WeChat Big Data Solution](https://user-images.githubusercontent.com/57335825/86352447-a87a9980-bc1a-11ea-83c6-47a481675e9e.png)

## Why Nebula Graph?
As seen in the architecture above, graph database is the main component of the solution. We finally chose Nebula Graph [4] as the starting point of our journey to graph databases for the following reasons:

- Great potential for huge dataset storage based on the capability of dataset partitioning and independent relationship storage.
- Great potential for pushdown computation and MMP optimization based on the strong consistency storage engine.
- Extensive experiences in the graph database field and proved model abstraction for big data.

## Problems in Practicing Nebula Graph

### Memory Explosion
In its essence it is a problem of performance VS resources. Memory occupation is an unneglectable issue in an application dealing with large scale datasets. There are a couple of components in RocksDB that contribute to memory usage: Block cache, Indexes and bloom filters, Memtables and Blocks pinned by iterators.

The WeChat team has optimized memory utilization by the following ways:

- **block cache optimization:** Adopt global LRU cache to control the cache occupation of all RocksDB instances in a machine.
- **bloom filter optimization: **An edge is designed as a key-value pair and stored in RocksDB. If all keys are stored in bloom filter and each key occupies 10bit, then the memory required by the entire filter will exceed the machine memory by a large margin. The team observed that most of the time the requests are to acquire a list of edges for a specific node. Therefore, the team has adopted prefix bloom filter. Another optimization is creating indexes for properties on vertices, which enables acceleration for most requests. Finally the memory occupation of a single-host filter is at gigabyte level without sacrificing the speed of most requests.

### Version Control
There are several business requirements in practice: graph data fast rollback, periodic full data import, automatic access to the latest versioning data. The team has classified data source into two caterogies:

- Recurring data. For example, generate a list of similar users by day and the data takes effect after being successfully imported.
- History data and real-time data. For example, refresh the history data by day and combine the history data with real-time data as full data to be imported.

Below is the data storage model in RockDB.

Vertex Storage Model:

![Vertex Storage Model in RocksDB](https://user-images.githubusercontent.com/57335825/86352518-c516d180-bc1a-11ea-9ea3-25a774e6478c.png)

Edge Storage Model:

![Edge Storage Model in RocksDB](https://user-images.githubusercontent.com/57335825/86352600-e2e43680-bc1a-11ea-819c-6161cdf719b3.png) 

Timestamp is used as the versioning method of rela-time data. The version of imported data is specified manually. In practice, the team has adopted the following three options for version control:

- reverse_versions: The list of version to be kept for rollback.
- active_version: The version accessed by users' requests.
- max_version: Data reversed after a certain version. The reversed data is the combination of the history data and the real-time data.

Using the three options, the team is able to manage offline data and online data efficiently. The data that is no longer used will be cleared from the disk during the next compaction.

In this way, the application can update the data version without knowing it. And the data rollback can be completed within seconds.

Below are some examples:

- Keep three versions of data and activate one of them

`alter edge friend reserve_versions = 1 2 3 active_version = 1`

- Data sources are history data and real-time write data

`alter edge friend max_version = 1592147484`

## Fast Full Data Import
Data import at large scale is quite common in practice. The import requests, without any optimization, would not only affect requests in production, but take longer than a day to complete. So it's an urgent requirement to improve import speed. SST Ingest [5] is a commonly adopted method to achieve fast import. The WeChat team adopts something similar:

- Generating SST files offline via scheduling Spark tasks
- Data nodes pull the data required and ingest the data to the graph database
- Access to the latest versioning data via the version control request

The import process takes several hours to complete, which is fast. And it doesn't affect requests to the graph database because the computation is mainly offline.

## Shared-Nothing
The shared-nothing architecture is a widely discussed way for horizontal scalability. It requires programming skills to actually implement the architecture in practice. The meta cache is encapsulated with `shared_ptr` and is frequently accessed, making it a warm bed for atomic operation clashing. To realize real shared-nothing, the WeChat team has copied each meta cache as a thread local. Please see this [pull request](https://github.com/vesoft-inc/nebula/pull/2165) [8] for details.

It is a long and wilding journey to graph database utilization. If you have any questions, find me on GitHub [9] and let's talk.


## References

1. Fu, Zhisong, Zhengwei Wu, Houyi Li, Yize Li, Min Wu, Xiaojie Chen, Xiaomeng Ye, Benquan Yu, and Xi Hu. "GeaBase: a high-performance distributed graph database for industry-scale applications." International Journal of High Performance Computing and Networking 15, no. 1-2 (2019): 12-21.
1. [https://mp.weixin.qq.com/s?__biz=MzU0OTE4MzYzMw==&mid=2247489027&idx=3&sn=c149ce488cfc5231d4273d6da9dc8679&chksm=fbb29ffdccc516ebb8313b9202cfd78ea199da211c55b0a456a9e632a33e7d5b838d8da8bc6a&mpshare=1&scene=1&srcid=0614MWpeEsBc1RaBrl4htn3D&sharer_sharetime=1592106638907&sharer_shareid=a2497c4756f8bac1bcbef9edf86a86ac&rd2werd=1#wechat_redirect](https://mp.weixin.qq.com/s?__biz=MzU0OTE4MzYzMw==&mid=2247489027&idx=3&sn=c149ce488cfc5231d4273d6da9dc8679&chksm=fbb29ffdccc516ebb8313b9202cfd78ea199da211c55b0a456a9e632a33e7d5b838d8da8bc6a&mpshare=1&scene=1&srcid=0614MWpeEsBc1RaBrl4htn3D&sharer_sharetime=1592106638907&sharer_shareid=a2497c4756f8bac1bcbef9edf86a86ac&rd2werd=1#wechat_redirect)
1. [https://zhuanlan.zhihu.com/p/109401046](https://zhuanlan.zhihu.com/p/109401046)
1. [https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula)
1. [https://www.infoq.cn/article/SPYkxplsq7f36L1QZIY7](https://www.infoq.cn/article/SPYkxplsq7f36L1QZIY7)
1. Bronson, Nathan, Zach Amsden, George Cabrera, Prasad Chakka, Peter Dimov, Hui Ding, Jack Ferris et al. "{TAO}: Facebook’s distributed data store for the social graph." In Presented as part of the 2013 {USENIX} Annual Technical Conference ({USENIX}{ATC} 13), pp. 49-60. 2013.
1. [http://blog.itpub.net/69904796/viewspace-2653498/](http://blog.itpub.net/69904796/viewspace-2653498/)
1. [https://github.com/vesoft-inc/nebula/pull/2165](https://github.com/vesoft-inc/nebula/pull/2165)
1. [https://github.com/xuguruogu/nebula](https://github.com/xuguruogu/nebula)



