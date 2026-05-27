<!--
 * @Author: 
 * @Date: 2026-03-31 20:24:31
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 15:52:14
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\base\BaseFooter.vue
-->
<template>
  <!-- 只有当前路由需要显示导航时，才渲染整个组件 -->
  <div class="blog-m-home" v-if="showTabbar">
    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTab" :fixed="true" :placeholder="true" active-color="#FFF" inactive-color="#999999"
      safe-area-inset-bottom>
      <van-tabbar-item name="index" icon="wap-home" :to='{ name: "mArticleList" }'>首页</van-tabbar-item>
      <van-tabbar-item name="socket" icon="chat" :to='{ name: "" }'>聊天</van-tabbar-item>
      <van-tabbar-item name="editor" icon="records" :to='{ name: "" }'>写文章</van-tabbar-item>
      <van-tabbar-item name="user" icon="user" :to='{ name: "mUser" }'>我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch,computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
//根据路由meta判断是否显示底部导航
const showTabbar = computed(() => {
  return route.meta?.showTabbar ?? true // 默认显示，无meta时兜底
})

// 激活的tab和路由同步
const activeTab = ref(route.name.replace('m').toLowerCase())

// 监听路由变化，同步tab选中态
watch(
  () => route.name,
  (newName) => {
    activeTab.value = newName.replace('m', '').toLowerCase()
  },
  { immediate: true }
)
</script>

<style lang="stylus">
.van-tabbar
  box-shadow 0 -2px 12px rgba(0,0,0,0.04)
  border none
  background-color: #2D2F33 !important; 

.van-tabbar-item--active
  background-color: #000 !important

</style>