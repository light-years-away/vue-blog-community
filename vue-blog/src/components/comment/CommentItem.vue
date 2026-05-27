<!--
 * @Author: 
 * @Date: 2026-03-17 18:33:56
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-02 21:23:10
 * @Description: 
 * @FilePath: \vue-blog\src\components\comment\CommentItem.vue
-->
<template>
  <li class="blog-comment--item">
    <div class="blog-comment--user blog-line blog-line--row">
      <div class="blog-comment--avatar">
        <img :src="uid.avatar" alt="avatar">
      </div>
      <span class="blog-comment--name">{{ uid.nikname }}</span>
    </div>
    <p class="blog-comment-content">{{ content }}</p>
    <p class="blog-comment-date">{{ date }}</p>
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

<style lang="scss"></style>