---
title: "Large Scale Feature Storage with Nebula Graph: Best Practices at vivo"
date: 2020-08-28
description: "This article introduces the feature storage platform developed by vivo and why vivo ultimately chose Nebula Graph as the KV store of the platform."
author: "Huang Weifeng"
tags: ["use-cases"]
---

![Large Scale Feature Storage with Nebula Graph: Best Practices at vivo](https://user-images.githubusercontent.com/57335825/91530661-55daf800-e8c0-11ea-907b-a326ec3c072e.png)

This article introduces the feature storage platform developed by vivo and its evolvement.

## Requirement Analysis

Artificial Intelligence (AI) is widely used by vivo and feature data is a significant part of the AI practice. The feature data is used for offline training and online prediction. The vivo engineering team needs a reliable system to effectively store the feature data.

### Feature Data Characteristics

1. The value is large.

In general there are many fields in feature data, resulting in a very large value of key-value pairs to be stored, even if they are compressed.

2. Large data size, high concurrency, and large throughput

The data size of feature scenarios is super large. So memory kv, such as with Redis Cluster, is difficult to use to meet the storage requirements. Besides, the cost is high. No matter the feature data is used for offline training or online prediction, the throughput is naturally large because of large amount of concurrent requests with large kv values.

3. High read and write performance and low latency

Most of the feature scenarios require low read and write latency. And they also require stability

4. Range query is not required.

It is a single-point random read and write for most scenarios.

5. Timed mass data importing

A lot of feature data is initially calculated from OLAP storage and the calculation is timed. So, the team needs a tool to sync these feature data to online kv stores in time.

6. There should be an ease to its use.

The learning curve should be smooth when the business units are trying to access the storage system.

### Future Requirements

1. The storage system should be extendable to a general disk kv to support large volume data storage for various scenarios.

The goal is not limited to feature data storage.

2. The storage should be reused by NoSQL/NewSQL databases.

From a business requirements point of view, the vivo engineering team will adopt various types of Nosql databases such as graph database, time-series database, and object-oriented storage. The maintenance cost would be too high if these products are isolated without reusing any resources (code, platform capabilities, etc.).

3. Easy for maintenance.

The language of the storage system should be widely adopted by the IT industry. Otherwise it will be difficult to recruite qualified people for its development. Also, the language should be aligned with the tech stack adopted by vivo. Second, from the architecture point of view, the system should not rely on too many third-party components. This can help avoid operation complexity.

### The Tip of the Iceberg of the Storage System

Based on the requirements above, the vivo engineering team ultimately decided that the storage system is compatible with the Redis protocol. What is exposed to users is a single-machine Redis service. However, the team has done massive work behind the scenes for system reliability.

![The Tip of the Iceberg of the Storage System](https://user-images.githubusercontent.com/57335825/91524946-502be500-e8b5-11ea-9702-4de0c27037c0.png)

## Solution Evaluation

The vivo engineering team has followed some principles when evaluating the storage solutions:

1. Open source and customizable

2. Mainstream language and architecture

3. Reliability as the highest priority and an easiness to maintain

Below is a brief summary of the solutions the team evaluated (Nebula Graph, Pegasus, TiKV):

![A brief comparison among Nebula Graph, Pegasus, and TiKV by vivo](https://user-images.githubusercontent.com/57335825/91525169-be70a780-e8b5-11ea-8c97-c8b304f690b8.png)

We found these are all excellent open source projects. However, it is difficult to decide whether a product fits us well based only on the code and official documentation, without in-depth practice with it. So, the team went a step further to evaluate in practice each candidate to see how it performs in vivo's environment.

In a nutshell, the team was trying to find a sweet spot and strike a balance among current requirements, future requirement, easiness to use, architecture, performance, and easiness to maintain.

After theoretical research and a period of trial, the team ultimately chose Nebula Graph.

## An Introduction to Nebula Graph

[Nebula Graph](https://github.com/vesoft-inc/nebula) is an open source distributed graph database featuring high performance, high availability, high reliability, and strong data consistency.

### Storage and Computing Separation

Nebula Graph has adopted an architecture of separating the storage and computing, which separates the `State Storage Service` and `Stateless Computing Service`. Under this architecture, the storage layer can focus on improving data reliability, exposing only the kv interfaces to external services. And the computing layer can focus on computation performance improvements. In addition, this architecture allows high flexibility in terms of deployment and maintenance.

Nebula Graph has pushed a part of graph computing logic to the storage layer to improve the database performance. This is a balance struck between flexibility and performance.

### Strong Data Consistency and Mainstream Architecture

Nebula Graph ensures strong data consistency using the Raft protocol, which is a mainstream method to realize data consistency among multiple replicas. What's more, the Raft implementation has passed the Jepsen linearizability test. This is a big step for an open source project at an early stage and enhances confidence among its users.

### Horizontal Scalability

Nebula Graph has achieved horizontal scalability thanks to its Hash-based Multi-Raft implementation. Meanwhile it has a built-in Balancer for load balancing purpose. The architecture and realization are both concise (at least it is now). So, the learning curve is not high for beginners.

### Easiness to Maintain

Nebula Graph's core is written in C++ which matches the infrastructure tech stack in vivo. After evaluation, the vivo team found that the basic platform capabilities, such as monitor interface and deployment mode, are easy to follow and can be easily accessed by the existing platform in vivo.

The code is highly abstracted so that it supports multiple storage engines. This has laid a solid foundation for performance profiling for the feature data scenario.


## An Introduction to the Raft Implementation in Nebula Graph

As mentioned above, Nebula Graph ensures strong data consistency with the Raft protocol. Below is a brief introduction to Raft implementing in Nebula Graph:

### The Leader Election and Tenure

The lifecycle of a Raft Group is composed of one tenure after another consecutively. At the beginning of each tenure, a Leader is elected and other group members are all followers. There is only one Leader in each tenure. If a Leader is unavailable within its tenure, then the tenure ends and the next tenure follows with a newly elected Leader. This Strong Leader mechanism makes the implementing of Raft much simpler than its ancestor Paxos.

### Log Replication and Compaction

In a standard Raft implementation, each request from clients will be transformed to an operation log and written to the wal file. The Leader will then write the operation log to its own state machine and proactively sync the  log to all Followers. The Leader will respond to the clients with a write success only when over a half of Followers respond to it with success.

In practice, the wal file will grow larger and larger in size. It will occupy the entire disk if there is not an appropriate wal recycling mechanism in place. This recycling mechanism is called Log Compaction. The Log Compaction process in Nebula Graph is pretty concise. Users only need to configure a parameter called wal_ttl to ensure the disk occupation by the wal file is at an acceptable range without breaking the correctness of the entire cluster.

Nebula Graph has realized Raft batch and a pipeline mechanism to support log submissions in batch and in disorder from Leader to Follower, which can effectively improve the throughput of the cluster under high concurrency.

### Member Change

The snapshot mechanism in Nebula Raft is similar to its Raft implementation.

When a new member is added to the Raft Group, it needs to acquire all logs from the current Leader and place them on its own state machine, which is an un-negligible resource consumption and imposes pressure on the Leader. As a result, a snapshot mechanism is adopted in a Raft implementation to solve the performance issue brought by scaling the cluster. The snapshot mechanism also ensures a timely cluster restore from a node breakdown.

In the snapshot mechanism, a Leader creates an image of its state machine and saves it separately. In Nebula Raft, the image is the RockDB instance (i.e. the state machine itself). When there is a new member being added to the group, the Leader will call RocksDB Iterator to scan the entire instance and send the values read from the instance to the new member in separate batches and finally complete the copy.

### Multi-Raft Implementation

If there is only one Raft Group in a cluster, then it is difficult to realize horizontal scalability by simply adding machines to the cluster. Naturally the vivo team has come up with a solution to split data in the cluster into multiple Raft Groups, which has brought two new issues:

1) How to do data sharding

2) How to distribute the shards evenly to the cluster

Multi-raft implementation is interesting and challenging. There are two mainstream ways to achieve this. One is Hash-based and the other is Region-based. There are strengths and weaknesses to each solution. In most cases, Hash-based sharding is simpler and more effective and fits vivo's requirements well.

## An Introduction to the Feature Storage Platform

### The System Architecture

![The system architecture of vivo's feature storage platform](https://user-images.githubusercontent.com/57335825/91525921-6044c400-e8b7-11ea-9b87-d3fe170d1c88.png)

On top of the original architecture of Nebula Graph, a few components have been added to the platform, including Redis Proxy, Rediscluster Proxy, and the platform relevant components.

The meta data of the cluster is stored in the Metad, including the data sharding routing rules, graph space info, etc. The Metad itself is a Raft Group.

- The Storage instance is where the data is stored. Suppose a cluster is sharded into m Raft Groups and each Raft Group has n replicas, the Nebula Graph will distribute the m*n replicas evenly to the Storage instances, with the number of Leaders in each instance as close to each other as possible.

- The Graph instance provides the graph API and acts as the Console of the cluster. It is stateless.

- The Redis instance is compatible with the Redis protocol and partially realizes Redis-native data structure. It is stateless.

- The Rediscluster instance is compatible with the Redis Cluster protocol and it is stateless.

### Performance Profiling

#### Cluster Profiling

When the platform is used in production, the vivo team needs to adjust parameters to cater to different scenarios. This took a large amount of time in the early stages. On the other hand, the team has gained precious experiences through this process.

#### WiscKey

As mentioned above, most feature data has a large value. Relying solely on RocksDB will result in severe write amplification due to frequently triggering the Compaction. Each time the Compaction is triggered, it will scan the key and value from the dish, which is a horrible resource consumption if the value is large. To solve this problem, the academic circle has brought up several solutions. Among them WiscKey is widely adopted due to its practicality. The industrial circle has open sourced its implementation, in TitanDB.

For the detailed principles of TitanDB, please refer to its [official documentation](https://pingcap.com/blog-cn/titan-design-and-implementation/). To put it simply, TitanDB has transformed RocksDB in the following ways: be compatible with external interfaces, keep the LSM-tree, add BlodFile storage, separate Key (stored in LSM-tree) from Value (stored in BlobFile), be dependent on SSD random read and write performance, sacrifice the range query performance, and decrease the write amplification in large value scenarios.

TitanDB is easily integrated in Nebula Storage, thanks to Nebula Graph's design of supporting multiple backend storage engines, which benefits the team in terms of performance in production.

### The TTL Mechanism

Both RocksDB and TitanDB are compatible with the Compaction Filter interface to determine whether some specific data should be filtered out upon compaction. In practice the vivo team has planted TTL in each value written to the storage to determine whether the a value expires. If so, the corresponding key-value pair is deleted.

However, the team found that the Compaction Filter cannot read the specific value if the value is large and separated into a BlobFile. Only those small values in an LSM-tree can be read by the Filter. This prevents the TTL mechanism from functioning and the outdated data cannot be recycled. Therefore, the team has come up with a workaround. The location of the large value in the BlobFile is stored as an index in the Key-Index pair in the LSM-tree. And the TTL info is planted to the Index so that the Filter can acquire the TTL info from the Index in the LSM-tree and delete outdated data in time.

### Easy to Use

The ease of use is a sign of the matureness of a database product, which is a big deal.

There are always different requirement sets from different users' points of view. These users may include DBAs, developers, and devops. Our eventual goal is to surpass the expectations of each user type by using a really easy to use storage system.

Below are some measures the vivo team took to ensure the ease of use of the storage system:

#### Be Compatible with the Redis Protocol

The team has transformed the open-source KVrocks (a single-machine disk kv product based on the Redis protocol) and realized a stateless Redis protocol layer (Proxy). It did this by replacing the underlying logic of depending on RocksDB with the read/write logic of Nebula Storage KV interface, using the Storage Client of Nebula C++. Meanwhile the team also realized some extra commands based on real business requirements. During the first stage, the team only realized some Redis commands targeting the feature storage scenario. Stay tuned for all Redis commands on the distributed KV storage platform.

#### Support Batch Import from Hive to KV

The batch import function, to some extent, is a metric of ease of use in the feature data storage scenario. Nebula Graph currently supports importing graph structure data from Hive and it is easy to be transformed to kv format.

#### Platformization

At earlier stage the team maintained the meta info of all online clusters in the public configuration center and realized some simple tasks such as one-click cluster deployment, one-click cluster uninstallation, scheduled monitor reporting, scheduled command correctness check, scheduled instance health check, and scheduled cluster workload monitoring. These tasks can meet the daily maintenance requirements. Currently vivo is working on a fully functional DBaaS platform which has already support the platformizational maintenance of several databases such as Redis, MySQL, ElasticSearch, and MongoDB. This has greatly enhanced the data management efficiency in vivo. That being said, the ultimate goal of the feature data storage system should be fully connected with the platform and evolves together for ease of use and robustness breakthrough.

### Disaster Recovery

#### Scheduled Cold Backup

Nebula Graph provides a scheduled cold backup mechanism. The vivo team only needs to customize the backup scheduling strategy based on the business requirements. Please refer to Nebula Graph's [snapshot mechanism](https://nebula-graph.io/posts/nebula-graph-snapshot-introduction/) for details.

#### Real-Time Hot Backup

The implementation of real-time hot backup has been divided into two phases:

**Phase 1: The backup is incremental and loss tolerant.**

Currently the kv storage system serves only the feature data (or cache) scenario and the requirement of data reliability is not very high. Besides, the data won't stay in the storage service for too long because it will be deleted very soon based on the TTL mechanism. Therefore, the hot back plan does not support backup of existing data in the storage system.

The incremental backup process syncs the write request asynchronously to the backup cluster at the Proxy layer and the master cluster still execute the write request synchronously. As long as the Proxy CPU is large enough, the read and write performance of the master cluster will not be affected. The risk point is data loss. For example, the process crashes when the Proxy write async is not completed, which will result in data loss in the backup cluster. But as mentioned above, the data loss is tolerant in most feature data storage scenarios.

**Phase 2: Support both incremental and stock backup.**

A new role, Learner, was introduced to Nebula Raft. Learner is another copy in the Raft Group. It doesn't participant in Leader election, nor does it affect the quorum submission. The only thing the Learner does is receive the log copy requests from the Leader. Similar to other Followers, when the Learner crashes, the Leader will keep retrying to send log copy requests to the Learner until the Learner restarts and restores.

With this mechanism in place, stock backup is relatively easy. One solution is to realize a disaster recovery component and fake it as Learner in the Raft Group. Then the member change mechanism in Raft can ensure that both stock and incremental data can be synced to the disaster recovery component via logs. Meanwhile the component passes the raw log data to the Nebula Storage Client to transform it to write request and apply it to the backup cluster.

### Active-Active Cross-Machine Deployment

The active-active deployment has also been divided into two phases:

Phase 1: Do not consider conflict processing and do not ensure the eventual consistency among clusters.

This version is simple. You can think of it as two clusters backing up for each other, which is helpful to the scenarios that require active-active deployment in one city and failover but don't require eventual data consistency.

Phase 2: Introduce CRDT for conflict fixing to achieve eventual data consistency.

This plan requires high reliability and reuses the capabilities of disaster recovery (Phase 2) to acquire the write request logs of the cluster from the Learner.

In a general active-active deployment, two kv clusters will be distributed in different data centers. The unitized businesses will read from and write to the kv in the same data center and the kvs in two centers sync their data to each other. Suppose that the same key is updated in two kvs and the updated values are synced to each other. How do you deal with the conflict?

The well-known data consistency solution CRDT has provided the standards for implementation. The data stored in kv is of String structure, similar to the Register structure in CRDT. One implementation method is Op-based LWW (Last-Write-Wins) Register, which means that the latest value becomes the eventual value for data consistency purposes. The algorithm prototype is as follows:

![Op-based LWW (Last-Write-Wins) Register](https://user-images.githubusercontent.com/57335825/91528872-2080db00-e8bd-11ea-8d3d-4c7c0cd0c22b.png)

Fortunately, the vivo team had already realized a CRDT Register in the Redis Cluster as well as the component to ensure reliable data transfer between machine rooms, which makes the new kv platform stand on the shoulder of giants. It's worth noting that there are large numbers of online mset requests while the CRDT Register only supports single set conflict resolution. Therefore, in an active-active Learner component, the batch write requests from the Leader will be split to single sets of commands and then sync these sets to the Peer cluster.

## Looking into the Future

### Extend the KV Capabilities for General Purposes

The ultimate goal of this project is a kv store for general purposes. However, it is a long journey and there is a lot more to do, including reliability, platform capabilities, cost-effectiveness, etc. Fortunately there are already a lot of excellent best practices in the industry and they shed some light on the road ahead.

### Enhance Platform Capabilities

The platformization management practice is a great example to follow in this regard. There is also a lot to do. The platform will be combined with intelligent database maintenance. Imagination is the only limitation.

### Improve the Data Accuracy Check Mechanism

Data reliability and accuracy is the most significant capability of a database product and it requires continuous improvement on the check mechanism.

Currently the kv storage platform cannot promise financial level data reliability and that is the ultimate goal leading the vivo team.

The team has been introducing some open source chaos testing tools, trying to uncover potential problems in the system for more reliable data storage services.

### Emphasize Scheduling Capability

The core topics of a distributed database product are storage, computing, and scheduling. Load balancing is a step in the scheduling process. Can the current Hash-based sharding rules be changed to Region-based? Is it possible to build a cloud native kv storage product based on k8s? Can the data distribution process be more intelligent and automatic? We'll see.

### Separate Hot Data from Cold Data

The essence of this problem is a balance between cost and performance. In a super large cluster, chances are 90% of the data stored in the cluster are seldomly accessed. It is a waste of resources even if the data is stored in flash. On one hand, the team is seeking better read and write performance for the frequently accessed data. On the other hand, the team is trying to reduce the costs to a minimum level.

A straightforward way is locate hot data in memory and flash and cold data in cheaper disks. This requires that the system has the capability to dynamically determine which data is hot and which is cold.

### Support Multiple Storage Engines

Currently the system supports RocksDB and TitanDB. The team will consider introducing more storage engine types such as pure memory and the storage engines based on new flash hardware like AEP.

### Support Remote Cold Backup with HDFS

Data backup is important to online scenarios. Currently Nebula Graph supports a local snapshot at a cluster level. But the risk of data loss still exists if the machines crash. The team is considering remote cold backup with HDFS. Is it possible that the HDFS is mounted as local directory and the cluster dumps the snapshot to the specified directory? It needs further thinking and design.

### SPDK Disk Read and Write

Hands-on experiences show that the throughput of a single machine has been improved by one time with SPDK. Bypass Kernel solutions like SPDK are the trending. Using SPDK can effectively improve resource utilization rates for scenarios where disk IO is the bottleneck.

### KV SSD

The industrial circle has brought up a new solution based on the SPDK Bypass Kernel advantage.

RocksDB is realized based on an LSM-tree and the Compaction mechanism can result in severe write amplification issue. KV SSD provides a native kv interface and is compatible with the RocksDB API so that it can write new data to an SSD directly without repeatedly calling the Compaction interface. Therefore, the write amplification can be reduced to one, which is worth trying.

### Support Graph Databases

One of the important reasons why the vivo team chose Nebula Graph for the kv storage system is to prepare for supporting graph databases. The team is now trying to accept graph related requirements. The hope is to work with the open source community and build cutting-edge graph database capabilities.

### Support Time Series Databases

In the era of 5G and IoT, time series databases are widely adopted as an infrastructure capability.

InfluxDB is currently leading the market. But the open source version is not distributed. A single-machine storage engine (TSM) based on a one-time series database is not practical.

The KV storage platform now provides distributed replica, standardized platformization capabilities, and high availability, which should be reused as more as possible.

An alternative is to combine TSM and the distributed replica capabilities. This and an excellent sharding strategy that is friendly to time series use cases. Also, build a highly available distributed time series storage engine which can replace the single-machine storage layer of the open source InfluxDB.

### Support Meta Data Storage for Storage Objects

Meta data storage is significant to object storage. Since the team has developed such a powerful kv storage system, is it possible to use it in maintenance as well?

## Conclusion

In practice the team has been negotiating resources, collecting requirements, and iterating products, hoping that the platform can be used in as many scenarios as possible, which can in turn help the team build a better platform.

In conclusion, good products stem from continuous practicing.

![good products stem from continuous practicing](https://user-images.githubusercontent.com/57335825/91530378-d51bfc00-e8bf-11ea-9fdf-5d5c8026af5c.png)

## You Might Also Like

1. [How Nebula Graph Stores a One Trillion Connections Social Network - the Practices at WeChat](https://nebula-graph.io/posts/nebula-graph-for-large-social-network/)
2. [Detect Corona Virus Spreading With Graph Database Based on a Real Case](https://nebula-graph.io/posts/detect-corona-virus-spreading-with-graph-database/)
3. [Nebula Graph Architecture — A Bird’s Eye View](https://nebula-graph.io/posts/nebula-graph-architecture-overview/)