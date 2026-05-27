<!--
 * @Author: 
 * @Date: 2026-03-14 17:56:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 12:27:57
 * @Description: 
 * @FilePath: \vue-blog\src\components\user\UserImgAvatar.vue
-->
<template>
  <div class="blog-header--login">
    <el-dropdown popper-class="user-avatar-dropdown">
      <span class="el-dropdown-link">
        <el-image class="blog-avatar-img" :src="src" fit="cover"></el-image>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 在 /user 路由下禁用 -->
          <el-dropdown-item divided @click="goTo('/user')" :disabled="isInUserPage">个人信息</el-dropdown-item>

          <!-- 在 /editor 路由下禁用 -->
          <el-dropdown-item divided @click="goTo('/editor')" :disabled="isInEditorPage">写作</el-dropdown-item>


          <el-dropdown-item divided @click="userStore.logout">
            <svg t="1774779928799" class="logout-icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="5744" width="256" height="256">
              <path
                d="M597.333333 1006.933333h-477.866666c-58.026667 0-102.4-44.373333-102.4-102.4v-785.066666c0-58.026667 44.373333-102.4 102.4-102.4h477.866666c58.026667 0 102.4 44.373333 102.4 102.4V341.333333c0 10.24-6.826667 17.066667-17.066666 17.066667s-17.066667-6.826667-17.066667-17.066667V119.466667c0-37.546667-30.72-68.266667-68.266667-68.266667h-477.866666c-37.546667 0-68.266667 30.72-68.266667 68.266667v785.066666c0 37.546667 30.72 68.266667 68.266667 68.266667h477.866666c37.546667 0 68.266667-30.72 68.266667-68.266667V682.666667c0-10.24 6.826667-17.066667 17.066667-17.066667s17.066667 6.826667 17.066666 17.066667v221.866666c0 58.026667-44.373333 102.4-102.4 102.4z"
                fill="#d81e06" p-id="5745"></path>
              <path
                d="M989.866667 529.066667H443.733333c-10.24 0-17.066667-6.826667-17.066666-17.066667s6.826667-17.066667 17.066666-17.066667h546.133334c10.24 0 17.066667 6.826667 17.066666 17.066667s-6.826667 17.066667-17.066666 17.066667z"
                fill="#d81e06" p-id="5746"></path>
              <path
                d="M819.2 699.733333c-3.413333 0-10.24 0-13.653333-3.413333-6.826667-6.826667-6.826667-17.066667 0-23.893333l157.013333-157.013334-157.013333-157.013333c-6.826667-6.826667-6.826667-17.066667 0-23.893333s17.066667-6.826667 23.893333 0l170.666667 170.666666c6.826667 6.826667 6.826667 17.066667 0 23.893334l-170.666667 170.666666H819.2z"
                fill="#d81e06" p-id="5747"></path>
            </svg>
            退出登录
          </el-dropdown-item>

        </el-dropdown-menu>
      </template>
    </el-dropdown>

  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL
//创建 Store 实例
const userStore = useUserStore()
const router = useRouter() // 初始化路由
const route = useRoute() // 获取当前路由

const src = computed(() =>
  userStore.userInfo.avatar
)
onMounted(async () => {
  if (userStore.token) {
    await userStore.getUserInfo()//每次组件挂载都获取userInfo
    userStore.connectGlobalSocket()//自动登录时也要连接WebSocket
  }
})
// console.log('真实用户信息：', JSON.parse(JSON.stringify(userStore)))

// 路由跳转方法
const goTo = (path) => {
  router.push(path)
}

const isInEditorPage = computed(() => {
  return route.path === '/editor' // 路由是 /editor 就返回 true
})
const isInUserPage = computed(() => {
  return route.path === '/user' // 路由是 /editor 就返回 true
})


</script>

<style lang="stylus">
.blog-avatar-img
  overflow hidden
  width 40px
  height 40px
  border-radius 50%
/* 去掉聚焦时头像的白色边框 */
.el-dropdown > span:focus {
  outline: none ;
}
.el-dropdown__popper
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.4) !important
// 自定义下拉菜单样式
.user-avatar-dropdown .el-dropdown-menu
  // 修改整个菜单的样式
  background-color #2D2F33
  // border-radius 8px
  color #fff
  
   // 修改菜单项的 hover 效果
  .el-dropdown-menu__item
    border-left 2px solid transparent
    width 127px/* 加宽，解决内容溢出滚动条 */
    padding 12px 20px
    font-size 14px
    transition all 0.3s
    background-color #2D2F33
    color #ccc
    &:hover:not(.is-disabled)//只对非禁用项生效 hover
      background-color #2D2F33
      color #fff
      // padding-left 25px  // 添加左内边距动画
      border-left 2px solid #fff
    //退出登录项的特殊样式
    &:last-child
      display: flex
      align-items: center
      color #f16856
      gap: 8px // 图标和文字的间距
      &:hover:not(.is-disabled)
        border-left 2px solid #f5270c
        color #f16856
      .logout-icon
        width: 18px
        height: 18px
        flex-shrink: 0
        fill: #fa4831 /* 图标红色 */
        stroke: #fa4831 /* 描边加粗 */
        stroke-linejoin: round
        stroke-width: 50 /* 加粗核心参数 */
        transition: all 0.3s
      &:hover .logout-icon
        fill: #f5270c
        stroke: #f5270c
.user-avatar-dropdown .el-dropdown-menu__item.is-disabled
  color #888

.user-avatar-dropdown .el-dropdown-menu__item--divided/* 分割线样式 */
  border-color #666
  margin 0


</style>