webpackJsonp([1],{"+skl":function(t,e){},Knom:function(t,e){},NHnr:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=a("/5sW"),s=a("Xxa5"),n=a.n(s),i=a("exGp"),o=a.n(i),l=a("mtWM"),c=a.n(l),u={data:function(){return{proxy:{count:0,total:0}}},created:function(){this.pollProxyStatus()},methods:{pollProxyStatus:function(){var t=this;return o()(n.a.mark(function e(){var a,r;return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,c()("/api/proxyStatus");case 2:a=e.sent,r=a.data,t.proxy.count=r.count,t.proxy.total=r.total,setTimeout(t.pollProxyStatus,1e4);case 7:case"end":return e.stop()}},e,t)}))()}}},p={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"status"},[e("Card",{staticClass:"proxy"},[e("p",{attrs:{slot:"title"},slot:"title"},[this._v("代理")]),e("ul",[e("li",[e("span",[this._v("可用 "+this._s(this.proxy.count))])]),e("li",[e("span",[this._v("总共 "+this._s(this.proxy.total))])])])])],1)},staticRenderFns:[]};var d={0:["评论中","blue"],1:["点赞中","yellow"],2:["完成","green"],"-1":["评论失败","red"],"-2":["点赞失败","red"]},f={data:function(){var t=this;return{task:{articleId:"",comment:"",targetLikeCount:30},taskRules:{articleId:[{required:!0,message:"文章 ID 不能为空",trigger:"blur"}],comment:[{required:!0,message:"评论不能为空",trigger:"blur"}]},columns:[{title:"文章",width:100,render:function(t,e){return t("a",{attrs:{href:"http://www.yidianzixun.com/article/"+e.row.articleId,target:"_blank"}},e.row.articleId)}},{title:"评论",key:"comment",ellipsis:!0},{title:"点赞数",width:100,render:function(t,e){return e.row.likeCount+" / "+e.row.targetLikeCount}},{title:"状态",width:120,filters:[{label:d[0][0],value:0},{label:d[1][0],value:1},{label:d[2][0],value:2},{label:d[-1][0],value:-1},{label:d[-2][0],value:-2}],filterRemote:function(e){t.stageFilter=e,t.page=1,t.refresh()},render:function(t,e){return t("Tag",{props:{color:d[e.row.stage][1]}},d[e.row.stage][0])}},{title:"错误",key:"err",ellipsis:!0,width:200},{title:"操作",width:150,render:function(e,a){if(!(a.row.stage>=0))return e("div",[e("Button",{props:{type:"primary",size:"small"},style:{marginRight:"5px"},on:{click:function(){return t.retry(a.row._id)}}},"重试"),e("Button",{props:{type:"error",size:"small"},on:{click:function(){return t.removeTask(a.row._id)}}},"删除")])}}],tasks:[],stageFilter:[],total:0,pageSize:20,page:1,loading:!1}},created:function(){this.pollTasks()},methods:{submit:function(){var t=this;this.$refs.addTask.validate(function(e){e&&c.a.post("/api/addTask",{articleId:t.task.articleId,comment:t.task.comment,targetLikeCount:t.task.targetLikeCount}).then(function(){t.$Message.success("Success!"),t.$refs.addTask.resetFields()}).catch(function(e){t.$Message.error(e.message)})})},pollTasks:function(){var t=this;return o()(n.a.mark(function e(){return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.refresh();case 2:setTimeout(t.pollTasks,3e4);case 3:case"end":return e.stop()}},e,t)}))()},refresh:function(){var t=this;return o()(n.a.mark(function e(){var a,r;return n.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t.loading=!0,e.next=3,c.a.post("/api/listTask",{stageFilter:t.stageFilter,pageSize:t.pageSize,page:t.page});case 3:a=e.sent,r=a.data,t.tasks=r.tasks,t.total=r.total,t.loading=!1;case 8:case"end":return e.stop()}},e,t)}))()},retry:function(t){var e=this;return o()(n.a.mark(function a(){return n.a.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,c.a.post("/api/retryTask",{taskId:t});case 2:return a.next=4,e.refresh();case 4:case"end":return a.stop()}},a,e)}))()},removeTask:function(t){var e=this;return o()(n.a.mark(function a(){return n.a.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,c.a.post("/api/removeTask",{taskId:t});case 2:return a.next=4,e.refresh();case 4:case"end":return a.stop()}},a,e)}))()},changePage:function(t){this.page=t,this.refresh()},changePageSize:function(t){this.pageSize=t,this.page=1,this.refresh()}}},m={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"tasks"},[a("Form",{ref:"addTask",attrs:{model:t.task,rules:t.taskRules,inline:"inline","label-width":65,"label-position":"left"}},[a("FormItem",{attrs:{prop:"articleId",label:"文章 ID"}},[a("Input",{staticStyle:{width:"100px"},attrs:{type:"text"},model:{value:t.task.articleId,callback:function(e){t.$set(t.task,"articleId",e)},expression:"task.articleId"}})],1),a("FormItem",{attrs:{prop:"targetLikeCount",label:"点赞数"}},[a("InputNumber",{attrs:{min:1,max:200},model:{value:t.task.targetLikeCount,callback:function(e){t.$set(t.task,"targetLikeCount",e)},expression:"task.targetLikeCount"}})],1),a("FormItem",{attrs:{prop:"comment",label:"评论"}},[a("Input",{staticStyle:{width:"400px"},attrs:{type:"text"},model:{value:t.task.comment,callback:function(e){t.$set(t.task,"comment",e)},expression:"task.comment"}})],1),a("Button",{attrs:{type:"primary"},on:{click:t.submit}},[t._v("提交")])],1),a("Table",{attrs:{columns:t.columns,data:t.tasks,border:"border",size:"small",loading:t.loading}}),a("Page",{attrs:{styles:{marginTop:"10px"},total:t.total,"page-size":t.pageSize,current:t.page,"show-elevator":"show-elevator","show-sizer":"show-sizer",placement:"top"},on:{"on-change":t.changePage,"on-page-size-change":t.changePageSize}})],1)},staticRenderFns:[]};var h={components:{Status:a("VU/8")(u,p,!1,function(t){a("Knom")},"data-v-0b4f8ca1",null).exports,Tasks:a("VU/8")(f,m,!1,function(t){a("vHt/")},"data-v-667c7d66",null).exports}},k={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"app"}},[e("Row",{attrs:{type:"flex"}},[e("Col",{attrs:{span:"6"}},[e("Status")],1),e("Col",{attrs:{span:"18"}},[e("Tasks")],1)],1)],1)},staticRenderFns:[]};var g=a("VU/8")(h,k,!1,function(t){a("QeZj")},"data-v-1c1b3a5f",null).exports,v=a("BTaQ"),x=a.n(v);a("+skl");r.default.config.productionTip=!1,r.default.use(x.a),new r.default({el:"#app",render:function(t){return t(g)}})},QeZj:function(t,e){},"vHt/":function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.bd4a3d1b5ef16c77cbd5.js.map