<!--
 * @Author: 
 * @Date: 2026-03-17 18:33:56
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 12:16:25
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\comment\CommentList.vue
-->
<template>
  <div class="blog-m-comment-list-wrap" v-if="commentLength > 0">
    <!-- 评论总数标题 -->
    <div class="blog-m-comment-title">
      <span class='isactive'>
        全部评论  {{ commentLength }}
      </span>
    </div>
    <!-- 评论列表 -->
    <ul class="blog-m-comment-list">
      <CommentItem v-for="comment in comments" :key="comment.id" :uid="comment.uid" :content="comment.content"
        :date="comment.date" />
    </ul>
  </div>
  <!-- 无评论空状态 -->
  <div class="blog-m-comment-empty" v-else>
    <p>暂无评论，快来抢沙发吧~</p>
  </div>
</template>

<script setup>
import { computed, defineProps, defineOptions } from 'vue'
import CommentItem from '@/mcomponents/comment/CommentItem.vue'

// 定义组件名
defineOptions({
  name: 'CommentList'
})

// 定义 props
const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  }
})

// 计算属性：评论数量
const commentLength = computed(() => {
  return props.comments?.length || 0
})

</script>

<style lang="stylus">
.blog-m-comment-list-wrap
  width 100%
  padding 0 16px
  background #fff

.blog-m-comment-title
  font-size 15px
  color #333
  font-weight 500
  line-height 40px
  margin-bottom 8px
  & span
    position relative
    display inline-block
  & .isactive
    &::after
      content ''
      position absolute
      bottom 0            /* 放在底部 */
      left 50%            /* 水平居中 */
      transform translateX(-50%) /* 配合 left:50% 实现完美居中 */
      width 20px    
      height 2px          /* 边框厚度 */
      background-color #000 /* 边框颜色 */

.blog-m-comment-list
  width 100%
  list-style none
  padding 0
  margin 0

.blog-m-comment-empty
  width 100%
  padding 40px 0
  text-align center
  font-size 14px
  color #999
  background #fff
</style>