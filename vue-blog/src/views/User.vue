<!--
 * @Author: 
 * @Date: 2026-03-11 15:41:50
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-27 11:25:41
 * @Description: 
 * @FilePath: \vue-blog\src\views\User.vue
-->
<template>
  <el-card>
    <template #header>
      <div class="clearfix">
        <span>个人信息</span>
      </div>
    </template>
    <BaseForm ref="baseFormRef" type="userInfo" />

    <div class="blog-btn--wrap">
      <el-button type="primary" @click="submit" color="#2D2F33" size="default">提交修改</el-button>
      <el-button type="primary" @click="reset" color="#2D2F33" plain>重置信息</el-button>
    </div>

  </el-card>
</template>


<script setup>
import { ref } from 'vue'
import BaseForm from '@/components/base/BaseForm.vue'
import http from '@/api/http'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import { useRouter } from 'vue-router'

//创建 Store 实例
const userStore = useUserStore()

const router = useRouter()
const baseFormRef = ref(null)
const submit = () => {
  baseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await http({ type: 'putUserInfo', data: baseFormRef.value.form })
        await userStore.getUserInfo()
        router.push('/index')
        ElNotification({
          title: '修改成功',
          message: `个人信息修改成功`,
          type: 'success',
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      return false;
    }
  });
}


// 重置表单用户信息
const reset = () => {
  const formComp = baseFormRef.value
  if (!formComp) return
  formComp.resetForm()
  //重新赋值用户原始信息
  if (userStore.userInfo) {
    formComp.form = { ...userStore.userInfo }
  }
}

</script>

<style lang="stylus">
.blog-btn--wrap
  padding-top 20px
  display flex
  justify-content flex-end
  gap 12px

  .el-button
    border-radius 8px
    font-weight 500
</style>