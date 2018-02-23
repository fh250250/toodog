<template lang="pug">
#app
  Row(type="flex")
    Col(span="8")
      Status
    Col(span="16")
      Tasks
</template>

<script>
import Status from '@/components/Status'
import Tasks from '@/components/Tasks'

export default {
  components: { Status, Tasks }
}
</script>
