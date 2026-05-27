/*
 * @Author: 
 * @Date: 2026-03-13 10:17:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-22 19:25:21
 * @Description: 
 * @FilePath: \vue-blog\src\config\modal.config.js
 */
export default {
  "login": {
    title: '登录',
    formType: 'login',
    needUpdate: false,
    btns: [
      {
        targetName: 'close',
        name: '取消'
      },
      {
        targetName: 'confirm',
        name: '提交',
        isSubmit: true
      }
    ]
  },
  "column": {
    title: '添加分类',
    formType: 'postColumn',
    needUpdate: true,
    btns: [
      {
        targetName: 'close',
        name: '取消'
      },
      {
        targetName: 'confirm',
        name: '提交',
        isSubmit: true
      }
    ]
  },
  "register": {
    title: '注册',
    formType: 'register',
    btns: [
      {
        targetName: 'close',
        name: '取消'
      },
      {
        targetName: 'confirm',
        name: '注册',
        isSubmit: true
      }
    ]
  },
  "userInfo": {
    title: '个人信息',
    formType: 'userInfo',
    btns: [
      {
        targetName: 'close',
        name: '取消'
      },
      {
        targetName: 'confirm',
        name: '提交',
        isSubmit: true
      }
    ]
  }
}