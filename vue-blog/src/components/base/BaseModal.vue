<!--
 * @Author: 
 * @Date: 2026-03-12 21:05:15
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 17:58:32
 * @Description: 
 * @FilePath: \vue-blog\src\components\base\BaseModal.vue
-->
<template>
  <div>
    
    <el-dialog v-model="modalStore.isShow" :title="title" :width="width" :before-close="handleBeforeClose">
      <BaseForm v-if="formType" :type="modalStore.type" ref="baseFormRef" />
      <template #footer>
        <div class="dialog-footer">
          <el-button v-for="btn in btns" :key="btn.targetName" @click="handlerBtn(btn.targetName, btn.isSubmit)">{{
            btn.name }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, reactive, watch, computed, getCurrentInstance } from 'vue'
//引用pinia
import { useModalStore } from '@/stores/modalStore.js'
import MODAL_DATA from '@/config/modal.config.js'

import BaseForm from './BaseForm.vue'
import bus from '@/util/bus'//全局bus总线

// 拿到全局 $api
const { proxy } = getCurrentInstance()

//创建 Store 实例
const modalStore = useModalStore()



const baseFormRef = ref(null)//Vue3 自动把模板中 ref="baseFormRef" 对应的实例，赋值给这个变量的 .value，本质和 $refs 是同一个逻辑


//计算属性
const title = computed(() =>
  MODAL_DATA[modalStore.type]?.title ?? '默认modal标题'
)
const width = computed(() =>
  MODAL_DATA[modalStore.type]?.width ?? '60%'
)
const formType = computed(() =>
  MODAL_DATA[modalStore.type]?.formType
)
const btns = computed(() =>
  MODAL_DATA[modalStore.type]?.btns ?? [
    { targetName: 'close', name: '取消' },
    { targetName: 'confirm', name: '提交' }
  ]
)
const needUpdate = computed(() =>
  MODAL_DATA[modalStore.type]?.needUpdate
)
//method选项 替代 Vue2 的 methods 
const handleBeforeClose = () => {
  modalStore.close()
}
const submitForm = () => {
  if (baseFormRef.value) {
    baseFormRef.value.validate(async (valid) => {
      if (valid) {
        console.log('提交成功')
        // modalStore.confirm()
        // modalStore.close()
        // console.log('---------', baseFormRef.value.form)
        
        const result = await proxy.$api({
          type: formType.value,
          data: baseFormRef.value.form // 表单数据
        })
        
        modalStore.close()

        if (needUpdate.value) {//需要更新
          // 发射事件（和vue2 $emit 一样）
          bus.emit('updateView')
        }
        console.log('接口返回', result)
      } else {
        console.log('提交失败')
        return false
      }
    })
  }
}
const handlerBtn = (action, isSubmit) => {
  //事件代理 close confirm
  if (isSubmit) {
    submitForm()
    return
  }
  modalStore[action] && modalStore[action]()
}

</script>

<style></style>