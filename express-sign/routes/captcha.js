/*
 * 验证码路由
 * GET /captcha → 返回 SVG 图片 + key
 */
const express = require('express')
const router = express.Router()
const svgCaptcha = require('svg-captcha')
const captchaStore = require('../core/captchaStore')

router.get('/', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,            // 4 位字符
    ignoreChars: '0o1il', // 排除容易混淆的字符
    noise: 3,           // 干扰线条数
    color: true,        // 彩色文字
    background: '#f0f0f0'
  })

  const key = captchaStore.set(captcha.text)  // 存答案，拿 key

  res.send({
    code: 200,
    data: {
      key,               // 前端提交时带上这个 key
      svg: captcha.data  // SVG 字符串，前端直接 <img src="data:image/svg+xml,..."> 或 v-html
    }
  })
})

module.exports = router
