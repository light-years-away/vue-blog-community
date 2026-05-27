<!--
 * @Author: 
 * @Date: 2026-03-11 15:40:47
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-07 20:35:23
 * @Description: 
 * @FilePath: \vue-blog\src\views\Home.vue
-->
<template>
  <div class="blog-page">
    <el-container class="blog-container">
      <el-header height="10vh" class="blog-header">
        <BaseHeader />
      </el-header>

      <div class="blog-middle">
        <el-row class="blog-middle--wrap" type="flex">
          <el-col :span="5" class="hidden-xs-only blog-el-col-aside">
            <BaseAside v-if="userStore.token" />
          </el-col>

          <el-col class='blog-el-col-body' :span="17" :xs="{ span: 24 }">
            <el-main class="blog-main">
              <el-scrollbar ref="scrollContainerRef" @scroll="handleScroll" class="scroll-container">
                <!-- ArticleList组件不销毁 -->
                <router-view v-slot="{ Component }">

                  <!-- router-view只要用了 v-slot，就必须自己接管router-view插槽渲染 -->
                  <!-- v-slot="{ Component }是router-view组件内部传来的数据 -->

                  <keep-alive include="ArticleList">
                    <component :is="Component" />
                  </keep-alive>

                  <!-- 这一部分整体都是要插入router-view内部插槽的内容 -->

                </router-view>
              </el-scrollbar>
            </el-main>
          </el-col>

          <el-col :span="2" v-if="circleMenuList.length > 0" class="hidden-xs-only">
            <BaseCircleMenu :circleMenuList="circleMenuList" />
          </el-col>
        </el-row>
      </div>

      <!-- <el-footer height="10vh" class="blog-footer">Footer</el-footer> -->
    </el-container>





    <BaseModal />

  </div>

  <Live2DPet />
</template>


<script setup>
import { Search } from '@element-plus/icons-vue'
// import logoImg from '@/assets/img/logo.jpg'
import BaseHeader from '@/components/base/BaseHeader.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseAside from '@/components/base/BaseAside.vue'
import BaseCircleMenu from '@/components/base/BaseCircleMenu.vue'
import { throttle } from 'lodash-es'
import { ref, reactive, watch, computed, onMounted, provide } from 'vue'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import circleMenuConfig from '@/config/circleMenu.config'
import { useRoute, useRouter } from 'vue-router'
import Live2DPet from '@/components/Live2DPet.vue'



//创建 Store 实例
const userStore = useUserStore()

const TH = 200//距离底部还剩200像素时获取下一页文章
// 滚动容器的引用
const scrollContainerRef = ref(null)

const scrollTopMap = ref({})//每个路由用自己的scrollTop

const parentLoadingMap = ref({})//每个路由用自己的parentLoading

const circleMenuList = ref([])

const router = useRouter()
const route = useRoute()

//分类筛选组件通讯核心状态
//当前选中的分类ID（null=全部文章）
const currentColumnId = ref(null)
//重置文章列表的触发标识（切换分类时修改，通知子组件刷新）
const refreshArticleFlag = ref(0)


// 监听路由变化 
watch(
  () => route.name, // 监听路由名称变化
  (toName) => {
    // console.log(toName)
    circleMenuList.value = circleMenuConfig[toName]?.() || []
    // console.log(circleMenuConfig)
  },
  { immediate: true } // 一进页面就立即执行一次
)

// 提供给子组件的方法
const setParentLoading = (value) => {
  parentLoadingMap.value[route.name] = value
}

// 滚动 节流 todo
const handleScroll = throttle(() => {
  if (!scrollContainerRef.value) return
  // if (route.name !== 'index') return // 滚动监听只在首页开启
  console.log(11111)
  const scrollElement = scrollContainerRef.value.wrapRef

  // 每个页面单独保存滚动位置
  scrollTopMap.value[route.name] = scrollElement.scrollTop

  // 触底判断
  const st = scrollElement.scrollTop//st = 当前滚动的距离


  //sh = 总高度 - 可视高度 = 最大可滚动距离
  const sh = scrollElement.scrollHeight - scrollElement.clientHeight

  //当前滚动的距离 + 200 > 最大可滚动距离 说明该加载下一页了
  if (st + TH > sh && !parentLoadingMap.value[route.name]) {
    console.log('加载更多')
    // getArticles()
    console.log(parentLoadingMap.value)
    parentLoadingMap.value[route.name] = true
    // 触发子组件的加载方法（通过事件或回调）
    // 这里需要通知子组件加载更多
  }
}, 600)

//provide 提供给后代组件
provide('scrollTopMap', scrollTopMap)
provide('parentLoadingMap', parentLoadingMap)
provide('setParentLoading', setParentLoading)
provide('scrollContainerRef', scrollContainerRef)

//分类相关状态
provide('currentColumnId', currentColumnId)
provide('refreshArticleFlag', refreshArticleFlag)
</script>

<style lang="stylus">
.blog-container
  overflow hidden
  height 100%

// .blog-header--wrap
//   width 100%
.el-main.blog-main
  position relative
  padding 0 20px
  height 100%
.blog-middle
  padding 20px
  height calc(100vh - 60px - 0vh)
  background-color #f1f1f1
.blog-middle--wrap
  max-width 1440px
  margin 0 auto
  width 100%
  height 100%
.blog-el-col-aside,.blog-el-col-body
  height 100%

.blog-footer
  margin-top auto
  height 10vh
  background-color #2D2F33


.el-popper__arrow
  &::before
    background-color #2D2F33 !important
  &::before
    background-color #2D2F33 !important
.el-popper.is-light .el-popper__arrow::before
  border none !important

.el-popper.is-light
  border none


</style>