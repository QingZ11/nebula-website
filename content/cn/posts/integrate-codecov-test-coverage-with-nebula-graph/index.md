---
title: "图数据库 Nebula Graph 的代码变更测试覆盖率实践"
date: 2020-04-21
description: "对于一个持续开发的大型工程，足够的测试是保证软件行为符合预期的有效手段，而不是仅依靠 code review 或开发者的技术素质。测试覆盖率可帮助开发人员发现没有被覆盖到的代码。"
tags: ["特性讲解", "开发日志","产品讲解"]
author: shylock
---

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov01.png)

对于一个持续开发的大型工程而言，足够的测试是保证软件行为符合预期的有效手段，而不是仅仅依靠 code review 或者开发者自己的技术素质。测试的编写理想情况下应该完全定义软件的行为，但是通常情况都是很难达到这样理想的程度。而测试覆盖率就是检验测试覆盖软件行为的情况，通过检查测试覆盖情况可以帮助开发人员发现没有被覆盖到的代码。

## 测试覆盖信息搜集

[Nebula Graph](https://github.com/vesoft-inc/nebula) 主要是由 C++ 语言开发的，支持大部分 Linux 环境以及 gcc/clang 编译器，所以通过工具链提供的支持，我们可以非常方便地统计Nebula Graph的测试覆盖率。

gcc/clang 都支持 gcov 式的测试覆盖率功能，使用起来也是非常简单的，主要有如下几个步骤：

1. 添加编译选项 `--coverage -O0 -g` 
1. 添加链接选项 `--coverage` 
1. 运行测试
1. 使用 lcov，整合报告，例如 `lcov --capture --directory . --output-file coverage.info` 
1. 去掉外部代码统计，例如 `lcov --remove coverage.info '*/opt/vesoft/*' -o clean.info` 

到这里测试覆盖信息已经搜集完毕，接下可以通过 genhtml 这样的工具生成 html，然后通过浏览器查看测试覆盖率，如下图所示：

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov02.png)

但是这样是非常不方便的，因为在持续的开发过程，如果每次都要手动进行这样一套操作，那必然带来极大的人力浪费，所以现在的常用做法是将测试覆盖率写入 CI 并且和第三方平台（比如 [Codecov](https://codecov.io/)，[Coveralls](https://coveralls.io/)）集成，这样开发人员完全不必关心测试覆盖信息的收集整理和展示问题，只需要发布代码后直接到第三方平台上查看覆盖情况即可，而且现在的第三方平台也支持直接在 PR 上评论覆盖情况使得查看覆盖率的变更情况更加方便。

## 集成 CI Github Action

现在主流的 CI 平台非常多，比如 [Travis](https://travis-ci.org/)，[azure-pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) 以及 [GitHub Action](https://github.com/features/actions) 等。Nebula Graph 选用的是 GitHub Action，对于 Action 我们在之前的[《使用 Github Action 进行前端自动化发布》](https://nebula-graph.io/cn/posts/github-action-automating-project-process/)这篇文章里已经做过介绍。

而 GitHub Action 相对于其他 CI 平台来说，有和 GitHub 集成更好，Action 生态强大简洁易用以及支持相当多的操作系统和 CPU 等优势。Nebula Graph 有关测试覆盖的 CI 脚本片段如下所示：

```yaml
- name: CMake with Coverage
  if: matrix.compiler == 'gcc-9.2' && matrix.os == 'centos7'
  run: |
    cmake -DENABLE_COVERAGE=ON -B build/
```

可以看到这里我们将前文介绍的 coverage 相关的编译选项通过一个 cmake option 进行管理，这样可以非常方便地启用和禁止 coverage 信息的收集。比如在开发人员在正常的开发编译测试过程中通常不会开启这项功能以避免编译测试运行的额外开销。

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

这里主要是测试报告的收集、合并以及上传到第三方平台，这个在前文中已经比较详细地叙述过，CI 的运行情况如下图所示：

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov03.png)

## 集成测试覆盖率平台 Codecov

Nebula Graph 选择的测试覆盖平台是 Codecov——一个测试结果分析工具，对于 GitHub Action 而言，主要是在 CI 中执行上述的测试覆盖信息搜集脚本以及将最终的测试覆盖文件上传到 Codecov平台。

这里用户给自己的 repo 注册 Codecov 后可以获取一个访问的 token，通过这个 token 和 Codecov 的 API 可以将测试覆盖文件上传到 Codecov 这个平台上，具体的 API 可以参考 [https://docs.codecov.io/reference#upload](https://docs.codecov.io/reference#upload) ，除了上传报告外还有列出 pr，commit 等 API 可以让用户开发自己的 bot 做一些自动化的工具，然后就可查看各种测试覆盖的信息，比如 Nebula Graph 的测试覆盖情况可以查看 [https://codecov.io/gh/vesoft-inc/nebula](https://codecov.io/gh/vesoft-inc/nebula) 。

比如可以通过这个饼状图查看不同目录代码的覆盖情况：

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov04.png)

也可以点开一个具体的文件，查看哪些行被覆盖那些行没有被覆盖：

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov05.png)

当然我们一般不会直接使用 Codecov 的 API，而是使用他提供的一个 cli 工具，比如上传报告使用 `bash <(curl -s https://codecov.io/bash) -Z -t <token> -f clean.info` ，这里的 token 就是 Codecov 提供的认证 token，一般来说作为环境变量 CODECOV_TOKEN 使用，而不是输入明文。

通过上述操作呢就可以在 Codecov 平台上查看你的工程的测试覆盖情况，并且可以看到每次 pr 增加减少了多少覆盖率，方便逐渐提高测试覆盖率。最后的话还可以在你的 README 上贴上 Codecov 提供的测试覆盖率 badge，就像 Nebula Graph 一样：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula)。

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/codecov06.png)

本文中如有错误或疏漏欢迎去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) issue 区向我们提 issue 或者前往官方论坛：https://discuss.nebula-graph.com.cn/ 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

## 推荐阅读

- [应用 AddressSanitizer 发现程序内存错误](https://nebula-graph.io/cn/posts/introduction-to-google-memory-detect-tool-addresssanitizer/)
- [Github Statistics 一个基于 React 的 GitHub 数据统计工具](https://nebula-graph.io/cn/posts/introduction-to-react-based-github-statistics/)

> 作者有话说：Hi，我是 shylock，是 Nebula Graph 的研发工程师，希望本文对你有所帮助，如果有错误或不足也请与我交流，不甚感激！

