<!--
 * @Author: 
 * @Date: 2026-04-01 21:34:17
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-03 09:20:28
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\article\ArticleContent.vue
-->
<template>
  <el-card>
    <div class="blog-m-article">
      <h3 class="blog-m-article--title">{{ article.title }}</h3>
      <ArticleBarInfo :info="info" />
      <div class="markdown-body blog-m-article--content" v-html="article.content"></div>
      <!-- v-html渲染文章内容的 HTML -->
    </div>
  </el-card>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import ArticleBarInfo from '@/mcomponents/article/ArticleBarInfo.vue'
import { useLikesStore } from '@/stores/likesStore' // 引入pinia
const likesStore = useLikesStore()
//定义 props
const props = defineProps({
  article: {
    type: Object,
    default: () => ({
      title: '默认标题',
      date: '默认日期',
      like_num: 0,
      hit_num: 0,
      comment_num: 0,
      content: '',
      author: null
    })
  }
})

// 计算属性：作者昵称
const nikname = computed(() => {
  return props.article?.author?.nikname || '佚名'
})

// 计算属性：info 对象  传递给 ArticleBarInfo
const info = computed(() => {
  const { like_num, hit_num, comment_num, date, author } = props.article
  return {
    like_num: likesStore.displayLikeNum, //用 Store 计算后的数字
    hit_num,
    comment_num,
    date,
    nikname: nikname.value,
    avatar: author?.avatar || ''
  }
})
</script>

<style lang="stylus">
// @import '../../assets/css/typo.styl'
@import '../../assets/css/base.styl'
// .blog-article
//   font-size 16px
//   background-color line-modifier-color
//   border-radius radius-theme-size
.blog-m-article--title
  font-size 22px
  line-height 26px
  margin 0
  word-break break-word

// .blog-article--content
//   padding padding-space * 2 0
// .blog-article img
//   display block
//   width 50%
//   margin 10px auto
</style>