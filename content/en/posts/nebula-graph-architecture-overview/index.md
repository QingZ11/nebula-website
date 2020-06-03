---
title: "Nebula Graph Architecture — A Bird’s View"
date: 2019-12-24
description: "Nebula Graph is an open-source, distributed, highly performant graph database. This article explains its technical architecture in detail."
author: "Sherman"
tags: ["architecture"]
---

![Overall Architecture - Nebula Graph](https://user-images.githubusercontent.com/57335825/83608720-24a59280-a532-11ea-9b42-d08b7787dcd0.jpg)

Nebula Graph is an [open-source](https://en.wikipedia.org/wiki/Open-source_software) distributed graph database solution. So as an open-source project, we'd like those who are interested in graph databases to know as much as possible how Nebula Graph is designed and why it is a highly performant database.

That's how this series of architecture articles have come into play. We are going to cover the following three areas in this series:

1. A high-level overview of the architecture of Nebula Graph, which is what this article is going to talk about
1. How Nebula Graph's storage engine works
1. How Nebula Graph's query engine works, including the way we have designed nQGL, our graph query language

## Nebula Graph Architecture Diagram

![image](https://user-images.githubusercontent.com/38887077/76277232-1ba27d80-62c3-11ea-9389-cc1aca329c7b.png)

Seen from the diagram above, a fully deployed Nebula Graph cluster contains three services:

- Meta Service
- Query Service
- Storage Service

Each service has its own executable binary. These [binaries](https://github.com/vesoft-inc/nebula/releases) can be deployed either on the same set of hosts or on different hosts.

We will explain in detail how each service works below.

### Meta Service

On the right side of the architecture picture, it shows a cluster of Meta Service.

![image](https://user-images.githubusercontent.com/38887077/76277238-1e9d6e00-62c3-11ea-9d10-8391c26b0b20.png)

The Meta Service follows a leader/follower architecture.

The leader is elected by all Meta Service hosts in the cluster and serves all traffic. Followers stand by and take the updates replicated from the leader.

Once the leader dies, one of the followers will be re-elected as the new leader.

The Meta Service not only stores and provides meta information about the graph, such as schema and graph partition information, but also takes the role of the coordinator to orchestra the data movement and to force the leader shift.

### Separation of Query and Storage Layers

![image](https://user-images.githubusercontent.com/38887077/76277242-2230f500-62c3-11ea-8566-4b6be458adee.png)

To the left of the Meta Service is Nebula Graph's main services.

Nebula Graph divides the query execution and the graph storage into two separate services. Above the dotted line is the Query Service, and below the dotted line is the Storage Service.

The separation has several benefits：

- The most straightforward one is that the query layer and storage layer can be expanded or shrunk independently.
- The separation also makes the linear horizontal expansion possible.
- Last but not the least, the separation provides an opportunity to make it possible for the Storage Service to serve multiple computation layers. 

The current Query Service can be considered as a high-priority computation layer, while an iterative computation framework could be another one.

### Stateless Query Layer

![image](https://user-images.githubusercontent.com/38887077/76277245-25c47c00-62c3-11ea-912b-5de3ce4e18fe.png)


Now let's look at the Query Service.

Each individual Query Service host runs a stateless query engine. The Query Service hosts will never communicate with each other. They only read the meta information from the Meta Service and interact with Storage Service.

This design makes sure the Query Service cluster can be easily managed by Kubernetes (aka. k8s) or be deployed on the cloud, which by the way is already available for Nebula Graph. See [how to deploy Nebula Graph on Kubernetes](https://nebula-graph.io/posts/how-to-deploy-nebula-graph-in-kubernetes/).

There are two ways to balance the Query Service load：

1. The most common way is to place a [load balancer](https://nebula-graph.io/posts/nebula-graph-storage-banlancing-data-migration/) in front of Query Service.
1. The second way is to configure the client library with all Query Service hosts' IP addresses. The client will randomly pick one to connect.

Each query engine takes the request from the client, parses the statement, and generates an Abstract Syntax Tree (AST). Then the AST will be handed over to the execution planner and the optimizer. The final AST will be passed to the executors.

Below is a flow chart of how Nebula Graph's query engine works.

![image](https://user-images.githubusercontent.com/38887077/78201029-28318480-74c3-11ea-90ed-03e9c2ca25d4.png)

For a detailed explanation, please refer to [the introduction to the query engine](https://nebula-graph.io/posts/nebula-graph-query-engine-overview/).

### Shared-nothing Distributed Storage Layer

![image](https://user-images.githubusercontent.com/38887077/78201059-3a132780-74c3-11ea-95a0-61249c1566a4.png)

The Storage Service is designed to be a [shared-nothing distributed architecture](https://en.wikipedia.org/wiki/Shared-nothing_architecture). Each storage host has multiple local key/value stores as the physical data storage.

A quorum consensus protocol (we chose [RAFT](https://raft.github.io/) over paxos due to its simplicity) is built on top of the key/value stores. Together, they provide a distributed key/value store.

On top of this distributed key/value store, a graph semantic layer is provided to translate the graph operations into key/value operations.

The graph data (vertices and edges) are hashed into multiple partitions by the rule (vertex_id % the_number_of_partitions).

A partition is a virtual set of data in Nebula Graph. These partitions are allocated to all storage hosts. The allocation information is stored in the Meta Service and can be accessed by storage hosts and query hosts.

## Conclusion

This post aims to provide a bird's view on Nebula Graph's architecture so that you have a basic understanding of how a distributed graph database works. 

For detailed introduction to the major components of the system, please refer to:

- [An introduction to Nebula Graph's Storage Engine](https://nebula-graph.io/posts/nebula-graph-storage-engine-overview/)
- [An Introduction to Nebula Graph's Query Engine](https://nebula-graph.io/posts/nebula-graph-query-engine-overview/)

If you have anything to share about distributed systems or graph databases, please feel free to leave us a comment below. We look forward to hear from you.

## You might also like

1. [The Review on Graph Database](https://nebula-graph.io/posts/review-on-graph-databases/)
1. [Graph Query Language Comparison Series - Gremlin vs Cypher vs nGQL](https://nebula-graph.io/posts/graph-query-language-comparison-cypher-gremlin-ngql/)
