/*
 * @Author: 
 * @Date: 2026-02-09 11:29:36
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-08 11:57:00
 * @Description: 
 * @FilePath: \express-sign\models\Comment.js
 */
const mongoose = require('mongoose')
const { formatDate } = require('../core/util/util')
const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm')
    }
  },
  //评论者 id
  uid: {
    // type: 规定这个字段存的不是普通字符串，而是 ObjectId 类型
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: [true, '评论必须关联用户 uid不能为空']
  },
  //文章 id
  aid: {
    type: mongoose.SchemaTypes.ObjectId,
    //ref: 这里填的是模型的名字（就是 mongoose.model 里的第一个参数）
    //它告诉 Mongoose，这个 ID 是属于 'Article' 那个集合的
    //ref 的唯一作用： 就是个备注。方便后续使用 populate（自动填充）的时候，Mongoose 知道该去哪个表里查数据
    ref: "Article",
    required: [true, '评论必须关联文章 aid不能为空']
  }
})
schema.set('toJSON', { getters: true })//把bson转化为json才能在get(val) {return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm:ss')}中格式化时间
module.exports = mongoose.model('Comment', schema)