---
title: "Nebula Graph v1.0.1 Release Note"
date: 2020-07-09
description: "Compared with v1.0.0, this release has made improvement in system stability and performance."
tags: ["release-notes"]
author: Jude
---

![Release-note](https://user-images.githubusercontent.com/38887077/87019600-64ccf480-c205-11ea-91f6-7a5092bfae2c.png)

[Nebula Graph](https://github.com/vesoft-inc/nebula) v1.0.1 is released. Compared with v1.0.0, this release has made improvement in system stability and performance.

## New Features

- Support `uuid()` in `FIND PATH` statement. https://github.com/vesoft-inc/nebula/pull/2209
- Support disabling block cache of rocksdb by setting `rocksdb_block_cache` of `storaged.conf` to less than or equal to 0.  https://github.com/vesoft-inc/nebula/pull/2177
- Adopt `folly::SingletonThreadLocal` in meta client to avoid multi-threads mitigating lock contention on `localCacheLock_`, which improves the performance significantly. https://github.com/vesoft-inc/nebula/pull/2165
- Support different compression algorithms of storage and setting different compressions for different levels.  https://github.com/vesoft-inc/nebula/pull/2179

## bug-fix

- Fix the issue that compaction filter does not work when calls manual compaction. https://github.com/vesoft-inc/nebula/pull/2184
- Fix the issue that `Leader` sends `Snapshot` in some cases. https://github.com/vesoft-inc/nebula/pull/2150
- Fix the issue when `UPSERT/UPDATE` the new prop of existing data after adding a new prop of tag/edgetype, an error return. https://github.com/vesoft-inc/nebula/pull/2186
- Fix the issue that `GO m ... n` returns an error when m is set to 0. https://github.com/vesoft-inc/nebula/pull/2202
- Fix the issue when combining `GO n STEPS` and `|` pipe，an incomplete result is returned in some cases. https://github.com/vesoft-inc/nebula/pull/2203

## You might also like

- [Nebula Graph 1.0 Release Note](https://nebula-graph.com.cn/posts/nebula-graph-1.0-release-note/)