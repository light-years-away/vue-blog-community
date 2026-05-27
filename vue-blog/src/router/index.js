/*
 * @Author: 
 * @Date: 2026-03-11 15:36:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 18:18:52
 * @Description: 
 * @FilePath: \vue-blog\src\router\index.js
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Article from '@/views/Article.vue'
import ArticleList from '@/views/ArticleList.vue'
// import Column from '@/views/Column.vue'
// import Editor from '@/views/Editor.vue'
import store from 'store'
import base from '@/config/base.config'
import User from '@/views/User.vue'
import Socket from '@/views/Socket.vue'

//mobile views — 懒加载，桌面端不下载 Vant
const MHome = () => import('@/mviews/MHome.vue')
const MArticleList = () => import('@/mviews/ArticleList.vue')
const MArticle = () => import('@/mviews/Article.vue')
const MUser = () => import('@/mviews/User.vue')
const { TOKEN_NAME } = base

//检测是否为移动端
const isMobile = () => {
  return /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
    navigator.userAgent
  )
}

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/index',//重定向
    component: Home,
    children: [
      {
        path: 'index',
        name: 'index',
        component: ArticleList
      },
      // {
      //   path: '/column',
      //   name: 'column',
      //   component: Column,
      //   meta: {//路由元信息 存储任意自定义数据
      //     requiresAuth: true//需要鉴权
      //   }
      // },
      {
        path: 'article/:id',
        name: 'article',
        component: Article
      },
      {
        path: 'editor',
        name: 'editor',
        component: () => import('@/views/Editor.vue'),// 懒加载写法,提高首屏加载速度（单独拆包，进入页面才加载）
        // component: Editor,
        meta: {
          requiresAuth: true//需要鉴权
        }
      },
      {
        path: 'user',
        name: 'user',
        component: User,
        meta: {
          requiresAuth: true//需要鉴权
        }
      },
      {
        path: 'socket',
        name: 'socket',
        component: Socket,
      },
    ]
  },
  {
    path: '/m',
    name: 'mHome',
    redirect: '/m/index',
    component: MHome,
    children: [
      {
        path: 'index',
        name: 'mArticleList',
        component: MArticleList,
        meta: {
          showTabbar: true,
          showHeadbar: true
        }
      },
      {
        path: 'article/:id',
        name: 'mArticle',
        component: MArticle,
        meta: {
          showTabbar: false,
          showHeadbar: false
        }
      },
      // {
      //   path: 'editor',
      //   name: 'editor',
      //   component: Editor,
      //   meta: {
      //     requiresAuth: true//需要鉴权
      //   }
      // },
      {
        path: 'user',
        name: 'mUser',
        component: MUser,
        meta: {
          // requiresAuth: true//需要鉴权
        }
      },
      // {
      //   path: 'socket',
      //   name: 'socket',
      //   component: Socket,
      // },
    ]
  },
  //不带底部导航的独立页面
  // {
  //   path: '/m/article/:id',
  //   name: 'mArticle',
  //   component: MArticle
  // },
  //后续不需要导航的页面，都放在这里
]

//Vue3中创建路由实例的方式
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

//全局前置守卫
router.beforeEach((to, from) => {
  const mobile = isMobile()
  const requiresAuth = to.meta.requiresAuth
  //在路由守卫中不能直接使用组合式API的 store
  //需要从 store 模块导入 store 实例
  const token = store.get(TOKEN_NAME)//或者从 store 获取

  if (requiresAuth && !token) {
    ElNotification({
      title: '通知',
      message: '请先登录',
      type: 'warning'
    })
    return mobile ? '/m/index' : '/index' //直接返回路径字符串
  }

  //自动判断 PC / 移动端
  if (mobile && !to.path.startsWith('/m')) {
    return '/m' // 手机  去移动端
  }
  if (!mobile && to.path.startsWith('/m')) {
    return '/' // PC  离开移动端
  }
  //不返回任何值或返回 true 表示继续导航
  return true
})

//全局后置守卫
router.afterEach(() => {

})

export default router
