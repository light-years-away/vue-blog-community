<!--
 * @Author: 
 * @Date: 2026-03-11 15:41:28
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-07 16:07:45
 * @Description: 
 * @FilePath: \vue-blog\src\views\ArticleList.vue
-->
<template>
  <div class="article-wrap" v-if="articles.length">

    <router-link v-for="item in articles" :key="item.id" :to="{ name: 'article', params: { id: item.id } }">
      <el-card class="blog-content--item">
        <ArticleItem :article="item" />
      </el-card>
    </router-link>
  </div>
  <!-- 空状态 -->
  <el-card class="blog-content--item" v-if="!articles.length && !internalLoading">
    <el-empty description="该分类下暂无文章" :image-size="180" />
  </el-card>
</template>

<script setup>
import { ref, onMounted, onActivated, defineOptions, onUnmounted, getCurrentInstance, onDeactivated, inject, watch, computed } from 'vue'
import ArticleItem from '@/components/Article/ArticleItem.vue'
import http from '@/api/http'
import QS from 'qs'
// import { ElNotification } from 'element-plus'
import { useRoute } from 'vue-router'

import bus from '@/util/bus'//全局bus总线

const route = useRoute() // 获取当前路由


// 改用原生 div 的 ref
// const scrollContainerRef = ref(null)
const articles = ref([])
// const loading = ref(false)
const page = ref(1)
const size = ref(4)
// const scrollTop = ref(0)
const internalLoading = ref(false)  // 内部loading，用于防止重复请求
const hasMore = ref(true)
const searchQ = ref('')

// 保存当前搜索条件
const currentSearchParams = ref({
  column: null,
  q: ''
})

//inject注入父组件提供的方法
const scrollTopMap = inject('scrollTopMap', ref({}))
const parentLoadingMap = inject('parentLoadingMap', ref({}))  // 父组件的loading，用于触底判断
const setParentLoading = inject('setParentLoading', () => { })
const scrollContainerRef = inject('scrollContainerRef', ref(null))

// inject注入分类相关状态
const currentColumnId = inject('currentColumnId', ref(null))
const refreshArticleFlag = inject('refreshArticleFlag', ref(0))

//配合keep-alive使用
defineOptions({//defineOptions中可以使用选项式api的写法 
  name: 'ArticleList'
})

//构建查询参数（使用保存的搜索条件）
const setQuery = () => {
  let query = JSON.parse(JSON.stringify(currentSearchParams.value))
  // let column = currentColumnId.value
  // let q = searchQ.value
  // let query = JSON.parse(JSON.stringify({//JSON.parse JSON.stringify自动过滤 undefined 字段
  //   column, q
  // }))

  // 过滤掉值为 undefined/null/空字符串的字段
  let filteredQuery = Object.fromEntries(
    Object.entries(query).filter(([key, value]) =>
      value !== undefined && value !== null && value !== ""
    )
  )
  return filteredQuery
}
// 获取文章列表
const getArticles = async (isLoadMore = false) => {
  if (internalLoading.value) {
    return
  }

  internalLoading.value = true//防止重复请求
  try {
    let data = { size: size.value, page: page.value }
    let query = setQuery()
    if (Object.entries(query).length > 0) {
      data.query = QS.stringify(query)//把对象转为column=1&q=vue
    }
    const result = await http({
      type: 'articles',
      data
    })

    // 非加载更多（切换分类/刷新）直接替换列表
    if (!isLoadMore) {
      articles.value = result.list
    } else {
      // 加载更多：追加到列表
      articles.value.push(...result.list)
    }
    page.value++
    hasMore.value = articles.value.length < result.total


    // 没有更多数据提示
    if (articles.value.length >= result.total && route.path !== "/editor") {
      // /editor路由不提示
      ElMessage({
        message: '没有更多了',
        type: 'error',
      })
      console.log('没有更多了')
      // setParentLoading(false)
      return
    }

    // articles.value.push(...result.list)
    // page.value++
  } catch (err) {
    ElNotification({
      title: '获取失败',
      message: err.message,
      type: 'error'
    })
  } finally {
    setParentLoading(false)  //加载完成 通知父组件
    internalLoading.value = false//防止重复请求
  }
}
//监听分类变化 刷新文章列表
watch(refreshArticleFlag, () => {
  // 切换分类时重置状态
  page.value = 1
  hasMore.value = true
  articles.value = []
  // 重新请求对应分类的文章
  getArticles(false)
})


// 监听 自己页面的 parentLoading 变化，触发加载更多
watch(() => parentLoadingMap.value[route.name], (newVal) => {
  if (newVal === true && hasMore.value && !internalLoading.value) {
    getArticles(true)
  }
})

// 取当前页面自己的ScrollTop
const myScrollTop = computed(() => scrollTopMap.value[route.name] || 0)
// keepalive页面激活 生命周期 恢复滚动位置
onActivated(() => {
  if (myScrollTop.value) {

    scrollContainerRef.value.setScrollTop(myScrollTop.value)

  }
  console.log('ArticleList onActivated')
  //keepalive页面Activated时监听事件
  bus.on('updateArticles', updateArticles)
  bus.on('activeSearch', handleDoSearch)
})
onDeactivated(() => {
  console.log('ArticleList 被缓存')
  //keepalive页面Deactivated移除监听（必须 防止内存泄漏）
  //updateArticles不要Deactivated移除监听否则bus总线监听会失效
  // bus.off('updateArticles', updateArticles)
  bus.off('activeSearch', handleDoSearch)
})

const updateArticles = () => {
  refreshArticleFlag.value += 1
  console.log('updateArticles')
}

//监听搜索事件（点击搜索按钮时触发）
const handleDoSearch = (params) => {
  //保存搜索条件
  currentSearchParams.value = {
    column: params.column,
    q: params.q
  }
  //重置并重新搜索
  refreshArticleFlag.value += 1
}
//初始化加载加载第一页
onMounted(() => {
  getArticles(false)
  console.log('ArticleList Mounted')
})
onUnmounted(() => {
  console.log('ArticleList unmounted')
  //onUnmounted时移除监听(兜底)
  bus.off('updateArticles', updateArticles)
  bus.off('activeSearch', handleDoSearch)
})

</script>

<style lang="stylus">
.article-wrap
  overflow hidden
  height 100%


</style>