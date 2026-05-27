<!--
 * @FilePath: \vue-blog\src\mcomponents\base\BaseHeader.vue
-->
<template>
  <!-- 顶部导航栏-->
  <van-nav-bar class="blog-m-header" title="首页" fixed placeholder v-if="showHeadbar">
    <!-- 右侧搜索按钮 -->
    <template #right>
      <van-icon name="search" size="20" color="#fff" @click="openSearchDialog" />
    </template>
  </van-nav-bar>

  <!-- 搜索主弹窗 -->
  <van-dialog v-model:show="showSearchDialog" title="文章检索" :show-cancel-button="false" :show-confirm-button="false"
    :close-on-click-overlay="false">
    <div class="search-dialog-content">
      <!-- 分类选择框 底部滑出Picker -->
      <van-field v-model="selectedColumnLabel" is-link readonly label="文章分类" placeholder="选择文章分类"
        @click="showColumnPicker = true" />
      <!-- 关键词搜索框 -->
      <van-field v-model="searchVal" label="关键词" placeholder="搜索此分类下的文章" clearable @keydown.enter="handleSearch">
        <template #right-icon>
          <van-icon name="search" size="18" color="#999" />
        </template>
      </van-field>
    </div>

    <!-- 底部自定义按钮 -->
    <template #footer>
      <div class="blog-m-dialog-footer">
        <van-button class="blog-m-dialog-cancel-btn" @click="handleCancel">
          取消
        </van-button>
        <van-button class="blog-m-dialog-confirm-btn" type="primary" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleSearch">
          {{ isSubmitting ? '检索中...' : '检索' }}
        </van-button>
      </div>
    </template>
  </van-dialog>

  <!-- 底部滑出分类选择Picker-->
  <van-popup v-model:show="showColumnPicker" round position="bottom" :close-on-click-overlay="false">
    <van-picker :columns="columnOptions" title="选择文章分类" @cancel="showColumnPicker = false" @confirm="onColumnConfirm" />
  </van-popup>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import http from '@/api/http'
import bus from '@/util/bus'

const router = useRouter()
const route = useRoute()
//根据路由meta判断是否显示底部导航
const showHeadbar = computed(() => {
  return route.meta?.showHeadbar ?? false // 默认不显示，无meta时兜底
})


//弹窗状态
const showSearchDialog = ref(false)
const showColumnPicker = ref(false)

//检索条件
const searchVal = ref('')
const selectedColumn = ref(null) //选中的分类ID
const selectedColumnLabel = ref('') //选中的分类名称
const isSubmitting = ref(false) // 检索Loading状态 和BaseDialog对齐

// 分类列表
const columns = ref([])

// 获取分类列表 和PC端逻辑完全一致
const getColumns = async () => {
  try {
    const res = await http({ type: 'columns' })
    columns.value = res.list
  } catch (err) {
    showToast('分类加载失败')
    console.error('获取分类失败：', err)
  }
}

// 分类选项 对齐PC端逻辑
const columnOptions = computed(() => {
  return [
    { text: '全部文章', value: null },
    ...columns.value.map(col => ({
      text: `${col.name} (${col.aids?.length || 0}篇)`,
      value: col.id
    }))
  ]
})

// 打开搜索弹窗
const openSearchDialog = () => {
  showSearchDialog.value = true
}

//分类选择确认
const onColumnConfirm = ({ selectedOptions }) => {
  // selectedOptions拿到选中的数组
  /* {
  text: "JavaScript (10篇)",  // 显示的文字
  value: 1001                 // ID
    } */
  selectedColumn.value = selectedOptions[0].value
  selectedColumnLabel.value = selectedOptions[0].text
  showColumnPicker.value = false
}

// 执行检索 只有点击按钮才触发
const handleSearch = async () => {
  try {
    // 开启Loading 禁用按钮 和BaseDialog效果一致
    isSubmitting.value = true

    // 发送事件 通知列表页更新检索条件
    bus.emit('activeSearch', {
      column: selectedColumn.value,
      q: searchVal.value
    })

    // //模拟异步等待 Loading效果可见 
    // await new Promise(resolve =>
    //   setTimeout(() => {
    //     resolve() // 2 秒后完成
    //   }, 2000)
    // )

    //检索成功
    showToast('检索成功')
    handleCancel() // 关闭弹窗

  } catch (err) {
    showToast(err.message || '检索失败')
  } finally {
    //关闭Loading
    isSubmitting.value = false
  }
}

//关闭弹窗 重置所有临时状态
const handleCancel = () => {
  showSearchDialog.value = false
  //重置表单状态
  searchVal.value = ''
  selectedColumn.value = null
  selectedColumnLabel.value = ''
}

// 生命周期
onMounted(() => {
  getColumns()
  //监听分类更新事件 和PC端一致
  bus.on('updateView', getColumns)
})

onBeforeUnmount(() => {
  bus.off('updateView', getColumns)
})
</script>

<style lang="stylus">
//导航栏深色主题 适配你的项目背景
.blog-m-header
  & .van-nav-bar
      background #2D2F33
  & .van-nav-bar__title
      color #fff
      font-weight 550
      font-size 18px
  
// 弹窗内容间距 上下布局
.search-dialog-content
  padding 10px 16px
  display flex
  flex-direction column
  gap 16px

// 底部按钮样式 
.blog-m-dialog-footer
  display flex
  gap 12px
  padding 12px 16px
  border-top 1px solid #f0f0f0

  // 确认/检索按钮
  & .blog-m-dialog-confirm-btn
    flex 1
    height 44px
    border-radius 8px
    font-size 15px
    font-weight 500
    background-color #2D2F33
    color #fff
    border none
    transition all 0.2s ease
    display flex
    align-items center
    justify-content center
    gap 8px
    
    &:active
      background-color #1f2937
      transform scale(0.98)

    &:disabled
      opacity 0.7
      cursor not-allowed

    // Loading图标 和BaseDialog完全同款
    :deep(.van-loading__spinner)
      width 18px
      height 18px
      border 2px solid transparent
      border-top-color #fff
      border-radius 50%
      animation spin 0.8s linear infinite

  // 取消按钮
  & .blog-m-dialog-cancel-btn
    flex 1
    height 44px
    border-radius 8px
    font-size 15px
    font-weight 500
    background-color transparent
    color #333
    border 2px solid #e5e7eb
    transition all 0.2s ease

    &:active
      background-color #f3f4f6
      transform scale(0.98)

// Loading旋转动画 
@keyframes spin
  from
    transform rotate(0deg)
  to
    transform rotate(360deg)
</style>