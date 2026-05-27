/*
 * @Author: 
 * @Date: 2026-01-29 18:15:38
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-01-29 18:43:22
 * @Description: 
 * @FilePath: \付浩哲_Node第四十六天_20260129\express-sign\db.user.js
 */
const { encrypt } = require('./util/util')
let mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/blog")
let db = mongoose.connection

db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', () => {
  console.log('connected!!!')
})

let userSchema = new mongoose.Schema({
  username: {
    required: [true, '用户名必填'],//必填
    type: String,
    validate: {
      validator (val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-8位"
    },
    //唯一
    unique: true
  },
  password: {
    type: String,
    select: false,//不可查
    required: true,
    set (val) {//Mongoose 的 set 方法（字段设置器）不支持异步函数
      //触发器 setter 写入password时触发 写入数据 => encrypt(源数据) 二次加密
      return encrypt(val)
    }
  },
  email: {
    type: String,
    required: true,//必填
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true//唯一
  },
  avatar: {
    type: String, //URL,
    default: "http://127.0.0.1:3000/public/images/avatar.jpg"//默认值
  },
  nikname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    }
  }
})

let User = mongoose.model('User', userSchema)



User.create({
 username:"fhz1234",
 password:"1234des",
 email:"8765456789@qq.com"
}).then(doc => {
  console.log(doc)
}).catch(err => {
  console.log('错误 ---------------------')
  //unique 唯一项目出错判断
  if (err.message.indexOf('duplicate key error') !== -1) {
    console.log('唯一项重复', err.keyPattern)
    return
  }
  //required validate err.errors
  Object.entries(err.errors).map(([key, val]) => {
    console.log(`error: ${key}, ${val.message} `)
  })
  // console.log(err.errors)
})