/*
 * @Author: 
 * @Date: 2026-02-02 18:39:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-03 20:23:27
 * @Description: 
 * @FilePath: \付浩哲_Node第五十天_20260203\express-sign\plugins\POP_POST_MAP.js
 */
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Comment": {
    "_refId": "aid",//这个评论关联的文章id
    "_model": Article,
    "queryAct": "findByIdAndUpdate",
    "options": function (_id) {
      return {
        "$push": {
          "comments": _id//给article的comments数组中push新评论的id
        },
        "$inc": {
          "comment_num": 1//给article的评论数量加1
        }
      }
    }
  },
  "Article": {
    "_refId": "column",//这篇文章关联的分类column
    "_model": Column,
    "queryAct": "findByIdAndUpdate",
    "options": function (_id) {
      return {
        "$push": {
          "aids": _id//给column的aids数组中push新新文章的id
        }
      }
    }
  }
}

/*
 Comment
      ref aid : Article:{
        comments:{
          $push: commentId
        }
    }
    添加一篇文章的时候 要找到对应分类 aids字段push添加文章aid
    Article
      ref column: Column:{
        aids:{
          $push: aid
        }
    }

*/