<!--
 * @Author: 
 * @Date: 2026-04-05
 * @Description: 
 * @FilePath: \vue-blog\src\mviews\User.vue
-->
<template>
  <div class="m-user-page">
    <!-- 页面头部 -->
    <van-nav-bar title="个人资料" fixed placeholder />

    <!-- 表单区域 -->
    <div class="form-wrap">
      <BaseForm ref="baseFormRef" type="userInfo" />
    </div>

    <!-- 操作按钮 -->
    <div class="btn-wrap">
      <van-button block type="primary" size="large" :loading="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? '提交中...' : '保存修改' }}
      </van-button>
      <van-button block size="large" style="margin-top: 12px" @click="handleReset">
        重置信息
      </van-button>
      <van-button block size="large"
        style="margin-top: 12px; background-color:#D93025; border-color:#D93025; color:#fff;" @click="handleLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import BaseForm from '@/mcomponents/base/BaseForm.vue'

import { useUserStore } from '@/stores/userStore.js'
import bus from '@/util/bus'
import http from '@/api/http'

const router = useRouter()
const userStore = useUserStore()
const baseFormRef = ref(null)
const isSubmitting = ref(false)


//登录检查
const checkLogin = () => {
  //未登录，直接弹出登录弹窗
  if (!userStore.token) {
    showToast('请先登录')
    bus.emit('dialog-show', 'login')
    return false
  }
  //已登录 确保用户信息已加载
  if (!userStore.userInfo?._id) {
    userStore.getUserInfo()
  }
  return true
}


//提交修改
const handleSubmit = async () => {
  const formComp = baseFormRef.value
  if (!formComp) return

  //先校验登录状态
  if (!checkLogin()) return

  try {
    //先执行表单校验
    await formComp.formRef.validate()

    isSubmitting.value = true
    //调用后端接口
    await http({
      type: 'putUserInfo',
      data: formComp.form
    })
    // 提交成功，更新全局用户信息
    await userStore.getUserInfo()
    showToast('修改成功')
    //返回上一页
    router.back()
  } catch (err) {
    showToast(err.message || '修改失败')
  } finally {
    isSubmitting.value = false
  }
}

//重置信息
const handleReset = () => {
  const formComp = baseFormRef.value
  if (!formComp) return
  formComp.resetForm()
  //重新赋值用户原始信息
  if (userStore.userInfo) {
    formComp.form = { ...userStore.userInfo }
  }
  showToast('已重置')
}


// 退出登录逻辑
const handleLogout = async () => {
  try {
    //退出前加个确认弹窗 防止误触
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      confirmButtonText: '确定退出',
      cancelButtonText: '再想想',
      confirmButtonColor: '#ee0a24' //确认按钮
    })

    //调用 store 的 logout 方法
    userStore.logout()

    //退出成功后 跳转到首页
    router.push('/m/index')

  } catch (err) {
    //用户点击取消
    console.log('用户取消退出')
  }
}


onMounted(() => {
  checkLogin()
})

//监听登录状态变化：登录成功后自动刷新用户信息
watch(
  () => userStore.token,
  (newToken) => {
    if (newToken) {
      userStore.getUserInfo()
    }
  }
)
</script>

<style lang="stylus" scoped>
.m-user-page
  min-height 100vh
  background-color #f5f5f5
  padding-bottom 40px

.form-wrap
  padding 16px
  margin-top 12px

.btn-wrap
  padding 0 16px
  margin-top 24px

.van-button--primary
  background-color #2D2F33
  border none
  border-radius 8px
.van-button--danger
  border-radius 8px
</style>