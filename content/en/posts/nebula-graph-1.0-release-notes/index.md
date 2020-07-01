---
title: "Nebula Graph 1.0 Release Notes"
date: 2020-06-29
description: "Nebula Graph 1.0 has been officially released. Here are a list of the basic and advanced featured in this release."
author: "Jude"
tags: ["release-notes"]
---
![Nebula Graph 1.0 Press Release](https://user-images.githubusercontent.com/57335825/85944491-efe7e980-b8eb-11ea-9fbb-f00262a81165.png)


## Basic Features

- **Online DDL & DML.** Support updating schemas and data without stopping or affecting your ongoing operations.
- **Graph traversal.** `GO` statement supports forward/reverse and bidirectional graph traversal. `GO minHops TO maxHops` is supported to get variable hops relationships.
- **Aggregate.** Support aggregation functions such as `GROUP BY`, `ORDER BY`, and `LIMIT`.
- **Composite query.** Support composite clauses: `UNION`, `UNION DISTINCT`, `INTERSECT`, and `MINUS`.
- **PIPE statements.** The result yielded from the previous statement could be piped to the next statement as input.
- **Use defined variables.** Support user-defined variables to pass the result of a query to another.
- **Index.** Both the single-property index and composite index are supported to make searches of related data more efficient. `LOOKUP ON` statement is to query on the index.

## Advanced Features

- **Privilege Management.** Support user authentication and role-based access control. Nebula Graph can easily integrate with third-party authentication systems. There are five built-in roles in Nebula Graph: `GOD`, `ADMIN`, `DBA`, `USER`, and `GUEST`. Each role has its corresponding privileges.
- **Support Reservoir Sampling,** which will retrieve k elements randomly for the sampling of the supernode at the complexity of `O(n)`.
- **Cluster snapshot.** Support creating snapshots for the cluster as an online backup strategy.
- **TTL.** Support  TTL to expire items after a certain amount of time automatically.
- **Operation & Maintenance**
    - Scale in/out. Support online scale in/out and load balance for storage
    - `HOSTS` clause to manage storage hosts
    - `CONFIGS` clause to manage configuration options
- **Job Manager & Scheduler.** A tool for job managing and scheduling. Currently, `COMPACT` and `FLUSH` jobs are supported.
- **Graph Algorithms.** Support finding the full path and the shortest path between vertices.
- **Provide OLAP interfaces** to integrate with third-party graph analytics platforms.
- **Support multiple character sets and collations.** The default `CHARSET` and `COLLATE` are `utf8` and `utf8_bin`.

## Clients

- **Java Client.** Support source code building and downloading from the MVN repository, see [Java Client](https://github.com/vesoft-inc/nebula-java/releases) for more details.
- **Python Client.** Support source code building and installation with pip, see [Python Client](https://github.com/vesoft-inc/nebula-python/blob/master/CHANGELOG.md) for more details.
- **Golang Client.** Install the client with the command `go get -u -v github.com/vesoft-inc/nebula-go`，see [Go Client](https://github.com/vesoft-inc/nebula-go/releases) for more details.

## Nebula Graph Studio
A graphical user interface for working with Nebula. Support querying, designing schema, data loading, and graph exploring. See [Nebula Graph Studio](https://github.com/vesoft-inc/nebula-web-docker)  for more details.

## Tools

- **Data Import**  
    - [Nebula-Importer](https://github.com/vesoft-inc/nebula-importer) is used to import data from the CSV file.
    - [Spark Writer](https://github.com/vesoft-inc/nebula-docs/blob/master/docs/manual-EN/3.build-develop-and-administration/5.storage-service-administration/data-import/spark-writer.md), a Spark-based distributed data import tool that converts data from multiple data resources into the Nebula Graph.
- **Data Export**   
    - [Dump Tool](https://github.com/vesoft-inc/nebula-docs/blob/master/docs/manual-EN/3.build-develop-and-administration/5.storage-service-administration/data-export/dump-tool.md). A single-machine off-line data dumping tool to dump or count data with specified conditions.
- **Monitoring** 
    - [Nebula Stats Exporter](https://github.com/vesoft-inc/nebula-stats-exporter) (for Prometheus), is to collect database metrics and expose metrics to Prometheus. And Grafana has integrated for metrics Visualization and Alerting.
