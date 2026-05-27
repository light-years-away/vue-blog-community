<!--
 * @Author: 
 * @Date: 2026-03-16 22:56:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-02 21:23:39
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\article\ArticleItem.vue
-->
<template>
  <van-card class="blog-m-item" :desc="article.title">
    <template #title>
      <h3 class="van-ellipsis blog-m-item--title">{{ article.title }}</h3>
    </template>
    <template #desc>
      <img class="van-ellipsis blog-m-item--thumb" :src='article.cover'>
      <p class="blog-m-item--desc">
        {{ content }}
      </p>
    </template>
    <template #tags>
      <p class="van-ellipsis blog-m-item--author">
        {{ nikname }}
      </p>
    </template>
    <template #num>
      <p>{{ article.date }}</p>
    </template>
    <template #price>
      <span class="blog-m-tags--hit"><van-icon name="eye-o" />{{ article.hit_num }}</span>
      <span class="blog-m-tags--like"><van-icon name="star-o" />{{ article.like_num }}</span>
      <span class="blog-m-tags--comment"><van-icon name="chat-o" />{{ article.comment_num }}</span>
    </template>
  </van-card>
  <van-divider :style="{ color: '#1989fa', borderColor: '#fff', padding: '0 10px', margin: '5px' }" />

</template>

<script setup>
import { computed } from 'vue'
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL
// 接收 props
const props = defineProps({
  article: {
    type: Object,
    default: () => ({})
  }
})


//工具函数 提取 HTML 纯文本
const getTextFromHtml = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent?.trim() || ''
}

// 计算属性
const content = computed(() => {
  if (!props.article?.content) return '默认内容'
  const text = getTextFromHtml(props.article.content)
  return text.slice(0, 60) + '...'
})

const nikname = computed(() => {
  return props.article?.author?.nikname || '默认昵称'
})

const like_num = computed(() => {
  return props.article?.like_num || 0
})
</script>

<style lang="stylus">
@import '../../assets/css/base.styl';
.blog-m-item
  border-radius 20px;
.blog-m-item--thumb
  display block
  margin 6px auto
  max-height 100px
  width auto

.blog-m-item--title
  font-size 17px
  font-weight 600
  
.blog-m-item--desc
  padding-bottom 8px
  text-align left
  text-indent 2em
.blog-m-item--author
  font-weight 550
  text-align right
  color rgb(0, 0, 0)
.blog-m-tags--like, .blog-m-tags--hit, .blog-m-tags--comment
  letter-spacing 2px;
  font-size 16px
  padding 0 padding-space
  color rgb(0, 0, 0)
  &:hover
    color rgb(0, 0, 0)
</style>