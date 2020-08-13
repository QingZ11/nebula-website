---
title: "Integrating Codecov Test Coverage With Nebula Graph"
date: 2020-04-21
description: "In this post, we will introduce to you how Nebula Graph, a distributed graph database, performs test coverage with Codecov."
author: "Shylock"
tags: ["dev-log","features"]
---

![Integrating Codecov Test Coverage With Nebula Graph](https://user-images.githubusercontent.com/57335825/79863885-17fa2e80-840b-11ea-86a7-648626742972.png)

A solid testing strategy is a key point to the successful adoption of agile development. Test coverage is a metric used to measure how much of the source code of a program is executed by running a set of tests. It helps developers to identify the code in their application that was not tested.

Ideally, tests against software should define all behaviors of the software. However, this is rarely realized. That is how test coverage comes into play.

Test coverage is a visual measurement used to express which lines of code were executed by a test suite. This helps the software developers too locate where they should write new test cases to cover their source code completely.

In this post, we will introduce to you how Nebula Graph, a distributed graph database, performs test coverage.

## Collect Information for Test Coverage

Nebula Graph is mainly developed in C++. And it supports most Linux environments and gcc/clang compilers. Thus through the support provided by these tool chains, we can easily perform coverage analysis in Nebula Graph.

Both gcc and clang support gcov-style test coverage, which is also very simple to use. The main steps are as follows:

1. Add compilation option `--coverage -O0 -g`
1. Add link option `--coverage`
1. Run the test
1. Integrate the test coverage report with lcov. For example `lcov --capture --directory . --output-file coverage.info`
1. Filter out coverage data for  files that we aren't interested in. For example `lcov --remove coverage.info '*/opt/vesoft/*' -o clean.info`


By now the test coverage information has been successfully collected.

Next, you can generate a report through a tool such as genhtml and view the test coverage through your browser. See an example below:

![test coverage report sample](https://user-images.githubusercontent.com/57335825/79864195-a078cf00-840b-11ea-8f2a-9901d120451b.png)

But generating reports manually is very tedious. It is not automatic, and you have to perform such operations manually every time in the continuous development process. So the common practice is to set up code coverage for tests in CI and integrate with the third-party platforms (such as codecov, coveralls).

By doing so, developers do not have to care about the collection and report of test coverage, they only need to check the test coverage on the third-party platforms after committing their code.

What's more, some third-party tools support integrating the test report with pull requests, which is very convenient.

## Integrate with CI Github Action

There are many mainstream CI platforms, such as Travis, azure-pipelines and GitHub Action. Nebula Graph selects GitHub Action. In our previous post [_Automating Your Project Processes with Github Actions_](https://nebula-graph.io/posts/github-action-automating-project-process/), we have introduced GitHub Action in detail, you may take a look at it to gain some basic understanding about Action.

Compared with other CI platforms, GitHub Action integrates better with GitHub and supports many operating systems and CPUs.

Furthermore, Action is powerful, simple and easy to use. The following example config a test coverage job in the workflow file:

```yaml
- name: CMake with Coverage
  if: matrix.compiler == 'gcc-9.2' && matrix.os == 'centos7'
  run: |
    cmake -DENABLE_COVERAGE=ON -B build/
```

We can see that here we manage the coverage-related compilation options introduced above through a cmake option, which easily enables and disables the collection of coverage information.

For example, developers usually turn off coverage during development process, compilation, and testing to avoid the extra cost of compiling and running tests.

```yaml
- name: Testing Coverage Report
  working-directory: build
  if: success() && matrix.compiler == 'gcc-9.2' && matrix.os == 'centos7'
  run: |
    set -e
    /usr/local/bin/lcov --version
    /usr/local/bin/lcov --capture --gcov-tool $GCOV --directory . --output-file coverage.info
    /usr/local/bin/lcov --remove coverage.info '*/opt/vesoft/*' -o clean.info
    bash <(curl -s https://codecov.io/bash) -Z -f clean.info
```

The piece of code here collects, merges and uploads the test reports to the third-party platform. This has been described in detail in the previous section. The operation of CI is shown in the following figure:

![CI operation](https://user-images.githubusercontent.com/57335825/79864311-d9b13f00-840b-11ea-88ad-30b5f1fca4a9.png)

## Test Coverage Platform Codecov

Nebula Graph selected Codecov, a test result analysis tool, as its test coverage platform. For GitHub Action, it mainly executes the above  script in CI and uploads the produced data to Codecov.

First sign up/in on [Codecov](https://docs.codecov.io/), click 'Add new repository', choose the repository we want to apply the coverage for, and get an accessible token.

Use this token in your API requests, the coverage files can be uploaded to Codecov Details on API see the [Upload Doc](https://docs.codecov.io/reference#upload).

In addition to uploading reports, there are also APIs that list the pull requests or commits. You can customize your automated tools based on them.

Then you can view the test coverage information. For example, you can see Nebula Graph test coverage [here](https://codecov.io/gh/vesoft-inc/nebula).

Moreover, you can check the test coverage in different directories through the pie chart:

![test coverage result chart](https://user-images.githubusercontent.com/57335825/79864433-0c5b3780-840c-11ea-91e1-22c544983c68.png)

You can also open a specific file to see which lines are covered or not:

![test coverage results by code lines](https://user-images.githubusercontent.com/57335825/79864551-39a7e580-840c-11ea-9c9d-5fb3c37a2a50.png)

However, we use a CLI tool provided by Codecov instead of the APIs.

For example we use `bash <(curl -s https://codecov.io/bash) -Z -t <token>- f clean.info` to upload reports. The token here is the authentication token provided by Codecov. Set it as an environment variable `CODECOV_TOKEN` instead of inputting the plaintext token here.

Through the above operations, you can not only view the test coverage of your project on Codecov, but also see the coverage change if this pr is merged, which is convenient for gradually increasing test coverage.

Finally, you can also add the Codecov coverage badge in your README file just like [Nebula Graph](https://github.com/vesoft-inc/nebula).

![add test coverage result to your repo](https://user-images.githubusercontent.com/57335825/79864632-50e6d300-840c-11ea-8a79-c7ad53bdd03f.png)

## You might also like

1. [Nebula Graph Architecture — A Bird’s View](https://nebula-graph.io/posts/nebula-graph-architecture-overview/)
1. [Automating Your Project Processes with Github Actions](https://nebula-graph.io/posts/github-action-automating-project-process/)
1. [Compiling Trouble Shooting: Segmentation Fault and GCC Illegal Instruction](https://nebula-graph.io/posts/segmentation-fault-gcc-illegal-instruction-trouble-shooting/)

> _Hi, I'm Shylock. a software engineer at Nebula Graph. Hope my post is of help to you. Please let me know if you have any ideas about this. Thanks!_