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
  }

  // async start () {}

  async stop () {
    await api.mongo.client.close()
  }
}
