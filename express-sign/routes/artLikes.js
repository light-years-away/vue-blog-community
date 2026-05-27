/*
 * @Author: 
 * @Date: 2026-03-25 13:18:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 14:50:18
 * @Description: 
 * @FilePath: \express-sign\routes\artLikes.js
 */
const express = require('express');
const router = express.Router();
const Article = require('../models/Article')
const assert = require('http-assert')

/* post 文章点赞/取消点赞 */
router.post('/:id', async (req, res, next) => {
  let id = req.params.id
  let userId = req._id //从 token 拿到的当前用户 ID
  try {
    //查文章
    let article = await Article.findById(id)
    assert(article, 404, '文章不存在')

    //判断用户是否已经点过赞
    let isLiked = article.like_users.includes(userId)

    let updateQuery = {}

    if (isLiked) {
      //已点赞 -> 取消点赞
      updateQuery = {
        $pull: { like_users: userId }, // 从数组移除
        $inc: { like_num: -1 }        // 数量减 1
      }
    } else {
      //未点赞 -> 点赞
      updateQuery = {
        $addToSet: { like_users: userId }, // 把用户 ID 加到 like_users 数组里 但如果已经有了 就不加了
        $inc: { like_num: 1 }  // 数量加 1
      }
    }


    //执行更新
    await Article.findByIdAndUpdate(
      id,// 查找条件 通过 ID 找文章
      updateQuery,
      {
        new: true//{ new: true } = 返回更新后的数据，而不是更新前的旧数据
      })


    res.send(200, {
      message: '点赞成功',
      data: {
        message: isLiked ? '取消点赞成功' : '点赞成功'
      }
    })
  } catch (err) {
    next(err)
  }

});

module.exports = router;
