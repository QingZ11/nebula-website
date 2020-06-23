---
title: "Hugo 建站经验之谈"
date: 2020-06-23
description: "基于 Golang 语言的 Hugo 来作为 Nebula Graph 建站的技术方案，本文主要分享下前端工程师使用 Hugo 建站的一些个人思考和经验分享。"
tags: ["产品讲解","开发日志"]
author: Nebula
---

![static-site-generator-hugo](https://www-cdn.nebula-graph.com.cn/nebula-blog/static-site-generator-hugo.png)

## 前言

建站工具，早已不是一个新颖的话题，抛开可视化建站单论开发层面，各类语言都有推出广受欢迎的建站框架，比如 Python 开发的 [Pelican](https://github.com/getpelican/pelican)，JavaScript 开发的 [Hexo](https://github.com/hexojs/hexo)，以及市场份额占比最大的 PHP 开发的 [WordPress](https://github.com/WordPress/WordPress) 等等，这些笔者在折腾个人博客时多少都有用过。但当需要**快速搭建**起我们的 [Nebula Graph 官网](https://nebula-graph.com.cn/) 时，小小纠结对比之后，笔者选择了 Golang 语言的 [Hugo](https://gohugo.io/) 来作为我们的技术方案，下面就来分享下个人使用 Hugo 建站的一些个人思考和经验分享。

P.S: 客观来说，各类语言的博客类型框架并无太大差别，更多还是类比语言的个人喜好与审美不同，在此不做叙述。

## 实践介绍

### 我们的需求

- 博客系统，需要支持运营发布我们日常的[技术文章资讯](https://nebula-graph.com.cn/posts/)

Hugo 有灵活强大的内容管理系统，能随着需求，不断增加不同类型的资讯支持，诸如博客、Release Note、技术文档等，详细后面会介绍。

- 品宣介绍，常见就是站点首页、新闻介绍等

同样依赖内容管理系统，能很快支持到不同页面的实现，包括相同组件如导航、页脚等的共享，后面也会介绍。

- SEO 需要

Hugo 本就是类似服务端模板语言的 Web 框架，天然的服务端渲染。

- 国际化支持，Nebula 注重国内外开发者的访问体验

Hugo 能渐进地拓展支持多国语言，只要你有对应的语料配置，就能迅速支撑需求并方便管理。

- 灵活易于管理，能让非技术的运营同学也能参与站点的内容管理

强大的模板系统，让技术人员专心开发完对应模板后，能将内容管理交给运营同学持续运营。

### 特点介绍

#### 灵活强大的内容管理系统

```markdown
...
├── config // 模板需要的内容语料
|   ├── default 
|   |   ├── config.toml
|   |   └── config.cn.toml
|   |   └── config.en.toml
|   |   └── footer.cn.toml
|   |   └── footer.en.toml
|   |   └── ...
├── content // 内容部分，日常多由运营同学管理维护
|   ├── en // 国际化支持
|   |   ├── posts // 内置默认的博客（post)类型资讯
|   |   |   ├── post-01.md
|   |   |   ├── post-02.md
|   |   └── release // 新增的 release 类型资讯
|   |   |   ├── release-01.md
|   |   |   └── release-02.md
|   ├── cn
|   |   ├── posts
|   |   |   ├── post-01.md
|   |   |   ├── post-02.md
|   |   └── release
|   |   |   ├── release-01.md
|   |   |   └── release-02.md
...
├── themes // 站点的主题
|   ├── nebula-theme // 主题名
|   |   ├── layout // 模板
|   |   |   ├── _default // 默认的模板
|   |   |   |   ├── baseof.html // 渲染的种子页面定义
|   |   |   |   ├── list.html  // 默认博客 post 类型资讯 - 列表页的使用模板页面
|   |   |   |   ├── single.html // 默认博客 post 类型资讯 - 详情页使用模板页面
|   |   |   ├── partials // 复用的模板片段
|   |   |   |   ├── head.html
|   |   |   |   ├── footer.html
|   |   |   |   ├── menus.html
|   |   |   |   ├── ...
|   |   |   ├── index.html // 首页（'/') 默认会使用的模板
|   |   |   ├── section
|   |   |   |   ├── release.html // 新增资讯类型 release 渲染时使用的模板页面 - 发布历史页面
|   |   |   |   ├── news.html // 新增资讯类型 news 渲染时使用的模板页面 - 媒体新闻页面
...
```
以上，便是 Hugo 用以支撑起灵活强大的模板系统所采用的项目结构，笔者感觉比较能直观反映出对于不同站点需求的支持，它甚至还可以是不断嵌以此结构不断嵌套，外层的配置覆盖内层的，更多信息可以参考官方的[模板系统介绍](https://gohugo.io/templates/)。

#### 内置丰富工具集

除了强大的内容管理系统外，Hugo 还有很多很好用的内置模板及工具函数，满足不同需求情况下提升搭建效率，抽象实现细节，更专注于站点的搭建，诸如：

- 资源类型列表的分页模板 - [Pagination](https://gohugo.io/templates/pagination/)

这个针对只有列表页的需求，比如博客，发版历史，新闻类等，好用的分页模板，轻松的就帮你完成了。

- 资源 RSS 模板 - [RSS](https://gohugo.io/templates/rss/)

对于资讯型的站点必不可少，官方已内置了默认的 rss 模板，只需要添加一行代码，即可搞定 rss，当然还支持个性化定制。

- 各类内容及字符串处理工具函数 - [Functions](https://gohugo.io/functions/)

这个不用多说，对应程序中的各类常见的字符串替换，Hugo 都有着良好的支持，同时它还支持类似 Pipe 管道的方式，将处理内容以 | 分隔层层传递下去，就像我们在 Linux 输入的命令一样。

- 好用的 CLI 工具

内置了 http server 方便本地开发，同时又能将整个站点打包成纯静态的资源，方便了对于部署的操作和维护成本，可以一键初始化并启动项目，开箱即用的感觉，上手容易。

- 好用的内容管理工具
   - 迅速提取博客内容的目录导航 - [TableOfContents](https://gohugo.io/content-management/toc/#readout)
  使用此工具函数，会根据你当前的文章内容，提取目录概要，节省了生成锚点内容的时间。
   - 便捷获取文章的概览内容 - [Summary](https://gohugo.io/content-management/summaries/)
   - 便捷获取文章的图片资源 - [Image Processing](https://gohugo.io/content-management/image-processing/)
   - 自定义 URL 的规则 -  [URL Management](https://gohugo.io/content-management/urls/)

以上便是我们在实践中，有接触过的一些 Hugo 比较好用的工具，当然它提供的远比这个更丰富，更多工具可查看[参考官方文档](https://gohugo.io/about/)。

#### 社区资源丰富

- 生态很好，现成大量的主题可供选择

作为 Golang 语言最受欢迎的站点框架，随着越来越多人的使用，Hugo 官方鼓励大家开源自己的主题，约定了简易可行的规范，让贡献者的主题能在 Hugo 官网方便地被他人找到，易于复用。非技术的同学，也可以找到符合自己需求的主题，不用写一行 HTML 代码，也能让自己生成自己的站点。

- 答疑途径多样
   - 作为一个 45k+ star 的项目，使用人群众多，知识沉淀很好，网上搜索能解决大部分问题。
   - 有在线的[论坛](https://discourse.gohugo.io/)，维护者也相当活跃，只要提问得当，能及时得到回复，解决疑难杂症。
   - [官方文档](https://gohugo.io/documentation/) 的内容组织，层次也比较清晰，从笔者个人使用来看，体验还是很好的。

## 经验总结

除了上面偏向于 Hugo 本身提供的功能介绍外，下面结合笔者自身的实践经历，阐述一些小小的经验总结，方便后来的朋友：

#### 使用现成的主题

基于 DIY 原则来说，结合自身需求，去主题市场找一个符合自己的主题来进行修改，应该是上手最快的方式了，甚至不需要开发就能拿来直接用，即使需要开发，使用他人已开发好的主题，由于 Hugo 框架本身具有很好的约定规范，你也能很快了解到一个 Hugo 项目的结构组成及运行机制，降低调研上手成本。

#### 项目结构和内容关系

就像前面介绍的内容管理系统，从结构上了解内容 contents 与模板 layouts 之间的映射关系，适当结合官网文档的[介绍](https://gohugo.io/content-management/organization/)，了解这层映射关系后，能方便在后续的开发过程中，让你的实践更符合 Hugo 期望的形式来进行，这样会让你不论是实现，还是在阅读 Hugo 文档的时候，事半功倍，易于理解。

#### 个人定制

除了 Hugo 本身的框架、规范及工具能力外，因为网页的代码最终还是离不开 HTML/CSS/Javascript，自定义相关的内容，只要善用提供的规则（如各个模板的引用，组合），就能在各个模板入口引入你想自己控制的代码部分，为你自己的站点添砖加瓦。结合我们自身的实践，比如第三方站点插件的集成（埋点统计，Discourse、ShareThis等等），一些自定义弹窗等动态 js 的添加，所以只要熟悉网页的常规开发，除了 Hugo 的能力外，你可以做到你以往可做的任何事情。

#### 纯静态站点

Hugo 打包构建后输出的是一个纯静态的资源包，这样地好处就是你可以将你的站点部署在任何地方，比如使用 GitHub 免费的 [Pages](https://pages.github.com/)，又或者是随便放在 oss 源中，没有维护服务器，数据库的烦恼。纯静态资源部署很便捷，以 Hugo 为例，他的路由适合文件目录相关的，我们的站点有中英文两个语言版本，开发时都放在一个项目中进行维护共享模板，在构建部署时，会根据语言打成不同的资源包，分别发到不同的国内外 Web 容器，以此优化访问体验。

## 最后

以上便是笔者使用 Hugo 框架搭建公司 [Nebula Graph 官网](https://nebula-graph.com.cn/) 的一些实践心得，希望给有快速建站需求的朋友提供一些思路和参考，我们的站点是基于已有主题二次开发，更多细节感兴趣的朋友也可以看看我们放在 GitHub 的[源站仓库](https://github.com/vesoft-inc/nebula-website)。

也欢迎大家来了解我们的 [Nebula Graph 图数据库产品](https://github.com/vesoft-inc/nebula) 或者前往官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

> 作者有话说：Hi，我是 Jerry，是图数据 Nebula Graph 前端工程师，在前端平台工具开发及工程化方面有些小心得，希望写的经验分享能给大家带来帮助，如有不当之处也希望能帮忙纠正，谢谢~

