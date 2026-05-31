/*
 * 验证码校验中间件
 * 在登录/注册路由之前调用，校验 req.body.captchaKey 和 req.body.captcha
 */
const captchaStore = require('../core/captchaStore')
const assert = require('http-assert')

module.exports = (req, res, next) => {
  const { captchaKey, captcha } = req.body

  assert(captchaKey && captcha, 422, '请填写验证码')

  const isValid = captchaStore.verify(captchaKey, captcha)
  assert(isValid, 422, '验证码错误或已过期，请刷新重试')

  next()
}
