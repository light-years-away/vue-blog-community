/*
 * @Author: 
 * @Date: 2026-01-29 18:15:38
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-01-29 19:43:22
 * @Description: 
 * @FilePath: \付浩哲_Node第四十六天_20260129\express-sign\db.article.js
 */
const { encrypt } = require('./util/util')
let mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/blog")
let db = mongoose.connection

db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', () => {
  console.log('connected!!!')
})

let articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "默认标题" + Date.now
  },
  //封面图
  cover: {
    type: String, //URL
  },
  //文章内容
  body: {
    type: String, // URIencode(HTMLCode)
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now
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
  //喜欢 点赞
  like_num: {
    type: Number,
    default: 0
  },
  //作者
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
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
    type: String,
    ref: 'Column',
    default: "技术文章"
  }
})

let Article = mongoose.model('Article', articleSchema)

let articleBody="%3C!--%20*%20@Author:%20%20*%20@Date:%202026-01-29%2017:19:37%20*%20@LastEditors:%20%20*%20@LastEditTime:%202026-01-29%2019:00:17%20*%20@Description:%20%20*%20@FilePath:%20%5C%E4%BB%98%E6%B5%A9%E5%93%B2_Node%E7%AC%AC%E5%9B%9B%E5%8D%81%E5%85%AD%E5%A4%A9_20260129%5Cmongoose-test%5Ctest.html--%3E%3C!--%20*%20@Author:%20%20*%20@Date:%202026-01-27%2019:04:01%20*%20@LastEditors:%20Please%20set%20LastEditors%20*%20@LastEditTime:%202026-01-27%2019:42:30%20*%20@Description:%20%20*%20@FilePath:%20%5C%E4%BB%98%E6%B5%A9%E5%93%B2_Node%E7%AC%AC%E5%9B%9B%E5%8D%81%E5%9B%9B%E5%A4%A9_20260127%5Cmongoose-test%5Ctest.html--%3E%3C!DOCTYPE%20html%3E%3Chtml%20lang=%22zh-cn%22%3E%3Chead%3E%20%20%3Cmeta%20charset=%22UTF-8%22%3E%20%20%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1.0%22%3E%20%20%3Ctitle%3EDocument%3C/title%3E%3C/head%3E%3Cbody%3E%20%20%3Cscript%20src=%22./node_modules/axios/dist/axios.js%22%3E%3C/script%3E%20%20%3Cscript%3E%20%20%20%20//%20axios.post('http://127.0.0.1:3000/api/rest/users',%20%7B%20username:%20%22lisi%22,%20password:%20'11111'%20%7D).then(data%20=%3E%20%7B%20%20%20%20//%20%20%20//%20console.log(data)%20%20%20%20//%20%7D).catch(err%20=%3E%20%7B%20%20%20%20//%20%20%20console.log(err)%20%20%20%20//%20%7D)%20%20%20%20axios.get('http://127.0.0.1:3000/api/rest/users',%20%7B%20%20%20%20%20%20params:%20%7B%20%20%20%20%20%20%20%20username:%20%22lisi%22,%20%20%20%20%20%20%20%20password:%20%2211111%22%20%20%20%20%20%20%7D%20%20%20%20%7D).then(data%20=%3E%20%7B%20%20%20%20%20%20//%20console.log(data)%20%20%20%20%7D).catch(err%20=%3E%20%7B%20%20%20%20%20%20console.log(err)%20%20%20%20%7D)%20%20%3C/script%3E%3C/body%3E%3C/html%3E".replace('+','')

Article.create({
  title: "测试文章1",
  body: articleBody,
  author: new mongoose.Types.ObjectId('697b39ce352b6a1c2e1de3ee'),
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