<template lang="pug">
#app
  Row(type="flex")
    Col(span="6")
      Status
    Col(span="18")
      Tasks
</template>

<script>
import Status from '@/components/Status'
import Tasks from '@/components/Tasks'

export default {
  components: { Status, Tasks }
}
</script>

<style lang="stylus" scoped>
#app
  padding 20px 0
</style>
