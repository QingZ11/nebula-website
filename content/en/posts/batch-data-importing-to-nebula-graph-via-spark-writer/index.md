---
title: "Nebula Graph Data Importer: Spark Writer"
date: 2020-09-03
description: "Spark Writer is a Spark-based distributed data importer for Nebula Graph. It converts data from multiple data sources into vertices and edges for graphs and batch imports data into the graph database."
tags: ["dev-log","features"]
author: Darion
---

![image.png](https://www-cdn.nebula-graph.com.cn/nebula-blog/spark-writer.png)

## Starting From Hadoop

With the rise of big data in recent years, distributed computing engines are emerging one after another. Apache Hadoop is a collection of open-source software utilities that is widely applied on many large websites. The core design of Hadoop comes from the Google MapReduce paper. It is inspired by the map and reduce functions commonly used in functional programming. Map is a higher-order function that applies a given function to each element of a functor, e.g. a list, returning a list of results in the same order. It is often called apply-to-all when considered in functional form. A reduce method performs a summary operation. The MapReduce algorithm is used to classify and process data.

## A Little About Apache Spark

Apache Spark is a lightning-fast parallel general-purpose cluster-computing framework. Originally developed at the AMPLab of UC Berkeley in 2009, the Spark codebase was donated to the Apache Software Foundation in 2010. Inspired by Hadoop, Spark inherits the advantages of distributed parallel computing and provides a rich set of operators.

Spark provides a comprehensive and unified framework for different data source managing, batch processing, and stream processing. It supports in-memory computing and outperforms Hadoop. It also supports programming in Java, Scala, and Python. Spark operates the distributed dataset by operating the local collections and provides interactive queries. In addition to the classic MapReduce, Spark also supports Spark SQL for SQL and structured data processing, MLlib for machine learning, GraphX for graph processing, and Structured Streaming for incremental computation and stream processing.

![The Spark Stack](https://user-images.githubusercontent.com/57335825/92091361-81a92280-ed85-11ea-8c13-89a72c2f236a.png)

Resilient Distributed Datasets (RDD) is a fundamental data structure of Spark. It is an immutable distributed collection of objects. RDD is fault-tolerant and location-scheduling. Operating an RDD is like operating a local dataset. You need not worry about the scheduling and fault tolerance. When executing multiple queries, RDD allows users to explicitly cache the dataset in memory. Thus you can reuse the cached dataset in the subsequent queries. A Directed Acyclic Graph (DAG) is formed by a series of RDD conversions. The DAGs can be classified into different stages according to the different RDD dependencies.

Like an RDD, a DataFrame is an immutable distributed collection of data. Unlike an RDD, data is organized into named columns, like a table in a relational database. Designed to make large data sets processing even easier, DataFrame allows developers to impose a structure onto a distributed collection of data, allowing higher-level abstraction.

Dataset is a strongly-typed API that converts the functional or related operations in parallel. Conceptually, you can consider the DataFrame as an alias for a collection of generic objects Dataset[Row]. A Row is a generic untyped JVM object. Dataset is a collection of strongly-typed JVM objects and can be optimized with these types.

DataFrame and dataset trigger calculations only when performing operations. Essentially, a data set represents a logical plan that describes the calculations needed to generate the data. When performing operations, Spark's query optimizer optimizes the logical plan and generates an efficient parallel and distributed physical plan.

![History of Spark APIs](https://user-images.githubusercontent.com/57335825/92091467-a7362c00-ed85-11ea-99ce-501e150616b5.png)

## Spark Writer - Import Data from Spark to Nebula Graph

Spark Writer is a Spark-based distributed data importer for [Nebula Graph](https://github.com/vesoft-inc/nebula). It converts data from multiple data sources into vertices and edges for graphs and batch imports data into the graph database. Currently supported data sources are Hive and Hadoop Distributed File System (HDFS).

Spark Writer supports importing multiple tags and edges in parallel, and configuring different data sources for different tags and edges.

Spark Writer generates insert statements from the data through the configuration file and then sends it to the query engine and executes the insert operation. Insert operations are executed asynchronously in Spark Writer. The success and failure stats comes from the accumulator for Spark.

## How to Get Spark Writer

### From the Source Code

```bash
git clone https://github.com/vesoft-inc/nebula.git
cd nebula/src/tools/spark-sstfile-generator
mvn compile package
```

## Example Data for Spark Writer

### Format for the Tag Data File

A tag data file consists of multiple rows. Each line in the file represents a vertex and its properties. In general, the first column is the vertex ID. This ID column is specified in the mapping file. Other columns are the properties of the vertex. Consider the following example in JSON format.

```bash
{"id":100,"name":"Tim Duncan","age":42}
{"id":101,"name":"Tony Parker","age":36}
{"id":102,"name":"LaMarcus Aldridge","age":33}
```

### Format for the Edge Type Data File

An edge type data file consists of multiple rows. Each line in the file represents an edge and its properties. In general, the first column is the ID of the source vertex, the second column is the ID of the dest vertex. These ID columns are specified in the mapping file. Other columns are the properties of the edge. Consider the following example in JSON format.

```bash
{"source":100,"target":101,"likeness":95}
{"source":101,"target":100,"likeness":95}
{"source":101,"target":102,"likeness":90}
{"source":100,"target":101,"likeness":95,"ranking":2}
{"source":101,"target":100,"likeness":95,"ranking":1}
{"source":101,"target":102,"likeness":90,"ranking":3}
```

### Format for the Configuration File

Spark Writer adopts the Human-Optimized Config Object Notation (HOCON) format for its configuration files. HOCON is an easy-to-use and object-oriented format for configuration files. It consists of the Spark field, the Nebula field, the tag mapping field and the edge mapping field.

The Spark related parameters are configured in the Spark field. The username and password information for Nebula Graph is configured in the `nebula` field. Basic data source information for each tag/edge is described in the tag/edge mapping field. The tag/edge mapping field corresponds to multiple tag/edge inputting sources. Different tag/edge can come from different data sources.

The `nebula` configuration field mainly describes the query service IP, username, password and graph space for the nebula services.

```bash
nebula: {  
  # Query engine IP list.  
  addresses: ["127.0.0.1:3699"]  
  
  # Username and password to connect to Nebula Graph service.
  
  user: user  
  pswd: password  
  
  # Graph space name for Nebula Graph.
  space: test  
  
  # The thrift connection timeout and retry times. The default values are 3000 and 3 respectively.
  connection {  
    timeout: 3000  
    retry: 3  
  }  
  
  # The nGQL execution retry times. The default value is 3.
  execution {  
    retry: 3  
  }  
}
```

### The Configuration Field for Nebula Graph

Tag configuration fields are used to describe the imported tag information. Each element in the array represents a piece of tag information. There are two methods to import tags: file-based import and Hive-based import.

- You need to specify the file format for the file-based import.
- You need to specify the query language for the Hive-based import.

```bash
# Processing tags  
tags: [  
  
  # Loading data from the HDFS files. The data type is Parquet. The tag name is ${TAG_NAME}.
  # The field_0, field_1 in the HDFS Parquet file are written to the ${TAG_NAME}.
  # The vertex column is ${KEY_FIELD}.
  {  
    name: ${TAG_NAME}  
    type: parquet  
    path: ${HDFS_PATH}  
    fields: {  
      field_0: nebula_field_0,  
      field_1: nebula_field_1  
    }  
    vertex: ${KEY_FIELD}  
    batch : 16  
  }  
  
  # Similar to the preceding section.
  # Loaded from Hive. The execution command $ {EXEC} is the dataset.
  {  
    name: ${TAG_NAME}  
    type: hive  
    exec: ${EXEC}  
    fields: {  
      hive_field_0: nebula_field_0,  
      hive_field_1: nebula_field_1  
    }  
    vertex: ${KEY_FIELD}
  }  
]
```

Descriptions:

- The name field represents the tag name.
- The mapping relationship between the HDFS/Hive and Nebula are configured in the fields.
- The batch parameter stores the batch data records. You can configure it based on your needs.

Edge type configuration fields are used to describe the imported edge type information. Each element in the array represents a piece of edge type information. There are two methods to import edges: file-based import and Hive-based import.

- You need to specify file format for file-based import.
- You need to specify the query language for the Hive-based import.

```bash
# Processing tags  
edges: [  
  # Loading data from the HDFS files. The data type is JSON.
  # The edge type name is ${EDGE_NAME}.
  # The field_0, field_1 in the HDFS JSON file are written to the ${EDGE_NAME}.

  # The source vertex is source_field, the target vertex is target_field, the edge rank is the ranking_field.
  {  
    name: ${EDGE_NAME}  
    type: json  
    path: ${HDFS_PATH}  
    fields: {  
      field_0: nebula_field_0,  
      field_1: nebula_field_1  
    }  
    source:  source_field  
    target:  target_field  
    ranking: ranking_field  
  }  
  
  # Loaded from Hive. The execution command $ {EXEC} is the dataset.
  # The edge rank is optional.
  {  
    name: ${EDGE_NAME}  
    type: hive  
    exec: ${EXEC}  
    fields: {  
      hive_field_0: nebula_field_0,  
      hive_field_1: nebula_field_1  
    }  
    source:  source_id_field  
    target:  target_id_field  
  }  
]
```

Descriptions:

- The name field represents the edge type name.
- The mapping relationship between the HDFS/Hive and Nebula are configured in the fields.
- The source field is the source vertex of the edge.
- The target field is the target vertex of the edge.
- The ranking field is the rank of the edge.
- The batch parameter stores the batch data records. You can configure it based on your needs.

### Data Importing Command

```bash
bin/spark-submit \  
 --class com.vesoft.nebula.tools.generator.v2.SparkClientGenerator \  
 --master ${MASTER-URL} \  
 ${SPARK_WRITER_JAR_PACKAGE} -c conf/test.conf -h -d
```

Descriptions:

- `-c` specifies the path to the configuration files.
- `-h` specifies whether Hive is supported.
- `-d` checks whether the configuration files are correct. It doesn't process the data.

## You might also like:

1. [Automating Your Project Processes with Github Actions](https://nebula-graph.io/posts/github-action-automating-project-process/)
1. [Practice Jepsen Test Framework in Nebula Graph](https://nebula-graph.io/posts/practice-jepsen-test-framework-in-nebula-graph/)
1. [Integrating Codecov Test Coverage With Nebula Graph](https://nebula-graph.io/posts/integrate-codecov-test-coverage-with-nebula-graph/)

> Hi, I’m Darion, a software engineer in Nebula Graph. Currently I am involved in storage engine development. I hope this article is helpful and let me know if you have any thoughts and suggestions. Thanks!