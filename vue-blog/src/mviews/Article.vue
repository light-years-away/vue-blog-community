<!--
 * @Author: 
 * @Date: 2026-04-01 17:15:51
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 11:22:41
 * @Description: 
 * @FilePath: \vue-blog\src\mviews\Article.vue
-->
<template>

  <van-nav-bar title="文章详情" left-text="返回" left-arrow @click-left="onClickLeft" class='blog-m-article-header' />
  <div class='blog-m-article-scroll'>
    <ArticleContent :article="article" />
    <CommentList :comments="article?.comments" />
  </div>
  <CommentTextArea :aid="article?.id || ''" />

</template>

<script setup>
import { ref, onMounted, provide, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleContent from '@/mcomponents/article/ArticleContent.vue'
import CommentTextArea from '@/mcomponents/comment/CommentTextArea.vue'
import CommentList from '@/mcomponents/comment/CommentList.vue'
const onClickLeft = () => history.back();

import http from '@/api/http'
import { useLikesStore } from '@/stores/likesStore' //引入pinia
const likesStore = useLikesStore() // 实例化
// 路由
const route = useRoute()//获取当前路由信息（只读）
const router = useRouter()//获取路由实例，用来操作路由（跳转、后退等）

const id = ref(route.params.id)
const article = ref({})

//获取文章详情
const getArticleById = async () => {
  try {
    article.value = await http({
      type: 'getArticleById',
      data: { id: id.value }
    })
    //初始化点赞 Store
    likesStore.init(
      article.value.id,//currentAid
      article.value.like_users, //originalLikeUsers
      article.value.like_num//originalLikeNum
    )
  } catch (err) {
    console.error(err)
  }
}

//provide 提供给后代组件
provide('getArticleById', getArticleById)

//如果文章 ID 变化 重新获取
watch(() => route.params.id, (newId) => {
  id.value = newId
  // likesStore.reset() // 先重置Store
  getArticleById()
})

// 离开页面时同步
const syncAndLeave = async () => {
  if (likesStore.needSync) {
    await likesStore.syncToServer()
  }
}
//初始化
onMounted(() => {
  getArticleById()
})


// onUnmounted(() => {
//   syncAndLeave()//离开页面时同步
// })
</script>
<style lang="stylus">
.blog-m-article-header
  &.van-nav-bar
      background-color #2D2F33 !important
  & .van-nav-bar__title
      color #fff
      font-weight 550
      font-size 18px
  & .van-nav-bar__text
      color #fff
  &.van-nav-bar .van-icon
      color #fff
.blog-m-article-scroll
  width 100%
  height: calc(100vh - 103px)//减掉底部输入框和顶部高度,防止遮挡内容
  overflow: hidden;
  overflow-y auto
// .blog-m-article-wrap
//   height: 100%;
//   overflow-y auto
</style>
