'use strict'
const { Action, api } = require('actionhero')

exports.CreateChatRoom = class CreateChatRoom extends Action {
  constructor () {
    super()
    this.name = 'createChatRoom'
    this.description = 'I will create a chatroom with the given name'
    this.inputs = {
      name: {
        required: true
      }
    }
  }

  async run ({params, response}) {
    const {chatRoom} = api
    response.didCreate = await chatRoom.add(params.name)
  }
}

exports.Test = class TestAction extends Action {
  constructor () {
    super()
    this.name = 'test'
    this.description = 'just for test'
    this.inputs = {}
  }

  async run ({ response }) {
    await api.account.register()
    response.ok = true
  }
}
