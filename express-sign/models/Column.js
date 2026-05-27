/*
 * @Author: 
 * @Date: 2026-02-07 14:50:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-11 20:44:38
 * @Description: 
 * @FilePath: \express-sign\models\Column.js
 */
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now
  },
  //文章 ids
  aids: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Article"
    }
  ],
  uid: {
    type: mongoose.SchemaTypes.ObjectId,
  }
})
schema.set('toJSON', { getters: true })
module.exports = mongoose.model('Column', schema)