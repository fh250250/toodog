'use strict'
const { Initializer, api } = require('actionhero')
const request = require('request-promise-native')
const faker = require('faker')

const errorMap = {
  1001: '参数token不能为空',
  1002: '参数action不能为空',
  1003: '参数action错误',
  1004: 'token失效',
  1005: '用户名或密码错误',
  1006: '用户名不能为空',
  1007: '密码不能为空',
  1008: '账户余额不足',
  1009: '账户被禁用',
  1010: '参数错误',
  1011: '账户待审核',
  1012: '登录数达到上限',
  2001: '参数itemid不能为空',
  2002: '项目不存在',
  2003: '项目未启用',
  2004: '暂时没有可用的号码',
  2005: '获取号码数量已达到上限',
  2006: '参数mobile不能为空',
  2007: '号码已被释放',
  2008: '号码已离线',
  2009: '发送内容不能为空',
  2010: '号码正在使用中',
  3001: '尚未收到短信',
  3002: '等待发送',
  3003: '正在发送',
  3004: '发送失败',
  3005: '订单不存在',
  3006: '专属通道不存在',
  3007: '专属通道未启用',
  3008: '专属通道密码与项目不匹配',
  9001: '系统错误',
  9002: '系统异常',
  9003: '系统繁忙',
}

module.exports = class AccountInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'account'
  }

  async initialize () {
    api.account = {}

    api.account.register = async () => {
      const deviceid = faker.random.alphaNumeric(15)
      const proxy = await api.proxy.findOne()
      let code = null

      if (!proxy) { throw new Error('没有足够的代理') }

      const mobile = await getMobile()

      // 在没有收到短信之前有异常，需要释放号码
      try {
        await sendCode(mobile, deviceid, proxy)
        code = await waitForCode(mobile)
      } catch (e) {
        await releaseMobile(mobile)
        throw e
      }

      const account = await register(mobile, code, deviceid, proxy)
      await api.mongo.db.collection('account').insertOne(account)
    }

    api.account.login = async (username, password) => {
      const proxy = await api.proxy.findOne()

      if (!proxy) { throw new Error('没有足够的代理') }

      const res = await request({
        url: 'http://www.yidianzixun.com/mp_sign_in',
        method: 'post',
        headers: { 'user-agent': faker.internet.userAgent() },
        proxy: proxy.addr,
        timeout: 5000,
        form: { username, password },
        json: true,
        resolveWithFullResponse: true
      })

      const json = res.body

      if (json.code) { throw new Error(json.reason) }
      if (!json.userid) { throw new Error('登陆失败，无用户数据') }

      const account = await api.mongo.db.collection('account').findOne({ username })

      if (account) {
        await api.mongo.db.collection('account').updateOne(
          { _id: account._id },
          {
            $set: {
              cookie: json.cookie,
              webCookie: res.headers['set-cookie'].join(';')
            }
          }
        )
      } else {
        await api.mongo.db.collection('account').insertOne({
          userid: json.userid,
          username: json.username,
          nickname: json.nickname,
          cookie: json.cookie,
          webCookie: res.headers['set-cookie'].join(';'),
          password,
          commentCount: 0,
          likeCount: 0,
          commentAt: new Date(),
          likeAt: new Date()
        })
      }
    }
  }

  // async start () {}
  // async stop () {}
}

function requestSMS (action, args = {}) {
  return request({
    url: 'http://api.fxhyd.cn/UserInterface.aspx',
    qs: {
      action,
      token: api.config.sms.token,
      itemid: api.config.sms.itemid,
      ...args
    }
  }).then(body => {
    if (/^success/.test(body)) {
      return body.split('|')
    } else {
      throw new Error(errorMap[body] || '未知错误')
    }
  })
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getMobile () {
  return requestSMS('getmobile').then(data => data[1])
}

function releaseMobile (mobile) {
  return requestSMS('release', { mobile }).catch(() => {})
}

async function sendCode (mobile, deviceid, proxy) {
  const json = await request({
    url: 'http://www.yidianzixun.com/home/q/mobile_verify',
    headers: { 'user-agent': faker.internet.userAgent() },
    qs: {
      mobile: `86${mobile}`,
      appid: 'yidian',
      deviceid
    },
    timeout: 5000,
    proxy: proxy.addr,
    json: true
  })

  if (json.code) { throw new Error(json.reason) }
}

async function waitForCode (mobile) {
  let tryTimes = 0

  while (tryTimes++ < 12) {
    try {
      const data = await requestSMS('getsms', { mobile, release: 1 })

      return data[1].match(/\d{4,}/)[0]
    } catch (e) {
      if (e.message !== errorMap[3001]) { throw e }
    }

    await delay(5000)
  }

  throw new Error('1 分钟内未收到短信')
}

async function register (mobile, code, deviceid, proxy) {
  const password = faker.random.alphaNumeric(8)

  const res = await request({
    url: 'http://www.yidianzixun.com/home/q/mobile_sign_in',
    headers: { 'user-agent': faker.internet.userAgent() },
    qs: {
      mobile: `86${mobile}`,
      password,
      code,
      appid: 'yidian',
      deviceid,
      _: Date.now()
    },
    proxy: proxy.addr,
    timeout: 5000,
    json: true,
    resolveWithFullResponse: true
  })

  const json = res.body

  if (json.code) { throw new Error(json.reason) }
  if (!json.userid) { throw new Error('注册失败，无用户数据') }

  return {
    userid: json.userid,
    username: json.username,
    nickname: json.nickname,
    cookie: json.cookie,
    webCookie: res.headers['set-cookie'].join(';'),
    password,
    commentCount: 0,
    likeCount: 0,
    commentAt: new Date(),
    likeAt: new Date()
  }
}
