---
title: "Pick of the Week 28 at Nebula Graph - Running Configuration Explained in Detail"
date: 2020-07-10
description: "In this weekly issue, we are covering TTL and recommended configurations to run Nebula Graph in both production and testing environments."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/87520320-a4e20c00-c637-11ea-8053-7222b9c4f00a.png)

Normally the weekly issue covers Feature Explanation and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

Nebula Graph has released the bugfix version of v1.0.0 on Jul.9, 2020. See the details in [Nebula Graph v1.0.1 Release Note](https://nebula-graph.io/posts/nebula-graph-1.0.1-release-note/).

## Feature Explanation

This week let's talk about the [TTL](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/TTL/) (Time-to-Live) feature.

In Nebula Graph, you can add a TTL attribute to any tag or edge type so that expired data can be automatically deleted.

To use the TTL feature, you need to specify the values of start time (ttl_col) and lifespan (ttl_duration). The start time (ttl_col) uses the UNIX timestamp format and supports calling the now function to acquire the current time, and the data type is int. If the current time is greater than the start time plus the lifespan, the Tag or Edge will be discarded.

**Pro Tip**: The TTL function and the Index function cannot be used for a single Tag or Edge at the same time.

Below are several common use cases where TTL is used.

**Scenario #1: When a vertex has multiple tags.**
When a vertex has multiple tags, only the one with the TTL property is discarded. The other preperties of this vertex can be accessed. See the below example:

```shell
CREATE TAG tag1(a timestamp) ttl_col = "a", ttl_duration = 5;
CREATE TAG tag2(a string);
INSERT VERTEX tag1(a),tag2(a) values 200:(now(), "hello");
fetch prop on * 200;
```

You can see there are two tags attached to the Vertex 200 and the lifespan for property data on tag1 is five seconds:

![Vertex with Multi-Tag - Before Data Expires](https://user-images.githubusercontent.com/57335825/87521278-03f45080-c639-11ea-80ce-3487ef25a656.png)

Fetch the properties on Vertex 200 after five seconds, only tag2 is returned:

![Vertex with Multi-Tag - After Data Expires](https://user-images.githubusercontent.com/57335825/87521420-37cf7600-c639-11ea-8649-c7f7287272c6.png)

**Scenarios #2: When a vertex has only one Tag with a TTL property.**

Fetch properties on Vertex 101 and the tag1 is returned:

```shell
fetch prop on * 101;
```

![Vertex with One Tag - Before Data Expires](https://user-images.githubusercontent.com/57335825/87521546-62b9ca00-c639-11ea-902b-b078b766bb2b.png)

Query properties on Vertex 101 again after five seconds, no result is returned because the data is expired.

![Vertex with One Tag - After Data Expires](https://user-images.githubusercontent.com/57335825/87521654-7fee9880-c639-11ea-8071-4e3681869910.png)

You can delete the TTL property of a Tag or Edge by setting ttl_col to null or deleting this field. Setting ttl_col to null means the data will not expire. See the example code below:

```shell
ALTER TAG tag1 ttl_col = "";
INSERT VERTEX tag1(a),tag2(a) values 202:(now(), "hello");
fetch prop on * 202;
```

![Alter TTL](https://user-images.githubusercontent.com/57335825/87521731-9e549400-c639-11ea-9d4d-b39faf76d5e4.png)

Delete the ttl_col field, the data does not expire.

```shell
ALTER TAG tag1 DROP (a);
INSERT VERTEX tag1(a),tag2(a) values 203:(now(), "hello");
1. fetch prop on * 203;
```

![Drop TTL](https://user-images.githubusercontent.com/57335825/87521867-c80dbb00-c639-11ea-937a-11e32f8db7c4.png)

When ttl_duration is set to 0, the TTL function exists, but all data does not expire.

```shell
ALTER TAG tag1 ttl_duration = 0;
INSERT VERTEX tag1(a),tag2(a) values 204:(now(), "hello");
fetch prop on * 204;
```

![Set TTL to zero](https://user-images.githubusercontent.com/57335825/87521951-e1166c00-c639-11ea-9a24-30ab84560c89.png)

## Community Q&A

Q: How should I configure Nebula Graph?

A: Let's talk about the problem from three perspectives:

**Recommendation for Production Environment**

**Deployment requirements:**

1. Three metad processes
1. At least three storaged processes
1. At least three graphd processes

None of the above processes needs to occupy a machine exclusively. For example, a cluster of 5 machines: A, B, C, D, E, can be deployed as follows:

- A：metad, storaged, graphd
- B：metad, storaged, graphd
- C：metad, storaged, graphd
- D：storaged, graphd
- E：storaged, graphd

**Pro Tip:** Do not deploy the same cluster across available zones. Each metad process creates a replica of the meta data, so usually only three processes are required. The number of storaged processes does not affect the number of replicas of data in the graph space.

**Server configuration requirements (standard configuration):**

Take AWS EC2 c5d.12xlarge as an example:

- Processor: 48 core
- Memory: 96 GB
- Storage: 2 * 900 GB, NVMe SSD
- Linux kernel: 3.9 or higher, view through the command `uname -r` 
- glibc: 2.12 or higher, view through the command `ldd --version` 

See [here](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/3.configurations/7.kernel-config/#ulimit) for Operation System configuration.

**Recommendation for Test Environment**

**Deployment requirements:**

1. One metad process
1. At least one storaged process
1. At least one graphd process

For example, a cluster with 3 machines: A, B, and C can be deployed as follows:

- A：metad, storaged, graphd
- B：storaged, graphd
- C：storaged, graphd

**Server configuration requirements (minimum configuration):**

Take AWS EC2 c5d.xlarge as an example:

- Processor: 4 core
- Memory: 8 GB
- Storage: 100 GB, SSD

**Resource Estimation (three-replica standard configuration)**

- Storage space (full cluster): number of vertices/edges * _number of bytes of average attributes *_ 6
- Memory (full cluster): number of vertices/edges *_ 5 bytes + number of RocksDB instances _ (write_buffer_size * max_write_buffer_number + rocksdb_block_cache), where each directory under the --data_path entry in the etc/nebula-storaged.conf file corresponds to a RocksDB instance.
- Number of partitions in the graph space: the number of hard drives in the entire cluster * (2 to 10--the better the hard drive, the greater the value).
- Reserve a 20% buffer for memory and hard disk.

## You Might Also Like

1. [Pick of the Week 29 at Nebula Graph - SQL vs nGQL & Job Manager in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-17-2020/)
2. [Pick of the Week 30 at Nebula Graph - FETCH Syntax Goes Further with New Features](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-24-2020/)

