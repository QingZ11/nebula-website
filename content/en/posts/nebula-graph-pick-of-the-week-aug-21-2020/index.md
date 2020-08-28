---
title: "Pick of the Week at Nebula Graph - Release of Nebula Graph Studio v1.1.0-beta"
date: 2020-08-21
description: "In this weekly issue, we are covering the release of Nebula Graph Studio v1.1.0 Beta, and other Nebula Graph updates."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/87520320-a4e20c00-c637-11ea-8053-7222b9c4f00a.png)

Normally the weekly issue covers Nebula Graph Updates and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

Studio v1.1.0-beta was uncovered with a major feature: supporting the `LOOKUP` syntax.

![nebula graph studio v1 1 0-beta](https://user-images.githubusercontent.com/57335825/91418791-7b57fb00-e807-11ea-98d2-1a8674fa49a8.gif)

Besides, it is also armed with these updates:

On Explore:

- Supports vertex query by Index
- Supports pre-processing data to generate a VID for a vertex query

On Console:

- Supports importing results of vertex query into Explore for visualized graph exploration

Bug fixes:

- Fixed the bug that the console cannot correctly display the result for a vertex query for a boolean property

You are more than welcome to give Studio a shot and raise issues. Here is where you can get it: [https://github.com/vesoft-inc/nebula-web-docker](https://github.com/vesoft-inc/nebula-web-docker)

## Nebula Graph Updates

The updates of Nebula in the last week:

• When a query is partially successful, a warning message will appear to keep users informed of the failure. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2290](https://github.com/vesoft-inc/nebula/pull/2290)

• Some configuration options are added for dynamically configuring RocksDB. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2291](https://github.com/vesoft-inc/nebula/pull/2291), which is contributed by [@chenxu14](https://github.com/chenxu14)

• Fixed the bug that multiple services cannot be started on the same node in some cases. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2289](https://github.com/vesoft-inc/nebula/pull/2289)

• The snapshot design is enhanced. Snapshots are created only when necessary and the performance is improved. For more information, check this pull request: [https://github.com/vesoft-inc/nebula/pull/2287](https://github.com/vesoft-inc/nebula/pull/2287)

## Community Q&A

Q: How can the UUID() function of Nebula Graph ensure the universal uniqueness of the generated VIDs?

A: A UUID has 64 bits, of which the higher 32 bits are the result of the MurmurHash function and the lower 32 bits are the timestamps of the current time. For the implementation, see [these source code](https://github.com/vesoft-inc/nebula/blob/master/src/storage/query/GetUUIDProcessor.h#L39-L42).

Further push: In a distributed environment, which shares the same timestamp, can the MurmurHash function give unique values for UUIDs?

A: Here is how the UUID generation algorithm is implemented: 

When a string is input, it is processed by the Hash function on the graphd side to get a temporary hash value, and then this value is processed by the MOD function to get the exact partition where the exact UUID calculation happens. On the storaged side, all reading and writing requests must be processed by the leader, so even though some strings may have the same hash value, they must wait for the storaged service to process the request, which will add different timestamps to the UUID, and the universal uniqueness is ensured.

We use the same MurmurHash function to process the input string and the higher 32 bits of the UUID, so after processed by the MOD function, the generated VID and the temporary Hash value mentioned above will be located in the same partition.

## Recommendation for You

[Analyzing Relationships in Game of Thrones With NetworkX, Gephi, and Nebula Graph (Part One)](https://nebula-graph.io/posts/game-of-thrones-relationship-networkx-gephi-nebula-graph/)

In this post, we will access the open source graph database Nebula Graph with NetworkX and visualize the complex character connections in _Game of Thrones_ with Gephi.

## Previous Pick of the Week

1. [Performance Testing Report Comparing Nebula Graph with Other Graph DBMSs](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-aug-14-2020/)
2. [PRs to Improve Performance and Stability of Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-aug-7-2020/)
3. [GO with int Type](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-31-2020/)