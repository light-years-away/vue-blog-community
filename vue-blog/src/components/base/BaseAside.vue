<!--
 * @Author: 
 * @Date: 2026-03-15 18:39:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 16:11:17
 * @Description: 
 * @FilePath: \vue-blog\src\components\base\BaseAside.vue
-->
<template>
  <!-- <PhysicalCard /> -->
  <el-aside width="100%">
    <el-card class="box-card blog-aside">
      <div class="blog-avatar">
        <img class="blog-avatar--pic" :src="userInfo.avatar" alt="">
      </div>
      <div class="blog-info">
        <h3 class="blog-info--nicknam">{{ userInfo.nikname }}</h3>
        <div class="blog-info--state">
          <div class="blog-state--item blog-line--col">
            <a href="#">
              <span class="blog-state--count">{{ userInfo.articleCount }}</span>
              <span class="blog-state--name">文章</span>
            </a>
          </div>
          <div class="blog-state--item">
            <a href="#">
              <span class="blog-state--count">{{ userInfo.columnCount }}</span>
              <span class="blog-state--name">分类</span>
            </a>
          </div>
        </div>
        <p class="blog-info--content">{{ userInfo.signature }}</p>
      </div>
    </el-card>
  </el-aside>

  <el-select-v2 v-if="route.name === 'index'" popper-class="blog-column-select" v-model="currentColumnId"
    :options="columnOptions" placeholder="选择文章分类" style="width: 100%;max-width:280px" @change="handleColumnChange" />

  <el-input class="blog-article--search" v-if="route.name === 'index'" style="width: 100%;max-width:280px"
    placeholder="搜索此分类下的文章" v-model="searchVal" @keydown.enter="handleSearch">

    <template #suffix>
      <el-icon class="el-input__icon">
        <Search />
      </el-icon>

    </template>
  </el-input>

  <el-button type="primary" @click="handleSearch" style="width: 100%;max-width:280px" color="#2D2F33"
    v-if="route.name === 'index'">
    <i class='blog-search-button-icon'>
      <el-icon>
        <Search />
      </el-icon>
    </i>

    检索
  </el-button>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, inject, onUnmounted } from 'vue'
import http from '@/api/http'

import { useGlobal } from '@/core/minxin'
import bus from '@/util/bus'//全局bus总线
import { Search } from '@element-plus/icons-vue'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import { useRoute, useRouter } from 'vue-router'
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL

//创建 Store 实例
const userStore = useUserStore()
const route = useRoute()
const userInfo = computed(() => userStore.userInfo)
const { refreshModal } = useGlobal()

//菜单显隐状态（手动控制）
const dropdownVisible = ref(false)
//分类列表
const columns = ref([])
const searchVal = ref('')
//inject注入父组件的分类状态
const currentColumnId = inject('currentColumnId', ref(null))
const refreshArticleFlag = inject('refreshArticleFlag', ref(0))
//保存上一次选中的分类
const lastSelected = ref(currentColumnId.value)



// 获取分类列表
const getColumns = async () => {
  try {
    const res = await http({ type: 'columns' })
    columns.value = res.list

  } catch (err) {
    console.error('获取分类失败：', err)
    ElNotification.error({ title: '错误', message: '分类加载失败' })
  }
}


// 点击搜索按钮
const handleSearch = () => {
  bus.emit('activeSearch', {
    column: currentColumnId.value,
    q: searchVal.value
  })
  // searchVal.value = ''
}


onMounted(() => {
  getColumns()

  //组件挂载时监听事件
  bus.on('updateView', getColumns)
})

onUnmounted(() => {
  //卸载时移除监听（必须 防止内存泄漏）
  bus.off('updateView', getColumns)
})
// 选项列表 => el-select-v2 用
const columnOptions = computed(() => {
  return [
    { label: '➕ 添加分类', value: 'ADD_COLUMN' },
    { value: null, label: '全部文章' },
    ...columns.value.map(col => ({
      value: col.id,
      label: `${col.name} (${col.aids?.length || 0}篇)`
    }))
  ]
})

// 切换分类
// const handleColumnChange = () => {
//   refreshArticleFlag.value += 1
// }


// 切换分类（只保存 不搜索）
const handleColumnChange = (val) => {
  //点击 添加分类
  if (val === 'ADD_COLUMN') {
    // 打开弹窗
    refreshModal('column')

    //恢复上一次选中（不改变之前选中选项）
    currentColumnId.value = lastSelected.value
    return
  }

  //正常选择分类
  lastSelected.value = val
}
</script>

<style lang="stylus">
@import '../../assets/css/base.styl'
.blog-aside
  width 100%
  max-width 280px
  text-align center
.box-card
  padding 20px
  background-color line-modifier-color
  display flex
  flex-direction column
  align-items center
  text-align center
  border-radius radius-theme-size
.blog-avatar
  overflow hidden
  width 100px
  height 100px
  border-radius 50%
  margin 0 auto
.blog-info
  padding-top padding-space * 3
.blog-info--nicknam
  font-size 24px
  padding 0 0 padding-space
  margin 0
.blog-info--state
  display flex
  justify-content center
  padding padding-space padding-space * 2
.blog-state--item
  padding 0 padding-space * 1.5
.blog-state--item span
  display block
.blog-state--count
  color font-theme-color
  font-weight 700
.blog-state--name
  color font-modifier-color
.blog-info--content
  padding-top padding-space
  text-align left
  text-indent 2em
  font-size font-size-p
  color font-theme-color
/* slide end */
.el-select-v2__wrapper
  margin-top 10px
  padding-top 6px
  border none
.el-select-v2__wrapper.is-focused
  // border-color #333 !important
  border none
  box-shadow 0 0 0 1px #333 inset
/* 自定义 el-select-v2 选项样式 */
.blog-column-select
  background-color #333 !important
  border none
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.4) !important

  // 下拉选项容器背景
  .el-vl__wrapper
    background-color #333 !important
  .el-select-dropdown__option-item
    transition all 0.15s
    color #ccc
    background-color #333 !important
    border-left 2px solid transparent
  // 选项 hover 样式
  .el-select-dropdown__option-item:hover
    color #fff !important
    background-color #2D2F33 !important
    border-left 2px solid #fff // 左侧白边框

  // 选项选中样式
  .el-select-dropdown__option-item.is-selected
    color #fff !important
    background-color #2D2F33 !important
    border-left 2px solid #fff // 左侧白边框
.blog-search-button-icon
  margin-right 10px
.blog-article--search
  margin 10px 0 10px 0
</style>