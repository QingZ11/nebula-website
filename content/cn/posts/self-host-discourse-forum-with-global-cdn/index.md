---
title: "全站 CDN 部署 Discourse 论坛"
date: 2020-04-08
description: "本文详细地讲述了如何使用 Cloudflare 和 Discourse 服务自建论坛的过程。"
tags: ["产品讲解"]
author: George
---

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/cdn01.png)

## Discourse 介绍

Discourse 是一款由 Stack Overflow 的联合创始人——Jeff Atwood，基于 Ruby on Rails 开发的开源论坛。相较于传统论坛，Discourse 从他全面开放的开源态度、简介明了的页面风格到其特有的内容运作体系都在证明自己是一款为下一个 10 年的互联网而设计的产品。现在，诸如 Car Talk 等国外知名产品都采用 Discourse 为论坛方案。

作为一个开源的论坛项目，Discourse 相对其他的论坛有以下亮点：

- **高度可定制**：从发帖等级要求权限到论坛帖子标题最少字数要求，Discourse 在论坛设置里罗列了 25 设置大项，300+ 个论坛小项，即使大家都使用 Discourse 搭建论坛但是每个用 Discourse 搭建的论坛都有自己的风格。
- **插件**：Discourse 官方及 Discourse 开源社区用户开发了丰富的插件可供使用，比如：个性化导航、自定义论坛封面。
- **集成**：可接入第三方产品，Google Analytics、 Slack、Wordpress 都在支持之列。
- **免费**：虽然 Discourse 有 $100/Month 的托管服务，但是你可以完全自行部署免费使用 Discourse 服务。
- 其他：Discourse 还有其他许多的好处，举个例子，它提供了一个机器人 Discobot 是一个可自定义的 bot，交互式地教新用户使用平台的许多功能，例如为主题添加[书签](https://en.wikipedia.org/wiki/Bookmark_(World_Wide_Web))，单框链接（嵌入的预览），添加 [emoji表情](https://en.wikipedia.org/wiki/Emoji)，非常简单的格式设置，添加图片回复，标记帖子以及如何使用搜索功能。


丰富的插件、可自定义论坛设置便是 Nebula Graph 选择 Discourse 最大的原因，而本文不在于介绍如何搭建 Discourse（搭建 Discourse 是一个简单的活，可自行搜索教程），本文旨在介绍图数据库 Nebula graph 如何利用 CDN 来部署 Discourse。

## 部署 Discourse

### 自托管的原因

尽管 Discourse 官方的托管服务，但由于**国内的访问质量不稳定、不能自由的修改插件和自定义网络设置**，因此我们决定自行托管这项服务。基于自托管服务，我们对网络、插件系统做了一些自定义修改，使得目前 Nebula Graph社区有着更好的访问速度和功能。

### 自托管论坛服务要求

经测试以下配置清单可以完全满足我们部署 Discourse 的要求：
- 2G 内存以上的 Linux 服务器，如果使用 1G 内存的主机，则需要开启 SWAP 分区。
- 具备完整控制权的域名，注册邮件服务和 CDN 服务时我们会用到它。
- 一个 Cloudflare 账号，这会对加速网站和提高安全性有帮助。
- 一个可用的 SMTP 邮件服务。
- 为 Linux 服务器部署 Docker 服务，国内用户可添加 Azure 中国、七牛云的镜像域名

### 部署实践

#### Cloudflare 介绍

Cloudflare 是一家覆盖全世界主要地区的 CDN 服务商，在提供基本的 CDN 服务同时，他们还提供高质量的 DNS 查询、DDOS 保护、缓存加速服务。相比其他的 CDN 服务商，他们产品理念更为先进，不仅有着良好的服务质量且拥有非常低廉的价格（通常情况下甚至是免费的），因此目前 Cloudflare 的用户规模非常庞大，是值得首选的CDN服务商。

#### 设定 Cloudflare 的 DNS记录

先设定 DNS 记录可减少首次部署时无法通过 Let's encrypt 申请证书的概率。在 Cloudflare 的 DNS 配置中，添加类型为 A 的记录指向服务器的 IP 地址即可。

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/cdn02.png)

这里需提醒下，不要将 Proxy status 设置为“Proxied”，这会导致页面因重定向次数过多而无法访问。我们将在完成正确的配置后开启 Proxy status 设置。

#### 配置 Cloudflare SSL/TLS

Full 和 Flexible 是 Cloudflare 上最常用的两种 SSL 模式，在正确的启用 CDN 前，需要对其进行设置。首先来到 SSL/TLS 设置面板，选择 Full 模式，这种方式会确保 CDN 回源时也可以通过 HTTPS 来访问源站，有效地提高了内容安全性。

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/cdn03.png)


然后进入 Origin Server 标签，进行创建证书的操作，在私钥类型中选择 RSA，BTW，这是最具兼容性的证书类型，ECDSA 则具有更好的性能。

在被证书保护的域名列表中输入论坛的域名，例如 Nebula Graph 论坛地址为：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/)，证书有效期选择 1 年即可。点击 Next 后将会获取到证书的公钥和私钥，分别保存为“ssl.crt”和“ssl.key”将其妥善保存，我们将在后续的步骤中用到他们。

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/cdn04.png)


#### 配置和部署 Discourse

Discourse 有完善的 Docker 镜像，因此在正确的安装 Docker 后可以直接运行它。

##### 安装 Discourse

将 Discourse 官方 Docker 镜像拉取至 `/var/discourse` 目录下。

```bash
sudo -s
git clone https://github.com/discourse/discourse_docker.git /var/discourse
cd /var/discourse
```

在 `/var/discourse` 目录下执行

```bash
./discourse-setup
```

可以看到如下交互式界面，在此界面依次填入域名、管理员邮箱、SMTP 邮件服务器信息以及 Let’s Encrypt 通知邮箱地址即可完成论坛的基础配置。

```
Hostname for your Discourse? [discourse.example.com]: [论坛的域名]
Email address for admin account(s)? [me@example.com,you@example.com]:[管理员邮箱，此邮箱不会公开] 
SMTP server address? [smtp.example.com]: [SMTP邮件服务器地址]
SMTP port? [587]: [SMTP邮件服务器端口]
SMTP user name? [user@example.com]: [论坛自动发信邮箱账号]
SMTP password? [pa$$word]: [论坛自动发信邮箱账号的密码]
Let's Encrypt account email? (ENTER to skip) [me@example.com]: [自动更新证书的通知邮箱地址]
```

##### SSL 注意事项

使用 SSL 需要注意的是，如果 DNS 记录还未传播至服务器所使用的 DNS 服务器，将无法使用 Let’s Encrypt 的 SSL 证书自动注册服务。由于我们将使用上文中已申请的 Cloudflare 证书，因此这里可以跳过 Let's Encrypt account email 这一项。

##### 论坛启动

大约等待 10 分钟后，可通过之前设定的域名：[https://discuss.nebula-graph.com.cn/](https://www.yuque.com/nebulagraph/ngnb/discuss.nebula-graph.com.cn/) 访问自己的 Discourse 论坛。如果首次访问时出现了 502 错误，这是由于服务还未完全初始化，通常情况下稍等片刻即可。 

![image](https://www-cdn.nebula-graph.com.cn/nebula-blog/cdn05.png)

#### 配置 Discourse

Discourse 的配置文件位于 `/var/discourse/containers/app.yml`

##### 邮件服务设定

邮件服务是整个部署过程中容易出现设定错误的部分之一。对于大多数邮件服务而言，正确的配置 SMTP 服务器地址、端口以及发信人的账户密码即可完成设定。SMTP 服务器地址和可用端口通常在邮件服务提供者的帮助页面上都可以查到，部分个人邮箱可能需要创建应用专用密码才能使用SMTP服务。

但对于 Office365 以及腾讯这种企业邮箱而言，则需要手动在 app.yml 中指定账户验证方式为 login。参考配置如下：

```
 DISCOURSE_SMTP_ADDRESS: smtp.office365.com
 DISCOURSE_SMTP_PORT: 587
 DISCOURSE_SMTP_USER_NAME: example@office365.com
 DISCOURSE_SMTP_PASSWORD: **********
 DISCOURSE_SMTP_ENABLE_START_TLS: true
 DISCOURSE_SMTP_AUTHENTICATION: login
```


这是因为 Discourse 默认的邮箱身份验证方式是 `plain`。如果不确定使用何种方式验证，可通过 swaks 这个邮件服务测试工具来进行监测。参考：

```bash
swaks --to [收件邮箱] --from [发件邮箱] --server [SMTP服务器地址] --auth [login/plain] --auth-user [发件邮箱] -tls -p [端口]
```


在确保能够通过 Discourse 邮件发送测试的同时，还需注意两项功能设定才能够确保用户能够收到邮件。
- 位于论坛 Setting-Required 下的 notification email，这里需要配置为和 SMTP 登录账号相同的邮箱地址。
- disable emails，通常在进行论坛迁移、备份还原后这一项通常会被设置为 non-staff，此时，设置为 no 后将恢复邮件发送。 

##### SSL、CDN服务设定

在 app.yml 文件中，tempates 下引入 `templates/cloudflare.template.yml` 和 `templates/web.ssl.template.yml` 两个模板文件。再次登录 Cloudflare 账号，将 DNS 记录从 DNS only 改为 Proxied，等待记录生效。如果本地的网络质量不佳，也可引入 `templates/web.china.template.yml` 模版，它将从国内的 Ruby 镜像获取资源。

```
templates:
  - "templates/postgres.template.yml"
  - "templates/redis.template.yml"
  - "templates/web.template.yml"
  - "templates/web.ratelimited.template.yml"
  - "templates/cloudflare.template.yml"
## Uncomment these two lines if you wish to add Lets Encrypt (https)
  - "templates/web.ssl.template.yml"
    #  - "templates/web.letsencrypt.ssl.template.yml"
```

在 `/var/discourse/shared/standalone/``ssl` 目录下放入步骤2 中所创建的证书文件。

##### 加入新插件（可选）

为了更好帮助海外用户阅读论坛上的中文内容，我们引入了翻译插件。Discourse 拥有丰富的插件，因此如果有需要，你可以安装任何你感兴趣的插件。

在 app.yml 文件的 hooks 字段下配置可被 git 获取的链接，当 Discourse 的 Docker container 重新创建时新插件既完成安装。

```
## Plugins go here
## see https://meta.discourse.org/t/19157 for details
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/discourse/docker_manager.git
          - git clone https://github.com/discourse/discourse-translator.git
```

#### 完成配置后

在完成以上配置后，在 `/var/discourse` 目录录下运行 `./launcher rebuild app`，并再次等待 10 分钟，即可完成最终的构建。

对于个人站长而言，还需安装并配置 Fail2ban 来保护 ssh 服务安全。Discourse 每周会自动创建一个备份保存在本机的 `/var/discourse/shared/standalone/backups` 目录下，可设置 rsync 将它们备份到本地的服务器上。如果有可用的 Amazon S3 服务，还可在后台配置 S3 服务的相关信息，Discourse 会在完成备份后自动将备份上传至对应的 S3 实例。

现在，你拥有了一个具备全站 CDN 加速能力的 Discourse 论坛，得益于全站 CDN 和全链路 SSL，论坛可以在全球任何位置被安全的访问。从你的域名访问论坛，并根据需要填写的信息即可初始化论坛并创建管理员账号，通过邮件中的链接确认注册后即可开启论坛服务。

## 结语

以上是我们为 Nebula Graph 部署 Discourse 论坛服务的一点小小的心得，本文中如有错误或疏漏还请多指教。最后，欢迎大家前往 [https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 参与图数据库及开源的讨论~

> 作者有话说：Hi，我是 George，是 Nebula Graph 的实施工程师，在运维领域有一些心得体会，希望能为图数据库领域带来一些自己的贡献。希望本文对你有所帮助，如果有错误或不足也请与我交流，不甚感激！

