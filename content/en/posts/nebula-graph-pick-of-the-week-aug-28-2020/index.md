---
title: "Pick of the Week at Nebula Graph - Import data from Neo4J or JanusGraph to Nebula Graph"
date: 2020-08-28
description: "In this weekly issue, we are covering the release of Nebula Graph Exchange which enables you to import data from Neo4j and JanusGraph to Nebula Graph, and other Nebula Graph updates."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/87520320-a4e20c00-c637-11ea-8053-7222b9c4f00a.png)

Normally the weekly issue covers Nebula Graph Updates and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Events of the Week

1. Nebula Graph was invited to the [TNP Database Conference](https://www.nextplatform.com/2020/08/26/the-next-database-platform/).

TheNextPlatform is a future-oriented technology platform that delivers cutting-edge technology to tech-decision makers like CIOs and senior architects. Nebula Graph, as a representative of open-source distributed Graph Database technology, was invited to the Database Event online conference hosted by the platform. Sherman Ye, founder and CEO of VESoft, which is the commercial entity behind Nebula Graph, spoke with TheNextPlaform about the value of graph databases to enterprises. Database experts from Google, MongoDB, OmniSci, and other vendors also attended the conference.

2. Nebula Graph supports importing data from Neo4J or JanusGraph.

[Nebula Graph Exchange](https://github.com/vesoft-inc/nebula-java/tree/master/tools/exchange) (formerly known as Spark Writer) now supports importing data from Neo4j and JanusGraph to Nebula Graph. After connecting to Neo4j/JanusGraph, run the following command to import data with Nebula Graph Exchange.

```bash
$SPARK_HOME/bin/spark-submit --class com.vesoft.nebula.tools.importer.Exchange --master "local[10]" target/exchange-1.0.1.jar -c /path/to/conf/neo4j_application.conf
```

Nebula Graph will provide specific guides in its official documents about the principles and configurations.

## Nebula Graph Updates

The updates of Nebula in the last week:

• Fixed an issue where `scanVertex` and `scanEdge` get no return after configuring `enable_multi_versions`. For more information, see [https://github.com/vesoft-inc/nebula/pull/2312](https://github.com/vesoft-inc/nebula/pull/2312).

• Fixed an issue where `USE SPACE` and `FIND PATH` could not be used together in some cases. For more information, see [https://github.com/vesoft-inc/nebula/pull/2303](https://github.com/vesoft-inc/nebula/pull/2303).

• Fixed an issue where a task to create a snapshot could be triggered by accident. For more information, see [https://github.com/vesoft-inc/nebula/pull/2316](https://github.com/vesoft-inc/nebula/pull/2316).

## Community Q&A

Q: How to install Nebula Graph without connecting to the Internet?

A: If you cannot connect to the Internet while compiling the Nebula Graph source code, you have to manually download the required tools and dependencies in advance, including the GCC compiler in the Nebula Graph repository, third-party libraries, and CMake. Then, copy all these to your host. You can find the step-by-step instructions below.

1. Download the following files on a host that can connect to the Internet.

_Although we use the command line to demonstrate, you can download these files through a browser._

a. Download GCC

1) For RedHat or CentOS users:

```bash
$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh
```

2) For Debian or Ubuntu users:

```bash
$ wget https://oss-cdn.nebula-graph.com.cn/toolset/vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh
```

b. Download CMake.

```bash
$ wget https://cmake.org/files/v3.15/cmake-3.15.5-Linux-x86_64.sh
```

c. Download third-party libraries.

```bash
$ wget https://oss-cdn.nebula-graph.com.cn/third-party/vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh
```

2. Copy the preceding packages to your host that cannot connect to the Internet.

3. Install GCC.

- For RedHat or CentOS users:

```bash
$ sudo bash vesoft-gcc-7.5.0-CentOS-x86_64-glibc-2.12.sh
```

- For Debian or Ubuntu users:

```bash
$ sudo bash vesoft-gcc-7.5.0-Debian-x86_64-glibc-2.13.sh
```

4. Enable GCC

```bash
$ source /opt/vesoft/toolset/gcc/7.5.0/enable
```

5. Install CMake

```bash
$ sudo bash cmake-3.15.5-Linux-x86_64.sh --skip-license --prefix=/opt/vesoft/toolset/cmake
```

6. Add the bin directory of CMake to the PATH.

```bash
$ export PATH=/opt/vesoft/toolset/cmake:$PATH
```

7. Install third-party libraries.

```bash
$ sudo bash vesoft-third-party-x86_64-libc-2.12-gcc-7.5.0-abi-11.sh
```

## Recommendation for You

[Performance Comparison: Neo4j vs Nebula Graph vs JanusGraph](https://nebula-graph.io/posts/performance-comparison-neo4j-janusgraph-nebula-graph/)

The Tencent Cloud team made a multi-dimensional comparison among three of the most popular open-source graph databases. The analysis is of great value and may be quite useful for you.

## Previous Pick of the Week

1. [Release of Studio v1.1.0-beta](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-aug-21-2020/)
2. [Performance Testing Report Comparing Nebula Graph with Other Graph DBMSs](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-aug-14-2020/)
3. [PRs to Improve Performance and Stability of Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-aug-7-2020/)