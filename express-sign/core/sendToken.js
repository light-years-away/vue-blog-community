/*
 * @Author: 
 * @Date: 2026-01-18 21:18:30
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-16 20:18:22
 * @Description: 
 * @FilePath: \付浩哲_vue第四十天_20260407\express-sign\core\sendToken.js
 */

const jwt = require('jsonwebtoken') //token生成包  JWT
const { getPrivateKey } = require('../core/rsaControl')

module.exports = {
  async sendToken(userinfo) {
    let { username, _id } = userinfo


    let privateKey = await getPrivateKey()
    let token = jwt.sign(
      {
        username,
        _id,
        exp: ~~((Date.now() / 1000) + 24 * 3600 * 3)//JWT 标准字段，过期时间（当前时间 + 3 天） ~~取整
      },// 参数1: payload
      privateKey,// 参数2: 秘钥 对 header + payload 生成数字签名 防止篡改 不防偷看
      { algorithm: 'RS256' } // 参数3: 选项
    );
    return token
  }
}