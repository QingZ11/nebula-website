---
title: "Pick of the Week at Nebula Graph - SQL vs nGQL & Job Manager in Nebula Graph"
date: 2020-07-17
description: "In this weekly issue, we are covering Job Manager and how to optimize the LOOKUP query in Nebula Graph. We have also prepared a guide for DBAs to compare SQL and nGQL."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/88050180-373c5100-cb0b-11ea-9d75-d02303846f3b.png)

Normally the weekly issue covers Feature Explanation and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

This [Comparison Between SQL and nGQL](https://docs.nebula-graph.io/manual-EN/5.appendix/sql-ngql/) document will help you transit from SQL to nGQL and quickly understand the usage of nGQL.

![Comparison Between SQL and nGQL](https://user-images.githubusercontent.com/57335825/88051041-d44bb980-cb0c-11ea-87bf-91fa4b36b084.png)

## Feature Explanation

This week let's talk about the Job Manager feature.

There are some time-consuming tasks running at the storage layer of Nebula Graph. For such tasks, we provide Job Manager, a management tool, for releasing, managing, and querying the jobs.

We currently provide Compact and Flush for task releasing. Compact is usually used to clear data that has been marked for deletion from the storage layer, and flush is used to write back the memfile in memory to the hard disk.

**Scenario #1: Release RocksDB Compact Task.**
To release a RocksDB compact task, you can run the `SUBMIT JOB COMPACT;` command and a Job ID is returned, as shown in the following figure:

![SUBMIT JOB COMPACT](https://user-images.githubusercontent.com/57335825/88051211-1bd24580-cb0d-11ea-837b-126099dac26d.png)

To write the RocksDB memfile in the memory to the hard disk, you can run the `SUBMIT JOB FLUSH;` command and a Job ID is returned, as shown in the following figure:

![SUBMIT JOB FLUSH](https://user-images.githubusercontent.com/57335825/88051325-43291280-cb0d-11ea-81f2-e4bb56110b8e.png)

**Scenarios #2: Query Tasks.**

In terms of task query, we support to list a single job or all jobs for task querying.

To find all the jobs, you can run the `SHOW JOBS;` statement to do the full job query. All the job IDs are returned, as shown in the following figure：

![SHOW JOBS](https://user-images.githubusercontent.com/57335825/88051557-aadf5d80-cb0d-11ea-81bc-33f5dcd37bd4.png)

In this job list, you can see information such as Job ID, Task ID, commands and the landing nodes.

After obtaining the specific ID of a job, you can use `SHOW JOB <JOB ID>;` to query the details. From the job details, you can get the Task ID of each task. Generally, each node for the storaged service has one Task ID, so the number of Task IDs depends on the number of nodes for the storaged service.

![SHOW JOB](https://user-images.githubusercontent.com/57335825/88051708-e11cdd00-cb0d-11ea-8c17-6e8cd2f7041b.png)

The command `STOP JOB <JOB ID>;` can be used to suspend ongoing tasks.

![STOP JOB](https://user-images.githubusercontent.com/57335825/88051801-175a5c80-cb0e-11ea-9ef5-f46efae74453.png)

You can also use `RECOVER JOB;` to resume suspended tasks.

![RECOVER JOB](https://user-images.githubusercontent.com/57335825/88051878-3ce76600-cb0e-11ea-8563-9a5efcd6e79c.png)

## Community Q&A

Q: The LOOKUP query is quite slow. What can I do to optimize the performance?

A: The slow query speed may be caused by the unordered data. The LOOKUP statement needs schema indexes to work well, but the indexes can retrieve data efficiently only when the data are in order. If a large amount of data is imported, we recommend that you do a Compact operation on the data to make them in order. By doing so, the LOOKUP query speed can be improved.

## You Might Also Like

1. [Pick of the Week 28 at Nebula Graph - Running Configuration Explained in Detail](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-10-2020/)
2. [Pick of the Week 30 at Nebula Graph - FETCH Syntax Goes Further with New Features](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-24-2020/)