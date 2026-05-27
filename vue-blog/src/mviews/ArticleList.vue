<!--
 * @Author: 
 * @Date: 2026-03-30 20:37:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 12:12:50
 * @Description: 
 * @FilePath: \vue-blog\src\mviews\ArticleList.vue
-->
<template>
  <div class='blog-m-articleList-scroll'>
    <div ref="scrollContainer" class="blog-m-articleList-wrap" v-if="articles.length" @scroll="handleScroll">
      <!-- 文章列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" loading-text='加载中...'>
        <!-- 只有在触发 @load 事件（即上拉加载更多）时，van-list 才会自动将 loading 设为 true -->
        <van-list v-model:loading="loading" :finished="!hasMore" finished-text="没有更多文章了" @load="onLoadMore">
          <router-link v-for="item in articles" :key="item.id" :to="{ name: 'mArticle', params: { id: item.id } }">
            <ArticleItem :article="item" />
          </router-link>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
  <van-empty v-if="!articles.length && !loading" description="该分类下暂无文章" :image-size="170" />
</template>

<script setup>
import { ref, onMounted, onActivated, defineOptions, onUnmounted, getCurrentInstance, onDeactivated, inject, watch, computed, nextTick } from 'vue'
import http from '@/api/http'
import { showToast } from 'vant'
import QS from 'qs'
import { useUserStore } from '@/stores/userStore.js'
import ArticleItem from '@/mcomponents/Article/ArticleItem.vue'
import bus from '@/util/bus'
import store from 'store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
//配合keep-alive使用
defineOptions({//defineOptions中可以使用选项式api的写法 
  name: 'MArticleList'
})
const articles = ref([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const size = ref(5)
//定义一个 ref 用来获取 DOM 元素
const scrollContainer = ref(null)

const SCROLL_KEY = 'article_list_scroll_top'
// 保存当前搜索条件
const currentSearchParams = ref({
  column: null,
  q: ''
})

//构建查询参数（使用保存的搜索条件）
const setQuery = () => {
  let query = JSON.parse(JSON.stringify(currentSearchParams.value))//深拷贝
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


  // 只有非加载更多时，才手动设为 true（下拉刷新/首次加载）
  if (!isLoadMore) {
    loading.value = true
  }

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
console.log(hasMore.value)
  } catch (err) {
    showToast({
      type: 'fail',
      message: '文章加载失败'
    })
    console.log(err)
  } finally {

    loading.value = false
    refreshing.value = false
  }
}
// 实时保存滚动位置
const handleScroll = () => {
  if (scrollContainer.value) {
    const scrollTop = scrollContainer.value.scrollTop
    store.set(SCROLL_KEY, scrollTop.toString())
  }
}
// 恢复滚动位置
const restoreScrollPosition = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      const saved = store.get(SCROLL_KEY)
      if (saved !== null) {
        scrollContainer.value.scrollTop = parseInt(saved, 10)

      }
    }
  })
}

// 监听检索事件 对齐PC端逻辑
const handleDoSearch = (params) => {
  //更新检索条件
  currentSearchParams.value = {
    column: params.column,
    q: params.q
  }
  //重置分页
  page.value = 1
  hasMore.value = true
  // 清空列表 重新加载
  articles.value = []
  //重新获取文章
  getArticles(false)
  //滚动到顶部
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
      store.set(SCROLL_KEY, '0')
    }
  })
}


// 初始化
onMounted(() => {
  getArticles(false)
})


//keepalive页面激活 生命周期 恢复滚动位置
onActivated(() => {
  restoreScrollPosition()
  // 监听检索事件
  bus.on('activeSearch', handleDoSearch)
})

//组件失活时 (离开页面)
onDeactivated(() => {
  //keepalive页面Deactivated移除监听（必须 防止内存泄漏）
  bus.off('activeSearch', handleDoSearch)
})

onUnmounted(() => {
  //卸载时移除监听(兜底)
  bus.off('activeSearch', handleDoSearch)
})
// 下拉刷新
const onRefresh = () => {
  page.value = 1
  hasMore.value = true
  // articles.value = []
  getArticles(false)
  showToast('刷新成功');
}
// 上拉加载更多
const onLoadMore = () => {
  getArticles(true)
}

</script>

<style lang="stylus">
.blog-m-articleList-scroll
  width 100%
  height: calc(100vh - 90px)//减掉底部tab高度,防止遮挡内容
  overflow: hidden;
.blog-m-articleList-wrap
  height: 100%;
  background-color #2D2F33
  padding 12px 16px
  overflow-y auto
</style>
