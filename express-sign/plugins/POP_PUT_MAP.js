/*
 * @Author: 
 * @Date: 2026-02-03 20:37:59
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-03 21:48:31
 * @Description: 
 * @FilePath: \付浩哲_Node第五十天_20260203\express-sign\plugins\POP_PUT_MAP.js
 */
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Article": {
    "revisable": ["title", "cover", "content"],//可修改字段
    "authField": "author"//authField存在的目的就是统一表中用户id字段名  便于之后将token中 此用户的id 与数据库中 要修改的资源所属用户的id 进行对比
  },
  "User": {
    "revisable": ["password", "email", "nikname"],
    "authField": "_id"
  },
  "Comment": {
    "revisable": ["content"],
    "authField": "uid"
  },
  "Column": {
    "revisable": ["name"],
    "authField": "uid"
  }
}

