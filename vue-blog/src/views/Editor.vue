<template>
  <el-card class="blog-editor">
    <h3 class="blog-editor-title">标题</h3>
    <el-input ref="titleRef" v-model="title" class="blog-editor-input" size="large" placeholder="文章标题" />

    <h3 class="blog-editor-title">内容</h3>

    <div class="editor-wrapper">
      <!-- 工具栏容器 -->
      <div ref="toolbarRef" class="editor-toolbar"></div>
      <!-- 编辑器主体容器 -->
      <div ref="editorRef" style="height: 400px; overflow-y: hidden"></div>
    </div>

    <div class="blog-editor-tags">
      <h3 class="blog-editor-title">分类选择</h3>
      <el-radio-group v-model="column">
        <el-radio-button v-for="item in columns" :key="item.id" :label="item.id">
          {{ item.name }}
        </el-radio-button>
      </el-radio-group>
    </div>


    <div class="blog-editor-button">
      <el-button type="primary" @click="submitEditor" color="#2D2F33">提交</el-button>
      <el-button type="primary" @click="cancelEditor" color="#2D2F33" plain>重置</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, shallowRef, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
// import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { createEditor, createToolbar } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import http from '@/api/http'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import baseConfig from '@/config/base.config.js'
import bus from '@/util/bus'//全局bus总线

//创建 Store 实例
const userStore = useUserStore()
const router = useRouter()

// 数据响应式
const title = ref('')
const content = ref('')
const columns = ref([])
const column = ref('')
const titleRef = ref(null)


//定义容器 Ref 和编辑器实例 Ref
const toolbarRef = ref(null)
const editorRef = ref(null)
let editorInstance = null // 存储编辑器实例
let toolbarInstance = null // 存储工具栏实例

/* 
shallowRef只对 .value 这一层做响应式代理，不会递归把内部的嵌套对象 / 属性变成响应式，适合需要更新引用的场景。
markRaw：完全标记一个对象为「不可被响应式代理」，哪怕用 ref 包裹也不会被代理，适合完全不需要响应式的常量对象。
ref 包裹对象时，会递归遍历对象的所有嵌套属性，把每一层都用 Proxy 包装成响应式，无论修改多深的属性，都会触发视图更新

// ref 包裹对象
const user = ref({
  name: '张三',
  info: { age: 20 } // 嵌套对象也会被代理成响应式
})
  
// 这些修改都会触发视图更新
user.value.name = '李四'
user.value.info.age = 21
*/

// 工具栏配置
const toolbarConfig = {
  // 排除不需要的菜单
  excludeKeys: ['todo', 'quote', 'uploadVideo', 'insertVideo', 'video', 'group-video']
}

//编辑器配置 + 图片上传配置

const editorConfig = {
  placeholder: '请输入内容...',

  // 图片上传配置
  MENU_CONF: {
    uploadImage: {

      server: baseConfig['ARTICLE_UPLOAD_PATH'],

      // 对应旧版：ed.config.uploadImgMaxSize (20MB)
      maxFileSize: 20 * 1024 * 1024,
      // 对应旧版：ed.config.uploadImgAccept (新版用 MIME 类型)
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],

      //最多同时传5张
      maxNumberOfFiles: 5,
      fieldName: 'file',
      headers: {
        Authorization: `Bearer ${userStore.token}`
      },

      // 上传失败提示
      onFailed(file, res) {
        ElNotification.error({ title: '上传失败', message: res.message || '图片上传失败' })
      },
      // 上传错误提示
      onError(file, err) {
        console.error('图片上传错误', err)

        //判断错误类型，给出不同的提示
        let errorMsg = '图片上传出错'

        //判断是否是“文件大小超限”
        // err.message 或者 err.toString() 里会包含 "exceeds maximum allowed size"
        const errStr = err ? (err.message || err.toString()) : ''

        if (errStr.includes('exceeds maximum allowed size')) {
          errorMsg = '图片大小不能超过 20MB，请压缩后再上传'
        }
        //在这里扩展其他错误类型的判断
        else if (errStr.includes('timeout')) {
          errorMsg = '上传超时，请检查网络后重试'
        }

        ElNotification.error({
          title: '上传失败',
          message: errorMsg
        })
      }
    }
  },
  onChange: (editor) => {//监听内容变化，同步到 Vue 的 ref 变量
    content.value = editor.getHtml()
  }
}



// 挂载后初始化编辑器
onMounted(async () => {
   //先获取分类再初始化编辑器（避免分类加载阻塞编辑器）
  await getColumns()
  
  // 确保 DOM 渲染后，手动创建编辑器
  nextTick(() => {
    if (editorRef.value && toolbarRef.value) {
      // 创建编辑器
      editorInstance = createEditor({
        selector: editorRef.value,
        html: content.value, // 初始内容
        config: editorConfig,
        mode: 'default'
      })

      // 创建工具栏
      toolbarInstance = createToolbar({
        editor: editorInstance,
        selector: toolbarRef.value,
        config: toolbarConfig,
        mode: 'default'
      })
    }
    // 初始化时 focus 标题input
    titleRef.value?.focus()
  })
 

})

//组件销毁时 销毁编辑器 防止内存泄漏
onBeforeUnmount(() => {
  if (toolbarInstance) toolbarInstance.destroy()
  if (editorInstance) editorInstance.destroy()
})

//编辑器创建完成，保存实例
const handleEditorCreated = (editor) => {
  editorRef.value = editor
}

// 获取分类
const getColumns = async () => {
  try {
    const res = await http({ type: 'columns' })
    columns.value = res.list.map(item => ({
      id: item.id,
      name: item.name
    }))
    if (columns.value.length) {
      column.value = columns.value[0].id
    }
  } catch (err) {
    console.error(err)
  }
}

// 提交
const submitEditor = () => {
  if (!validateEditor()) return
  postEditorData()
}

// 重置 (需要手动调用 editorInstance.setHtml)
const cancelEditor = () => {
  title.value = ''
  content.value = '' // 不仅要清空变量
  if (editorInstance) {
    editorInstance.setHtml('') //要通过 API 清空编辑器内容
  }
  nextTick(() => {
    titleRef.value?.focus()
  })
}
// 验证
const validateEditor = () => {
  if (!title.value.trim()) {
    ElNotification.error({ title: '错误', message: '请填写标题' })
    // nextTick 确保 focus 触发时机正确
    nextTick(() => {
      titleRef.value?.focus()
    })
    return false
  }

  if (!content.value.trim()) {
    ElNotification.error({ title: '错误', message: '内容不能为空' })
    editorInstance?.focus() //手动调用 focus
    return false
  }

  return true
}

// 提交文章
const postEditorData = async () => {
  const postData = {
    title: title.value,
    content: content.value,
    column: column.value,
    cover: content.value.match(/<img src="([^"']*)"/)?.[1] || undefined
  }

  try {
    await http({
      type: 'postArticle',
      data: JSON.parse(JSON.stringify(postData))
    })

    ElNotification.success({ title: '成功', message: '文章提交成功' })
    // 发射事件（和vue2 $emit 一样）
    bus.emit('updateArticles')//重新获取文章
    // window.location.href = '/index'//跳转主页并刷新文章
    router.push('/index')
  } catch (err) {
    ElNotification.error({ title: '错误', message: '提交失败' })
  }
}
</script>

<style lang="stylus">
/* 编辑器容器样式 */
.editor-wrapper
  border 1px solid #ccc
  z-index 100

.el-input__wrapper.is-focus
  box-shadow 0 0 0 1px #333 inset
.blog-editor-title
  padding 12px 0
  font-size 16px
.el-input--large.blog-editor-input
  font-size 18px
  line-height 38px
  height 38px
.blog-editor-tags
  margin 20px 0
  
  & .el-tag+.el-tag
    margin-left 12px
.el-radio-button .el-radio-button__inner
  color #777
  box-shadow none
.el-radio-button:hover .el-radio-button__inner
  color #222
.el-radio-button__original-radio:checked+.el-radio-button__inner
    background-color #333
    border-right 1px solid #999
    border-top 1px solid #999
    border-bottom 1px solid #999
    color #fff
    box-shadow none
.blog-editor-button
  padding-top 20px
  display flex
  justify-content space-around
  & button:nth-child(1)
    margin-right 6px
  & button
    flex 1
    line-height 22px
    font-size 15px
  
</style>