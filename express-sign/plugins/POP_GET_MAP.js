/*
 * @Author: 
 * @Date: 2026-02-03 20:24:03
 * @LastEditors: 
 * @LastEditTime: 2026-02-03 20:38:32
 * @Description: 
 * @FilePath: \付浩哲_Node第五十天_20260203\express-sign\plugins\POP_GET_MAP.js
 */
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Article": {
    "queryAct": "findByIdAndUpdate",
    "options": function () {
      return {
        "$inc": {
          "hit_num": 1//文章点击量加1
        }
      }
    }
  }
}
