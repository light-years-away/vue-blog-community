/*
 * @Author: 
 * @Date: 2026-03-14 18:11:39
 * @LastEditors: 
 * @LastEditTime: 2026-03-14 18:11:53
 * @Description: 
 * @FilePath: \付浩哲_vue第二十二天_20260314\elementui\src\plugins\http.js
 */
import http from '@/api/http'

const install = function (Vue) {
  if (install.installed) return
  install.installed = true
  Object.defineProperties(Vue.prototype, {
    $api: {
      get () {
        return http
      },
      enumerable: false, // 不可枚举
      configurable: false // 不可重写
    }
  })
}

export default install