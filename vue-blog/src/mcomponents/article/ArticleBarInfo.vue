<!--
 * @Author: 
 * @Date: 2026-03-17 17:47:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-02 23:03:58
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\article\ArticleBarInfo.vue
-->
<template>
  <div class="article-info-bar">
    <!-- 左侧：作者 + 日期 -->
    <div class="article-info-bar__left">
      <!-- 作者头像 + 名称 -->
      <div class="author-info">
        <img 
          :src="info.avatar" 
          class="author-avatar"
        />
        <span class="author-name">{{ info.nikname }}</span>
      </div>

      <!-- 日期 -->
      <div class="date-info">
        <el-icon><Calendar /></el-icon>
        <span>{{ info.date }}</span>
      </div>
    </div>

    <!-- 右侧：统计数据（点赞、阅读、评论） -->
    <div class="article-info-bar__right">
      <span class="stat-item">
        <el-icon class="icon-like"><Star /></el-icon>
        {{ info.like_num }}
      </span>
      <span class="stat-item">
        <el-icon class="icon-view"><View /></el-icon>
        {{ info.hit_num }}
      </span>
      <span class="stat-item">
        <el-icon class="icon-comment"><ChatLineRound /></el-icon>
        {{ info.comment_num }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Calendar, Star, View, ChatLineRound } from '@element-plus/icons-vue'

const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})
</script>

<style lang="stylus" scoped>
@import '../../assets/css/base.styl'

// 主容器：整行信息栏
.article-info-bar
  display flex
  justify-content space-between
  align-items center
  padding 12px 16px
  background-color #f9fafb
  border-radius 12px
  margin 10px 0 16px
  border 1px solid #f0f2f5

// 左侧：作者 + 日期
.article-info-bar__left
  display flex
  flex-direction column
  gap 6px

// 作者信息
.author-info
  display flex
  align-items center
  gap 8px

.author-avatar
  width 36px
  height 36px
  border-radius 50%
  object-fit cover
  border 1px solid #eee

.author-name
  font-size 15px
  color #333
  font-weight 500

// 日期
.date-info
  display flex
  align-items center
  gap 4px
  font-size 12px
  color #999

  i
    font-size 12px

// 右侧：统计项
.article-info-bar__right
  display flex
  align-items center
  gap 16px

.stat-item
  display flex
  align-items center
  gap 4px
  font-size 12px
  color #999

  i
    font-size 14px

// 图标颜色微调
.icon-like
  color #ff4d4f

.icon-view
  color #1890ff

.icon-comment
  color #667eea
</style>