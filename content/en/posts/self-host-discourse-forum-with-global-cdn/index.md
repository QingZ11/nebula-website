---
title: "How to Deploy Self-Hosted Discourse Forum With Global CDN"
date: 2020-04-08
description: "This article explains in detail how Nebula Graph self-hosts our Discourse forum with global CDN to ensure decent access speed for global users."
author: "George"
tags: ["tools"]
---

![How to Deploy Self-Host Discourse Forum with Global CDN](https://user-images.githubusercontent.com/57335825/78754651-6d195780-79aa-11ea-9889-5a80ef550295.png)

Discourse is an open source forum software developed by Jeff Atwood, the co-founder of Stack Overflow. The application is written with Ruby on Rails. 

As a product designed for the next decade of the Internet, Discourse breaks with existing forum software by its commitment to open source,  concise page style and unique content system. Famous companies like Car Talk are using Discourse to set up forums for their products.

As an open source forum project, Discourse has the following highlights compared to other forums:

- **Highly customized**: Discourse lists 25 major setting items that including 300+ sub items. Even if everyone is using Discourse to build their forums, each forum can have its own unique style.
- **Rich plugins**: Together with its active community, Discourse provides a big variety of plugins for  users to customize their forums such as the navi bar and banner image.
- **Integrations**: Discourse can be fully integrated with other third-party tools like Google Analytics, Slack and Wordpress.
- **Free**: Discourse has an option to host the forum at $100/Month for you. However, you can totally deploy the service on your own without spending a penny.
- **Easy to get started**: Discobot is a customizable bot  that teaches new users in an interactive way how to use  features like bookmarking a topic, oneboxing links (embedded previews), adding emoji, name mentions, simple formatting, adding a picture to a reply, flagging posts and the search function.


Nebula Graph chooses Discourse for its rich plugins and the customizable forum settings. However, we are not going to introduce how to build Discourse in this post. (It's a rather simple task, just Google it.) We will introduce how to deploy Discourse with global CDN for the Nebula Graph community.

## Deploying Discourse

### Why Self-Hosting

As mentioned above, Discourse provides hosting service, but we decided to self-host our forum for the following reasons:

1. Unstable access in China
1. Limited plugin modification
1. Not able to customize the internet settings



We have customized the internet settings and modified some plugins on the self-hosted forum so that our community members across the globe get to access it faster.

### Self-Hosting Prerequisites
Below is a list of what's required for self-host a Discourse forum:

- Linux servers with more than 2G memory, if your server memory is 1G, you need to enable the SWAP partition
- A domain with full control, which we will use when registering for mail and CDN services
- A Cloudflare account, which helps speed up your site and improve security
- An available SMTP mail service

### Self Host a Discourse Forum with Cloudflare CDN

#### Introduction to Cloudflare

Cloudflare is a global CDN  service provider. In addition to the CDN service, it also provides services like DNS query, DDoS mitigation and cache acceleration service.

Compared with other CDN service providers, Cloudflare  provides  qualified services at lower price (free most of the times). Therefore, Cloudflare has a very large user base and is our first choice.

#### Step 1: Adding DNS records for Cloudflare

Add DNS records first, which will reduce the possibility of being rejected by the _Let's encrypt_ certificate in your first deployment. In the Cloudflare dashboard, click the the DNS app, add Type A record and point it to the server IP.

![Add DNS records for Cloudflare](https://user-images.githubusercontent.com/57335825/78763342-9987a080-79b7-11ea-9a47-39428e0cd149.png)


**Takeaway:**

Don't set the Proxy status option as Proxied because that will result in inaccessibility due to too many redirects. Enable the Proxy status setting after all configuration is finished correctly.

#### Step 2: Configure Cloudflare SSL/TLS

_**Full**_ and _**Flexible**_ are the most commonly used SSL types in Cloudflare. We need to configure SSL before enabling the CDN.

Select mode _**Full**_ in the SSL/TLS dashboard. **_Full_** ensures a secure connection between both the visitor and your Cloudflare domain and between Cloudflare and your web server.

![Configure Cloudflare SSL/TLS](https://user-images.githubusercontent.com/57335825/78763496-cb006c00-79b7-11ea-83e5-f7006490ca64.png)


Then click the Origin Server tab to create a certificate. Select RSA in the Private key type. RSA is the most compatible certificate type while ECDSA has better performance.

Select your forum domain in the hostname list protected by the certificate. In our case, we select discuss.nebula-graph.io. Select the certificate validity to 1 year. Click next to get your certificate public key and private key, each saved as `ssl.crt` and `ssl.key` respectively. Keep your keys properly because we will use them in the following steps.

![Configure Cloudflare SSL/TLS - Domain](https://user-images.githubusercontent.com/57335825/78763658-03a04580-79b8-11ea-991c-30f43d53fd93.png)


#### Step 3: Configure and deploy Discourse

Discourse docker image makes it much easier to deploy a Discourse forum. Install Docker first then run the image to get started.

#### Step 4: Install Discourse

Clone the [Official Discourse Docker Image](https://github.com/discourse/discourse_docker) into `/var/discourse`.

```bash
sudo -s
git clone https://github.com/discourse/discourse_docker.git /var/discourse
cd /var/discourse
```

Launch the setup tool in `/var/discourse`.

```bash
./discourse-setup
```

Answer the following questions when prompted:

```bash
Hostname for your Discourse? [discourse.example.com]:
Email address for admin account(s)? [me@example.com,you@example.com]:
SMTP server address? [smtp.example.com]:
SMTP port? [587]:
SMTP user name? [user@example.com]:
SMTP password? [pa$$word]:
Let's Encrypt account email? (ENTER to skip) [me@example.com]:
```

Please be noted that if the DNS records have not been propagated to the DNS server used by the server, the SSL certificate auto-registration service of Let ’s Encrypt is not available. Since we will use the Cloudflare certificate applied in the above instruction, we can skip the Let's Encrypt account email here.

About 10 minutes later, you can visit your own Discourse forum via the domain set previously. If you get 502 error on the first visit, this is because the service has not been fully initialized. You just wait and retry.

![Install Discourse](https://user-images.githubusercontent.com/57335825/78763841-3fd3a600-79b8-11ea-94ce-6a275186daf3.png)

#### Step 5: Configure Discourse

The configuration file of Discourse is located at `/var/discourse/containers/app.yml`.

**Set email server**
Email server setup and maintenance is very difficult even for experienced system administrators, and getting any part of the complex required email setup wrong means your email won't be delivered. For most Email services, you only need to configure the SMTP server address, port, user name and password. You can get the STMP server address and the available port on the help page of the Email service provider. Some personal mail may need special password to enable the SMTP service.

However, for Office365 and Tencent enterprise mail, you need to manually specify the account verification method as login in the `app.yml` file.

The following are template configurations for email service providers known to work with Discourse.

```bash
 DISCOURSE_SMTP_ADDRESS: smtp.office365.com
 DISCOURSE_SMTP_PORT: 587
 DISCOURSE_SMTP_USER_NAME: example@office365.com
 DISCOURSE_SMTP_PASSWORD: **********
 DISCOURSE_SMTP_ENABLE_START_TLS: true
 DISCOURSE_SMTP_AUTHENTICATION: login
```

This is because the default Discourse mailbox authentication method is `plain`. If you are not sure which method to use for authentication, monitor with swaks, a mail service testing tool. For example:<

```bash
swaks --to [Inbox] --from [Outbox] --server [SMTP server address] --auth [login/plain] --auth-user [Outbox] -tls -p [port]
```

While ensuring that you can pass the Discourse sending test, you also need to set two other options to ensure that users can receive mail.

One is the notification mail under the Setting-Required in the forum. You need to configure the email here the same as the SMTP login email. The other one is the disable emails, which is usually set to non-staff after forum migration and backup recovery. Set it to no to recover email sending.

**Set SSL and CDN**

Introduce two template files: `templates/cloudflare.template.yml` and `templates/web.ssl.template.yml` to your `app.yml` file. Log in to Cloudflare again, change the DNS record from DNS only to Proxied and wait for the validation.

```
 DISCOURSE_SMTP_ADDRESS: smtp.office365.com
 DISCOURSE_SMTP_PORT: 587
 DISCOURSE_SMTP_USER_NAME: example@office365.com
 DISCOURSE_SMTP_PASSWORD: **********
 DISCOURSE_SMTP_ENABLE_START_TLS: true
 DISCOURSE_SMTP_AUTHENTICATION: login
```

Put the certificate file created in step 2 in `/var/discourse/shared/standalone/ssl`.

**Add new plugins (optional)**

There are a large number of Discourse plugins available. Just pick the ones that are useful to you. For example, if you are reaching a global audience, then you might need a translation plugin to help people understand posts written in different languages.

Configure links that can be fetched by git in the hooks field in file `app.yml`. When the Discourse Docker container is re-created, your new plugins are installed.

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

### Get Started with Your Forum

After completing the above configuration, run `./launcher rebuild app` in the `/var/discourse`  and wait for 10 minutes to complete the final building.

If you are a personal site owner, consider installing and configuring Fail2ban to protect the ssh service security. Discourse will create a weekly backup and save it in the local `/var/discourse/shared/standalone/backups` directory. You can set _rsync_ for a local backup. If an Amazon S3 service is available, you can also configure the related information of the S3 service in the background. Discourse will automatically upload the backup to the corresponding S3 instance after the backup is completed.

Now you have your own Discourse forum with global CDN acceleration. Benefiting from the global CDN and full link SSL, your forum can be securely accessed anywhere in the world. Visiting the forum from your domain name, and fill in the related information to initialize the forum and create an administrator account. You can start the forum service after confirming registration through the link in the email.

## Conclusion

That's pretty much how we have self hosted the Nebula Graph [forum](https://discuss.nebula-graph.io/) with global CDN. If you have any thoughts or suggestions, feel free to leave us comments below.

> Hi, I'm George and I work as Implementation Engineer at Nebula Graph. I've been working in the devops field for years and would like to share what I've learn with you. Hope my post is helpful to you. Do let me know about your thoughts. Appreciate that!

## You might also like
1. [Automating Your Project Processes with Github Actions](https://nebula-graph.io/posts/github-action-automating-project-process/)
1. [Compiling Trouble Shooting: Segmentation Fault and GCC Illegal Instruction](https://nebula-graph.io/posts/segmentation-fault-gcc-illegal-instruction-trouble-shooting/)
