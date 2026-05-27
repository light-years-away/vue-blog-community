const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../core/util/util')

/*
  username: 用户名 
  type: String
  validate:/数字+字母 6-8位/:/^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/ 
  required true 必填
  unique true 唯一
  

  passowrd 密码
  type: String
  select false 不可查
  set: encrypt(value) RSA加密
  validate: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/ 
  required true


  email 邮箱
  type: String
  validate /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/ "请输入合法邮箱地址"
  unique true 

  avatar 头像
  type: String (URL)
  default: "http://127.0.0.1:3000/public/images/avatar.jpg"
  

  nikname 昵称
  type: String
  validate: /^([\w\W]){1,8}$/ 昵称长度 1-8位
  default: "用户"

*/
const schema = new mongoose.Schema({
  username: {
    required: [true, '用户名必填'],//必填
    type: String,
    validate: {
      validator(val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-8位"
    },
    //唯一
    unique: true
    /* 
    unique 不是 Mongoose 的校验器（Validator），它是 MongoDB 数据库的 “索引” 级别约束。
    你可以写 unique: true，但不能像 required 那样写成数组加自定义消息。
    如果违反了 unique 约束，Mongoose 抛出的错误代码是 duplicate key error，这也是为什么你在 app.js 的错误处理中间件里专门写了一段代码来捕获这个错误并手动翻译消息。
    
    */
  },
  password: {
    type: String,
    select: false,//不可查
    required: [true, '密码必填'],
    validate: {//validate在set后触发
      validator(val) {//如果val等于 "密码格式不正确"返回错误信息message
        return val !== '密码格式不正确'
      },
      message: "密码必须为 数字+密码(大小写) 8-12位"
    },
    set(val, schematype) {
      let isValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/.test(decrypt(val))//前端传过来是加密一次后的密码.需要先解密一次再验证
      if (isValidate) {
        return encrypt(val)
      }
      return '密码格式不正确'
    }
  },
  email: {
    type: String,
    required: [true, '邮箱必填'],
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true
  },
  avatar: {
    type: String, //URL,
    default: "http://127.0.0.1:3000/user/avatar.jpg"//默认值
  },
  nikname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    },
    default: '用户' + ~~(Math.random() * 99999),

    unique: true//唯一
  },
  signature: {
    type: String,
    default: '这个人很懒, 什么都没有写 ^_^'
  }
})


// 'User' 代表数据库里的集合名 (类似 SQL 的表名)
module.exports = mongoose.model('User', schema)


/*
  User
    ref: Null

  Article
    ref:{
      comments:Comment,
      column:Column,
      author:Author
    }

  Comment
    ref:{
      uid:User,
      aid:Article
    }

  Column
    ref:{
      aids:Article
    }

*/