/*
 * @Author: 
 * @Date: 2026-01-27 18:46:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-04 18:51:04
 * @Description: 
 * @FilePath: \付浩哲_Node第五十一天_20260204\express-sign\plugins\db.js
 */
//引入mongoose
const mongoose = require('mongoose')
//连接数据库 协议://host:port/db_name
mongoose.connect('mongodb://127.0.0.1:27017/blog', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
})
//获取连接控制
let db = mongoose.connection;
//监听连接时发生的事件
db.on("error", (err) => {
  console.log(err)
})
//监听数据库连接打开
db.on("open", () => {
  console.log("数据库已连接")
})

module.exports = {
  mongoose
}