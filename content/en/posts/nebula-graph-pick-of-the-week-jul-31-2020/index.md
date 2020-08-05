---
title: "Pick of the Week 31 at Nebula Graph - GO with int Type"
date: 2020-07-31
description: "In this weekly issue, we are exicited to announce that the GO statement in nGQL now supports the int data type."
tags: ["community"]
author: "Steam"
---

![Pick of the Week](https://user-images.githubusercontent.com/57335825/88050180-373c5100-cb0b-11ea-9d75-d02303846f3b.png)

Normally the weekly issue covers Feature Explanation and Community Q&As. If something major happens, it will also be covered in the additional Events of the Week section.

## Feature Explanation

Now you can use the `GO` syntax in Nebula Graph to retrieve data by passing a value of the int type. This update empowers you to traverse a graph in more scenarios and improves query performance by simplifying the query operation.

### Applicable Scenario

Vertex A has a property of the `timestamp` type for one TAG; and Vertex B uses Vertex A's `timestamp` property value as its VID for another TAG. With the new feature of the `GO` syntax, you can use the `FETCH` or the `LOOKUP` syntax to filter vertices and then pass the `timestamp` property values as the input of the `GO` statement to query the records at the specified time point.

### Example

Now let's use an example to show the benefits of the new feature.

We will create an example graph and explore it in Nebula Studio. The figure below shows how the exploration result looks like.

![data exploring in nebula graph studio](https://user-images.githubusercontent.com/57335825/89270249-f0148c80-d5ef-11ea-8295-ae3cf3afbebf.png)

Follow these steps to create the example graph and to perform the query:

1. Create a tag, t4, representing a user type. Its action_time property indicates the specified time point when a user performs an action.

```Shell
CREATE TAG t4(user_name string, action_time timestamp);
```

2. Create a tag, t5, representing an action type that users perform.

```Shell
CREATE TAG t5(user_action string);
```

3. Create an edge representing the relationship between a user and an action and the relationship is play_games.

```Shell
CREATE EDGE play_games();
```

![create an edge in nebula graph studio](https://user-images.githubusercontent.com/57335825/89270524-500b3300-d5f0-11ea-88f7-4ce19193cebe.png)

4. Insert a vertex to represent a user. Its `VID` is set to `730`.

```Shell
INSERT VERTEX t4(user_name, action_time) VALUES 730:("xiaowang", 1596103557);
```

5. Insert a vertex to represent an action, `play smart phone games`, and its `VID` is set to the `action_time` value of Vertex 730, representing that the user was playing smart phone games at the specified time point.

```Shell
INSERT VERTEX t5(user_action) VALUES 1596103557:("play smart phone games");
```

6. Insert an edge to represent the relationship of play_games between the user and the action.

```Shell
INSERT EDGE play_games() VALUES 730->1596103557:();
```

![insert an edge in nebula graph studio](https://user-images.githubusercontent.com/57335825/89270832-c1e37c80-d5f0-11ea-90af-a83db15a6b7d.png)

With this new feature, only one statement as follows is needed for query. This statement will do these tasks: 

1. querying all properties of Vertex 730 for all TAGs
2. renaming the `t4.action_time` property as a variable, named `timeid`
3. passing the `timeid` variable to the `GO` statement to do the reversal query on the `play-games` edge
4. showing the `t5.user_action` property of the edge's source vertex with a new name, `player_action`

```Shell
FETCH PROP ON * 730 YIELD t4.action_time AS timeid | GO FROM $-.timeid OVER play_games REVERSELY YIELD $^.t5.user_action AS players_action;
```

![fecth prop on in nebula graph studio](https://user-images.githubusercontent.com/57335825/89271092-18e95180-d5f1-11ea-95fd-925f9d730c64.png)

## Community Q&A

Q: Is VID unique to one graph space or to one TAG? For example, if I have an edge from VID1 to VID2, does it mean that all the TAGs for VID1 has this edge to all the TAGs for VID2?

A: In Nebula Graph, VID represents the ID of a vertex. It is the unique identifier of a vertex. A TAG represents a type of a vertex. It is used to group vertices and has all the properties that the vertices should have. An edge represents the relationship between two vertices and it can have all the properties to describe the relationship. 

For example, if a vertex represents a person, its VID is the person's unique identifier. The person may be both a follower of someone on a social media and a student, so two tags can be assigned to the vertex: student and follower. And then, we need properties to define or describe the tags. For example:

- **TAG student(department, class, society)**: As a student , a person may be in a department, class, and society.  
- **TAG follower(followee, follow_start_date, media)**: As a follower of someone, a person may start to follow someone on a social media at a date.

From the information above, we know that multiple TAGs can be assigned to a vertex (VID). For example,

- Tom(Vid1)_student(TagId1): ComputerScience_Class1_Basketball
- Tom(Vid1)_follower(TagId2): TomHanks_01-2020_Twitter

Now, about the relationship or edge between two vertices. For example, we have two vertices: 

- Tom(Vid1)_student(TagId1): ComputerScience_Class1_Basketball
- Jack(Vid2)_student(TagId1): Finance_Class2_Judo
- Tom(Vid1)_follower(TagId2): TomHanks_01-2020_Twitter
- Jack(Vid2)_follower(TagId2): TomHanks_01-2021_Twitter

Both persons may come from the same city or follow the same person, so they may have these relationships (or edges):

- **EDGE comeFrom (hometown)**: Persons come from the same city. 
- **EDGE recommend (followee)**: One person recommend a star (followee) to another person to follow.

And these persons have such relationships:

- Tom(Vid1) -> hometown (EDGE comeFrom) -> Jack(Vid2)
- Jack(Vid2) -> TomHanks (EDGE recommend) -> Tom(Vid1)

From the example above, we can see that direction from Vid1 to Vid2 is determined by the edge, not the tags. So, about your second question: When a source vertex is specified, its linking destination vertex is queried on the edge, and after the destination vertex is found, all its related tags are queried by its VID.

## You Might Also Like

1. [Pick of the Week 30 at Nebula Graph - FETCH Syntax Goes Further with New Features](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-24-2020/)
2. [Pick of the Week 29 at Nebula Graph - SQL vs nGQL & Job Manager in Nebula Graph](https://nebula-graph.io/posts/nebula-graph-pick-of-the-week-jul-17-2020/)