/*
 * @Author: 
 * @Date: 2026-02-04 18:27:13
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-31 20:07:25
 * @Description: 
 * @FilePath: \express-sign\routes\admin.js
 */
var express = require('express');
const router = express.Router();
const { sendToken } = require('../core/sendToken')
const User = require('../models/User');
const assert = require('http-assert');
const createError = require('http-errors')
const QUE_MAP = require('../plugins/QUE_MAP')
const { decrypt, encrypt } = require('../core/util/util')
const captchaVerify = require('../middleware/captcha')

const CLASSIFY = {
  'login': "login",
  'register': "register"
}

// 登录/注册都必须先过验证码校验
router.post('/:classify', captchaVerify, async (req, res, next) => {
  let { username, password } = req.body
  let { classify } = req.params

  let isClassPass = classify in CLASSIFY
  assert(isClassPass, 400, '无效的请求')
  let user

  try {
    if (!username || username?.trim()?.length === 0 || !password || password?.trim()?.length === 0) {
      assert(false, 422, "账号密码必填")
    }

    if (classify === 'login') {
      user = await User.findOne({ username }).select('+password')// +password 设置 追加 返回password内容(如果只写password最后findOne结果只会返回password一个字段) password Schema设置select为false时使用
      assert(user, 422, "用户不存在")
      //校验密码
      assert.equal(decrypt(password), decrypt(decrypt(user.password)), 422, '账号密码错误')//对比password和decrypt(user.password),如果为false返回422账号密码错误
    }
    if (classify === 'register') {
      user = await User.create(req.body)
    }

    //生成token
    let token = await sendToken(user)
    res.status(200).json({
      message: '登录成功',
      data: {
        userId: user._id,
        token: token
      }
    })

  } catch (err) {

    next(err)
  }

})
module.exports = router;