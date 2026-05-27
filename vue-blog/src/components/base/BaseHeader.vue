<!--
 * @Author: 
 * @Date: 2026-03-15 17:14:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-27 12:14:39
 * @Description: 
 * @FilePath: \付浩哲_vue第四十天_20260407\vue-blog\src\components\base\BaseHeader.vue
-->
<template>
  <el-row class="blog-header--wrap" type="flex">
    <el-col :span="2" :xs="{ span: 24 }" class="blog-logo--wrap">
      <div class="blog-head--logo hidden-xs-only">
        <el-image :src="logoImg" fit="cover"></el-image>
      </div>
    </el-col>
    <el-col class="" :span="16" :offset="2">
      <el-menu class="blog-head--menu" mode="horizontal" router background-color='#2D2F33' text-color='#ccc'
        active-text-color='#fff' :default-active="route.path">
        <el-menu-item index="/index">首页</el-menu-item>
        <el-menu-item index="/socket">聊天</el-menu-item>
        <!-- <el-menu-item index="/album">相册</el-menu-item> -->
        <el-menu-item :index="articleMenuIndex" :disabled="disableArticleMenu">文章</el-menu-item>
        <!-- <el-sub-menu index="/link">
          <template #title>外链</template>
          <el-menu-item index="/link/1">item one</el-menu-item>
          <el-menu-item index="/link/2">item two</el-menu-item>
          <el-menu-item index="/link/3">item three</el-menu-item>
        </el-sub-menu> -->
      </el-menu>
    </el-col>
    <el-col :span="4" class="hidden-xs-only">
      <component :is="loginCompantent"></component>
    </el-col>
  </el-row>
</template>

<script setup>
import logoImg from '@/assets/img/logo.jpg'
import { reactive, ref, computed } from 'vue'
import UserImgAvatar from '@/components/user/UserImgAvatar.vue'
import UserLoginHead from '@/components/user/UserLoginHead.vue'
import { useRoute } from 'vue-router'
const route = useRoute() // 获取当前路由
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
//创建 Store 实例
const userStore = useUserStore()
// const formLabelWidth = '140px'
// const form = reactive({
//   name: '',
//   pwd: ''
// })
const loginCompantent = computed(() =>
  userStore.token ? UserImgAvatar : UserLoginHead
)


//判断是否在文章详情页 /article/:id
const isArticlePage = computed(() => {
  return route.path.startsWith('/article/')// 判断是否以 /article/ 开头 匹配所有文章详情页
})

//文章详情页 启用
//非文章页 禁用
const disableArticleMenu = computed(() => {
  return !isArticlePage.value
})


//动态拼接 index = /article + id
const articleMenuIndex = computed(() => {
  if (isArticlePage.value) {
    return route.path //直接用当前路径 /article/123
  }
  // return '/article' //其他页面用 /article
})
</script>

<style lang="stylus">
@import '../../assets/css/base.styl'
.el-header.blog-header
  height 60px
.blog-header
  background-color bg-reverse-color
.blog-header--wrap
  display flex
  align-items center
  height 60px
// .blog-logo
//   width 60px
//   height 60px
//   margin 0 auto
//   line-height 0
.blog-header--wrap .blog-head--menu
  height 60px
  background-color rgba(0, 0, 0, 0)
.blog-logo--pic
  width 60px
  height 60px
.blog-head--logo
  width 40px
  height 40px
  overflow hidden
  border-radius 50%
  text-align center
  & img
    display block
    width auto
    height 40px

.blog-header--login
  display flex
  align-items center
  color bg-theme-color

.el-menu--horizontal.el-menu
  border:none
</style>