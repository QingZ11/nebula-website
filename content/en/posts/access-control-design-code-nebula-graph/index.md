---
title: "Access Control in Nebula Graph: Design, Code, and Operations"
date: 2020-06-02
description: "Access Control List (ACL) is not alien to database users and it is a significant part of data security. Like other database vendors, Nebula Graph takes data security seriously and now supports role-based access control."
author: "bright-starry-sky"
tags: ["features"]
---

![Access Control in Nebula Graph: Design, Code, and Operations](https://user-images.githubusercontent.com/57335825/84122202-ef46ec00-a9ec-11ea-8077-e4492cbf0b3a.png)

Access Control List (ACL) is not alien to database users and it is a significant part of data security. Like other database vendors, Nebula Graph takes data security seriously and now supports role-based access control.

In this article, we will detail user management with roles and privileges of Nebula Graph.

## The Authentication Workflow

Nebula Graph is composed of three parts: the query engine, the storage layer and the meta service. The console, API and the web service are collectively referred to as Client API. See the figure below:

![The Authentication Workflow](https://user-images.githubusercontent.com/57335825/84127624-5ddb7800-a9f4-11ea-9bd7-4fdc0a289fbc.png)

The account  and role data will be stored in the meta engine. When query engine is started, the meta client through which the query engine communicates with the meta service will be initialized.

When users connect to query engine through the client API, the query engine will check the user information on the meta engine via the meta client, determining the existence of the requesting account and the correctness of the password. Once the verification is passed, the connection succeeds. Users can then perform data operations in this session.

Once a query is received, the query engine will parse it, which involves identifying the command type and verifying user's authority based on the operation and the user's role. If the authority is invalid, the command will be blocked in the query engine and an error is returned to the client API. In the entire permission check process, Nebula Graph caches the meta data. We will detail this in the next chapter.

## The Access Control Logic

In general, access control is realized through roles and privileges granted to each role. However, in Nebula Graph, permissions are also granted at graph space level.

Nebula Graph supports creating multiple graph spaces in the database. The schema and graph data are managed in each space independently and the spaces are psychically isolated from each other. In addition, Nebula Graph also provides a set of advanced commands for managing the cluster globally.

Therefore, the ACL of Nebula Graph will be managed in three dimensions: **graph** **spaces**, **roles** and **operations**.

### Role Types

Nebula Graph provides five built-in roles: GOD, ADMIN, DBA, USER and GUEST. These  roles have covered all the scenarios in data security. **An account can have different roles in different spaces. But it can only have one role in the same space**.

Descriptions for the roles:

- GOD
   - The initial root user similar to the Root in Linux.
   - Has the highest management access to the cluster.
   - When a cluster is initialized, a GOD account named root is created by default.

- ADMIN
   - Advanced administration at the graph space level.
   - Full management access to a specific graph space.
   - No management access to the cluster.

- DBA
   - Database administration.
   - Access to its authorized graph space. For example, alter or query the schema and data.
   - **Not able to assign roles to users compared to ADMIN.**

- USER
   - Read/write access to the graph data limited to its authorized space.
   - Read-only access to the schema limited to its authorized space.

- GUEST
   - Read-only access to both the schema and graph data limited to its authorized space.

Detailed role list is shown below.

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
| Special Operation | Y | Y | Y | Y | Y |

Note: The Special Operation is available for every user. However, only account authorized result will be returned. For example, `SHOW SPACE` returns the spaces that account can access to.

### Database Operations List

Please refer to the table below for the statements of each operation:

| OPERATION | STATEMENTS |
| --- | --- |
| Read Space | 1.[USE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/use-syntax/) 2.[DESCRIBE SPACE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/)|
| Write Space | 1.[CREATE SPACE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/create-space-syntax/) 2.[DROP SPACE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-space-syntax/) 3.[CREATE SNAPSHOT](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/5.storage-service-administration/cluster-snapshot/#_2) 4.[DROP SNAPSHOT](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/5.storage-service-administration/cluster-snapshot/#_4) 5.[BALANCE](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/5.storage-service-administration/storage-balance/#balance_data) |
| Read Schema | 1.[DESCRIBE TAG](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/) 2.[DESCRIBE EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/describe-syntax/) 3.[DESCRIBE TAG INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_5) 4.[DESCRIBE EDGE INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_5) |
| Write Schema |1.[CREATE TAG](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/create-tag-edge-syntax/) 2.[ALTER TAG](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/alter-tag-edge-syntax/) 3.[CREATE EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/create-tag-edge-syntax/) 4.[ALTER EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/alter-tag-edge-syntax/) 5.[DROP TAG](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-tag-syntax/) 6.[DROP EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/drop-edge-syntax/) 7.[CREATE TAG INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_1) 8.[CREATE EDGE INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_1) 9.[DROP TAG INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_6) 10.[DROP EDGE INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_6)|
| Write User |1.[CREATE USER](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/drop-user-syntax/) 2.[DROP USER](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/drop-user-syntax/) 3.[ALTER USER](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/alter-user-syntax/)|
| Write Role |1.[GRANT](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/grant-role-syntax/) 2.[REVOKE](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/revoke-syntax/) |
| Read Data | 1.[GO](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/go-syntax/) 2.[PIPE](https://docs.nebula-graph.io/manual-EN/2.query-language/3.language-structure/pipe-syntax/) 3.[LOOKUP](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/lookup-syntax/) 4.[YIELD](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/yield-syntax/) 5.[ORDER BY](https://docs.nebula-graph.io/manual-EN/2.query-language/2.functions-and-operators/order-by-function/) 6.[FETCH VERTEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/fetch-syntax/) 7.[FETCH EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/fetch-syntax/) 8.[FIND PATH](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/4.graph-algorithms/find-path-syntax/) 9.[LIMIT](https://docs.nebula-graph.io/manual-EN/2.query-language/2.functions-and-operators/limit-syntax/) 10.[GROUP BY](https://docs.nebula-graph.io/manual-EN/2.query-language/2.functions-and-operators/group-by-function/) 11.[RETURN](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/return-syntax/)|
| Write Data |1.[REBUILD TAG INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_7) 2.[REBUILD EDGE INDEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/1.data-definition-statements/#_7) 3.[INSERT VERTEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/insert-vertex-syntax/) 4.[UPDATE VERTEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/update-vertex-edge-syntax/#_1) 5.[INSERT EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/insert-edge-syntax/) 6.[UPDATE DEGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/update-vertex-edge-syntax/#_2) 7.[DELETE VERTEX](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/delete-vertex-syntax/) 8.[DELETE EDGE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/2.data-query-and-manipulation-statements/delete-edge-syntax/) |
| Special Operation | 1. SHOW，eg: [SHOW SPACE](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/show-statements/show-spaces-syntax/)、[SHOW ROLES](https://docs.nebula-graph.io/manual-EN/2.query-language/4.statement-syntax/3.utility-statements/show-statements/show-roles-syntax/) 2.[CHANGE PASSWORD](https://docs.nebula-graph.io/manual-EN/3.build-develop-and-administration/4.account-management-statements/change-password/)|

## The Access Control Workflow

![The Access Control Workflow](https://user-images.githubusercontent.com/57335825/84127743-7e0b3700-a9f4-11ea-979d-e654129463d4.png)

Similar to  most databases, Nebula Graph fetches access control information from the meta server and authenticates users from the perspectives of the graph space, roles and operations.  Once receiving the connection request from the client, Nebula Graph server will first check the existence of the requesting account and the correctness of the password.

When the login succeeds, Nebula Graph server will initialize the session ID for the connection, loading the session ID, user information, previliges and graph space information into the session. Each subsequent operation will be authorized based on the session information. The session will not be destroyed until the user logs out or session timeout.

In addition, the meta server syndicates the access control information to the meta client periodically so that it can cach the authentication data, thus greatly reducing the network consumption of each connection.

### The Access Control Code Snippets

#### permissionCheck

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
             * Permission checking needs to be done in their executors.
             * skip the check here.
             */
            return true;
        }
        ...
```

#### Permission check entry

```cpp
Status SequentialExecutor::prepare() {
    for (auto i = 0U; i < sentences_->sentences_.size(); i++) {
        auto *sentence = sentences_->sentences_[i].get();
        auto executor = makeExecutor(sentence);
        if (FLAGS_enable_authorize) {
            auto *session = executor->ectx()->rctx()->session();
            /**
             * Skip special operations check here, which are:
             * kUse, kDescribeSpace, kRevoke and kGrant.
             */
            if (!PermissionCheck::permissionCheck(session, sentence)) {
                return Status::PermissionError("Permission denied");
            }
        }
   ...
}
```

## Access Control Sample Queries

### Show Users

```sql
nebula> show users;
===========
| Account |
===========
| root    |
-----------
```

### Create Users

```shell
(root@127.0.0.1:6999) [(none)]> CREATE USER user1 WITH PASSWORD "pwd1"
Execution succeeded (Time spent: 194.471/201.007 ms)

(root@127.0.0.1:6999) [(none)]> CREATE USER user2 WITH PASSWORD "pwd2"
Execution succeeded (Time spent: 33.627/40.084 ms)

# Check the roles of existing users

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

### Grant Roles for Different Accounts

```shell
# Create a graph space

(root@127.0.0.1:6999) [(none)]> CREATE SPACE user_space(partition_num=1, replica_factor=1)
Execution succeeded (Time spent: 218.846/225.075 ms)

(root@127.0.0.1:6999) [(none)]> GRANT DBA ON user_space TO user1
Execution succeeded (Time spent: 203.922/210.957 ms)

(root@127.0.0.1:6999) [(none)]> GRANT ADMIN ON user_space TO user2
Execution succeeded (Time spent: 36.384/49.296 ms)
```

### Show Roles in a Graph Space

```shell
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

### Revoke Roles in a Graph Space

```shell
(root@127.0.0.1:6999) [(none)]> REVOKE ROLE DBA ON user_space FROM user1
Execution succeeded (Time spent: 201.924/216.232 ms)

# Show roles after revoking a role

(root@127.0.0.1:6999) [(none)]> SHOW ROLES IN user_space
=======================
| Account | Role Type |
=======================
| user2   | ADMIN     |
-----------------------
Got 1 rows (Time spent: 16.645/32.784 ms)
```

### Drop User

```shell
(root@127.0.0.1:6999) [(none)]> DROP USER user2
Execution succeeded (Time spent: 203.396/216.346 ms)

# Show the role of user2 role in the graph space

(root@127.0.0.1:6999) [(none)]> SHOW ROLES IN user_space
Empty set (Time spent: 20.614/34.905 ms)

# Show existing users in the graph space

nebula> show users;
===========
| Account |
===========
| root    |
-----------
| user1   |
-----------
Got 2 rows (Time spent: 22.692/38.138 ms)
```

Here comes  the end of Nebula Graph ACL introduction. If you encounter any problems in usage, please tell us on our [forum](https://discuss.nebula-graph.io/) or [GitHub](https://github.com/vesoft-inc/nebula) to get help.

> Hi, I'm bright-starry-sky, engineer at Nebula Graph. I'm interested in database storage and would like to share my experiences in this regard. Hope my post is of help to you. Please let me know if you have any ideas about this. Thanks.

## You might also like

1. [How Indexing Works in Nebula Graph](https://nebula-graph.io/posts/how-indexing-works-in-nebula-graph/)
1. [Storage Balance and Data Migration](https://nebula-graph.io/posts/nebula-graph-storage-banlancing-data-migration/)
1. [An Introduction to Snapshot in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-snapshot-introduction/)
