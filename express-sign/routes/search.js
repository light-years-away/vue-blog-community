/*
 * @Author: 
 * @Date: 2026-02-03 19:37:01
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-04 22:25:32
 * @Description: 
 * @FilePath: \付浩哲_Node第五十一天_20260204\express-sign\routes\search.js
 */
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { pagination } = require('../core/util/util')
/*
  文章搜索 search API

  搜索title content

  http://127.0.0.1:3000/search?q=你好
*/

router.get('/', async (req, res, next) => {
  let { q = '' } = req.query
  let regExp = new RegExp(q, 'i')

  let options = ["title"],//查询文章只返回title
    page = 1,
    size = 100,
    query = {
      $or: [
        { title: { $regex: regExp } },
        { content: { $regex: regExp } },
      ]
    },
    dis = 8

  try {
    let result = await pagination({ model: Article, query, options, size, page, dis })
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (err) {
    next(err)
  }

});

module.exports = router;