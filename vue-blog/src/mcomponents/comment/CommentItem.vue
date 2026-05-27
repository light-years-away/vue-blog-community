<!--
 * @Author: 
 * @Date: 2026-03-17 18:33:56
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 14:25:24
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\comment\CommentItem.vue
-->
<template>
  <li class="blog-m-comment-item">
    <!-- 左侧用户头像 -->
    <div class="blog-m-comment-avatar">
      <img :src="uid.avatar || defaultAvatar" alt="用户头像" />
    </div>
    <!-- 右侧评论内容区 -->
    <div class="blog-m-comment-content">
      <div class="user-name">{{ uid.nikname || '匿名用户' }}</div>
      <p class="blog-m-comment-text">{{ content }}</p>
      <div class="blog-m-comment-footer">
        <span class="blog-m-comment-date">{{ date }}</span>
      </div>
    </div>
  </li>
</template>

<script setup>
import { defineProps } from 'vue'
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL

//定义 props
const props = defineProps({
  uid: {
    type: Object,
    required: true,
    default: () => ({ avatar: '', nikname: '匿名用户' })
  },
  content: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  }
})

</script>

<style lang="stylus">
.blog-m-comment-item {
  display: flex;
  width: 100%;
  padding: 12px 0;
  box-sizing: border-box;
}

/* 左侧头像 */
.blog-m-comment-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 50%;
  overflow: hidden;
  background: #f2f2f2;
}
.blog-m-comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧内容区 */
.blog-m-comment-content {
  flex: 1;
  min-width: 0;
}

/* 用户名 */
.user-name {
  font-size: 14px;
  color: #606060;
  font-weight: 500;
  line-height: 20px;
  margin-bottom: 4px;
}

/* 评论文本 */
.blog-m-comment-text {
  font-size: 15px;
  color: #181818;
  line-height: 22px;
  margin: 0 0 8px 0;
  word-break: break-all;
}

/* 底部操作栏 */
.blog-m-comment-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
}




</style>