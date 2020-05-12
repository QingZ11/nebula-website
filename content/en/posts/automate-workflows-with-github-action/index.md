---
title: "Automate Workflows with Github Action in Nebula Graph"
date: 2020-05-07
description: "Nebula Graph has adopted GitHub Actions to automate testing and releasing workflows like Nightly building and branch release. This post shared some best practices with you in this regard."
author: "Yee"
tags: ["dev-log"]
---


![Automate Workflows with Github Action in Nebula Graph](https://user-images.githubusercontent.com/57335825/81528711-34a2cb80-9312-11ea-83ff-a64c6ab16c7c.png)

## Why GitHub Action

Nebula Graph initially implemented its automated testing  with [Jenkins](https://jenkins.io/) (built on Azure) and GitHub Webhook. When a pull request is opened, adding a `ready-for-testing` label together with a comment "Jenkins go" will automatically trigger the corresponding unit testing process:

![unit testing is triggered](https://user-images.githubusercontent.com/57335825/81528783-556b2100-9312-11ea-941b-8dce580b0083.png)

This solution is not cost-effective because the Azure cloud server is rented while Nebula Graph compilation requires high performance  servers.

So we've been considering an alternative to Azure cloud server since last year. The new solution must support multi-environment tests, too.

We've done some research and found the following candidates:

1. TravisCI
1. CircleCI
1. Azure Pipeline
1. Jenkins on k8s (Self-hosted)

Overall, these products are friendly. There are some restrictions on open source projects, though.

Given the previous experience of using GitLab CI, we realized that the first choice is a product with deep integration with GitHub, meaning that you can share the entire open source ecosystem of GitHub and call the APIs natively.

Coincidently, GitHub Action 2.0 was released in 2019. So Nebula Graph became the explorer.

For us, GitHub Action is awesome in the following ways:

1. **It's free**. To open source projects, not only the full feature set is available, but it also offers  [high performance machines](https://help.github.com/en/actions/reference/virtual-environments-for-github-hosted-runners#supported-runners-and-hardware-resources), for free.
1. **Perfect open source ecosystem**. All open source actions can be directly used for the entire CI (Continuous Integration) process. It also supports custom actions. GitHub Action supports customization in Docker, which means that you can create a custom action with just bash commands.
1. **Support multiple systems**. One-click deployment on Windows, MacOS and Linux makes cross-platform operations easier.
1. **Interaction with GitHub API**. Directly access [GitHub API V3](https://developer.github.com/v3/) with `GITHUB_TOKEN` so that you can upload files, check PR status with the curl command.
1. **GitHub-hosted runners**. Simply add the workflow description file under the `.github/workflows/` directory, and each commit will automatically trigger a new action run.
1. **Workflow description file in YAML**,  which is more concise and readable than the Action 1.0 workflow.

Before diving into practice details, let's clarify Nebula Graph's primary goal of using GitHub Action, i.e. automated testing.

Testing cannot be overemphasized for a database solution. In Nebula Graph, testing is mainly divided into unit testing and integration testing. GitHub Action is mainly used for automating unit testing. Meanwhile it is used as a preparation for integration testing, for example Docker image building and installer packaging. Finally it  solves the release requirements for the PM lady. In this way, we have built the first version of the CI/CD process.

## PR Test

As an open source project hosted on GitHub,  Nebula Graph must solve the primary testing problem of quickly verifying the changes in a PR committed by a contributor. The following aspects should be taken into consideration:

1. Does the code meet our coding style?
1. Can the code be compiled on different systems?
1. Does it pass all unit tests?
1. Has the code coverage dropped?

Only if all the above requirements are met and there are at least two approvals, the changes can be merged into the master.

With the help of open source tools such as cpplint or clang-format, requirement #1 can be met easily. If Step1 fails, the following steps will be skipped automatically and the whole process will not be continued.

For requirement #2, we hope to compile Nebula Graph source code on the currently supported systems. Thus, building directly on the physical machines is no longer a choice. After all, the price of one single machine is rather high, not to mention one machine is not enough. In order to ensure the consistency of the compilation environments and reduce the performance loss  as much as possible, we finnally chose Docker. The process went smoothly with GitHub Action's [job matrix](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix) and its support for [Docker](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idcontainer).

![pr test processing flow](https://user-images.githubusercontent.com/57335825/81529003-c7dc0100-9312-11ea-9441-2fd611b65819.png)

Like shown above, Nebula Graph's compilation image is maintained in [our Docker image project](vesoft-inc/nebula-dev-docker). Changes or upgrade of the compiler or third party dependencies will automatically trigger the Build task of Docker hub (see the figure below). When a new Pull Request is committed, GitHub Action will be triggered to start pulling the latest compilation image and execute the compilation.

![image](https://user-images.githubusercontent.com/57335825/81529116-02459e00-9313-11ea-808d-2f6653173836.png)

For a complete description of the PR workflow , see [pull_request.yaml](https://github.com/vesoft-inc/nebula/blob/master/.github/workflows/pull_request.yaml). Meanwhile, considering that not every PR needs to be tested immediately, and the self-hosted machine resources are limited, we've set the following constraints to the CI trigger:

1. Only PRs that pass the lint verification will deliver the subsequent job to the self-hosted runner. The lint task  is relatively lightweighted, and can be executed in the machine hosted by GitHub Action, avoiding taking up our own resources.
1. Only PRs labeled with `ready-for-testing` will trigger action execution. While labelling needs authority,  the runner can be triggered by certified pull requests only. See the code below for the PR label restriction:

```yaml
jobs:
  lint:
    name: cpplint
    if: contains(join(toJson(github.event.pull_request.labels.*.name)), 'ready-for-testing')
```

Here's how it looks when a PR passes all the tests:

![pr passes all checks](https://user-images.githubusercontent.com/57335825/81529179-243f2080-9313-11ea-9b9b-11b669f4336a.png)

For details on how Code Coverage is conducted in Nebula Graph, please see [Integrating Codecov Test Coverage With Nebula Graph](https://nebula-graph.io/en/posts/integrate-codecov-test-coverage-with-nebula-graph/).

## Nightly Building

Nebula Graph's integrated testing framework requires that  all the test cases are run on the code in the codebase every night. In the mean time, we want some new features to be quickly packaged and delivered to users for a test drive. This requires that the CI system provides the Docker image and rpm/deb package of the codebase each day.

In addition to the pull_request event type, GitHub Action can also be triggered by the [schedule](https://help.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events-schedule) type. Similar to crontab, schedule allows users to specify the trigger time of any repetitive tasks.  For example, execute tasks at 2:00AM every day:

```yaml
on:
  schedule:
    - cron: '0 18 * * *'
```

GitHub uses UTC time, so 2:00AM CST is 6:00PM UTC the previous day.

## Docker

The daily built Docker image needs to be pushed to the Docker Hub and tagged with the nightly label. Here we set the image pulling method as Always in the  k8s cluster for integrate testing. So that the daily request to upgrade Nebula Graph would trigger rolling upgrade to the latest Docker image of the current day, i.e. the nightly version, for integrating test. We are trying our best not to leave problems raised today to tomorrow, there is no additional date tag for the nightly image. See the action details below:

```yaml
      - name: Build image
        env:
          IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/nebula-${{ matrix.service }}:nightly
        run: |
          docker build -t ${IMAGE_NAME} -f docker/Dockerfile.${{ matrix.service }} .
          docker push ${IMAGE_NAME}
        shell: bash
```

## Package

GitHub Action provides [artifacts](https://help.github.com/en/actions/configuring-and-managing-workflows/persisting-workflow-data-using-artifacts) to allows users to persist data in a workflow. GitHub stores these artifacts for 90 days, which is more than enough for the storage of the nightly installation package. Using the official `actions / upload-artifact @ v1` action, you can easily upload files in the specified directory to artifacts. Following is how the Nebula Graph nightly package looks like:

![package](https://user-images.githubusercontent.com/57335825/81529261-5cdefa00-9313-11ea-9cee-b82b64f751ad.png)

## Branch Releasing

For better maitainence and bugfix, Nebula Graph adopts branch release, i.e. we freeze the code before each release and create a new release branch. Only bugfix is allowed on the release branch and feature development is not allowed. The bugfix will still be committed to the development branch, and finally be cherry picked to the release branch.

At each release, in addition to the source code, we hope to add the installation package to assets for users to download. Doing it manually is both error-prone and time-consuming. GitHub Action is perfect for this. What's more, the packaging and uploading use the internal GitHub network, which is faster.

After the installation package is compiled, you can directly call the GitHub API through the curl command to upload it to the assets. The [script](https://github.com/vesoft-inc/nebula/blob/master/ci/scripts/upload-github-release-asset.sh) looks as follows:

```bash
curl --silent \
     --request POST \
     --url "$upload_url?name=$filename" \
     --header "authorization: Bearer $github_token" \
     --header "content-type: $content_type" \
     --data-binary @"$filepath"
```

At the same time, for the sake of security, every time the installation package is released, we want to calculate its checksum value  and upload the value to the assets for user's convenience for  integrity check after downloading. The steps are as follows:

```yaml
jobs:
  package:
    name: package and upload release assets
    runs-on: ubuntu-latest
    strategy:
      matrix:
        os:
          - ubuntu1604
          - ubuntu1804
          - centos6
          - centos7
    container:
      image: vesoft/nebula-dev:${{ matrix.os }}
    steps:
      - uses: actions/checkout@v1
      - name: package
        run: ./package/package.sh
      - name: vars
        id: vars
        env:
          CPACK_OUTPUT_DIR: build/cpack_output
          SHA_EXT: sha256sum.txt
        run: |
          tag=$(echo ${{ github.ref }} | rev | cut -d/ -f1 | rev)
          cd $CPACK_OUTPUT_DIR
          filename=$(find . -type f \( -iname \*.deb -o -iname \*.rpm \) -exec basename {} \;)
          sha256sum $filename > $filename.$SHA_EXT
          echo "::set-output name=tag::$tag"
          echo "::set-output name=filepath::$CPACK_OUTPUT_DIR/$filename"
          echo "::set-output name=shafilepath::$CPACK_OUTPUT_DIR/$filename.$SHA_EXT"
        shell: bash
      - name: upload release asset
        run: |
          ./ci/scripts/upload-github-release-asset.sh github_token=${{ secrets.GITHUB_TOKEN }} repo=${{ github.repository }} tag=${{ steps.vars.outputs.tag }} filepath=${{ steps.vars.outputs.filepath }}
          ./ci/scripts/upload-github-release-asset.sh github_token=${{ secrets.GITHUB_TOKEN }} repo=${{ github.repository }} tag=${{ steps.vars.outputs.tag }} filepath=${{ steps.vars.outputs.shafilepath }}
```

See [release.yaml](https://github.com/vesoft-inc/nebula/blob/master/.github/workflows/release.yaml) for the complete workflow file.

## Commands

GitHub Action provides some [Shell commands](https://help.github.com/en/actions/reference/workflow-commands-for-github-actions) so that you can control and debug each workflow step in greater granularity right in the your Shell console. Some commonly used commands are explained below.

### set-output: Setting an output parameter

```yaml
::set-output name={name}::{value}
```

Sometimes you need to pass some results among job steps. You can set the `output_value` to the `output_name` variable via command `echo "::set-output name=output_name::output_value"`.

In the following steps, you can refer to the above output value via `${{ steps.step_id.outputs.output_name }}`.

This method is used In the job to upload assets mentioned in the previous section. One step can set multiple outputs by executing the above command multiple times.

### set-env: Setting an environment variable

```yaml
::set-env name={name}::{value}
```

Similar to `set-output`, you can create  an environment variable for subsequent steps in the current job. Syntax: `echo "::set-env name={name}::{value}"`.

### add-path: Adding a system path

```yaml
::add-path::{path}
```

This command is to prepend a directory to the system PATH variable for all subsequent steps in the current job. Syntax: `echo "::add-path::{path}"`.<br />

## Self-Hosted Runner

In addition to GitHub-hosted runners, Action also allows you to host runner on your own machine. After installing the Action Runner on the machine, follow the [tutorial](https://help.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners) to add it to your repository, and configure `runs-on: self-hosted` in the workflow file. You are all set.

You can assign different [labels](https://help.github.com/en/actions/hosting-your-own-runners/using-labels-with-self-hosted-runners) to your self-hosted machines. In this way, you can  distribute tasks to a machine with a specific label. For example, if your machines run on different operation systems, then a job can be assigned to a [specified machine](https://help.github.com/en/actions/hosting-your-own-runners/using-self-hosted-runners-in-a-workflow) based on the `runs-on` label.

![runs-on label](https://user-images.githubusercontent.com/57335825/81529444-b6472900-9313-11ea-902b-8ee5f204daed.png)

### Security Enhancements

GitHub does not recommend self-hosted runners for open source projects because anyone can attack the runner machine by committing a PR with dangerous code.

However, Nebula Graph compilation requires a larger storage than GitHub's two-core environment , which leaves us with no choice other than self-host runners. To ensure security, we have done the following:

#### Deployment on VM

All runners registered to GitHub Action are deployed in virtual machines, which can isolate the host machine and make it easier to allocate resources among virtual machines. A high performance host machine can allocate multiple virtual machines to run all the received tasks in parallel.

If there is a problem with the virtual machines, you can easily restore the environment.

#### Network Isolation

We have isolated all the virtual machines that hold the runner from the office network to avoid direct access to our internal resources. Even if a PR contains malicious code, it can't access our internal network for further attacks.

#### Choose the Right Action

Try to choose actions from well-known companies or official releases. If you are using the works of individual developers, you'd better check their implementation code to avoid being victims of [privacy keys leakage ](https://julienrenaux.fr/2019/12/20/github-actions-security-risk/).

Here is the [list](https://github.com/actions) of official actions provided by GitHub.

#### Private Token Verification

GitHub Action will automatically check whether there are private tokens in a PR. No private tokens (refereed to with `${{ secrets.MY_TOKENS }}`), except `GITHUB_TOKEN` , can be used in a PR event triggered job to prevent users from stealing tokens by printing it out privately through PR.

### Environment Building and Clearing

For self-hosted runners, it is convenient to share files between different jobs. But don’t forget to clean up the intermediate files each time after the entire action is executed, otherwise they may affect the following jobs and occupy disk space.

```yaml
      - name: Cleanup
        if: always()
        run: rm -rf build
```

Set the running condition of step to `always ()` to ensure that the cleanup is executed every time, even if something goes wrong during execution.

### Parallel Building Based on Docker Matrix

We chose to build Nebula Graph with container because it needs to compile and verify on various operation systems and container makes it easy to separate environments. GitHub Action natively supports Docker based tasks.

GitHub Action supports the matrix strategy to run tasks, which is similar to TravisCI's [build matrix](https://docs.travis-ci.com/user/build-matrix/). By combining  systems and compilers, we can easily use gcc and clang in each system to compile the source code of Nebula Graph. Matrix example is  shown as below:

```yaml
jobs:
  build:
    name: build
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        os:
          - centos6
          - centos7
          - ubuntu1604
          - ubuntu1804
        compiler:
          - gcc-9.2
          - clang-9
        exclude:
          - os: centos7
            compiler: clang-9
```

The above strategy generates 8 parallel tasks (4 OS x 2 compiler). Each task is a combination of an OS and a compiler. This  greatly reduces the workload of manual definition for different dimensions.

Exclude a certain combination in the matrix by adding it to the `exclude` option. If you want to access the value in the matrix in the task, you can get it by obtaining the value of the context variable like `$ {{matrix.os}}`. These methods make it very convenient to customize your tasks.

#### Runtime Container

We can specify a container environment for each task at runtime, so that all steps of the task will be executed in the container's internal environment. Compared to applying the docker command in each step, this is simpler and clearer.

```yaml
    container:
      image: vesoft/nebula-dev:${{ matrix.os }}
      env:
        CCACHE_DIR: /tmp/ccache/${{ matrix.os }}-${{ matrix.compiler }}
```

For container configuration, like configuring service in Docker compose, you can specify image/env/ports/volumes/options and other [parameters](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idcontainer). In the self-hosted runner, you can easily mount the directory on the host machine to the container for file sharing.

It is  the container characteristics of GitHub Action that make it convenient to accelerate  subsequent compilation via cache in Docker.

## Compilation Acceleration

The source code of Nebula Graph is written in C++, and the construction process is rather time consuming. Restarting CI   every time will cause waste of computing resources. So as long as the source code isn't updated, the compiled file will be cached for accelaration.  Currently we use the latest version of ccache for [cache](https://ccache.dev/) purpose. It also help identify whether a source file has been updated or not by looking precisely into the compiling process of the file.

Although GitHub Action itself provides the [cache](https://help.github.com/en/actions/configuring-and-managing-workflows/caching-dependencies-to-speed-up-workflows) function, we go for the local cache strategy because Nebula Graph currently uses static linking for unit test use cases and its size after compilation  exceeds the quota assaigned by GitHub Action cache.

### ccache

[ccache](https://ccache.dev/) is a compiler cache tool. It speeds up compilation by caching previous compilations and supporting compilers like gcc/clang. Nebula Graph adopts the C++ 14 standard which has compatibility issues with lower version ccache, so ccache in all `vesoft/nebula-dev` [images](https://github.com/vesoft-inc/nebula-dev-docker) is\ manually compiled and installed.

Nebula Graph automatically detects whether ccache is installed in the cmake configuration and decides whether to enable it. So you only configure ccache in the container environment. For example, configure the maximum cache capacity in [ccache.conf](https://github.com/vesoft-inc/nebula/blob/master/ci/ccache.conf) as 1 Gigabyte. When cache surpasses the threshold, the older cache is automatically replaced.

```yaml
max_size = 1.0G
```

We suggest you put the `ccache.conf` configuration file under the cache directory so that ccache can read the file conveniently.

### tmpfs

tmpfs is a temporary file system located in the memory or swap partition, which can effectively alleviate the delay caused by disk IO. Because the  memory of self-hosted machine is sufficient, the ccache directory mount type is changed to tmpfs to reduce ccache read and write time . For using tmpfs mounting type in Docker, please refer to the [Use tmpfs mounts](https://docs.docker.com/storage/tmpfs/) documentation. The corresponding configuration parameters are as follows:

```yaml
    env:
      CCACHE_DIR: /tmp/ccache/${{ matrix.os }}-${{ matrix.compiler }}
    options: --mount type=tmpfs,destination=/tmp/ccache,tmpfs-size=1073741824 -v /tmp/ccache/${{ matrix.os }}-${{ matrix.compiler }}:/tmp/ccache/${{ matrix.os }}-${{ matrix.compiler }}
```

Place all cache files generated by ccache in a directory that mounting as a tmpfs type.

### Parallel Compilation

The make process itself supports parallel compilation of multiple source files. Configuring`-j $(nproc)` during compilation will enable the same number of tasks as the number of cores. Configure the steps in action as follows:

```yaml
      - name: Make
        run: cmake --build build/ -j $(nproc)
```

## Things to Improve

We've talked a lot about the advantages and strongness of GitHub Action, but are there  drawbacks? After spending some time using it, below are some thoughts to share with you:

1. **Only support systems of newer versions**. Many actions are developed based on newer Node.js versions and cannot be used directly in old  Docker containers like CentOS 6.It will throw an error 'the library file that Nodejs depends on cannot be found'. Thus action cannot be started properly. Since Nebula Graph also supports CentOS 6, the tasks in this system have to be handled differently.
1. **It is not easy to verify locally**. Although there is an open source project [act](https://github.com/nektos/act) in the community, there are still many restrictions according to our experiences. Sometimes you have to repeatedly commit  in your own repository to ensure the action modification is correct.
1. **Lacking  guidelines currently**. When customizing numerous tasks, it feels like coding in the YAML configuration. 
There are currently three main approaches:
  a. Split the configuration files based on tasks.
  b. Customize action  via GitHub SDK.
  c. Write a long shell script to complete the tasks and call the script in your tasks.

So far it's still under debate in the community which approach is better, combination of small tasks or big tasks. According to my personal experience, the approach to combine small tasks helps easily locate task failure and determine the execution time of each step.

![group small tasks](https://user-images.githubusercontent.com/57335825/81529770-6c127780-9314-11ea-961d-7f845d043b0f.png)

4. **Part of the action history  cannot be cleaned up**. If the workflow name is changed, the old check runs record will still remain in the action page, affecting the user experience.
1. **Lacking manual job/task trigger similar to GitLab CI**. No manual intervention is allowed during action execution.
1. **The development of action is under constant iteration**. Sometimes it is necessary to maintain an upgrade, for example, [checkout@v2](https://github.com/actions/checkout/issues/23).

But overall, GitHub Action is an awesome CI/CD system. After all, as a product that stands on the shoulders of predecessors such as GitLab  CI/Travis CI, there are a lot to learn from.

## What's Next

### Customized Action

A while ago, Docker has released its first [Action](https://www.docker.com/blog/first-docker-github-action-is-here/) to simplify the Docker related tasks. In the future, we will also customize our own actions dealing with the complex CI/CD requirements and enable them in all Nebula repositories.

For some general ones like appending assets to the release function, we will put them in an independent repository and publish them in the action marketplace. The exclusive onces will be placed in the `.github/actions` directory of each repository.

This simplifies the YAML configuration in workflows, you only need to use a customized action which has better flexibility and expandability.

### Integration with IM (DingTalk/Slack)

You can develop complex action applications through the GitHub SDK and combine it with the customization bots of IM tools like DingTalk and Slack to realize a lot of automated and interesting applications.

For example, when a PR is approved by more than two reviewers and all check runs are passed, you can send a message to a DingTalk group and tag someone to merge them. This saves engineers from checking every PR state in the PR list.

Any ideas how to play around GitHun Action? Leave a comment below and let's talk!

## You might also like:

1. [Automating Your Project Processes with Github Actions](https://nebula-graph.io/en/posts/github-action-automating-project-process/)
1. [Practice Jepsen Test Framework in Nebula Graph](https://nebula-graph.io/en/posts/practice-jepsen-test-framework-in-nebula-graph/)
1. [Integrating Codecov Test Coverage With Nebula Graph](https://nebula-graph.io/en/posts/integrate-codecov-test-coverage-with-nebula-graph/)

> Hi, I'm Yee, engineer at Nebula Graph. I'm interested in database query engine and would like to share my experiences in this regard. Hope my post is of help to you. Please let me know if you have any ideas about this. Thanks!
