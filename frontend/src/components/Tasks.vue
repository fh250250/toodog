<template lang="pug">
.tasks
  Form(ref="addTask", :model="task", :rules="taskRules", inline, :label-width="65", label-position="left")
    FormItem(prop="articleId", label="文章 ID")
      Input(type="text", v-model="task.articleId", style="width: 100px")
    FormItem(prop="targetLikeCount", label="点赞数")
      InputNumber(v-model="task.targetLikeCount", :min="1", :max="200")
    FormItem(prop="comment", label="评论")
      Input(type="text", v-model="task.comment", style="width: 400px")
    Button(type="primary", @click="submit") 提交
  Table(:columns="columns", :data="tasks", border, size="small", :loading="loading")
  Page(:styles="{ marginTop: '10px' }", :total="total", :page-size="pageSize", :current="page", @on-change="changePage", @on-page-size-change="changePageSize", show-elevator, show-sizer, placement="top")
</template>

<script>
import axios from 'axios'

const STAGE = {
  0: ['评论中', 'blue'],
  1: ['点赞中', 'yellow'],
  2: ['完成', 'green'],
  '-1': ['评论失败', 'red'],
  '-2': ['点赞失败', 'red']
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
          width: 100,
          render: (h, params) => {
            return h('a', {
              attrs: {
                href: `http://www.yidianzixun.com/article/${params.row.articleId}`,
                target: '_blank'
              }
            }, params.row.articleId)
          }
        },
        { title: '评论', key: 'comment', ellipsis: true },
        {
          title: '点赞数',
          width: 100,
          render: (h, params) => {
            return `${params.row.likeCount} / ${params.row.targetLikeCount}`
          }
        },
        {
          title: '状态',
          width: 150,
          filters: [
            { label: STAGE[0][0], value: 0 },
            { label: STAGE[1][0], value: 1 },
            { label: STAGE[2][0], value: 2 },
            { label: STAGE['-1'][0], value: -1 },
            { label: STAGE['-2'][0], value: -2 }
          ],
          filterRemote: value => {
            this.stageFilter = value
            this.page = 1
            this.refresh()
          },
          render: (h, params) => {
            const children = [
              h('Tag', {
                props: {
                  color: STAGE[params.row.stage][1]
                }
              }, STAGE[params.row.stage][0])
            ]

            if (params.row.stage < 0) {
              children.push(h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => this.retry(params.row._id)
                }
              }, '重试'))
            }

            return h('div', children)
          }
        },
        { title: '错误', key: 'err', ellipsis: true, width: 200 }
      ],
      tasks: [],
      stageFilter: [],
      total: 0,
      pageSize: 20,
      page: 1,
      loading: false
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
      await this.refresh()
      setTimeout(this.pollTasks, 30 * 1000)
    },
    async refresh () {
      this.loading = true
      const { data } = await axios.post('/api/listTask', {
        stageFilter: this.stageFilter,
        pageSize: this.pageSize,
        page: this.page
      })

      this.tasks = data.tasks
      this.total = data.total
      this.loading = false
    },
    async retry (taskId) {
      await axios.post('/api/retryTask', { taskId })
      await this.refresh()
    },
    changePage (page) {
      this.page = page
      this.refresh()
    },
    changePageSize (pageSize) {
      this.pageSize = pageSize
      this.page = 1
      this.refresh()
    }
  }
}
</script>

<style lang="stylus" scoped>
.tasks
  padding 10px
</style>
