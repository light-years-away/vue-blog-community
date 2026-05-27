/*
 * @Author: 
 * @Date: 2025-12-09 14:24:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-01-20 17:34:20
 * @Description: 
 * @FilePath: \express-sign\routes\index.js
 */
//无用
var express = require('express');
var router = express.Router();
const { expressjwt } = require('express-jwt')//token验证中间件 JWT
const { getPrivateKey, getPublicKey, getPublicKeySync } = require('../core/rsaControl')
const userControl = require('../core/userControl')
const createError = require('http-errors');
const { getUserStatusMsg } = require('../core/statusControl')


/* GET home page. */
router.post('/', expressjwt({
  secret: getPublicKeySync(), //公钥验签
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async function (req, payload) {
    console.log('解密后的 payload:', payload)


    // 只有有 Token 时，payload 才会有值；无 Token 时 payload 为 undefined
    if (!payload) return false; // 无 Token 时直接放行
    let { iat, user_name, user_id } = payload.payload
    req.username = user_name
    req.userID = user_id

    const result = await userControl.verifyToken(user_name, user_id)//验证Token
    req.isPass = result.statusCode === getUserStatusMsg('USER_FOND')['statusCode'];
    console.log('USER_FOND:', req.isPass);
    return false; // 始终放行（Token 有效/无效都交给业务逻辑处理）
  }
}), async function (req, res, next) {
  if (req.isPass) {
    let result = getUserStatusMsg('USER_LOGIN')
    result.statusCode = 200
    res.status(200)
    res.json({
      ...result,
    })
  } else {
    let result = getUserStatusMsg('USER_FAILED')
    res.status(200)
    res.json({
      ...result,
    })
  }
})

module.exports = router;
