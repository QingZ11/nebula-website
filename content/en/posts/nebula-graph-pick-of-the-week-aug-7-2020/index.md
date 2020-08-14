---
title: "Pick of the Week at Nebula Graph - PRs to Improve Performance and Stability of Nebula Graph"
date: 2020-08-07
description: "In this weekly issue, we are covering some pull requests that are helping improve the performance and stability of Nebula Graph."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/87520320-a4e20c00-c637-11ea-8053-7222b9c4f00a.png)

Normally the weekly issue covers Nebula Graph Updates and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

During the last month, no big changes happened to the ranking of Graph DBMS. However, Nebula Graph is still advancing, now ranking at 19th.

![db-engines ranking for august 2020](https://user-images.githubusercontent.com/57335825/90100837-571df980-dcf2-11ea-912f-7380962869fa.png)

## Nebula Graph Updates

Here are some updates in the last week:
• Supports using the `FETCH PROP ON` statement to retrieve the properties of multiple tags for more than one vertex. When this syntax is used together with another syntax in one statement, the pipe (`|`) can be used to pass the output of the previous syntax as the input of the `FETCH PROP ON` syntax. The `FETCH PROP ON *` statement supports retrieving the properties for multiple vertices. For more information, check the following pull requests: https://github.com/vesoft-inc/nebula/pull/2222  https://github.com/vesoft-inc/nebula-docs/pull/117
• Supports exposing RocksDB statistics through Webservice. For more information, check this pull request: https://github.com/vesoft-inc/nebula/pull/2262
• Removed the lock for FunctionManager, improving the performance of frequent invocation by multiple threads. For more information, check this pull request: https://github.com/vesoft-inc/nebula/pull/2273
• Fixed the issue that Leader vote may fail during the BALANCE LEADER execution. For more information, check this pull request: https://github.com/vesoft-inc/nebula/pull/2232
• Restructured VertexHolder::getDefaultProp, improving the performance of retrieving the default value of a property. For more information, check this pull request: https://github.com/vesoft-inc/nebula/pull/2249

## Community Q&A

Q: Nebula Graph grows so quickly. I may need to upgrade my cluster. Is there anything important I should know to do the upgrade? I installed the cluster by using the rpm package. Is there a document introducing how to do that? Thanks.

A: Since you installed the cluster by using the rpm package, before the upgrade, you must do a compatibility check of your data. If you are using a very old version of Nebula Graph, the data may be incompatible in the upgraded version and you must import the data again. In our release notes, you can find the data compatibility requirements. If the data is compatible, follow these steps:

- Step 1. Stop services.
- Step 2. Uninstall the old rpm package.
- Step 3. Install the latest rpm package.
- Step 4. Do a check of the configuration. Update the configurations if necessary and then start the services. If not, start the services directly.

The upgrade is done.

## Recommended for You

[New Players: Something You Should Know When Reading Nebula Graph Source Code](https://nebula-graph.io/posts/how-to-read-nebula-graph-source-code/)

**Why recommended**: In this article, we took an nGQL statement as an example to show how to become a quick learner of Nebula Graph. The author used GDB to trace the data stream and the invocation and execution mechanisms in Nebula Graph after the SHOW SPACES statement was input on the client side.

## Previous Pick of the Week

1. [GO with int Type](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-31-2020/)
2. [FETCH Syntax Goes Further with New Features](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-24-2020/)
3. [SQL vs nGQL & Job Manager in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-17-2020/)
