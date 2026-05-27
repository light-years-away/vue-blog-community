/*
 * @Author: 
 * @Date: 2026-03-14 17:40:31
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-17 23:45:09
 * @Description: 
 * @FilePath: \vue-blog\src\stores\userStore.js
 */
import { defineStore } from 'pinia'
import store from 'store'
import base from '@/config/base.config'
import http from '@/api/http'
import { io } from 'socket.io-client'
import { ElNotification } from 'element-plus'

const { TOKEN_NAME } = base

export const useUserStore = defineStore('user', {
  state: () => ({
    token: store.get(TOKEN_NAME) || '',
    userInfo: {},
    //全局socket实例
    ws: null,
    //标记是否主动退出（防止顶号提示误触发）
    isManualLogout: false,

    isWsConnected: false //纯 Vue 响应式布尔值
  }),

  // getters: {
  //   getUserInfo(state) {
  //     if (state.token) {
  //       return state.userInfo
  //     }
  //   }
  // },
  getters: {
    wsConnected: (state) => state.isWsConnected//直接用 state 里的响应式布尔值，不依赖 Socket 内部
  },
  //actions对应 Vuex的 mutations + actions
  actions: {
    SET_TOKEN() {
      this.token = store.get(TOKEN_NAME)
    },
    SET_USERINFO(userInfo) {
      this.userInfo = userInfo
    },

    // 登录逻辑
    async login() {
      this.SET_TOKEN()
      await this.getUserInfo()

      //登录成功  自动建立全局socket连接
      this.connectGlobalSocket()

      ElNotification({
        title: '登录成功',
        message: `欢迎你 ${this.userInfo.nikname}`,
        type: 'success',
      })
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        let userInfo = await http({ type: 'getUserInfo' })

        this.SET_USERINFO(userInfo)


      } catch (err) {
        console.log(err)
      }
    },

    //登录后自动连接全局 WebSocket
    connectGlobalSocket() {
      // 避免重复连接
      if (this.ws) {
        return
      }

      //连接服务器
      this.ws = io('ws://127.0.0.1:8888', {
        transports: ['websocket'],
        reconnection: false//Socket.IO 默认会无限重连。服务端断开窗口A后，窗口A过几秒又悄无声息连回来了，导致"踢了等于没踢"。关掉后断开就是真的断开了
      })

      const uid = this.userInfo._id
      const nikname = this.userInfo.nikname
      const avatar = this.userInfo.avatar

      //连接成功 发送上线事件
      this.ws.on('connect', () => {
        console.log('全局Socket连接成功')

        //手动更新响应式状态
        this.isWsConnected = true

        //发送上线事件
        this.ws.emit('online', { uid, nikname, avatar })
      })


      //只要连接断了 不管什么原因，都会走 disconnect
      this.ws.on('disconnect', (reason) => {
        //手动更新响应式状态
        this.isWsConnected = false
        if (this.isManualLogout) {//主动退出 不提示
          return
        }

        //服务器强制断开 被顶号（排除客户端主动断开）
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          ElNotification({
            title: '账号已下线',
            message: '你的账号已在其他设备登录，请重新登录',
            type: 'error',
          })
        }
        //刷新/关闭/断网 不做任何提示

        //清空登录状态
        this.token = ''
        store.remove(TOKEN_NAME)
        this.userInfo = {}
        this.ws = null
      })
    },

    //主动退出登录（关闭socket）
    logout() {
      this.isManualLogout = true

      if (this.ws) {
        this.ws.close()
        this.ws = null
      }

      //清空登录状态
      this.token = ''
      store.remove(TOKEN_NAME)
      this.userInfo = {}

      ElNotification({
        title: '退出成功',
        type: 'info'
      })
    }
  }
})