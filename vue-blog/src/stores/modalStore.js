/*
 * @Author: 
 * @Date: 2026-03-13 10:17:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-14 18:30:06
 * @Description: 
 * @FilePath: \付浩哲_vue第二十二天_20260314\elementui\src\stores\modalStore.js
 */
import { defineStore } from "pinia";


//defineStore第一个参数是命名空间id
export const useModalStore = defineStore('modal', {
  state:() => ({
    isShow:false,
    type:''
  }),

  //替代 Vuex 的 mutations + actions 
  //Pinia 中统一用 actions 处理 支持同步/异步
  actions: {
    close() {
      this.isShow = false // 直接修改 state，无需 commit
    },
    open(type) {
      this.type = type
      this.isShow = true
    },
    confirm() {
      console.log("提交")
    }
  },
  //计算属性
  getters: {}
})