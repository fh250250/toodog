'use strict'
const { Task, api } = require('actionhero')

module.exports = class ProxyTask extends Task {
  constructor () {
    super()
    this.name = 'proxy'
    this.description = 'run proxy check or crawl'
    this.frequency = 10000
  }

  async run (data) {
    const col = api.mongo.db.collection('proxy')
    const total = await col.count()
    const count = await col.find({ rank: { $gte: 20 } }).count()

    if (total < 500 || count / total > 0.2) {
      await api.proxy.crawl()
    }

    await api.proxy.check()
  }
}
