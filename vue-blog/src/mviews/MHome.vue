<!--
 * @Author: 
 * @Date: 2026-03-30 20:37:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-04 16:58:32
 * @Description: 
 * @FilePath: \vue-blog\src\mviews\MHome.vue
-->
<!--
 * @Author: 
 * @Date: 2026-03-31 20:24:31
 * @LastEditors: 
 * @LastEditTime: 2026-03-31 20:25:35
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\base\BaseFooter.vue
-->
<template>
  <div class="blog-m-home">
    <!-- 顶部导航栏 -->
    <BaseHeader />
    <!-- 子路由视图 -->
    <router-view v-slot="{ Component }">
      <keep-alive include="MArticleList">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- 底部导航栏 -->
    <BaseFooter />
    <BaseDialog />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseFooter from '@/mcomponents/base/BaseFooter.vue'
import BaseDialog from '@/mcomponents/base/BaseDialog.vue'
import BaseHeader from '@/mcomponents/base/BaseHeader.vue'
// 按需加载 Vant CSS（仅在移动端路由被激活时下载）
import 'vant/lib/index.css'
const route = useRoute()

</script>

<style lang="stylus" scoped>
.blog-m-home
  background-color #FFFFFF
  padding-bottom 50px

</style>