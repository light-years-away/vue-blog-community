<!--
 * @Author: 
 * @Date: 2026-03-18 17:21:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-22 19:27:39
 * @Description: 
 * @FilePath: \vue-blog\src\components\comment\CommentTextArea.vue
-->
<template>
  <!-- 滚动锚点 -->
  <div ref="scrollAnchor"></div>
  <el-card>
    <div class="blog-comment blog-comment--editor">
      <textarea ref="textarea" class="blog-comment--input" v-model="commentVal" name="comment" autofocus
        placeholder="写下你的评论..."></textarea>
      <el-button type="primary" :loading="submitting" @click="submitComment" color="#2D2F33">提交</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, inject, defineProps, defineOptions, computed, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import http from '@/api/http'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import bus from '@/util/bus'

//创建 Store 实例
const userStore = useUserStore()
userStore.getUserInfo
//定义 props
const props = defineProps({
  aid: {
    type: String,
    required: true
  }
})
const textarea = ref(null)
const scrollAnchor = ref(null) // 滚动锚点

//inject注入父组件提供的方法
const getArticleById = inject('getArticleById')

const commentVal = ref('')
const submitting = ref(false)

//提交评论
const submitComment = async () => {
  if (!commentVal.value.trim()) {
    ElNotification.warning({
      title: '提示',
      message: '评论内容不能为空'
    })
    focusTextarea()
    return
  }

  submitting.value = true
  try {
    // 检查登录状态
    if (!userStore.token) {
      ElNotification.error({
        title: '评论失败',
        message: '请登录后再评论',
      })
      return
    }

    // 确保用户信息已加载
    if (!userStore.userInfo?.uid) {
      await userStore.getUserInfo()
    }

    // console.log(userStore.userInfo)
    await http({
      type: 'postComment',
      data: {
        aid: props.aid,
        content: commentVal.value,
        uid: userStore.userInfo._id
      }
    })

    ElNotification.success({
      title: '评论成功',
      message: '您的评论已发布'
    })

    // 清空输入框
    commentVal.value = ''

    //调用inject注入的方法 刷新文章（刷新评论列表）
    if (getArticleById) {
      await getArticleById()
    }
  } catch (err) {
    console.log(err)
    ElNotification.error({
      title: '评论失败',
      message: err.message || '请稍后重试'
    })
  } finally {//无论成功还是失败 最终都会执行这里
    submitting.value = false
  }


}


//平滑滚动 + 聚焦方法
const focusTextarea = () => {
  if (!scrollAnchor.value) return

   //平滑滚动到评论框
  scrollAnchor.value.scrollIntoView({
    behavior: 'smooth',    // 平滑动画
    block: 'start',        // 顶部对齐
  })

  //滚动结束后再聚焦
  setTimeout(() => {
    textarea.value?.focus()
  }, 300) // 跟滚动动画时间匹配
}


onMounted(() => {
  //组件挂载时监听事件
  bus.on('focusTextarea', focusTextarea)
})


onUnmounted(() => {
  //卸载时移除监听（必须 防止内存泄漏）
  bus.off('focusTextarea', focusTextarea)
})
</script>

<style lang="stylus">
.blog-comment--input
  border-radius 12px
  transition all 0.4s ease
  border 1px solid #eee
  box-shadow 0 0 0 1px rgba(0, 0, 0, 0.1)
  outline  none !important
  &:focus
    // border-color #333
    box-shadow 0 0 0 2px rgba(0, 0, 0, 0.6)
</style>