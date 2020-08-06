---
title: "Pick of the Week at Nebula Graph - FETCH Syntax Goes Further with New Features"
date: 2020-07-24
description: "In this weekly issue, we are covering the new features of the FETCH syntax in nGQL and how to speed your data import to Nebula Graph."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/88050180-373c5100-cb0b-11ea-9d75-d02303846f3b.png)

Normally the weekly issue covers Feature Explanation and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Feature Explanation

This week, the `FETCH` syntax has been armed with new features that let you retrieve the properties of multiple vertices for all their tags and facilitate your query for properties of multiple vertices further.

In Nebula Graph, the `FETCH` syntax is used to query the properties of a vertex or an edge. Together with the variable and the pipe features, its new features make the `FETCH` syntax more powerful in querying the properties of vertices.

Now, let's see what the `FETCH` syntax is able to do.

**Scenario #1: Retrieve all the properties from vertices for all their tags.**

For example, we have two vertices and their IDs are 21 and 20 and we want to query all the properties of both vertices for all their tags and order the result by vertex ID. We cannot do that before, because the `FETCH` syntax cannot be used to retrieve properties from multiple vertices for more than one tag. But now, we can use the `FETCH PROP ON * 21, 20;` statement to get it done, as shown in the following figure.

![FETCH PROP ON * 21, 20;](https://user-images.githubusercontent.com/57335825/88502028-257f0180-cf82-11ea-9dcc-04b3334092d8.png)

Before this update, when you used the FETCH syntax to retrieve the properties from two vertices for two tags, such as `FETCH PROP ON t1, t2 20, 21;` as shown in the following figure, an error was returned.

![FETCH PROP ON t1, t2 20, 21;](https://user-images.githubusercontent.com/57335825/88502075-46475700-cf82-11ea-9a14-2fac9b902bd1.png)

**Scenarios #2: Use pipe to pass vertex IDs.**

Now the `FETCH` syntax supports querying properties based on vertex IDs that were passed by the PIPE ( `|` ) feature. For example, run the `YIELD 20 AS id | FETCH PROP ON t2 $-.id;` statement to pass the id variable as the input of the FETCH statement, as shown in the following figure.

With this new feature, you can use the `GO` syntax and the `FETCH` syntax in one statement.

![YIELD 20 AS id | FETCH PROP ON t2 $-.id;](https://user-images.githubusercontent.com/57335825/88502164-7db60380-cf82-11ea-8c95-2f94144cee23.png)

**Scenarios #3: Use a variable to store vertex IDs.**

This update enables you to store the queried vertex IDs as a variable and then retrieve the properties from the vertices for multiple tags by using the variable. For example, run the statements as follows and you will get the properties for the vertex (vid 20), as shown in the following figure.

```
$var = YIELD 20 AS id;
FETCH PROP ON t2, t3 $var.id;
```

![Use a variable to store vertex IDs](https://user-images.githubusercontent.com/57335825/88502259-bfdf4500-cf82-11ea-99c8-9d20a5df1ef0.png)

## Community Q&A

Q: My computer configurations are 32 GB memory and 16 cores. When I used importer to import data, the speed was about 10,000 rows per second. Is that reasonable? Is there anything I can do to speed up the data import?

A: If this is your first time to import data into Nebula Graph, we recommend that you delete the indexes from the data and then use the REBUILD INDEX statement to rebuild the indexes after the data is imported. 

For the dataset to be imported, its indexes will reduce the import speed, because when a data record is imported, its index row will be the first one to be detected, and if most data in the dataset is unordered and the dataset size is large, more time will be consumed to detect such index rows. To avoid such problems, there are two options: 

1. ( Recommended ) Follow these steps: import data, create indexes, and then rebuild indexes.
2. Import data in batch, a certain magnitude each time, and then perform compact after the import.

As per your case, it is unreasonable that the import speed is only tens of thousand of rows per second. The normal speed is:

1. for import without indexes: 300 - 500 thousand rows per second
2. for import with indexes: about 100 thousand rows per second.

## You Might Also Like

1. [Pick of the Week 28 at Nebula Graph - Running Configuration Explained in Detail](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-10-2020/)
2. [Pick of the Week 29 at Nebula Graph - SQL vs nGQL & Job Manager in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-17-2020/)