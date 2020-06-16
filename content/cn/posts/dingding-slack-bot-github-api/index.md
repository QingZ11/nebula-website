---
title: "钉钉机器人自动关联 GitHub 发送 approval prs"
date: 2020-06-16
description: "用技术来解决 PM 枯燥的 approval pr 工作，本文将阐述如何自动化获取 GitHub Organization 下各个 repo 待 merge 的 pull requests 并通知相关人员，告别每日的手动操作。"
tags: ["产品讲解"]
author: Jude
---

![钉钉机器人](https://www-cdn.nebula-graph.com.cn/nebula-blog/ding-ding-chat-bot.png)

在日常工作中，你是否遇到以下场景：

- Github 存在多个 repo，日常工作中需要一个个地手动筛选大量待 merge 的 pull requests
- 要找出多个 repo 中 `ready to review` 的 pull requests，要手动筛选，然后一遍又一遍地粘贴复制提交 dev 进行 review #倍感无聊
- 想自动推送 GitHub 待 merge 的 prs，GitHub Webhooks 却没有该 Event
- ……

用技术来解决 PM 枯燥的 approval pr 工作，本文将阐述如何自动化获取 GitHub Organization 下各个 repo 待 merge 的 pull requests 并通知相关人员，告别每日的手动操作。此文主要提供了解决自动发送 approval prs 的思路，并以钉钉群和 Slack 为例，给出了其 Python 的实现方式，如果你使用其他通讯工具，实现原理是相通的。

## 配置消息接收

### 配置钉钉群机器人

1. 打开机器人管理页面。以 PC 端为例，打开 PC 端钉钉，点击“群设置” => “智能群助手” => “添加机器人”。

![dignding-chat-bot](https://www-cdn.nebula-graph.com.cn/nebula-blog/dignding-chat-bot.png)

2. 点击“添加机器人”，选择“自定义”

![钉钉机器人](https://www-cdn.nebula-graph.com.cn/nebula-blog/钉钉机器人.png)

本例的“安全设置”使用自定义关键词的方式，之后给机器人所发送的消息中必须包含此处设置的关键词。

3. 点击“完成”，获取 Webhook

详细的钉钉 bot 配置文档可参见官方文档：[https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq/26eaddd5](https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq/26eaddd5)

### 配置 Slack bot

- 创建一个 app（链接：[https://api.slack.com/apps](https://api.slack.com/apps)），设置 App Name，选择目标 Slack Workspace
- 在左侧栏中选择 “Basic Information” => “Add features and functionality” 选在 “Bots”

![slack-bot](https://www-cdn.nebula-graph.com.cn/nebula-blog/slack-bot.png)

- 在左侧栏中选择 “OAuth & Permissions”，在 “Scopes” 中点击 “Add an OAuth Scope”，添加 `chat:write.public` 
- 点击 “Install App to Workspace”
- 获取 OAuth Access Token

详细的 Slack bot 配置步骤参见官方英文文档：[https://slack.com/intl/en-cn/help/articles/115005265703-Create-a-bot-for-your-workspace#add-a-bot-user](https://slack.com/intl/en-cn/help/articles/115005265703-Create-a-bot-for-your-workspace#add-a-bot-user)

## 配置 Github 获取 Personal Access Tokens

生成 Token，赋予相应权限。在此例中，读取了 Organization 下所有 Public 和 Private Repos，需要勾选repo。

![generate-github-tokens](https://www-cdn.nebula-graph.com.cn/nebula-blog/generate-github-tokens.gif)

详细 GitHub Token 配置步骤参见官方文档：[https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)

## 代码说明

### 获取 Github 待 merge pr

[PyGithub](https://github.com/PyGithub/PyGithub) 提供了访问 Github V3 API 的功能，可以让你用代码去实现 GitHub 上的操作，可通过 `pip install pygithub` 进行安装。

```
FILTER_TEMPLATE = "repo:{org}/{repo} is:pr is:open review:approved"

class GithubPrList:

    @property
    def gh(self):
        return self._gh

    @property
    def org(self):
        return self._org

    FILTER_TEMPLATE = "repo:{org}/{repo} is:pr is:open review:approved"

    def __init__(self,
                 org,
                 repo,
                 login_or_token,
                 password=None,
                 timeout=DEFAULT_CONNECT_TIMEOUT,
                 retry=None,
                 ):
        """
        :param org: string
        :param repo: string
        :param login_or_token: string，token or username
        :param password: string
        :param timeout: integer
        :param retry: int or urllib3.util.retry.Retry object
        """
        #实例化对 Github API v3 的访问
        self._gh = Github(login_or_token=login_or_token,
                          password=password,
                          timeout=timeout,
                          retry=retry)
        self._org = org
        self._repo = repo

		def getIssues(self,
                   		 filter=None,
                       sort=DEFAULT_PR_SORT,
                       order=DEFAULT_ORDER,
                       ):
        """
        :param filter: string
        :param order: string ('asc', 'desc')
        :param sort: string('comments', 'created', 'updated')
        :rtype :class:`List` of :class:`PrList2.PrElement`
        """
        if not filter:
        		#生成查询的 filter，指定org/repo 下已经approved 的pr
            filter = self.FILTER_TEMPLATE.format(org=self._org,
                                                 repo=self._repo)
        #查询
        issues = self._gh.search_issues(filter, sort, order)
        prList = []

        for issue in issues:
            prList.append(PrElement(issue.number, issue.title, issue.html_url))

        return prList
```

函数说明：

- `__init__` 支持使用 username/ password 或者 token 去实例化对 GitHub API V3的访问（英语是 instantiate to access the Github API v3）。
- 在 Github 中，pull requests 也是 issues，`getIssues()` 函数允许用户可使用默认条件（`repo:{org}/{repo} is:pr is:open review:approved`）查找指定 org/repo 下状态是 Approved 的 pull requests，也就是待 merge 的 prs。其中:

| Qualifier | 说明 |
| --- | --- |
| repo:org_/_repo | 查找指定组织 repo 下的projects |
| is:pr | 查找 pull requests |
| is:open | 查找 open 的 issues |
| review:approved | 查找 review 状态是已经 approved，review status 可能取值 _none_、_required_、_approved_、_changes requested_ |

用户也可指定 Github issues 的筛选条件，使用示例：

```
filter = "repo:myOrg/myRepo is:pr is:open review:approved"
GithubPrList(self.org, 
							self.repo, 
              self.token).getIssues(filter)
```

更多筛选条件，请参见官方文档：[https://help.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests](https://help.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests)

### 发送消息

#### 发送钉钉消息

DingtalkChatbot 对钉钉消息类型进行了封装。本文使用此工具发送待 merge 的 pr 到钉钉群，可通过 `pip install pyDingtalkChatbot` 安装 DingtalkChatbot。

```
from dingtalkchatbot.chatbot import DingtalkChatbot

webhook = "https://oapi.dingtalk.com/robot/send?access_token=xxxxxxxxxx"
atPerson = ["123xxx456","123xxx678"]

xiaoding = DingtalkChatbot(webhook)
xiaoding.sendMsg({自定义关键词} + "上文中的 pr list", atPerson)
```

将消息发送到钉钉群，此处需要用到上文中的钉钉群机器人的 Webhook 和自定义的关键词。

#### 发送 slack 消息

[Python slackclient](https://github.com/slackapi/python-slackclient) 是 Slack 开发的官方 API 库，能够从 Slack 频道中获取信息，也能将信息发送到Slack频道中，支持 Python 3.6 及以上版本。可通过 `pip3 install slackclient` 进行安装。

```
from slack import WebClient
from slack.errors import SlackApiError

client = WebClient(token={your_token})

try:
    response = client.chat_postMessage(
        channel='#{channel_name}',
        text="Hello world!")
    assert response["message"]["text"] == {pr_list}
except SlackApiError as e:
    # You will get a SlackApiError if "ok" is False
    assert e.response["ok"] is False
    assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
    print(f"Got an error: {e.response['error']}")
```

用上文配置的 token 替换此处的 {your_token}，替换 {channel_name}，将 pr_list 发送给目标 channel。

至此，大功告成！来看看效果

![dingding-chat-bot-demo](https://www-cdn.nebula-graph.com.cn/nebula-blog/dingding-chat-demo.png)


本文中如有任何错误或疏漏，欢迎去 GitHub：[https://github.com/vesoft-inc/nebula](https://github.com/vesoft-inc/nebula) issue 区向我们提 issue 或者前往官方论坛：[https://discuss.nebula-graph.com.cn/](https://discuss.nebula-graph.com.cn/) 的 `建议反馈` 分类下提建议 👏；加入 Nebula Graph 交流群，请联系 Nebula Graph 官方小助手微信号：[NebulaGraphbot](https://www-cdn.nebula-graph.com.cn/nebula-blog/nbot.png)

> 作者有话说：Hi，Hi，我是 Jude，图数据 Nebula Graph 的 PM，欢迎大家提需求，虽然不一定都会实现，但是我们会认真评估^ ^

