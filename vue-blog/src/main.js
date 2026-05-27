/*
 * @Author: 
 * @Date: 2026-03-11 14:25:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-07 17:40:42
 * @Description: 
 * @FilePath: \vue-blog\src\main.js
 */
import { createApp } from 'vue'
// import './style.css'
import router from './router'
import App from './App.vue'
import './assets/css/global.styl'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import { createPinia } from 'pinia'
import http from './api/http'
import 'github-markdown-css/github-markdown.css'
// import Vant from 'vant';
// import 'vant/lib/index.css';


const app = createApp(App)
// 创建 Pinia 实例并挂载
const pinia = createPinia()
// app.use(Vant);
app.use(router)
app.use(pinia)
app.config.globalProperties.$api = http//挂载全局 $api

// app.use(ElementPlus)

app.mount('#app')


