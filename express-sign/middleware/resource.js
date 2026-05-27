/*
 * @Author: 
 * @Date: 2026-01-27 18:35:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-16 21:46:42
 * @Description: 
 * @FilePath: \付浩哲_vue第四十天_20260407\express-sign\middleware\resource.js
 */
const { classify } = require('inflection')
const createError = require('http-errors');

module.exports = options => {//中间件工厂函数
  return async (req, res, next) => {
    // console.log(req)
    // 1. 把 URL 里的复数名词，变成单数且首字母大写
    const modelName = classify(req.params.resource)//users 转化为 User  RESTful 规范建议 URL 全用小写复数，看起来像操作"资源集合"
    try {
      // 2. 动态引入对应的模型文件
      req.Model = require(`../models/${modelName}`)

      // 3. 挂载完成，放行去 bus.js
      next()
    } catch (err) {
      // 如果模型文件不存在，报 404
      next(createError(404))
    }
  }
}