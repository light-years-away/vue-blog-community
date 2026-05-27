<!--
 * @Author: 
 * @Date: 2026-04-01 21:34:17
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-03 13:37:20
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\comment\CommentTextArea.vue
-->
<template>
  <div class="blog-m-comment-bar" safe-area-inset-bottom>

    <div class="blog-m-comment-bar-inner">
      <!-- 收藏图标 (失焦状态显示) -->
      <div class="blog-m-comment-bar-like" v-show="!isFocused">
        <van-icon name="star-o" size="22" color="#FFF" class="collect-icon" :class="{ 'is-active': isCollected }"
          @click="handleCollect" />
      </div>

      <!-- 输入框 -->
      <van-field v-model="commentContent" type="textarea" placeholder="发条评论，和大家一起讨论"
        :autosize="{ minHeight: 20, maxHeight: 100 }" maxlength="300" :show-word-limit="isFocused"
        class="blog-m-comment-input" rows="1" @focus="isFocused = true" @blur="handleBlur" />

      <!--发送按钮 (评论框聚焦时显示) -->
      <div class="blog-m-comment-bar-submit" v-show="isFocused" @click="submitComment"
        :class="{ 'is-active': commentContent.trim() }">
        发送
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { showToast } from 'vant'
import http from '@/api/http'
const commentContent = ref('')
const isCollected = ref(false)
const isFocused = ref(false)
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import bus from '@/util/bus'

//创建 Store 实例
const userStore = useUserStore()
//定义 props
const props = defineProps({
  aid: {
    type: String,
    required: true
  }
})
//inject注入父组件提供的方法
const getArticleById = inject('getArticleById')
// 提交评论
const submitComment = async () => {
  const content = commentContent.value.trim()
  if (!content) {
    return showToast('请输入评论内容')
  }

  try {
    //检查登录状态
    if (!userStore.token) {
      bus.emit('dialog-show','login')
      showToast('请登录后再评论')
      //发射事件（和vue2 $emit 一样）
      return
    }

    //确保用户信息已加载
    if (!userStore.userInfo?.uid) {
      await userStore.getUserInfo()
    }

    await http({
      type: 'postComment',
      data: {
        aid: props.aid,
        content: commentContent.value,
        uid: userStore.userInfo._id
      }
    })

    showToast('评论发布成功')

    // 清空输入框
    commentContent.value = ''

    //调用inject注入的方法 刷新文章（刷新评论列表）
    if (getArticleById) {
      await getArticleById()
    }
  } catch (err) {
    console.log(err)
    showToast('评论发布失败,' + (err.message || '请稍后重试'))
  }
}

// 处理收藏
const handleCollect = () => {
  isCollected.value = !isCollected.value
  const tipText = isCollected.value ? '收藏成功' : '已取消收藏'
  showToast(tipText)
  console.log(isCollected.value ? '执行收藏' : '执行取消收藏')
}

//处理失焦（加个延时，让点击发送按钮时能先触发点击事件再隐藏）
const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 300)
}
</script>

<style lang="stylus" scoped>
$bar-bg = #2D2F33
$input-bg = #F5F5F5
$text-main = #333333
$text-placeholder = #999999
$text-gray = #666666
$border-color = #EEEEEE
$active-color = #FFB800
$pink = #fe2c55  //粉色
$btn-gray = #cccccc  // 禁用状态灰色

.blog-m-comment-bar
  position: fixed
  bottom: 0
  left: 0
  right: 0
  z-index: 9999
  background-color: $bar-bg
  border-top: 1px solid $border-color
  box-sizing: border-box
  padding: 8px 12px

.blog-m-comment-bar-inner
  display: flex
  align-items: flex-end
  gap: 12px
  width: 100%
  box-sizing: border-box

// --- 输入框样式 ---
.blog-m-comment-input
  flex: 1
  border-radius: 25px
  background-color: $input-bg
  overflow: hidden
  box-sizing: border-box

  :deep(.van-cell)
    background-color: transparent
    padding: 8px 14px
    border-radius: 25px

  :deep(.van-field__control)
    font-size: 15px
    line-height: 20px
    color: $text-main
    background-color: transparent
    border: none
    outline: none
    resize: none

  :deep(.van-field__control::placeholder)
    color: $text-placeholder

  :deep(.van-field__word-limit)
    color: $text-placeholder
    font-size: 12px
    line-height: 1
    margin-top: 4px
    text-align: right

//左侧收藏图标
.blog-m-comment-bar-like
  padding 8px

.collect-icon
  cursor: pointer
  transition: all 0.2s ease
  &:active
    transform: scale(0.9)
  &.is-active
    color: $active-color

//右侧发送按钮
.blog-m-comment-bar-submit
  padding 8px 18px // 按钮内边距
  border-radius 20px // 圆角胶囊形状
  font-size 14px
  font-weight 500
  color #fff
  background-color $btn-gray // 默认灰色（禁用态）
  transition all 0.2s ease
  cursor pointer
  user-select none
  flex-shrink 0 // 防止按钮被输入框挤扁
  white-space nowrap
  
  // 当有输入内容时 (is-active)
  &.is-active
    background-color $pink
  
  // 点击时的微缩放效果
  &:active
    transform scale(0.95)
</style>