<!--
 * @Author: 
 * @Date: 2026-04-03 11:04:47
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 17:17:27
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\base\BaseDialog.vue
-->
<template>
  <van-dialog v-model:show="show" :title="title" :show-cancel-button="false" :show-confirm-button="false">
    <!-- 自定义标题插槽：登录注册切换Tab-->
    <template #title>
      <div class="dialog-tab-wrap">
        <div v-for="tab in tabList" :key="tab.value" class="dialog-tab-item" :class="{ isactive: type === tab.value }"
          @click="switchTab(tab.value)">
          {{ tab.label }}
        </div>
      </div>
    </template>

    <BaseForm ref="baseFormRef" class="blog-m-dialog-form" :type="type" v-if="show" />
    
    <template #footer>
      <div class="blog-m-dialog-footer">
        <van-button class="blog-m-dialog-cancel-btn" @click="handleCancel">取消</van-button>
        <van-button class="blog-m-dialog-confirm-btn" type="primary" :loading="isSubmitting" :disabled="isSubmitting"
          @click="handleConfirm">
          {{ isSubmitting ? '提交中...' : '确认' }}
        </van-button>
      </div>
    </template>
  </van-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

import BaseForm from '@/mcomponents/base/BaseForm.vue'
import MODAL_DATA from '@/config/modal.config'
import bus from '@/util/bus'

// 拿到全局 $api
const { proxy } = getCurrentInstance()

//状态
const show = ref(false)
const type = ref('login')
const baseFormRef = ref(null)
const isSubmitting = ref(false) //提交中状态

//Tab配置
const tabList = ref([
  { label: '登录', value: 'login' },
  { label: '注册', value: 'register' }
])

//切换Tab
const switchTab = (tabValue) => {
  //切换表单类型
  type.value = tabValue
  //切换时重置状态，避免上一个表单的校验错误、提交状态残留
  isSubmitting.value = false
  
  baseFormRef.value.resetForm()
}

// 计算属性
const title = computed(() => MODAL_DATA[type.value]?.title ?? '弹窗')
const formType = computed(() => MODAL_DATA[type.value]?.formType)

//打开弹窗
const showDialog = (t) => {
  type.value = t
  show.value = true
}
//取消按钮
const handleCancel = () => {
  show.value = false
}
//关闭前拦截
const handleConfirm = async () => {

  const formComp = baseFormRef.value
  if (!formComp) return

  try {
    //先校验
    await formComp.formRef.validate()

    //校验通过，开启 loading
    isSubmitting.value = true

    //发送请求
    proxy.$api({
      type: formType.value,
      data: formComp.form
    })

    /* 
      // 强制延时 1.5 秒，看清 loading 效果
      await Promise.all([
        proxy.$api({
          type: formType.value,
          data: formComp.form
        }),
        new Promise(resolve => setTimeout(resolve, 3000)) // 强制等 1.5 秒
      ]) 
    */

    //请求成功
    showToast('提交成功')
    isSubmitting.value = false
    show.value = false // 手动关闭弹窗

  } catch (err) {
    //失败处理
    isSubmitting.value = false

    //只提示接口错误，不提示校验错误（Vant已自动显示）
    if (err && err.message && !err.errors) {
      showToast(err.message || '操作失败')
    }

  }
}



bus.on('dialog-show', showDialog)
// 事件监听
onMounted(() => {

})

onBeforeUnmount(() => {
  bus.off('dialog-show', showDialog)
})
</script>

<style lang="stylus">
// Tab容器
.dialog-tab-wrap
  display flex
  align-items center
  justify-content center
  gap 30px
  padding 10px 0 0

// Tab单项
.dialog-tab-item
  position relative
  font-size 16px
  font-weight 500
  color #666
  cursor pointer
  transition color 0.2s ease
  user-select none

  // 选中态，完全复用你提供的下划线样式
  &.isactive
    color #000
    &::after
      content ''
      position absolute
      bottom 0
      left 50%
      transform translateX(-50%)
      width 20px
      height 2px
      background-color #000
.blog-m-dialog-form
  padding 20px 10px

//底部按钮容器
.blog-m-dialog-footer
  display flex
  gap 12px
  padding 12px 16px
  border-top 1px solid #f0f0f0
  //确认按钮
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
      // Loading 图标
      & .confirm-btn :deep(.van-loading__spinner)
          width 18px
          height 18px
          border 2px solid transparent
          border-top-color #fff
          border-radius 50%
          animation spin 0.8s linear infinite
//取消按钮
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



@keyframes spin
  from
    transform rotate(0deg)
  to
    transform rotate(360deg)
</style>