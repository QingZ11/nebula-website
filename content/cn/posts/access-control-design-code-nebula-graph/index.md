---
title: "一文读懂图数据库 Nebula Graph 访问控制实现原理"
date: 2020-06-02
description: "数据库权限管理对大家都很熟悉，然而怎么做好数据库权限管理呢？在本文中将详细介绍 Nebula Graph 的用户管理和权限管理。"
tags: ["特性讲解"]
author: bright-starry-sky
---

![access-control](https://www-cdn.nebula-graph.com.cn/nebula-blog/access-control.png)

数据库权限管理对大家来说都已经很熟悉了。Nebula Graph 本身是一个高性能的海量图数据库，对数据的安全控制也是不容质疑的。目前 Nebula Graph 已支持基于角色的权限控制功能。在这篇文章中将详细介绍 Nebula Graph 的用户管理和权限管理。

## Nebula Graph 架构体系

![nebula-graph-architecture](https://www-cdn.nebula-graph.com.cn/nebula-blog/nebula-graph-architecture.png)

由上图可知，Nebula Graph的主体架构分为三部分：Computation Layer、Storage Layer 和 Meta Service。Console 、API 和 Web Service 被统称为 Client API。 账户数据和权限数据将被存储在 Meta Engine中，当Query Engine 启动后，将会初始 Meta Client，Query Engine 将通过 Meta Client 与 Meta Service 进行通信。

当用户通过 Client API 连接 Query Engine 时，Query Engine 会通过 Meta Client 查询 Meta Engine 的用户数据，并判断连接账户是否存在，以及密码是否正确。当验证通过后，连接创建成功，用户可以通过这个连接执行数据操作。当用户通过 Client API 发送操作指令后，Query Engine 首先对此指令做语法解析，识别操作类型，通过操作类型、用户角色等信息进行权限判断，如果权限无效，则直接在 Query Engine 阻挡操作，并返回错误信息至 Client API。 在整个权限检查的过程中，Nebula Graph 对 Meta data 进行了缓存，将在以下章节中介绍。

## 功能描述

在介绍功能之前，需要先描述一下 Nebula Graph 的逻辑结构：Nebula Graph 是一个支持多图空间（Space) 的图数据库，Space 中独立管理 Schema 和 Data，Space 和 Space 之间相互独立。另外，Nebula Graph 还提供了一系列高级命令用于全局管理 Cluster，Cluster 的操作命令和 Space 的操作命令将在下文中详细描述。

因此 Nebula Graph 的权限管理将会基于**图空间（Space）**、**角色（Role）**、**操作（Operation）** 三个维度进行。详细描述请看下列子章节。

### 角色划分

Nebula Graph 提供了五种操作角色，分别是 GOD、ADMIN、DBA、USER、GUEST，这五种操作角色基本覆盖了所有的数据安全控制的场景。**一个登陆账户（Account）可以在不同的 Space 中拥有不同角色，但一个 Account 在同一个 Space 中只能拥有一种角色**。角色讲解：

- GOD：相当于 Linux 操作系统中的 root 用户，**拥有最高的管理权限**。Nebula Graph Cluster 在初始化时会默认创建一个 GOD 角色的 Account，名为 root。
- ADMIN：基于 Space 的高级管理员，拥有此 Space 之内的所有管理权限，**但对整个集群则没有管理权限**。
- DBA：数据库管理员，可以对权限内的 Space 进行管理，例如对 Schema / Data 进行修改和查询。和 ADMIN 的区别是 **DBA 不能对某个 Account 进行授权操作，但 ADMIN 可以**。
- USER：普通的数据库使用角色。**可读写 Data，可读 Schema 但没有写权限**。
- GUEST：访问者角色，**对权限内 Space 的 Schema 和 Data 有只读权限**。

详细权限列表如下图所示：

| OPERATION | GOD | ADMIN | DBA | USER | GUEST |
| --- | --- | --- | --- | --- | --- |
| Read Space | Y | Y | Y | Y | Y |
| Write Space | Y |  |  |  |  |
| Read Schema | Y | Y | Y | Y | Y |
| Write Schema | Y | Y | Y |  |  |
| Write User | Y |  |  |  |  |
| Write Role | Y | Y |  |  |  |
| Read Data | Y | Y | Y | Y | Y |
| Write Data | Y | Y | Y | Y |  |
| Special operation | Y | Y | Y | Y | Y |

注 : Special Operation 为特殊操作，例如 SHOW SPACE，每个角色都可以执行，但其执行结果只显示 Account 权限内的结果。

### 数据库操作权限细分

基于上边的角色列表，不同的角色拥有不同的操作许可，详细如下：

| OPERATION | STATEMENTS |
| --- | --- |
| Read Space | 1.[USE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/use-syntax/) 2.[DESCRIBE SPACE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/)|
| Write Space | 1.[CREATE SPACE ](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/create-space-syntax/) 2.[DROP SPACE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-space-syntax/) 3.[CREATE SNAPSHOT](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/5.storage-service-administration/cluster-snapshot/#_2) 4.[DROP SNAPSHOT](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/5.storage-service-administration/cluster-snapshot/#_4) 5.[BALANCE](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/5.storage-service-administration/storage-balance/#balance_data) |
| Read Schema | 1.[DESCRIBE TAG](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/) 2.[DESCRIBE EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/) 3.[DESCRIBE TAG INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_5) 4.[DESCRIBE EDGE INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_5) |
| Write Schema |1.[CREATE TAG](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/create-tag-edge-syntax/) 2.[ALTER TAG](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/alter-tag-edge-syntax/) 3.[CREATE EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/create-tag-edge-syntax/) 4.[ALTER EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/alter-tag-edge-syntax/) 5.[DROP TAG](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-tag-syntax/) 6.[DROP EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-edge-syntax/) 7.[CREATE TAG INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_1) 8.[CREATE EDGE INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_1) 9.[DROP TAG INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_6) 10.[DROP EDGE INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_6)|
| Write User |1.[CREATE USER](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/drop-user-syntax/) 2.[DROP USER](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/drop-user-syntax/) 3.[ALTER USER](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/alter-user-syntax/)|
| Write Role |1.[GRANT](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/grant-role-syntax/) 2.[REVOKE](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/revoke-syntax/) |
| Read Data | 1.[GO](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/go-syntax/) 2.[PIPE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/3.language-structure/pipe-syntax/) 3.[LOOKUP](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/lookup-syntax/) 4.[YIELD](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/yield-syntax/) 5.[ORDER BY](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/2.functions-and-operators/order-by-function/) 6.[FETCH VERTEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/fetch-syntax/) 7.[FETCH EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/fetch-syntax/) 8.[FIND PATH](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/4.graph-algorithms/find-path-syntax/) 9.[LIMIT](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/2.functions-and-operators/limit-syntax/) 10.[GROUP BY](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/2.functions-and-operators/group-by-function/) 11.[RETURN](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/return-syntax/)|
| Write Data |1.[REBUILD TAG INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_7) 2.[REBUILD EDGE INDEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/1.data-definition-statements/#_7) 3.[INSERT VERTEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/insert-vertex-syntax/) 4.[UPDATE VERTEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/update-vertex-edge-syntax/#_1) 5.[INSERT EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/insert-edge-syntax/) 6.[UPDATE DEGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/update-vertex-edge-syntax/#_2) 7.[DELETE VERTEX](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/delete-vertex-syntax/) 8.[DELETE EDGE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/delete-edge-syntax/) |
| Special Operation | 1. SHOW，eg: [SHOW SPACE](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/show-statements/show-spaces-syntax/)、[SHOW ROLES](https://docs.nebula-graph.com.cn/manual-CN/2.query-language/4.statement-syntax/3.utility-statements/show-statements/show-roles-syntax/) 2.[CHANGE PASSWORD](https://docs.nebula-graph.com.cn/manual-CN/3.build-develop-and-administration/4.account-management-statements/change-password/)|

## 控制逻辑

![access-control-architecture](https://www-cdn.nebula-graph.com.cn/nebula-blog/access-control-architecture.png)

Nebula Graph 的用户管理和权限管理和大多数数据库的控制相似，**基于 meta server，对图空间（Space）、角色（Role）、操作（Operation）三个层面进行权限管理**，当 Client 连接 Nebula Graph Server 的时候，Nebula Graph Server 首先会验证登陆账户（**Account**）是否存在，并验证密码是否有效。

登录成功后，Nebula Graph Server 会为此连接初始 Session ID，并将 Session ID、用户信息、权限信息和 Space 信息一起加载到 Session 结构中。后续的每次操作将基于 Session 结构中的信息进行权限判断。直到用户主动退出连接或 session timeout，Session 销毁。另外，Meta Client 对权限信息进行了缓存，并根据设置的时间频率进行缓存同步，有效降低了用户连接的过程的时间耗费。

### 控制逻辑代码片段

#### Permission Check

```cpp
bool PermissionCheck::permissionCheck(session::Session *session, Sentence* sentence) {
    auto kind = sentence->kind();
    switch (kind) {
        case Sentence::Kind::kUnknown : {
            return false;
        }
        case Sentence::Kind::kUse :
        case Sentence::Kind::kDescribeSpace : {
            /**
             * Use space and Describe space are special operations.
             * Permission checking needs to be done in their executor.
             * skip the check at here.
             */
            return true;
        }
        ...
```

#### Permission Check Entry

```cpp
Status SequentialExecutor::prepare() {
    for (auto i = 0U; i < sentences_->sentences_.size(); i++) {
        auto *sentence = sentences_->sentences_[i].get();
        auto executor = makeExecutor(sentence);
        if (FLAGS_enable_authorize) {
            auto *session = executor->ectx()->rctx()->session();
            /**
             * Skip special operations check at here. they are :
             * kUse, kDescribeSpace, kRevoke and kGrant.
             */
            if (!PermissionCheck::permissionCheck(session, sentence)) {
                return Status::PermissionError("Permission denied");
            }
        }
   ...
}
```

## 示例

### 查看现有用户角色

```
(root@127.0.0.1:6999) [(none)]> SHOW USERS;
===========
| Account |
===========
| root    |
-----------
Got 1 rows (Time spent: 426.351/433.756 ms)
```

### 创建用户

```
(root@127.0.0.1:6999) [(none)]> CREATE USER user1 WITH PASSWORD "pwd1"
Execution succeeded (Time spent: 194.471/201.007 ms)

(root@127.0.0.1:6999) [(none)]> CREATE USER user2 WITH PASSWORD "pwd2"
Execution succeeded (Time spent: 33.627/40.084 ms)

# 查看现有用户角色

(root@127.0.0.1:6999) [(none)]> SHOW USERS;
===========
| Account |
===========
| root    |
-----------
| user1   |
-----------
| user2   |
-----------
Got 3 rows (Time spent: 24.415/32.173 ms)
```

### 为 Space 中的不同 Account 指定角色

```
# 创建图空间

(root@127.0.0.1:6999) [(none)]> CREATE SPACE user_space(partition_num=1, replica_factor=1)
Execution succeeded (Time spent: 218.846/225.075 ms)

(root@127.0.0.1:6999) [(none)]> GRANT DBA ON user_space TO user1
Execution succeeded (Time spent: 203.922/210.957 ms)

(root@127.0.0.1:6999) [(none)]> GRANT ADMIN ON user_space TO user2
Execution succeeded (Time spent: 36.384/49.296 ms)
```

### 查看特定 Space 的已有角色

```
(root@127.0.0.1:6999) [(none)]> SHOW ROLES IN user_space
=======================
| Account | Role Type |
=======================
| user1   | DBA       |
-----------------------
| user2   | ADMIN     |
-----------------------
Got 2 rows (Time spent: 18.637/29.91 ms)
```

### 取消特定 Space 的角色授权

```
(root@127.0.0.1:6999) [(none)]> REVOKE ROLE DBA ON user_space FROM user1
Execution succeeded (Time spent: 201.924/216.232 ms)

# 查看取消之后，user_space 现有角色

(root@127.0.0.1:6999) [(none)]> SHOW ROLES IN user_space
=======================
| Account | Role Type |
=======================
| user2   | ADMIN     |
-----------------------
Got 1 rows (Time spent: 16.645/32.784 ms)
```

### 删除某个 Account 角色

```
(root@127.0.0.1:6999) [(none)]> DROP USER user2
Execution succeeded (Time spent: 203.396/216.346 ms)

# 查看 user2 在 user_space 的角色

(root@127.0.0.1:6999) [(none)]> SHOW ROLES IN user_space
Empty set (Time spent: 20.614/34.905 ms)

# 查看数据库现有 account

(root@127.0.0.1:6999) [(none)]> SHOW USERS;
===========
| Account |
===========
| root    |
-----------
| user1   |
-----------
Got 2 rows (Time spent: 22.692/38.138 ms)
```

本文中如有任何错误或疏漏，欢迎去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) issue 区向我们提 issue 或者前往官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

> 作者有话说：Hi，我是 bright-starry-sky，是图数据 Nebula Graph 研发工程师，对数据库存储有浓厚的兴趣，希望本次的经验分享能给大家带来帮助，如有不当之处也希望能帮忙纠正，谢谢~

