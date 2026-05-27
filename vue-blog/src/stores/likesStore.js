/*
 * @Author: 
 * @Date: 2026-03-25 14:58:00
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 17:23:31
 * @Description: 
 * @FilePath: \vue-blog\src\stores\likesStore.js
 */
import { defineStore } from "pinia";
import { useUserStore } from './userStore'
import http from '@/api/http'

export const useLikesStore = defineStore('likes', {
  state: () => ({
    currentAid: null,// 当前文章 id
    originalLikeUsers: [],//后端返回的 哪些人点过赞 存用户Id
    originalLikeNum: 0,// 后端返回的 原始点赞数
    liked: false, //true/false
    hasChanged: false //记录有没有改过
  }),

  getters: {
    // 控制星星样式
    isLiked: (state) => {
      const userStore = useUserStore()
      const uid = userStore.userInfo?._id
      if (!uid) return false
      return state.liked
    },

    //显示数字
    displayLikeNum: (state) => {
      const userStore = useUserStore()
      const uid = userStore.userInfo?._id
      const originallyLiked = state.originalLikeUsers.includes(uid)

      if (state.liked === originallyLiked) {
        return state.originalLikeNum
      } else if (state.liked && !originallyLiked) {//liked为true 且 数据库 false没点过赞
        return state.originalLikeNum + 1
      } else if (!state.liked && originallyLiked) {//liked为false 且 数据库 true点过赞
        return state.originalLikeNum - 1
      }
      return state.originalLikeNum
    },

    needSync: (state) => state.hasChanged
  },

  actions: {
    // 初始化
    init(aid, likeUsers, likeNum) {
      const userStore = useUserStore()
      const uid = userStore.userInfo?._id

      this.currentAid = aid
      this.originalLikeUsers = likeUsers || []
      this.originalLikeNum = likeNum || 0

      //直接把 liked 设为原始状态
      this.liked = uid ? this.originalLikeUsers.includes(uid) : false
      this.hasChanged = false
    },

    // 点击星星
    toggle() {
      const userStore = useUserStore()
      const uid = userStore.userInfo?._id
      if (!uid) return false

      //直接取反
      this.liked = !this.liked

      // 对比原始状态 看有没有真的改变
      const originallyLiked = this.originalLikeUsers.includes(uid)
      this.hasChanged = this.liked !== originallyLiked

      return true
    },

    // 同步后端
    async syncToServer() {
      if (!this.hasChanged || !this.currentAid) return

      try {
        await http({
          type: 'articleLikes',
          data: { id: this.currentAid }
        })
      } catch (err) {
        console.error('同步失败', err)
      } finally {
        this.hasChanged = false
      }
    },

    // 重置
    reset() {
      this.currentAid = null
      this.originalLikeUsers = []
      this.originalLikeNum = 0
      this.liked = false
      this.hasChanged = false
    }
  }
})