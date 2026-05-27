/*
 * @Author: 
 * @Date: 2025-12-09 22:32:00
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-01 12:54:20
 * @Description:
 * @FilePath: \付浩哲_Node第四十八天_20260131\express-sign\routes\getPubKey.js
 */
var express = require('express');
const { getPubilcKey } = require('../core/rsaControl')
const router = express.Router();
const Key = require('../models/Key');

/*GET /keys */
router.get('/', async function (req, res, next) {
  let result = await Key.findOne()
  res.send(200, {
    data: {
      message: 'ok',
      data: {
        pubKey: result.content
      }
    }
  })
});

module.exports = router;
