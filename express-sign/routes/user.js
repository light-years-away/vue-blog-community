/*
 * @Author: 
 * @Date: 2026-02-11 19:27:25
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-28 23:40:18
 * @Description: 
 * @FilePath: \express-sign\routes\user.js
 */
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const assert = require('http-assert')
const qs = require('qs')



//修改用户信息
router.put('/', async (req, res, next) => {
  let putData = req.body
  let isPass = req.isPass //鉴权结果
  let userId = req._id //从token中获取userID

  try {
    assert(isPass, 400, "无权修改")

    //手动校验昵称是否重复（排除自己）
    if (putData.nikname) {
      const existUser = await User.findOne({
        nikname: putData.nikname,
        _id: { $ne: userId } //不等于当前用户ID
      })
      // 如果找到重复昵称 → 直接抛出错误
      if (existUser) {
        return next({ message: "昵称已被占用，请更换", status: 400  })
      }
    }

    let result = await User.findByIdAndUpdate(userId, putData, {
      runValidators: true, //runValidators只校验正则 不会校验唯一性
      new: true //返回更新完的最新对象
    })

    res.send(200, {
      message: '修改成功'
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

//查询用户资源详情
router.get('/', async (req, res, next) => {
  let _id = req._id
  try {
    let userResult = await User.findById(_id)
    let articleCount = await Article.find({ author: _id }).count()
    let columnCount = await Column.find({ uid: _id }).count()
    userResult = userResult.toJSON()//bson转换为json
    userResult.articleCount = articleCount
    userResult.columnCount = columnCount
    // console.log(userResult)
    res.send(200, {
      message: '查询成功',
      data: userResult
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})


module.exports = router

