'use strict'
const { CLI, api } = require('actionhero')
const fs = require('fs')
const path = require('path')
const os = require('os')
const _ = require('lodash')

module.exports = class AccountImportCLICommand extends CLI {
  constructor () {
    super()
    this.name = 'account import'
    this.description = 'import accounts and refresh'
    this.example = 'actionhero account import --file=NAME'
    this.inputs = {
      file: {
        required: true,
        note: 'the import file path'
      }
    }
  }

  async run ({ params }) {
    const filePath = path.resolve(params.file)

    if (!fs.existsSync(filePath)) {
      api.log('file not exists')
      return true
    }

    const accounts = fs.readFileSync(filePath, { encoding: 'utf-8' })
                      .split(os.EOL)
                      .filter(line => line)
                      .map(line => {
                        const [username, password] = line.split(',')

                        return { username, password }
                      })

    for (const { username, password } of _.uniqBy(accounts, 'username')) {
      try {
        await api.account.login(username, password)
        console.log(`[成功] ${username}, ${password}`)
      } catch (e) {
        console.log(`[失败] ${username}, ${password} ${e.message}`)
      }
    }

    return true
  }
}
