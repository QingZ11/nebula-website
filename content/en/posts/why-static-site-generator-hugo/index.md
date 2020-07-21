---
title: "Why Using Hugo as Static Site Generator - Hands-on Experience at Nebula Graph"
date: 2020-07-21
description: "In this weekly issue, we are covering TTL and recommended configurations to run Nebula Graph in both production and testing environments."
tags: ["dev-log"]
author: "Jerry"
---

![Why Using Hugo as Static Site Generator -Hands-on Experience at Nebula Graph](https://user-images.githubusercontent.com/57335825/88053343-7e791080-cb10-11ea-95fa-8d8c465d6ca4.png)

Site generators are no longer a novel topic. Various programming languages have released their own popular website building frameworks. For example, Python released [Pelican](https://github.com/getpelican/pelican) , JavaScript released [Hexo](https://github.com/hexojs/hexo) and PHP released [WordPress](https://github.com/WordPress/WordPress), which has the largest market share. I have tried all these tools when deploying my personal blog. But when building the official [Nebula Graph Site](https://nebula-graph.io/), after evaluation, I chose [Hugo](https://gohugo.io/), which is written in Golang.

To clarify, there is not much difference in the frameworks written in various languages. It is personal preferences and aesthetics that matter, which is not the topic covered in this post.

## Website Requitements at Nebula Graph

### Blog Content Management

The Nebula Graph team frequently shares [technical articles](https://nebula-graph.io/posts/) on the company blog. Hugo has a flexible and powerful content management system. You can add various types of content, such as blogs, releases, and technical documents as required. Details will be introduced later.

### Product Proliferation

Commonly seen product proliferation pages include a home page, a newsroom page, and a company page, etc. This requires that the Conent Management System supports various types of pages. These pages may share the same components such as the navi bar and footer. Details will be covered later as well.

### SEO

Hugo itself is a web framework similar to the service-end template, which supports server-end rendering natively.

### Multi-Language Support

Nebula Graph serves users worldwide. To ensure quality user experience, the website should support multiple languages. Hugo has us covered. As long as you have the corresponding corpus configuration, you can use the language on your site and manage it easily.

### Easy-to-Manage for Non-Technical Staff

Based on Hugo's powerful template system, the content managers can use it smoothly after the technicians have made custom development on the template.

### Hugo Feature Highlights

#### Flexible and Powerful Content Management System

```markdown
...
├── config // The corpus your template needs.
|   ├── default
|   |   ├── config.toml
|   |   └── config.cn.toml
|   |   └── config.en.toml
|   |   └── footer.cn.toml
|   |   └── footer.en.toml
|   |   └── ...
├── content // Maintained by the content team.
|   ├── en
|   |   ├── posts // The built-in content type: post.
|   |   |   ├── post-01.md
|   |   |   ├── post-02.md
|   |   └── release // The customized content type: press releases.
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
├── themes // Theme of the site.
|   ├── nebula-theme // Theme name.
|   |   ├── layout // The template.
|   |   |   ├── _default // The default template.
|   |   |   |   ├── baseof.html // The definition of the rendered seed page.
|   |   |   |   ├── list.html  // The default post content type adopted by the blog home page.
|   |   |   |   ├── single.html // The default post content type adopted by the blog post pages.
|   |   |   ├── partials // Reused template fragments.
|   |   |   |   ├── head.html
|   |   |   |   ├── footer.html
|   |   |   |   ├── menus.html
|   |   |   |   ├── ...
|   |   |   ├── index.html // The template adopted by the homepage（'/').
|   |   |   ├── section
|   |   |   |   ├── release.html // The customized press release template adopted by the specific press release pages.
|   |   |   |   ├── news.html // The customized news coverage template adopted by the newsroom page.
...
```

The above is the project structure built with the powerful Hugo template. Personally I think it demonstrates the requirements of different sites intuitively. Refer to Hugo's official [Templates Overview](https://gohugo.io/templates/) for more information.

#### Rich Built-in Tools

In addition to the powerful content management system, Hugo provides a lot of useful built-in templates and functions to improve the building efficiency. For example:<

- [Pagination](https://gohugo.io/templates/pagination/) for resources pages.

The Pagination template helps you paginate your resources pages such as blogs, press releases, and news coverage.

- [RSS](https://gohugo.io/templates/rss/) template.

RSS is indispensable for informational sites. Hugo has shipped with the default RSS template and all you need to do is adding a line of code to settle with the RSS. You can customize your own RSS as well.

- Various [Functions](https://gohugo.io/functions/) to process strings and contents.

Hugo supports replacing common strings in applications. Hugo also supports pipe to pass contents through layers, just like the commands input logic in Linux.

- Easy-to-use CLI tool

The built-in http server is convenient for local development. At the same time, it can package the entire site into a static resource, which facilitates the deployment and decreases the maintenance costs. You can initialize and start your project with one click. This makes Hugo an out-of-the-box tool and easy to get started.

- Powerful content management tools
   - [TableOfContents](https://gohugo.io/content-management/toc/#readout) - Quickly extract a ToC for blog posts
   The TableOfContents function generates a Table of Contents based on your current blog, saving the anchor generating time.
   - [Summary](https://gohugo.io/content-management/summaries/) - Generate a preview for your content.
   - [Image Processing](https://gohugo.io/content-management/image-processing/) - Obtain the image resources for your content.
   - [URL Management](https://gohugo.io/content-management/urls/) - Customize the URL for your content.

The above are some of the powerful Hugo tools that we have adopted in our website practice. Hugo provides far more abundant tools than these. Refer to the [Documentation](https://gohugo.io/about/) for more.

#### Excellent Community Support

- There are a large number of templates for you to choose from.

Hugo has become the most popular site framework written in Golang. As more and more people are using Hugo to build static sites, Hugo encourages the community to open source their own themes and make sure these themes can be easily found by others on the Hugo official website. Non-technicians can also find topics that meet their needs without writing a single line of HTML code, and generate their own sites.

- Various channels to get help
   - As a project with 45k+ stars, Hugo has a large user base. You can find a solution to your problem by Googling most of the time.
   - The maintainers of the Hugo [forum](https://discourse.gohugo.io/) are active and your problem can be solved in a rather timely manner as long as it is expressed properly.
   - Hugo's [Documentation](https://gohugo.io/documentation/) is well-organized and easy to use.


## Hugo Best Practices from Hands-on Experiences

In addition to the above Hugo highlights, I would like to share some best practices out of my hands-on experiences using Hugo as the site generator.

### Use The Existing Themes

The quickest way to use Hugo is to find a theme that best suits your requirements in the theme market as the basis. Sometimes you don't even need to customize the themes. Even if customization is required, the learning curve of Hugo's project structure and running mechanism is relatively low because Hugo has defined the conventions quite clearly.

### Understand the Relationship Between Project Structure and Content Beforehand

With the earlier introduced content management system and Hugo's [Documentation](https://gohugo.io/documentation/) you can learn the mapping relationship between contents and layouts. Once obtaining an idea of the mapping relationship, you can develop in the way Hugo expects you to and find it easier to understand the doc.

### Customize Your Site

In addition to Hugo's own framework, specifications, and tools, you can introduce your customized code for every template as long as you are familiar with HTML/CSS/Javascript and Hugo's rules such as combination of various templates. In our practice, we have integrated with third-party plugins (such as data statistics, Discourse and ShareThis) and introduced some customized popup windows with JavaScript. So as long as you are familiar with the regular development of web pages, in addition to Hugo's basic functions, you can do anything to your site within your ability.

### Build a Static Site

Hugo will package your content to a static resource package so that you can deploy your site anywhere. For example, you can use the free GitHub [Pages](https://pages.github.com/) or the OSS, saving you from server and database maintenance. Deploying static resources is quite simple. Take Hugo as an example. Its routing relates with the file directories. Our site is available in both Chinese and English. And the two versions are developed in the same project and share the same template. When deployed, the two versions are packaged into different resource packages and are sent to different web servers to optimize user experience.

## Conclusion

The above are my experiences on using the Hugo framework to build [Nebula Graph Website](https://nebula-graph.io/). I hope that this article provides some ideas and references to those who need to quickly build sites. I have customized our site based on the existing themes. If you are curious about it, please go to the [GitHub Repository](https://github.com/vesoft-inc/nebula-website) for the details. Welcome to visit our graph database [Nebula Graph](https://github.com/vesoft-inc/nebula), thank you.

## You might also like

1. [Automating Your Project Processes with Github Actions](https://nebula-graph.io/posts/github-action-automating-project-process/)
1. [How to Reduce Docker Image Size](https://nebula-graph.io/posts/how-to-reduce-docker-image-size/)

> Hi, I’m Jerry, the front-end engineer at Nebula Graph. I would like to share my experiences in the front-end development. Hope my post is of help to you. Please let me know if you have any ideas about this. Thanks!