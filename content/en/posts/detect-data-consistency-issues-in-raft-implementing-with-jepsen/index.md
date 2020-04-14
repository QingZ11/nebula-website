---
title: "How Nebula Graph Uses Jepsen to Detect Data Consistency Issues in Raft Implementing"
date: 2020-04-14
description: "In this post, we will explain how to verify data consistency of the distributed Nebula Graph kv stores with the Jepsen test framework."
author: "critical27"
tags: ["dev-log","features"]
---
![How Nebula Graph Uses Jepsen to Detect Data Consistency Issues in Raft Implementing](https://user-images.githubusercontent.com/57335825/79218578-3b5d3080-7e83-11ea-9b39-82a6ecb5dffb.png)

Data consistent is a global issue for all distributed systems. Nebula Graph is no execption as a distributed graph database.<br />
Thanks to the separation between query and storage layers, Nebula Graph only exposes simple kv interfaces in the storage layer. Using RocksDB as as a backend kv library, Nebula Graph [ensures strong data consistency](https://nebula-graph.io/en/posts/nebula-graph-storage-engine-overview/) among multiple replicas via the Raft protocol.<br />
Although Raft is easier to understand than Paxos, implenting the protocol in a distributed system is another story which requires patience and practice.<br />
In addition to the data consistency issue, how to test a Raft-based distributed system is a disturbing problem too. Currently, Nebula Graph verifies data consistency with Jepsen. In our previous post [Practice Jepsen Test Framework in Nebula Graph](https://nebula-graph.io/en/posts/practice-jepsen-test-framework-in-nebula-graph/), we have introduced in detail how Jepsen test framework works, you may take a look at it to gain some basic understanding about Jepsen.<br />
In this post, we will explain how to verify data consistency of the distributed Nebula Graph kv stores.<br />

## Strong Data Consistency Explained

Let's start with the definition of strong data consistency.  Quote the book [_Designing Data-Intensive Applications_](https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable-ebook/dp/B06XPJML5D/ref=sr_1_1?dchild=1&keywords=Designing+Data-Intensive+Applications&qid=1586310740&sr=8-1)_:_<br />>_In a linearizable system, as soon as one client successfully completes a write, all clients reading from the database must be able to see the value just written._<br />
The basic idea of strong data consistency or linearizability is to make a distributed system appear as if there were only one copy of the data, and all operations on it are atomic. Any read request from any client gets the latest data written to the system.<br />

## Linearizability Verification with Jepsen

Take Jepsen timeline test   as an example. In this test we use the **single-register** model. Clients can only perform read or write operations on the register. All operations are atomic and there is no intermediate state.<br />
Suppose there are four clients sending requests to the system at the same time. Each bar in the figure indicates a request made by a client, where the top of a bar is the time when the request was sent, and the bottom of a bar is when the response was received by the client.<br />
![jepsen test](https://user-images.githubusercontent.com/57335825/79217801-043a4f80-7e82-11ea-85fc-a69c0518790d.png)<br />
From the client's point of view, any request will be processed at anytime between the time when it was sent and the time when the response was received. Seen from the figure above, the three operations, write 1 by client 1 (i.e. 1: write1), write 4 by client 3 (i.e. 3: write4), and read 1 by client 4 (i.e. 4: read1), overlapped in processing time. However, we know the real request processing sequece by the system via the responses received by different clients.<br />
Here's how:<br />
The initial value is empty yet client 4 gets 1 for its read request, which indicates that the read operation by client 4 must have begun after the write 1 operation by client 1 and that write 4 by client 3 must have happened before write 1, or the older value 4 would be returned for the read request by client 4. Thus the sequential order of the three operations is write 4 -> write 1 -> read 1. Although seen from the above figure, request read 1 is sent first, it's the last one processed. Later operations do not overlap in time, that is to say they are sent sequentially. Read request by client 2 returns the last write value 4. The entire process does not violate the rules of strong data consistency, so the verification is passed.<br />
If the read request by client 3 returns the older value 4, then the system is not strongly consistent. Based on the previous analysis, the last successful write value is 1. If client 3 gets the stale value 4, then linearlizability of the system is broken.<br />
Actually Jepsen verifies strong data consistency of distributed systems with similar algorithms.<br />

## Data Consistency Issues Found with Jepsen Test

To better understand data consistency examples following, let's take a look at how a request is processed in a Raft group (three replicas) in Nebula Graph.<br />
Read request processing is relatively simple because the clients only send the requests to the leader. Then the leader, after ensuring it's still the leader, just sends back the corresponding result from the state machine to the client.<br />
Write request processing is a bit more complex. The steps are shown in the Raft Group Figure below:<br />

1. Leader (the green circle) receives requests sent from client and writes them into its wal (write ahead log).
1. Leader sends the corresponding log entry in the wal to its followers and enters the waiting phase.
1. Follower receives the log entry and writes it into its own wal,  then returns success.
1. When at least one follower returns success, leader updates the state machine and sends response to the client.


<br />![Raft groups](https://user-images.githubusercontent.com/57335825/79217666-cccba300-7e81-11ea-81ac-b55cd84cbfcc.png)<br />
Now we will show you some Nebula Graph Raft implementing issues found in Jepsen test with examples below.<br />

### Data consistency example 1: Stale value returned for read requests 

Shown in the above figure, A, B, C forms a three-replica raft group. The circles are the state machines (we assume them as single-registers for simplicity) and the box stores the corresponding log entry.<br />

- At the initial state, all the state machines in the three replicas are 1, the leader is A and the term is 1.
- After request write 2 is sent by the client, leader processes it based on the previously described process, informs the client of a successful write, and  is then killed.
- Then C is elected as leader of term 2. However, since C has yet applied the log entry of write 2 to the state machine (the value is still 1 at the time being), 1 will be returned if C receives requests from client. This absolutely violates the definition of strong data consistency because 2 has been successfully written while a stale value is returned.


Such issue appeares after C is elected as leader of term 2. It is necessary to send heartbeat to ensure the log entry of the previous term is accepted by quorum of the nodes. No read is allowed before the heartbeat success. Otherwise stale data is likely to be returned. Please refer to  Figure 8 and Session 5.4.2 in this[ Raft paper](https://raft.github.io/raft.pdf) if you want more details.<br />


### Data consistency example 2: Leader ensures itself as a leader

Another issue we have found via Jepsen test is: how does a leader ensure itself still the leader? Such problems occur upon network partition. When the old leader is isolated from other nodes due to network failure, if read is still allowed, a stale value is likely to be returned.<br />
To avoid such cases, we have introduced the leader lease concept.<br />
When a node is elected as leader, it needs to send heartbeats to other nodes periodically. If the heartbeat is received by most of the nodes successfully, a lease for some time is obtained and there will not be any new leaders during the term. Thus the data recency is guaranteed on the node and read requests are processed normally during this time.<br />
![image](https://user-images.githubusercontent.com/57335825/79217878-259b3b80-7e82-11ea-9e51-dbe929e11753.png)<br />
Being different from TiKV's process, Nebula Graph doesn't consider _heartbeat interval * some coefficient _as the lease time because of the drift of the clock skew of different nodes.<br />
Rather, we store 1) T1 = heartbeat intervals and 2) T2 = the time cost by the last successful heartbeat or   appendLog, and    get the lease duration by _(T2 - T1)_.<br />
When network is partitioned, the old leader still processes read requests (write requests are failed due to the isolation) during the lease in spite of isolation. When the lease is expired, both read and write requests are failed. If no message is received for at least one heartbeat interval, followers will re-elect a new leader to process future client requests.<br />

## Conclusion

You need long-term pressure tests and failure simulations to discover problems in a distributed system. Jespen is a great helper for its ability to verify distributed systems under various failures. In the future we will introduce other chaos engineering tools to verify data consistency in Nebula Graph. This way we can continuously improve performance while ensuring high data reliability.<br />
>_Hi, I’m critical27, software engineer in Nebula Graph. Currently I am involved in the storage engine development. I hope this article is helpful and let me know if you have any thoughts and suggestions. Thanks!_<br />

## You might also like

- [Practice Jepsen Test Framework in Nebula Graph](https://nebula-graph.io/en/posts/practice-jepsen-test-framework-in-nebula-graph/)
- [An Introduction to Nebula Graph's Storage Engine](https://nebula-graph.io/en/posts/nebula-graph-storage-engine-overview/)

