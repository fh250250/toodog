<template lang="pug">
.status
  .proxy
    span 代理
    span 可用 {{ proxy.count }}
    span 总共 {{ proxy.total }}
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      proxy: { count: 0, total: 0 }
    }
  },

  created () {
    this.pollProxyStatus()
  },

  methods: {
    async pollProxyStatus () {
      const { data } = await axios('/api/proxyStatus')

      this.proxy.count = data.count
      this.proxy.total = data.total

      setTimeout(this.pollProxyStatus, 5000)
    }
  }
}
</script>

<style lang="stylus" scoped>
.status
  padding 10px
  .proxy
    font-size 20px
    span:not(:last-child)
      margin-right 20px
</style>
