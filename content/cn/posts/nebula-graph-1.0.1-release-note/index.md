---
title: "Nebula Graph v1.0.1 Release Note"
date: 2020-07-09
description: "Nebula Graph 发布 1.0.1 版。相比 1.0.0 版本，该版本针对系统稳定性、性能上做了很多优化和改进。"
tags: ["Release-Note"]
author: Jude
---

![Release-Note](https://www-cdn.nebula-graph.com.cn/nebula-blog/Release-note-v1.png.png)

Nebula Graph 发布 1.0.1 版。相比 1.0.0 版本，该版本针对系统稳定性、性能上做了很多优化和改进。

## New Features

- 路径查询 `FIND PATH` 中 vid 支持 `uuid()`  https://github.com/vesoft-inc/nebula/pull/2209
- 增加了 disable rocksdb block cache 的功能，通过设置 `storaged.conf` 的 `rocksdb_block_cache` 为任意非正数来 disable block cache.  https://github.com/vesoft-inc/nebula/pull/2177
- 避免了多线程对 meta client 的 `localCacheLock_` 的lock contention 等待事件，提高了性能 https://github.com/vesoft-inc/nebula/pull/2165
- 底层存储支持多种压缩算法, 支持对 rocksdb 每个level 指定压缩策略  https://github.com/vesoft-inc/nebula/pull/2179

## bug-fix

- 修复手动 Compaction 时 `CompactionFilter` 失效的问题 https://github.com/vesoft-inc/nebula/pull/2184
- 修复某些情况下，`Leader` 错误发送 `Snapshot` https://github.com/vesoft-inc/nebula/pull/2150
- 修复增加属性后，`UPSERT/UPDATE SET xxx` 老数据的新字段报错的问题 https://github.com/vesoft-inc/nebula/pull/2186
- 修复 `GO m ... n` 当 m 为 0 可能导致的问题 https://github.com/vesoft-inc/nebula/pull/2202
- 修复 pipe 操作结合 GO n STEPS 查询时，某些情况下可能返回数据不全的问题 https://github.com/vesoft-inc/nebula/pull/2203

喜欢本次更新内容？来来来，给我们的 [GitHub](https://github.com/vesoft-inc/nebula) 点个 star 表鼓励啦~~ 🙇‍♂️🙇‍♀️ [手动跪谢]

交流图数据库技术？交个朋友，Nebula Graph 官方小助手微信：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png) 拉你进交流群~~

## 推荐阅读

- [Nebula Graph 1.0 Release Note](https://nebula-graph.com.cn/posts/nebula-graph-1.0-release-note/)
