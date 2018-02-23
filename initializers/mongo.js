'use strict'
const { Initializer, api } = require('actionhero')
const { MongoClient } = require('mongodb')

module.exports = class MongoInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'mongo'
    this.loadPriority = 101
    this.startPriority = 101
    this.stopPriority = 300
  }

  async initialize () {
    const { host, port, database }  = api.config.mongo

    api.mongo = {}
    api.mongo.client = await MongoClient.connect(`mongodb://${host}:${port}`)
    api.mongo.db = api.mongo.client.db(database)

    // 创建索引
    await api.mongo.db.collection('account').createIndex({ commentAt: 1 })
    await api.mongo.db.collection('account').createIndex({ likeAt: 1 })

    await api.mongo.db.collection('proxy').createIndex({ addr: 1 }, { unique: true })
    await api.mongo.db.collection('proxy').createIndex({ rank: 1 })
    await api.mongo.db.collection('proxy').createIndex({ t: 1 })
    await api.mongo.db.collection('proxy').createIndex({ usedAt: 1 })

    await api.mongo.db.collection('task').createIndex({ t: 1 })
  }

  // async start () {}

  async stop () {
    await api.mongo.client.close()
  }
}
