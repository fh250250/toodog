'use strict'
const { Initializer, api } = require('actionhero')
const request = require('request-promise-native')
const faker = require('faker')
const cheerio = require('cheerio')
const { ObjectId } = require('mongodb')

// 爬虫定义
const SPIDERS = [
  {
    name: 'www.data5u.com',
    urls: [
      'http://www.data5u.com/',
      'http://www.data5u.com/free/index.shtml',
      'http://www.data5u.com/free/gngn/index.shtml',
      'http://www.data5u.com/free/gnpt/index.shtml',
      'http://www.data5u.com/free/gwgn/index.shtml',
      'http://www.data5u.com/free/gwpt/index.shtml',
    ],
    parse ($, html) {
      const proxies = []

      $('ul.l2').each((_, ele) => {
        const $lis = $(ele).find('li')
        const addr = $lis.eq(0).text()
        const port = $lis.eq(1).text()
        const protocol = $lis.eq(3).text()

        if (/http/i.test(protocol)) { proxies.push(`http://${addr}:${port}`) }
        if (/https/i.test(protocol)) { proxies.push(`https://${addr}:${port}`) }
      })

      return proxies
    }
  },
  {
    name: 'www.66ip.cn',
    urls: [
      'http://www.66ip.cn/mo.php?tqsl=100',
    ],
    parse ($, html) {
      const proxies = html.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/g)

      if (!proxies) { return [] }

      return proxies.map(p => `http://${p}`)
    }
  },
  {
    name: 'www.xdaili.cn',
    urls: [
      'http://www.xdaili.cn/ipagent//freeip/getFreeIps',
    ],
    parse ($, html) {
      const proxies = []

      JSON.parse(html).RESULT.rows.forEach(p => {
        if (/http/i.test(p.type)) { proxies.push(`http://${p.ip}:${p.port}`) }
        if (/https/i.test(p.type)) { proxies.push(`https://${p.ip}:${p.port}`) }
      })

      return proxies
    }
  },
  {
    name: 'www.xicidaili.com',
    urls: [
      'http://www.xicidaili.com/nn/',
      'http://www.xicidaili.com/nt/',
      'http://www.xicidaili.com/wn/',
      'http://www.xicidaili.com/wt/',
    ],
    parse ($, html) {
      const proxies = []

      $('#ip_list tr').each((_, ele) => {
        const $tds = $(ele).find('td')
        const addr = $tds.eq(1).text()
        const port = $tds.eq(2).text()
        const protocol = $tds.eq(5).text()

        if (/http/i.test(protocol)) { proxies.push(`http://${addr}:${port}`) }
        if (/https/i.test(protocol)) { proxies.push(`https://${addr}:${port}`) }
      })

      return proxies
    }
  }
]

module.exports = class ProxyInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'proxy'
  }

  async initialize () {
    const col = api.mongo.db.collection('proxy')

    // 创建索引
    await col.createIndex({ addr: 1 }, { unique: true })
    await col.createIndex({ rank: 1 })
    await col.createIndex({ t: 1 })

    api.proxy = {}
    api.proxy.SPIDERS = SPIDERS

    // 执行一个爬虫
    api.proxy.runSpider = async (spider, tracer = false) => {
      for (const url of spider.urls) {
        try {
          // 下载页面
          const html = await request({
            url,
            headers: { 'User-Agent': faker.internet.userAgent() },
            timeout: 5000
          })

          // 解析
          const rawProxies = spider.parse(cheerio.load(html), html)

          // 调试打印
          if (tracer) { tracer(rawProxies) }

          // 规范化数据
          const proxies = rawProxies.map(p => p.trim())
                                    .filter(p => /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/.test(p))
                                    .map(p => ({
                                      addr: p,
                                      rank: 10,
                                      comboSuccess: 0,
                                      comboFailure: 0,
                                      t: new Date()
                                    }))

          // 写入数据库
          await col.insertMany(proxies, { ordered: false })
        } catch (e) {
          // Eat all exceptions
        }
      }
    }

    // 抓取
    api.proxy.crawl = async () => {
      await Promise.all(SPIDERS.map(s => api.proxy.runSpider(s)))
    }

    // 验证
    api.proxy.check = async () => {
      // 取最早的 100 个来更新
      const proxies = await col.find({}).sort('t', 1).limit(100).toArray()

      await Promise.all(proxies.map(async p => {
        if (await ping(p)) {
          // 能 ping 通
          p.comboSuccess += 1
          p.comboFailure = 0
          p.rank += p.comboSuccess
        } else {
          // 不能，衰减 rank
          p.comboSuccess = 0
          p.comboFailure += 1
          p.rank -= Math.pow(2, p.comboFailure)
        }

        // 限制最大 rank 值
        if (p.rank > 100) { p.rank = 100 }

        if (p.rank <= 0) {
          // 删除
          await col.deleteOne({ _id: ObjectId(p._id) })
        } else {
          // 更新
          await col.updateOne(
            { _id: ObjectId(p._id) },
            {
              $set: {
                comboSuccess: p.comboSuccess,
                comboFailure: p.comboFailure,
                rank: p.rank
              },
              $currentDate: {
                t: true
              }
            }
          )
        }
      }))
    }
  }

  // async start () {}
  // async stop () {}
}

function ping (proxy) {
  return request({
    url: 'http://httpbin.org/ip',
    timeout: 5000,
    proxy: proxy.addr,
    resolveWithFullResponse: true
  })
  .then(response => response.statusCode === 200)
  .catch(() => false)
}