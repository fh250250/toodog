'use strict'
const { Task, api } = require('actionhero')
const request = require('request-promise-native')
const faker = require('faker')

module.exports = class ProcessTask extends Task {
  constructor () {
    super()
    this.name = 'process'
    this.description = 'process the task'
    this.frequency = 60 * 1000
  }

  async run (data) {
    const PROCESS_COUNT = 10
    const stage0Tasks = await api.mongo.db.collection('task')
                                          .find({ stage: 0 })
                                          .sort('t', 1)
                                          .limit(PROCESS_COUNT)
                                          .toArray()

    for (const task of stage0Tasks) {
      await this.processStage0Task(task)
    }

    const stage1Tasks = await api.mongo.db.collection('tasks')
                                          .find({ stage: 1 })
                                          .sort('t', 1)
                                          .limit(PROCESS_COUNT - stage0Tasks.length)
                                          .toArray()

    for (const task of stage1Tasks) {
      await this.processStage1Task(task)
    }
  }

  async processStage0Task (task) {
    const proxy = await api.proxy.findOne()

    // 代理不够就跳过此次任务
    if (!proxy) { return }

    const account = await this.findOneCommentAccount()

    // 获取账号超时跳过此任务
    if (!account) { return }

    let json = null
    try {
      json = await request({
        url: 'http://www.yidianzixun.com/home/q/addcomment',
        method: 'post',
        headers: {
          'user-agent': faker.internet.userAgent(),
          cookie: account.webCookie
        },
        form: { docid: task.articleId, comment: task.comment },
        json: true,
        timeout: 5000,
        proxy: proxy.addr
      })
    } catch (e) { return }

    if (json.code) {
      // 评论任务失败
      await api.mongo.db.collection('task').updateOne(
        { _id: task._id },
        {
          $set: { stage: -1, err: json.reason },
          $currentDate: { t: true }
        }
      )
    } else {
      await api.mongo.db.collection('account').updateOne(
        { _id: account._id },
        { $inc: { commentCount: 1 } }
      )

      await api.mongo.db.collection('task').updateOne(
        { _id: task._id },
        {
          $set: {
            stage: 1,
            commentId: json.comment.comment_id,
            commentAccountId: account._id
          },
          $currentDate: { t: true }
        }
      )
    }
  }

  async findOneCommentAccount () {
    let account = null
    let tryTimes = 0

    while (tryTimes++ < 3) {
      account = await api.mongo.db.collection('account')
                                  .findOneAndUpdate(
                                    { commentCount: { $lt: 5 } },
                                    { $currentDate: { commentAt: true } },
                                    { sort: { commentAt: 1 } }
                                  ).then(r => r.value)

      if (account) { break }

      try {
        await api.account.register()
      } catch (e) {
        api.log(e.message)
      }
    }

    return account
  }

  async processStage1Task (task) {
    const proxy = await api.mongo.db.collection('proxy').findOneAndUpdate(
      { rank: { $gte: 20 }, _id: { $nin: task.likeProxies } },
      { $currentDate: { usedAt: true } },
      { sort: { usedAt: 1 } }
    ).then(r => r.value)

    // 代理不够就跳过此次任务
    if (!proxy) { return }

    const account = await api.mongo.db.collection('account').findOneAndUpdate(
      { _id: { $nin: task.likeAccounts } },
      { $currentDate: { likeAt: true } },
      { sort: { likeAt: 1 } }
    ).then(r => r.value)

    if (!account) { return }

    let json = null
    try {
      json = await request({
        url: 'http://www.yidianzixun.com/home/q/addupcomment',
        headers: {
          'user-agent': faker.internet.userAgent(),
          cookie: account.webCookie
        },
        qs: { commentid: task.commentId, appid: 'yidian', _: Date.now() },
        json: true,
        timeout: 5000,
        proxy: proxy.addr
      })
    } catch (e) { return }

    if (json.code || json.status === 'failed') {
      // 点赞任务失败
      await api.mongo.db.collection('task').updateOne(
        { _id: task._id },
        {
          $set: { stage: -1, err: json.reason },
          $currentDate: { t: true }
        }
      )
    } else {
      await api.mongo.db.collection('account').updateOne(
        { _id: account._id },
        { $inc: { likeCount: 1 } }
      )

      await api.mongo.db.collection('task').updateOne(
        { _id: task._id },
        {
          $set: { stage: task.likeCount + 1 < task.targetLikeCount ? 1 : 2 },
          $inc: { likeCount: 1 },
          $push: { likeProxies: proxy._id, likeAccounts: account._id },
          $currentDate: { t: true }
        }
      )
    }
  }
}
