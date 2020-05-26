---
title: "Task Manager 的设计简述"
date: 2020-05-26
description: "对长耗时的任务怎么进行管理与调度才能提升数据库性能？这些调度策略有哪些权衡与取舍呢？本文将着重讲述如何对长耗时的 Task 进行管理与调度进一步提升数据库性能。"
tags: ["特性讲解"]
author: lionel.liu
---

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM01.jpeg)

讲解 Task Manager 之前，在这里先介绍一些 Task Manager 会使用到的概念术语。

图数据库 Nebula Graph 中，存在一些长期在后台运行的任务，我们称之为 Job。存储层存在的 DBA 使用的部分指令，比如：数据完成导入后，想在全局做一次 compaction，都是 Job 范畴。

作为一个分布式的系统，Nebula Graph 中 Job 由不同的 storaged 完成，而我们管一个 storaged 上运行的 Job 子任务叫做 Task。Job 的控制由 metad 上的 Job Manager 负责，而 Task 的控制由 storaged 上的 Task Manager 负责。

在本文中，我们着重讲述如何对长耗时的 Task 进行管理与调度进一步提升数据库性能。

## Task Manager 要解决的问题

上文说到 storaged 上的 Task Manager 控制的 Task 是 meta 控制的 Job 的子任务，那 Task Manager 它自己具体解决什么问题呢？在 Nebula Graph 中 Task Manager 主要解决了以下 2 个问题：

- 将之前通过 HTTP 的传送方式改为 RPC（Thrift）
一般用户在搭建集群时，知道 storaged 之间通信使用 Thrift 协议，会为 Thrift 所需端口开放防火墙，但是可    能意识不到 Nebula Graph 还需要使用 HTTP 端口，我们遇到过多次社区用户实践忘记开放 HTTP 端口的事情。
- storaged 对于 Task 有调度能力
这块内容将在本文下面章节展开讲述。

## Task Manager 在 Nebula Graph 中的位置

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM02.png)

## Task Manager 体系中的 meta 

在 Task Manager 体系中,  metad（JobManager）的任务是根据 graphd 中传过来的一个 Job Request，选出对应的 storaged host，并拼组出 Task Request 发给对应的 storaged。不难发现，体系中 meta 接受 Job Request，拼组 Task Request , 发送 Task Request 及接受 Task 返回结果，这些逻辑的套路是稳定的。而如何拼组 TaskRequest，将 Task Request 发给哪些 storaged 则会根据不同的 Job 有所变化。JobManager 用 `模板策略`  + `简单工厂` 以应对未来的扩展。

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM03.png)

让未来的 Job 同样继承于 MetaJobExecutor，并实现 prepare() 和 execute() 方法即可。

## Task Manager 的调度控制

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM04.png)

之前提到的，Task Manager 的调度控制希望做到 2 点：

- 系统资源足够时，尽可能的高并发执行 Task
- 系统资源吃紧时，让所有运行中的 Task 占用的资源不要超过某一个设定的阈值。

### 高并发执行 Task

Task Manager 将系统资源中自己持有的线程称之为 Worker。Task Manager 有一个现实中的模拟原型——银行的营业厅。想象一下, 我们去银行办业务时会有以下几步:

- 场景 1：在门口的排号机拿一个号
- 场景 2：在大厅找个位置, 边玩手机边等叫号
- 场景 3：等叫到号时, 到指定窗口办理

同时, 你还会碰到这样那样的问题:

- 场景4：VIP 可以插队
- 场景5：你可能排着队, 因为某些原因, 放弃了本次业务
- 场景6：你可能排着排着队, 银行就关门了

那么, 整理一下, 这也就是 Task Manager 的基本需求

1. Task 按 FIFO 顺序执行：不同的 Task 有不同的优先级，高优先级的可以插队
2. 用户可取消一个排队中的 Task
2. storaged 随时 shutdown
2. 一个 Task，为了使其尽可能高的并发，会被拆分为多个 SubTask，SubTask 是每个 Worker 真正执行的任务
2. Task Manager 是全局唯一实例，要考虑多线程安全性

于是, 有了如下实现:

- 实现 1：用 Thrift 结构中的 JobId 和 TaskId，确定一个 Task，称为 Task Handle。
- 实现 2：TaskManager 会有一个 Blocking Queue，负责让 Task 的 Handle 排队执行（排号机），而 Blocking Queue 本身线程安全。
- 实现 3：Blocking Queue 同时支持不同的优先级, 高优先级先出队（VIP 插队的功能）。
- 实现 4：Task Manager 维持一个全局唯一的 Map，key 是 Task Handle，value 是具体的 Task（银行的大厅）。在 Nebula Graph 中采用了 folly 的 Concurrent Hash Map，线程安全的 Map。
- 实现 5：如果有用户 cancel Task，直接在根据 Handle 找到 Map 中对应的 Task，并标记 cancel，对 queue 中的 Handle 不做处理。
- 实现 6：如果有正在运行的 Task，对于 storaged 的 shutdown 会等到这个 Task 正在执行的 subTask 执行完毕才返回。

### 限定 Task 占用的资源阈值

保证不超过阈值还是很简单的，因为 Worker 就是线程，只要让所有的 Worker 都出自一个线程池，就可以保证最大的 Worker 数。麻烦的是将子任务平均地分配到 Worker 中, 我们来讨论下方案:

#### 方法一：使用 Round-robin 添加任务

最简单的方法是用 Round-robin 的方式来添加任务。也就是将 Task 分解为 Sub Task 之后, 依次追加到现在的各个 Worker 中。

但是可能会有问题, 比如说, 我有 3 个 Worker, 2 个 Task（蓝色为 Task 1，黄色为 Task 2）：

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM05.png)

Round-robin 图 1

假如 Task 2 中的 Sub Task 执行远快于 Task1 的, 那么好的并行策略应该是这样：

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM06.png)

Round-robin 图 2

简单粗暴的 Round-robin 会让 Task 2 的完成时间依赖于 Task 1（见 Round-robin 图1）。 

#### 方法二：一组 worker 处理一个 Task

针对方法一可能会出现的情况，设定专门的 Worker 只处理指定的 Task，从而避免多个 Task 相互依赖问题。但是依然不够好, 比如说：

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM07.png)

很难保证每个 Sub Task 执行时间基本相同，假设 Sub Task 1 的执行明显慢于其他的 Sub Task，那么好的执行策略应该是这样的：

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM08.png)

这个方案还是避免不了 1 核有难，10 核围观的问题 👀。

#### 方法三：Nebula Graph 采用的解决方案

在 Nebula Graph 中 Task Manager 会将 Task 的 Handle 交给 N 个 Worker。N 由总 Worker 数、总 Sub Task 数，以及 DBA 在提交 Job 时指定的并发参数共同决定。

每个 Task 内部维护一个 Blocking Queue（下图的 Sub Task Queue），存放 Sub Task。Worker 在执行时，根据自己持有的 Handle 先找到 Task，再从 Task 的 Block Queue 中获取 Sub Task。

![](https://www-cdn.nebula-graph.com.cn/nebula-blog/TM09.png)

## 设计补充说明

问题 1: 为什么不直接将 Task 放到 Blocking Queue 排队，而是拆成两部分，将 Task 保存在 Map 里，让 Task Handle 排队?

> 主要原因是 C++ 多线程基础设施不好支持这种逻辑。Task 需要支持 cancel。假设 Task 放在 Blocking Queue 中，就需要 Blocking Queue 支持定位到其中的某一个 Task 的能力。而当前 folly 中的 Blocking Queue 都没有此类接口。

问题 2: 什么样的 Job 有 VIP 待遇?

> 当前 Task Manager 支持的 compaction / rebuild index 对执行时间并不敏感，支持类似 count(*) 查询操作功能尚在开发中。考虑到用户希望在一个相对短的时间内完成 count(*) ，那么假如正好碰上了 storaged 在做多个 compaction，还是希望 count(*) 可以优先运行，而非在所有 compaction 之后再开始做。

本文中如有任何错误或疏漏欢迎去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) issue 区向我们提 issue 或者前往官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

> 作者有话说：Hi，我是 我是 lionel.liu，是图数据 Nebula Graph 研发工程师，对数据库查询引擎有浓厚的兴趣，希望本次的经验分享能给大家带来帮助，如有不当之处也希望能帮忙纠正，谢谢~

