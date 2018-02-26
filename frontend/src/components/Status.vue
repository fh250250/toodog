<template lang="pug">
.status
  Card(class="proxy")
    p(slot="title") 代理
    ul
      li
        span 可用 {{ proxy.count }}
      li
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

      setTimeout(this.pollProxyStatus, 10 * 1000)
    }
  }
}
</script>

<style lang="stylus" scoped>
.status
  padding 0 20px
</style>
