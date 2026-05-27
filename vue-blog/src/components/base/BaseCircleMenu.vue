<!--
 * @Author: 
 * @Date: 2026-03-19 23:16:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 17:31:28
 * @Description: 
 * @FilePath: \vue-blog\src\components\base\BaseCircleMenu.vue
-->
<template>
  <transition-group tag="div" class="blog-circle-menu" appear name="circle">
    <el-button v-for="item in circleMenuList" :key="item.icon" size="large" class="blog-btn-menu"
      :class="{ 'is-active': item.icon === 'Star' && isLiked }" @click="clickMenu(item)" :icon="iconMap[item.icon]"
      circle></el-button>
  </transition-group>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, provide, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Star, EditPen, House, ChatLineRound } from '@element-plus/icons-vue'
import bus from '@/util/bus'//全局bus总线
import { ElNotification } from 'element-plus'
import { useLikesStore } from '@/stores/likesStore' // 引入pinia
import { useUserStore } from '@/stores/userStore' //引入
import { useGlobal } from '@/core/minxin' //引入弹登录框的方法
const likesStore = useLikesStore()
const userStore = useUserStore()
const { refreshModal } = useGlobal() // 获取弹登录框的方法

//建立字符串到图标组件的映射
const iconMap = {
  Star,
  EditPen,
  House,
  ChatLineRound
}
const router = useRouter()

const props = defineProps({
  circleMenuList: {
    type: Array,
    default: () => []
  }
})
const handlers = {//发射bus总线事件
  handlerFocusTextarea() {
    //使当下 article => CommentTextArea => textarea DOM => focus()

    // 发射事件（和vue2 $emit 一样）
    bus.emit('focusTextarea')
  }
}
const clickMenu = (menu) => {
  //解构出路由路径
  const { route, handler, icon } = menu
  //特殊处理 点击星星
  if (icon === 'Star') {
    // 检查登录
    if (!userStore.token) {
      refreshModal('login')//登录弹窗
      ElNotification({
        message: '登录后即可点赞',
        type: 'warning'
      })
      return//退出整个 clickMenu 函数
    }
    likesStore.toggle()
    return
  }
  if (route) {
    //路由跳转 跳转到指定页面
    router.push(route)
  }

  //handler如果存在,执行handler
  if (handler) {
    handlers[handler] && handlers[handler]()
  }
}

// 计算是否已点赞（用于样式）
const isLiked = computed(() =>
  likesStore.isLiked
)

</script>

<style lang="stylus">
/* 容器布局 */
.blog-circle-menu
  display flex
  flex-direction column
  gap 12px  /* 按钮间距 */
  align-items center
.el-button+.el-button
  margin 0
/* 按钮基础样式 + 动画 */
.el-button.el-button--large.is-circle.blog-btn-menu 
  width 50px
  height 50px
  font-size 20px
  border-radius 30%
  // border none
  background #fff
  transition all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) /* 所有变化都平滑过渡 */
  .el-icon
    color #2D2F33
    transition color 0.28s ease

/* 悬浮动画：放大 + 阴影 + 背景 */
.el-button.el-button--large.is-circle.blog-btn-menu:hover
  background-color #2D2F33
  transform scale(1.12)  /* 轻微放大 */
  box-shadow 0 8px 16px rgba(0,0,0,0.15)  /* 柔和阴影 */
  border none

/* 悬浮图标变白 */
.el-button.el-button--large.is-circle.blog-btn-menu:hover .el-icon
  color #fff
.el-button.el-button--large.is-circle.blog-btn-menu:focus
  border none
  box-shadow none
/* 点击时缩小反馈*/
.el-button.el-button--large.is-circle.blog-btn-menu:active
// active鼠标正在按下去（按住的瞬间）
  border none
  box-shadow none
  transform scale(0.95)

/* 菜单入场/离场动画 */
.circle-move
  transition transform 0.4s ease-out
.circle-enter-active
  transition all 0.4s ease-out
.circle-enter-from
  opacity 0
  transform translateX(-30px) scale(0.8)
.circle-leave-to
  opacity 0
  transform translateX(-20px) scale(0.9)

/* 点赞按钮激活样式*/
.el-button.el-button--large.is-circle.blog-btn-menu.is-active
  background-color #FFB802
  border-color #f5dab1
  .el-icon
    color #111
</style>