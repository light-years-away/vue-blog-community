/*
 * @Author: 
 * @Date: 2026-02-01 13:56:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-16 17:17:55
 * @Description: 
 * @FilePath: \付浩哲_vue第四十天_20260407\express-sign\routes\upload.js
 */
const express = require('express');
const router = express.Router();
const assert = require('http-assert');
const multer = require("multer")//multer 处理 multipart/form-data 类型的文件上传
const { uploadPath, uploadURL, maxFileSize } = require('../config')
const path = require('path')
const fs = require('fs');
const createError = require('http-errors');

const FILE_TYPE = {
  'user': 'user',
  'article': 'article'
}

const storage = multer.diskStorage({
  //存储位置
  //生成一个磁盘缓存 (预设文件的存储地址 和 文件名)
  destination(req, file, cb) {//处理文件的存储地址
    // req 请求发展到multer中间件调用时的 request
    // file 上传的文件对象 可以在这里结合 req 和 file 提供的信息 动态的声明 修改 存储文件的路径
    // cb(this指向,存储文件的路径)
    let fileType = FILE_TYPE[req.params['classify'].trim()] ?? "other";
    const filePath = path.join(uploadPath, fileType)
    fs.existsSync(filePath) || fs.mkdirSync(filePath);//filePath如果不存在 同步 创建filePath文件夹(阻塞后续代码,直到创建完成)
    cb(null, filePath);//存储文件到filePath
  },
  filename(req, file, cb) {//处理文件名
    // req 请求发展到multer中间件调用时的 request
    // file 上传的文件对象 可以在这里结合 req 和 file 提供的信息 动态的声明 修改 存储文件的文件名
    // cb(this指向,文件的存储文件名)
    const { ext, base, name } = path.parse(file.originalname)//获取文件原始名 和 后缀
    // 把文件名里的空格替换成下划线，避免 URL 空格问题
    const safeName = name.replace(/\s+/g, '_')
    cb(null, name + '_' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  }
})

//upload.single('file')指定字段名称file
router.post('/:classify', upload.any(), async (req, res, next) => {

  try {
    let fileType = FILE_TYPE[req.params['classify']] ?? ''
    assert(fileType, 400, '文件上传分类不正确')
    // let { _id} = req.body
    // console.log(req.body)
    // if (fileType === 'user') {
    //   assert(_id, 422, '用户头像必须指定UID')
    // }
    // console.log(req.file)
    let fileURLS = req.files.map(item => {
      let { destination, filename } = item
      // console.log(uploadURL, path.parse(destination).name, filename)
      console.log(filename, '--------')
      console.log(item)
      return path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://').replace(/^\.\//, ''); //去掉开头的 ./
    })
    let resultData = {
      message: "上传成功",
      data: {
        fileURL: fileURLS[0]//单文件上传
      }
    }
   
    if (fileType === 'article') {//适配前端wangEditor
      // 单图上传
      if (fileURLS.length === 1) {
        resultData = {
          message: "文章图片上传成功",
          errno: 0,
          data: {
            url: fileURLS[0] // 改成带url的对象，不是纯字符串
          }
        }
      }
      // 多图上传
      else {
        resultData = {
          message: "文章图片上传成功",
          errno: 0,
          data: fileURLS.map(url => ({ url })) // 多图返回对象数组，每个元素带url
        }
      }
    }
    res.send(200, resultData)
  } catch (err) {
    next(err)
  }

})


module.exports = router;
