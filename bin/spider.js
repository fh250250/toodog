'use strict'
const { CLI, api } = require('actionhero')

module.exports = class SpiderCLICommand extends CLI {
  constructor () {
    super()
    this.name = 'spider'
    this.description = 'run a spider'
    this.example = 'actionhero spider --name=NAME'
    this.inputs = {
      name: {
        required: true,
        note: 'the name for the spider'
      }
    }
  }

  async run ({ params }) {
    const spider = api.proxy.SPIDERS.find(s => s.name === params.name)

    if (spider) {
      await api.proxy.runSpider(spider, console.log)
    } else {
      api.log(`There is no spider named: ${params.name}`)
    }

    return true
  }
}
