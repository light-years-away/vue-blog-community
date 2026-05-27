<!--
 * @Author: 
 * @Date: 2026-03-17 20:15:00
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 15:40:39
 * @Description: 
 * @FilePath: \vue-blog\src\views\Article.vue
-->
<template>
  <div v-if="article.id">
    <ArticleContent :article="article" />
    <CommentTextArea :aid="article.id" />
    <CommentList :comments="article.comments" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { ElNotification } from 'element-plus'
import ArticleContent from '@/components/article/ArticleContent.vue'
import CommentTextArea from '@/components/comment/CommentTextArea.vue'
import CommentList from '@/components/comment/CommentList.vue'
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
  likesStore.reset() // 先重置Store
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


onUnmounted(() => {
  syncAndLeave()//离开页面时同步
})
</script>

<style lang="stylus">
.blog-main--card
  width 80%
</style>