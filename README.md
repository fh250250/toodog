# My actionhero Project

*visit www.actionherojs.com for more information*

## To install:
(assuming you have [node](http://nodejs.org/) and NPM installed)

`npm install`

## To Run:
`npm start`

## To Test:
`npm test`

## 数据表结构

`proxy` 代理

|字段|类型|说明|
|:-|:-|:-|
|addr|string|代理地址|
|rank|int|分值|
|comboSuccess|int|成功连击数|
|comboFailure|int|失败连击数|
|t|date|更新时间|
|usedAt|date|使用时间|

`account` 账号

|字段|类型|说明|
|:-|:-|:-|
|userid|int|用户 ID|
|username|string|用户名|
|nickname|string|用户昵称|
|cookie|string||
|webCookie|string||
|password|string|密码|
|commentCount|int|评论次数|
|likeCount|int|点赞次数|
|commentAt|date|评论时间|
|likeAt|date|点赞时间|

`task` 任务

|字段|类型|说明|
|:-|:-|:-|
|articleId|string|文章 ID|
|comment|string|评论|
|commentId|string|评论 ID|
|commentAccountId|ObjectId|评论的账号 ID|
|targetLikeCount|int|目标点赞数|
|likeCount|int|当前点赞数|
|likeProxies|[ObjectId]|使用过的点赞代理 ID 数组|
|likeAccounts|[ObjectId]|试用过的点赞账号 ID 数组|
|stage|int|任务执行阶段|
|t|date|更新时间|
|err|string|任务失败时的错误信息|

任务执行阶段说明:
```
初始 ---> 评论完成 ---> 点赞完成        任务失败
0        1            2              -1
```
