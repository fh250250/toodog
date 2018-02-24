const { Action, api } = require('actionhero')

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
