/*
 * @Author: 
 * @Date: 2026-04-07 16:01:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-06-01 00:00:08
 * @Description: 
 * @FilePath: \express-sign\plugins\RESOURCE_POST_MAP.js
 */

module.exports = {
  "Article": {//上传文章时的联动操作
    "body": function (body, _id) {
      return {
        ...body,
        author: _id//自动注入作者id
      }
    }
  },
  "Column": {//上传分类时的联动操作
    "body": function (body, _id) {
      return {
        ...body,
        uid: _id//自动注入创建者id
      }
    }
  }
}
