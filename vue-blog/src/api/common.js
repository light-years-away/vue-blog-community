/*
 * @Author: 
 * @Date: 2026-03-14 17:17:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-24 08:50:00
 * @Description: 
 * @FilePath: \vue-blog\src\api\common.js
 */
import axios from 'axios'
import store from 'store'
import base from '@/config/base.config'

const { BASE_URL, TIMEOUT, TOKEN_NAME } = base
const service = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT
})

//请求拦截器
service.interceptors.request.use(async (config) => {
  let token = store.get(TOKEN_NAME)//localstorage获取token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error);
});

//响应拦截器
service.interceptors.response.use((response) => {
  //剥离最外层
  let result = response.data // 剥掉 axios 外层  { code:200, data:{ key, svg } }
  return result?.data;//剥掉 {code,data} → { key, svg }
}, (error) => {
  return Promise.reject(error);
});

export default service


