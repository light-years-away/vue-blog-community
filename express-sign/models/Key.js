/*
 * @Author: 
 * @Date: 2026-02-01 11:48:41
 * @LastEditors: 
 * @LastEditTime: 2026-02-01 11:49:04
 * @Description: 
 * @FilePath: \付浩哲_Node第四十八天_20260131\express-sign\models\Key.js
 */
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Key', schema)