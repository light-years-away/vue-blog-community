/*
 * @Author: 
 * @Date: 2026-02-02 17:23:40
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-17 01:02:17
 * @Description: 
 * @FilePath: \express-sign\models\Article.js
 */
const mongoose = require('mongoose')
const { uploadURL } = require('../config')
const { formatDate } = require('../core/util/util')
const schema = new mongoose.Schema({
  title: {
    type: String,//MongoDB 没有表结构约束必须写 type在代码层面接管类型的检查与转换
    required: true,
    default: "默认标题" + Date.now
  },
  //封面图
  cover: {
    type: String, //URL
    // default: `${uploadURL}article/article-cover.jpg`
  },
  //文章内容
  content: {
    type: String, // URIencode(HTMLCode)
    required: true,
    set(val) {
      try {
        val = decodeURIComponent(`${val}`).replace(/\"/g, "\'")
        return val
      } catch (err) {
        return val
      }
    },
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm')
    }
  },
  //点击量
  hit_num: {
    type: Number,
    default: 0
  },
  //评论数量
  comment_num: {
    type: Number,
    default: 0
  },
  //作者
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User"//声明关联关系的关键字段，等于告诉 Mongoose："author 这个字段存的是 User 表里的一个 ObjectId" 每个文档自动生成的 _id
    //外键  主键 关系。
  },
  //评论集合
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Comment"
    }
  ],
  //分类
  column: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Column',
    default: "6982080efce06d1a34d3d91c",
    required: true,
  },
  //点赞数
  like_num: {
    type: mongoose.SchemaTypes.Number,
    default: 0
  },
  like_users: [//点赞用户的 ID 数组
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }
  ],
})

//schema.set() 是 Mongoose 提供的一个方法，用来设置 Schema 级别的全局配置项
schema.set('toJSON', { getters: true })//给 Article 这个 Schema 打一个标记，告诉它将来转 JSON 时把 getter 也跑一遍

// 等同于你直接在 new Schema 时写：

// new mongoose.Schema({ ... }, { toJSON: { getters: true } })
//                                 ↑ 第二个参数就是 options


//这里 mongoose.model 的第一个参数 'Article'，就是 modelName 的值
module.exports = mongoose.model('Article', schema)