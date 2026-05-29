/*
 * @Author: 
 * @Date: 2026-03-25 13:18:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-29 11:51:05
 * @Description: 
 * @FilePath: \express-sign\routes\artLikes.js
 */
const express = require('express');
const router = express.Router();
const Article = require('../models/Article')
const assert = require('http-assert')

/* post 文章点赞/取消点赞
 *
 * 并发安全说明：
 * 旧写法是先 findById 读  判断 isLiked   findByIdAndUpdate 写，
 * "读-写" 之间有间隙，两个并发请求可能读到相同的 like_users，
 * 都判断为"未点赞"，导致 $inc 被重复执行、计数错误。
 *
 * 新写法通过"尝试取消   失败则点赞"的模式，把判断条件塞进查询条件，
 * 第一个 findOneAndUpdate 是查询+更新一步完成的原子操作，消除了读-写竞态。
 * 第二个 findOneAndUpdate 用 $ne 排除已点赞用户，配合 $addToSet 双重保障。
 */
router.post('/:id', async (req, res, next) => {
  let id = req.params.id
  let userId = req._id

  try {
    // 步骤1: 确认文章存在
    let article = await Article.findById(id)
    assert(article, 404, '文章不存在')

    // 步骤2: 原子操作  尝试取消点赞
    // 查询条件带上 userId，只有"已点赞"的文档才会被匹配到
    // 整个 查询+更新 是一次原子操作，不会被其他请求插队
    let result = await Article.findOneAndUpdate(
      { _id: id, like_users: userId },                  // 只有已点赞才命中
      { $pull: { like_users: userId }, $inc: { like_num: -1 } },
      { new: true }
    )

    let isLiked

    if (result) {
      // 命中  原来已点赞  已取消
      isLiked = false
    } else {
      // 未命中  原来没点赞  执行点赞
      // 查询条件用 $ne 排除已有点赞，防止并发重复加
      await Article.findOneAndUpdate(
        { _id: id, like_users: { $ne: userId } },
        { $addToSet: { like_users: userId }, $inc: { like_num: 1 } }
      )
      isLiked = true
    }

    res.send(200, {
      message: '点赞成功',
      data: {
        message: isLiked ? '点赞成功' : '取消点赞成功'
      }
    })
  } catch (err) {
    next(err)
  }

});

module.exports = router;
