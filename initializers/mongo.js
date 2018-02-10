'use strict'
const { Initializer, api } = require('actionhero')
const { MongoClient } = require('mongodb')

module.exports = class MyInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'mongo'
    this.loadPriority = 101
    this.startPriority = 101
    this.stopPriority = 300
  }

  async initialize () {
    api['mongo'] = {
      client: null,
      db: null
    }
  }

  async start () {
    const { host, port, database }  = api.config.mongo

    api.mongo.client = await MongoClient.connect(`mongodb://${host}:${port}`)
    api.mongo.db = api.mongo.client.db(database)
  }

  async stop () {
    await api.mongo.client.close()
  }
}
