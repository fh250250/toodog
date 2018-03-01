const { Action, api } = require('actionhero')
const { ObjectId } = require('mongodb')

exports.addTask = class addTask extends Action {
  constructor () {
    super()
    this.name = 'addTask'
    this.description = 'add a task'
    this.inputs = {
      articleId: { required: true },
      comment: { required: true },
      targetLikeCount: { required: true, formatter: param => parseInt(param) }
    }
  }

  async run ({ params }) {
    await api.mongo.db.collection('task').insertOne({
      articleId: params.articleId,
      comment: params.comment,
      commentId: null,
      commentAccountId: null,
      targetLikeCount: params.targetLikeCount,
      likeCount: 0,
      likeProxies: [],
      likeAccounts: [],
      stage: 0,
      t: new Date(),
      err: null
    })
  }
}

exports.listTask = class listTask extends Action {
  constructor () {
    super()
    this.name = 'listTask'
    this.description = 'get task list'
    this.inputs = {
      stageFilter: { required: false, default: () => [] },
      pageSize: { required: false, default: () => 10 },
      page: { required: false, default: () => 1 }
    }
  }

  async run ({ params, response }) {
    const col = api.mongo.db.collection('task')
    const query = {}

    if (params.stageFilter.length) {
      query.stage = { $in: params.stageFilter }
    }

    response.tasks = await col.find(query).limit(params.pageSize)
                                          .skip(params.pageSize * (params.page - 1))
                                          .sort('t', -1)
                                          .toArray()
    response.total = await col.count(query)
    response.pageSize = params.pageSize
  }
}

exports.retryTask = class retryTask extends Action {
  constructor () {
    super()
    this.name = 'retryTask'
    this.description = 'retry the task'
    this.inputs = {
      taskId: { required: true }
    }
  }

  async run ({ params }) {
    const col = api.mongo.db.collection('task')
    const task = await col.findOne({ _id: ObjectId(params.taskId) })

    if (!task) { return }

    if (task.stage === -1) {
      await col.updateOne(
        { _id: task._id },
        { $set: { stage: 0, err: null } }
      )
    } else if (task.stage === -2) {
      await col.updateOne(
        { _id: task._id },
        { $set: { stage: 1, err: null } }
      )
    }
  }
}
