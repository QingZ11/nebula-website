---
title: "Nebula Graph RC4 Release Note"
date: 2020-04-02
description: "In this release we have added new features such as indexing and enhanced access management. Check this article out for a detailed list of features and changes and steps to upgrade to RC4."
author: "Jude"
tags: ["release-notes"]
---

![rc4](https://user-images.githubusercontent.com/38887077/78220212-ad349200-74f3-11ea-9f01-d056e70058b0.png)

This [release](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4) introduces some new features such as INDEX where you can use the `LOOKUP ON` syntax to query indexed data, access management based on SPACE, and `Nebula Stats Exporter` to interact with Grafana and Prometheus.

By the end of this release note you will find the steps to upgrade from RC3 to RC4.

Below is a list of features and tools in detail:

## New features

- Support Index to make searches of related data more efficient. An index on a property/properties combination can be created with CREATE INDEX. `DROP INDEX` is to drop an index [#1776](https://github.com/vesoft-inc/nebula/pull/1776).  `REBUILD INDEX` is to reindex the data [#1566](https://github.com/vesoft-inc/nebula/pull/1566).
- Support `LOOKUP ON`  to query on index [#1705](https://github.com/vesoft-inc/nebula/pull/1705). See [#1738](https://github.com/vesoft-inc/nebula/pull/1738) for the performance of Storage Engine when inserting data with an index.
- Account management_ _and access control [#1842](https://github.com/vesoft-inc/nebula/pull/1842), [#1873](https://github.com/vesoft-inc/nebula/pull/1873)_.  _All users may perform only the operations permitted to them. For roles available in Nebula Graph and their privileges please refer to  [#1929](https://github.com/vesoft-inc/nebula/pull/1929). Add `--enable_authorize=true`  to nebula-graphd.conf and restart the services to enable  authentication.
- Support TTL to  remove items  after a certain amount of time automatically [#1584](https://github.com/vesoft-inc/nebula/pull/1584), [#422](https://github.com/vesoft-inc/nebula/pull/422), [#1934](https://github.com/vesoft-inc/nebula/pull/1934)
- Enhance `DELETE VERTEX`  to support deleting a batch of vertices. And supports `hash()` and `uuid()`  functions for VertexID [#1317](https://github.com/vesoft-inc/nebula/pull/1317), [#1759](https://github.com/vesoft-inc/nebula/pull/1759)
- Introduce Job Manager to manage the  jobs that take a long time of Storage Engine. At present, it supports `flush`  and `compact` operations. `SUBMIT JOB`  is to submit a job.  `STOP JOB` stops the running jobs. SHOW JOB shows the detailed info of a job. `RECOVER JOB` is to put back the failed job to the queue. [#1424](https://github.com/vesoft-inc/nebula/pull/1424)
- Support `BIDIRECT` for `GO` query to traverse along with both incoming and outgoing directions.  [#1740](https://github.com/vesoft-inc/nebula/pull/1740), [#1752](https://github.com/vesoft-inc/nebula/pull/1752)
- Support Reservoir Sampling. Set enable_reservoir_sampling to TRUE is to turn on the sampling. `Max_edge_returned_per_vertex` in nebula-storage.conf is to configure the number of returned edges. [#1746](https://github.com/vesoft-inc/nebula/pull/1746), [#1915](https://github.com/vesoft-inc/nebula/pull/1915)
- Support more character sets and collations.  `SHOW CHARSET` and `SHOW COLLATION`  statements show all available character sets and collations. It can be configured when creating the space. The default `CHARSET` is utf8, and corresponding `COLLATE` is utf8_bin. [#1709](https://github.com/vesoft-inc/nebula/pull/1709) 

## OLAP Interface

- Add Spark example for Nebula Graph. [#56](https://github.com/vesoft-inc/nebula-java/pull/56)

## Tools

-  Support Deploying Nebula Graph on Kubernetes with Helm [#1473](https://github.com/vesoft-inc/nebula/pull/1473)
-  Introduce `Nebula Stats Exporter` (for Prometheus) to collect database metrics and expose metrics to Prometheus. And Grafana is integrated for metrics Visualization and Alerting. [https://github.com/vesoft-inc/nebula-stats-exporter/pull/2](https://github.com/vesoft-inc/nebula-stats-exporter/pull/2)

## Changes

- RC4 is not compatible with the Data inserted before commitID `43453a0` (2020.02.06) due to the change of the underlying data structure.
- The documentation has been moved to repo `vesoft-inc/nebula-doc` for better maintenance
- For Nebula Python Client, `is_async`  is not supported when creating `ConnectionPool`. Async client will be available later.

## Upgrade from RC3 to RC4

If you are currently using a previous version of Nebula Graph and would like to try the new features in RC4, please follow the steps below for an upgrade:
1. Stop all Nebula services
    1. Execute scripts/nebula.service stop all on each machine
    1. Execute scripts/nebula.service status all to confirm all services are stopped
2. Install the new RPM package on each machine according to the OS you are using
    1. Get package: [https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4](https://github.com/vesoft-inc/nebula/releases/tag/v1.0.0-rc4)
    1. Install package, like: rpm -Uvh nebula-1.0.0-rc4.el7-5.x86_64.rpm
3. Start Nebula
    1. Execute scripts/nebula.service start all on each machine
    1. Execute scripts/nebula.service status all to confirm Nebula services are started on each machine
4. Reload your data into Nebula Graph

If you have any thoughts or suggestions, please feel free to leave us a comment via the Discussion board below! Or you may [raise an issue](https://github.com/vesoft-inc/nebula/issues) directly on GitHub.

## You might also like

- [Nebula Graph RC3 Release Note](https://nebula-graph.io/posts/nebula-graph-rc3-release-note/)
- [Nebula Graph RC2 Release Note](https://nebula-graph.io/posts/nebula-graph-rc2-release-note/)
