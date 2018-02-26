<template lang="pug">
.tasks
  Form(ref="addTask", :model="task", :rules="taskRules", inline, :label-width="65", label-position="left")
    FormItem(prop="articleId", label="文章 ID")
      Input(type="text", v-model="task.articleId", style="width: 100px")
    FormItem(prop="targetLikeCount", label="点赞数")
      InputNumber(v-model="task.targetLikeCount", :min="1", :max="80")
    FormItem(prop="comment", label="评论")
      Input(type="text", v-model="task.comment", style="width: 400px")
    Button(type="primary", @click="submit") 提交
  Table(:columns="columns", :data="tasks", border, size="small")
</template>

<script>
import axios from 'axios'

const STAGE = {
  0: ['评论中', 'blue'],
  1: ['点赞中', 'yellow'],
  2: ['完成', 'green'],
  '-1': ['失败', 'red']
}

export default {
  data () {
    return {
      task: {
        articleId: '',
        comment: '',
        targetLikeCount: 30
      },
      taskRules: {
        articleId: [
          { required: true, message: '文章 ID 不能为空', trigger: 'blur' }
        ],
        comment: [
          { required: true, message: '评论不能为空', trigger: 'blur' }
        ]
      },
      columns: [
        {
          title: '文章',
          render: (h, params) => {
            return h('a', {
              attrs: {
                href: `http://www.yidianzixun.com/article/${params.row.articleId}`,
                target: '_blank'
              }
            }, params.row.articleId)
          }
        },
        { title: '评论', key: 'comment' },
        {
          title: '点赞数',
          render: (h, params) => {
            return `${params.row.likeCount} / ${params.row.targetLikeCount}`
          }
        },
        {
          title: '状态',
          render: (h, params) => {
            return h('Tag', {
              props: {
                type: 'dot',
                color: STAGE[params.row.stage][1]
              }
            }, STAGE[params.row.stage][0])
          }
        },
        { title: '错误', key: 'err' }
      ],
      tasks: []
    }
  },
  created () {
    this.pollTasks()
  },
  methods: {
    submit () {
      this.$refs.addTask.validate(valid => {
        if (!valid) { return }

        axios.post('/api/addTask', {
          articleId: this.task.articleId,
          comment: this.task.comment,
          targetLikeCount: this.task.targetLikeCount
        }).then(() => {
          this.$Message.success('Success!')
          this.$refs.addTask.resetFields()
        }).catch(e => {
          this.$Message.error(e.message)
        })
      })
    },
    async pollTasks () {
      const { data } = await axios('/api/listTask')

      this.tasks = data.tasks

      setTimeout(this.pollTasks, 30 * 1000)
    }
  }
}
</script>

<style lang="stylus" scoped>
.tasks
  padding 10px
</style>
