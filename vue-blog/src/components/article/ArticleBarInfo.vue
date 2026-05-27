<!--
 * @Author: 
 * @Date: 2026-03-17 17:47:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-01 22:07:56
 * @Description: 
 * @FilePath: \vue-blog\src\components\article\ArticleBarInfo.vue
-->
<template>
  <div class="blog-article--info">
    <span class="blog-info--item">
      作者: {{ info.nikname }}
    </span>
    <span class="blog-info--item">
      <el-icon><Calendar /></el-icon>{{ info.date }}
    </span>
    <div class="">
      <span class="blog-info--item">
        <el-icon><Star /></el-icon> {{ info.like_num }}
      </span>
      <span class="blog-info--item">
        <el-icon><View /></el-icon> {{ info.hit_num }}
      </span>
      <span class="blog-info--item">
        <el-icon><ChatLineRound /></el-icon> {{ info.comment_num }}
      </span>
      
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Calendar, Star, View, ChatLineRound } from '@element-plus/icons-vue'

// 定义 props
const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})
</script>

<style lang="stylus">

@import '../../assets/css/base.styl'
.blog-article--info
  padding padding-space * 2
  background-color #f7f8fc
  display flex
  justify-content space-between
  color #999
  @media screen and (max-width 768px)
    flex-direction column
    height 120px
.blog-info--item
  padding 0 6px
</style>