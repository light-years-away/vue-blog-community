/*
 * @Author: 
 * @Date: 2026-04-07 16:01:44
 * @LastEditors: 
 * @LastEditTime: 2026-04-08 11:31:19
 * @Description: 
 * @FilePath: \express-sign\plugins\RESOURCE_POST_MAP.js
 */

module.exports = {
  "Article": {
    "body": function (body, _id) {
      return {
        ...body,
        author: _id
      }
    }
  }
}
