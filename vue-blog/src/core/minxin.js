/*
 * @Author: 
 * @Date: 2026-03-14 17:15:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-14 17:54:30
 * @Description: 
 * @FilePath: \付浩哲_vue第二十二天_20260314\elementui\src\core\minxin.js
 */
import { useModalStore } from '@/stores/modalStore'

export function useGlobal() {
  const global = "我是vue3minxin混入的属性"

  const modalStore = useModalStore()
  const refreshModal = (type) => {
    modalStore.open(type)
  }

  //返回出去让组件使用
  return {
    global,
    refreshModal
  }
}